// src/Pages/Perfil.jsx
import { Link } from 'react-router-dom';

export default function Perfil({ currentUser, onLogout }) {
  if (!currentUser) {
    return (
      <main className="container my-5 text-center py-5">
        <div className="card-gamer p-5 border border-secondary rounded-3 d-inline-block" style={{ maxWidth: '480px' }}>
          <i className="bi bi-person-x display-1 text-secondary mb-3"></i>
          <h2 className="text-white brand-font mb-3">Sesión no iniciada</h2>
          <p className="text-secondary mb-4">Debes iniciar sesión para ver tu perfil de usuario.</p>
          <Link to="/login" className="btn btn-primary fw-bold text-uppercase px-4 py-2">
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  const esAdmin = currentUser.rol === 'ROLE_ADMIN' || currentUser.rol === 'ADMIN';

  return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-7">
          <div className="card-gamer p-4 p-md-5 border border-secondary rounded-3 shadow-lg">
            {/* Encabezado del Perfil */}
            <div className="text-center mb-4 border-bottom border-secondary pb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{
                  width: '90px',
                  height: '90px',
                  backgroundColor: 'rgba(0, 229, 255, 0.1)',
                  border: '2px solid var(--color-accent, #00e5ff)'
                }}
              >
                <i
                  className="bi bi-person-fill display-4"
                  style={{ color: 'var(--color-accent, #00e5ff)' }}
                ></i>
              </div>
              <h1 className="brand-font text-white fs-3 mb-1">{currentUser.nombre || 'Gamer LevelUp'}</h1>
              <p className="text-secondary small mb-2">{currentUser.correo}</p>
              <div>
                {esAdmin ? (
                  <span className="badge bg-warning text-dark fw-bold px-3 py-1">
                    <i className="bi bi-shield-check me-1"></i> ADMINISTRADOR
                  </span>
                ) : (
                  <span className="badge bg-info text-dark fw-bold px-3 py-1">
                    <i className="bi bi-controller me-1"></i> CLIENTE GAMER
                  </span>
                )}
              </div>
            </div>

            {/* Datos del Usuario */}
            <div className="mb-4">
              <h2 className="h6 text-uppercase text-secondary fw-bold mb-3 tracking-wide">
                Información de la Cuenta
              </h2>

              <div className="list-group list-group-flush bg-transparent">
                <div className="list-group-item bg-transparent text-white border-secondary px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">
                    <i className="bi bi-person me-2"></i>Nombre Completo
                  </span>
                  <span className="fw-semibold">{currentUser.nombre || 'No especificado'}</span>
                </div>

                <div className="list-group-item bg-transparent text-white border-secondary px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">
                    <i className="bi bi-envelope me-2"></i>Correo Electrónico
                  </span>
                  <span className="fw-semibold">{currentUser.correo}</span>
                </div>

                <div className="list-group-item bg-transparent text-white border-secondary px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">
                    <i className="bi bi-telephone me-2"></i>Teléfono
                  </span>
                  <span className="fw-semibold">{currentUser.telefono || '+56 9 1234 5678'}</span>
                </div>

                <div className="list-group-item bg-transparent text-white border-secondary px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">
                    <i className="bi bi-geo-alt me-2"></i>Región
                  </span>
                  <span className="fw-semibold">{currentUser.region || 'Región Metropolitana'}</span>
                </div>

                <div className="list-group-item bg-transparent text-white border-secondary px-0 py-2 d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">
                    <i className="bi bi-pin-map me-2"></i>Comuna
                  </span>
                  <span className="fw-semibold">{currentUser.comuna || 'Santiago'}</span>
                </div>
              </div>
            </div>

            {/* Acciones del Usuario */}
            <div className="d-flex flex-column gap-2 pt-2">
              {esAdmin && (
                <Link to="/admin" className="btn btn-warning fw-bold text-dark w-100 py-2">
                  <i className="bi bi-shield-lock me-2"></i>Panel de Administración
                </Link>
              )}

              <Link to="/" className="btn btn-outline-info fw-bold w-100 py-2">
                <i className="bi bi-shop me-2"></i>Ir a la Tienda
              </Link>

              <Link to="/carrito" className="btn btn-outline-secondary text-white fw-bold w-100 py-2">
                <i className="bi bi-cart3 me-2"></i>Ver mi Carrito
              </Link>

              {onLogout && (
                <button
                  type="button"
                  className="btn btn-outline-danger fw-bold w-100 py-2 mt-2"
                  onClick={onLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
