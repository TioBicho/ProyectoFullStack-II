// src/services/productService.js
import { api } from './api';

export const productService = {
  /**
   * Obtiene la lista completa de productos desde el backend (MS-Productos: 8082)
   */
  async getAll(busqueda = '') {
    return await api.getProductos(busqueda);
  },

  /**
   * Obtiene un producto por su código / ID
   */
  async getById(id) {
    return await api.getProductoById(id);
  },

  /**
   * Crea un nuevo producto (requiere token JWT de Admin)
   */
  async create(producto) {
    return await api.crearProducto(producto);
  },

  /**
   * Actualiza un producto existente (requiere token JWT de Admin)
   */
  async update(id, producto) {
    return await api.actualizarProducto(id, producto);
  },

  /**
   * Elimina un producto por su ID (requiere token JWT de Admin)
   */
  async delete(id) {
    return await api.eliminarProducto(id);
  }
};
