// Hook personalizado para acceder al contexto del carrito de compras
// Se usa en páginas y componentes que necesitan leer o modificar el carrito
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  // Obtener el contexto del carrito
  const context = useContext(CartContext);

  // Si se usa fuera del CartProvider, lanzar un error claro
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }

  return context;
};
