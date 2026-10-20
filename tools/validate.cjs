// Read-only validation from the website root: node tools/validate.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'ru.html', 'privacy-en.html'];
let checkedLinks = 0;
let checkedImages = 0;
function dimensions(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.toString('hex', 0, 8) === '89504e470d0a1a0a') {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  assert.equal(bytes.readUInt16BE(0), 0xffd8, `Supported image format: ${file}`);
  for (let offset = 2; offset + 8 < bytes.length;) {
    assert.equal(bytes[offset], 0xff, `JPEG marker: ${file}`);
    const marker = bytes[offset + 1];
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw new Error(`Missing JPEG dimensions: ${file}`);
}
for (const name of pages) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert.match(html, /<!doctype html>/i, name);
  assert.match(html, /<html lang="(?:en|ru)">/, name);
  assert.match(html, /name="viewport"/, name);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${name}: one h1`);
  assert(!html.includes('\uFFFD'), `${name}: valid text`);
  assert(!/<script\b/i.test(html), `${name}: buildless, no scripts or analytics`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${name}: unique ids`);
  for (const [, attr, url] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(url)) continue;
    const [resourceWithQuery, fragment] = url.split('#');
    const resource = resourceWithQuery.split('?')[0];
    const target = resource ? path.resolve(root, resource === './' ? 'index.html' : resource) : path.join(root, name);
    assert(target.startsWith(root + path.sep), `${name}: site-relative path`);
    assert(fs.existsSync(target), `${name}: missing ${url}`);
    const relative = path.relative(root, target);
    let cursor = root;
    for (const part of relative.split(path.sep)) {
      assert(fs.readdirSync(cursor).includes(part), `${name}: case-sensitive path ${url}`);
      cursor = path.join(cursor, part);
    }
    if (fragment) {
      const body = fs.readFileSync(target, 'utf8');
      assert(body.includes(`id="${fragment}"`), `${name}: missing anchor ${url}`);
    }
    if (attr === 'src') checkedImages++;
    checkedLinks++;
  }
  for (const [tag, src, width, height] of html.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*>/g)) {
    assert(/\balt="/.test(tag), `${name}: image alt`);
    const image = dimensions(path.join(root, src));
    const actualRatio = image.width / image.height;
    assert(Math.abs(actualRatio - Number(width) / Number(height)) < 0.001, `${name}: image aspect ratio ${src}`);
  }
  for (const [, set] of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of set.split(',')) {
      const [src, descriptor] = candidate.trim().split(/\s+/);
      const file = path.join(root, src);
      assert.match(descriptor, /^(600|900)w$/, `${name}: responsive image width`);
      const image = dimensions(file);
      assert.equal(image.width, parseInt(descriptor, 10), `${name}: accurate srcset width`);
      assert(fs.statSync(file).size < 450 * 1024, `${name}: responsive image size budget`);
      assert(Math.abs(image.width / image.height - 1206 / 2622) < 0.001, `${name}: no image distortion`);
      checkedImages++;
    }
  }
  if (name !== 'privacy-en.html') {
    assert(html.includes('https://apps.apple.com/app/id6820971713'), `${name}: correct app ID`);
    assert(!html.includes('6761118244'), `${name}: no ScreenBlocker app ID`);
    assert.equal((html.match(/<details>/g) || []).length, 4, `${name}: native FAQ`);
    assert(!html.includes('<figcaption>'), `${name}: screenshots without captions`);
    assert.equal((html.match(/<figure>/g) || []).length, 4, `${name}: four feature screenshots`);
    assert.equal((html.match(/\bsrcset=/g) || []).length, 5, `${name}: responsive hero and screenshots`);
    assert.equal((html.match(/loading="lazy"/g) || []).length, 4, `${name}: deferred screenshots`);
    assert(!/assets\/(?:en|ru)\/[^"]+\.png/.test(html), `${name}: no full-size PNG downloads`);
    const locale = name === 'ru.html' ? 'ru' : 'en';
    for (const size of [600, 900]) {
      const total = ['cover', 'limits', 'schedule', 'tasks', 'location']
        .reduce((sum, file) => sum + fs.statSync(path.join(root, `assets/${locale}/${file}-${size}.jpg`)).size, 0)
        + fs.statSync(path.join(root, 'assets/app-icon-256.png')).size;
      assert(total < 2.2 * 1024 * 1024, `${name}: full-page image budget`);
      console.log(`${locale}, ${size}px image set including icon: ${(total / 1024 / 1024).toFixed(2)} MiB`);
    }
  }
}
assert(fs.existsSync(path.join(root, '.nojekyll')));
const privacy = fs.readFileSync(path.join(root, 'privacy-en.html'), 'utf8');
assert(!/draft|pending.*review|noindex/i.test(privacy), 'Policy has no draft labels or indexing restriction');
assert(!privacy.includes('Removing the app does not by itself'), 'Removed retention wording');
assert.match(privacy, /data access and deletion requests/);
assert(!/Supabase|HealthKit|Camera access|Service providers|Changes and questions/.test(privacy),
  'Privacy policy excludes old provider list, irrelevant features and editorial section');
assert.match(privacy, /AppMetrica/);
assert.match(privacy, /technical identifiers/);
assert.match(privacy, /<h2>8\. Contact<\/h2>/);
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
assert.match(css, /\.section\.faq\s*\{\s*padding-bottom:\s*24px;/);
assert.match(css, /\.section#support\s*\{\s*padding-top:\s*24px;\s*border-top:\s*0;/);
assert.match(css, /\.faq details:last-of-type\s*\{\s*border-bottom:\s*0;/);
console.log(`PASS: ${pages.length} pages, ${checkedLinks} local references, ${checkedImages} image references; paths, anchors, dimensions, responsive images, size budgets, language metadata and FAQ checked.`);
