import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../Context/CartContext';

export default function Carrito() {
  const { carrito, cambiarCantidad, vaciarCarrito } = useCart();
  const [cuponInput, setCuponInput] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [errorCupon, setErrorCupon] = useState('');
  const [exitoCupon, setExitoCupon] = useState('');

  // Cálculo del subtotal defensivo
  const subtotal = carrito.reduce(
    (acc, item) => acc + (item.precio || 0) * (item.cantidad || 1),
    0
  );

  // Cálculo de descuento y total
  const descuentoMonto = subtotal * descuento;
  const total = Math.max(0, subtotal - descuentoMonto);

  // Aplicar cupón de descuento
  const handleAplicarCupon = () => {
    setErrorCupon('');
    setExitoCupon('');

    const codigo = cuponInput.trim().toUpperCase();
    if (!codigo) {
      setErrorCupon('Ingrese un código de cupón.');
      return;
    }

    if (codigo === 'DUOC20') {
      setDescuento(0.2);
      setExitoCupon('¡Cupón aplicado! 20% de descuento.');
    } else {
      setDescuento(0);
      setErrorCupon('Cupón inválido. Intente nuevamente.');
    }
  };

  // Botón Pagar
  const handlePagar = () => {
    if (carrito.length === 0) {
      alert('Error: No puedes realizar el pago porque el carrito no tiene productos.');
      return;
    }

    alert('¡Pago realizado con éxito! Gracias por tu compra en Level-Up Gamer.');
    setDescuento(0);
    setCuponInput('');
    setErrorCupon('');
    setExitoCupon('');
    vaciarCarrito();
  };

  return (
    <main className="container my-5">
      <h1 className="brand-font text-white mb-4 fs-2">Mi carrito de compras</h1>

      <div className="row g-4">
        {/* Columna Izquierda: Listado de artículos agregados */}
        <section className="col-lg-8" id="lista-carrito">
          {carrito.length === 0 ? (
            <div className="card-gamer p-5 text-center border border-secondary rounded-3">
              <i className="bi bi-cart-x display-2 text-secondary"></i>
              <h3 className="text-white mt-3">Tu carrito está vacío</h3>
              <p className="text-secondary">
                Parece que aún no has agregado periféricos o juegos a tu compra.
              </p>
              <Link to="/" className="btn btn-outline-primary mt-3 px-4 fw-bold">
                <i className="bi bi-arrow-left me-1"></i> Volver al Catálogo
              </Link>
            </div>
          ) : (
            carrito.map((prod) => {
              const precioUnitario = prod.precio || 0;
              const cantidadItem = prod.cantidad || 1;
              const subtotalItem = precioUnitario * cantidadItem;

              return (
                <article
                  key={prod.id}
                  className="card-gamer p-3 mb-3 border border-secondary rounded-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={prod.img}
                      alt={prod.nombre}
                      className="rounded"
                      style={{ width: '85px', height: '85px', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 className="h6 text-white mb-1">{prod.nombre}</h3>
                      <span className="badge bg-secondary mb-1">{prod.categoria}</span>
                      <div className="text-secondary small">
                        ${precioUnitario.toLocaleString('es-CL')} CLP c/u
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    {/* Controles de Cantidad */}
                    <div className="d-flex align-items-center border border-secondary rounded overflow-hidden">
                      <button
                        type="button"
                        className="btn btn-sm btn-dark text-white px-2"
                        onClick={() => cambiarCantidad(prod.id, -1)}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="px-3 fw-bold text-white">{cantidadItem}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-dark text-white px-2"
                        onClick={() => cambiarCantidad(prod.id, 1)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>

                    {/* Total de este producto */}
                    <div className="text-end" style={{ minWidth: '110px' }}>
                      <span className="fs-5 fw-bold text-info">
                        ${subtotalItem.toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Columna Derecha: Resumen de compra */}
        <aside className="col-lg-4">
          <div className="card-gamer p-4 border border-secondary rounded-3">
            <h2 className="h5 brand-font text-white mb-3 border-bottom border-secondary pb-2">
              Resumen
            </h2>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Subtotal</span>
              <span id="subtotal-monto" className="fw-bold text-white">
                ${subtotal.toLocaleString('es-CL')} CLP
              </span>
            </div>

            {descuento > 0 && subtotal > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Descuento aplicado</span>
                <span className="fw-bold">
                  -${Math.round(descuentoMonto).toLocaleString('es-CL')} CLP
                </span>
              </div>
            )}

            <hr className="border-secondary my-3" />

            <div className="d-flex justify-content-between mb-4 fs-4 fw-bold">
              <span className="text-white">TOTAL:</span>
              <span className="text-info">
                ${Math.round(total).toLocaleString('es-CL')} CLP
              </span>
            </div>

            {/* Bloque de Cupón de Descuento */}
            <div className="mb-4">
              <label htmlFor="cuponInput" className="form-label text-secondary small">
                Ingresa el cupón de descuento:
              </label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  id="cuponInput"
                  placeholder="Ej: DUOC20"
                  value={cuponInput}
                  onChange={(e) => setCuponInput(e.target.value)}
                />
                <button
                  className="btn btn-outline-info fw-bold"
                  type="button"
                  onClick={handleAplicarCupon}
                >
                  APLICAR
                </button>
              </div>
              {errorCupon && (
                <span className="error-msg text-danger small mt-1 d-block">
                  {errorCupon}
                </span>
              )}
              {exitoCupon && (
                <span className="text-success small fw-bold mt-1 d-block">
                  {exitoCupon}
                </span>
              )}
            </div>

            {/* Botón Pagar */}
            <button
              type="button"
              className="btn btn-success w-100 py-3 fw-bold fs-5 text-uppercase"
              onClick={handlePagar}
            >
              PAGAR
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}