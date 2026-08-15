// Hook personalizado para manejar las ventas
// Permite cargar el historial de ventas y registrar nuevas ventas
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useSales() {
  // Lista de ventas obtenidas del backend
  const [sales, setSales] = useState([]);

  // Estado de carga mientras se obtienen los datos
  const [loading, setLoading] = useState(true);

  // Mensaje de error si algo falla
  const [error, setError] = useState(null);

  // Función para obtener todas las ventas del backend
  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await api.getSales();
      setSales(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Registrar una nueva venta en el backend
  const recordSale = async (saleData) => {
    try {
      const newSale = await api.createSale(saleData);
      // Agregar la nueva venta al inicio de la lista local
      setSales(prev => [newSale, ...prev]);
      return newSale;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Cargar ventas al montar el componente
  useEffect(() => {
    fetchSales();
  }, []);

  return { sales, loading, error, refetch: fetchSales, recordSale };
}
