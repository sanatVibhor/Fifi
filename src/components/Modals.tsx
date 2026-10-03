import { useEffect, useMemo, useRef, useState } from 'react';
import { RESOURCE_TYPES, type ResourceType } from '../types';
import { useStore } from '../store/store';
import { useUi } from '../store/ui';
import { Field, Kbd, Modal, TagInput } from './primitives';
import { Icon, resourceIcon } from './Icon';
import { detectResourceType, hostLabel, normalizeUrl, parseUrl, suggestTitle } from '../lib/urls';
import { renderMarkdown } from '../lib/markdown';
import { cn } from '../lib/utils';

/* ───────── TopicSelect: native select grouped by domain ───────── */
export function TopicSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const { state } = useStore();
  return (
    <div className="select-wrap">
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          Select a topic…
        </option>
        {state.domains.map((d) => (
          <optgroup key={d.id} label={d.name}>
            {state.topics
              .filter((t) => t.domainId === d.id)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <Icon name="chevron-down" size={14} />
    </div>
  );
}

/* ───────── ResourceModal ───────── */
export function ResourceModal() {
  const { resourceModal, closeResource, notify } = useUi();
  if (!resourceModal) return null;
  return <ResourceForm key="resource" initialTopic={resourceModal.topicId} initialUrl={resourceModal.url} onClose={closeResource} notify={notify} />;
}

function ResourceForm({
  initialTopic,
  initialUrl,
  onClose,
  notify,
}: {
  initialTopic?: string;
  initialUrl?: string;
  onClose: () => void;
  notify: (m: string) => void;
}) {
  const { state, addResource } = useStore();
  const [url, setUrl] = useState(initialUrl ?? '');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('Article');
  const [typeTouched, setTypeTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState(initialTopic ?? '');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const urlRef = useRef<HTMLInputElement>(null);

  const parsed = parseUrl(url);
  const detected = useMemo(() => detectResourceType(url), [url]);
  const guess = useMemo(() => suggestTitle(url, detected), [url, detected]);

  useEffect(() => {
    if (detected && !typeTouched) setType(detected);
  }, [detected, typeTouched]);

  useEffect(() => {
    urlRef.current?.focus();
  }, []);

  const pasteFromClipboard = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) setUrl(text);
      else notify('Clipboard is empty');
    } catch {
      notify('Clipboard unavailable — paste with Ctrl+V');
      urlRef.current?.focus();
    }
  };

  const submit = () => {
    if (!parsed) return setError('Enter a valid URL, e.g. https://chatgpt.com/c/…');
    if (!topicId) return setError('Choose the topic this resource belongs to.');
    addResource({
      topicId,
      url: normalizeUrl(url),
      title: title.trim() || guess || hostLabel(url),
      type,
      description: description.trim(),
      tags,
    });
    const topic = state.topics.find((t) => t.id === topicId);
    notify(`Resource added to ${topic?.name ?? 'topic'}`);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add Resource"
      subtitle="Save a link to something worth coming back to."
      footer={
        <>
          <span className="hint-kbd hide-sm">
            <Kbd>Ctrl</Kbd> <Kbd>Enter</Kbd> to add
          </span>
          <div className="row gap-sm">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submit}>
              Add Resource
            </button>
          </div>
        </>
      }
    >
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && submit()}
      >
        <Field label="Resource URL">
          <div className="urlbar">
            <Icon name={resourceIcon(detected ?? 'Other')} size={15} />
            <input
              ref={urlRef}
              className="input input-bare"
              placeholder="Paste a link — ChatGPT chat, article, video, paper…"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              spellCheck={false}
              autoComplete="off"
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={pasteFromClipboard}>
              <Icon name="copy" size={13} /> Paste
            </button>
          </div>
          <div className="quick">
            <button type="button" className="chip" onClick={() => { setType('ChatGPT'); setTypeTouched(true); pasteFromClipboard(); }}>
              <Icon name="chat" size={13} /> Paste ChatGPT link
            </button>
            {parsed && detected && (
              <span className="detected">
                <Icon name="sparkle" size={12} /> Detected {detected} · {hostLabel(url)}
              </span>
            )}
          </div>
        </Field>

        <Field label="Title" optional hint={!title && guess ? `Will default to “${guess}”` : undefined}>
          <input className="input" placeholder={guess || 'Give it a memorable name'} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>

        <div className="field">
          <span className="field-label">Type</span>
          <div className="segmented" role="radiogroup">
            {RESOURCE_TYPES.map((t) => (
              <button
                type="button"
                key={t}
                role="radio"
                aria-checked={type === t}
                className={cn('seg', type === t && 'is-on')}
                onClick={() => {
                  setType(t);
                  setTypeTouched(true);
                }}
              >
                <Icon name={resourceIcon(t)} size={13} /> {t}
              </button>
            ))}
          </div>
        </div>

        <Field label="Description" optional>
          <textarea className="input textarea" rows={3} placeholder="What will you get out of this? Which part mattered?" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <div className="grid-2">
          <Field label="Related topic">
            <TopicSelect value={topicId} onChange={(v) => { setTopicId(v); setError(''); }} />
          </Field>
          <Field label="Tags" optional>
            <TagInput value={tags} onChange={setTags} />
          </Field>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}

