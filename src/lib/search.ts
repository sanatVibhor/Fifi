import type { Snapshot } from '../types';
import { plainText } from './markdown';

export type SearchKind = 'topic' | 'concept' | 'note' | 'resource' | 'question';

export interface SearchHit {
  id: string;
  kind: SearchKind;
  title: string;
  /** "Domain → Topic" style breadcrumb shown under the title */
  path: string;
  snippet?: string;
  to: string;
  score: number;
}

interface Entry {
  id: string;
  kind: SearchKind;
  title: string;
  body: string;
  path: string;
  to: string;
}

/** Flatten the whole workspace into a searchable list. V2 can swap this for embeddings behind the same shape. */
export function buildIndex(s: Snapshot): Entry[] {
  const topic = new Map(s.topics.map((t) => [t.id, t]));
  const domain = new Map(s.domains.map((d) => [d.id, d]));
  const where = (topicId: string) => {
    const t = topic.get(topicId)!;
    return { t, d: domain.get(t.domainId)! };
  };
  const entries: Entry[] = [];

  for (const t of s.topics) {
    const d = domain.get(t.domainId)!;
    entries.push({ id: t.id, kind: 'topic', title: t.name, body: t.summary, path: d.name, to: `/t/${t.id}` });
  }
  for (const c of s.concepts) {
    const { t, d } = where(c.topicId);
    entries.push({
      id: c.id, kind: 'concept', title: c.name, body: c.summary ?? '',
      path: `${t.name} → ${c.name}`, to: `/t/${t.id}#concept-${c.id}`,
    });
    void d;
  }
  for (const n of s.notes) {
    const { t } = where(n.topicId);
    entries.push({
      id: n.id, kind: 'note', title: n.title, body: `${plainText(n.content)} ${n.tags.join(' ')}`,
      path: `${t.name} → Notes`, to: `/t/${t.id}#note-${n.id}`,
    });
  }
  for (const r of s.resources) {
    const { t } = where(r.topicId);
    entries.push({
      id: r.id, kind: 'resource', title: r.title, body: `${r.description} ${r.type} ${r.tags.join(' ')} ${r.url}`,
      path: `${t.name} → ${r.type}`, to: `/t/${t.id}#resource-${r.id}`,
    });
  }
  for (const q of s.questions) {
    const { t } = where(q.topicId);
    entries.push({
      id: q.id, kind: 'question', title: q.question, body: `${q.answer} ${q.tags.join(' ')}`,
      path: `${t.name} → Questions`, to: `/t/${t.id}#question-${q.id}`,
    });
  }
  return entries;
}

const normalize = (s: string) => s.toLowerCase();

export function search(index: Entry[], query: string, limitPerKind = 4): SearchHit[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];

  const hits: SearchHit[] = [];
  for (const e of index) {
    const title = normalize(e.title);
    const body = normalize(e.body);
    let score = 0;
    let ok = true;
    for (const tok of tokens) {
      const inTitle = title.indexOf(tok);
      const inBody = body.indexOf(tok);
      const inPath = normalize(e.path).includes(tok);
      if (inTitle === -1 && inBody === -1 && !inPath) {
        ok = false;
        break;
      }
      if (inTitle === 0) score += 12;
      else if (inTitle > 0) score += title[inTitle - 1] === ' ' ? 9 : 5;
      if (inBody !== -1) score += 2;
      if (inPath) score += 1;
    }
    if (!ok) continue;
    if (e.kind === 'topic') score += 3;
    let snippet: string | undefined;
    if (body && !tokens.every((t) => title.includes(t))) {
      const idx = body.indexOf(tokens[0]);
      if (idx !== -1) {
        const start = Math.max(0, idx - 28);
        snippet = (start > 0 ? '…' : '') + e.body.slice(start, idx + 70).trim() + '…';
      }
    }
    hits.push({ id: e.id, kind: e.kind, title: e.title, path: e.path, to: e.to, snippet, score });
  }

  const kinds: SearchKind[] = ['topic', 'concept', 'note', 'resource', 'question'];
  return kinds.flatMap((k) =>
    hits
      .filter((h) => h.kind === k)
      .sort((a, b) => b.score - a.score)
      .slice(0, limitPerKind),
  );
}
