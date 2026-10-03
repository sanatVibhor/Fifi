import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { byRecentlyStudied } from '../store/selectors';
import { EmptyState, ProgressBar, TopicStatus } from '../components/primitives';
import { TopicList } from '../components/TopicList';
import { SectionHead } from '../components/Workspace';
import { cn, timeAgo } from '../lib/utils';
import { STATUS_LABEL, type Status, type Topic } from '../types';

type Sort = 'recent' | 'progress' | 'domain';

export default function Learning() {
  const { state } = useStore();
  const [domain, setDomain] = useState('all');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [sort, setSort] = useState<Sort>('recent');

  const filtered = useMemo(
    () => state.topics.filter((t) => (domain === 'all' || t.domainId === domain) && (status === 'all' || t.status === status)),
    [state.topics, domain, status],
  );

  const sorter = (a: Topic, b: Topic) => {
    if (sort === 'progress') return b.progress - a.progress;
    if (sort === 'domain') return a.order - b.order;
    return byRecentlyStudied(a, b);
  };

  const continueTopics = [...state.topics]
    .filter((t) => t.lastOpenedAt && t.status !== 'not_started' && (domain === 'all' || t.domainId === domain))
    .sort((a, b) => +new Date(b.lastOpenedAt!) - +new Date(a.lastOpenedAt!))
    .slice(0, 4);

  const sections: { key: Status; title: string; hint: string; limit?: number }[] = [
    { key: 'in_progress', title: 'In Progress', hint: 'Currently being studied' },
    { key: 'needs_revision', title: 'Needs Revision', hint: 'Marked for another pass' },
    { key: 'completed', title: 'Completed', hint: 'Recently completed', limit: 8 },
  ];

  return (
    <div className="page">
      <header className="pagehead">
        <h1>My Learning</h1>
        <p className="hero-sub">Everything you are studying, in one place.</p>
      </header>

      <div className="toolbar">
        <div className="filters">
          <button className={cn('chip', domain === 'all' && 'is-on')} onClick={() => setDomain('all')}>All domains</button>
          {state.domains.map((d) => (
            <button key={d.id} className={cn('chip', domain === d.id && 'is-on')} onClick={() => setDomain(d.id)}>
              {d.name}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <div className="select-wrap select-sm">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as Status | 'all')} aria-label="Filter by status">
              <option value="all">All statuses</option>
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
          <div className="select-wrap select-sm">
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
              <option value="recent">Recently studied</option>
              <option value="progress">Progress</option>
              <option value="domain">Domain order</option>
            </select>
          </div>
        </div>
      </div>

      {status === 'all' && continueTopics.length > 0 && (
        <section>
          <SectionHead title="Continue Learning" hint="Recently opened" />
          <div className="continue">
            {continueTopics.map((t) => (
              <Link key={t.id} to={`/t/${t.id}`} className="continue-card">
                <div className="row between">
                  <TopicStatus status={t.status} compact />
                  <span className="muted-sm">{timeAgo(t.lastOpenedAt)}</span>
                </div>
                <h3>{t.name}</h3>
                <p className="muted-sm clamp-2">{t.summary}</p>
                <div className="row gap-sm">
                  <ProgressBar value={t.progress} size="xs" />
                  <span className="num">{t.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {sections
        .filter((s) => status === 'all' || status === s.key)
        .map((s) => {
          const all = filtered.filter((t) => t.status === s.key).sort(sorter);
          const items = status === 'all' && s.limit ? all.slice(0, s.limit) : all;
          return (
            <section key={s.key}>
              <SectionHead title={s.title} count={all.length} hint={s.hint} />
              {items.length ? (
                <TopicList topics={items} showDomain />
              ) : (
                <EmptyState icon="layers" title={`No ${s.title.toLowerCase()} topics`} hint="Adjust the filters or change a topic's status." />
              )}
            </section>
          );
        })}

      {status === 'not_started' && (
        <section>
          <SectionHead title="Not Started" count={filtered.length} />
          {filtered.length ? <TopicList topics={filtered.sort(sorter)} showDomain /> : <EmptyState title="Nothing here" />}
        </section>
      )}
    </div>
  );
}