/* ───────── NotesEditor: Markdown writing surface ───────── */
export function NotesEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  const wrap = (before: string, after = before, fallback = 'text') => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || fallback;
    onChange(value.slice(0, s) + before + sel + after + value.slice(e));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const linePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const s = value.lastIndexOf('\n', el.selectionStart - 1) + 1;
    onChange(value.slice(0, s) + prefix + value.slice(s));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(el.selectionStart + prefix.length, el.selectionStart + prefix.length);
    });
  };

  const tools = [
    { icon: 'heading', label: 'Heading', run: () => linePrefix('## ') },
    { icon: 'bold', label: 'Bold (Ctrl+B)', run: () => wrap('**') },
    { icon: 'italic', label: 'Italic (Ctrl+I)', run: () => wrap('*') },
    { icon: 'code', label: 'Code', run: () => wrap('`') },
    { icon: 'list', label: 'List', run: () => linePrefix('- ') },
    { icon: 'quote', label: 'Quote', run: () => linePrefix('> ') },
  ];

  return (
    <div className="editor">
      <div className="editor-bar">
        <div className="row gap-xs">
          {tools.map((t) => (
            <button key={t.icon} type="button" className="icon-btn" title={t.label} aria-label={t.label} onClick={t.run} disabled={preview}>
              <Icon name={t.icon} size={15} />
            </button>
          ))}
        </div>
        <div className="segmented segmented-sm">
          <button type="button" className={cn('seg', !preview && 'is-on')} onClick={() => setPreview(false)}>
            Write
          </button>
          <button type="button" className={cn('seg', preview && 'is-on')} onClick={() => setPreview(true)}>
            <Icon name="eye" size={13} /> Preview
          </button>
        </div>
      </div>
      {preview ? (
        <div className="editor-preview prose">
          {value.trim() ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} /> : <p className="muted-sm">Nothing to preview yet.</p>}
        </div>
      ) : (
        <textarea
          ref={ref}
          className="editor-area"
          value={value}
          placeholder={placeholder ?? 'Write in Markdown…  ## headings, **bold**, - lists, `code`, > quotes'}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
              e.preventDefault();
              wrap('**');
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
              e.preventDefault();
              wrap('*');
            }
          }}
        />
      )}
    </div>
  );
}

/* ───────── NoteModal ───────── */
export function NoteModal() {
  const { noteModal, closeNote } = useUi();
  if (!noteModal) return null;
  return <NoteForm key={noteModal.note?.id ?? 'new'} state={noteModal} onClose={closeNote} />;
}

