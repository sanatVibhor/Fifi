import { Link } from 'react-router-dom';
import type { Topic } from '../types';
import { useStore } from '../store/store';
import { noteCount, resourceCount } from '../store/selectors';
import { Icon } from './Icon';
import { ProgressBar, TopicStatus } from './primitives';
import { timeAgo } from '../lib/utils';

/* ───────── TopicCard (a single row) ───────── */
export function TopicCard({ topic, showDomain }: { topic: Topic; showDomain?: boolean }) {
  const { state } = useStore();
  const domain = state.domains.find((d) => d.id === topic.domainId)!;
  const resources = resourceCount(state, topic.id);
  const notes = noteCount(state, topic.id);
  return (
    <Link to={`/t/${topic.id}`} className="topicrow">
      <div className="topicrow-main">
        <h4>
          {topic.name}
          {showDomain && <span className="topicrow-domain">{domain.name}</span>}
        </h4>
        <p>{topic.summary}</p>
      </div>
      <div className="topicrow-status">
        <TopicStatus status={topic.status} />
      </div>
      <div className="topicrow-progress">
        <ProgressBar value={topic.progress} size="xs" tone={topic.status === 'completed' ? 'completed' : 'accent'} />
        <span className="num">{topic.progress}%</span>
      </div>
      <div className="topicrow-meta">
        <span title="Resources">
          <Icon name="link" size={13} /> {resources}
        </span>
        <span title="Notes">
          <Icon name="file" size={13} /> {notes}
        </span>
        <span className="topicrow-when" title="Last studied">
          <Icon name="clock" size={13} /> {timeAgo(topic.lastStudiedAt)}
        </span>
      </div>
      <Icon name="chevron-right" size={15} className="topicrow-chev" />
    </Link>
  );
}

/* ───────── TopicList: optionally grouped ───────── */
export function TopicList({
  topics,
  grouped,
  showDomain,
}: {
  topics: Topic[];
  grouped?: boolean;
  showDomain?: boolean;
}) {
  if (!grouped) {
    return (
      <div className="topiclist">
        {topics.map((t) => (
          <TopicCard key={t.id} topic={t} showDomain={showDomain} />
        ))}
      </div>
    );
  }
  const groups: string[] = [];
  topics.forEach((t) => groups.includes(t.group) || groups.push(t.group));
  return (
    <div className="topicgroups">
      {groups.map((g) => {
        const items = topics.filter((t) => t.group === g);
        return (
          <section key={g}>
            <div className="group-head">
              <h3>{g}</h3>
              <span className="muted-sm">
                {items.filter((t) => t.status === 'completed').length}/{items.length}
              </span>
            </div>
            <div className="topiclist">
              {items.map((t) => (
                <TopicCard key={t.id} topic={t} showDomain={showDomain} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
