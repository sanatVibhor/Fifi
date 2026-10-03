import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Concept, Note, Question, Resource, Topic } from '../types';
import { useStore } from '../store/store';
import { useUi } from '../store/ui';
import { Icon, resourceIcon } from './Icon';
import { ProgressBar, StatusMenu, TagList } from './primitives';
import { formatDate, timeAgo, cn } from '../lib/utils';
import { renderMarkdown, plainText } from '../lib/markdown';
import { hostLabel } from '../lib/urls';

/* ───────── TopicHeader ───────── */
export function TopicHeader({ topic }: { topic: Topic }) {
  const { state, setTopicStatus } = useStore();
  const resources = state.resources.filter((r) => r.topicId === topic.id).length;
  const notes = state.notes.filter((n) => n.topicId === topic.id).length;
  return (
    <header className="topichead">
      <h1>{topic.name}</h1>
      <p className="topichead-sub">{topic.subtitle}</p>
      <dl className="topichead-meta">
        <div>
          <dt>Status</dt>
          <dd>
            <StatusMenu value={topic.status} onChange={(s) => setTopicStatus(topic.id, s)} />
          </dd>
        </div>
        <div>
          <dt>Progress</dt>
          <dd className="progress-dd">
            <span className="num strong">{topic.progress}%</span>
            <ProgressBar value={topic.progress} size="sm" />
          </dd>
        </div>
        <div>
          <dt>Resources</dt>
          <dd className="num strong">{resources}</dd>
        </div>
        <div>
          <dt>Notes</dt>
          <dd className="num strong">{notes}</dd>
        </div>
        <div>
          <dt>Last studied</dt>
          <dd className="strong">{timeAgo(topic.lastStudiedAt)}</dd>
        </div>
      </dl>
    </header>
  );
}

/* ───────── Overview (editable) ───────── */
export function OverviewSection({ topic }: { topic: Topic }) {
  const { setOverview } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(topic.overview);
  return (
    <section id="overview" className="section">
      <SectionHead
        title="Overview"
        action={
          editing ? (
            <div className="row gap-sm">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setOverview(topic.id, draft.trim() || topic.summary);
                  setEditing(false);
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setDraft(topic.overview);
                setEditing(true);
              }}
            >
              <Icon name="edit" size={13} /> Edit
            </button>
          )
        }
      />
      {editing ? (
        <textarea className="input textarea" rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
      ) : (
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(topic.overview) }} />
      )}
    </section>
  );
}

export function SectionHead({
  title,
  count,
  action,
  hint,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="section-head">
      <div className="row gap-sm baseline">
        <h2>{title}</h2>
        {count !== undefined && <span className="count">{count}</span>}
        {hint && <span className="muted-sm hide-sm">{hint}</span>}
      </div>
      {action}
    </div>
  );
}

/* ───────── ConceptList + drawer ───────── */
export function ConceptList({ topic, concepts }: { topic: Topic; concepts: Concept[] }) {
  const { toggleConcept, addConcept } = useStore();
  const [active, setActive] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const activeConcept = concepts.find((c) => c.id === active) ?? null;
  const done = concepts.filter((c) => c.understood).length;

  const submit = () => {
    if (draft.trim()) addConcept(topic.id, draft.trim());
    setDraft('');
    setAdding(false);
  };

  return (
    <section id="concepts" className="section">
      <SectionHead
        title="Concepts"
        count={concepts.length}
        hint={`${done} understood`}
        action={
          <button className="btn btn-ghost btn-sm" onClick={() => setAdding(true)}>
            <Icon name="plus" size={13} /> Add concept
          </button>
        }
      />
      <ul className="concepts">
        {concepts.map((c) => (
          <li key={c.id} id={`concept-${c.id}`} className={cn('concept', c.understood && 'is-done')}>
            <button
              className="check"
              role="checkbox"
              aria-checked={c.understood}
              aria-label={`Mark ${c.name} as ${c.understood ? 'not understood' : 'understood'}`}
              onClick={() => toggleConcept(c.id)}
            >
              {c.understood && <Icon name="check" size={12} strokeWidth={3} />}
            </button>
            <button className="concept-name" onClick={() => setActive(c.id)}>
              {c.name}
              <Icon name="chevron-right" size={14} />
            </button>
          </li>
        ))}
        {adding && (
          <li className="concept concept-add">
            <input
              className="input"
              autoFocus
              placeholder="Concept name"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') setAdding(false);
              }}
              onBlur={submit}
            />
          </li>
        )}
      </ul>
      {activeConcept && <ConceptDrawer concept={activeConcept} topic={topic} onClose={() => setActive(null)} />}
    </section>
  );
}

