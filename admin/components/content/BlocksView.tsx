import { Fragment } from 'react';
import { blockText, iframeSrc, youtubeId, type StrapiBlock } from '@/lib/blocks';

function Inline({ nodes }: { nodes?: any[] }) {
  return (
    <>
      {(nodes ?? []).map((n, i) => {
        if (n.type === 'link')
          return (
            <a key={i} href={n.url} target="_blank" rel="noreferrer" className="text-brand underline">
              <Inline nodes={n.children} />
            </a>
          );
        let el: React.ReactNode = String(n.text ?? '')
          .split('\n')
          .map((part, j) => (
            <Fragment key={j}>
              {j > 0 && <br />}
              {part}
            </Fragment>
          ));
        if (n.bold) el = <strong>{el}</strong>;
        if (n.italic) el = <em>{el}</em>;
        if (n.underline) el = <u>{el}</u>;
        if (n.strikethrough) el = <s>{el}</s>;
        if (n.code) el = <code>{el}</code>;
        return <Fragment key={i}>{el}</Fragment>;
      })}
    </>
  );
}

function List({ block }: { block: StrapiBlock }) {
  const Tag = block.format === 'ordered' ? 'ol' : 'ul';
  return (
    <Tag>
      {(block.children ?? []).map((item: any, i: number) =>
        item.type === 'list' ? (
          <li key={i} className="list-none">
            <List block={item} />
          </li>
        ) : (
          <li key={i}>
            <Inline nodes={item.children} />
          </li>
        ),
      )}
    </Tag>
  );
}

/** Read-only rendering of Strapi rich text, close to what the website shows. */
export function BlocksView({ blocks }: { blocks: StrapiBlock[] | null | undefined }) {
  return (
    <div className="rich-content">
      {(blocks ?? []).map((block, i) => {
        const text = blockText(block);
        if (block.type === 'paragraph' && /<iframe/i.test(text)) {
          const id = youtubeId(iframeSrc(text));
          return id ? (
            <iframe
              key={i}
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title="YouTube"
              className="my-4 aspect-video w-full rounded-lg"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : null;
        }
        switch (block.type) {
          case 'heading': {
            const H = `h${Math.min(Math.max(block.level ?? 2, 1), 6)}` as 'h2';
            return (
              <H key={i}>
                <Inline nodes={block.children} />
              </H>
            );
          }
          case 'list':
            return <List key={i} block={block} />;
          case 'quote':
            return (
              <blockquote key={i}>
                <Inline nodes={block.children} />
              </blockquote>
            );
          case 'code':
            return <pre key={i}>{text}</pre>;
          case 'image':
            return block.image?.url ? <img key={i} src={block.image.url} alt={block.image.alternativeText ?? ''} /> : null;
          default:
            return (
              <p key={i}>
                <Inline nodes={block.children} />
              </p>
            );
        }
      })}
    </div>
  );
}
