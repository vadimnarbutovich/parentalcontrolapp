ParentalControl — информационный сайт для GitHub Pages
====================================================

Файлы:
  index.html       Английская версия (основная)
  ru.html          Русская версия
  styles.css       Общие стили, адаптивная вёрстка
  assets/          Иконка и существующие скриншоты приложения EN/RU
  privacy-en.html  Политика конфиденциальности
  .nojekyll        Публикация статических файлов без обработки Jekyll

Не требуются npm, сборщик, API-ключи или доступ к базе данных.
Страницы работают без JavaScript, включая FAQ и переключение языка.
Открыть локально можно двойным нажатием на index.html.

ВАЖНО ДО ПУБЛИКАЦИИ
------------------
1. Поддерживать privacy-en.html в соответствии с фактической работой приложения:
   - конфигурация AppMetrica и её работа на устройствах детей;
   - конкретные сроки хранения записей, логов, аналитики и резервных копий;
   - способ проверки запросов на удаление и права пользователей;
   - требования к согласию родителей и международной обработке данных.
   При изменениях обработки данных обновлять текст и дату политики.
   Проверки файлов сайта не являются юридической проверкой политики.
   Текст сокращён: название backend-провайдера и подробности API убраны.
   При этом сохранены фактическая обработка местоположения, технических
   идентификаторов, событий использования и подписок. Полная анонимность
   и отсутствие персональных данных не заявляются.

2. Проверить App Store ID 6820971713. Он взят из
   ParentalControl/Views/SettingsView.swift, а не из старого шаблона.
   До публичного релиза страница приложения может быть недоступна.

3. Проверить контакты: vadim.narb@yandex.com и Vadim Narbutovich.

4. Посмотреть EN/RU страницы на узком и широком экране.
   Встроенный браузер при подготовке был недоступен: визуальная проверка
   в браузере не выполнена. Выполнены проверки локальных ссылок и ресурсов.

Источники изображений
---------------------
Иконка: ParentalControl/Assets.xcassets/AppIcon.appiconset/AppIcon.png
Обложки: Docs/Assets/AppStore/noStars/{en,ru}/cover-1206x2622.png
Экраны: Docs/Assets/AppStore/screenshots-features/ и соответствующая ru/папка.
Оригиналы в приложении и Docs не изменяются. Для сайта созданы JPEG
шириной 600/900 px с качеством 85 и PNG-иконка 256 px. srcset/sizes
позволяют браузеру выбрать размер под экран и плотность пикселей.
Обложка загружается с высоким приоритетом, скриншоты — лениво.
Тяжёлые PNG-копии удалены только из текущей версии сайта; они остаются
в истории Git и в исходных материалах приложения. Архивные Website/docs
и Website/screenblockerapp не изменялись.

Пересоздать изображения на macOS (из папки сайта):
  node tools/optimize-images.mjs /путь/к/проекту/ParentalControl
Скрипт использует встроенный sips, без дополнительных зависимостей.
Повторное сжатие всегда выполняется из оригинальных PNG, а не из JPEG.

Проверка из корня проекта ParentalControl:
  node Tests/MarketingSite/validate.cjs

ПУБЛИКАЦИЯ
---------------------------------
Новый GitHub-репозиторий при проверке не содержал веток.
Загружаем ТОЛЬКО содержимое этой папки, не исходники iOS-приложения,
не папки supabase, не конфигурацию и не приватные ключи.

Папка Website/parentalcontrolapp связана с отдельным Git-репозиторием.
Для следующих обновлений из корня проекта ParentalControl выполните:

  git -C Website/parentalcontrolapp status
  git -C Website/parentalcontrolapp pull --ff-only
  git -C Website/parentalcontrolapp add .
  git -C Website/parentalcontrolapp commit -m "Update website"
  git -C Website/parentalcontrolapp push

Перед add проверяйте status: в репозиторий должны попадать только
публичные материалы сайта. Не используйте force push.

Если нужна отдельная копия на другом компьютере:

  git clone https://github.com/vadimnarbutovich/parentalcontrolapp.git ../parentalcontrolapp-site

Команда clone предполагает, что соседней папки parentalcontrolapp-site
ещё нет. Если она уже существует, не удаляйте её: сначала проверьте
содержимое и remote. Не копируйте вложенный каталог .git между репозиториями.

В GitHub:
  Репозиторий parentalcontrolapp → Settings → Pages.
  Build and deployment → Source → Deploy from a branch.
  Branch → main.
  Folder → / (root).
  Save.

Если main не видна, сначала загрузите файлы командой push.
Для GitHub Free репозиторий должен быть публичным.
После завершения задания Pages в Actions сайт будет доступен:
  https://vadimnarbutovich.github.io/parentalcontrolapp/
  https://vadimnarbutovich.github.io/parentalcontrolapp/ru.html

Для App Store Connect после публикации:
  Marketing URL:
    https://vadimnarbutovich.github.io/parentalcontrolapp/
  Support URL:
    https://vadimnarbutovich.github.io/parentalcontrolapp/#support
  Privacy Policy URL:
    https://vadimnarbutovich.github.io/parentalcontrolapp/privacy-en.html

На GitHub не должен появиться дополнительный вложенный уровень
Website/parentalcontrolapp: index.html должен лежать в корне main.
Для GitHub Pages важен регистр имён файлов: все ссылки здесь совпадают
с именами assets/, в отличие от .PNG/.png в старом шаблоне.

Официальная инструкция:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Загрузка файлов в main сама по себе не включает GitHub Pages.
Настройки Pages включаются отдельно после проверки политики.
