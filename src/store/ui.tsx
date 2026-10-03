import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Note, Question } from '../types';

export type Theme = 'dark' | 'light' | 'system';

export interface ResourceModalState {
  topicId?: string;
  url?: string;
}
export interface NoteModalState {
  topicId?: string;
  note?: Note;
  tags?: string[];
  title?: string;
}
export interface QuestionModalState {
  topicId?: string;
  question?: Question;
  tags?: string[];
  text?: string;
}

interface UiApi {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileNav: boolean;
  setMobileNav: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  resourceModal: ResourceModalState | null;
  openResource: (s?: ResourceModalState) => void;
  closeResource: () => void;
  noteModal: NoteModalState | null;
  openNote: (s?: NoteModalState) => void;
  closeNote: () => void;
  questionModal: QuestionModalState | null;
  openQuestion: (s?: QuestionModalState) => void;
  closeQuestion: () => void;
  toast: string | null;
  notify: (msg: string) => void;
}

const Ctx = createContext<UiApi | null>(null);

const read = (k: string, fallback: string) => {
  try {
    return localStorage.getItem(k) ?? fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

const applyTheme = (t: Theme) => {
  const resolved = t === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : t;
  document.documentElement.setAttribute('data-theme', resolved);
};

export function UiProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => read('fifi.theme', 'dark') as Theme);
  const [collapsed, setCollapsed] = useState(() => read('fifi.collapsed', '0') === '1');
  const [mobileNav, setMobileNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resourceModal, setResourceModal] = useState<ResourceModalState | null>(null);
  const [noteModal, setNoteModal] = useState<NoteModalState | null>(null);
  const [questionModal, setQuestionModal] = useState<QuestionModalState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: light)');
    const on = () => applyTheme('system');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    write('fifi.theme', t);
  }, []);

  const api = useMemo<UiApi>(
    () => ({
      theme,
      setTheme,
      cycleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      collapsed,
      toggleCollapsed: () =>
        setCollapsed((c) => {
          write('fifi.collapsed', c ? '0' : '1');
          return !c;
        }),
      mobileNav,
      setMobileNav,
      searchOpen,
      setSearchOpen,
      resourceModal,
      openResource: (s = {}) => setResourceModal(s),
      closeResource: () => setResourceModal(null),
      noteModal,
      openNote: (s = {}) => setNoteModal(s),
      closeNote: () => setNoteModal(null),
      questionModal,
      openQuestion: (s = {}) => setQuestionModal(s),
      closeQuestion: () => setQuestionModal(null),
      toast,
      notify: setToast,
    }),
    [theme, setTheme, collapsed, mobileNav, searchOpen, resourceModal, noteModal, questionModal, toast],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useUi() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUi must be used inside <UiProvider>');
  return v;
}
