const links = [
  ['accueil', 'Accueil'],
  ['simulation', 'Simulation'],
  ['performances', 'Données et performances'],
];
export default function Header({ activePage }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="page-container flex flex-wrap items-center justify-between gap-5 py-5">
        <a href="#accueil" className="flex items-center gap-3 text-xl font-bold" aria-label="CardioScope - accueil">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand" aria-hidden="true">
            <svg viewBox="0 0 30 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M1 12h6l3-4 3 9 4-13 3 10 2-2h7" /></svg>
          </span>
          CardioScope
        </a>
        <nav aria-label="Navigation principale" className="flex flex-wrap gap-x-6 gap-y-3 text-sm sm:gap-x-12">
          {links.map(([page, label]) => (
            <a key={page} href={`#${page}`} aria-current={activePage === page ? 'page' : undefined}
              className={`border-b pb-2 ${activePage === page ? 'border-brand font-bold text-brand' : 'border-transparent text-muted hover:text-brand'}`}>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
