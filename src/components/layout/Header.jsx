import { useEffect, useRef, useState } from 'react';

const links = [
  ['accueil', 'Accueil'],
  ['simulation', 'Simulation'],
  ['performances', 'Données et performances'],
];

export default function Header({ activePage, isAuthenticated = false, admin = null, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);

  useEffect(() => { setMenuOpen(false); }, [activePage]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="border-b border-line bg-white">
      <div className="page-container flex flex-wrap items-center justify-between gap-x-5 gap-y-2 py-3 sm:py-5">
        <a href={isAuthenticated ? '#accueil' : '#'} className="flex min-h-11 min-w-0 items-center gap-3 text-lg font-bold sm:text-xl" aria-label="CardioScope">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand" aria-hidden="true">
            <svg viewBox="0 0 30 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M1 12h6l3-4 3 9 4-13 3 10 2-2h7" /></svg>
          </span>
          CardioScope
        </a>

        {isAuthenticated && (
          <>
            <button
              ref={menuButton}
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm font-bold text-ink sm:hidden"
              aria-expanded={menuOpen}
              aria-controls="navigation-principale"
              onClick={() => setMenuOpen(open => !open)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
              {menuOpen ? 'Fermer' : 'Menu'}
            </button>
            <nav
              id="navigation-principale"
              aria-label="Navigation principale"
              className={`${menuOpen ? 'flex' : 'hidden'} w-full flex-col gap-1 pt-3 text-sm sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-4 sm:pt-0 lg:gap-6`}
            >
              {links.map(([page, label]) => (
                <a
                  key={page}
                  href={`#${page}`}
                  onClick={() => setMenuOpen(false)}
                  aria-current={activePage === page ? 'page' : undefined}
                  className={`flex min-h-11 items-center rounded-lg border-l-2 px-3 sm:rounded-none sm:border-b-2 sm:border-l-0 sm:px-1 ${activePage === page ? 'border-brand bg-brand-soft font-bold text-brand sm:bg-transparent' : 'border-transparent text-muted hover:bg-surface hover:text-brand'}`}
                >
                  {label}
                </a>
              ))}
              <div className="flex items-center gap-3 border-t border-line pt-2 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <span className="text-xs font-semibold text-muted">
                  {admin?.username ?? 'Admin'}
                </span>
                {typeof onLogout === 'function' && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center rounded-md border border-line px-2.5 py-1 text-xs font-bold text-muted transition hover:border-brand hover:text-brand"
                  >
                    Déconnexion
                  </button>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
