export type StrapiLocale = 'hy' | 'ru' | 'en';

const requiredEnv = () => {
	const url = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'https://strapi.chic.ngo';
	// Normalize and return; falls back to public host so UI doesn't stay empty
	return url.replace(/\/+$/, '');
};

export function getStrapiBaseUrl(): string {
	return requiredEnv();
}

// Strapi returns only 25 items per request by default; 100 is the server's maxLimit.
const LIST = { 'pagination[pageSize]': 100 };

export function buildStrapiUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
	const baseUrl = requiredEnv();
	const url = new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value === undefined) continue;
			url.searchParams.set(key, String(value));
		}
	}
	return url.toString();
}

export function toAbsoluteStrapiUrl(pathOrUrl?: string): string | undefined {
	if (!pathOrUrl) return undefined;
	if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
	const base = requiredEnv();
	return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export interface OurTeamItem {
	id: number;
	full_name: string;
	profession: string;
	sortOrder?: string | number | null;
	image_url?: {
		url: string;
		formats?: {
			thumbnail?: { url: string };
			small?: { url: string };
			medium?: { url: string };
			large?: { url: string };
		};
	};
}

type FlatTeam = {
	id: number;
	full_name: string;
	profession: string;
	sortOrder?: string | number | null;
	image_url?: OurTeamItem['image_url'];
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlat {
	data: FlatTeam[];
	meta?: unknown;
}

interface StrapiResponseWithAttributes<T> {
	data: Array<{
		id: number;
		attributes: T;
	}>;
	meta?: unknown;
}

export async function fetchOurTeam(locale: StrapiLocale): Promise<OurTeamItem[]> {
	const url = buildStrapiUrl('/api/our-teams', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Our Team: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		full_name: string;
		profession: string;
		sortOrder?: string | number | null;
		image_url?: OurTeamItem['image_url'];
	}>
		| StrapiResponseFlat;

	// Support both shapes: attributes-based or flat fields (as in provided example)
	const items: OurTeamItem[] = (json.data || []).map((item: any) => {
		if (item && item.attributes) {
			const { full_name, profession, image_url, sortOrder } = item.attributes;
			return {
				id: item.id,
				full_name,
				profession,
				image_url,
				sortOrder,
			};
		}
		const { full_name, profession, image_url, sortOrder } = item as FlatTeam;
		return {
			id: (item as FlatTeam).id,
			full_name,
			profession,
			image_url,
			sortOrder,
		};
	});

	// Sort by sortOrder (convert to number for proper numeric sorting)
	items.sort((a, b) => {
		const aOrder = a.sortOrder != null ? Number(a.sortOrder) : Infinity;
		const bOrder = b.sortOrder != null ? Number(b.sortOrder) : Infinity;
		return aOrder - bOrder;
	});

	return items;
}

export interface OurVolunteerItem {
	id: number;
	full_name: string;
	image_url?: {
		url: string;
		formats?: {
			thumbnail?: { url: string };
			small?: { url: string };
			medium?: { url: string };
			large?: { url: string };
		};
	};
}

type FlatVolunteer = {
	id: number;
	full_name: string;
	image_url?: OurVolunteerItem['image_url'];
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlatVolunteer {
	data: FlatVolunteer[];
	meta?: unknown;
}

export async function fetchOurVolunteers(locale: StrapiLocale): Promise<OurVolunteerItem[]> {
	const url = buildStrapiUrl('/api/our-volunteerss', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Our Volunteers: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		full_name: string;
		image_url?: OurVolunteerItem['image_url'];
	}>
		| StrapiResponseFlatVolunteer;

	// Support both shapes: attributes-based or flat fields
	const items: OurVolunteerItem[] = (json.data || []).map((item: any) => {
		if (item && item.attributes) {
			const { full_name, image_url } = item.attributes;
			return {
				id: item.id,
				full_name,
				image_url,
			};
		}
		const { full_name, image_url } = item as FlatVolunteer;
		return {
			id: (item as FlatVolunteer).id,
			full_name,
			image_url,
		};
	});

	return items;
}

/**
 * Our Partners data interface
 */
export interface OurPartnerItem {
	id: number;
	documentId: string;
	name: string;
	blog_url?: string | null;
	photo_url?: {
		url: string;
		formats?: {
			thumbnail?: { url: string };
			small?: { url: string };
			medium?: { url: string };
			large?: { url: string };
		};
	};
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
}

type FlatPartner = {
	id: number;
	documentId: string;
	name: string;
	blog_url?: string | null;
	photo_url?: OurPartnerItem['photo_url'];
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlatPartner {
	data: FlatPartner[];
	meta?: unknown;
}

export async function fetchOurPartners(locale: StrapiLocale): Promise<OurPartnerItem[]> {
	const url = buildStrapiUrl('/api/our-partnerss', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Our Partners: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		name: string;
		blog_url?: string | null;
		photo_url?: OurPartnerItem['photo_url'];
	}>
		| StrapiResponseFlatPartner;

	// Support both shapes: attributes-based or flat fields
	const items: OurPartnerItem[] = (json.data || []).map((item: any) => {
		if (item && item.attributes) {
			const { name, blog_url, photo_url } = item.attributes;
			return {
				id: item.id,
				documentId: item.documentId || item.id.toString(),
				name,
				blog_url,
				photo_url,
			};
		}
		const { name, blog_url, photo_url, documentId } = item as FlatPartner;
		return {
			id: (item as FlatPartner).id,
			documentId: documentId || (item as FlatPartner).id.toString(),
			name,
			blog_url,
			photo_url,
			createdAt: (item as FlatPartner).createdAt,
			updatedAt: (item as FlatPartner).updatedAt,
			publishedAt: (item as FlatPartner).publishedAt,
			locale: (item as FlatPartner).locale || locale,
		};
	});

	return items;
}

export interface OurLecturerItem {
	id: number;
	full_name: string;
	profession: string;
}

type FlatLecturer = {
	id: number;
	full_name: string;
	profession: string;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlatLecturer {
	data: FlatLecturer[];
	meta?: unknown;
}

export async function fetchOurLecturers(locale: StrapiLocale): Promise<OurLecturerItem[]> {
	const url = buildStrapiUrl('/api/our-lecturerss', { locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Our Lecturers: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		full_name: string;
		profession: string;
	}>
		| StrapiResponseFlatLecturer;

	// Support both shapes: attributes-based or flat fields (as in provided example)
	const items: OurLecturerItem[] = (json.data || []).map((item: any) => {
		if (item && item.attributes) {
			const { full_name, profession } = item.attributes;
			return {
				id: item.id,
				full_name,
				profession,
			};
		}
		const { full_name, profession } = item as FlatLecturer;
		return {
			id: (item as FlatLecturer).id,
			full_name,
			profession,
		};
	});

	return items;
}

// Rich text content types (Slate.js-like format)
type ImageFormat = {
	thumbnail?: { url: string };
	small?: { url: string };
	medium?: { url: string };
	large?: { url: string };
};

type ImageData = {
	url: string;
	formats?: ImageFormat;
	width?: number;
	height?: number;
	alternativeText?: string | null;
};

export type RichTextNode = 
	| { type: 'heading'; level: number; children: RichTextNode[] }
	| { type: 'paragraph'; children: RichTextNode[] }
	| { type: 'list'; format: 'ordered' | 'unordered'; children: RichTextNode[] }
	| { type: 'list-item'; children: RichTextNode[] }
	| { type: 'link'; url: string; target?: string; rel?: string; children: RichTextNode[] }
	| { type: 'image'; image: ImageData; children: RichTextNode[] }
	| { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean };

export interface BlogPost {
	id: number;
	documentId: string;
	title: string; // Note: typo in Strapi field name
	content: RichTextNode[];
	sortOrder?: string | number | null;
	cover_image?: {
		url: string;
		formats?: {
			thumbnail?: { url: string };
			small?: { url: string };
			medium?: { url: string };
			large?: { url: string };
		};
	};
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
}

type FlatBlog = {
	id: number;
	documentId: string;
	title: string;
	content: RichTextNode[];
	sortOrder?: string | number | null;
	cover_image?: BlogPost['cover_image'];
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlatBlog {
	data: FlatBlog[];
	meta?: unknown;
}

function normalizeBlogPost(item: any, locale: StrapiLocale): BlogPost {
	if (item && item.attributes) {
		const { title, content, cover_image, sortOrder } = item.attributes;
		return {
			id: item.id,
			documentId: item.documentId || item.id.toString(),
			title,
			content,
			cover_image,
			sortOrder,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			publishedAt: item.publishedAt,
			locale: item.locale || locale,
		};
	}
	const { title, content, cover_image, sortOrder, documentId } = item as FlatBlog;
	return {
		id: (item as FlatBlog).id,
		documentId: documentId || (item as FlatBlog).id.toString(),
		title,
		content,
		cover_image,
		sortOrder,
		createdAt: (item as FlatBlog).createdAt,
		updatedAt: (item as FlatBlog).updatedAt,
		publishedAt: (item as FlatBlog).publishedAt,
		locale: (item as FlatBlog).locale || locale,
	};
}

export async function fetchBlogs(locale: StrapiLocale): Promise<BlogPost[]> {
	const url = buildStrapiUrl('/api/blogs', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Blogs: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		title: string;
		content: RichTextNode[];
		sortOrder?: string | number | null;
		cover_image?: BlogPost['cover_image'];
	}>
		| StrapiResponseFlatBlog;

	// Support both shapes: attributes-based or flat fields
	const items: BlogPost[] = (json.data || []).map((item: any) => normalizeBlogPost(item, locale));

	// Sort by sortOrder (convert to number for proper numeric sorting, descending order)
	items.sort((a, b) => {
		const aOrder = a.sortOrder != null ? Number(a.sortOrder) : Infinity;
		const bOrder = b.sortOrder != null ? Number(b.sortOrder) : Infinity;
		return bOrder - aOrder;
	});

	return items;
}

export async function fetchBlogById(id: number | string, locale: StrapiLocale): Promise<BlogPost | null> {
	const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
	if (isNaN(numericId)) {
		return null;
	}

	const baseParams: Record<string, string | number | boolean | undefined> = { populate: '*', locale, ...LIST };
	const url = buildStrapiUrl('/api/blogs', baseParams);
	
	// Fetch all blogs and filter client-side (Strapi v5 filter syntax can be tricky)
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Blog: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		title: string;
		content: RichTextNode[];
		sortOrder?: string | number | null;
		cover_image?: BlogPost['cover_image'];
	}>
		| StrapiResponseFlatBlog;

	if (!json.data || json.data.length === 0) {
		return null;
	}

	// Find the post with matching id
	const found = json.data.find((item: any) => {
		const itemId = item.id;
		return itemId === numericId;
	});

	if (!found) {
		return null;
	}

	return normalizeBlogPost(found, locale);
}

// Keep for backward compatibility, but use fetchBlogById instead
export async function fetchBlogByDocumentId(documentId: string, locale: StrapiLocale): Promise<BlogPost | null> {
	const baseParams: Record<string, string | number | boolean | undefined> = { populate: '*', locale, ...LIST };
	const url = buildStrapiUrl('/api/blogs', baseParams);
	
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Blog: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		title: string;
		content: RichTextNode[];
		sortOrder?: string | number | null;
		cover_image?: BlogPost['cover_image'];
	}>
		| StrapiResponseFlatBlog;

	if (!json.data || json.data.length === 0) {
		return null;
	}

	const found = json.data.find((item: any) => {
		const itemDocId = item.documentId || item.id?.toString();
		return itemDocId === documentId;
	});

	if (!found) {
		return null;
	}

	return normalizeBlogPost(found, locale);
}

/**
 * Converts rich text JSON content to HTML string
 */
export function richTextToHtml(nodes: RichTextNode[]): string {
	if (!nodes || nodes.length === 0) return '';

	return nodes.map(node => {
		switch (node.type) {
			case 'heading': {
				const level = node.level || 1;
				const tag = `h${Math.min(Math.max(level, 1), 6)}`;
				const content = richTextToHtml(node.children);
				return `<${tag}>${content}</${tag}>`;
			}
			case 'paragraph': {
				const content = richTextToHtml(node.children);
				// Check if paragraph contains an iframe
				if (content.includes('<iframe')) {
					// If it contains iframe, don't wrap in <p> tag, return as-is
					return content;
				}
				return content ? `<p>${content}</p>` : '<p><br></p>';
			}
			case 'list': {
				const tag = node.format === 'ordered' ? 'ol' : 'ul';
				const content = richTextToHtml(node.children);
				return `<${tag}>${content}</${tag}>`;
			}
			case 'list-item': {
				const content = richTextToHtml(node.children);
				return `<li>${content}</li>`;
			}
			case 'link': {
				const content = richTextToHtml(node.children);
				const target = node.target ? ` target="${node.target}"` : '';
				const rel = node.rel ? ` rel="${node.rel}"` : '';
				return `<a href="${node.url}"${target}${rel}>${content}</a>`;
			}
			case 'image': {
				const image = node.image;
				const imageUrl =
					image.formats?.large?.url ||
					image.formats?.medium?.url ||
					image.formats?.small?.url ||
					image.url;
				const absoluteUrl = toAbsoluteStrapiUrl(imageUrl);
				const alt = image.alternativeText || '';
				const width = image.width ? ` width="${image.width}"` : '';
				const height = image.height ? ` height="${image.height}"` : '';
				if (!absoluteUrl) return '';
				return `<img src="${absoluteUrl}" alt="${escapeHtml(alt)}"${width}${height} class="blog-image" />`;
			}
			case 'text': {
				// Check if text contains iframe HTML
				if (node.text.includes('<iframe') && node.text.includes('</iframe>')) {
					// Extract and return iframe HTML directly (don't escape)
					// Make iframe responsive
					const iframeMatch = node.text.match(/<iframe[^>]*>.*?<\/iframe>/i);
					if (iframeMatch) {
						let iframeHtml = iframeMatch[0];
						// Add responsive wrapper class if not present
						if (!iframeHtml.includes('class=')) {
							iframeHtml = iframeHtml.replace(/<iframe/, '<iframe class="blog-iframe"');
						} else {
							iframeHtml = iframeHtml.replace(/class="([^"]*)"/, 'class="$1 blog-iframe"');
						}
						// Make width and height responsive
						iframeHtml = iframeHtml.replace(/width="[^"]*"/, '');
						iframeHtml = iframeHtml.replace(/height="[^"]*"/, '');
						return `<div class="blog-iframe-wrapper">${iframeHtml}</div>`;
					}
					return node.text; // Fallback: return as-is if regex doesn't match
				}
				let text = escapeHtml(node.text);
				if (node.bold) text = `<strong>${text}</strong>`;
				if (node.italic) text = `<em>${text}</em>`;
				if (node.underline) text = `<u>${text}</u>`;
				if (node.strikethrough) text = `<s>${text}</s>`;
				if (node.code) text = `<code>${text}</code>`;
				return text;
			}
			default:
				return '';
		}
	}).join('');
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Extracts plain text from rich text content (for previews)
 */
export function richTextToPlainText(nodes: RichTextNode[], maxLength: number = 150): string {
	if (!nodes || nodes.length === 0) return '';

	const extractText = (node: RichTextNode): string => {
		if (node.type === 'text') {
			return node.text;
		}
		if ('children' in node) {
			return node.children.map(extractText).join('');
		}
		return '';
	};

	const text = nodes.map(extractText).join(' ').trim();
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength).trim() + '...';
}

/**
 * Volunteer form data interface
 */
export interface VolunteerData {
	name: string;
	surname: string;
	fathername: string;
	birthdate: string;
	university: string;
	phone: string;
}

/**
 * Submit volunteer data to Strapi
 */
export async function submitVolunteer(data: VolunteerData): Promise<{ success: boolean; error?: string }> {
	try {
		const url = buildStrapiUrl('/api/volunteerss');
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				data: {
					name: data.name,
					surname: data.surname,
					fathername: data.fathername,
					birthdate: data.birthdate,
					university: data.university,
					phone: data.phone,
				},
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return {
				success: false,
				error: `Failed to submit: ${response.status} ${errorText}`,
			};
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

/**
 * Course data interface
 */
export interface Course {
	id: number;
	documentId: string;
	type: 'Senior Healthcare Workers' | 'Mid-level Healthcare Workers' | 'Electronic Educational Material';
	title: string;
	description: string;
	is_available: boolean;
	sortOrder?: string | number | null;
	cover_image?: {
		url: string;
		width?: number;
		height?: number;
		formats?: {
			thumbnail?: { url: string };
			small?: { url: string };
			medium?: { url: string };
			large?: { url: string };
		};
	};
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
}

type FlatCourse = {
	id: number;
	documentId: string;
	type: string;
	title: string;
	description: string;
	is_available: boolean;
	sortOrder?: string | number | null;
	cover_image?: Course['cover_image'];
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlatCourse {
	data: FlatCourse[];
	meta?: unknown;
}

function normalizeCourse(item: any, locale: StrapiLocale): Course {
	if (item && item.attributes) {
		const { type, title, description, is_available, cover_image, sortOrder } = item.attributes;
		return {
			id: item.id,
			documentId: item.documentId || item.id.toString(),
			type: type as Course['type'],
			title,
			description,
			is_available,
			sortOrder,
			cover_image,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			publishedAt: item.publishedAt,
			locale: item.locale || locale,
		};
	}
	const { type, title, description, is_available, cover_image, documentId, sortOrder } = item as FlatCourse;
	return {
		id: (item as FlatCourse).id,
		documentId: documentId || (item as FlatCourse).id.toString(),
		type: type as Course['type'],
		title,
		description,
		is_available,
		sortOrder,
		cover_image,
		createdAt: (item as FlatCourse).createdAt,
		updatedAt: (item as FlatCourse).updatedAt,
		publishedAt: (item as FlatCourse).publishedAt,
		locale: (item as FlatCourse).locale || locale,
	};
}

export async function fetchCourses(locale: StrapiLocale): Promise<Course[]> {
	const url = buildStrapiUrl('/api/coursess', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Courses: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		type: string;
		title: string;
		description: string;
		is_available: boolean;
		cover_image?: Course['cover_image'];
	}>
		| StrapiResponseFlatCourse;

	if (!json.data || json.data.length === 0) {
		return [];
	}

	const items: Course[] = (json.data || []).map((item: any) => normalizeCourse(item, locale));

	// Available courses first, then by the order set in the admin panel (unordered ones last).
	const order = (c: Course) => (c.sortOrder != null && c.sortOrder !== '' ? Number(c.sortOrder) : Infinity);
	items.sort((a, b) => {
		if (a.is_available !== b.is_available) return a.is_available ? -1 : 1;
		const diff = order(a) - order(b);
		return Number.isNaN(diff) ? 0 : diff;
	});

	return items;
}

type StrapiResponseSingleFlatCourse = {
	data: FlatCourse | null;
	meta?: unknown;
};

export async function fetchCourseByDocumentId(
	documentId: string,
	locale: StrapiLocale
): Promise<Course | null> {
	const url = buildStrapiUrl(`/api/coursess/${encodeURIComponent(documentId)}`, {
		populate: '*',
		locale,
	});
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		if (res.status === 404) {
			return null;
		}
		throw new Error(`Failed to fetch Course: ${res.status}`);
	}

	const json = (await res.json()) as StrapiResponseSingleFlatCourse;
	if (!json.data) {
		return null;
	}

	return normalizeCourse(json.data, locale);
}

/**
 * Course registration data interface
 */
export interface CourseRegistrationData {
	course: string; // course name/title
	full_name: string;
	email?: string; // optional
	phone: string;
}

/**
 * Submit course registration to Strapi
 */
export async function submitCourseRegistration(data: CourseRegistrationData): Promise<{ success: boolean; error?: string }> {
	try {
		const url = buildStrapiUrl('/api/registered-for-the-coursess');
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				data: {
					course: String(data.course),
					full_name: String(data.full_name),
					email: data.email ? String(data.email) : undefined,
					phone: String(data.phone),
				},
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return {
				success: false,
				error: `Failed to submit: ${response.status} ${errorText}`,
			};
		}

		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

/**
 * History data interface
 */
export interface History {
	id: number;
	documentId: string;
	about?: string;
	history?: RichTextNode[]; // Rich text content containing mission, vision, values
	founder_full_name?: string;
	founder_photo?: {
		id: number;
		documentId: string;
		url: string;
		formats?: {
			thumbnail?: { url: string };
			small?: { url: string };
			medium?: { url: string };
			large?: { url: string };
		};
		width?: number;
		height?: number;
		alternativeText?: string | null;
	};
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
}

type FlatHistory = {
	id: number;
	documentId: string;
	about?: string;
	history?: RichTextNode[];
	founder_full_name?: string;
	founder_photo?: History['founder_photo'];
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlatHistory {
	data: FlatHistory[];
	meta?: unknown;
}

function normalizeHistory(item: any, locale: StrapiLocale): History {
	if (item && item.attributes) {
		const { about, history, founder_full_name, founder_photo } = item.attributes;
		return {
			id: item.id,
			documentId: item.documentId || item.id.toString(),
			about,
			history,
			founder_full_name,
			founder_photo: founder_photo ? {
				id: founder_photo.id,
				documentId: founder_photo.documentId || founder_photo.id.toString(),
				url: founder_photo.url,
				formats: founder_photo.formats,
				width: founder_photo.width,
				height: founder_photo.height,
				alternativeText: founder_photo.alternativeText,
			} : undefined,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			publishedAt: item.publishedAt,
			locale: item.locale || locale,
		};
	}
	const { about, history, founder_full_name, founder_photo, documentId } = item as FlatHistory;
	return {
		id: (item as FlatHistory).id,
		documentId: documentId || (item as FlatHistory).id.toString(),
		about,
		history,
		founder_full_name,
		founder_photo: founder_photo ? {
			id: founder_photo.id,
			documentId: founder_photo.documentId || founder_photo.id.toString(),
			url: founder_photo.url,
			formats: founder_photo.formats,
			width: founder_photo.width,
			height: founder_photo.height,
			alternativeText: founder_photo.alternativeText,
		} : undefined,
		createdAt: (item as FlatHistory).createdAt,
		updatedAt: (item as FlatHistory).updatedAt,
		publishedAt: (item as FlatHistory).publishedAt,
		locale: (item as FlatHistory).locale || locale,
	};
}

export async function fetchHistories(locale: StrapiLocale): Promise<History[]> {
	const url = buildStrapiUrl('/api/histories', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Histories: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		about?: string;
		history?: RichTextNode[];
		founder_full_name?: string;
		founder_photo?: History['founder_photo'];
	}>
		| StrapiResponseFlatHistory;

	if (!json.data || json.data.length === 0) {
		return [];
	}

	const items: History[] = (json.data || []).map((item: any) => normalizeHistory(item, locale));

	return items;
}

export async function fetchHistory(locale: StrapiLocale): Promise<History | null> {
	const histories = await fetchHistories(locale);
	if (histories.length === 0) {
		return null;
	}
	// Return the first history entry
	console.log(histories[0]);
	return histories[0];
}

/**
 * Social media data interface
 */
export interface SocialMedia {
	id: number;
	documentId: string;
	instagram?: string | null;
	facebook?: string | null;
	telegram?: string | null;
	linkedin?: string | null;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
}

type FlatSocialMedia = {
	id: number;
	documentId: string;
	instagram?: string | null;
	facebook?: string | null;
	telegram?: string | null;
	linkedin?: string | null;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
};

interface StrapiResponseFlatSocialMedia {
	data: FlatSocialMedia[];
	meta?: unknown;
}

function normalizeSocialMedia(item: any): SocialMedia {
	if (item && item.attributes) {
		const { instagram, facebook, telegram, linkedin } = item.attributes;
		return {
			id: item.id,
			documentId: item.documentId || item.id.toString(),
			instagram,
			facebook,
			telegram,
			linkedin,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			publishedAt: item.publishedAt,
		};
	}
	const { instagram, facebook, telegram, linkedin, documentId } = item as FlatSocialMedia;
	return {
		id: (item as FlatSocialMedia).id,
		documentId: documentId || (item as FlatSocialMedia).id.toString(),
		instagram,
		facebook,
		telegram,
		linkedin,
		createdAt: (item as FlatSocialMedia).createdAt,
		updatedAt: (item as FlatSocialMedia).updatedAt,
		publishedAt: (item as FlatSocialMedia).publishedAt,
	};
}

export async function fetchSocialMedias(): Promise<SocialMedia[]> {
	const url = buildStrapiUrl('/api/social-medias', { populate: '*' });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Social Medias: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		instagram?: string | null;
		facebook?: string | null;
		telegram?: string | null;
		linkedin?: string | null;
	}>
		| StrapiResponseFlatSocialMedia;

	if (!json.data || json.data.length === 0) {
		return [];
	}

	const items: SocialMedia[] = (json.data || []).map((item: any) => normalizeSocialMedia(item));

	return items;
}

export async function fetchSocialMedia(): Promise<SocialMedia | null> {
	const socialMedias = await fetchSocialMedias();
	if (socialMedias.length === 0) {
		return null;
	}
	// Return the first social media entry
	return socialMedias[0];
}

/**
 * Quality Management System Consulting data interface
 */
export interface QualityManagementSystemConsultingItem {
	id: number;
	documentId: string;
	name: string;
	type: string;
	blog_url?: string | null;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
}

type FlatQualityManagementSystemConsulting = {
	id: number;
	documentId: string;
	name: string;
	type: string;
	blog_url?: string | null;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
	locale?: StrapiLocale;
};

interface StrapiResponseFlatQualityManagementSystemConsulting {
	data: FlatQualityManagementSystemConsulting[];
	meta?: unknown;
}

function normalizeQualityManagementSystemConsulting(item: any, locale: StrapiLocale): QualityManagementSystemConsultingItem {
	if (item && item.attributes) {
		const { name, type, blog_url } = item.attributes;
		return {
			id: item.id,
			documentId: item.documentId || item.id.toString(),
			name,
			type,
			blog_url,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
			publishedAt: item.publishedAt,
			locale: item.locale || locale,
		};
	}
	const { name, type, blog_url, documentId } = item as FlatQualityManagementSystemConsulting;
	return {
		id: (item as FlatQualityManagementSystemConsulting).id,
		documentId: documentId || (item as FlatQualityManagementSystemConsulting).id.toString(),
		name,
		type,
		blog_url,
		createdAt: (item as FlatQualityManagementSystemConsulting).createdAt,
		updatedAt: (item as FlatQualityManagementSystemConsulting).updatedAt,
		publishedAt: (item as FlatQualityManagementSystemConsulting).publishedAt,
		locale: (item as FlatQualityManagementSystemConsulting).locale || locale,
	};
}

export async function fetchQualityManagementSystemConsultings(locale: StrapiLocale): Promise<QualityManagementSystemConsultingItem[]> {
	const url = buildStrapiUrl('/api/quality-management-system-consultings', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Quality Management System Consultings: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		name: string;
		type: string;
		blog_url?: string | null;
	}>
		| StrapiResponseFlatQualityManagementSystemConsulting;

	if (!json.data || json.data.length === 0) {
		return [];
	}

	const items: QualityManagementSystemConsultingItem[] = (json.data || []).map((item: any) => normalizeQualityManagementSystemConsulting(item, locale));

	return items;
}

/**
 * Licensing Consulting - uses the same interface as QualityManagementSystemConsultingItem
 */
export async function fetchLicensingConsultings(locale: StrapiLocale): Promise<QualityManagementSystemConsultingItem[]> {
	const url = buildStrapiUrl('/api/licensing-consultings', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Licensing Consultings: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		name: string;
		type: string;
		blog_url?: string | null;
	}>
		| StrapiResponseFlatQualityManagementSystemConsulting;

	if (!json.data || json.data.length === 0) {
		return [];
	}

	const items: QualityManagementSystemConsultingItem[] = (json.data || []).map((item: any) => normalizeQualityManagementSystemConsulting(item, locale));

	return items;
}

/**
 * Construction Renovation and Equipment Supply - uses the same interface as QualityManagementSystemConsultingItem
 */
export async function fetchConstructionRenovationAndEquipmentSupplies(locale: StrapiLocale): Promise<QualityManagementSystemConsultingItem[]> {
	const url = buildStrapiUrl('/api/construction-renovation-and-equipment-supplies', { populate: '*', locale, ...LIST });
	const res = await fetch(url, { next: { revalidate: 60 } });
	if (!res.ok) {
		throw new Error(`Failed to fetch Construction Renovation and Equipment Supplies: ${res.status}`);
	}
	const json = (await res.json()) as
		| StrapiResponseWithAttributes<{
		name: string;
		type: string;
		blog_url?: string | null;
	}>
		| StrapiResponseFlatQualityManagementSystemConsulting;

	if (!json.data || json.data.length === 0) {
		return [];
	}

	const items: QualityManagementSystemConsultingItem[] = (json.data || []).map((item: any) => normalizeQualityManagementSystemConsulting(item, locale));

	return items;
}


