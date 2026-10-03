import type { Domain, Snapshot, Status, Topic } from '../types';

export interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  revision: number;
  notStarted: number;
  /** Mean topic progress, 0–100 */
  progress: number;
}

export const computeStats = (topics: Topic[]): Stats => {
  const count = (s: Status) => topics.filter((t) => t.status === s).length;
  const total = topics.length;
  const sum = topics.reduce((a, t) => a + t.progress, 0);
  return {
    total,
    completed: count('completed'),
    inProgress: count('in_progress'),
    revision: count('needs_revision'),
    notStarted: count('not_started'),
    progress: total ? Math.round(sum / total) : 0,
  };
};

export const topicsOf = (s: Snapshot, domainId: string) => s.topics.filter((t) => t.domainId === domainId);

export const domainStats = (s: Snapshot, domainId: string) => computeStats(topicsOf(s, domainId));

export const lastStudied = (topics: Topic[]) =>
  topics
    .filter((t) => t.lastStudiedAt)
    .sort((a, b) => +new Date(b.lastStudiedAt!) - +new Date(a.lastStudiedAt!))[0];

export const resourceCount = (s: Snapshot, topicId: string) => s.resources.filter((r) => r.topicId === topicId).length;
export const noteCount = (s: Snapshot, topicId: string) => s.notes.filter((n) => n.topicId === topicId).length;
export const openQuestionCount = (s: Snapshot, topicId: string) =>
  s.questions.filter((q) => q.topicId === topicId && q.status === 'unresolved').length;

export const domainOf = (s: Snapshot, topic: Topic): Domain => s.domains.find((d) => d.id === topic.domainId)!;

export const byRecentlyStudied = (a: Topic, b: Topic) =>
  +new Date(b.lastStudiedAt ?? 0) - +new Date(a.lastStudiedAt ?? 0);

export interface Suggestion {
  kind: 'continue' | 'revisit' | 'start';
  topic: Topic;
  reason: string;
}

/**
 * "What should I study next?" — a deliberately simple heuristic:
 *  1. Continue the most recently studied in-progress topic
 *  2. Revisit the revision topic that has waited longest (and has open questions)
 *  3. Start the next unstarted topic in the domain with the least progress
 */
export const suggestNext = (s: Snapshot): Suggestion[] => {
  const out: Suggestion[] = [];

  const cont = s.topics.filter((t) => t.status === 'in_progress').sort(byRecentlyStudied)[0];
  if (cont) {
    const left = s.concepts.filter((c) => c.topicId === cont.id && !c.understood).length;
    out.push({ kind: 'continue', topic: cont, reason: `${left} concept${left === 1 ? '' : 's'} left · ${cont.progress}% done` });
  }

  const rev = s.topics
    .filter((t) => t.status === 'needs_revision')
    .sort((a, b) => {
      const qa = openQuestionCount(s, a.id);
      const qb = openQuestionCount(s, b.id);
      if (qa !== qb) return qb - qa;
      return +new Date(a.lastStudiedAt ?? 0) - +new Date(b.lastStudiedAt ?? 0);
    })[0];
  if (rev) {
    const q = openQuestionCount(s, rev.id);
    out.push({
      kind: 'revisit',
      topic: rev,
      reason: q ? `${q} open question${q === 1 ? '' : 's'} to resolve` : 'Waiting longest for revision',
    });
  }

  const domainsByProgress = [...s.domains].sort((a, b) => domainStats(s, a.id).progress - domainStats(s, b.id).progress);
  for (const d of domainsByProgress) {
    const next = topicsOf(s, d.id)
      .filter((t) => t.status === 'not_started')
      .sort((a, b) => a.order - b.order)[0];
    if (next) {
      out.push({ kind: 'start', topic: next, reason: `Next in ${d.name}` });
      break;
    }
  }
  return out;
};
