// src/pages/FormProducto.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCart } from '../Context/CartContext';

const CATEGORIAS = [
  'Juegos de Mesa',
  'Accesorios',
  'Consolas',
  'Computadores',
  'Sillas Gamers',
  'Mouse',
  'Mousepads'
];

export default function FormProducto() {
  const { id } = useParams(); // Si existe ID, estamos editando
  const navigate = useNavigate();
  const { productos, crearProducto, actualizarProducto } = useCart();

  const [formData, setFormData] = useState({
    id: '',
    nombre: '',
    categoria: '',
    precio: '',
    img: ''
  });

  const [errores, setErrores] = useState({});

  // Cargar datos si es modo Edición
  useEffect(() => {
    if (id) {
      const prodEncontrado = productos.find((p) => p.id === id);
      if (prodEncontrado) {
        setFormData({
          id: prodEncontrado.id,
          nombre: prodEncontrado.nombre,
          categoria: prodEncontrado.categoria,
          precio: prodEncontrado.precio,
          img: prodEncontrado.img
        });
      } else {
        alert('Producto no encontrado');
        navigate('/admin');
      }
    }
  }, [id, productos, navigate]);

  const handleChange = (e) => {
    const { id: fieldId, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = 'El ID es obligatorio (ej: JM003, AC005).';
    } else if (!id && productos.some((p) => p.id.toUpperCase() === formData.id.trim().toUpperCase())) {
      newErrors.id = 'Este ID ya existe en el catálogo.';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio.';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Seleccione una categoría.';
    }

    if (!formData.precio || isNaN(formData.precio) || Number(formData.precio) <= 0) {
      newErrors.precio = 'Ingrese un precio numérico mayor a 0.';
    }

    if (!formData.img.trim()) {
      newErrors.img = 'La ruta o URL de la imagen es obligatoria.';
    }

    setErrores(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const productoGuardar = {
        ...formData,
        id: formData.id.trim().toUpperCase(),
        nombre: formData.nombre.trim(),
        precio: Number(formData.precio),
        img: formData.img.trim()
      };

      if (id) {
        actualizarProducto(id, productoGuardar);
        alert('Producto actualizado con éxito.');
      } else {
        crearProducto(productoGuardar);
        alert('Producto creado con éxito.');
      }

      navigate('/admin');
    }
  };

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card-gamer p-4 p-md-5 border border-secondary shadow-lg rounded-3">
            <h2 className="brand-font text-center mb-4 text-white">
              {id ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              {/* ID del producto */}
              <div className="mb-3">
                <label htmlFor="id" className="form-label text-white small fw-bold">
                  CÓDIGO / ID PRODUCTO
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="id"
                  placeholder="Ej: JM003, AC005"
                  value={formData.id}
                  onChange={handleChange}
                  disabled={Boolean(id)} // No editable si se está modificando
                />
                {errores.id && <span className="error-msg text-danger small d-block mt-1">{errores.id}</span>}
              </div>

              {/* Nombre */}
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label text-white small fw-bold">
                  NOMBRE DEL PRODUCTO
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  placeholder="Ej: Teclado Mecánico RGB"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                {errores.nombre && <span className="error-msg text-danger small d-block mt-1">{errores.nombre}</span>}
              </div>

              {/* Categoría */}
              <div className="mb-3">
                <label htmlFor="categoria" className="form-label text-white small fw-bold">
                  CATEGORÍA
                </label>
                <select
                  className="form-select"
                  id="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                >
                  <option value="">Seleccione categoría...</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errores.categoria && <span className="error-msg text-danger small d-block mt-1">{errores.categoria}</span>}
              </div>

              {/* Precio */}
              <div className="mb-3">
                <label htmlFor="precio" className="form-label text-white small fw-bold">
                  PRECIO (CLP)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="precio"
                  placeholder="Ej: 39990"
                  value={formData.precio}
                  onChange={handleChange}
                />
                {errores.precio && <span className="error-msg text-danger small d-block mt-1">{errores.precio}</span>}
              </div>

              {/* Imagen */}
              <div className="mb-4">
                <label htmlFor="img" className="form-label text-white small fw-bold">
                  RUTA O URL DE IMAGEN
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="img"
                  placeholder="Ej: /imagenes/teclado.jpg o https://..."
                  value={formData.img}
                  onChange={handleChange}
                />
                <span className="helper-text text-secondary small d-block">
                  Puedes ingresar `/imagenes/nombre.jpg` o una URL externa de imagen.
                </span>
                {errores.img && <span className="error-msg text-danger small d-block mt-1">{errores.img}</span>}
              </div>

              {/* Botones */}
              <div className="d-flex gap-2">
                <Link to="/admin" className="btn btn-outline-secondary w-50 py-2 fw-bold">
                  Cancelar
                </Link>
                <button type="submit" className="btn btn-primary w-50 py-2 fw-bold">
                  {id ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}