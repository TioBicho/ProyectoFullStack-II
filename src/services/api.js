// src/services/api.js
// Servicio de comunicación REST entre Frontend React y los 2 Microservicios Spring Boot
// 1. Microservicio Auth & Usuarios: http://localhost:8081/api
// 2. Microservicio Tienda (Productos y Pedidos): http://localhost:8082/api

export const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8081/api';
export const TIENDA_API_URL = import.meta.env.VITE_TIENDA_API_URL || 'http://localhost:8082/api';

/**
 * Retorna el encabezado con el token JWT si está disponible
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    : {
        'Content-Type': 'application/json'
      };
};

export const api = {
  // =================== 1. MICROSERVICIO AUTH & USUARIOS (Puerto 8081) ===================
  async login(correo, contrasena) {
    const res = await fetch(`${AUTH_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error en inicio de sesión');
    }
    return data;
  },

  async registro(datosUsuario) {
    const res = await fetch(`${AUTH_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosUsuario)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error en el registro');
    }
    return data;
  },

  async getPerfil() {
    const res = await fetch(`${AUTH_API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('No autorizado');
    return await res.json();
  },

  async getUsuarios() {
    const res = await fetch(`${AUTH_API_URL}/usuarios`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al listar usuarios');
    return await res.json();
  },

  async getUsuarioById(id) {
    const res = await fetch(`${AUTH_API_URL}/usuarios/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Usuario no encontrado');
    return await res.json();
  },

  async crearUsuario(usuario) {
    const res = await fetch(`${AUTH_API_URL}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(usuario)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al crear usuario');
    }
    return data;
  },

  async actualizarUsuario(id, usuario) {
    const res = await fetch(`${AUTH_API_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(usuario)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al actualizar usuario');
    }
    return data;
  },

  async cambiarRolUsuario(id, rol) {
    const res = await fetch(`${AUTH_API_URL}/usuarios/${id}/rol`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rol })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al cambiar rol');
    }
    return data;
  },

  async eliminarUsuario(id) {
    const res = await fetch(`${AUTH_API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al eliminar usuario');
    }
    return data;
  },

  // =================== 2. MICROSERVICIO TIENDA: PRODUCTOS Y PEDIDOS (Puerto 8082) ===================
  async getProductos(busqueda = '') {
    const url = busqueda
      ? `${TIENDA_API_URL}/productos?search=${encodeURIComponent(busqueda)}`
      : `${TIENDA_API_URL}/productos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar productos desde el catálogo');
    return await res.json();
  },

  async getProductoById(id) {
    const res = await fetch(`${TIENDA_API_URL}/productos/${id}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    return await res.json();
  },

  async crearProducto(producto) {
    const res = await fetch(`${TIENDA_API_URL}/productos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(producto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al crear producto');
    }
    return data;
  },

  async actualizarProducto(id, producto) {
    const res = await fetch(`${TIENDA_API_URL}/productos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(producto)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al actualizar producto');
    }
    return data;
  },

  async eliminarProducto(id) {
    const res = await fetch(`${TIENDA_API_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al eliminar producto');
    }
    return data;
  },

  async crearPedido(pedido) {
    const res = await fetch(`${TIENDA_API_URL}/pedidos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(pedido)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Error al procesar compra');
    }
    return data;
  }
};
