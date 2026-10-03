import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type {
  Concept,
  Note,
  Question,
  Resource,
  Snapshot,
  Status,
  Topic,
} from '../types';
import { repository } from '../data/repository';
import { todayKey, uid } from '../lib/utils';

type NewResource = Omit<Resource, 'id' | 'addedAt'>;
type NewNote = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
type NewQuestion = Omit<Question, 'id' | 'createdAt'>;

type Action =
  | { type: 'topic/status'; topicId: string; status: Status }
  | { type: 'topic/overview'; topicId: string; overview: string }
  | { type: 'topic/open'; topicId: string }
  | { type: 'concept/toggle'; conceptId: string }
  | { type: 'concept/add'; topicId: string; name: string }
  | { type: 'resource/add'; value: NewResource }
  | { type: 'resource/update'; id: string; patch: Partial<Resource> }
  | { type: 'resource/delete'; id: string }
  | { type: 'note/add'; value: NewNote }
  | { type: 'note/update'; id: string; patch: Partial<Note> }
  | { type: 'note/delete'; id: string }
  | { type: 'question/add'; value: NewQuestion }
  | { type: 'question/update'; id: string; patch: Partial<Question> }
  | { type: 'question/delete'; id: string }
  | { type: 'reset'; snapshot: Snapshot };

const now = () => new Date().toISOString();

/** Keep a topic's progress/status coherent with its concepts. */
function syncTopic(topic: Topic, concepts: Concept[]): Topic {
  const own = concepts.filter((c) => c.topicId === topic.id);
  if (!own.length) return topic;
  const done = own.filter((c) => c.understood).length;
  const progress = Math.round((done / own.length) * 100);
  let status = topic.status;
  if (progress === 100) status = 'completed';
  else if (status === 'completed') status = 'in_progress';
  else if (progress > 0 && status === 'not_started') status = 'in_progress';
  else if (progress === 0 && status === 'in_progress') status = 'not_started';
  return { ...topic, progress, status, lastStudiedAt: now() };
}

const touchActivity = (user: Snapshot['user']): Snapshot['user'] => {
  const key = todayKey();
  if (user.activity.includes(key)) return user;
  return { ...user, activity: [key, ...user.activity], streak: user.streak + 1 };
};

function reducer(state: Snapshot, action: Action): Snapshot {
  switch (action.type) {
    case 'topic/open':
      return {
        ...state,
        topics: state.topics.map((t) => (t.id === action.topicId ? { ...t, lastOpenedAt: now() } : t)),
      };

    case 'topic/overview':
      return {
        ...state,
        topics: state.topics.map((t) => (t.id === action.topicId ? { ...t, overview: action.overview } : t)),
      };

    case 'topic/status': {
      let concepts = state.concepts;
      const own = concepts.filter((c) => c.topicId === action.topicId);
      const topic = state.topics.find((t) => t.id === action.topicId)!;
      let progress = topic.progress;

      if (action.status === 'completed') {
        concepts = concepts.map((c) => (c.topicId === action.topicId ? { ...c, understood: true } : c));
        progress = 100;
      } else if (action.status === 'not_started') {
        concepts = concepts.map((c) => (c.topicId === action.topicId ? { ...c, understood: false } : c));
        progress = 0;
      } else if (action.status === 'in_progress' && own.length) {
        const done = own.filter((c) => c.understood).length;
        if (done === own.length) {
          const last = [...own].sort((a, b) => b.order - a.order)[0];
          concepts = concepts.map((c) => (c.id === last.id ? { ...c, understood: false } : c));
          progress = Math.round(((own.length - 1) / own.length) * 100);
        } else if (done === 0) {
          const first = [...own].sort((a, b) => a.order - b.order)[0];
          concepts = concepts.map((c) => (c.id === first.id ? { ...c, understood: true } : c));
          progress = Math.round((1 / own.length) * 100);
        }
      }
      return {
        ...state,
        concepts,
        user: touchActivity(state.user),
        topics: state.topics.map((t) =>
          t.id === action.topicId ? { ...t, status: action.status, progress, lastStudiedAt: now() } : t,
        ),
      };
    }

    case 'concept/toggle': {
      const concepts = state.concepts.map((c) =>
        c.id === action.conceptId ? { ...c, understood: !c.understood } : c,
      );
      const target = concepts.find((c) => c.id === action.conceptId)!;
      return {
        ...state,
        concepts,
        user: touchActivity(state.user),
        topics: state.topics.map((t) => (t.id === target.topicId ? syncTopic(t, concepts) : t)),
      };
    }

    case 'concept/add': {
      const siblings = state.concepts.filter((c) => c.topicId === action.topicId);
      const concept: Concept = {
        id: uid('concept'),
        topicId: action.topicId,
        name: action.name,
        understood: false,
        order: siblings.length,
      };
      const concepts = [...state.concepts, concept];
      return {
        ...state,
        concepts,
        topics: state.topics.map((t) => {
          if (t.id !== action.topicId) return t;
          const synced = syncTopic(t, concepts);
          return { ...synced, lastStudiedAt: t.lastStudiedAt };
        }),
      };
    }

    case 'resource/add':
      return {
        ...state,
        resources: [{ ...action.value, id: uid('res'), addedAt: now() }, ...state.resources],
        topics: state.topics.map((t) => (t.id === action.value.topicId ? { ...t, lastStudiedAt: now() } : t)),
        user: touchActivity(state.user),
      };
    case 'resource/update':
      return { ...state, resources: state.resources.map((r) => (r.id === action.id ? { ...r, ...action.patch } : r)) };
    case 'resource/delete':
      return { ...state, resources: state.resources.filter((r) => r.id !== action.id) };

    case 'note/add':
      return {
        ...state,
        notes: [{ ...action.value, id: uid('note'), createdAt: now(), updatedAt: now() }, ...state.notes],
        topics: state.topics.map((t) => (t.id === action.value.topicId ? { ...t, lastStudiedAt: now() } : t)),
        user: touchActivity(state.user),
      };
    case 'note/update':
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === action.id ? { ...n, ...action.patch, updatedAt: now() } : n)),
      };
    case 'note/delete':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.id) };

    case 'question/add':
      return {
        ...state,
        questions: [{ ...action.value, id: uid('q'), createdAt: now() }, ...state.questions],
      };
    case 'question/update':
      return { ...state, questions: state.questions.map((q) => (q.id === action.id ? { ...q, ...action.patch } : q)) };
    case 'question/delete':
      return { ...state, questions: state.questions.filter((q) => q.id !== action.id) };

    case 'reset':
      return action.snapshot;
  }
}

