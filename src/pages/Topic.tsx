import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { useUi } from '../store/ui';
import { Icon } from '../components/Icon';
import { EmptyState, ProgressRing } from '../components/primitives';
import {
  ConceptList,
  NoteCard,
  OverviewSection,
  QuestionCard,
  ResourceCard,
  SectionHead,
  TopicHeader,
} from '../components/Workspace';
import { AiPlaceholder } from '../components/Shell';
import NotFound from './NotFound';

const SECTIONS = [
  ['overview', 'Overview'],
  ['concepts', 'Concepts'],
  ['resources', 'Resources'],
  ['notes', 'Notes'],
  ['questions', 'Questions'],
] as const;

export default function TopicPage() {
  const { topicId } = useParams();
  const { hash } = useLocation();
  const { state, openTopic } = useStore();
  const { openResource, openNote, openQuestion } = useUi();
  const topic = state.topics.find((t) => t.id === topicId);

  useEffect(() => {
    if (topic) openTopic(topic.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id]);

  // Deep links from search (#note-…, #concept-…) scroll and briefly highlight their target.
  useEffect(() => {
    if (!hash || !topic) return;
    const id = hash.slice(1);
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('flash');
      setTimeout(() => el.classList.remove('flash'), 1800);
    }, 80);
    return () => clearTimeout(t);
  }, [hash, topic?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const concepts = useMemo(
    () => state.concepts.filter((c) => c.topicId === topicId).sort((a, b) => a.order - b.order),
    [state.concepts, topicId],
  );

  if (!topic) return <NotFound />;

  const resources = state.resources.filter((r) => r.topicId === topic.id).sort((a, b) => +new Date(b.addedAt) - +new Date(a.addedAt));
  const notes = state.notes.filter((n) => n.topicId === topic.id).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  const questions = state.questions
    .filter((q) => q.topicId === topic.id)
    .sort((a, b) => Number(a.status === 'understood') - Number(b.status === 'understood'));
  const nextConcept = concepts.find((c) => !c.understood);
  const openQs = questions.filter((q) => q.status === 'unresolved').length;
  const hashId = hash.slice(1);

  return (
    <div className="page page-topic">
      <TopicHeader topic={topic} />

      <nav className="sectionnav" aria-label="Sections">
        {SECTIONS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="topic-grid">
        <div className="topic-main">
          <OverviewSection key={topic.id + topic.overview} topic={topic} />
          <ConceptList topic={topic} concepts={concepts} />

          <section id="resources" className="section">
            <SectionHead
              title="Resources"
              count={resources.length}
              action={
                <button className="btn btn-ghost btn-sm" onClick={() => openResource({ topicId: topic.id })}>
                  <Icon name="plus" size={13} /> Add resource
                </button>
              }
            />
            {resources.length ? (
              <div className="stack">
                {resources.map((r) => (
                  <ResourceCard key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="link"
                title="No resources yet"
                hint="Paste a ChatGPT conversation, article, video or paper you want to keep."
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => openResource({ topicId: topic.id })}>
                    <Icon name="plus" size={13} /> Add resource
                  </button>
                }
              />
            )}
          </section>

          <section id="notes" className="section">
            <SectionHead
              title="Notes"
              count={notes.length}
              action={
                <button className="btn btn-ghost btn-sm" onClick={() => openNote({ topicId: topic.id })}>
                  <Icon name="plus" size={13} /> New note
                </button>
              }
            />
            {notes.length ? (
              <div className="stack">
                {notes.map((n) => (
                  <NoteCard key={n.id} note={n} defaultOpen={hashId === `note-${n.id}`} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="file"
                title="No notes yet"
                hint="Write down the intuition in your own words — Markdown is supported."
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => openNote({ topicId: topic.id })}>
                    <Icon name="plus" size={13} /> New note
                  </button>
                }
              />
            )}
          </section>

          <section id="questions" className="section">
            <SectionHead
              title="Questions / Things to Revisit"
              count={questions.length}
              action={
                <button className="btn btn-ghost btn-sm" onClick={() => openQuestion({ topicId: topic.id })}>
                  <Icon name="plus" size={13} /> Add question
                </button>
              }
            />
            {questions.length ? (
              <div className="stack">
                {questions.map((q) => (
                  <QuestionCard key={q.id} question={q} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="help"
                title="Nothing flagged for revision"
                hint="When something doesn't click, capture the question here so you can come back to it."
                action={
                  <button className="btn btn-primary btn-sm" onClick={() => openQuestion({ topicId: topic.id })}>
                    <Icon name="plus" size={13} /> Add question
                  </button>
                }
              />
            )}
          </section>
        </div>

        <aside className="topic-rail">
          <div className="rail-card">
            <div className="row gap-md">
              <ProgressRing value={topic.progress} size={56} stroke={4} />
              <div>
                <p className="rail-title">
                  {concepts.filter((c) => c.understood).length} of {concepts.length} concepts
                </p>
                <p className="muted-sm">{openQs ? `${openQs} open question${openQs > 1 ? 's' : ''}` : 'No open questions'}</p>
              </div>
            </div>
            {nextConcept && (
              <button
                className="rail-next"
                onClick={() => {
                  const el = document.getElementById(`concept-${nextConcept.id}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  el?.classList.add('flash');
                  setTimeout(() => el?.classList.remove('flash'), 1800);
                }}
              >
                <span className="muted-sm">Next concept</span>
                <strong>{nextConcept.name}</strong>
              </button>
            )}
          </div>

          <div className="rail-card rail-actions">
            <p className="rail-title">Quick add</p>
            <button className="btn btn-ghost btn-block" onClick={() => openResource({ topicId: topic.id })}>
              <Icon name="link" size={14} /> Resource
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => openNote({ topicId: topic.id })}>
              <Icon name="file" size={14} /> Note
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => openQuestion({ topicId: topic.id })}>
              <Icon name="help" size={14} /> Question to revisit
            </button>
          </div>

          <AiPlaceholder topicName={topic.name} />
        </aside>
      </div>
    </div>
  );
}
