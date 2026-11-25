// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Context/useCart';

export default function Navbar({ currentUser, onLogout, theme: propTheme, onToggleTheme }) {
  const { carrito, totalCartCount } = useCart();
  const [busqueda, setBusqueda] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [localTheme, setLocalTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const userRef = useRef(null);
  const cartRef = useRef(null);
  const navigate = useNavigate();

  const currentTheme = propTheme ?? localTheme;

  const handleToggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      setLocalTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.documentElement.setAttribute('data-bs-theme', nextTheme);
      try {
        localStorage.setItem('theme', nextTheme);
      } catch {}
    }
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menús con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserOpen(false);
        setCartOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = busqueda.trim();
    if (query) {
      navigate(`/?q=${encodeURIComponent(query)}#catalogo`);
    } else {
      navigate('/#catalogo');
    }
  };

  const primerNombre = currentUser?.nombre
    ? currentUser.nombre.split(' ')[0]
    : 'Usuario';

  const esCliente = currentUser && (currentUser.rol === 'ROLE_CLIENTE' || currentUser.rol === 'CLIENTE');

  const subtotalCarrito = carrito.reduce(
    (acc, item) => acc + (item.precio || 0) * (item.cantidad || 1),
    0
  );

  return (
    <header className="py-2 sticky-top top-header">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between gap-3">
          {/* 1. Logotipo y Marca */}
          <Link
            to="/"
            className="d-flex align-items-center gap-2 text-decoration-none text-white brand-font fs-4 flex-shrink-0"
          >
            <i className="bi bi-controller fs-2" style={{ color: 'var(--color-accent)' }}></i>
            <span className="fw-bold tracking-wide">
              LEVEL-UP <span style={{ color: 'var(--color-accent)' }}>GAMER</span>
            </span>
          </Link>

          {/* 2. Barra de búsqueda central continua y oscura (sin zonas blancas) */}
          <form
            className="navbar-search-wrapper flex-grow-1 mx-2 mx-md-4"
            style={{ maxWidth: '420px' }}
            onSubmit={handleSearch}
            role="search"
          >
            <i className="bi bi-search text-secondary me-2"></i>
            <input
              type="search"
              className="navbar-search-input"
              placeholder="Buscar productos gamer..."
              aria-label="Buscar productos"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button
                type="button"
                className="btn btn-link text-secondary p-0 border-0 ms-1"
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </form>

          {/* 3. Navegación apegada a la derecha con estilo uniforme */}
          <nav className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">
            {/* Inicio */}
            <Link className="nav-action-btn" to="/">
              <i className="bi bi-house-door"></i>
              <span className="d-none d-md-inline">Inicio</span>
            </Link>

            {/* Productos */}
            <a className="nav-action-btn" href="/#catalogo">
              <i className="bi bi-grid"></i>
              <span className="d-none d-md-inline">Productos</span>
            </a>

            {/* Perfil / Iniciar Sesión */}
            {currentUser ? (
              <div className="position-relative" ref={userRef}>
                <button
                  type="button"
                  id="nav-user"
                  className={`nav-action-btn ${userOpen ? 'active' : ''}`}
                  onClick={() => {
                    setUserOpen((prev) => !prev);
                    setCartOpen(false);
                  }}
                  aria-expanded={userOpen}
                  aria-label={`Perfil de ${primerNombre}`}
                  title={`Perfil: ${primerNombre}`}
                >
                  <i className="bi bi-person-circle"></i>
                  <span className="d-none d-md-inline">{primerNombre}</span>
                  <i className="bi bi-chevron-down small opacity-75"></i>
                </button>

                {/* Menú Desplegable de Perfil */}
                {userOpen && (
                  <div
                    className="dropdown-menu dropdown-menu-dark-custom dropdown-menu-end p-2 show position-absolute mt-2 shadow-lg"
                    style={{ right: 0, minWidth: '220px', zIndex: 1060 }}
                    role="menu"
                    aria-label="Menú de usuario"
                  >
                    <div className="px-3 py-2 border-bottom border-secondary border-opacity-50 mb-1">
                      <div className="text-white fw-bold small text-truncate">
                        {currentUser.nombre || 'Usuario'}
                      </div>
                      {currentUser.correo && (
                        <div className="text-secondary small text-truncate">
                          {currentUser.correo}
                        </div>
                      )}
                    </div>

                    {/* Perfil */}
                    <Link
                      to="/perfil"
                      className="dropdown-item dropdown-item-custom d-flex align-items-center gap-2 py-2 px-3"
                      role="menuitem"
                      onClick={() => setUserOpen(false)}
                    >
                      <i className="bi bi-person-gear text-info"></i>
                      <span>Perfil</span>
                    </Link>

                    {/* Botones ADMIN dentro del menú de Perfil (Oculto para usuarios clientes) */}
                    {!esCliente && (
                      <>
                        <Link
                          to="/admin"
                          className="dropdown-item dropdown-item-custom d-flex align-items-center gap-2 py-2 px-3 text-warning"
                          role="menuitem"
                          onClick={() => setUserOpen(false)}
                        >
                          <i className="bi bi-box-seam"></i>
                          <span>Admin</span>
                        </Link>
                        <Link
                          to="/admin/usuarios"
                          className="dropdown-item dropdown-item-custom d-flex align-items-center gap-2 py-2 px-3 text-warning"
                          role="menuitem"
                          onClick={() => setUserOpen(false)}
                        >
                          <i className="bi bi-people-fill"></i>
                          <span>Gestión Usuarios</span>
                        </Link>
                      </>
                    )}

                    <hr className="dropdown-divider border-secondary border-opacity-50 my-1" />

                    {/* Cerrar Sesión */}
                    <button
                      type="button"
                      className="dropdown-item dropdown-item-custom d-flex align-items-center gap-2 py-2 px-3 text-danger border-0 bg-transparent w-100 text-start"
                      role="menuitem"
                      onClick={() => {
                        setUserOpen(false);
                        onLogout();
                      }}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                id="nav-user"
                className="nav-action-btn"
                aria-label="Iniciar sesión"
                title="Iniciar sesión"
              >
                <i className="bi bi-person"></i>
                <span className="d-none d-md-inline">Iniciar sesión</span>
              </Link>
            )}

            {/* Carrito con texto "Carrito" y contador sin paréntesis */}
            <div className="position-relative" ref={cartRef}>
              <button
                type="button"
                id="cart-toggle-btn"
                className={`nav-action-btn ${cartOpen ? 'active' : ''}`}
                aria-label={`Carrito ${totalCartCount}`}
                aria-expanded={cartOpen}
                onClick={() => {
                  setCartOpen((prev) => !prev);
                  setUserOpen(false);
                }}
                title="Ver carrito de compras"
              >
                <i className="bi bi-cart3"></i>
                <span className="d-none d-md-inline">Carrito</span>
                <span id="cart-count" className="badge bg-accent text-dark rounded-pill fw-bold ms-1">
                  {totalCartCount}
                </span>
              </button>

              {/* Menú Desplegable del Carrito */}
              {cartOpen && (
                <div
                  className="dropdown-menu dropdown-menu-dark-custom dropdown-menu-end p-3 show position-absolute mt-2 shadow-lg"
                  style={{ right: 0, minWidth: '320px', maxWidth: '360px', zIndex: 1060 }}
                  role="dialog"
                  aria-label="Resumen del carrito"
                >
                  <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-50">
                    <span className="fw-bold text-white small d-flex align-items-center gap-2">
                      <i className="bi bi-cart3" style={{ color: 'var(--color-accent)' }}></i> Tu Carrito
                    </span>
                    <span className="badge bg-secondary small">
                      {totalCartCount} {totalCartCount === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>

                  {carrito.length === 0 ? (
                    <div className="text-center py-4 text-secondary">
                      <i className="bi bi-cart-x fs-1 d-block mb-2 opacity-50"></i>
                      <p className="small mb-1 text-white">Tu carrito está vacío</p>
                      <p className="small text-secondary mb-0">Agrega productos desde el catálogo</p>
                    </div>
                  ) : (
                    <>
                      <div
                        className="pe-1 my-2"
                        style={{ maxHeight: '220px', overflowY: 'auto' }}
                      >
                        {carrito.map((item) => (
                          <div
                            key={item.id}
                            className="d-flex align-items-center gap-2 py-2 border-bottom border-secondary border-opacity-25"
                          >
                            <img
                              src={item.img}
                              alt={item.nombre}
                              className="rounded border border-secondary"
                              style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                            />
                            <div className="flex-grow-1 overflow-hidden" style={{ minWidth: 0 }}>
                              <div
                                className="text-white small text-truncate fw-semibold"
                                title={item.nombre}
                              >
                                {item.nombre}
                              </div>
                              <div className="text-secondary small">
                                {item.cantidad} x ${Number(item.precio || 0).toLocaleString('es-CL')}
                              </div>
                            </div>
                            <div className="small fw-bold text-nowrap" style={{ color: 'var(--color-accent)' }}>
                              ${(Number(item.precio || 0) * (item.cantidad || 1)).toLocaleString('es-CL')}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 pb-1 border-top border-secondary border-opacity-50 my-2">
                        <span className="text-secondary small">Subtotal estimado:</span>
                        <span className="text-white fw-bold fs-6">
                          ${subtotalCarrito.toLocaleString('es-CL')} CLP
                        </span>
                      </div>
                    </>
                  )}

                  <Link
                    to="/carrito"
                    className="btn btn-add-cart w-100 fw-bold d-flex align-items-center justify-content-center gap-2 mt-2"
                    onClick={() => setCartOpen(false)}
                  >
                    <i className="bi bi-arrow-right-circle"></i>
                    <span>Ir a la página del carrito</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Alternar Modo Claro / Oscuro (Al final del Navbar, solo icono) */}
            <button
              type="button"
              id="theme-toggle-btn"
              className="nav-action-btn px-2 d-flex align-items-center justify-content-center"
              onClick={handleToggleTheme}
              aria-label={`Cambiar a modo ${currentTheme === 'dark' ? 'claro' : 'oscuro'}`}
              title={`Cambiar a modo ${currentTheme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              <i
                className={`bi ${
                  currentTheme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill text-primary'
                } fs-5`}
              ></i>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
