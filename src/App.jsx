import { useEffect, useState } from 'react';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SimulationPage from './pages/SimulationPage.jsx';
import PerformancesPage from './pages/PerformancesPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import { fetchAdminSession, logoutAdmin } from './api/auth.js';

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
  // État partagé de session : 'loading' | 'admin' | 'anonymous'
  const [authStatus, setAuthStatus] = useState('loading');
  const [admin, setAdmin] = useState(null);
  const [page, setPage] = useState(readPage);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Vérification de la session serveur /admin/me au chargement et rechargement
  useEffect(() => {
    let cancelled = false;
    async function checkSession() {
      try {
        const data = await fetchAdminSession();
        if (cancelled) return;
        if (data && data.admin) {
          setAuthStatus('admin');
          setAdmin(data.admin);
        } else {
          setAuthStatus('anonymous');
          setAdmin(null);
        }
      } catch {
        if (!cancelled) {
          setAuthStatus('anonymous');
          setAdmin(null);
        }
      }
    }
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#contenu') return;
      setPage(readPage());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (authStatus !== 'admin') {
      document.title = 'Connexion | CardioScope';
    } else {
      document.title = `${pageTitles[page] ?? 'Accueil'} | CardioScope`;
    }
  }, [authStatus, page]);

  const handleLoginSuccess = (data) => {
    setAuthStatus('admin');
    setAdmin(data?.admin ?? { username: 'Admin' });
    setSessionExpiredNotice(false);
    setPage('simulation');
    window.location.hash = '#simulation';
  };

  const handleLogout = async () => {
    await logoutAdmin();
    // Vider les données privées en mémoire
    setAuthStatus('anonymous');
    setAdmin(null);
    setSessionExpiredNotice(false);
    setPage('connexion-admin');
    window.location.hash = '';
  };

  const handleSessionExpired = () => {
    setAuthStatus('anonymous');
    setAdmin(null);
    setSessionExpiredNotice(true);
    setPage('connexion-admin');
    window.location.hash = '';
  };

  const isAuthenticated = authStatus === 'admin';

  return (
    <Layout
      activePage={!isAuthenticated ? 'connexion-admin' : page}
      isAuthenticated={isAuthenticated}
      admin={admin}
      onLogout={handleLogout}
    >
      {authStatus === 'loading' ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted" role="status">
            <span className="size-4 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-hidden="true" />
            <span>Vérification de la session...</span>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <AdminLoginPage
          onLoginSuccess={handleLoginSuccess}
          sessionExpired={sessionExpiredNotice}
        />
      ) : (
        (() => {
          const PageComponent = pages[page] ?? HomePage;
          return <PageComponent onSessionExpired={handleSessionExpired} />;
        })()
      )}
    </Layout>
  );
}