function ConceptDrawer({ concept, topic, onClose }: { concept: Concept; topic: Topic; onClose: () => void }) {
  const { state, toggleConcept } = useStore();
  const { openNote, openQuestion } = useUi();
  const needle = concept.name.toLowerCase().split(/[\s(),]+/).filter((w) => w.length > 3);
  const mentions = (text: string) => needle.length > 0 && needle.some((w) => text.toLowerCase().includes(w));
  const notes = state.notes.filter((n) => n.topicId === topic.id && mentions(`${n.title} ${n.tags.join(' ')}`));
  const questions = state.questions.filter((q) => q.topicId === topic.id && mentions(`${q.question} ${q.tags.join(' ')}`));
  const live = state.concepts.find((c) => c.id === concept.id) ?? concept;

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={concept.name}>
        <header className="drawer-head">
          <span className="eyebrow">CONCEPT · {topic.name.toUpperCase()}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </header>
        <h3 className="drawer-title">{concept.name}</h3>
        <p className="drawer-summary">{concept.summary ?? 'No description yet. Capture your own understanding in a note below.'}</p>

        <button className={cn('btn', live.understood ? 'btn-ghost' : 'btn-primary')} onClick={() => toggleConcept(concept.id)}>
          <Icon name="check" size={14} /> {live.understood ? 'Marked as understood' : 'Mark as understood'}
        </button>

        <div className="drawer-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => { onClose(); openNote({ topicId: topic.id, tags: [concept.name.toLowerCase()], title: concept.name }); }}>
            <Icon name="file" size={13} /> Write note
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { onClose(); openQuestion({ topicId: topic.id, tags: [concept.name.toLowerCase()] }); }}>
            <Icon name="help" size={13} /> Add question
          </button>
        </div>

        <h4 className="drawer-sub">Related in this topic</h4>
        {notes.length + questions.length === 0 && <p className="muted-sm">Nothing linked yet.</p>}
        <ul className="drawer-list">
          {notes.map((n) => (
            <li key={n.id}>
              <Link to={`/t/${topic.id}#note-${n.id}`} onClick={onClose}>
                <Icon name="file" size={13} /> {n.title}
              </Link>
            </li>
          ))}
          {questions.map((q) => (
            <li key={q.id}>
              <Link to={`/t/${topic.id}#question-${q.id}`} onClick={onClose}>
                <Icon name="help" size={13} /> {q.question}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}

/* ───────── ResourceCard ───────── */
export function ResourceCard({ resource, topicName }: { resource: Resource; topicName?: string }) {
  const { deleteResource } = useStore();
  const { notify } = useUi();
  return (
    <article id={`resource-${resource.id}`} className="resource">
      <div className={cn('resource-icon', `rt-${resource.type}`)}>
        <Icon name={resourceIcon(resource.type)} size={16} />
      </div>
      <div className="resource-body">
        <div className="row gap-sm wrap">
          <span className="resource-type">{resource.type}</span>
          <span className="muted-sm">{hostLabel(resource.url)}</span>
          {topicName && <span className="muted-sm">· {topicName}</span>}
        </div>
        <a href={resource.url} target="_blank" rel="noreferrer noopener" className="resource-title">
          {resource.title}
          <Icon name="external" size={12} />
        </a>
        {resource.description && <p className="resource-desc">{resource.description}</p>}
        <div className="row between wrap gap-sm">
          <TagList tags={resource.tags} />
          <span className="muted-sm">Added {formatDate(resource.addedAt)}</span>
        </div>
      </div>
      <div className="resource-actions">
        <button
          className="icon-btn"
          aria-label="Copy link"
          onClick={() => {
            navigator.clipboard?.writeText(resource.url).then(() => notify('Link copied'), () => undefined);
          }}
        >
          <Icon name="copy" size={14} />
        </button>
        <button
          className="icon-btn danger"
          aria-label="Delete resource"
          onClick={() => {
            if (confirm(`Remove “${resource.title}”?`)) deleteResource(resource.id);
          }}
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </article>
  );
}

/* ───────── NoteCard ───────── */
export function NoteCard({
  note,
  topicName,
  defaultOpen,
}: {
  note: Note;
  topicName?: string;
  defaultOpen?: boolean;
}) {
  const { deleteNote } = useStore();
  const { openNote } = useUi();
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <article id={`note-${note.id}`} className={cn('note', open && 'is-open')}>
      <button className="note-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="note-title">
          <Icon name="chevron-right" size={14} className="note-chev" />
          <h4>{note.title}</h4>
        </div>
        <div className="note-meta">
          {topicName && <span>{topicName}</span>}
          <span>Updated {timeAgo(note.updatedAt)}</span>
        </div>
      </button>
      {!open && <p className="note-preview">{plainText(note.content)}</p>}
      {open && (
        <div className="note-body">
          <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }} />
          <div className="note-foot">
            <TagList tags={note.tags} />
            <span className="muted-sm">
              Created {formatDate(note.createdAt)} · Updated {formatDate(note.updatedAt)}
            </span>
            <div className="row gap-sm">
              <button className="btn btn-ghost btn-sm" onClick={() => openNote({ note })}>
                <Icon name="edit" size={13} /> Edit
              </button>
              <button
                className="btn btn-ghost btn-sm danger"
                onClick={() => {
                  if (confirm(`Delete “${note.title}”?`)) deleteNote(note.id);
                }}
              >
                <Icon name="trash" size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {!open && note.tags.length > 0 && (
        <div className="note-tags">
          <TagList tags={note.tags} />
        </div>
      )}
    </article>
  );
}

/* ───────── QuestionCard ───────── */
export function QuestionCard({ question, topicName }: { question: Question; topicName?: string }) {
  const { updateQuestion } = useStore();
  const { openQuestion } = useUi();
  const understood = question.status === 'understood';
  return (
    <article id={`question-${question.id}`} className={cn('question', understood && 'is-understood')}>
      <button
        className={cn('check check-lg', understood && 'is-on')}
        role="checkbox"
        aria-checked={understood}
        aria-label={understood ? 'Mark as unresolved' : 'Mark as understood'}
        onClick={() => updateQuestion(question.id, { status: understood ? 'unresolved' : 'understood' })}
      >
        {understood && <Icon name="check" size={12} strokeWidth={3} />}
      </button>
      <div className="question-body">
        <div className="row between gap-sm">
          <h4>{question.question}</h4>
          <button className="icon-btn" aria-label="Edit question" onClick={() => openQuestion({ question })}>
            <Icon name="edit" size={14} />
          </button>
        </div>
        {question.answer ? (
          <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(question.answer) }} />
        ) : (
          <button className="link-btn" onClick={() => openQuestion({ question })}>
            Add your answer or working notes
          </button>
        )}
        <div className="row between wrap gap-sm">
          <div className="row gap-sm wrap">
            <span className={cn('qstatus', understood ? 'q-ok' : 'q-open')}>{understood ? 'Understood' : 'Unresolved'}</span>
            {topicName && <span className="muted-sm">{topicName}</span>}
            <TagList tags={question.tags} />
          </div>
          <span className="muted-sm">{formatDate(question.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}
