// src/Pages/AdminUsuarios.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services/userService';

const REGIONES_DATA = {
  "Region de Valparaiso": ["Valparaiso", "Viña del Mar", "Quilpue", "Villa Alemana"],
  "Region Metropolitana": ["Santiago", "Providencia", "Las Condes", "Ñuñoa"],
  "Region del bio Bio": ["Concepcion", "Talcahuano", "San Pedro de la Paz"]
};

// Normalizar texto de región para coincidir con las llaves de REGIONES_DATA
const normalizarRegion = (reg) => {
  if (!reg) return 'Region Metropolitana';
  const regLimpio = reg
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const encontrada = Object.keys(REGIONES_DATA).find(
    (k) =>
      k
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase() === regLimpio
  );
  return encontrada || 'Region Metropolitana';
};

export default function AdminUsuarios({ currentUser }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [alerta, setAlerta] = useState(null);

  // Estados de modales
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  // Formulario inicial con región por defecto del proyecto
  const regionInicial = 'Region Metropolitana';
  const formInicial = {
    nombre: '',
    correo: '',
    contrasena: '',
    telefono: '',
    region: regionInicial,
    comuna: REGIONES_DATA[regionInicial][0],
    rol: 'ROLE_CLIENTE'
  };
  const [formCrear, setFormCrear] = useState(formInicial);
  const [formEditar, setFormEditar] = useState(formInicial);
  const [guardando, setGuardando] = useState(false);

  // Cargar usuarios desde el microservicio
  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const data = await userService.getAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      mostrarAlerta('danger', 'Error al cargar usuarios: ' + (err.message || 'Error desconocido'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => setAlerta(null), 5000);
  };

  // Filtrado de usuarios: EXCLUSIVAMENTE POR NOMBRE (y por rol si aplica)
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideNombre = (u.nombre || '')
      .toLowerCase()
      .includes(busqueda.toLowerCase().trim());

    const coincideRol =
      filtroRol === 'TODOS' ||
      u.rol === filtroRol ||
      (filtroRol === 'ROLE_ADMIN' && (u.rol === 'ROLE_ADMIN' || u.rol === 'ADMIN')) ||
      (filtroRol === 'ROLE_CLIENTE' && (u.rol === 'ROLE_CLIENTE' || u.rol === 'CLIENTE'));

    return coincideNombre && coincideRol;
  });

  // Métricas
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter(
    (u) => u.rol === 'ROLE_ADMIN' || u.rol === 'ADMIN'
  ).length;
  const totalClientes = usuarios.filter(
    (u) => u.rol === 'ROLE_CLIENTE' || u.rol === 'CLIENTE'
  ).length;

  // Manejo de cambio de región en Crear Usuario
  const handleRegionCrearChange = (e) => {
    const nuevaRegion = e.target.value;
    const comunas = REGIONES_DATA[nuevaRegion] || [];
    setFormCrear((prev) => ({
      ...prev,
      region: nuevaRegion,
      comuna: comunas[0] || ''
    }));
  };

  // Manejo de cambio de región en Editar Usuario
  const handleRegionEditarChange = (e) => {
    const nuevaRegion = e.target.value;
    const comunas = REGIONES_DATA[nuevaRegion] || [];
    setFormEditar((prev) => ({
      ...prev,
      region: nuevaRegion,
      comuna: comunas[0] || ''
    }));
  };

  // Cambiar rol rápido
  const handleCambiarRolRapido = async (usuario) => {
    const esAdmin = usuario.rol === 'ROLE_ADMIN' || usuario.rol === 'ADMIN';
    const nuevoRol = esAdmin ? 'ROLE_CLIENTE' : 'ROLE_ADMIN';

    if (currentUser && String(currentUser.id) === String(usuario.id)) {
      if (!confirm('¿Estás seguro de quitarte a ti mismo los permisos de administrador?')) {
        return;
      }
    }

    try {
      await userService.changeRole(usuario.id, nuevoRol);
      mostrarAlerta(
        'success',
        `Rol de ${usuario.nombre || usuario.correo} actualizado a ${
          nuevoRol === 'ROLE_ADMIN' ? 'Administrador' : 'Cliente'
        }`
      );
      await cargarUsuarios();
    } catch (err) {
      mostrarAlerta('danger', 'Error al cambiar rol: ' + err.message);
    }
  };

  // Crear usuario
  const handleCrearSubmit = async (e) => {
    e.preventDefault();
    if (!formCrear.nombre.trim() || !formCrear.correo.trim()) {
      mostrarAlerta('warning', 'Nombre y correo electrónico son obligatorios.');
      return;
    }

    setGuardando(true);
    try {
      await userService.create(formCrear);
      mostrarAlerta('success', `Usuario ${formCrear.nombre} creado correctamente.`);
      setModalCrearAbierto(false);
      setFormCrear(formInicial);
      await cargarUsuarios();
    } catch (err) {
      mostrarAlerta('danger', 'Error al crear usuario: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal edición
  const handleAbrirEditar = (usuario) => {
    setUsuarioAEditar(usuario);
    const regNorm = normalizarRegion(usuario.region);
    const comunasValidas = REGIONES_DATA[regNorm] || [];
    const com = comunasValidas.includes(usuario.comuna)
      ? usuario.comuna
      : comunasValidas[0] || '';

    setFormEditar({
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      contrasena: '',
      telefono: usuario.telefono || '',
      region: regNorm,
      comuna: com,
      rol: usuario.rol || 'ROLE_CLIENTE'
    });
    setModalEditarAbierto(true);
  };

  // Guardar edición
  const handleEditarSubmit = async (e) => {
    e.preventDefault();
    if (!usuarioAEditar) return;

    setGuardando(true);
    try {
      const payload = {
        nombre: formEditar.nombre,
        telefono: formEditar.telefono,
        region: formEditar.region,
        comuna: formEditar.comuna,
        rol: formEditar.rol
      };
      if (formEditar.contrasena.trim()) {
        payload.contrasena = formEditar.contrasena.trim();
      }

      await userService.update(usuarioAEditar.id, payload);
      mostrarAlerta('success', `Usuario ${usuarioAEditar.correo} actualizado correctamente.`);
      setModalEditarAbierto(false);
      setUsuarioAEditar(null);
      await cargarUsuarios();
    } catch (err) {
      mostrarAlerta('danger', 'Error al actualizar usuario: ' + err.message);
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar eliminación
  const handleEliminar = async () => {
    if (!usuarioAEliminar) return;

    try {
      await userService.delete(usuarioAEliminar.id);
      mostrarAlerta('success', `Usuario ${usuarioAEliminar.correo} eliminado.`);
      setUsuarioAEliminar(null);
      await cargarUsuarios();
    } catch (err) {
      mostrarAlerta('danger', 'Error al eliminar usuario: ' + err.message);
    }
  };

  return (
    <main className="container my-5">
      {/* Encabezado */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="brand-font text-white fs-2 mb-1">
            <i className="bi bi-people-fill text-warning me-2"></i>Gestión de Usuarios
          </h1>
          <p className="text-secondary small mb-0">
            Panel de administración de cuentas, roles y control de acceso (Conectado a MS-Login en BD MySQL)
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin" className="btn btn-outline-secondary">
            <i className="bi bi-box-seam me-2"></i>Admin Productos
          </Link>
          <button
            type="button"
            className="btn btn-warning fw-bold text-dark"
            onClick={() => setModalCrearAbierto(true)}
          >
            <i className="bi bi-person-plus-fill me-2"></i>Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Alerta */}
      {alerta && (
        <div className={`alert alert-${alerta.tipo} alert-dismissible fade show`} role="alert">
          <i
            className={`bi me-2 ${
              alerta.tipo === 'success'
                ? 'bi-check-circle-fill'
                : alerta.tipo === 'warning'
                ? 'bi-exclamation-triangle-fill'
                : 'bi-exclamation-octagon-fill'
            }`}
          ></i>
          {alerta.mensaje}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlerta(null)}
            aria-label="Cerrar alerta"
          ></button>
        </div>
      )}

      {/* Tarjetas de Métricas */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card-gamer p-3 border border-secondary rounded-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-secondary small text-uppercase">Total Usuarios</div>
              <div className="fs-3 fw-bold text-white">{totalUsuarios}</div>
            </div>
            <i className="bi bi-people fs-1 text-info opacity-75"></i>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card-gamer p-3 border border-secondary rounded-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-secondary small text-uppercase">Administradores</div>
              <div className="fs-3 fw-bold text-warning">{totalAdmins}</div>
            </div>
            <i className="bi bi-shield-shaded fs-1 text-warning opacity-75"></i>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card-gamer p-3 border border-secondary rounded-3 d-flex align-items-center justify-content-between">
            <div>
              <div className="text-secondary small text-uppercase">Clientes Registrados</div>
              <div className="fs-3 fw-bold text-primary">{totalClientes}</div>
            </div>
            <i className="bi bi-person-badge fs-1 text-primary opacity-75"></i>
          </div>
        </div>
      </div>

      {/* Contenedor Principal: Búsqueda por Nombre y Tabla */}
      <div className="card-gamer p-4 border border-secondary rounded-3">
        {/* Barra de Filtros */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-7">
            <div className="input-group">
              <span className="input-group-text bg-dark text-secondary border-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar usuario por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar usuario por nombre"
              />
            </div>
          </div>
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-dark text-secondary border-secondary">
                <i className="bi bi-funnel"></i>
              </span>
              <select
                className="form-select bg-dark text-white border-secondary"
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                aria-label="Filtrar por rol"
              >
                <option value="TODOS">Todos los roles</option>
                <option value="ROLE_ADMIN">Solo Administradores (ROLE_ADMIN)</option>
                <option value="ROLE_CLIENTE">Solo Clientes (ROLE_CLIENTE)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0 border-secondary">
            <thead>
              <tr className="border-secondary text-secondary small text-uppercase">
                <th scope="col" style={{ width: '60px' }}>ID</th>
                <th scope="col">Usuario</th>
                <th scope="col">Contacto</th>
                <th scope="col">Ubicación</th>
                <th scope="col">Rol</th>
                <th scope="col" className="text-end" style={{ width: '160px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    <div className="spinner-border text-warning spinner-border-sm me-2" role="status"></div>
                    Cargando usuarios desde el microservicio...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    <i className="bi bi-people fs-1 d-block mb-2 opacity-50"></i>
                    No se encontraron usuarios con ese nombre.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const esAdmin = u.rol === 'ROLE_ADMIN' || u.rol === 'ADMIN';
                  const esUsuarioActual = currentUser && String(currentUser.id) === String(u.id);

                  return (
                    <tr key={u.id}>
                      <td className="text-secondary small fw-bold">#{u.id}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold small flex-shrink-0"
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: esAdmin ? 'var(--bs-warning, #f59e0b)' : 'var(--color-primary, #6366f1)',
                              color: esAdmin ? '#000' : '#fff'
                            }}
                          >
                            {(u.nombre || u.correo || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="text-truncate" style={{ maxWidth: '220px' }}>
                            <div className="text-white fw-semibold small text-truncate">
                              {u.nombre || 'Sin nombre'}
                              {esUsuarioActual && (
                                <span className="badge bg-secondary ms-1 small">Tú</span>
                              )}
                            </div>
                            <div className="text-secondary small text-truncate">{u.correo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small text-secondary">
                        <i className="bi bi-telephone me-1 opacity-75"></i>
                        {u.telefono || 'Sin teléfono'}
                      </td>
                      <td className="small text-secondary">
                        <div>{u.comuna || 'Sin comuna'}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.region || 'Chile'}</div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            esAdmin ? 'btn-outline-warning' : 'btn-outline-primary'
                          } d-inline-flex align-items-center gap-1`}
                          title="Haz clic para alternar rol"
                          onClick={() => handleCambiarRolRapido(u)}
                        >
                          <i className={`bi ${esAdmin ? 'bi-shield-fill-check' : 'bi-person'}`}></i>
                          <span>{esAdmin ? 'Admin' : 'Cliente'}</span>
                          <i className="bi bi-arrow-left-right ms-1 small opacity-75"></i>
                        </button>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-info"
                            title="Editar usuario"
                            aria-label={`Editar ${u.nombre || u.correo}`}
                            onClick={() => handleAbrirEditar(u)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            title={
                              esUsuarioActual
                                ? 'No puedes eliminar tu propia cuenta'
                                : 'Eliminar usuario'
                            }
                            aria-label={`Eliminar ${u.nombre || u.correo}`}
                            disabled={esUsuarioActual}
                            onClick={() => setUsuarioAEliminar(u)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR USUARIO */}
      {modalCrearAbierto && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title brand-font text-warning">
                  <i className="bi bi-person-plus-fill me-2"></i>Registrar Nuevo Usuario
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalCrearAbierto(false)}
                  aria-label="Cerrar"
                ></button>
              </div>
              <form onSubmit={handleCrearSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control bg-black text-white border-secondary"
                      placeholder="Ej: Juan Pérez"
                      required
                      value={formCrear.nombre}
                      onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Correo Electrónico *</label>
                    <input
                      type="email"
                      className="form-control bg-black text-white border-secondary"
                      placeholder="ejemplo@correo.cl"
                      required
                      value={formCrear.correo}
                      onChange={(e) => setFormCrear({ ...formCrear, correo: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Contraseña (Opcional, default: User123!)</label>
                    <input
                      type="password"
                      className="form-control bg-black text-white border-secondary"
                      placeholder="Mínimo 6 caracteres"
                      value={formCrear.contrasena}
                      onChange={(e) => setFormCrear({ ...formCrear, contrasena: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Teléfono</label>
                      <input
                        type="text"
                        className="form-control bg-black text-white border-secondary"
                        placeholder="912345678"
                        value={formCrear.telefono}
                        onChange={(e) => setFormCrear({ ...formCrear, telefono: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Rol *</label>
                      <select
                        className="form-select bg-black text-white border-secondary"
                        value={formCrear.rol}
                        onChange={(e) => setFormCrear({ ...formCrear, rol: e.target.value })}
                      >
                        <option value="ROLE_CLIENTE">Cliente (ROLE_CLIENTE)</option>
                        <option value="ROLE_ADMIN">Administrador (ROLE_ADMIN)</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Región</label>
                      <select
                        className="form-select bg-black text-white border-secondary"
                        value={formCrear.region}
                        onChange={handleRegionCrearChange}
                      >
                        {Object.keys(REGIONES_DATA).map((reg) => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Comuna</label>
                      <select
                        className="form-select bg-black text-white border-secondary"
                        value={formCrear.comuna}
                        onChange={(e) => setFormCrear({ ...formCrear, comuna: e.target.value })}
                      >
                        {(REGIONES_DATA[formCrear.region] || []).map((com) => (
                          <option key={com} value={com}>{com}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalCrearAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning fw-bold text-dark"
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar en BD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {modalEditarAbierto && usuarioAEditar && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title brand-font text-info">
                  <i className="bi bi-pencil-square me-2"></i>Editar Usuario #{usuarioAEditar.id}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setModalEditarAbierto(false)}
                  aria-label="Cerrar"
                ></button>
              </div>
              <form onSubmit={handleEditarSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Correo Electrónico</label>
                    <input
                      type="email"
                      className="form-control bg-black text-secondary border-secondary"
                      value={formEditar.correo}
                      disabled
                    />
                    <div className="form-text text-secondary" style={{ fontSize: '0.75rem' }}>
                      El correo es el identificador único y no puede cambiarse.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control bg-black text-white border-secondary"
                      required
                      value={formEditar.nombre}
                      onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-secondary">Nueva Contraseña (Dejar en blanco para conservar actual)</label>
                    <input
                      type="password"
                      className="form-control bg-black text-white border-secondary"
                      placeholder="Nueva contraseña opcional"
                      value={formEditar.contrasena}
                      onChange={(e) => setFormEditar({ ...formEditar, contrasena: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Teléfono</label>
                      <input
                        type="text"
                        className="form-control bg-black text-white border-secondary"
                        value={formEditar.telefono}
                        onChange={(e) => setFormEditar({ ...formEditar, telefono: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Rol *</label>
                      <select
                        className="form-select bg-black text-white border-secondary"
                        value={formEditar.rol}
                        onChange={(e) => setFormEditar({ ...formEditar, rol: e.target.value })}
                      >
                        <option value="ROLE_CLIENTE">Cliente (ROLE_CLIENTE)</option>
                        <option value="ROLE_ADMIN">Administrador (ROLE_ADMIN)</option>
                      </select>
                    </div>
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Región</label>
                      <select
                        className="form-select bg-black text-white border-secondary"
                        value={formEditar.region}
                        onChange={handleRegionEditarChange}
                      >
                        {Object.keys(REGIONES_DATA).map((reg) => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-secondary">Comuna</label>
                      <select
                        className="form-select bg-black text-white border-secondary"
                        value={formEditar.comuna}
                        onChange={(e) => setFormEditar({ ...formEditar, comuna: e.target.value })}
                      >
                        {(REGIONES_DATA[formEditar.region] || []).map((com) => (
                          <option key={com} value={com}>{com}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setModalEditarAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info fw-bold text-dark"
                    disabled={guardando}
                  >
                    {guardando ? 'Actualizando...' : 'Actualizar en BD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {usuarioAEliminar && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white border border-danger">
              <div className="modal-header border-danger">
                <h5 className="modal-title text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>Eliminar Usuario
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setUsuarioAEliminar(null)}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  ¿Estás seguro de que deseas eliminar la cuenta de{' '}
                  <strong className="text-warning">
                    {usuarioAEliminar.nombre || usuarioAEliminar.correo}
                  </strong>{' '}
                  ({usuarioAEliminar.correo})?
                </p>
                <p className="text-secondary small mb-0">
                  Esta acción eliminará el registro permanentemente de la base de datos de autenticación.
                </p>
              </div>
              <div className="modal-footer border-secondary">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setUsuarioAEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger fw-bold"
                  onClick={handleEliminar}
                >
                  Confirmar Eliminación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
