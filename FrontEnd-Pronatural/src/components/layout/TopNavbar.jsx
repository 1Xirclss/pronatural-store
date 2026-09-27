import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

export default function TopNavbar() {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 12);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollState);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `relative py-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b45309] ${
      isActive ? 'text-orange-700' : 'text-brand-dark hover:text-orange-700'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block text-[11px] font-bold tracking-[0.2em] uppercase py-3 border-b border-gray-100 transition-colors ${
      isActive ? 'text-orange-800 border-b-orange-700 pl-3 border-l-2' : 'text-brand-dark hover:text-orange-700'
    }`;

  return (
    <>
      <header className={`sticky top-0 z-50 flex items-center justify-between border-b px-6 md:px-12 transition-[padding,background-color,box-shadow] duration-300 ${isScrolled ? 'bg-[#fdfaf6]/95 py-3 shadow-[0_8px_24px_rgba(11,34,22,0.07)] backdrop-blur-md border-[#e8e8df]' : 'border-gray-100 bg-brand-bg py-5'}`}>
        {/* Logo */}
        <Link to="/" className="text-[20px] md:text-[22px] font-bold tracking-tighter text-brand-dark shrink-0 mr-8 lg:mr-16">
          PRONATURAL
        </Link>

        {/* Desktop Nav - Visible in lg screens (1024px+) to prevent crowding */}
        <nav aria-label="Navegación principal" className="hidden items-center gap-8 lg:flex lg:gap-12">
          {[
            { to: '/', label: 'INICIO', end: true },
            { to: '/catalogo', label: 'CATÁLOGO' },
            { to: '/acerca', label: 'ACERCA DE' },
            { to: '/resenas', label: 'RESEÑAS' },
            { to: '/contacto', label: 'CONTACTO' },
          ].map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {({ isActive }) => <>{label}{isActive && <motion.span layoutId="public-nav-indicator" transition={{ duration: shouldReduceMotion ? 0 : 0.22 }} className="absolute inset-x-0 -bottom-1 h-0.5 origin-left bg-orange-700" />}</>}
            </NavLink>
          ))}
        </nav>

        {/* Right: Cart + Profile/Auth + Hamburger */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Carrito */}
          <NavLink to="/carrito" aria-label={`Ver carrito, ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`} className={({ isActive }) => `relative flex h-10 items-center gap-2 rounded-full border px-3 transition-[color,background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${isActive ? 'border-[#0b2216] bg-[#0b2216] text-white shadow-sm' : 'border-[#d9ded8] bg-white/80 text-brand-dark hover:border-[#0b2216] hover:bg-white hover:shadow-sm'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="text-[9px] font-bold tracking-[0.12em] uppercase">Carrito</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={totalItems}
                initial={shouldReduceMotion ? false : { scale: 0.65, y: -3, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={shouldReduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                aria-live="polite"
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] leading-none font-bold ${totalItems ? 'bg-[#b45309] text-white' : 'bg-[#edf0eb] text-[#526057]'}`}
              >
                {totalItems > 9 ? '9+' : totalItems}
              </motion.span>
            </AnimatePresence>
          </NavLink>

          {/* Separador vertical en pantallas medianas y grandes */}
          <div className="hidden sm:block w-[1px] h-4 bg-gray-200"></div>

          {/* Perfil o Registro */}
          {isAuthenticated ? (
            <Link
              to="/perfil"
              className="text-[10px] font-bold tracking-[0.15em] text-[#123827] hover:text-brand-dark uppercase transition-colors hidden sm:block whitespace-nowrap"
            >
              PERFIL
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/perfil"
                className="text-[10px] font-bold tracking-[0.15em] text-gray-500 hover:text-brand-dark uppercase transition-colors whitespace-nowrap px-1"
              >
                PERFIL
              </Link>
              <Link
                to="/register"
                className="text-[10px] font-bold tracking-[0.15em] bg-[#0a2016] text-white px-4 py-2 rounded-[4px] hover:bg-[#123827] uppercase transition-colors whitespace-nowrap shadow-sm"
              >
                REGISTRARSE
              </Link>
            </div>
          )}

          {/* Hamburguesa (para pantallas menores a lg) */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-2 flex cursor-pointer flex-col gap-[5px] p-2 text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#b45309] lg:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${menuOpen ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[1.5px] w-5 bg-current transition-all duration-300 ${menuOpen ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Menu Dropdown */}
      <div id="mobile-navigation" aria-hidden={!menuOpen} inert={!menuOpen} className={`lg:hidden fixed top-[65px] left-0 right-0 z-40 bg-brand-bg border-b border-gray-100 overflow-hidden transition-[max-height,opacity,box-shadow] duration-300 ${menuOpen ? 'max-h-[calc(100dvh-65px)] opacity-100 shadow-xl' : 'pointer-events-none max-h-0 opacity-0'}`}>
        <nav className="px-6 py-4 space-y-1">
          <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>INICIO</NavLink>
          <NavLink to="/catalogo" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>CATÁLOGO</NavLink>
          <NavLink to="/acerca" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>ACERCA DE</NavLink>
          <NavLink to="/resenas" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>RESEÑAS</NavLink>
          <NavLink to="/contacto" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>CONTACTO</NavLink>
          {isAuthenticated ? (
            <NavLink to="/perfil" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>PERFIL</NavLink>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link to="/perfil" className="text-center text-[10px] font-bold tracking-[0.15em] py-2.5 border border-gray-300 rounded text-brand-dark uppercase" onClick={() => setMenuOpen(false)}>PERFIL</Link>
              <Link to="/register" className="text-center text-[10px] font-bold tracking-[0.15em] py-2.5 bg-[#0a2016] rounded text-white uppercase" onClick={() => setMenuOpen(false)}>REGISTRARSE</Link>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}
