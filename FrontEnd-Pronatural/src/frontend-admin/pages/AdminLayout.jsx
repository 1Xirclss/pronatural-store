import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalData } from '../../context/GlobalDataContext';
import { ADMIN_PREFIX } from '../../config';
import PageTransition from '../../components/common/PageTransition';
import LoadingScreen from '../../components/common/LoadingScreen';
const IconDashboard = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const IconInventory = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>
);
const IconSales = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M1 4h3l2.5 13h10.5l3-9H5.5" />
    <circle cx="8" cy="20" r="1.5" />
    <circle cx="17" cy="20" r="1.5" />
  </svg>
);
const IconSellers = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconReports = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconSettings = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
function AdminSidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const role = user?.role || 'Admin';
  const navLink = ({ isActive }) =>
    `flex items-center gap-3 border-l-2 px-4 py-2.5 rounded-r-lg text-[13px] transition-all duration-200 font-medium ${
      isActive
        ? 'border-[#4ade80] bg-[#1b4332]/80 text-[#4ade80] shadow-sm'
        : 'border-transparent text-gray-400 hover:bg-white/[0.04] hover:text-white'
    }`;
  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      <motion.aside
        initial={shouldReduceMotion ? false : { x: -12, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`w-[240px] flex-shrink-0 bg-[#161b1e] border-r border-white/5 min-h-screen flex flex-col py-6 absolute md:relative z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
      <div className="px-6 mb-8 flex items-center gap-3">
        <div>
          <p className="text-[#4ade80] text-[15px] font-extrabold leading-none tracking-[0.04em]">PRONATURAL</p>
          <p className="text-gray-500 text-[10px] mt-1 tracking-wider">Portal {role === 'Admin' ? 'Admin' : 'Vendedor'}</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1.5">
        {role === 'Admin' && (
          <>
            <NavLink to={ADMIN_PREFIX} end className={navLink}>
              <IconDashboard /><span>Panel Principal</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/catalogo`} className={navLink}>
              <IconInventory /><span>Catálogo</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/inventario`} className={navLink}>
              <IconInventory /><span>Inventario</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/ventas/registrar`} className={navLink}>
              <IconSales /><span>Nueva Venta</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/ventas/historial`} className={navLink}>
              <IconReports /><span>Historial de Ventas</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/vendedores`} className={navLink}>
              <IconSellers /><span>Vendedores</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/reportes`} className={navLink}>
              <IconReports /><span>Reportes</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/resenas`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Reseñas</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/categorias`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Categorías</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/clientes`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Clientes</span>
            </NavLink>
          </>
        )}
        {role === 'Employee' && (
          <>
            <NavLink to={`${ADMIN_PREFIX}/vendedor`} end className={navLink}>
              <IconDashboard /><span>Panel de Control</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/ventas/registrar`} className={navLink}>
              <IconSales /><span>Nueva Venta</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/ventas/historial`} className={navLink}>
              <IconReports /><span>Historial de Ventas</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/catalogo`} className={navLink}>
              <IconInventory /><span>Catálogo</span>
            </NavLink>
            <NavLink to={`${ADMIN_PREFIX}/resenas`} className={navLink}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Reseñas</span>
            </NavLink>
          </>
        )}
      </nav>
      <div className="px-4 pt-4 border-t border-white/5 space-y-1 mt-auto">
        <NavLink to={`${ADMIN_PREFIX}/ajustes`} className={navLink}>
          <IconSettings /><span>Ajustes</span>
        </NavLink>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium text-gray-400 hover:text-white transition-all text-left cursor-pointer"
        >
          <IconLogout /><span>Cerrar Sesión</span>
        </button>
      </div>
      </motion.aside>
    </>
  );
}
function AdminTopbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products, sales, config } = useGlobalData();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifFilter, setNotifFilter] = useState('todas');

  const [readNotifs, setReadNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('admin_read_notifs') || '[]');
    } catch {
      return [];
    }
  });

  const portalEnabled = config?.notificaciones?.enabled !== false;
  const lowStockEnabled = config?.notificaciones?.lowStock !== false;
  const outOfStockEnabled = config?.notificaciones?.outOfStock !== false;

  const notifications = [];

  if (portalEnabled) {
    // 1. Productos Agotados (Stock 0) -> Crítico
    if (outOfStockEnabled) {
      products?.forEach(p => {
        const stock = typeof p.stock === 'number' ? p.stock : 0;
        if (stock === 0) {
          notifications.push({
            id: `out-${p._id || p.id}`,
            type: 'alert',
            severity: 'critical',
            title: `¡Producto Agotado!`,
            message: `${p.nombreProducto || p.name || 'Producto'} no tiene existencias.`,
            time: 'Alerta Crítica',
            link: `${ADMIN_PREFIX}/inventario`
          });
        }
      });
    }

    // 2. Stock Bajo (1..15) -> Advertencia
    if (lowStockEnabled) {
      products?.forEach(p => {
        const stock = typeof p.stock === 'number' ? p.stock : 0;
        if (stock > 0 && stock <= 15) {
          notifications.push({
            id: `low-${p._id || p.id}`,
            type: 'alert',
            severity: 'warning',
            title: `Stock Bajo: ${p.nombreProducto || p.name || 'Producto'}`,
            message: `Quedan únicamente ${stock} unidades disponibles.`,
            time: 'Alerta de Inventario',
            link: `${ADMIN_PREFIX}/inventario`
          });
        }
      });
    }

    // 3. Ventas Recientes -> Éxito
    const recentSales = (sales || [])
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
      .slice(0, 5);

    recentSales.forEach(s => {
      const timeStr = s.createdAt ? new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente';
      const total = typeof s.total === 'number' ? s.total.toFixed(2) : (s.total || '0.00');
      notifications.push({
        id: `sale-${s._id || s.id}`,
        type: 'sale',
        severity: 'info',
        title: `Nueva Venta #${(s._id || s.id).toString().substring(0, 6).toUpperCase()}`,
        message: `Venta realizada exitosamente por $${total}`,
        time: timeStr,
        link: `${ADMIN_PREFIX}/ventas/historial`
      });
    });
  }

  const unreadCount = notifications.filter(n => !readNotifs.includes(n.id)).length;

  const markAsRead = (id) => {
    if (!readNotifs.includes(id)) {
      const updated = [...readNotifs, id];
      setReadNotifs(updated);
      localStorage.setItem('admin_read_notifs', JSON.stringify(updated));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = Array.from(new Set([...readNotifs, ...allIds]));
    setReadNotifs(updated);
    localStorage.setItem('admin_read_notifs', JSON.stringify(updated));
  };

  const filteredNotifs = notifications.filter(n => {
    if (notifFilter === 'alertas') return n.type === 'alert';
    if (notifFilter === 'ventas') return n.type === 'sale';
    return true;
  });

  const routeTitles = [
    [`${ADMIN_PREFIX}/ventas/registrar`, 'Nueva venta'],
    [`${ADMIN_PREFIX}/ventas/historial`, 'Historial de ventas'],
    [`${ADMIN_PREFIX}/vendedores`, 'Vendedores'],
    [`${ADMIN_PREFIX}/inventario`, 'Inventario'],
    [`${ADMIN_PREFIX}/categorias`, 'Categorías'],
    [`${ADMIN_PREFIX}/clientes`, 'Clientes'],
    [`${ADMIN_PREFIX}/catalogo`, 'Catálogo'],
    [`${ADMIN_PREFIX}/reportes`, 'Reportes'],
    [`${ADMIN_PREFIX}/resenas`, 'Reseñas'],
    [`${ADMIN_PREFIX}/ajustes`, 'Ajustes'],
    [`${ADMIN_PREFIX}/vendedor`, 'Panel de control'],
    [ADMIN_PREFIX, 'Panel principal'],
  ];
  const pageTitle = routeTitles.find(([path]) => location.pathname === path || (path !== ADMIN_PREFIX && location.pathname.startsWith(`${path}/`)))?.[1] || 'Administración';

  return (
    <header className="h-[72px] flex items-center justify-between px-4 md:px-8 flex-shrink-0 bg-[#0d1114]/95 backdrop-blur-md border-b border-white/5 relative z-40">
      <div className="flex items-center gap-3 min-w-0">
      <button onClick={toggleSidebar} aria-label="Abrir menú de administración" className="md:hidden text-gray-400 hover:text-white hover:bg-white/5 p-2 rounded-lg transition-colors">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <motion.div
        key={location.pathname}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        aria-live="polite"
        className="min-w-0"
      >
        <p className="text-white text-[13px] sm:text-[14px] font-semibold truncate">{pageTitle}</p>
        <p className="text-[#4ade80] text-[9px] font-bold tracking-[0.16em] uppercase mt-0.5">ProNatural · Panel de gestión</p>
      </motion.div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            aria-label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
            aria-expanded={showNotif}
            className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4ade80]"
            title="Notificaciones"
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-[#30b466] rounded-full shadow-lg shadow-[#30b466]/40 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <motion.section
              initial={shouldReduceMotion ? false : { opacity: 0, y: -8, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Centro de notificaciones"
              className="fixed inset-x-3 top-[76px] z-50 flex max-h-[min(620px,calc(100dvh-92px))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111719] shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[410px] sm:max-h-[min(620px,calc(100dvh-110px))]"
            >
              <div className="relative overflow-hidden border-b border-white/[0.07] bg-[radial-gradient(ellipse_at_top_right,_rgba(48,180,102,0.17),_transparent_58%)] px-5 pb-4 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-[16px] font-semibold tracking-tight text-white">Notificaciones</h3>
                      <span className="rounded-full border border-[#30b466]/20 bg-[#30b466]/15 px-2.5 py-1 text-[10px] font-bold text-[#65e894]">
                        {unreadCount ? `${unreadCount} nuevas` : 'Al día'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[12px] text-gray-400">
                      {notifications.length ? `${notifications.length} avisos recientes` : 'Mantente al tanto de la actividad'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="min-h-9 rounded-lg px-2 text-[11px] font-semibold text-[#65e894] transition-colors hover:bg-[#30b466]/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4ade80]"
                    >
                      Marcar todo leído
                    </button>
                  )}
                </div>
              </div>

              <div role="tablist" aria-label="Filtrar notificaciones" className="flex gap-1 border-b border-white/[0.07] bg-[#131a1c] p-2">
                {[
                  { id: 'todas', label: 'Todas', count: notifications.length },
                  { id: 'alertas', label: 'Alertas', count: notifications.filter((notification) => notification.type === 'alert').length },
                  { id: 'ventas', label: 'Ventas', count: notifications.filter((notification) => notification.type === 'sale').length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={notifFilter === tab.id}
                    onClick={() => setNotifFilter(tab.id)}
                    className={`min-h-10 flex-1 rounded-lg px-2 text-[11px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4ade80] ${notifFilter === tab.id ? 'bg-[#1b4332] text-[#6cf098] shadow-inner shadow-black/10' : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-100'}`}
                  >
                    {tab.label}<span className={`ml-1.5 ${notifFilter === tab.id ? 'text-[#9af4b7]' : 'text-gray-500'}`}>{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin" aria-live="polite">
                {!portalEnabled ? (
                  <div className="px-6 py-12 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-gray-400"><IconBell /></span>
                    <p className="mt-4 text-[13px] font-semibold text-gray-200">Avisos desactivados</p>
                    <p className="mx-auto mt-1 max-w-[250px] text-[12px] leading-relaxed text-gray-500">Puedes volver a activarlos desde Ajustes del Sistema.</p>
                  </div>
                ) : filteredNotifs.length > 0 ? (
                  <ul className="divide-y divide-white/[0.055]">
                    {filteredNotifs.map((n, index) => {
                      const isRead = readNotifs.includes(n.id);
                      const isAlert = n.type === 'alert';
                      const isCritical = n.severity === 'critical';
                      return (
                        <motion.li
                          key={n.id}
                          initial={shouldReduceMotion ? false : { opacity: 0, y: 7 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: shouldReduceMotion ? 0 : 0.18, delay: shouldReduceMotion ? 0 : Math.min(index * 0.025, 0.15) }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              markAsRead(n.id);
                              setShowNotif(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`group flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#4ade80] ${isRead ? 'bg-transparent hover:bg-white/[0.035]' : 'bg-[#30b466]/[0.035] hover:bg-[#30b466]/[0.075]'}`}
                          >
                            <span className={`relative mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${isCritical ? 'border-rose-400/15 bg-rose-400/10 text-rose-300' : isAlert ? 'border-amber-300/15 bg-amber-300/10 text-amber-200' : 'border-[#30b466]/15 bg-[#30b466]/10 text-[#72e99a]'}`} aria-hidden="true">
                              {isCritical ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 9v4m0 4h.01M10.3 3.9 2.4 17.5a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
                              ) : isAlert ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 8v4m0 4h.01M4.9 19h14.2a2 2 0 0 0 1.8-2.9L13.8 4a2 2 0 0 0-3.6 0l-7.1 12.1A2 2 0 0 0 4.9 19Z" /></svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 7h18v13H3zM3 7l2-3h14l2 3M8 11h8M8 15h5" /></svg>
                              )}
                              {!isRead && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#111719] bg-[#4ade80]" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-start justify-between gap-2">
                                <span className={`line-clamp-2 text-[12px] leading-snug ${isRead ? 'font-medium text-gray-300' : 'font-semibold text-white'}`}>{n.title}</span>
                                <svg aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600 transition-all group-hover:translate-x-0.5 group-hover:text-[#72e99a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                              </span>
                              <span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-gray-400">{n.message}</span>
                              <span className="mt-2 block text-[10px] font-medium tracking-wide text-gray-500">{n.time}</span>
                            </span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-gray-500"><IconBell /></span>
                    <p className="mt-4 text-[13px] font-semibold text-gray-200">Todo tranquilo</p>
                    <p className="mt-1 text-[12px] text-gray-500">No hay avisos en esta categoría.</p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.07] bg-[#0e1416] px-5 py-3">
                <span className="text-[10px] font-medium tracking-wide text-gray-500">ACTIVIDAD RECIENTE</span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6ad88e]"><span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />ACTUALIZADO</span>
              </div>
            </motion.section>
          )}
        </div>
        {/* Perfil */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} aria-expanded={showProfile} aria-label={`Perfil de ${user?.name || 'usuario'}`} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 sm:pr-3 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4ade80]">
            <div className="w-8 h-8 bg-[#1b4332] text-[#4ade80] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-gray-200 text-[13px] font-semibold leading-none">{user?.name || 'Alexander Vance'}</p>
              <p className="text-gray-500 text-[11px] mt-1">{user?.role === 'Admin' ? 'Gerente' : 'Vendedor'}</p>
            </div>
          </button>
          {showProfile && (
            <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: shouldReduceMotion ? 0 : 0.15 }} className="absolute right-0 mt-2 w-64 bg-[#161b1e] border border-white/10 rounded-[10px] shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-[#0d1114] flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1b4332] text-[#4ade80] rounded-full flex items-center justify-center text-[16px] font-bold flex-shrink-0">
                  {(user?.name || 'A')[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-white text-[14px] font-semibold truncate">{user?.name || 'Alexander Vance'}</p>
                  <p className="text-gray-400 text-[12px] mt-0.5 truncate">{user?.email || 'admin@pronatural.com'}</p>
                </div>
              </div>
              <div className="p-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-left cursor-pointer"
                >
                  <IconLogout /> Cerrar Sesión
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { isLoading } = useGlobalData();

  return (
    <div className="flex h-screen bg-[#0d1114] font-sans overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden relative bg-[radial-gradient(ellipse_at_top_right,_rgba(48,180,102,0.055),_transparent_38%)]">
        <AdminTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto px-4 pt-5 pb-24 md:px-8 md:pt-8 md:pb-28 custom-scrollbar">
          <div className="admin-interface-motion h-full">
          <PageTransition>
            {isLoading ? <LoadingScreen label="Cargando panel" /> : <Outlet />}
          </PageTransition>
          </div>
        </main>
        <footer className="hidden md:flex absolute bottom-0 left-0 right-0 px-8 py-4 items-center justify-between bg-gradient-to-t from-[#0d1114] via-[#0d1114]/95 to-transparent pointer-events-none">
          <p className="text-[#4ade80] text-[11px] font-bold tracking-wider pointer-events-auto">Pro Natural</p>
          <p className="text-gray-600 text-[11px] pointer-events-auto">© 2024 Pro Natural. Pasión por la naturaleza.</p>
          <div className="flex gap-4 pointer-events-auto">
            <button className="text-gray-500 text-[11px] hover:text-gray-300 transition-colors">Política de Privacidad</button>
            <button className="text-gray-500 text-[11px] hover:text-gray-300 transition-colors">Términos de Servicio</button>
            <button className="text-gray-500 text-[11px] hover:text-gray-300 transition-colors">Soporte</button>
          </div>
        </footer>
      </div>
    </div>
  );
}
