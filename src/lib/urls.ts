import type { ResourceType } from '../types';

export const normalizeUrl = (raw: string) => {
  const v = raw.trim();
  if (!v) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}`;
};

export const parseUrl = (raw: string): URL | null => {
  try {
    const u = new URL(normalizeUrl(raw));
    return u.hostname.includes('.') ? u : null;
  } catch {
    return null;
  }
};

export const hostLabel = (raw: string) => parseUrl(raw)?.hostname.replace(/^www\./, '') ?? raw;

/** Best-effort type detection from the URL alone (no network). */
export function detectResourceType(raw: string): ResourceType | null {
  const u = parseUrl(raw);
  if (!u) return null;
  const host = u.hostname.replace(/^www\./, '');
  const path = u.pathname.toLowerCase();

  if (host === 'chatgpt.com' || host === 'chat.openai.com' || host.endsWith('.chatgpt.com')) return 'ChatGPT';
  if (host.includes('youtube.com') || host === 'youtu.be') return 'YouTube';
  if (
    /(^|\.)(arxiv\.org|openreview\.net|aclanthology\.org|semanticscholar\.org|papers\.nips\.cc|proceedings\.mlr\.press|biorxiv\.org)$/.test(host) ||
    path.endsWith('.pdf')
  )
    return 'Paper';
  if (/(coursera\.org|udemy\.com|edx\.org|fast\.ai|khanacademy\.org|deeplearning\.ai|udacity\.com|ocw\.mit\.edu)/.test(host))
    return 'Course';
  if (
    /^(docs|doc|developer|developers|api|learn)\./.test(host) ||
    /(readthedocs\.io|scikit-learn\.org|pytorch\.org|numpy\.org|pandas\.pydata\.org|scipy\.org|huggingface\.co|python\.org|langchain\.com|llamaindex\.ai|modelcontextprotocol\.io)/.test(host) ||
    /\/docs?(\/|$)/.test(path)
  )
    return 'Documentation';
  if (/(medium\.com|substack\.com|towardsdatascience\.com|dev\.to|github\.io|blog|wikipedia\.org|distill\.pub|pinecone\.io|\.edu$)/.test(host))
    return 'Article';
  return 'Other';
}

const titleCase = (s: string) =>
  s
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');

/** A readable title guess derived from the URL (used as a placeholder, never forced on the user). */
export function suggestTitle(raw: string, type: ResourceType | null): string {
  const u = parseUrl(raw);
  if (!u) return '';
  if (type === 'ChatGPT') return 'ChatGPT conversation';
  if (type === 'YouTube') return 'YouTube video';
  const seg = u.pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => !/^\d+$/.test(s))
    .pop();
  if (seg && seg.length > 3) {
    return titleCase(decodeURIComponent(seg).replace(/\.[a-z0-9]+$/i, ''));
  }
  return hostLabel(raw);
}
