import { Link } from 'react-router-dom';
import type { Domain, Status, Topic } from '../types';
import { computeStats, domainStats, topicsOf, type Suggestion } from '../store/selectors';
import { useStore } from '../store/store';
import { Icon } from './Icon';
import { ProgressBar, ProgressRing } from './primitives';
import { cn, plural, timeAgo } from '../lib/utils';

/* ───────── TopicMap: one cell per topic, coloured by status ───────── */
export function TopicMap({ topics }: { topics: Topic[] }) {
  return (
    <div className="topicmap" aria-hidden="true">
      {topics.map((t) => (
        <i key={t.id} className={cn('cell', `cell-${t.status}`)} title={t.name} />
      ))}
    </div>
  );
}

/* ───────── DomainCard ───────── */
export function DomainCard({ domain }: { domain: Domain }) {
  const { state } = useStore();
  const topics = topicsOf(state, domain.id);
  const stats = domainStats(state, domain.id);
  return (
    <Link to={`/d/${domain.slug}`} className="domaincard">
      <div className="domaincard-glow" />
      <div className="domaincard-top">
        <span className="domaincard-index">{domain.index}</span>
        <span className="domaincard-go">
          <Icon name="arrow-up-right" size={16} />
        </span>
      </div>
      <div className="domaincard-body">
        <p className="eyebrow">{domain.name.toUpperCase()}</p>
        <h3>{domain.tagline}</h3>
      </div>
      <TopicMap topics={topics} />
      <div className="domaincard-foot">
        <div className="domaincard-progress">
          <div className="row between">
            <span className="muted-sm">Progress</span>
            <span className="num">{stats.progress}%</span>
          </div>
          <ProgressBar value={stats.progress} size="sm" />
        </div>
        <dl className="domaincard-stats">
          <div>
            <dt>Topics</dt>
            <dd>{stats.total}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{stats.completed} completed</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}

/* ───────── ProgressOverview ───────── */
export function ProgressOverview() {
  const { state } = useStore();
  const s = computeStats(state.topics);
  const cells: { label: string; value: string | number; sub?: string; icon?: string }[] = [
    { label: 'Topics completed', value: s.completed, sub: `of ${s.total}` },
    { label: 'In progress', value: s.inProgress, sub: 'actively studying' },
    { label: 'To revisit', value: s.revision, sub: 'need revision' },
    { label: 'Study streak', value: state.user.streak, sub: 'days', icon: 'flame' },
  ];
  return (
    <section className="overview" aria-label="Overall progress">
      <div className="overview-main">
        <ProgressRing value={s.progress} size={64} stroke={5} />
        <div>
          <p className="muted-sm">Overall progress</p>
          <p className="overview-big">
            {s.progress}
            <span>%</span>
          </p>
        </div>
      </div>
      {cells.map((c) => (
        <div key={c.label} className="overview-cell">
          <p className="muted-sm">{c.label}</p>
          <p className="overview-num">
            {c.icon && <Icon name={c.icon} size={16} className="flame" />}
            {c.value}
            <span>{c.sub}</span>
          </p>
        </div>
      ))}
    </section>
  );
}

/* ───────── DomainProgressList (compact bars used in sidebar-adjacent places) ───────── */
export function DomainProgressList() {
  const { state } = useStore();
  return (
    <div className="dprogress">
      {state.domains.map((d) => {
        const s = domainStats(state, d.id);
        return (
          <Link key={d.id} to={`/d/${d.slug}`} className="dprogress-row">
            <span className="dprogress-name">{d.name}</span>
            <ProgressBar value={s.progress} size="xs" />
            <span className="num">{s.progress}%</span>
          </Link>
        );
      })}
    </div>
  );
}

/* ───────── UpNext: answers "what should I study next?" ───────── */
const KIND: Record<Suggestion['kind'], { label: string; icon: string; cta: string }> = {
  continue: { label: 'Continue', icon: 'play', cta: 'Resume' },
  revisit: { label: 'Revisit', icon: 'refresh', cta: 'Review' },
  start: { label: 'Start', icon: 'target', cta: 'Begin' },
};

export function UpNext({ suggestions }: { suggestions: Suggestion[] }) {
  const { state } = useStore();
  if (!suggestions.length) return null;
  return (
    <section>
      <div className="section-head">
        <h2>Up next</h2>
        <span className="muted-sm">Suggested from your progress</span>
      </div>
      <div className="upnext">
        {suggestions.map((s) => {
          const k = KIND[s.kind];
          const d = state.domains.find((x) => x.id === s.topic.domainId)!;
          return (
            <Link key={s.topic.id} to={`/t/${s.topic.id}`} className="upnext-card">
              <div className="row between">
                <span className="upnext-kind">
                  <Icon name={k.icon} size={12} /> {k.label}
                </span>
                <span className="muted-sm">{d.name}</span>
              </div>
              <h3>{s.topic.name}</h3>
              <p className="muted-sm">{s.reason}</p>
              <div className="upnext-foot">
                {s.topic.progress > 0 ? <ProgressBar value={s.topic.progress} size="xs" /> : <span className="muted-sm">Not started</span>}
                <span className="upnext-cta">
                  {k.cta} <Icon name="arrow" size={13} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export const statusSummary = (t: Topic, status: Status) => `${plural(t.progress, 'point')} ${status} ${timeAgo(t.lastStudiedAt)}`;
