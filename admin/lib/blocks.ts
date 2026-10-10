// Converts between Strapi "blocks" rich text and TipTap (ProseMirror) JSON.

type StrapiText = { type: 'text'; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean };
type StrapiLink = { type: 'link'; url: string; children: StrapiText[] };
type StrapiInline = StrapiText | StrapiLink;
export type StrapiBlock = Record<string, any> & { type: string; children?: any[] };

type PMMark = { type: string; attrs?: Record<string, any> };
type PMNode = { type: string; attrs?: Record<string, any>; content?: PMNode[]; text?: string; marks?: PMMark[] };

const MARKS: [keyof StrapiText, string][] = [
  ['bold', 'bold'],
  ['italic', 'italic'],
  ['underline', 'underline'],
  ['strikethrough', 'strike'],
  ['code', 'code'],
];

const EMPTY_TEXT: StrapiText = { type: 'text', text: '' };

export const blockText = (block: StrapiBlock): string =>
  (block.children ?? []).map((c: any) => (c.type === 'text' ? c.text : blockText(c))).join('');

const isVideoParagraph = (block: StrapiBlock) => block.type === 'paragraph' && /<iframe[\s\S]*<\/iframe>/i.test(blockText(block));

export function iframeSrc(html: string) {
  return html.match(/src="([^"]+)"/i)?.[1] ?? '';
}

function textToNodes(text: string, marks: PMMark[]): PMNode[] {
  const nodes: PMNode[] = [];
  text.split('\n').forEach((part, i) => {
    if (i > 0) nodes.push({ type: 'hardBreak' });
    if (part) nodes.push({ type: 'text', text: part, ...(marks.length ? { marks } : {}) });
  });
  return nodes;
}

function inlineToPM(children: StrapiInline[] = []): PMNode[] {
  const out: PMNode[] = [];
  for (const child of children) {
    if (child.type === 'link') {
      for (const t of child.children ?? []) {
        const marks = [...MARKS.filter(([k]) => t[k]).map(([, m]) => ({ type: m })), { type: 'link', attrs: { href: child.url } }];
        out.push(...textToNodes(t.text ?? '', marks));
      }
    } else if (child.type === 'text') {
      out.push(...textToNodes(child.text ?? '', MARKS.filter(([k]) => child[k]).map(([, m]) => ({ type: m }))));
    }
  }
  return out;
}

const para = (children?: StrapiInline[]): PMNode => {
  const content = inlineToPM(children);
  return content.length ? { type: 'paragraph', content } : { type: 'paragraph' };
};

function listToPM(block: StrapiBlock): PMNode {
  const items: PMNode[] = [];
  for (const child of block.children ?? []) {
    if (child.type === 'list' && items.length) {
      items[items.length - 1].content!.push(listToPM(child));
    } else if (child.type === 'list-item') {
      items.push({ type: 'listItem', content: [para(child.children)] });
    }
  }
  return { type: block.format === 'ordered' ? 'orderedList' : 'bulletList', content: items.length ? items : [{ type: 'listItem', content: [{ type: 'paragraph' }] }] };
}

export function blocksToDoc(blocks: StrapiBlock[] | null | undefined): PMNode {
  const content: PMNode[] = [];
  for (const block of blocks ?? []) {
    if (isVideoParagraph(block)) {
      content.push({ type: 'videoEmbed', attrs: { raw: JSON.stringify(block), src: iframeSrc(blockText(block)) } });
      continue;
    }
    switch (block.type) {
      case 'paragraph':
        content.push(para(block.children));
        break;
      case 'heading': {
        const p = para(block.children);
        content.push({ type: 'heading', attrs: { level: Math.min(Math.max(block.level ?? 2, 1), 4) }, ...(p.content ? { content: p.content } : {}) });
        break;
      }
      case 'list':
        content.push(listToPM(block));
        break;
      case 'quote':
        content.push({ type: 'blockquote', content: [para(block.children)] });
        break;
      case 'code': {
        const text = blockText(block);
        content.push({ type: 'codeBlock', ...(text ? { content: [{ type: 'text', text }] } : {}) });
        break;
      }
      case 'image':
        content.push({
          type: 'image',
          attrs: { src: block.image?.url ?? '', alt: block.image?.alternativeText ?? '', data: JSON.stringify(block.image ?? {}) },
        });
        break;
      default:
        content.push({ type: 'videoEmbed', attrs: { raw: JSON.stringify(block), src: '' } });
    }
  }
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] };
}

