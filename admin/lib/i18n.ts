export const LANGS = ['hy', 'ru', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export type L = Record<Lang, string>;

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

export const LANG_NAMES: L = { hy: 'Հայերեն', ru: 'Русский', en: 'English' };
export const LANG_SHORT: L = { hy: 'ՀԱՅ', ru: 'РУС', en: 'ENG' };

const dict = {
  'nav.dashboard': { hy: 'Գլխավոր', en: 'Dashboard', ru: 'Главная' },
  'nav.content': { hy: 'Կայքի բովանդակություն', en: 'Website content', ru: 'Содержимое сайта' },
  'nav.services': { hy: 'Ծառայություններ', en: 'Services', ru: 'Услуги' },
  'nav.submissions': { hy: 'Հայտեր', en: 'Submissions', ru: 'Заявки' },
  'nav.media': { hy: 'Նկարներ', en: 'Images', ru: 'Изображения' },
  'nav.settings': { hy: 'Կարգավորումներ', en: 'Settings', ru: 'Настройки' },
  logout: { hy: 'Ելք', en: 'Log out', ru: 'Выйти' },
  uiLanguage: { hy: 'Ինտերֆեյսի լեզուն', en: 'Interface language', ru: 'Язык интерфейса' },
  openSite: { hy: 'Բացել կայքը', en: 'Open website', ru: 'Открыть сайт' },

  'login.title': { hy: 'CHIC կառավարման վահանակ', en: 'CHIC admin panel', ru: 'Панель управления CHIC' },
  'login.password': { hy: 'Գաղտնաբառ', en: 'Password', ru: 'Пароль' },
  'login.submit': { hy: 'Մուտք', en: 'Log in', ru: 'Войти' },
  'login.error': { hy: 'Սխալ գաղտնաբառ', en: 'Wrong password', ru: 'Неверный пароль' },
  'login.tooMany': {
    hy: 'Չափազանց շատ փորձեր։ Փորձեք 15 րոպե անց։',
    en: 'Too many attempts. Try again in 15 minutes.',
    ru: 'Слишком много попыток. Повторите через 15 минут.',
  },

  save: { hy: 'Պահպանել', en: 'Save', ru: 'Сохранить' },
  saveDraft: { hy: 'Պահպանել սևագիր', en: 'Save as draft', ru: 'Сохранить черновик' },
  publish: { hy: 'Պահպանել և հրապարակել', en: 'Save & publish', ru: 'Сохранить и опубликовать' },
  unpublish: { hy: 'Հանել կայքից', en: 'Remove from website', ru: 'Снять с сайта' },
  discard: { hy: 'Չեղարկել փոփոխությունները', en: 'Discard changes', ru: 'Отменить изменения' },
  delete: { hy: 'Ջնջել', en: 'Delete', ru: 'Удалить' },
  cancel: { hy: 'Չեղարկել', en: 'Cancel', ru: 'Отмена' },
  confirm: { hy: 'Հաստատել', en: 'Confirm', ru: 'Подтвердить' },
  preview: { hy: 'Նախադիտում', en: 'Preview', ru: 'Предпросмотр' },
  close: { hy: 'Փակել', en: 'Close', ru: 'Закрыть' },
  search: { hy: 'Որոնել…', en: 'Search…', ru: 'Поиск…' },
  add: { hy: 'Ավելացնել', en: 'Add new', ru: 'Добавить' },
  edit: { hy: 'Խմբագրել', en: 'Edit', ru: 'Изменить' },
  back: { hy: 'Հետ', en: 'Back', ru: 'Назад' },
  loading: { hy: 'Բեռնվում է…', en: 'Loading…', ru: 'Загрузка…' },
  done: { hy: 'Պատրաստ է', en: 'Done', ru: 'Готово' },
  viewOnSite: { hy: 'Դիտել կայքում', en: 'View on website', ru: 'Смотреть на сайте' },
  upload: { hy: 'Վերբեռնել', en: 'Upload', ru: 'Загрузить' },
  choose: { hy: 'Ընտրել', en: 'Choose', ru: 'Выбрать' },
  remove: { hy: 'Հեռացնել', en: 'Remove', ru: 'Убрать' },
  change: { hy: 'Փոխել', en: 'Change', ru: 'Заменить' },
  export: { hy: 'Ներբեռնել Excel', en: 'Download Excel', ru: 'Скачать Excel' },
  items: { hy: 'գրառում', en: 'items', ru: 'записей' },
  errorGeneric: { hy: 'Սխալ տեղի ունեցավ', en: 'Something went wrong', ru: 'Произошла ошибка' },

  'status.draft': { hy: 'Սևագիր', en: 'Draft', ru: 'Черновик' },
  'status.published': { hy: 'Հրապարակված', en: 'Published', ru: 'Опубликовано' },
  'status.modified': { hy: 'Կա չհրապարակված փոփոխություն', en: 'Unpublished changes', ru: 'Есть неопубликованные изменения' },
  'statusHelp.draft': { hy: 'Կայքում չի երևում', en: 'Not visible on the website', ru: 'Не видно на сайте' },
  'statusHelp.published': { hy: 'Երևում է կայքում', en: 'Visible on the website', ru: 'Видно на сайте' },
  'statusHelp.modified': {
    hy: 'Կայքում երևում է նախորդ տարբերակը',
    en: 'The website still shows the previous version',
    ru: 'На сайте пока предыдущая версия',
  },

  'toast.saved': { hy: 'Սևագիրը պահպանված է', en: 'Draft saved', ru: 'Черновик сохранён' },
  'toast.published': { hy: 'Հրապարակված է կայքում', en: 'Published on the website', ru: 'Опубликовано на сайте' },
  'toast.unpublished': { hy: 'Հանված է կայքից', en: 'Removed from the website', ru: 'Снято с сайта' },
  'toast.discarded': { hy: 'Փոփոխությունները չեղարկված են', en: 'Changes discarded', ru: 'Изменения отменены' },
  'toast.deleted': { hy: 'Ջնջված է', en: 'Deleted', ru: 'Удалено' },
  'toast.ordered': { hy: 'Հերթականությունը պահպանված է', en: 'Order saved', ru: 'Порядок сохранён' },
  'toast.linked': { hy: 'Թարգմանությունը կապված է', en: 'Translation linked', ru: 'Перевод привязан' },
  'toast.uploaded': { hy: 'Վերբեռնված է', en: 'Uploaded', ru: 'Загружено' },

  'list.empty': { hy: 'Դեռ ոչինչ չկա', en: 'Nothing here yet', ru: 'Пока ничего нет' },
  'list.dragHint': {
    hy: 'Քաշեք տողերը՝ կայքում հերթականությունը փոխելու համար',
    en: 'Drag rows to change the order on the website',
    ru: 'Перетаскивайте строки, чтобы изменить порядок на сайте',
  },
  'list.applyAllLangs': {
    hy: 'Կիրառել նույն հերթականությունը մյուս լեզուների համար',
    en: 'Apply the same order to the other languages',
    ru: 'Применить тот же порядок к другим языкам',
  },
  'list.translations': { hy: 'Թարգմանություններ', en: 'Translations', ru: 'Переводы' },
  'list.showing': { hy: 'Ցուցադրվում է', en: 'Showing', ru: 'Показано' },
  'list.availableFirst': {
    hy: 'Կայքում հասանելի դասընթացները միշտ ցուցադրվում են առաջինը',
    en: 'On the website, available courses are always shown first',
    ru: 'На сайте доступные курсы всегда показываются первыми',
  },

  'editor.missingLang': { hy: '{lang} տարբերակ դեռ չկա', en: 'No {lang} version yet', ru: 'Версии на языке «{lang}» пока нет' },
  'editor.createTranslation': { hy: 'Ստեղծել թարգմանություն', en: 'Create translation', ru: 'Создать перевод' },
  'editor.copyFrom': { hy: 'Պատճենել {lang} տարբերակից', en: 'Copy from {lang}', ru: 'Скопировать из версии «{lang}»' },
  'editor.linkExisting': { hy: 'Կապել գոյություն ունեցող գրառում', en: 'Link an existing entry', ru: 'Привязать существующую запись' },
  'editor.linkHelp': {
    hy: 'Եթե այս գրառման {lang} տարբերակն արդեն ստեղծված է առանձին, ընտրեք այն՝ դրանք միավորելու համար։',
    en: 'If the {lang} version of this entry was already created separately, pick it to join them together.',
    ru: 'Если версия «{lang}» этой записи уже создана отдельно, выберите её, чтобы объединить их.',
  },
  'editor.linkPlaceholder': { hy: 'Ընտրեք գրառում…', en: 'Choose an entry…', ru: 'Выберите запись…' },
  'editor.link': { hy: 'Կապել', en: 'Link', ru: 'Привязать' },
  'editor.deleteLang': { hy: 'Ջնջել այս լեզվի տարբերակը', en: 'Delete this language version', ru: 'Удалить эту языковую версию' },
  'editor.confirmDeleteLang': {
    hy: 'Ջնջե՞լ {lang} տարբերակը։ Այն կհեռացվի նաև կայքից։',
    en: 'Delete the {lang} version? It will also be removed from the website.',
    ru: 'Удалить версию «{lang}»? Она также исчезнет с сайта.',
  },
  'editor.confirmUnpublish': {
    hy: 'Հանե՞լ կայքից։ Տվյալները կպահպանվեն որպես սևագիր։',
    en: 'Remove from the website? The content is kept as a draft.',
    ru: 'Снять с сайта? Содержимое сохранится как черновик.',
  },
  'editor.confirmDiscard': {
    hy: 'Չեղարկե՞լ բոլոր չհրապարակված փոփոխությունները։',
    en: 'Discard all unpublished changes?',
    ru: 'Отменить все неопубликованные изменения?',
  },
  'editor.unsaved': { hy: 'Կան չպահպանված փոփոխություններ', en: 'You have unsaved changes', ru: 'Есть несохранённые изменения' },
  'editor.leaveConfirm': {
    hy: 'Կան չպահպանված փոփոխություններ։ Դուրս գա՞լ առանց պահպանելու։',
    en: 'You have unsaved changes. Leave without saving?',
    ru: 'Есть несохранённые изменения. Уйти без сохранения?',
  },
  'editor.shared': {
    hy: 'Ընդհանուր է բոլոր լեզուների համար',
    en: 'Shared by all languages',
    ru: 'Общее для всех языков',
  },
  'editor.languages': { hy: 'Ցուցադրվող լեզուներ', en: 'Languages shown', ru: 'Показываемые языки' },
  'editor.newTitle': { hy: 'Նոր գրառում', en: 'New entry', ru: 'Новая запись' },
  'editor.required': { hy: 'Պարտադիր դաշտ', en: 'Required field', ru: 'Обязательное поле' },
  'editor.invalidUrl': {
    hy: 'Հղումը պետք է սկսվի https://-ով',
    en: 'The link must start with https://',
    ru: 'Ссылка должна начинаться с https://',
  },

  'course.open': { hy: 'Գրանցումը բաց է', en: 'Registration open', ru: 'Запись открыта' },
  'course.closed': { hy: 'Գրանցումը փակ է', en: 'Registration closed', ru: 'Запись закрыта' },
  'preview.note': {
    hy: 'Մոտավոր տեսքն է՝ ինչպես կերևա կայքում։ Պահպանված չէ, քանի դեռ չեք սեղմել պահպանման կոճակը։',
    en: 'An approximate view of how this will look on the website. Nothing is saved until you press a save button.',
    ru: 'Примерный вид на сайте. Ничего не сохраняется, пока вы не нажмёте кнопку сохранения.',
  },

  'rich.bold': { hy: 'Թավ', en: 'Bold', ru: 'Жирный' },
  'rich.italic': { hy: 'Շեղ', en: 'Italic', ru: 'Курсив' },
  'rich.underline': { hy: 'Ընդգծված', en: 'Underline', ru: 'Подчёркнутый' },
  'rich.heading': { hy: 'Վերնագիր', en: 'Heading', ru: 'Заголовок' },
  'rich.bullet': { hy: 'Կետավոր ցանկ', en: 'Bulleted list', ru: 'Маркированный список' },
  'rich.ordered': { hy: 'Համարակալված ցանկ', en: 'Numbered list', ru: 'Нумерованный список' },
  'rich.quote': { hy: 'Մեջբերում', en: 'Quote', ru: 'Цитата' },
  'rich.link': { hy: 'Հղում', en: 'Link', ru: 'Ссылка' },
  'rich.image': { hy: 'Նկար', en: 'Image', ru: 'Изображение' },
  'rich.video': { hy: 'YouTube տեսանյութ', en: 'YouTube video', ru: 'Видео YouTube' },
  'rich.undo': { hy: 'Հետարկել', en: 'Undo', ru: 'Отменить' },
  'rich.redo': { hy: 'Կրկնել', en: 'Redo', ru: 'Повторить' },
  'rich.linkPrompt': { hy: 'Մուտքագրեք հղումը (https://…)', en: 'Enter the link (https://…)', ru: 'Введите ссылку (https://…)' },
  'rich.videoPrompt': {
    hy: 'Տեղադրեք YouTube տեսանյութի հղումը',
    en: 'Paste the YouTube video link',
    ru: 'Вставьте ссылку на видео YouTube',
  },
  'rich.videoInvalid': { hy: 'Սա YouTube հղում չէ', en: 'That is not a YouTube link', ru: 'Это не ссылка YouTube' },
  'rich.embeddedVideo': { hy: 'Ներդրված տեսանյութ', en: 'Embedded video', ru: 'Встроенное видео' },

  'media.title': { hy: 'Նկարների գրադարան', en: 'Image library', ru: 'Библиотека изображений' },
  'media.drop': {
    hy: 'Քաշեք նկարները այստեղ կամ սեղմեք՝ ընտրելու համար',
    en: 'Drag images here or click to choose',
    ru: 'Перетащите изображения сюда или нажмите, чтобы выбрать',
  },
  'media.uploading': { hy: 'Վերբեռնվում է…', en: 'Uploading…', ru: 'Загрузка…' },
  'media.confirmDelete': {
    hy: 'Ջնջե՞լ այս նկարը։ Այն կանհետանա նաև կայքի բոլոր էջերից, որտեղ օգտագործվում է։',
    en: 'Delete this image? It will also disappear from every page that uses it.',
    ru: 'Удалить изображение? Оно исчезнет со всех страниц, где используется.',
  },
  'media.none': { hy: 'Նկար ընտրված չէ', en: 'No image selected', ru: 'Изображение не выбрано' },
  'media.pick': { hy: 'Ընտրել նկար', en: 'Choose image', ru: 'Выбрать изображение' },
  'media.onlyImages': { hy: 'Թույլատրվում են միայն նկարներ (JPG, PNG, WebP)', en: 'Only images are allowed (JPG, PNG, WebP)', ru: 'Разрешены только изображения (JPG, PNG, WebP)' },
  'media.tooBig': { hy: 'Ֆայլը 10 ՄԲ-ից մեծ է', en: 'The file is larger than 10 MB', ru: 'Файл больше 10 МБ' },
  'media.more': { hy: 'Ցույց տալ ավելին', en: 'Show more', ru: 'Показать ещё' },

  'subs.registrations': { hy: 'Գրանցումներ դասընթացներին', en: 'Course registrations', ru: 'Регистрации на курсы' },
  'subs.applications': { hy: 'Կամավորների հայտեր', en: 'Volunteer applications', ru: 'Заявки волонтёров' },
  'subs.empty': { hy: 'Հայտեր դեռ չկան', en: 'No submissions yet', ru: 'Заявок пока нет' },
  'subs.confirmDelete': {
    hy: 'Ջնջե՞լ այս հայտը։ Այն հնարավոր չի լինի վերականգնել։',
    en: 'Delete this submission? This cannot be undone.',
    ru: 'Удалить эту заявку? Это нельзя отменить.',
  },
  'subs.date': { hy: 'Ամսաթիվ', en: 'Date', ru: 'Дата' },
  'subs.privacy': {
    hy: 'Այս տվյալները անձնական են։ Մի՛ տարածեք դրանք և ջնջեք, երբ այլևս պետք չեն։',
    en: 'This is personal data. Do not share it, and delete it when it is no longer needed.',
    ru: 'Это персональные данные. Не передавайте их и удаляйте, когда они больше не нужны.',
  },

  'dash.welcome': { hy: 'Բարի գալուստ', en: 'Welcome', ru: 'Добро пожаловать' },
  'dash.help': {
    hy: 'Ընտրեք բաժին՝ կայքի բովանդակությունը խմբագրելու համար։ Փոփոխությունները կայքում կերևան «Պահպանել և հրապարակել» սեղմելուց հետո։',
    en: 'Pick a section to edit the website. Changes appear on the website after you press “Save & publish”.',
    ru: 'Выберите раздел для редактирования сайта. Изменения появятся на сайте после нажатия «Сохранить и опубликовать».',
  },
  'dash.recent': { hy: 'Վերջին հայտերը', en: 'Latest submissions', ru: 'Последние заявки' },
  'dash.quick': { hy: 'Արագ գործողություններ', en: 'Quick actions', ru: 'Быстрые действия' },
  'dash.needsAttention': { hy: 'Ուշադրության կարիք ունի', en: 'Needs attention', ru: 'Требует внимания' },
  'dash.unpublishedCount': {
    hy: '{n} գրառում ունի չհրապարակված փոփոխություններ կամ սևագիր է',
    en: '{n} entries are drafts or have unpublished changes',
    ru: '{n} записей — черновики или с неопубликованными изменениями',
  },
  'dash.allGood': { hy: 'Ամեն ինչ հրապարակված է', en: 'Everything is published', ru: 'Всё опубликовано' },
} satisfies Record<string, L>;

export type DictKey = keyof typeof dict;

export function translate(lang: Lang, key: DictKey, vars?: Record<string, string | number>) {
  let text: string = dict[key][lang] ?? dict[key].en;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  return text;
}
