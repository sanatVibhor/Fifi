import { Route, Routes, matchPath, useLocation } from 'react-router-dom';
import { useStore } from './store/store';
import { AppShell } from './components/Shell';
import type { Crumb } from './components/primitives';
import Home from './pages/Home';
import DomainPage from './pages/Domain';
import TopicPage from './pages/Topic';
import Learning from './pages/Learning';
import { NotesPage, ResourcesPage, RevisionPage } from './pages/Library';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function useCrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const { state } = useStore();

  const topic = matchPath('/t/:topicId', pathname);
  if (topic) {
    const t = state.topics.find((x) => x.id === topic.params.topicId);
    const d = t && state.domains.find((x) => x.id === t.domainId);
    if (t && d) return [{ label: 'Home', to: '/' }, { label: d.name, to: `/d/${d.slug}` }, { label: t.name }];
  }
  const dom = matchPath('/d/:slug', pathname);
  if (dom) {
    const d = state.domains.find((x) => x.slug === dom.params.slug);
    if (d) return [{ label: 'Home', to: '/' }, { label: d.name }];
  }
  const labels: Record<string, string> = {
    '/learning': 'My Learning',
    '/notes': 'Notes',
    '/resources': 'Resources',
    '/revision': 'Revision',
    '/settings': 'Settings',
  };
  if (labels[pathname]) return [{ label: 'Home', to: '/' }, { label: labels[pathname] }];
  return [{ label: 'Home' }];
}

export default function App() {
  const crumbs = useCrumbs();
  return (
    <AppShell crumbs={crumbs}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/d/:slug" element={<DomainPage />} />
        <Route path="/t/:topicId" element={<TopicPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/revision" element={<RevisionPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
