// Hook personalizado para manejar el inventario de productos
// Se comunica con la API del backend para obtener, actualizar stock y reordenar
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export function useInventory() {
  // Lista de productos del inventario
  const [inventory, setInventory] = useState([]);

  // Estado de carga mientras se obtienen los datos
  const [loading, setLoading] = useState(true);

  // Mensaje de error si algo falla
  const [error, setError] = useState(null);

  // Función para cargar el inventario desde el backend
  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Pedir los datos del inventario a la API
      const data = await api.getInventory();
      setInventory(data);
      setError(null);
    } catch (err) {
      // Guardar el mensaje de error si la petición falla
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar el stock de un producto específico
  const updateStock = async (id, newStock) => {
    try {
      const updated = await api.updateStock(id, newStock);
      // Reflejar el cambio inmediatamente en la lista local
      setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: newStock } : item));
      return updated;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Reordenar un producto sumando una cantidad al stock actual
  const reorderProduct = async (id, amount) => {
    try {
      const result = await api.reorderProduct(id, amount);
      // Sumar la cantidad reordenada al stock actual
      setInventory(prev => prev.map(item => item.id === id ? { ...item, stock: item.stock + amount } : item));
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Cargar el inventario cuando el componente se monta
  useEffect(() => {
    fetchInventory();
  }, []);

  return { inventory, loading, error, refetch: fetchInventory, updateStock, reorderProduct };
}
