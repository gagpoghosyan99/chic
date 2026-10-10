import type { L, Lang } from './i18n';

export type FieldType = 'string' | 'text' | 'richtext' | 'media' | 'enum' | 'boolean' | 'url';

export type Field = {
  name: string;
  type: FieldType;
  label: L;
  help?: L;
  required?: boolean;
  /** Non-translatable field: the same value is used for every language. */
  shared?: boolean;
  options?: { value: string; label: L }[];
};

export type PreviewKind = 'blog' | 'course' | 'person' | 'card' | 'history';

export type ContentType = {
  key: string;
  group: 'content' | 'services' | 'settings';
  label: L;
  description: L;
  localized: boolean;
  /** One entry per language (or one in total): opens the editor directly instead of a list. */
  single?: boolean;
  /** Website order direction of `sortOrder`. */
  sortable?: 'asc' | 'desc';
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  preview: PreviewKind;
  sitePath?: (locale: Lang, documentId: string) => string;
  fields: Field[];
};

export type SubmissionType = {
  key: 'registrations' | 'volunteer-applications';
  label: L;
  columns: { name: string; label: L }[];
};

const l = (hy: string, en: string, ru: string): L => ({ hy, en, ru });

const clientTypes = [
  { value: 'Medical Institutions', label: l('Բժշկական հաստատություններ', 'Medical institutions', 'Медицинские учреждения') },
  { value: 'Pharmacies', label: l('Դեղատներ', 'Pharmacies', 'Аптеки') },
  { value: 'Dental Centers', label: l('Ստոմատոլոգիական կենտրոններ', 'Dental centers', 'Стоматологические центры') },
  { value: 'Laboratories', label: l('Լաբորատորիաներ', 'Laboratories', 'Лаборатории') },
];

const serviceFields: Field[] = [
  { name: 'name', type: 'string', label: l('Կազմակերպության անվանում', 'Organization name', 'Название организации'), required: true },
  { name: 'type', type: 'enum', label: l('Տեսակ', 'Type', 'Тип'), options: clientTypes, required: true },
  {
    name: 'blog_url',
    type: 'url',
    label: l('Հղում (ոչ պարտադիր)', 'Link (optional)', 'Ссылка (необязательно)'),
    help: l('Օրինակ՝ բլոգի գրառման կամ կազմակերպության կայքի հղումը', 'For example, a blog post or the organization’s website', 'Например, запись в блоге или сайт организации'),
  },
];

const service = (key: string, label: L, description: L, path: string): ContentType => ({
  key,
  group: 'services',
  label,
  description,
  localized: true,
  titleField: 'name',
  subtitleField: 'type',
  preview: 'card',
  sitePath: (locale) => `/${locale}/${path}`,
  fields: serviceFields,
});

