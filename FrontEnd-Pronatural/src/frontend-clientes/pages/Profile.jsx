import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white border border-gray-100 shadow-xl p-8 md:p-12 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#b45309]"></div>
          
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[#f4f3ec] rounded-full flex items-center justify-center text-gray-500 shadow-inner relative">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path>
              </svg>
              <span className="absolute bottom-0 right-0 bg-[#b45309] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                Invitado
              </span>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-brand-dark mb-1">
            PERFIL DE INVITADO
          </h1>
          <p className="text-[10px] text-[#b45309] font-bold uppercase tracking-[0.2em] mb-6">
            MODO INVITADO ACTIVO
          </p>

          <div className="space-y-4 mb-8 text-left">
            <div className="bg-[#f9f8f4] p-4 border border-gray-100 flex items-center gap-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <div>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Estado</p>
                <p className="text-[13px] font-semibold text-brand-dark">Invitado ProNatural</p>
              </div>
            </div>

            <div className="bg-[#f9f8f4] p-4 border border-gray-100 flex items-center gap-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <div>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Correo Electrónico</p>
                <p className="text-[13px] font-semibold text-gray-400">Sin iniciar sesión</p>
              </div>
            </div>
          </div>

          <div className="bg-[#f4f3ec]/60 border border-amber-200/60 p-4 rounded mb-8 text-left">
            <p className="text-[11px] text-gray-600 leading-relaxed">
              💡 Estás navegando libremente como invitado. Puedes explorar el catálogo y agregar productos a tu carrito. Para realizar pedidos y guardar tus direcciones, crea tu cuenta.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/register"
              className="w-full flex items-center justify-center bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-3.5 hover:bg-[#123827] transition-colors rounded shadow-sm"
            >
              CREAR UNA CUENTA
            </Link>
            <Link
              to="/login"
              className="w-full flex items-center justify-center bg-white text-brand-dark text-[10px] font-bold tracking-[0.2em] uppercase py-3.5 hover:bg-gray-100 transition-colors border border-gray-300 rounded"
            >
              INICIAR SESIÓN
            </Link>
            <Link
              to="/catalogo"
              className="inline-block text-[10px] font-bold tracking-widest text-[#30b466] hover:underline uppercase pt-2"
            >
              ← Ir al Catálogo de Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayName = user?.name || 'Usuario ProNatural';
  const displayEmail = user?.email || 'usuario@pronatural.com';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-xl p-10 md:p-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#0b2216]"></div>

        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-[#f4f3ec] rounded-full flex items-center justify-center text-brand-dark shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"></path>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tighter text-center text-brand-dark mb-2">
          PERFIL DE USUARIO
        </h1>
        <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em] mb-10">
          CREDENCIALES DE ACCESO
        </p>

        <div className="space-y-6 mb-12">
          <div className="bg-[#f9f8f4] p-4 border border-gray-100 flex items-center gap-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <div>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre</p>
              <p className="text-[13px] font-medium text-brand-dark truncate">{displayName}</p>
            </div>
          </div>

          <div className="bg-[#f9f8f4] p-4 border border-gray-100 flex items-center gap-4">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <div>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Correo Electrónico</p>
              <p className="text-[13px] font-medium text-brand-dark truncate">{displayEmail}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            to="/recover"
            className="w-full flex items-center justify-center bg-[#f4f3ec] text-brand-dark text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-gray-200 transition-colors border border-gray-200"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
            Cambiar Contraseña
          </Link>
          <button
            onClick={logout}
            className="w-full bg-[#0a2016] text-white flex justify-center items-center py-4 hover:bg-red-800 transition-colors group cursor-pointer"
          >
            <svg className="w-4 h-4 mr-3 text-red-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
