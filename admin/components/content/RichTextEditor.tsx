'use client';

import { useState } from 'react';
import { EditorContent, Node, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo2, Underline, Undo2, Video } from 'lucide-react';
import { blocksToDoc, docToBlocks, iframeSrc, youtubeBlock, youtubeId, type StrapiBlock } from '@/lib/blocks';
import type { MediaValue } from '@/lib/media-types';
import { useT } from '../I18n';
import { Modal } from '../ui/Modal';
import { MediaPicker } from '../media/MediaPicker';

const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return { raw: { default: null }, src: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'div[data-video-embed]' }];
  },
  renderHTML({ node }) {
    const id = youtubeId(node.attrs.src ?? '');
    return [
      'div',
      { 'data-video-embed': '', class: 'video-embed' },
      ...(id ? [['img', { src: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, alt: '', style: 'width:120px;border-radius:6px;margin:0' }]] : []),
      ['span', {}, `▶ ${id ? `YouTube · ${id}` : node.attrs.src || 'HTML'}`],
    ] as any;
  },
});

const StrapiImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      data: {
        default: null,
        parseHTML: (el: HTMLElement) => el.getAttribute('data-strapi'),
        renderHTML: (attrs: Record<string, any>) => (attrs.data ? { 'data-strapi': attrs.data } : {}),
      },
    };
  },
});

export function RichTextEditor({ value, onChange }: { value: StrapiBlock[]; onChange: (blocks: StrapiBlock[]) => void }) {
  const t = useT();
  const [prompt, setPrompt] = useState<null | 'link' | 'video'>(null);
  const [promptValue, setPromptValue] = useState('');
  const [promptError, setPromptError] = useState('');
  const [picking, setPicking] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https', protocols: ['http', 'https', 'mailto', 'tel'] },
      }),
      StrapiImage,
      VideoEmbed,
    ],
    content: blocksToDoc(value),
    editorProps: { attributes: { class: 'rich-content' } },
    onUpdate: ({ editor }) => onChange(docToBlocks(editor.getJSON() as any)),
  });

  // The selector result stays at its initial value until the editor's first transaction, so it can't gate rendering.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: !!e?.isActive('bold'),
      italic: !!e?.isActive('italic'),
      underline: !!e?.isActive('underline'),
      h2: !!e?.isActive('heading', { level: 2 }),
      h3: !!e?.isActive('heading', { level: 3 }),
      bullet: !!e?.isActive('bulletList'),
      ordered: !!e?.isActive('orderedList'),
      quote: !!e?.isActive('blockquote'),
      link: !!e?.isActive('link'),
      canUndo: !!e?.can().undo(),
      canRedo: !!e?.can().redo(),
    }),
  });

  if (!editor || !state) return <div className="h-48 rounded-lg border border-slate-200" />;

  const openPrompt = (kind: 'link' | 'video') => {
    setPromptValue(kind === 'link' ? editor.getAttributes('link').href ?? '' : '');
    setPromptError('');
    setPrompt(kind);
  };

  const applyPrompt = () => {
    const v = promptValue.trim();
    if (prompt === 'link') {
      if (!v) editor.chain().focus().extendMarkRange('link').unsetLink().run();
      else if (!/^(https?:\/\/|mailto:|tel:)/i.test(v)) return setPromptError(t('editor.invalidUrl'));
      else editor.chain().focus().extendMarkRange('link').setLink({ href: v }).run();
    } else if (prompt === 'video') {
      const id = youtubeId(v);
      if (!id) return setPromptError(t('rich.videoInvalid'));
      const block = youtubeBlock(id);
      editor
        .chain()
        .focus()
        .insertContent({ type: 'videoEmbed', attrs: { raw: JSON.stringify(block), src: iframeSrc(block.children![0].text) } })
        .run();
    }
    setPrompt(null);
  };

  const insertImage = (file: MediaValue) => {
    editor.chain().focus().setImage({ src: file.url, alt: file.name }).updateAttributes('image', { data: JSON.stringify(file.raw ?? { url: file.url }) }).run();
    setPicking(false);
  };

  const btn = (active: boolean, title: string, onClick: () => void, Icon: React.ComponentType<{ className?: string }>, disabled = false) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`rounded-md p-1.5 transition disabled:opacity-30 ${active ? 'bg-brand text-white' : 'text-slate-600 hover:bg-slate-200'}`}
    >
      <Icon className="size-4" />
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      <div className="sticky top-0 z-[1] flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {btn(state.bold, t('rich.bold'), () => editor.chain().focus().toggleBold().run(), Bold)}
        {btn(state.italic, t('rich.italic'), () => editor.chain().focus().toggleItalic().run(), Italic)}
        {btn(state.underline, t('rich.underline'), () => editor.chain().focus().toggleUnderline().run(), Underline)}
        <span className="mx-1 h-5 w-px bg-slate-300" />
        {btn(state.h2, `${t('rich.heading')} 1`, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), Heading2)}
        {btn(state.h3, `${t('rich.heading')} 2`, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3)}
        {btn(state.bullet, t('rich.bullet'), () => editor.chain().focus().toggleBulletList().run(), List)}
        {btn(state.ordered, t('rich.ordered'), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered)}
        {btn(state.quote, t('rich.quote'), () => editor.chain().focus().toggleBlockquote().run(), Quote)}
        <span className="mx-1 h-5 w-px bg-slate-300" />
        {btn(state.link, t('rich.link'), () => openPrompt('link'), LinkIcon)}
        {btn(false, t('rich.image'), () => setPicking(true), ImagePlus)}
        {btn(false, t('rich.video'), () => openPrompt('video'), Video)}
        <span className="mx-1 h-5 w-px bg-slate-300" />
        {btn(false, t('rich.undo'), () => editor.chain().focus().undo().run(), Undo2, !state.canUndo)}
        {btn(false, t('rich.redo'), () => editor.chain().focus().redo().run(), Redo2, !state.canRedo)}
      </div>
      <EditorContent editor={editor} className="max-h-[60vh] overflow-y-auto" />

      <Modal
        open={!!prompt}
        onClose={() => setPrompt(null)}
        title={prompt === 'link' ? t('rich.link') : t('rich.video')}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setPrompt(null)}>
              {t('cancel')}
            </button>
            <button type="button" className="btn-primary" onClick={applyPrompt}>
              {t('done')}
            </button>
          </>
        }
      >
        <label className="block space-y-1.5">
          <span className="text-sm text-slate-600">{prompt === 'link' ? t('rich.linkPrompt') : t('rich.videoPrompt')}</span>
          <input
            autoFocus
            className="input"
            value={promptValue}
            onChange={(e) => (setPromptValue(e.target.value), setPromptError(''))}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPrompt())}
            placeholder={prompt === 'video' ? 'https://www.youtube.com/watch?v=…' : 'https://'}
          />
          {promptError && <span className="text-sm text-red-600">{promptError}</span>}
        </label>
      </Modal>
      <MediaPicker open={picking} onClose={() => setPicking(false)} onSelect={insertImage} />
    </div>
  );
}