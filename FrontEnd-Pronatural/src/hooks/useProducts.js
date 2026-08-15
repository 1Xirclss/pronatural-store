// Hook personalizado para acceder a los productos
// Primero verifica si hay un GlobalDataContext activo (para evitar peticiones duplicadas)
// Si no hay contexto global, hace su propia petición al backend
import { useContext, useState, useEffect } from 'react';
import { GlobalDataContext } from '../context/GlobalDataContext';
import { api } from '../utils/api';

export function useProducts() {
  // Intentar obtener productos del contexto global si está disponible
  const globalData = useContext(GlobalDataContext);

  if (globalData) {
    // Usar los productos del contexto global para evitar peticiones duplicadas
    return {
      products: globalData.products,
      loading: false,
      error: null,
      refetch: () => {}
    };
  }

  // Si no hay contexto global, hacer la petición directamente a la API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los productos desde el backend
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
}
