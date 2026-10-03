import type { Snapshot } from '../types';
import { domains, notes, questions, resources, user } from './mock/content';
import { buildTopicsAndConcepts } from './mock/topics';

/**
 * Data access boundary.
 *
 * V1 serves mock data and mirrors changes to localStorage. To move to Supabase,
 * implement the same `Repository` interface (load / save / reset) and swap the
 * export at the bottom — nothing in the UI knows where data comes from.
 */
export interface Repository {
  load(): Snapshot;
  save(snapshot: Snapshot): void;
  reset(): Snapshot;
}

const KEY = 'fifi.snapshot.v1';

export const seedSnapshot = (): Snapshot => {
  const { topics, concepts } = buildTopicsAndConcepts();
  const snapshot: Snapshot = {
    user: structuredClone(user),
    domains: structuredClone(domains),
    topics,
    concepts,
    resources: structuredClone(resources),
    notes: structuredClone(notes),
    questions: structuredClone(questions),
  };
  assertIntegrity(snapshot);
  return snapshot;
};

/** Dev-time guard so mock content never references a topic that does not exist. */
function assertIntegrity(s: Snapshot) {
  if (!import.meta.env.DEV) return;
  const ids = new Set(s.topics.map((t) => t.id));
  const check = (kind: string, rows: { id: string; topicId: string }[]) =>
    rows.forEach((r) => ids.has(r.topicId) || console.warn(`[fifi] ${kind} ${r.id} → unknown topic ${r.topicId}`));
  check('resource', s.resources);
  check('note', s.notes);
  check('question', s.questions);
}

const localRepository: Repository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Snapshot;
        if (parsed?.topics?.length) return parsed;
      }
    } catch {
      /* fall through to seed */
    }
    return seedSnapshot();
  },
  save(snapshot) {
    try {
      localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      /* storage unavailable — ignore */
    }
  },
  reset() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    return seedSnapshot();
  },
};

export const repository: Repository = localRepository;
