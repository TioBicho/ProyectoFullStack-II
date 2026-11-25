// src/services/userService.js
import { api } from './api';

export const userService = {
  /**
   * Obtiene todos los usuarios desde el microservicio MS-Login (8081).
   */
  async getAll() {
    return await api.getUsuarios();
  },

  /**
   * Obtiene un usuario por ID desde el microservicio MS-Login (8081)
   */
  async getById(id) {
    return await api.getUsuarioById(id);
  },

  /**
   * Crea un nuevo usuario en la base de datos MySQL (MS-Login)
   */
  async create(usuarioData) {
    return await api.crearUsuario(usuarioData);
  },

  /**
   * Actualiza los datos de un usuario en el backend
   */
  async update(id, usuarioData) {
    return await api.actualizarUsuario(id, usuarioData);
  },

  /**
   * Cambia el rol del usuario (ROLE_ADMIN o ROLE_CLIENTE)
   */
  async changeRole(id, nuevoRol) {
    return await api.cambiarRolUsuario(id, nuevoRol);
  },

  /**
   * Elimina un usuario por su ID
   */
  async delete(id) {
    return await api.eliminarUsuario(id);
  }
};