export const CONTENT_TYPES: ContentType[] = [
  {
    key: 'blog',
    group: 'content',
    label: l('Բլոգ', 'Blog', 'Блог'),
    description: l('Նորություններ և հոդվածներ', 'News and articles', 'Новости и статьи'),
    localized: true,
    sortable: 'desc',
    titleField: 'title',
    imageField: 'cover_image',
    preview: 'blog',
    sitePath: (locale, id) => `/${locale}/blog/${id}`,
    fields: [
      { name: 'title', type: 'string', label: l('Վերնագիր', 'Title', 'Заголовок'), required: true },
      { name: 'cover_image', type: 'media', label: l('Գլխավոր նկար', 'Cover image', 'Обложка') },
      { name: 'content', type: 'richtext', label: l('Տեքստ', 'Text', 'Текст') },
    ],
  },
  {
    key: 'courses',
    group: 'content',
    label: l('Դասընթացներ', 'Courses', 'Курсы'),
    description: l('Դասընթացների ցանկը և գրանցումը', 'Course list and registration', 'Список курсов и запись'),
    localized: true,
    sortable: 'asc',
    titleField: 'title',
    subtitleField: 'type',
    imageField: 'cover_image',
    preview: 'course',
    sitePath: (locale, id) => `/${locale}/courses/${id}`,
    fields: [
      { name: 'title', type: 'string', label: l('Անվանում', 'Title', 'Название'), required: true },
      { name: 'description', type: 'text', label: l('Նկարագրություն', 'Description', 'Описание') },
      { name: 'cover_image', type: 'media', label: l('Նկար', 'Image', 'Изображение') },
      {
        name: 'type',
        type: 'enum',
        label: l('Ում համար է', 'Audience', 'Для кого'),
        required: true,
        options: [
          { value: 'Senior Healthcare Workers', label: l('Բարձրագույն կրթությամբ բուժաշխատողներ', 'Senior healthcare workers', 'Медработники высшего звена') },
          { value: 'Mid-level Healthcare Workers', label: l('Միջին բուժանձնակազմ', 'Mid-level healthcare workers', 'Средний медперсонал') },
          { value: 'Electronic Educational Material', label: l('Էլեկտրոնային ուսումնական նյութ', 'E-learning material', 'Электронные учебные материалы') },
        ],
      },
      {
        name: 'is_available',
        type: 'boolean',
        label: l('Գրանցումը բաց է', 'Registration is open', 'Запись открыта'),
        help: l('Միացված լինելու դեպքում կայքում կերևա «Գրանցվել» կոճակը', 'When on, the website shows the “Register” button', 'Если включено, на сайте будет кнопка «Записаться»'),
      },
    ],
  },
  {
    key: 'team',
    group: 'content',
    label: l('Մեր թիմը', 'Our team', 'Наша команда'),
    description: l('Թիմի անդամները', 'Team members', 'Члены команды'),
    localized: true,
    sortable: 'asc',
    titleField: 'full_name',
    subtitleField: 'profession',
    imageField: 'image_url',
    preview: 'person',
    sitePath: (locale) => `/${locale}/team`,
    fields: [
      { name: 'full_name', type: 'string', label: l('Անուն ազգանուն', 'Full name', 'Имя и фамилия'), required: true },
      { name: 'profession', type: 'string', label: l('Պաշտոն', 'Position', 'Должность') },
      { name: 'image_url', type: 'media', label: l('Լուսանկար', 'Photo', 'Фото'), shared: true },
    ],
  },
  {
    key: 'lecturers',
    group: 'content',
    label: l('Դասախոսներ', 'Lecturers', 'Преподаватели'),
    description: l('Դասախոսների ցանկը', 'List of lecturers', 'Список преподавателей'),
    localized: true,
    titleField: 'full_name',
    subtitleField: 'profession',
    preview: 'person',
    sitePath: (locale) => `/${locale}/lecturers`,
    fields: [
      { name: 'full_name', type: 'string', label: l('Անուն ազգանուն', 'Full name', 'Имя и фамилия'), required: true },
      { name: 'profession', type: 'string', label: l('Մասնագիտություն', 'Profession', 'Специальность') },
    ],
  },
  {
    key: 'volunteers',
    group: 'content',
    label: l('Մեր կամավորները', 'Our volunteers', 'Наши волонтёры'),
    description: l('Կամավորները կայքում', 'Volunteers shown on the website', 'Волонтёры на сайте'),
    localized: true,
    titleField: 'full_name',
    imageField: 'image_url',
    preview: 'person',
    sitePath: (locale) => `/${locale}/volunteers`,
    fields: [
      { name: 'full_name', type: 'string', label: l('Անուն ազգանուն', 'Full name', 'Имя и фамилия'), required: true },
      { name: 'image_url', type: 'media', label: l('Լուսանկար', 'Photo', 'Фото') },
    ],
  },
  {
    key: 'partners',
    group: 'content',
    label: l('Գործընկերներ', 'Partners', 'Партнёры'),
    description: l('Գործընկեր կազմակերպություններ', 'Partner organizations', 'Организации-партнёры'),
    localized: true,
    titleField: 'name',
    preview: 'card',
    sitePath: (locale) => `/${locale}`,
    fields: [
      { name: 'name', type: 'string', label: l('Անվանում', 'Name', 'Название'), required: true },
      { name: 'blog_url', type: 'url', label: l('Հղում (ոչ պարտադիր)', 'Link (optional)', 'Ссылка (необязательно)') },
    ],
  },
  {
    key: 'history',
    group: 'content',
    label: l('Մեր մասին', 'About us', 'О нас'),
    description: l('Պատմություն, առաքելություն, հիմնադիր', 'History, mission, founder', 'История, миссия, основатель'),
    localized: true,
    single: true,
    titleField: 'founder_full_name',
    imageField: 'founder_photo',
    preview: 'history',
    sitePath: (locale) => `/${locale}/history`,
    fields: [
      { name: 'about', type: 'text', label: l('Կարճ նկարագրություն', 'Short description', 'Краткое описание') },
      { name: 'history', type: 'richtext', label: l('Պատմություն, առաքելություն, արժեքներ', 'History, mission, values', 'История, миссия, ценности') },
      { name: 'founder_full_name', type: 'string', label: l('Հիմնադրի անունը', 'Founder’s name', 'Имя основателя') },
      { name: 'founder_photo', type: 'media', label: l('Հիմնադրի լուսանկարը', 'Founder’s photo', 'Фото основателя') },
    ],
  },
  service(
    'quality',
    l('Որակի կառավարման համակարգ', 'Quality management', 'Система менеджмента качества'),
    l('Խորհրդատվության հաճախորդներ', 'Consulting clients', 'Клиенты консалтинга'),
    'consulting',
  ),
  service(
    'licensing',
    l('Լիցենզավորում', 'Licensing', 'Лицензирование'),
    l('Լիցենզավորման խորհրդատվության հաճախորդներ', 'Licensing consulting clients', 'Клиенты по лицензированию'),
    'licensing',
  ),
  service(
    'construction',
    l('Շինարարություն և սարքավորումներ', 'Construction & equipment', 'Строительство и оборудование'),
    l('Շինարարության, վերանորոգման և սարքավորումների հաճախորդներ', 'Construction, renovation and equipment clients', 'Клиенты по строительству, ремонту и оборудованию'),
    'construction',
  ),
  {
    key: 'social',
    group: 'settings',
    label: l('Սոցիալական ցանցեր', 'Social media links', 'Соцсети'),
    description: l('Հղումները կայքի ներքևում', 'Links in the website footer', 'Ссылки внизу сайта'),
    localized: false,
    single: true,
    titleField: 'instagram',
    preview: 'card',
    fields: [
      { name: 'instagram', type: 'url', label: l('Instagram', 'Instagram', 'Instagram') },
      { name: 'facebook', type: 'url', label: l('Facebook', 'Facebook', 'Facebook') },
      { name: 'telegram', type: 'url', label: l('Telegram', 'Telegram', 'Telegram') },
      { name: 'linkedin', type: 'url', label: l('LinkedIn', 'LinkedIn', 'LinkedIn') },
    ],
  },
];

