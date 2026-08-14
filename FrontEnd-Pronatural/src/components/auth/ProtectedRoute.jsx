// Componente de ruta protegida
// Verifica si el usuario tiene sesión activa y el rol necesario para acceder
// Si no cumple los requisitos, redirige a la página correspondiente
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_PREFIX } from '../../config';

export default function ProtectedRoute({ children, allowedRoles, authFallback = '/register' }) {
  // Obtener estado de autenticación del contexto global
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar pantalla de carga mientras se verifica el token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-dark font-sans text-xs tracking-widest font-bold uppercase">
        Verificando credenciales...
      </div>
    );
  }

  // Si no hay sesión activa, redirigir al login o página indicada
  if (!isAuthenticated) {
    return <Navigate to={authFallback} replace />;
  }

  // Si el rol del usuario no está en la lista de roles permitidos
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirigir al admin a su panel
    if (user?.role === 'Admin') {
      return <Navigate to={ADMIN_PREFIX} replace />;
    }
    // Redirigir al empleado a su panel de vendedor
    if (user?.role === 'Employee') {
      return <Navigate to="/vendedor" replace />;
    }
    // Redirigir al cliente al catálogo
    return <Navigate to="/catalogo" replace />;
  }

  // Si todo está bien, mostrar el contenido protegido
  return children;
}
