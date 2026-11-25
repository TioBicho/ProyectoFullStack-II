// src/pages/Home.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../Context/useCart';
import Footer from '../Components/Footer';

export default function Home() {
  const { productos, agregarAlCarrito, recargarProductos } = useCart();
  const [searchParams] = useSearchParams();
  const busqueda = (searchParams.get('q') || '').trim().toLowerCase();

  useEffect(() => {
    if (import.meta.env.MODE !== 'test' && recargarProductos) {
      recargarProductos();
    }
  }, []);

  const productosFiltrados = busqueda
    ? productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(busqueda) ||
          p.categoria.toLowerCase().includes(busqueda)
      )
    : productos;

  return (
    <>
      <main className="container my-5">
        {/* Portada (Hero) a 2 Columnas */}
        <section className="row align-items-center py-4 mb-5 hero-section">
          <div className="col-lg-6 mb-4 mb-lg-0">
            <h1 className="display-4 fw-bold mb-3 text-white brand-font">TIENDA ONLINE GAMER</h1>
            <p className="lead text-secondary mb-4">
              Equípate con el mejor hardware, accesorios de alto rendimiento y sillas ergonómicas en Chile. Sube de nivel tu experiencia de juego.
            </p>
          </div>
          <div className="col-lg-6 text-center">
            <img
              src="/imagenes/foto principal.jpg"
              alt="Setup gamer profesional con iluminación RGB de Level-Up Gamer"
              className="img-fluid rounded-3 border border-secondary shadow"
            />
          </div>
        </section>

        {/* Catálogo de Productos dinámico con .map() */}
        <section id="catalogo" className="my-5 pt-3">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-white brand-font">Catálogo Destacado</h2>
            <p className="text-secondary">Selección oficial de productos para potenciar tu juego</p>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
            {productosFiltrados.length === 0 ? (
              <div className="col-12 text-center py-5">
                <i className="bi bi-search display-3 text-secondary mb-3 d-block"></i>
                <h4 className="text-white">No se encontraron productos</h4>
                <p className="text-secondary">
                  No hay resultados para "{busqueda}". Intenta con otra palabra clave.
                </p>
              </div>
            ) : (
              productosFiltrados.map((prod) => (
                <div className="col" key={prod.id}>
                  <article className="card h-100 p-3 card-gamer card-product-premium d-flex flex-column justify-content-between">
                    <div>
                      {/* Contenedor de imagen con zoom suave al hover */}
                      <div className="card-img-zoom-wrapper mb-3">
                        <img 
                          className="foto-producto rounded" 
                          src={prod.img} 
                          alt={prod.nombre} 
                          loading="lazy"
                        />
                      </div>

                      {/* Título del producto */}
                      <h3 className="h6 text-white fw-bold mb-1 text-truncate" title={prod.nombre}>
                        {prod.nombre}
                      </h3>

                      {/* Detalles compactos debajo del título */}
                      <div className="d-flex align-items-center justify-content-between gap-2 mb-2 pb-1 border-bottom border-secondary border-opacity-25">
                        <span className="badge bg-secondary bg-opacity-25 text-info small border border-secondary border-opacity-50">
                          {prod.categoria}
                        </span>
                        <span className="text-secondary small font-monospace">
                          SKU: {prod.id}
                        </span>
                      </div>

                      {/* Estado de stock y garantía */}
                      <div className="d-flex align-items-center justify-content-between small text-secondary mb-3">
                        <span className="text-success d-flex align-items-center gap-1">
                          <i className="bi bi-check2-circle"></i> En stock
                        </span>
                        <span className="d-flex align-items-center gap-1 opacity-75">
                          <i className="bi bi-shield-check"></i> Garantía 12m
                        </span>
                      </div>
                    </div>

                    <div>
                      {/* Precio destacado */}
                      <div className="d-flex align-items-baseline justify-content-between mb-3">
                        <span className="text-secondary small">Precio:</span>
                        <span className="fs-5 fw-bold" style={{ color: 'var(--color-accent)' }}>
                          ${prod.precio.toLocaleString('es-CL')} CLP
                        </span>
                      </div>

                      {/* Botón Agregar con color distintivo y contraste en hover */}
                      <button
                        type="button"
                        onClick={() => agregarAlCarrito(prod)}
                        className="btn btn-add-cart w-100 fw-bold"
                        aria-label={`Agregar ${prod.nombre} al carrito`}
                      >
                        <i className="bi bi-cart-plus me-1"></i> Agregar
                      </button>
                    </div>
                  </article>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}