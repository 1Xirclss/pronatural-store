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
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkToken = () => {
    let token = Cookies.get('authCookie');
    if (!token) {
      token = localStorage.getItem('authCookieFallback');
    }

    let savedUser = null;
    try {
      const savedUserStr = localStorage.getItem('authUserFallback');
      if (savedUserStr) savedUser = JSON.parse(savedUserStr);
    } catch (e) {}

    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setIsAuthenticated(true);
        setUser({
          id: decoded.id || savedUser?.id,
          role: decoded.userType || savedUser?.role || 'Admin',
          email: decoded.email || savedUser?.email || 'admin@pronatural.com',
          name: decoded.name || savedUser?.name || 'Usuario Pro Natural',
          phone: decoded.phone || ''
        });
      } else if (savedUser) {
        setIsAuthenticated(true);
        setUser(savedUser);
      } else {
        setIsAuthenticated(true);
        setUser({
          id: 'dev-fallback-id',
          role: 'Admin',
          email: 'admin@pronatural.com',
          name: 'Administrador Pro Natural'
        });
      }
    } else if (savedUser) {
      setIsAuthenticated(true);
      setUser(savedUser);
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkToken();
  }, []);

  const login = async (data) => {
    setLoading(true);
    try {
      const res = await api.login(data.email, data.password);
      if (res && res.token) {
        localStorage.setItem('authCookieFallback', res.token);
      }
      if (res && res.user) {
        localStorage.setItem('authUserFallback', JSON.stringify(res.user));
        setUser(res.user);
        setIsAuthenticated(true);
      }
      checkToken();
      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      console.warn("Falla de login API:", error.message);
      if (error.message === "Por seguridad, debes cambiar la contraseña temporal asignada.") {
        throw error;
      }
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      if (res && res.token) {
        localStorage.setItem('registrationAdminTokenFallback', res.token);
      }
      localStorage.setItem('hasRegistered', 'true');
      toast.success('Código de verificación enviado.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al registrar administrador');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recoverPassword = async (data) => {
    setLoading(true);
    try {
      const res = await api.recoverAdminPassword(data.email);
      if (res && res.token) {
        localStorage.setItem('recoveryAdminTokenFallback', res.token);
      }
      toast.success('Instrucciones enviadas a tu correo');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al enviar instrucciones');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const recoverCustomerPassword = async (data) => {
    setLoading(true);
    try {
      const res = await api.recoverCustomerPassword(data.email);
      if (res && res.token) {
        localStorage.setItem('recoveryCustomerTokenFallback', res.token);
      }
      toast.success('Instrucciones enviadas a tu correo');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al enviar instrucciones');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Cookies.remove('authCookie');
    localStorage.removeItem('authCookieFallback');
    localStorage.removeItem('authUserFallback');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Sesión cerrada');
  };

  const registerCustomer = async (data) => {
    setLoading(true);
    try {
      const res = await api.registerCustomer(data);
      if (res && res.token) {
        localStorage.setItem('registrationTokenFallback', res.token);
      }
      localStorage.setItem('hasRegisteredCustomer', 'true');
      toast.success('Código de verificación enviado a tu correo.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al registrar cliente');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forceChangePassword = async (data) => {
    setLoading(true);
    try {
      const res = await api.forceChangePassword(data);
      if (res && res.token) {
        localStorage.setItem('authCookieFallback', res.token);
      }
      if (res && res.user) {
        localStorage.setItem('authUserFallback', JSON.stringify(res.user));
        setUser(res.user);
        setIsAuthenticated(true);
      }
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
