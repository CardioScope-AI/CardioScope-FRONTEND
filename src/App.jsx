import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import PerformancesPage from './pages/PerformancesPage.jsx';
const pages = { accueil: HomePage, simulation: SimulationPage, performances: PerformancesPage };
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
    document.title = `${page === 'accueil' ? 'Accueil' : page === 'simulation' ? 'Simulation' : 'Données et performances'} | CardioScope`;
  }, [page]);
  const Page = pages[page];
  return <Layout activePage={page}><Page /></Layout>;
}
