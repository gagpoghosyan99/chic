import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, isValidSession } from '@/lib/session';
import { media } from '@/lib/strapi';
import { toMediaValue } from '@/lib/editor-data';
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/media-types';

const PAGE_SIZE = 48;

async function authorized() {
  return isValidSession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? 1) || 1);
  const images = (await media.list()).filter((f) => f.mime?.startsWith('image/'));
  return NextResponse.json({
    data: images.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toMediaValue),
    hasMore: images.length > page * PAGE_SIZE,
  });
}

export async function POST(request: NextRequest) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await request.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: 'no-files' }, { status: 400 });
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return NextResponse.json({ error: 'type' }, { status: 400 });
    if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'size' }, { status: 400 });
  }
  try {
    const uploaded = await media.upload(files);
    return NextResponse.json({ data: uploaded.map(toMediaValue) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'upload' }, { status: 502 });
  }
}
