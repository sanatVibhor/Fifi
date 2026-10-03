import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { useUi } from '../store/ui';
import { EmptyState, TopicStatus } from '../components/primitives';
import { Icon, resourceIcon } from '../components/Icon';
import { NoteCard, QuestionCard, ResourceCard, SectionHead } from '../components/Workspace';
import { RESOURCE_TYPES, type ResourceType, type Status } from '../types';
import { cn, timeAgo } from '../lib/utils';
import { plainText } from '../lib/markdown';

const SearchBox = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div className="filterbox">
    <Icon name="search" size={14} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
  </div>
);

/* ───────── Notes ───────── */
export function NotesPage() {
  const { state } = useStore();
  const { openNote } = useUi();
  const [q, setQ] = useState('');
  const [domain, setDomain] = useState('all');
  const topicName = (id: string) => state.topics.find((t) => t.id === id)?.name ?? '';
  const topicDomain = (id: string) => state.topics.find((t) => t.id === id)?.domainId;

  const notes = useMemo(
    () =>
      state.notes
        .filter((n) => domain === 'all' || topicDomain(n.topicId) === domain)
        .filter((n) => !q || `${n.title} ${plainText(n.content)} ${n.tags.join(' ')} ${topicName(n.topicId)}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [state, q, domain], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="page">
      <header className="pagehead row between wrap">
        <div>
          <h1>Notes</h1>
          <p className="hero-sub">{state.notes.length} notes across {new Set(state.notes.map((n) => n.topicId)).size} topics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openNote()}>
          <Icon name="plus" size={14} /> New note
        </button>
      </header>
      <div className="toolbar">
        <div className="filters">
          <button className={cn('chip', domain === 'all' && 'is-on')} onClick={() => setDomain('all')}>All</button>
          {state.domains.map((d) => (
            <button key={d.id} className={cn('chip', domain === d.id && 'is-on')} onClick={() => setDomain(d.id)}>{d.name}</button>
          ))}
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Filter notes…" />
      </div>
      {notes.length ? (
        <div className="stack">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} topicName={topicName(n.topicId)} />
          ))}
        </div>
      ) : (
        <EmptyState icon="file" title="No notes found" hint="Try a different filter, or write a new note." />
      )}
    </div>
  );
}

/* ───────── Resources ───────── */
export function ResourcesPage() {
  const { state } = useStore();
  const { openResource } = useUi();
  const [q, setQ] = useState('');
  const [type, setType] = useState<ResourceType | 'all'>('all');
  const topicName = (id: string) => state.topics.find((t) => t.id === id)?.name ?? '';

  const resources = useMemo(
    () =>
      state.resources
        .filter((r) => type === 'all' || r.type === type)
        .filter((r) => !q || `${r.title} ${r.description} ${r.tags.join(' ')} ${r.url} ${topicName(r.topicId)}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt)),
    [state, q, type], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="page">
      <header className="pagehead row between wrap">
        <div>
          <h1>Resources</h1>
          <p className="hero-sub">Every link you've saved — conversations, papers, videos and docs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openResource()}>
          <Icon name="plus" size={14} /> Add resource
        </button>
      </header>
      <div className="toolbar">
        <div className="filters">
          <button className={cn('chip', type === 'all' && 'is-on')} onClick={() => setType('all')}>
            All <span>{state.resources.length}</span>
          </button>
          {RESOURCE_TYPES.map((t) => {
            const n = state.resources.filter((r) => r.type === t).length;
            if (!n) return null;
            return (
              <button key={t} className={cn('chip', type === t && 'is-on')} onClick={() => setType(t)}>
                <Icon name={resourceIcon(t)} size={13} /> {t} <span>{n}</span>
              </button>
            );
          })}
        </div>
        <SearchBox value={q} onChange={setQ} placeholder="Filter resources…" />
      </div>
      {resources.length ? (
        <div className="stack">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} topicName={topicName(r.topicId)} />
          ))}
        </div>
      ) : (
        <EmptyState icon="link" title="No resources found" hint="Paste a link to start your library." />
      )}
    </div>
  );
}

/* ───────── Revision ───────── */
export function RevisionPage() {
  const { state } = useStore();
  const { openQuestion } = useUi();
  const [showDone, setShowDone] = useState(false);
  const topicName = (id: string) => state.topics.find((t) => t.id === id)?.name ?? '';

  const topics = state.topics.filter((t) => t.status === 'needs_revision');
  const unresolved = state.questions.filter((q) => q.status === 'unresolved').sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const understood = state.questions.filter((q) => q.status === 'understood');

  return (
    <div className="page">
      <header className="pagehead row between wrap">
        <div>
          <h1>Revision</h1>
          <p className="hero-sub">Topics to revisit and questions that haven't clicked yet.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openQuestion()}>
          <Icon name="plus" size={14} /> Add question
        </button>
      </header>

      <section>
        <SectionHead title="Topics needing revision" count={topics.length} />
        {topics.length ? (
          <div className="revgrid">
            {topics.map((t) => {
              const open = state.questions.filter((q) => q.topicId === t.id && q.status === 'unresolved').length;
              return (
                <Link key={t.id} to={`/t/${t.id}`} className="continue-card">
                  <div className="row between">
                    <TopicStatus status={t.status as Status} compact />
                    <span className="muted-sm">{timeAgo(t.lastStudiedAt)}</span>
                  </div>
                  <h3>{t.name}</h3>
                  <p className="muted-sm clamp-2">{t.summary}</p>
                  <span className="muted-sm">{open ? `${open} open question${open > 1 ? 's' : ''}` : 'No open questions'}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="refresh" title="Nothing needs revision" hint="Mark a topic as “Needs Revision” from its workspace." />
        )}
      </section>

      <section>
        <SectionHead title="Unresolved questions" count={unresolved.length} />
        {unresolved.length ? (
          <div className="stack">
            {unresolved.map((q) => (
              <QuestionCard key={q.id} question={q} topicName={topicName(q.topicId)} />
            ))}
          </div>
        ) : (
          <EmptyState icon="check" title="All caught up" hint="No unresolved questions." />
        )}
      </section>

      {understood.length > 0 && (
        <section>
          <SectionHead
            title="Understood"
            count={understood.length}
            action={
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDone((s) => !s)}>
                {showDone ? 'Hide' : 'Show'}
              </button>
            }
          />
          {showDone && (
            <div className="stack">
              {understood.map((q) => (
                <QuestionCard key={q.id} question={q} topicName={topicName(q.topicId)} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
