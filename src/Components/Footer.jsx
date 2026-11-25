// src/components/Footer.jsx
export default function Footer() {
  const handleNewsletter = (e) => {
    e.preventDefault();
    alert('¡Gracias por suscribirte!');
    e.target.reset();
  };

  return (
    <footer className="py-5 border-top border-secondary mt-auto">
      <div className="container">
        <div className="row gy-4 align-items-start">
          {/* Información de la empresa */}
          <div className="col-12 col-md-4">
            <h4 className="brand-font text-white mb-2">LEVEL-UP GAMER</h4>
            <p className="text-secondary small">
              Tienda online especializada en hardware y accesorios gamer en Chile.
            </p>
          </div>

          {/* Enlaces de Categorías */}
          <div className="col-12 col-md-4">
            <h5 className="text-white mb-3">Categorías</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="/#catalogo" className="text-secondary text-decoration-none">
                  Consolas & Computadores
                </a>
              </li>
              <li className="mb-2">
                <a href="/#catalogo" className="text-secondary text-decoration-none">
                  Periféricos & Accesorios
                </a>
              </li>
              <li className="mb-2">
                <a href="/#catalogo" className="text-secondary text-decoration-none">
                  Juegos de Mesa
                </a>
              </li>
            </ul>
          </div>

          {/* Formulario Newsletter */}
          <div className="col-12 col-md-4">
            <h5 className="text-secondary small">Suscríbete y recibe promociones exclusivas.</h5>
            <form className="d-flex gap-2" onSubmit={handleNewsletter}>
              <label htmlFor="newsletterEmail" className="visually-hidden">
                Correo electrónico
              </label>
              <input
                type="email"
                id="newsletterEmail"
                className="form-control form-control-sm"
                placeholder="Ingresa tu correo"
                required
              />
              <button className="btn btn-success btn-sm px-3 fw-bold" type="submit">
                Suscribir
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}