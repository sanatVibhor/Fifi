/**
 * Fifi AI — V2 contract (intentionally not implemented in V1).
 *
 * The UI already reserves the following slots:
 *  - Sidebar entry "Fifi AI" (disabled, "V2" badge)
 *  - Topic workspace right rail card (`AiPlaceholder`)
 *
 * In V2 a local-LLM + RAG pipeline will implement `StudyAssistant`, fed by
 * `buildStudyContext`. Because every entity (topics, concepts, notes, resources,
 * questions, progress) already lives in one `Snapshot`, indexing is a matter of
 * walking that snapshot — the search index in `lib/search.ts` has the same shape.
 */
import type { Snapshot } from '../types';

export interface StudyContext {
  scope: { kind: 'global' } | { kind: 'domain'; domainId: string } | { kind: 'topic'; topicId: string };
  snapshot: Snapshot;
}

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Entity ids the answer was grounded on, rendered as citations in the UI */
  sources?: { kind: 'topic' | 'note' | 'resource' | 'question'; id: string }[];
}

export interface StudyAssistant {
  ask(context: StudyContext, history: AssistantMessage[]): AsyncIterable<string>;
  /** Re-index changed entities (called after store mutations) */
  sync(snapshot: Snapshot): Promise<void>;
}

export const buildStudyContext = (snapshot: Snapshot, scope: StudyContext['scope'] = { kind: 'global' }): StudyContext => ({
  scope,
  snapshot,
});