export interface StoreApi {
  state: Snapshot;
  setTopicStatus: (topicId: string, status: Status) => void;
  setOverview: (topicId: string, overview: string) => void;
  openTopic: (topicId: string) => void;
  toggleConcept: (conceptId: string) => void;
  addConcept: (topicId: string, name: string) => void;
  addResource: (v: NewResource) => void;
  updateResource: (id: string, patch: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  addNote: (v: NewNote) => void;
  updateNote: (id: string, patch: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addQuestion: (v: NewQuestion) => void;
  updateQuestion: (id: string, patch: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  resetData: () => void;
  replaceData: (s: Snapshot) => void;
}

const Ctx = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => repository.load());

  useEffect(() => {
    repository.save(state);
  }, [state]);

  const api = useMemo<StoreApi>(
    () => ({
      state,
      setTopicStatus: (topicId, status) => dispatch({ type: 'topic/status', topicId, status }),
      setOverview: (topicId, overview) => dispatch({ type: 'topic/overview', topicId, overview }),
      openTopic: (topicId) => dispatch({ type: 'topic/open', topicId }),
      toggleConcept: (conceptId) => dispatch({ type: 'concept/toggle', conceptId }),
      addConcept: (topicId, name) => dispatch({ type: 'concept/add', topicId, name }),
      addResource: (value) => dispatch({ type: 'resource/add', value }),
      updateResource: (id, patch) => dispatch({ type: 'resource/update', id, patch }),
      deleteResource: (id) => dispatch({ type: 'resource/delete', id }),
      addNote: (value) => dispatch({ type: 'note/add', value }),
      updateNote: (id, patch) => dispatch({ type: 'note/update', id, patch }),
      deleteNote: (id) => dispatch({ type: 'note/delete', id }),
      addQuestion: (value) => dispatch({ type: 'question/add', value }),
      updateQuestion: (id, patch) => dispatch({ type: 'question/update', id, patch }),
      deleteQuestion: (id) => dispatch({ type: 'question/delete', id }),
      resetData: () => dispatch({ type: 'reset', snapshot: repository.reset() }),
      replaceData: (snapshot) => dispatch({ type: 'reset', snapshot }),
    }),
    [state],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside <StoreProvider>');
  return v;
}
