const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authCookieFallback') : null;
  const defaultHeaders = isFormData ? (token ? { Authorization: `Bearer ${token}` } : {}) : {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  };
  if (isFormData && config.headers['Content-Type']) {
    delete config.headers['Content-Type'];
  }
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      let serverMessage = '';
      try {
        const errorText = await response.text();
        const parsed = JSON.parse(errorText);
        if (parsed.message) serverMessage = parsed.message;
        else if (parsed.error) serverMessage = parsed.error;
      } catch (e) {
        // No es JSON estructurado
      }

      let errorMessage = serverMessage;
      if (!errorMessage) {
        if (response.status === 400) {
          errorMessage = 'Los datos enviados no son válidos. Revisa el formulario.';
        } else if (response.status === 401) {
          errorMessage = 'Sesión no autorizada o caducada. Inicia sesión nuevamente.';
        } else if (response.status === 403) {
          errorMessage = 'No cuentas con los permisos requeridos para esta acción.';
        } else if (response.status === 404) {
          errorMessage = 'El recurso solicitado no fue encontrado.';
        } else if (response.status === 429) {
          errorMessage = 'Has alcanzado el límite de peticiones. Espera unos segundos.';
        } else if (response.status >= 500) {
          errorMessage = 'Error en el servidor. Por favor intenta más tarde.';
        } else {
          errorMessage = `Error en la petición al servidor (Código ${response.status})`;
        }
      }

      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }
    return await response.json();
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const netError = new Error('No se pudo conectar al servidor. Verifica que el backend esté encendido.');
      netError.isNetworkError = true;
      throw netError;
    }
    if (error.message !== 'Access denied') {
      console.warn(`[API FAILED] para: ${endpoint}. Razón:`, error.message);
    }
    throw error;
  }
}

