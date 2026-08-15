// Contexto global de datos de la aplicación
// Centraliza todo el estado de la app: productos, ventas, categorías, empleados, clientes, reseñas y configuración
// Cualquier componente que importe useGlobalData() puede leer y modificar estos datos
import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { api } from '../utils/api';

// Función auxiliar para leer el JWT del token de sesión
// Devuelve el payload del token sin necesidad de una librería externa
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    // Si el token es inválido o está mal formado, retornar null
    return null;
  }
}

// Crear el contexto para compartirlo en toda la aplicación
export const GlobalDataContext = createContext();

// Hook simplificado para acceder al contexto desde cualquier componente
export function useGlobalData() {
  return useContext(GlobalDataContext);
}

export function GlobalDataProvider({ children }) {
  // Estado global de todas las entidades del sistema
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [users, setUsers] = useState([]);       // Empleados del sistema
  const [customers, setCustomers] = useState([]); // Clientes registrados
  const [config, setConfig] = useState(null);   // Configuración del sistema (ajustes)

  // Cargar todos los datos desde el backend al iniciar la aplicación
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Verificar el token del usuario para saber si es admin o empleado
        const token = Cookies.get('authCookie');
        const decoded = token ? decodeJwt(token) : null;
        const isAdmin = decoded?.userType === 'Admin' || decoded?.userType === 'Employee';

        // Cargar datos en paralelo para mayor eficiencia
        // Los datos privados (ventas, empleados, clientes) solo se cargan si es admin o empleado
        const [apiProducts, apiSales, apiCategories, apiEmployees, apiCustomers, apiReviews, apiConfig] = await Promise.all([
          api.getProducts().catch(() => []),
          isAdmin ? api.getSales().catch(() => []) : Promise.resolve([]),
          api.getCategories().catch(() => []),
          isAdmin ? api.getEmployees().catch(() => []) : Promise.resolve([]),
          isAdmin ? api.getClientes().catch(() => []) : Promise.resolve([]),
          api.getReviews().catch(() => []),
          api.getConfig().catch(() => null)
        ]);

        // Guardar los datos en el estado global
        setProducts(Array.isArray(apiProducts) ? apiProducts : []);
        setSales(Array.isArray(apiSales) ? apiSales : []);
        setCategories(Array.isArray(apiCategories) ? apiCategories : []);
        setUsers(Array.isArray(apiEmployees) ? apiEmployees : []);
        setCustomers(Array.isArray(apiCustomers) ? apiCustomers : []);
        setReviews(Array.isArray(apiReviews) ? apiReviews : []);
        setConfig(apiConfig);
      } catch (error) {
        console.error("Error loading data from backend:", error);
      }
    };
    fetchAllData();
  }, []);

  // Agregar un nuevo producto al catálogo
  const addProduct = async (product) => {
    try {
      const saved = await api.createProduct(product);
      // Añadir el producto guardado al inicio de la lista
      setProducts(prev => [saved, ...prev]);
    } catch (e) {
      console.error("Error adding product:", e);
      throw e;
    }
  };

  // Actualizar los datos de un producto existente
  const updateProduct = async (id, updatedData) => {
    try {
      const updated = await api.updateProduct(id, updatedData);
      // Reemplazar el producto en la lista con los datos actualizados
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, ...updated } : p));
    } catch (e) {
      console.error("Error updating product:", e);
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, ...updatedData } : p));
    }
  };

  // Actualizar únicamente el stock de un producto en el inventario
  const updateStock = async (id, newStock) => {
    try {
      await api.updateStock(id, newStock);
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, stock: Number(newStock) } : p));
    } catch (e) {
      console.error("Error updating stock:", e);
      setProducts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, stock: Number(newStock) } : p));
    }
  };

  // Eliminar un producto del catálogo
  const deleteProduct = async (id) => {
    try {
      await api.deleteProduct(id);
      // Remover el producto de la lista local
      setProducts(prev => prev.filter(p => p._id !== id && p.id !== id));
    } catch(e) {
      console.error("Error deleting product:", e);
      throw e;
    }
  };

  // Agregar una nueva categoría
  const addCategory = async (category) => {
    try {
      const res = await api.createCategory(category);
      // Extraer la categoría de la respuesta del backend
      setCategories(prev => [...prev, res.category || res.data || res]);
    } catch (e) {
      console.error("Error adding category:", e);
      // Si falla, agregar la categoría localmente de todas formas
      setCategories(prev => [...prev, category]);
    }
  };

  // Eliminar una categoría
  const deleteCategory = async (id) => {
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => (c.id !== id && c._id !== id)));
    } catch (e) {
      console.error("Error deleting category:", e);
      // Actualizar localmente aunque falle el backend
      setCategories(prev => prev.filter(c => (c.id !== id && c._id !== id)));
    }
  };

  // Actualizar una categoría existente
  const updateCategory = async (id, updatedData) => {
    try {
      const res = await api.updateCategory(id, updatedData);
      setCategories(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...(res.category || res.data || res) } : c));
    } catch (e) {
      console.error("Error updating category:", e);
      // Actualizar localmente aunque falle el backend
      setCategories(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...updatedData } : c));
    }
  };

  // Registrar una nueva venta
  const addSale = async (saleData) => {
    try {
      // Aceptar tanto saleData.items como saleData.products para mayor compatibilidad
      const rawItems = saleData.items || saleData.products || [];

      // Formatear los datos de la venta al formato esperado por el backend
      const formattedSale = {
        customerId: saleData.customerId ?? (saleData.client !== 'Cliente General' ? saleData.client : null),
        products: rawItems.map(item => ({
          productId: item.productId || item.id || item._id,
          quantity: item.quantity
        })),
        total: saleData.total || saleData.amount || 0,
        paymentMethod: saleData.paymentMethod,
        status: saleData.status || "Completado",
        notes: saleData.notes || ""
      };

      const savedSale = await api.createSale(formattedSale);

      // Descontar el stock de los productos vendidos en la lista local
      // para que la UI se actualice inmediatamente sin recargar
      const items = saleData.items || [];
      let newProducts = [...products];
      items.forEach(item => {
        const pIdx = newProducts.findIndex(p => p.id === item.id || p._id === item.id);
        if (pIdx >= 0) {
          newProducts[pIdx] = { ...newProducts[pIdx], stock: Math.max(0, newProducts[pIdx].stock - item.quantity) };
        }
      });
      setProducts(newProducts);

      // Agregar la venta guardada al historial
      setSales(prev => [savedSale, ...prev]);
      return savedSale;
    } catch (e) {
      console.error("Error creating sale:", e);
      throw e;
    }
  };

  // Enviar la factura de una venta por correo electrónico
  const sendInvoice = async (saleId) => {
    try {
      await api.sendInvoice(saleId);
    } catch (e) {
      console.error("Error sending invoice:", e);
      throw e;
    }
  };

  // Actualizar el estado de una venta (ej. Pendiente → Completado)
  const updateSaleStatus = async (id, payload) => {
    try {
      const updated = await api.updateSaleStatus(id, payload);
      const updatedSale = updated.sale || updated;
      // Reemplazar la venta en la lista con el estado actualizado
      setSales(prev => prev.map(s => (s.id === id || s._id === id) ? { ...s, ...updatedSale } : s));
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Eliminar una venta del historial
  const deleteSale = async (id) => {
    try {
      await api.deleteSale(id);
      setSales(prev => prev.filter(s => s.id !== id && s._id !== id));
    } catch(e) {
      console.error("Error deleting sale:", e);
      // Eliminar localmente aunque falle el backend
      setSales(prev => prev.filter(s => s.id !== id && s._id !== id));
    }
  };

  // Publicar una nueva reseña de cliente
  const addReview = async (review) => {
    try {
      const res = await api.createReview(review);
      setReviews(prev => [res.review || res, ...prev]);
    } catch(e) {
      console.error(e);
      throw e;
    }
  };

  // Eliminar una reseña
  const deleteReview = async (id) => {
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r._id !== id && r.id !== id));
    } catch(e) {
      console.error(e);
      throw e;
    }
  };

  // Agregar un nuevo empleado al sistema
  const addUser = async (user) => {
    try {
      const saved = await api.createEmployee(user);
      setUsers(prev => [saved, ...prev]);
    } catch (e) {
      console.error("Error adding employee:", e);
      throw e;
    }
  };

  // Actualizar los datos de un empleado
  const updateUser = async (id, updatedUser) => {
    try {
      const updated = await api.updateEmployee(id, updatedUser);
      setUsers(prev => prev.map(u => (u.id === id || u._id === id) ? { ...u, ...updated } : u));
    } catch (e) {
      console.error("Error updating employee:", e);
      throw e;
    }
  };

  // Eliminar un empleado del sistema
  const deleteUser = async (id) => {
    try {
      await api.deleteEmployee(id);
      setUsers(prev => prev.filter(u => u.id !== id && u._id !== id));
    } catch (e) {
      console.error("Error deleting employee:", e);
      throw e;
    }
  };

  // Agregar un nuevo cliente al sistema
  const addCustomer = async (customer) => {
    try {
      const saved = await api.createCliente(customer);
      setCustomers(prev => [saved, ...prev]);
    } catch(e) {
      console.error(e);
      throw e;
    }
  };

  // Actualizar los datos de un cliente
  const updateCustomer = async (id, updatedCustomer) => {
    try {
      const res = await api.updateCliente(id, updatedCustomer);
      const updated = res.customer || updatedCustomer;

      // Normalizar los campos del cliente para que la UI los muestre correctamente
      const mappedUpdated = {
        ...updated,
        name: updated.name || updated.nombre || '',
        lastName: updated.lastName || updated.apellido || '',
        email: updated.email || updated.correo || '',
        phone: updated.telefono || updated.phone || '',
        birthdate: updated.birthdate || updated.fechaNacimiento || '',
        status: updated.status || 'Active'
      };

      setCustomers(prev => prev.map(c => (c.id === id || c._id === id) ? { ...c, ...mappedUpdated } : c));
    } catch(e) {
      console.error(e);
      throw e;
    }
  };

  // Eliminar un cliente del sistema
  const deleteCustomer = async (id) => {
    try {
      await api.deleteCliente(id);
      setCustomers(prev => prev.filter(c => c.id !== id && c._id !== id));
    } catch(e) {
      console.error(e);
      throw e;
    }
  };

  // Guardar la configuración del sistema en la base de datos
  const updateConfig = async (data) => {
    try {
      const res = await api.updateConfig(data);
      // Actualizar el estado local con la configuración guardada
      setConfig(res.ajustes || data);
      return res;
    } catch(e) {
      console.error(e);
      throw e;
    }
  };

  // Enviar manualmente el reporte de inventario por correo
  const sendInventoryReport = async () => {
    try {
      return await api.sendInventoryReport();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Calcular estadísticas en tiempo real basadas en los datos del estado
  const now = new Date();
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0);
  const totalOrders = sales.length;
  const activeInventory = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);

  // Calcular ventas por período (Hoy, Esta Semana, Este Mes)
  const todayRevenue = sales
    .filter(s => {
      const d = new Date(s.createdAt || s.fecha || s.date || 0);
      return d.toDateString() === now.toDateString();
    })
    .reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0);

  const dayOfWeek = now.getDay() || 7;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const weekRevenue = sales
    .filter(s => {
      const d = new Date(s.createdAt || s.fecha || s.date || 0);
      return d >= startOfWeek;
    })
    .reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0);

  const monthRevenue = sales
    .filter(s => {
      const d = new Date(s.createdAt || s.fecha || s.date || 0);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0);

  const metas = {
    diaria: Number(config?.metas?.diaria ?? 150),
    semanal: Number(config?.metas?.semanal ?? 1050),
    mensual: Number(config?.metas?.mensual ?? 4500)
  };

  // Calcular total de artículos vendidos contando los items de cada venta
  const totalItemsSold = sales.reduce((acc, curr) => {
    if (Array.isArray(curr.products)) {
      return acc + curr.products.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    if (Array.isArray(curr.items)) {
      return acc + curr.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return acc + (typeof curr.items === 'number' ? curr.items : 1);
  }, 0);

  return (
    // Proveer todos los datos y funciones a los componentes hijos
    <GlobalDataContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      updateStock,
      deleteProduct,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      sales,
      addSale,
      updateSaleStatus,
      sendInvoice,
      deleteSale,
      reviews,
      addReview,
      deleteReview,
      users,
      addUser,
      updateUser,
      deleteUser,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      config,
      updateConfig,
      sendInventoryReport,
      // Estadísticas calculadas en tiempo real
      stats: {
        totalRevenue,
        totalOrders,
        activeInventory,
        totalItemsSold,
        todayRevenue,
        weekRevenue,
        monthRevenue,
        metas
      }
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
}
