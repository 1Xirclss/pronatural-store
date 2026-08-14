import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';

export default function TopNavbar() {
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `text-[11px] font-bold tracking-[0.15em] uppercase transition-colors whitespace-nowrap ${
      isActive ? 'text-orange-700 border-b-2 border-orange-700 pb-1' : 'text-brand-dark hover:text-gray-500'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block text-[11px] font-bold tracking-[0.2em] uppercase py-3 border-b border-gray-100 transition-colors ${
      isActive ? 'text-orange-700' : 'text-brand-dark'
    }`;

  return (
    <>
      <header className="flex items-center justify-between py-5 px-6 md:px-12 bg-brand-bg sticky top-0 z-50 border-b border-gray-100">
        {/* Logo */}
        <Link to="/" className="text-[20px] md:text-[22px] font-bold tracking-tighter text-brand-dark shrink-0 mr-8 lg:mr-16">
          PRONATURAL
        </Link>

        {/* Desktop Nav - Visible in lg screens (1024px+) to prevent crowding */}
        <nav className="hidden lg:flex items-center gap-8 lg:gap-12">
          <NavLink to="/" end className={navLinkClass}>INICIO</NavLink>
          <NavLink to="/catalogo" className={navLinkClass}>CATÁLOGO</NavLink>
          <NavLink to="/acerca" className={navLinkClass}>ACERCA DE</NavLink>
          <NavLink to="/resenas" className={navLinkClass}>RESEÑAS</NavLink>
          <NavLink to="/contacto" className={navLinkClass}>CONTACTO</NavLink>
        </nav>

        {/* Right: Cart + Profile/Auth + Hamburger */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          {/* Carrito */}
          <Link to="/carrito" className="relative text-brand-dark hover:text-gray-600 transition-colors p-1" title="Ver Carrito">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#b45309] text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none shadow">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

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
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col gap-[5px] p-1 text-brand-dark cursor-pointer ml-2"
            aria-label="Abrir menú"
          >
            <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-current transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Menu Dropdown */}
      <div className={`lg:hidden fixed top-[65px] left-0 right-0 z-40 bg-brand-bg border-b border-gray-100 overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100 shadow-xl' : 'max-h-0 opacity-0'}`}>
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