export const api = {
  // Productos
  getProducts: () => apiRequest('/products'),
  getMostSoldProduct: () => apiRequest('/products/most-sold', { cache: 'no-store' }),
  getProduct: (id) => apiRequest(`/products/${id}`),
  createProduct: (productData) => {
    if (productData.file) {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key !== 'file' && key !== 'img') {
          let val = productData[key];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          formData.append(key, val);
        }
      });
      formData.append('img', productData.file);
      return apiRequest('/products', { method: 'POST', body: formData });
    }
    return apiRequest('/products', { method: 'POST', body: JSON.stringify(productData) });
  },
  updateProduct: (id, productData) => {
    if (productData.file) {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key !== 'file' && key !== 'img') {
          let val = productData[key];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          formData.append(key, val);
        }
      });
      formData.append('img', productData.file);
      return apiRequest(`/products/${id}`, { method: 'PUT', body: formData });
    }
    return apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) });
  },
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),

  // Categorías
  getCategories: () => apiRequest('/categories'),
  createCategory: (categoryData) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(categoryData) }),
  updateCategory: (id, categoryData) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(categoryData) }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),

  // Empleados
  getEmployees: () => apiRequest('/employees'),
  createEmployee: (employeeData) => apiRequest('/employees', { method: 'POST', body: JSON.stringify(employeeData) }),
  updateEmployee: (id, employeeData) => apiRequest(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employeeData) }),
  deleteEmployee: (id) => apiRequest(`/employees/${id}`, { method: 'DELETE' }),

  // Clientes
  getClientes: () => apiRequest('/clientes'),
  createCliente: (clienteData) => apiRequest('/clientes', { method: 'POST', body: JSON.stringify(clienteData) }),
  updateCliente: (id, clienteData) => apiRequest(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(clienteData) }),
  deleteCliente: (id) => apiRequest(`/clientes/${id}`, { method: 'DELETE' }),

  // Reseñas
  getReviews: () => apiRequest('/reviews'),
  createReview: (reviewData) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  deleteReview: (id) => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),

  // Inventario
  getInventory: () => apiRequest('/inventory'),
  updateStock: (id, stock) => apiRequest(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ stock })
  }),
  reorderProduct: (id, amount) => apiRequest(`/inventory/${id}/reorder`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),

  // Carrito
  getCart: (sessionId) => apiRequest(`/carrito/${sessionId}`),
  syncCart: (sessionId, productos) => apiRequest(`/carrito/${sessionId}/sync`, { method: 'POST', body: JSON.stringify({ productos }) }),
  clearCart: (sessionId) => apiRequest(`/carrito/${sessionId}`, { method: 'DELETE' }),

  // Ventas
  getSales: () => apiRequest('/sales'),
  createSale: (saleData) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(saleData)
  }),
  updateSaleStatus: (id, payload) => {
    const bodyData = typeof payload === 'string' ? { status: payload } : payload;
    return apiRequest(`/sales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bodyData)
    });
  },
  sendInvoice: (id) => apiRequest(`/sales/${id}/invoice`, {
    method: 'POST'
  }),
  deleteSale: (id) => apiRequest(`/sales/${id}`, {
    method: 'DELETE'
  }),

  // Autenticación
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getProfile: () => apiRequest('/auth/profile'),
  updateProfile: (profileData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  changePassword: (data) => apiRequest('/auth/changePassword', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  forceChangePassword: (data) => apiRequest('/auth/forceChangePassword', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  registerCustomer: (customerData) => apiRequest('/registerCliente', {
    method: 'POST',
    body: JSON.stringify(customerData)
  }),
  verifyCodeEmail: (verificationCodeRequest, token) => {
    const fallbackToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('registrationAdminTokenFallback') : null);
    return apiRequest('/auth/verifyCode', {
      method: 'POST',
      body: JSON.stringify({ verificationCodeRequest, token: fallbackToken })
    });
  },
  verifyCustomerCodeEmail: (verificationCodeRequest, token) => {
    const fallbackToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('registrationTokenFallback') : null);
    return apiRequest('/registerCliente/verifyCodeEmail', {
      method: 'POST',
      body: JSON.stringify({ verificationCodeRequest, token: fallbackToken })
    });
  },

  // Recuperación de contraseña (Admin)
  recoverAdminPassword: (email) => apiRequest('/auth/recoveryAdmin/requestCode', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  verifyAdminRecoveryCode: (code, token) => {
    const fallbackToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('recoveryAdminTokenFallback') : null);
    return apiRequest('/auth/recoveryAdmin/verifyCode', {
      method: 'POST',
      body: JSON.stringify({ code, token: fallbackToken })
    }).then(res => {
      if (res && res.token) localStorage.setItem('recoveryAdminTokenFallback', res.token);
      return res;
    });
  },
  updateAdminPassword: (newPassword, confirmNewPassword, token) => {
    const fallbackToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('recoveryAdminTokenFallback') : null);
    return apiRequest('/auth/recoveryAdmin/newPassword', {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmNewPassword, token: fallbackToken })
    });
  },

  // Recuperación de contraseña (Cliente)
  recoverCustomerPassword: (email) => apiRequest('/auth/recoveryCustomer/requestCode', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  verifyCustomerRecoveryCode: (code, token) => {
    const fallbackToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('recoveryCustomerTokenFallback') : null);
    return apiRequest('/auth/recoveryCustomer/verifyCode', {
      method: 'POST',
      body: JSON.stringify({ code, token: fallbackToken })
    }).then(res => {
      if (res && res.token) localStorage.setItem('recoveryCustomerTokenFallback', res.token);
      return res;
    });
  },
  updateCustomerPassword: (newPassword, confirmNewPassword, token) => {
    const fallbackToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('recoveryCustomerTokenFallback') : null);
    return apiRequest('/auth/recoveryCustomer/newPassword', {
      method: 'POST',
      body: JSON.stringify({ newPassword, confirmNewPassword, token: fallbackToken })
    });
  },

  // Ajustes del sistema
  getConfig: () => apiRequest('/ajustes'),
  updateConfig: (data) => apiRequest('/ajustes', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  sendInventoryReport: () => apiRequest('/ajustes/send-report', {
    method: 'POST'
  }),

  // Contacto
  sendContactMessage: (data) => apiRequest('/contacto', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Carrito
  getCart: (sessionId) => apiRequest(`/carrito/${sessionId}`),
  syncCart: (sessionId, productos) => apiRequest(`/carrito/${sessionId}/sync`, {
    method: 'POST',
    body: JSON.stringify({ productos })
  }),
  clearCart: (sessionId) => apiRequest(`/carrito/${sessionId}`, {
    method: 'DELETE'
  })
};
