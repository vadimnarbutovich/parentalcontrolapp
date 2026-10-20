// macOS: node tools/optimize-images.mjs /path/to/ParentalControl
// Always encode from the original app assets, never from a compressed JPEG.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.resolve(process.argv[2] || path.join(site, '../..'));
const appStore = path.join(project, 'Docs/Assets/AppStore');
const names = { limits: '02-dashboard', schedule: '03-schedule', tasks: '04-tasks', location: '05-location' };
const sources = ['en', 'ru'].flatMap(locale => [
  { name: `${locale}/cover`, source: path.join(appStore, `noStars/${locale}/cover-1206x2622.png`) },
  ...Object.entries(names).map(([name, file]) => ({
    name: `${locale}/${name}`,
    source: path.join(appStore, locale === 'en' ? '' : 'ru', `screenshots-features/${file}-1206x2622.png`)
  }))
]);
const icon = path.join(project, 'ParentalControl/Assets.xcassets/AppIcon.appiconset/AppIcon.png');
const digest = file => createHash('sha256').update(readFileSync(file)).digest('hex');
// Check all inputs before creating or overwriting any generated web files.
for (const { name, source } of [...sources, { name: 'app-icon', source: icon }]) {
  if (!existsSync(source)) throw new Error(`Missing original: ${source}`);
  const previous = path.join(site, `assets/${name}.png`);
  if (existsSync(previous) && digest(previous) !== digest(source)) {
    throw new Error(`Original web PNG differs from app asset: ${previous}. Review before replacing.`);
  }
}
for (const { name, source } of sources) {
  for (const width of [600, 900]) {
    const output = path.join(site, `assets/${name}-${width}.jpg`);
    mkdirSync(path.dirname(output), { recursive: true });
    execFileSync('/usr/bin/sips', ['--resampleWidth', String(width), '-s', 'format', 'jpeg',
      '-s', 'formatOptions', '85', source, '--out', output], { stdio: 'pipe' });
    console.log(`${name}-${width}.jpg: ${(statSync(output).size / 1024).toFixed(0)} KiB`);
  }
}
const output = path.join(site, 'assets/app-icon-256.png');
execFileSync('/usr/bin/sips', ['--resampleWidth', '256', icon, '--out', output], { stdio: 'pipe' });
console.log(`app-icon-256.png: ${(statSync(output).size / 1024).toFixed(0)} KiB`);
