// Contexto del carrito de compras
// Maneja el estado global del carrito y sincroniza los productos con la base de datos
import { createContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

// Crear el contexto del carrito para compartirlo en toda la aplicación
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Lista de productos en el carrito
  const [items, setItems] = useState([]);

  // ID de sesión único del navegador para identificar el carrito en la base de datos
  const [sessionId, setSessionId] = useState('');

  // Bandera para saber si el carrito ya se cargó desde la base de datos
  const [initialized, setInitialized] = useState(false);

  // Al montar: recuperar o crear el ID de sesión y cargar el carrito desde MongoDB
  useEffect(() => {
    // Buscar ID de sesión guardado en localStorage
    let sid = localStorage.getItem('pronatural_session_id');

    // Si no existe, crear uno nuevo único
    if (!sid) {
      sid = 'cart_' + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem('pronatural_session_id', sid);
    }
    setSessionId(sid);

    // Cargar el carrito guardado en la base de datos para este ID de sesión
    api.getCart(sid).then(data => {
       if (data && data.productos) {
         // Convertir los productos al formato interno del carrito
         const mapped = data.productos
           .filter(p => p.productId) // Filtrar productos nulos que ya no existen
           .map(p => {
             const prod = p.productId;
             const imgUrl = Array.isArray(prod.imagenProducto) && prod.imagenProducto.length > 0 
               ? prod.imagenProducto[0] 
               : (prod.imagenProducto || prod.img || '');

             return {
               id: prod._id,
               _id: prod._id,
               name: prod.nombreProducto || prod.name || '',
               price: typeof prod.precio === 'number' ? prod.precio : (prod.price || 0),
               image: imgUrl,
               stock: prod.stock || 0,
               quantity: p.quantity || 1
             };
           });
         setItems(mapped);
       }
       // Marcar como inicializado para que comience la sincronización
       setInitialized(true);
    }).catch(err => {
       console.error("Error loading cart", err);
       setInitialized(true); // Inicializar de todas formas aunque falle la carga
    });
  }, []);

  // Sincronizar automáticamente el carrito con MongoDB cada vez que cambian los items
  useEffect(() => {
    // No sincronizar hasta que esté inicializado y haya ID de sesión
    if (!initialized || !sessionId) return;

    // Usar un delay corto de 300ms para reflejar cambios rápidamente en MongoDB
    const timeout = setTimeout(() => {
      const payload = items.map(i => ({ productId: i._id || i.id, quantity: i.quantity }));
      api.syncCart(sessionId, payload).catch(e => console.error("Sync error", e));
    }, 300);

    return () => clearTimeout(timeout);
  }, [items, initialized, sessionId]);

  // Agregar un producto al carrito
  const addItem = useCallback((product) => {
    // Verificar si el producto ya está en el carrito
    const exists = items.find((i) => (i.id === product.id || i._id === product._id));

    if (exists) {
      // Si ya existe, aumentar la cantidad en 1
      toast.success(`${product.name || product.nombreProducto} actualizado en el carrito`);
      setItems((prev) =>
        prev.map((i) =>
          (i.id === product.id || i._id === product._id) ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      // Si no existe, agregar con cantidad 1 y normalizar los campos
      toast.success(`${product.name || product.nombreProducto} añadido al carrito`);
      setItems((prev) => [...prev, {
        ...product,
        quantity: 1,
        id: product._id || product.id,
        name: product.nombreProducto || product.name,
        price: product.precio || product.price,
        image: product.imagenProducto || product.image
      }]);
    }
  }, [items]);

  // Eliminar un producto del carrito por su ID
  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id && i._id !== id));
    toast.error('Producto eliminado del carrito');
  }, []);

  // Actualizar la cantidad de un producto en el carrito
  const updateQuantity = useCallback((id, quantity) => {
    // No permitir cantidades menores a 1
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === id || i._id === id ? { ...i, quantity } : i))
    );
  }, []);

  // Vaciar completamente el carrito y eliminarlo de la base de datos
  const clearCart = useCallback(() => {
    setItems([]);
    if (sessionId) {
      // Eliminar el carrito de MongoDB
      api.clearCart(sessionId).catch(e => console.error(e));
    }
    toast.success('Carrito vaciado');
  }, [sessionId]);

  // Calcular total de artículos en el carrito
  const totalItems = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  // Calcular subtotal sumando precio x cantidad de cada producto
  const subtotal = items.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 1)), 0);

  return (
    // Proveer el contexto del carrito a todos los componentes hijos
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};
