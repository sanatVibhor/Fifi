import { useRef } from 'react';
import { useStore } from '../store/store';
import { useUi, type Theme } from '../store/ui';
import { Icon } from '../components/Icon';
import { cn } from '../lib/utils';
import type { Snapshot } from '../types';

const THEMES: { id: Theme; label: string; icon: string }[] = [
  { id: 'dark', label: 'Dark', icon: 'moon' },
  { id: 'light', label: 'Light', icon: 'sun' },
  { id: 'system', label: 'System', icon: 'settings' },
];

export default function Settings() {
  const { state, resetData, replaceData } = useStore();
  const { theme, setTheme, notify } = useUi();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fifi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Snapshot;
      if (!Array.isArray(parsed.topics) || !Array.isArray(parsed.domains)) throw new Error('bad shape');
      replaceData(parsed);
      notify('Backup restored');
    } catch {
      notify('That file is not a valid Fifi backup');
    }
  };

  return (
    <div className="page page-narrow">
      <header className="pagehead">
        <h1>Settings</h1>
        <p className="hero-sub">Appearance and your local data.</p>
      </header>

      <section className="panel">
        <h3>Appearance</h3>
        <p className="muted">Fifi is dark-first, with a light theme when you need it.</p>
        <div className="segmented">
          {THEMES.map((t) => (
            <button key={t.id} className={cn('seg', theme === t.id && 'is-on')} onClick={() => setTheme(t.id)}>
              <Icon name={t.icon} size={13} /> {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Profile</h3>
        <dl className="kv">
          <div><dt>Name</dt><dd>{state.user.name}</dd></div>
          <div><dt>Focus</dt><dd>{state.user.headline}</dd></div>
          <div><dt>Study streak</dt><dd>{state.user.streak} days</dd></div>
        </dl>
      </section>

      <section className="panel">
        <h3>Data</h3>
        <p className="muted">
          Everything lives in this browser for now. Export a backup any time; a hosted database arrives in a later version.
        </p>
        <div className="row gap-sm wrap">
          <button className="btn btn-ghost" onClick={exportData}>
            <Icon name="download" size={14} /> Export JSON
          </button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={14} /> Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          <button
            className="btn btn-ghost danger"
            onClick={() => {
              if (confirm('Reset Fifi to the demo data? Your notes, resources and progress will be replaced.')) {
                resetData();
                notify('Demo data restored');
              }
            }}
          >
            <Icon name="refresh" size={14} /> Reset demo data
          </button>
        </div>
      </section>

      <section className="panel panel-ai">
        <div className="row between">
          <h3><Icon name="sparkle" size={15} /> Fifi AI</h3>
          <span className="pill">Coming in V2</span>
        </div>
        <p className="muted">
          A local, private study assistant grounded in your topics, notes, resources, questions and progress.
        </p>
      </section>
    </div>
  );
}
