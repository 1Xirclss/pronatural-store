import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalData } from '../../context/GlobalDataContext';
import { ADMIN_PREFIX } from '../../config';
const IconLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="#75e29f" />
    <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3L12 21Z" fill="#30b466" />
    <path d="M8 12C8 12 10.5 9 14 9C14 9 12.5 12 9 15L8 12Z" fill="#0d1f14" />
  </svg>
);
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
const IconSuppliers = () => (
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
  const role = user?.role || 'Admin';
  const navLink = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] transition-all font-medium ${
      isActive
        ? 'bg-[#1b4332] text-[#4ade80]'
        : 'text-gray-400 hover:text-white'
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
      <aside className={`w-[240px] flex-shrink-0 bg-[#161b1e] border-r border-white/5 min-h-screen flex flex-col py-6 absolute md:relative z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="px-6 mb-8 flex items-center gap-3">
        <IconLogo />
        <div>
          <p className="text-[#4ade80] text-[16px] font-bold leading-none tracking-tight">Pro Natural</p>
          <p className="text-gray-500 text-[10px] mt-1 tracking-wider">Portal {role === 'Admin' ? 'Admin' : 'Vendedor'}</p>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-1">
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
              <IconSuppliers /><span>Vendedores</span>
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
    </aside>
    </>
  );
}
function AdminTopbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products, sales, config } = useGlobalData();
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
            link: '/inventario'
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

  return (
    <header className="h-[72px] flex items-center justify-between md:justify-end px-4 md:px-8 flex-shrink-0 bg-[#0d1114] border-b border-white/5 relative z-40">
      <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white p-2">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      
      <div className="flex items-center gap-4 md:gap-6">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
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
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#161b1e] border border-white/10 rounded-[14px] shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-[#0d1114] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-[14px] font-semibold">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-bold bg-[#1b4332] text-[#4ade80] rounded-full">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#4ade80] hover:underline font-medium cursor-pointer"
                  >
                    Marcar todas leídas
                  </button>
                )}
              </div>

              <div className="flex border-b border-white/5 bg-[#121619] p-1 gap-1 text-[12px]">
                <button
                  onClick={() => setNotifFilter('todas')}
                  className={`flex-1 py-1.5 rounded-[6px] font-medium transition-colors cursor-pointer ${notifFilter === 'todas' ? 'bg-[#1b4332] text-[#4ade80]' : 'text-gray-400 hover:text-white'}`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('alertas')}
                  className={`flex-1 py-1.5 rounded-[6px] font-medium transition-colors cursor-pointer ${notifFilter === 'alertas' ? 'bg-[#1b4332] text-[#4ade80]' : 'text-gray-400 hover:text-white'}`}
                >
                  Alertas ({notifications.filter(n => n.type === 'alert').length})
                </button>
                <button
                  onClick={() => setNotifFilter('ventas')}
                  className={`flex-1 py-1.5 rounded-[6px] font-medium transition-colors cursor-pointer ${notifFilter === 'ventas' ? 'bg-[#1b4332] text-[#4ade80]' : 'text-gray-400 hover:text-white'}`}
                >
                  Ventas ({notifications.filter(n => n.type === 'sale').length})
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                {!portalEnabled ? (
                  <div className="p-6 text-center text-gray-400 text-[13px]">
                    <p>🔕 Notificaciones del portal desactivadas.</p>
                    <p className="text-[11px] text-gray-500 mt-1">Puedes activarlas en Ajustes del Sistema.</p>
                  </div>
                ) : filteredNotifs.length > 0 ? (
                  filteredNotifs.map(n => {
                    const isRead = readNotifs.includes(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          setShowNotif(false);
                          if (n.link) navigate(n.link);
                        }}
                        className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${isRead ? 'bg-transparent opacity-60 hover:opacity-100 hover:bg-white/5' : 'bg-[#1b4332]/20 hover:bg-[#1b4332]/30'}`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.severity === 'critical' && (
                            <span className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[14px]">🚫</span>
                          )}
                          {n.severity === 'warning' && (
                            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[14px]">⚠️</span>
                          )}
                          {n.severity === 'info' && (
                            <span className="w-8 h-8 rounded-full bg-[#30b466]/20 text-[#4ade80] flex items-center justify-center text-[14px]">🛍️</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-[13px] truncate ${isRead ? 'text-gray-300 font-normal' : 'text-white font-semibold'}`}>
                              {n.title}
                            </p>
                            {!isRead && <span className="w-2 h-2 rounded-full bg-[#30b466] shrink-0"></span>}
                          </div>
                          <p className="text-gray-400 text-[12px] mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-gray-500 text-[10px] mt-1">{n.time}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500 text-[13px]">
                    No hay notificaciones en esta sección
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }} className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 sm:pr-3 rounded-full transition-colors">
            <div className="w-8 h-8 bg-[#1b4332] text-[#4ade80] rounded-full flex items-center justify-center text-[13px] font-bold shrink-0">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-gray-200 text-[13px] font-semibold leading-none">{user?.name || 'Alexander Vance'}</p>
              <p className="text-gray-500 text-[11px] mt-1">{user?.role === 'Admin' ? 'Gerente' : 'Vendedor'}</p>
            </div>
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 bg-[#161b1e] border border-white/10 rounded-[10px] shadow-2xl z-50 overflow-hidden">
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0d1114] font-sans overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative">
        <AdminTopbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <Outlet />
        </main>
        <footer className="hidden md:flex absolute bottom-0 left-0 right-0 px-8 py-4 items-center justify-between pointer-events-none">
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
