import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useMatch } from 'react-router-dom';
import { useStore } from '../store/store';
import { useUi } from '../store/ui';
import { domainStats } from '../store/selectors';
import { Icon, Logo } from './Icon';
import { Breadcrumbs, Kbd, type Crumb } from './primitives';
import { SearchCommand } from './SearchCommand';
import { NoteModal, QuestionModal, ResourceModal } from './Modals';
import { cn } from '../lib/utils';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
export const modKey = isMac ? '⌘' : 'Ctrl';

/* ───────── Sidebar ───────── */
function NavItem({
  to,
  icon,
  label,
  end,
  trailing,
}: {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
  trailing?: ReactNode;
}) {
  const { collapsed, setMobileNav } = useUi();
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      onClick={() => setMobileNav(false)}
      className={({ isActive }) => cn('nav-item', isActive && 'is-active')}
    >
      <Icon name={icon} size={17} />
      <span className="nav-label">{label}</span>
      {trailing && <span className="nav-trailing">{trailing}</span>}
    </NavLink>
  );
}

export function Sidebar() {
  const { state } = useStore();
  const { collapsed, toggleCollapsed, mobileNav, setMobileNav } = useUi();
  const { user } = state;
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);

  return (
    <>
      <div className={cn('scrim', mobileNav && 'is-open')} onClick={() => setMobileNav(false)} />
      <aside className={cn('sidebar', collapsed && 'is-collapsed', mobileNav && 'is-open')} aria-label="Primary">
        <div className="sidebar-head">
          <Link to="/" className="brand" onClick={() => setMobileNav(false)}>
            <Logo size={26} />
            <span className="brand-word">FIFI</span>
          </Link>
          <button className="icon-btn collapse-btn" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <Icon name="panel" size={16} />
          </button>
          <button className="icon-btn mobile-close" onClick={() => setMobileNav(false)} aria-label="Close menu">
            <Icon name="x" size={16} />
          </button>
        </div>

        <nav className="nav">
          <NavItem to="/" icon="home" label="Home" end />
          <NavItem to="/learning" icon="layers" label="My Learning" />
          <p className="nav-section">Domains</p>
          {state.domains.map((d) => (
            <NavItem
              key={d.id}
              to={`/d/${d.slug}`}
              icon={d.icon}
              label={d.name}
              trailing={<span className="num">{domainStats(state, d.id).progress}%</span>}
            />
          ))}
          <hr className="nav-divider" />
          <NavItem to="/notes" icon="file" label="Notes" />
          <NavItem to="/resources" icon="link" label="Resources" />
          <NavItem to="/revision" icon="refresh" label="Revision" trailing={<span className="count">{state.topics.filter((t) => t.status === 'needs_revision').length + state.questions.filter((q) => q.status === 'unresolved').length}</span>} />
          <hr className="nav-divider" />
          <NavItem to="/settings" icon="settings" label="Settings" />
        </nav>

        <div className="sidebar-foot">
          <div className="ai-slot" aria-disabled="true" title="Fifi AI — coming in V2">
            <Icon name="sparkle" size={16} />
            <div className="ai-slot-text">
              <span>Fifi AI</span>
              <small>Coming in V2</small>
            </div>
            <span className="pill">V2</span>
          </div>
          <div className="profile">
            <div className="avatar">{initials}</div>
            <div className="profile-text">
              <strong>{user.name}</strong>
              <span>{user.headline}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ───────── TopBar ───────── */
export function TopBar({ crumbs }: { crumbs: Crumb[] }) {
  const { setMobileNav, setSearchOpen, openNote, openResource, theme, cycleTheme } = useUi();
  const topicMatch = useMatch('/t/:topicId');
  const topicId = topicMatch?.params.topicId;
  const light = document.documentElement.getAttribute('data-theme') === 'light' || theme === 'light';
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={() => setMobileNav(true)} aria-label="Open menu">
        <Icon name="menu" size={18} />
      </button>
      <Breadcrumbs items={crumbs} />
      <div className="topbar-spacer" />
      <button className="searchbtn" onClick={() => setSearchOpen(true)} aria-label="Search">
        <Icon name="search" size={15} />
        <span>Search</span>
        <span className="searchbtn-keys">
          <Kbd>{modKey}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <button className="btn btn-ghost btn-sm hide-md" onClick={() => openResource({ topicId })}>
        <Icon name="link" size={14} /> Resource
      </button>
      <button className="btn btn-primary btn-sm" onClick={() => openNote({ topicId })}>
        <Icon name="plus" size={14} /> <span className="hide-xs">Note</span>
      </button>
      <button className="icon-btn" onClick={cycleTheme} aria-label="Toggle theme" title="Toggle theme">
        <Icon name={light ? 'moon' : 'sun'} size={16} />
      </button>
    </header>
  );
}

/* ───────── AppShell ───────── */
export function AppShell({ crumbs, children }: { crumbs: Crumb[]; children: ReactNode }) {
  const { setSearchOpen, searchOpen, setMobileNav } = useUi();
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    setMobileNav(false);
    if (!window.location.hash) window.scrollTo({ top: 0 });
  }, [pathname, setMobileNav]);

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <TopBar crumbs={crumbs} />
        <main className="content">{children}</main>
      </div>
      <SearchCommand />
      <ResourceModal />
      <NoteModal />
      <QuestionModal />
      <Toast />
    </div>
  );
}

function Toast() {
  const { toast } = useUi();
  return (
    <div className={cn('toast', toast && 'is-on')} role="status" aria-live="polite">
      <Icon name="check" size={14} /> {toast}
    </div>
  );
}

/* ───────── AI placeholder for the topic rail ───────── */
export function AiPlaceholder({ topicName }: { topicName: string }) {
  return (
    <div className="ai-card" aria-disabled="true">
      <div className="row between">
        <span className="ai-card-title">
          <Icon name="sparkle" size={14} /> Fifi AI
        </span>
        <span className="pill">Coming in V2</span>
      </div>
      <p>Soon you'll be able to ask questions about {topicName} using your own notes, resources and unresolved questions as context.</p>
      <div className="ai-card-input">
        <span>Ask about this topic…</span>
        <Icon name="arrow" size={13} />
      </div>
    </div>
  );
}
