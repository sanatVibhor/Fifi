import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { domainStats, lastStudied, topicsOf } from '../store/selectors';
import { ProgressBar, EmptyState } from '../components/primitives';
import { TopicList } from '../components/TopicList';
import { TopicMap } from '../components/Dashboard';
import { cn, timeAgo } from '../lib/utils';
import { STATUS_LABEL, STATUS_ORDER, type Status } from '../types';
import NotFound from './NotFound';

export default function DomainPage() {
  const { slug } = useParams();
  const { state } = useStore();
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const domain = state.domains.find((d) => d.slug === slug);
  if (!domain) return <NotFound />;

  const all = topicsOf(state, domain.id);
  const stats = domainStats(state, domain.id);
  const recent = lastStudied(all);
  const topics = filter === 'all' ? all : all.filter((t) => t.status === filter);
  const remaining = stats.total - stats.completed;

  return (
    <div className="page">
      <header className="domainhead">
        <p className="eyebrow">
          {domain.index} — DOMAIN
        </p>
        <h1>{domain.name}</h1>
        <p className="hero-sub">{domain.description}</p>

        <div className="domainhead-panel">
          <div className="domainhead-progress">
            <div className="row between">
              <span className="muted-sm">Overall progress</span>
              <span className="num strong">{stats.progress}%</span>
            </div>
            <ProgressBar value={stats.progress} size="lg" />
            <TopicMap topics={all} />
          </div>
          <dl className="stat-grid">
            <div>
              <dt>Completed</dt>
              <dd>{stats.completed}<span>/ {stats.total}</span></dd>
            </div>
            <div>
              <dt>Remaining</dt>
              <dd>{remaining}</dd>
            </div>
            <div className="stat-wide">
              <dt>Last studied</dt>
              <dd className="stat-link">
                {recent ? (
                  <>
                    <Link to={`/t/${recent.id}`}>{recent.name}</Link>
                    <span className="muted-sm"> · {timeAgo(recent.lastStudiedAt)}</span>
                  </>
                ) : (
                  <span className="muted-sm">Nothing yet</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="filters" role="tablist" aria-label="Filter topics by status">
        <button className={cn('chip', filter === 'all' && 'is-on')} onClick={() => setFilter('all')}>
          All <span>{all.length}</span>
        </button>
        {STATUS_ORDER.map((s) => (
          <button key={s} className={cn('chip', filter === s && 'is-on')} onClick={() => setFilter(s)}>
            <i className={cn('status-dot', `status-${s}`)} />
            {STATUS_LABEL[s]} <span>{all.filter((t) => t.status === s).length}</span>
          </button>
        ))}
      </div>

      {topics.length ? (
        <TopicList topics={topics} grouped />
      ) : (
        <EmptyState icon="layers" title="No topics match this filter" hint="Change a topic's status from its workspace." />
      )}
    </div>
  );
}
