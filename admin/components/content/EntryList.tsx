'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronRight, GripVertical, ImageOff, Plus, Search } from 'lucide-react';
import { reorderEntries } from '@/app/actions';
import { getContentType } from '@/lib/content-types';
import { LANGS, LANG_NAMES, LANG_SHORT, type Lang } from '@/lib/i18n';
import type { Row } from '@/lib/rows';
import { useLabel, useT, useUiLang } from '../I18n';
import { StatusBadge } from '../ui/StatusBadge';
import { useToast } from '../ui/Toast';

export function EntryList({ typeKey, lang, rows: initialRows, counts }: { typeKey: string; lang: Lang; rows: Row[]; counts: Record<Lang, number> }) {
  const type = getContentType(typeKey)!;
  const t = useT();
  const label = useLabel();
  const toast = useToast();
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState('');
  const [allLanguages, setAllLanguages] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => setRows(initialRows), [initialRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rows.filter((r) => `${r.title} ${r.subtitle}`.toLowerCase().includes(q)) : rows;
  }, [rows, query]);

  const canDrag = !!type.sortable && !query;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const subtitleLabel = (value: string) => type.fields.find((f) => f.name === type.subtitleField)?.options?.find((o) => o.value === value)?.label;

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.documentId === active.id);
    const newIndex = rows.findIndex((r) => r.documentId === over.id);
    const next = arrayMove(rows, oldIndex, newIndex);
    setRows(next);
    startTransition(async () => {
      const res = await reorderEntries({ type: type.key, locale: lang, documentIds: next.map((r) => r.documentId), allLanguages });
      if (res.ok) toast('success', t('toast.ordered'));
      else {
        toast('error', t('errorGeneric'));
        setRows(rows);
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{label(type.label)}</h1>
          <p className="text-slate-600">{label(type.description)}</p>
        </div>
        <Link href={`/content/${type.key}/new?lang=${lang}`} className="btn-primary">
          <Plus className="size-4" /> {t('add')}
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" className="inline-flex rounded-xl bg-slate-200/70 p-1">
          {LANGS.map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={l === lang}
              onClick={() => router.push(`/content/${type.key}?lang=${l}`)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${l === lang ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {LANG_NAMES[l]} <span className="ml-1 text-xs text-slate-400">{counts[l]}</span>
            </button>
          ))}
        </div>
        <label className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search')} className="input pl-9" />
        </label>
      </div>

      {type.sortable && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-brand-50 px-4 py-2.5 text-sm text-brand-dark">
          <span className="flex items-center gap-2">
            <GripVertical className="size-4" /> {t('list.dragHint')}
            {type.key === 'courses' && <span className="text-brand-dark/70">· {t('list.availableFirst')}</span>}
          </span>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allLanguages} onChange={(e) => setAllLanguages(e.target.checked)} className="size-4 accent-brand" />
            {t('list.applyAllLangs')}
          </label>
        </div>
      )}

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-slate-500">{t('list.empty')}</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={filtered.map((r) => r.documentId)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <SortableRow key={row.documentId} row={row} typeKey={type.key} lang={lang} draggable={canDrag} hasImage={!!type.imageField} subtitle={subtitleLabel(row.subtitle) ? label(subtitleLabel(row.subtitle)!) : row.subtitle} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <p className="text-xs text-slate-400">
        {t('list.showing')} {filtered.length} / {rows.length}
      </p>
    </div>
  );
}

function SortableRow({ row, typeKey, lang, draggable, hasImage, subtitle }: { row: Row; typeKey: string; lang: Lang; draggable: boolean; hasImage: boolean; subtitle: string }) {
  const t = useT();
  const ui = useUiLang();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.documentId, disabled: !draggable });
  const date = new Intl.DateTimeFormat(ui === 'hy' ? 'hy-AM' : ui === 'ru' ? 'ru-RU' : 'en-GB', { dateStyle: 'medium' }).format(new Date(row.updatedAt));

  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-3 bg-white px-3 py-2.5 ${isDragging ? 'relative z-10 shadow-lg' : ''}`}>
      {draggable && (
        <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing" aria-label="Drag">
          <GripVertical className="size-5" />
        </button>
      )}
      <Link href={`/content/${typeKey}/${row.documentId}?lang=${lang}`} className="flex min-w-0 flex-1 items-center gap-3">
        {hasImage &&
          (row.thumb ? (
            <img src={row.thumb} alt="" className="size-12 shrink-0 rounded-lg bg-slate-100 object-cover" loading="lazy" />
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
              <ImageOff className="size-5" />
            </span>
          ))}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{row.title || '—'}</span>
          <span className="flex items-center gap-2 truncate text-sm text-slate-500">
            {subtitle}
            {row.available !== null && (
              <span className={`shrink-0 rounded px-1.5 text-xs ${row.available ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {t(row.available ? 'course.open' : 'course.closed')}
              </span>
            )}
          </span>
        </span>
        <span className="hidden items-center gap-1 md:flex" title={t('list.translations')}>
          {LANGS.map((l) => (
            <span key={l} className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${row.locales.includes(l) ? 'bg-brand-50 text-brand' : 'bg-slate-50 text-slate-300'}`}>
              {LANG_SHORT[l]}
            </span>
          ))}
        </span>
        <span className="hidden w-28 text-right text-xs text-slate-400 lg:block">{date}</span>
        <StatusBadge status={row.status} />
        <ChevronRight className="size-4 shrink-0 text-slate-300" />
      </Link>
    </li>
  );
}
