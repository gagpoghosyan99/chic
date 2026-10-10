'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BookOpen, Briefcase, ClipboardList, ExternalLink, GraduationCap, HandHeart, Handshake, HeartHandshake, Home, Image as ImageIcon,
  Info, LogOut, Menu, Newspaper, Presentation, Share2, ShieldCheck, Users, Wrench, X,
} from 'lucide-react';
import { CONTENT_TYPES, SUBMISSION_TYPES } from '@/lib/content-types';
import { logout } from '@/app/actions';
import { useLabel, useT } from './I18n';
import { UiLangSwitcher } from './UiLangSwitcher';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  blog: Newspaper,
  courses: GraduationCap,
  team: Users,
  lecturers: Presentation,
  volunteers: HeartHandshake,
  partners: Handshake,
  history: Info,
  quality: ShieldCheck,
  licensing: Briefcase,
  construction: Wrench,
  social: Share2,
  registrations: ClipboardList,
  'volunteer-applications': HandHeart,
};

export function Sidebar({ siteUrl }: { siteUrl: string }) {
  const t = useT();
  const label = useLabel();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const item = (href: string, text: string, Icon: React.ComponentType<{ className?: string }>) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition ${
          active ? 'bg-white text-brand font-semibold' : 'text-white/85 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{text}</span>
      </Link>
    );
  };

  const section = (title: string, children: React.ReactNode) => (
    <div className="space-y-0.5">
      <p className="px-3 pt-4 pb-1 text-[11px] font-semibold tracking-wider text-white/50 uppercase">{title}</p>
      {children}
    </div>
  );

  const nav = (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto px-3 py-4">
      <Link href="/" className="mb-2 flex items-center gap-2 px-3">
        <img src="/logo.png" alt="CHIC" className="h-10 w-auto" />
      </Link>
      {item('/', t('nav.dashboard'), Home)}
      {section(t('nav.content'), CONTENT_TYPES.filter((c) => c.group === 'content').map((c) => item(`/content/${c.key}`, label(c.label), ICONS[c.key] ?? BookOpen)))}
      {section(t('nav.services'), CONTENT_TYPES.filter((c) => c.group === 'services').map((c) => item(`/content/${c.key}`, label(c.label), ICONS[c.key] ?? BookOpen)))}
      {section(t('nav.submissions'), SUBMISSION_TYPES.map((s) => item(`/submissions/${s.key}`, label(s.label), ICONS[s.key])))}
      {section(t('nav.settings'), [
        item('/media', t('nav.media'), ImageIcon),
        ...CONTENT_TYPES.filter((c) => c.group === 'settings').map((c) => item(`/content/${c.key}`, label(c.label), ICONS[c.key] ?? BookOpen)),
      ])}
      <div className="mt-auto space-y-2 border-t border-white/15 pt-4">
        <div className="px-1">
          <UiLangSwitcher dark />
        </div>
        <a href={siteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] text-white/85 hover:bg-white/10">
          <ExternalLink className="size-4" />
          {t('openSite')}
        </a>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] text-white/85 hover:bg-white/10">
            <LogOut className="size-4" />
            {t('logout')}
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="fixed top-3 left-3 z-30 rounded-lg bg-brand p-2 text-white shadow lg:hidden" aria-label="Menu">
        <Menu className="size-5" />
      </button>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-brand lg:block">{nav}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-brand">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-3 right-3 text-white" aria-label="Close">
              <X className="size-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