function inlineFromPM(nodes: PMNode[] = []): StrapiInline[] {
  const out: StrapiInline[] = [];
  for (const node of nodes) {
    const text = node.type === 'hardBreak' ? '\n' : node.type === 'text' ? node.text ?? '' : '';
    if (!text) continue;
    const marks = node.marks ?? [];
    const t: StrapiText = { type: 'text', text };
    for (const [key, mark] of MARKS) if (marks.some((m) => m.type === mark)) (t as any)[key] = true;
    const href = marks.find((m) => m.type === 'link')?.attrs?.href;
    const last = out[out.length - 1];
    if (href) {
      if (last?.type === 'link' && last.url === href) last.children.push(t);
      else out.push({ type: 'link', url: href, children: [t] });
    } else {
      out.push(t);
    }
  }
  return out.length ? out : [EMPTY_TEXT];
}

const paragraphsInline = (nodes: PMNode[] = []) =>
  nodes.flatMap((n, i) => [...(i > 0 ? [{ type: 'text', text: '\n' } as StrapiText] : []), ...inlineFromPM(n.content)]);

function listFromPM(node: PMNode, indentLevel = 0): StrapiBlock {
  const children: any[] = [];
  for (const item of node.content ?? []) {
    const paragraphs = (item.content ?? []).filter((c) => c.type === 'paragraph');
    children.push({ type: 'list-item', children: paragraphsInline(paragraphs) });
    for (const nested of (item.content ?? []).filter((c) => c.type === 'bulletList' || c.type === 'orderedList')) {
      children.push(listFromPM(nested, indentLevel + 1));
    }
  }
  return { type: 'list', format: node.type === 'orderedList' ? 'ordered' : 'unordered', indentLevel, children };
}

export function docToBlocks(doc: PMNode): StrapiBlock[] {
  const blocks: StrapiBlock[] = [];
  for (const node of doc.content ?? []) {
    switch (node.type) {
      case 'paragraph':
        blocks.push({ type: 'paragraph', children: inlineFromPM(node.content) });
        break;
      case 'heading':
        blocks.push({ type: 'heading', level: node.attrs?.level ?? 2, children: inlineFromPM(node.content) });
        break;
      case 'bulletList':
      case 'orderedList':
        blocks.push(listFromPM(node));
        break;
      case 'blockquote':
        blocks.push({ type: 'quote', children: paragraphsInline(node.content) });
        break;
      case 'codeBlock':
        blocks.push({ type: 'code', children: [{ type: 'text', text: (node.content ?? []).map((c) => c.text ?? '').join('') }] });
        break;
      case 'image': {
        let image: Record<string, any> = {};
        try {
          image = JSON.parse(node.attrs?.data ?? '{}') ?? {};
        } catch {}
        blocks.push({
          type: 'image',
          image: { ...image, url: node.attrs?.src ?? image.url, alternativeText: node.attrs?.alt || image.alternativeText || null },
          children: [EMPTY_TEXT],
        });
        break;
      }
      case 'videoEmbed':
        try {
          blocks.push(JSON.parse(node.attrs?.raw));
        } catch {}
        break;
    }
  }
  while (blocks.length > 1 && blocks[blocks.length - 1].type === 'paragraph' && blockText(blocks[blocks.length - 1]) === '') blocks.pop();
  return blocks;
}

export function youtubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

export function youtubeBlock(id: string): StrapiBlock {
  const html = `<iframe width="951" height="535" src="https://www.youtube.com/embed/${id}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  return { type: 'paragraph', children: [{ type: 'text', text: html }] };
}

/** Plain-text summary of rich text, for list rows and previews. */
export function blocksSummary(blocks: StrapiBlock[] | null | undefined, max = 160) {
  const text = (blocks ?? [])
    .filter((b) => !isVideoParagraph(b))
    .map(blockText)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
