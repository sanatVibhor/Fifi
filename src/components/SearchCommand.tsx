import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { useUi } from '../store/ui';
import { buildIndex, search, type SearchKind } from '../lib/search';
import { byRecentlyStudied } from '../store/selectors';
import { Icon } from './Icon';
import { Kbd } from './primitives';
import { cn } from '../lib/utils';

interface Item {
  key: string;
  group: string;
  icon: string;
  title: string;
  path?: string;
  snippet?: string;
  kind?: string;
  disabled?: boolean;
  badge?: string;
  run: () => void;
}

const KIND_META: Record<SearchKind, { group: string; icon: string }> = {
  topic: { group: 'Topics', icon: 'layers' },
  concept: { group: 'Concepts', icon: 'target' },
  note: { group: 'Notes', icon: 'file' },
  resource: { group: 'Resources', icon: 'link' },
  question: { group: 'Questions', icon: 'help' },
};

function highlight(text: string, query: string): ReactNode {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return text;
  const re = new RegExp(`(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig');
  return text.split(re).map((part, i) =>
    i % 2 ? (
      <mark key={i}>{part}</mark>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function SearchCommand() {
  const { searchOpen, setSearchOpen } = useUi();
  if (!searchOpen) return null;
  return <Palette onClose={() => setSearchOpen(false)} />;
}

function Palette({ onClose }: { onClose: () => void }) {
  const { state } = useStore();
  const ui = useUi();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const index = useMemo(() => buildIndex(state), [state]);

  const items: Item[] = useMemo(() => {
    const go = (to: string) => () => {
      onClose();
      navigate(to);
    };
    if (query.trim()) {
      return search(index, query).map((h) => ({
        key: `${h.kind}-${h.id}`,
        group: KIND_META[h.kind].group,
        icon: KIND_META[h.kind].icon,
        title: h.title,
        path: h.path,
        snippet: h.snippet,
        kind: h.kind,
        run: go(h.to),
      }));
    }
    const recent = [...state.topics].filter((t) => t.lastOpenedAt).sort(byRecentlyStudied).slice(0, 4);
    return [
      ...recent.map((t) => ({
        key: `recent-${t.id}`, group: 'Recent', icon: 'clock', title: t.name,
        path: state.domains.find((d) => d.id === t.domainId)!.name, run: go(`/t/${t.id}`),
      })),
      { key: 'a-note', group: 'Actions', icon: 'plus', title: 'New note', run: () => { onClose(); ui.openNote(); } },
      { key: 'a-res', group: 'Actions', icon: 'link', title: 'Add resource', run: () => { onClose(); ui.openResource(); } },
      { key: 'a-q', group: 'Actions', icon: 'help', title: 'Add question to revisit', run: () => { onClose(); ui.openQuestion(); } },
      { key: 'a-theme', group: 'Actions', icon: ui.theme === 'light' ? 'moon' : 'sun', title: 'Toggle theme', run: () => { ui.cycleTheme(); onClose(); } },
      ...state.domains.map((d) => ({
        key: `d-${d.id}`, group: 'Go to', icon: d.icon, title: d.name, path: `Domain ${d.index}`, run: go(`/d/${d.slug}`),
      })),
      { key: 'g-learn', group: 'Go to', icon: 'layers', title: 'My Learning', run: go('/learning') },
      { key: 'g-rev', group: 'Go to', icon: 'refresh', title: 'Revision', run: go('/revision') },
      { key: 'ai', group: 'Coming soon', icon: 'sparkle', title: 'Fifi AI', path: 'Ask questions across all your notes and resources', badge: 'V2', disabled: true, run: () => undefined },
    ];
  }, [query, index, state, navigate, onClose, ui]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const selectable = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);
  const move = (dir: 1 | -1) => {
    const pos = selectable.indexOf(active);
    const next = selectable[(pos + dir + selectable.length) % selectable.length];
    setActive(next ?? 0);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = items[active];
      if (it && !it.disabled) it.run();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  let lastGroup = '';
  return createPortal(
    <div className="overlay overlay-top" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" onKeyDown={onKey}>
        <div className="palette-input">
          <Icon name="search" size={17} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, concepts, notes, resources, questions…"
            spellCheck={false}
            aria-label="Search"
          />
          <Kbd>Esc</Kbd>
        </div>
        <div className="palette-list" ref={listRef}>
          {query.trim() && items.length === 0 && (
            <div className="palette-empty">
              <p>No results for “{query}”</p>
              <span>Try a concept name like “independence” or a tag.</span>
            </div>
          )}
          {items.map((it, i) => {
            const header = it.group !== lastGroup ? it.group : null;
            lastGroup = it.group;
            return (
              <Fragment key={it.key}>
                {header && <p className="palette-group">{header}</p>}
                <button
                  data-idx={i}
                  disabled={it.disabled}
                  className={cn('palette-item', i === active && 'is-active', it.disabled && 'is-disabled')}
                  onMouseMove={() => !it.disabled && setActive(i)}
                  onClick={it.run}
                >
                  <span className="palette-icon">
                    <Icon name={it.icon} size={15} />
                  </span>
                  <span className="palette-text">
                    <span className="palette-title">{highlight(it.title, query)}</span>
                    {(it.path || it.snippet) && (
                      <span className="palette-path">
                        {it.path && highlight(it.path, query)}
                        {it.snippet && <em> · {highlight(it.snippet, query)}</em>}
                      </span>
                    )}
                  </span>
                  {it.badge && <span className="pill">{it.badge}</span>}
                  {i === active && !it.disabled && <Icon name="arrow" size={14} className="palette-enter" />}
                </button>
              </Fragment>
            );
          })}
        </div>
        <footer className="palette-foot">
          <span><Kbd>↑</Kbd> <Kbd>↓</Kbd> navigate</span>
          <span><Kbd>↵</Kbd> open</span>
          <span className="spacer" />
          <span>{query.trim() ? `${items.length} results` : 'Search across your whole workspace'}</span>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
