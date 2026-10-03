import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { STATUS_LABEL, STATUS_ORDER, type Status } from '../types';
import { cn } from '../lib/utils';
import { Icon } from './Icon';

/* ───────── ProgressBar ───────── */
export function ProgressBar({
  value,
  size = 'md',
  tone = 'accent',
  className,
}: {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  tone?: 'accent' | Status;
  className?: string;
}) {
  return (
    <div
      className={cn('pbar', `pbar-${size}`, `tone-${tone}`, className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="pbar-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ───────── ProgressRing ───────── */
export function ProgressRing({
  value,
  size = 56,
  stroke = 4,
  label = true,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-value"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {label && <span className="ring-label">{value}%</span>}
    </div>
  );
}

/* ───────── TopicStatus ───────── */
export function TopicStatus({ status, compact }: { status: Status; compact?: boolean }) {
  return (
    <span className={cn('status', `status-${status}`, compact && 'status-compact')}>
      <i className="status-dot" />
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ───────── Popover helper ───────── */
function useOutside(ref: React.RefObject<HTMLElement>, on: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && on();
    const k = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && on();
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', k);
    };
  }, [ref, on, active]);
}

export function StatusMenu({ value, onChange }: { value: Status; onChange: (s: Status) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  return (
    <div className="menu-wrap" ref={ref}>
      <button className={cn('status-btn', `status-${value}`)} onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <i className="status-dot" />
        {STATUS_LABEL[value]}
        <Icon name="chevron-down" size={13} />
      </button>
      {open && (
        <div className="menu" role="listbox">
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              role="option"
              aria-selected={s === value}
              className={cn('menu-item', s === value && 'is-active')}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
            >
              <span className={cn('status', `status-${s}`)}>
                <i className="status-dot" />
                {STATUS_LABEL[s]}
              </span>
              {s === value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── Breadcrumbs ───────── */
export interface Crumb {
  label: string;
  to?: string;
}
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => (
        <span key={i} className="crumb">
          {i > 0 && <Icon name="chevron-right" size={12} className="crumb-sep" />}
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}

/* ───────── EmptyState ───────── */
export function EmptyState({
  icon = 'layers',
  title,
  hint,
  action,
}: {
  icon?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={18} />
      </div>
      <p className="empty-title">{title}</p>
      {hint && <p className="empty-hint">{hint}</p>}
      {action}
    </div>
  );
}

/* ───────── Tags ───────── */
export function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <span className="tags">
      {tags.map((t) => (
        <span key={t} className="tag">
          {t}
        </span>
      ))}
    </span>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder = 'Add tag and press Enter',
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const t = draft.trim().replace(/^#/, '').toLowerCase();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="taginput" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      {value.map((t) => (
        <span key={t} className="tag tag-removable">
          {t}
          <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((x) => x !== t))}>
            <Icon name="x" size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={value.length ? '' : placeholder}
      />
    </div>
  );
}

/* ───────── Modal ───────── */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', k);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={cn('modal', `modal-${size}`)} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

export const Field = ({
  label,
  hint,
  children,
  optional,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  optional?: boolean;
}) => (
  <label className="field">
    <span className="field-label">
      {label}
      {optional && <em>Optional</em>}
    </span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);

export const Kbd = ({ children }: { children: ReactNode }) => <kbd className="kbd">{children}</kbd>;
