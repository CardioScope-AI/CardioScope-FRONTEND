import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import PerformancesPage from './pages/PerformancesPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';

const pages = {
  accueil: HomePage,
  simulation: SimulationPage,
  performances: PerformancesPage,
  historique: HistoryPage,
  'connexion-admin': AdminLoginPage,
};

function readPage() {
  const hash = window.location.hash.slice(1);
  return Object.hasOwn(pages, hash) ? hash : 'accueil';
}

const pageTitles = {
  accueil: 'Accueil',
  simulation: 'Simulation',
  performances: 'Données et performances',
  historique: 'Historique',
  'connexion-admin': 'Connexion',
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
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
    if (!isAuthenticated) {
      document.title = 'Connexion | CardioScope';
    } else {
      document.title = `${pageTitles[page] ?? 'Accueil'} | CardioScope`;
    }
  }, [isAuthenticated, page]);

  const handleLoginSuccess = (data) => {
    setIsAuthenticated(true);
    setAdmin(data?.admin ?? { username: 'Admin' });
    setPage('simulation');
    window.location.hash = '#simulation';
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdmin(null);
    setPage('connexion-admin');
    window.location.hash = '';
  };

  // Espace privé : seule la page de connexion est accessible sans être connecté
  const Page = !isAuthenticated ? AdminLoginPage : pages[page] ?? HomePage;

  return (
    <Layout
      activePage={!isAuthenticated ? 'connexion-admin' : page}
      isAuthenticated={isAuthenticated}
      admin={admin}
      onLogout={handleLogout}
    >
      <Page onLoginSuccess={handleLoginSuccess} />
    </Layout>
  );
}
