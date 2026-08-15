// Página de error 404 (Ruta no encontrada)
// Muestra una pantalla elegante e institucional cuando el usuario intenta navegar a una URL que no existe
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d1114] flex items-center justify-center px-6 py-12 font-sans">
      <div className="max-w-md w-full text-center">

        {/* Círculo decorativo con icono de advertencia / 404 */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#161b1e] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(48,180,102,0.15)]">
          <svg width="40" height="40" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Título de error HTTP 404 */}
        <span className="text-[12px] font-bold tracking-[0.2em] text-[#30b466] uppercase">Error 404</span>
        <h1 className="text-[32px] font-bold text-white tracking-tight mt-2 mb-3 leading-tight">
          Página No Encontrada
        </h1>

        {/* Descripción amigable */}
        <p className="text-gray-400 text-[14px] leading-relaxed mb-8">
          La ruta a la que intentas acceder no existe, ha sido movida o requiere permisos especiales de acceso.
        </p>

        {/* Botones de acción para regresar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-[13px] rounded-[10px] transition-colors shadow-lg shadow-[#30b466]/20 cursor-pointer"
          >
            Volver a la Tienda
          </Link>
          <Link
            to="/contacto"
            className="w-full sm:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium text-[13px] rounded-[10px] border border-white/10 transition-colors cursor-pointer"
          >
            Contactar Soporte
          </Link>
        </div>

      </div>
    </div>
  );
}