export const SUBMISSION_TYPES: SubmissionType[] = [
  {
    key: 'registrations',
    label: l('Գրանցումներ դասընթացներին', 'Course registrations', 'Регистрации на курсы'),
    columns: [
      { name: 'full_name', label: l('Անուն ազգանուն', 'Full name', 'Имя и фамилия') },
      { name: 'course', label: l('Դասընթաց', 'Course', 'Курс') },
      { name: 'email', label: l('Էլ. փոստ', 'Email', 'Email') },
      { name: 'phone', label: l('Հեռախոս', 'Phone', 'Телефон') },
    ],
  },
  {
    key: 'volunteer-applications',
    label: l('Կամավորների հայտեր', 'Volunteer applications', 'Заявки волонтёров'),
    columns: [
      { name: 'name', label: l('Անուն', 'First name', 'Имя') },
      { name: 'surname', label: l('Ազգանուն', 'Last name', 'Фамилия') },
      { name: 'fathername', label: l('Հայրանուն', 'Father’s name', 'Отчество') },
      { name: 'birthdate', label: l('Ծննդյան ամսաթիվ', 'Date of birth', 'Дата рождения') },
      { name: 'university', label: l('Համալսարան', 'University', 'Университет') },
      { name: 'phone', label: l('Հեռախոս', 'Phone', 'Телефон') },
    ],
  },
];

export const getContentType = (key: string) => CONTENT_TYPES.find((c) => c.key === key);
export const getSubmissionType = (key: string) => SUBMISSION_TYPES.find((s) => s.key === key);
