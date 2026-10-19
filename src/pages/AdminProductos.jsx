// src/pages/AdminProductos.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Context/CartContext';

export default function AdminProductos() {
  const { productos, eliminarProducto } = useCart();
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  // Filtrado dinámico por nombre o categoría
  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.id.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="container my-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="brand-font text-white fs-2 mb-1">Panel de Administración</h1>
          <p className="text-secondary small mb-0">Gestión de inventario y catálogo de productos</p>
        </div>
        <Link to="/admin/crear" className="btn btn-success fw-bold">
          <i className="bi bi-plus-circle me-2"></i>Nuevo Producto
        </Link>
      </div>

      <div className="card-gamer p-4 border border-secondary rounded-3">
        {/* Barra de búsqueda */}
        <div className="row mb-4">
          <div className="col-12 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-dark text-secondary border-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por ID, nombre o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0 border-secondary">
            <thead>
              <tr className="border-secondary text-secondary small text-uppercase">
                <th scope="col">ID</th>
                <th scope="col">Imagen</th>
                <th scope="col">Nombre</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio</th>
                <th scope="col" className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-secondary">
                    No se encontraron productos registrados.
                  </td>
                </tr>
              ) : (
                productosFiltrados.map((prod) => (
                  <tr key={prod.id} className="border-secondary">
                    <td className="fw-bold text-info">{prod.id}</td>
                    <td>
                      <img
                        src={prod.img}
                        alt={prod.nombre}
                        className="rounded"
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                      />
                    </td>
                    <td className="fw-bold text-white">{prod.nombre}</td>
                    <td>
                      <span className="badge bg-secondary">{prod.categoria}</span>
                    </td>
                    <td className="text-info fw-bold">
                      ${prod.precio.toLocaleString('es-CL')} CLP
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-info"
                          title="Editar"
                          onClick={() => navigate(`/admin/editar/${prod.id}`)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Eliminar"
                          onClick={() => eliminarProducto(prod.id)}
                        >
                          <i className="bi bi-trash me-1"></i>Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}