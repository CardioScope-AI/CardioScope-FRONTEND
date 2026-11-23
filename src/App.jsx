import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import PerformancesPage from './pages/PerformancesPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
const pages = { accueil: HomePage, simulation: SimulationPage, performances: PerformancesPage, historique: HistoryPage };
function readPage() {
  const hash = window.location.hash.slice(1);
  return Object.hasOwn(pages, hash) ? hash : 'accueil';
}
export default function App() {
  const [page, setPage] = useState(readPage);
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#contenu') return;
      setPage(readPage());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  useEffect(() => {
    const titles = { accueil: 'Accueil', simulation: 'Simulation', performances: 'Données et performances', historique: 'Historique' };
    document.title = `${titles[page]} | CardioScope`;
  }, [page]);
  const Page = pages[page];
  return <Layout activePage={page}><Page /></Layout>;
}
