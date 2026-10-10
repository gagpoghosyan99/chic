export type MediaValue = {
  id: number;
  url: string;
  thumb: string;
  name: string;
  width?: number | null;
  height?: number | null;
  size?: number;
  createdAt?: string;
  /** Raw Strapi file object, kept so rich-text image blocks can store the full file info. */
  raw?: Record<string, unknown>;
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
