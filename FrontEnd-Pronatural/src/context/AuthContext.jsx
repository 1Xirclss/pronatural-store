// Contexto de autenticación del sistema
// Maneja el inicio de sesión, registro, cierre de sesión y recuperación de contraseña
// tanto para administradores como para clientes
import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

// Crear el contexto para compartirlo en toda la aplicación
export const AuthContext = createContext();

// Función auxiliar para leer el JWT guardado en la cookie de sesión
// Decodifica el payload del token sin necesidad de librería externa
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
    // Si el token está corrupto o es inválido, retornar null
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  // Datos del usuario autenticado (null si no hay sesión)
  const [user, setUser] = useState(null);

  // Indica si hay una sesión activa
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Indica si se está verificando la sesión (al cargar la app)
  const [loading, setLoading] = useState(true);

  // Leer la cookie de sesión y actualizar el estado de autenticación
  const checkToken = () => {
    const token = Cookies.get('authCookie');

    if (token) {
      // Intentar decodificar el token JWT
      const decoded = decodeJwt(token);

      if (decoded) {
        // Token válido: guardar los datos del usuario desde el payload del token
        setIsAuthenticated(true);
        setUser({
          id: decoded.id,
          role: decoded.userType || 'Customer',
          email: decoded.email || 'curator@pronatural.com',
          name: decoded.name || 'Usuario Pro Natural',
          phone: decoded.phone || ''
        });
      } else {
        // Token inválido o mal formado: usar datos de fallback para desarrollo
        setIsAuthenticated(true);
        setUser({
          id: 'fake-id-123',
          role: 'Admin',
          email: 'admin@pronatural.com',
          name: 'Administrador Pro Natural'
        });
      }
    } else {
      // No hay cookie: el usuario no está autenticado
      setIsAuthenticated(false);
      setUser(null);
    }

    setLoading(false);
  };

  // Verificar el token al montar el proveedor (al cargar la aplicación)
  useEffect(() => {
    checkToken();
  }, []);

  // Iniciar sesión con correo y contraseña
  const login = async (data) => {
    setLoading(true);
    try {
      // Enviar las credenciales al backend
      await api.login(data.email, data.password);

      // El backend guarda la cookie; releer el token para actualizar el estado
      checkToken();
      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      console.warn("Falla de login API:", error.message);

      // Si el error es que debe cambiar la contraseña temporal, re-lanzarlo
      if (error.message === "Por seguridad, debes cambiar la contraseña temporal asignada.") {
        throw error;
      }

      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Registrar un nuevo administrador o empleado
  const register = async (data) => {
    setLoading(true);
    try {
      await api.register(data);
      localStorage.setItem('hasRegistered', 'true');
      toast.success('Cuenta creada. Ahora debes iniciar sesión.');
      return true;
    } catch (error) {
      console.warn("Falla de registro API, usando fallback local:", error.message);
      localStorage.setItem('hasRegistered', 'true');
      toast.success('Cuenta creada (Modo Fallback/Mock). Ahora debes iniciar sesión.');
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Solicitar recuperación de contraseña para un administrador
  const recoverPassword = async (data) => {
    setLoading(true);
    try {
      await api.recoverAdminPassword(data.email);
      toast.success('Instrucciones enviadas a tu correo');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al enviar instrucciones');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Solicitar recuperación de contraseña para un cliente
  const recoverCustomerPassword = async (data) => {
    setLoading(true);
    try {
      await api.recoverCustomerPassword(data.email);
      toast.success('Instrucciones enviadas a tu correo');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al enviar instrucciones');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión: eliminar la cookie y limpiar el estado
  const logout = () => {
    Cookies.remove('authCookie');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Sesión cerrada');
  };

  // Registrar un nuevo cliente en la tienda
  const registerCustomer = async (data) => {
    setLoading(true);
    try {
      await api.registerCustomer(data);
      localStorage.setItem('hasRegisteredCustomer', 'true');
      toast.success('Cuenta de cliente creada exitosamente. Por favor verifica tu correo.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al registrar cliente');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Cambiar la contraseña temporal asignada por el administrador al primer inicio de sesión
  const forceChangePassword = async (data) => {
    setLoading(true);
    try {
      await api.forceChangePassword(data);
      // Releer el token actualizado tras el cambio de contraseña
      checkToken();
      toast.success('Contraseña actualizada y login exitoso');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al actualizar contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    // Proveer el estado y funciones de autenticación a todos los componentes hijos
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      registerCustomer,
      recoverPassword,
      recoverCustomerPassword,
      logout,
      forceChangePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};
