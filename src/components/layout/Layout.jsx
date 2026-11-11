import Header from './Header.jsx';
import Footer from './Footer.jsx';
export default function Layout({ children, activePage }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#contenu" className="skip-link">Aller au contenu principal</a>
      <Header activePage={activePage} />
      <main id="contenu" tabIndex={-1} className="page-container flex-1 py-7 sm:py-8">{children}</main>
      <Footer />
    </div>
  );
}
