// src/services/authService.js
import { api } from './api';

export const authService = {
  /**
   * Inicia sesión llamando al endpoint /api/auth/login de Spring Boot (MS-Login: 8081)
   */
  async login(correo, contrasena) {
    const data = await api.login(correo, contrasena);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: data.id,
        nombre: data.nombre,
        correo: data.correo,
        rol: data.rol
      }));
    }
    return data;
  },

  /**
   * Registra un nuevo usuario en la base de datos MySQL (MS-Login: 8081)
   */
  async register(userData) {
    const data = await api.registro(userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify({
        id: data.id,
        nombre: data.nombre,
        correo: data.correo,
        rol: data.rol
      }));
    }
    return data;
  },

  /**
   * Cierra la sesión activa eliminando token y usuario de localStorage
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  },

  /**
   * Obtiene el token JWT actual
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Obtiene el usuario autenticado actualmente
   */
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser')) || null;
    } catch {
      return null;
    }
  },

  /**
   * Verifica si el usuario actual tiene permisos de Administrador
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user && (user.rol === 'ROLE_ADMIN' || user.rol === 'ADMIN');
  }
};
