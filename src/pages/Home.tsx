import { useMemo } from 'react';
import { useStore } from '../store/store';
import { suggestNext } from '../store/selectors';
import { DomainCard, ProgressOverview, UpNext } from '../components/Dashboard';
import { greeting } from '../lib/utils';

export default function Home() {
  const { state } = useStore();
  const suggestions = useMemo(() => suggestNext(state), [state]);
  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">YOUR PERSONAL INTELLIGENCE SYSTEM FOR DATA SCIENCE</p>
        <h1>
          {greeting()}, {state.user.firstName}.
        </h1>
        <p className="hero-sub">Continue building your Data Science foundation.</p>
      </header>

      <ProgressOverview />
      <UpNext suggestions={suggestions} />

      <section>
        <div className="section-head">
          <h2>Domains</h2>
          <span className="muted-sm">{state.domains.length} learning paths</span>
        </div>
        <div className="domaingrid">
          {state.domains.map((d) => (
            <DomainCard key={d.id} domain={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
