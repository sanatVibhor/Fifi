export type Status = 'not_started' | 'in_progress' | 'completed' | 'needs_revision';

export type ResourceType =
  | 'ChatGPT'
  | 'Article'
  | 'YouTube'
  | 'Documentation'
  | 'Paper'
  | 'Course'
  | 'Other';

export type QuestionStatus = 'unresolved' | 'understood';

export interface User {
  id: string;
  name: string;
  firstName: string;
  headline: string;
  streak: number;
  /** Days on which the user studied (ISO yyyy-mm-dd). Used for streak display. */
  activity: string[];
}

export interface Domain {
  id: string;
  slug: string;
  /** "01", "02", "03" — editorial index */
  index: string;
  name: string;
  /** Short tagline used on dashboard cards */
  tagline: string;
  /** Longer line used in the domain page header */
  description: string;
  icon: string;
}

export interface Topic {
  id: string;
  domainId: string;
  /** Sub-section inside a domain, e.g. "Statistics" / "Mathematics" */
  group: string;
  name: string;
  summary: string;
  subtitle: string;
  overview: string;
  status: Status;
  /** 0–100. Derived from understood concepts once the user interacts. */
  progress: number;
  lastStudiedAt: string | null;
  lastOpenedAt: string | null;
  order: number;
}

export interface Concept {
  id: string;
  topicId: string;
  name: string;
  summary?: string;
  understood: boolean;
  order: number;
}

export interface Resource {
  id: string;
  topicId: string;
  title: string;
  url: string;
  type: ResourceType;
  description: string;
  tags: string[];
  addedAt: string;
}

export interface Note {
  id: string;
  topicId: string;
  title: string;
  /** Markdown */
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  status: QuestionStatus;
  tags: string[];
  createdAt: string;
}

/** Everything the app persists. This is the unit a future Supabase adapter will sync. */
export interface Snapshot {
  user: User;
  domains: Domain[];
  topics: Topic[];
  concepts: Concept[];
  resources: Resource[];
  notes: Note[];
  questions: Question[];
}

export const STATUS_LABEL: Record<Status, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  needs_revision: 'Needs Revision',
};

export const STATUS_ORDER: Status[] = ['not_started', 'in_progress', 'completed', 'needs_revision'];

export const RESOURCE_TYPES: ResourceType[] = [
  'ChatGPT',
  'Article',
  'YouTube',
  'Documentation',
  'Paper',
  'Course',
  'Other',
];
