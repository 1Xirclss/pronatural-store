// Hook personalizado para acceder al contexto de autenticación
// Se usa en cualquier componente que necesite saber si el usuario está logueado
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  // Obtener el contexto de autenticación
  const context = useContext(AuthContext);

  // Si se usa fuera del AuthProvider, lanzar un error claro
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};