function NoteForm({
  state: init,
  onClose,
}: {
  state: NonNullable<ReturnType<typeof useUi>['noteModal']>;
  onClose: () => void;
}) {
  const { addNote, updateNote } = useStore();
  const { notify } = useUi();
  const editing = init.note;
  const [title, setTitle] = useState(editing?.title ?? init.title ?? '');
  const [topicId, setTopicId] = useState(editing?.topicId ?? init.topicId ?? '');
  const [tags, setTags] = useState<string[]>(editing?.tags ?? init.tags ?? []);
  const [content, setContent] = useState(editing?.content ?? '');
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim()) return setError('Give your note a title.');
    if (!topicId) return setError('Choose the topic this note belongs to.');
    if (editing) {
      updateNote(editing.id, { title: title.trim(), topicId, tags, content });
      notify('Note updated');
    } else {
      addNote({ title: title.trim(), topicId, tags, content });
      notify('Note saved');
    }
    onClose();
  };

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={editing ? 'Edit Note' : 'New Note'}
      subtitle="Markdown is supported."
      footer={
        <>
          <span className="hint-kbd hide-sm">
            <Kbd>Ctrl</Kbd> <Kbd>Enter</Kbd> to save
          </span>
          <div className="row gap-sm">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submit}>
              {editing ? 'Save changes' : 'Save Note'}
            </button>
          </div>
        </>
      }
    >
      <div className="form" onKeyDown={(e) => (e.ctrlKey || e.metaKey) && e.key === 'Enter' && submit()}>
        <input
          className="note-title-input"
          placeholder="Untitled note"
          value={title}
          autoFocus
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
        />
        <div className="grid-2">
          <Field label="Topic">
            <TopicSelect value={topicId} onChange={(v) => { setTopicId(v); setError(''); }} />
          </Field>
          <Field label="Tags" optional>
            <TagInput value={tags} onChange={setTags} />
          </Field>
        </div>
        <NotesEditor value={content} onChange={setContent} />
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </Modal>
  );
}

/* ───────── QuestionModal ───────── */
export function QuestionModal() {
  const { questionModal, closeQuestion } = useUi();
  if (!questionModal) return null;
  return <QuestionForm key={questionModal.question?.id ?? 'new'} state={questionModal} onClose={closeQuestion} />;
}

function QuestionForm({
  state: init,
  onClose,
}: {
  state: NonNullable<ReturnType<typeof useUi>['questionModal']>;
  onClose: () => void;
}) {
  const { addQuestion, updateQuestion, deleteQuestion } = useStore();
  const { notify } = useUi();
  const editing = init.question;
  const [question, setQuestion] = useState(editing?.question ?? init.text ?? '');
  const [answer, setAnswer] = useState(editing?.answer ?? '');
  const [topicId, setTopicId] = useState(editing?.topicId ?? init.topicId ?? '');
  const [status, setStatus] = useState(editing?.status ?? 'unresolved');
  const [tags, setTags] = useState<string[]>(editing?.tags ?? init.tags ?? []);
  const [error, setError] = useState('');

  const submit = () => {
    if (!question.trim()) return setError('Write the question you struggled with.');
    if (!topicId) return setError('Choose a related topic.');
    if (editing) {
      updateQuestion(editing.id, { question: question.trim(), answer, topicId, status, tags });
      notify('Question updated');
    } else {
      addQuestion({ question: question.trim(), answer, topicId, status, tags });
      notify('Added to revision');
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? 'Edit Question' : 'Add Question'}
      subtitle="Capture what tripped you up so you can revisit it."
      footer={
        <>
          {editing ? (
            <button
              className="btn btn-ghost danger"
              onClick={() => {
                if (confirm('Delete this question?')) {
                  deleteQuestion(editing.id);
                  onClose();
                }
              }}
            >
              <Icon name="trash" size={14} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="row gap-sm">
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={submit}>
              {editing ? 'Save changes' : 'Add Question'}
            </button>
          </div>
        </>
      }
    >
      <div className="form">
        <Field label="Question">
          <textarea
            className="input textarea"
            rows={2}
            autoFocus
            placeholder="e.g. Why does zero covariance not imply independence?"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setError('');
            }}
          />
        </Field>
        <Field label="Answer / working notes" optional>
          <textarea className="input textarea" rows={4} placeholder="What you understand so far. Markdown works here." value={answer} onChange={(e) => setAnswer(e.target.value)} />
        </Field>
        <div className="grid-2">
          <Field label="Related topic">
            <TopicSelect value={topicId} onChange={(v) => { setTopicId(v); setError(''); }} />
          </Field>
          <div className="field">
            <span className="field-label">Status</span>
            <div className="segmented">
              {(['unresolved', 'understood'] as const).map((s) => (
                <button type="button" key={s} className={cn('seg', status === s && 'is-on')} onClick={() => setStatus(s)}>
                  {s === 'unresolved' ? 'Unresolved' : 'Understood'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Field label="Tags" optional>
          <TagInput value={tags} onChange={setTags} />
        </Field>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </Modal>
  );
}
