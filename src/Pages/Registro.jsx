
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const REGIONES_DATA = {
    "Region de Valparaiso" : ["Valparaiso", "Viña del Mar", "Quilpue", "Villa Alemana"],
    "Region Metropolitana" : ["Santiago", "Providencia", "Las Condes", "Ñuñoa"],
    "Region del bio Bio" : ["Concepcion","Talcahuano", "San Pedro de la Paz"]
};

export default function Registro() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        contrasena: '',
        confirmarContrasena: '',
        telefono: '',
        region: '',
        comuna: ''
    });

    const [errores, setErrores] = useState({});


    // Función para manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
            //Si cambia la region se reincia la comuna
            ...(id === 'region' ? { comuna: '' } : {})
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        //Validaciones 
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formData.nombre.trim()) {
        newErrors.nombre = 'El nombre completo es obligatorio.';
    } else if (formData.nombre.length > 50) {
        newErrors.nombre = 'El nombre no puede superar los 50 caracteres.';
    } else if (!regexNombre.test(formData.nombre)) {
        newErrors.nombre = 'El nombre sólo debe contener letras y espacios.';
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usuariosRegistrados = JSON.parse(localStorage.getItem('users')) || [];

    if (!formData.correo.trim()) {
        newErrors.correo = 'El correo electrónico es obligatorio.';
    } else if (!regexEmail.test(formData.correo)) {
        newErrors.correo = 'Ingrese un formato de correo válido (ej: usuario@mail.com).';
    } else {
        const existe = usuariosRegistrados.some(
            (u) => u.correo.toLowerCase() === formData.correo.toLowerCase()
      );
      if (existe) {
        newErrors.correo = 'Este correo ya se encuentra registrado.';
      }
    }

    
    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&.])[A-Za-z\d@#$!%*?&.]{8,}$/;
    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es obligatoria.';
    } else if (!regexPass.test(formData.contrasena)) {
      newErrors.contrasena =
        'Debe tener mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.';
    }

    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Debe confirmar su contraseña.';
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = 'Las contraseñas no coinciden.';
    }

    const regexTel = /^(\+?56\s?9\s?\d{4}\s?\d{4}|9\d{8})$/;
    if (formData.telefono.trim() !== '') {
      const telLimpio = formData.telefono.replace(/\s+/g, '');
      if (!regexTel.test(telLimpio)) {
        newErrors.telefono =
          'Formato inválido. Ejemplo: +56 9 1234 5678 o 912345678.';
      }
    }

    if (!formData.region) {
        newErrors.region = 'Debe seleccionar una región.';
    }
    if (!formData.comuna) {
        newErrors.comuna = 'Debe seleccionar una comuna.';
    }

    setErrores(newErrors);


    // Si no hay errores se guarda en el backend y en local storage
    if (Object.keys(newErrors).length === 0) {
        const nuevoUsuario = {
            nombre: formData.nombre,
            correo: formData.correo,
            contrasena: formData.contrasena,
            telefono: formData.telefono,
            region: formData.region,
            comuna: formData.comuna
        };

        if (import.meta.env.MODE === 'test') {
            usuariosRegistrados.push(nuevoUsuario);
            localStorage.setItem('users', JSON.stringify(usuariosRegistrados));
            alert('Registro exitoso.');
            navigate('/login');
            return;
        }

        // Navegador real: Enviar a MS-Login (MySQL) y guardar copia en localStorage
        api.registro(nuevoUsuario).catch((err) => {
            console.warn('Registro local fallback:', err);
        }).finally(() => {
            usuariosRegistrados.push(nuevoUsuario);
            localStorage.setItem('users', JSON.stringify(usuariosRegistrados));
            alert('Registro exitoso.');
            navigate('/login');
        });
    }
  };
return (
    <main className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card-gamer p-4 p-md-5 border border-secondary shadow-lg">
            <h2 className="brand-font text-center mb-4 text-white">Registro de usuario</h2>

            <form onSubmit={handleSubmit} noValidate>
              {/* 1. Nombre Completo */}
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label text-white small fw-bold">
                  NOMBRE COMPLETO
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  maxLength="50"
                  placeholder="Ej: Benjamin Castro"
                  value={formData.nombre}
                  onChange={handleChange}
                />
                <span className="helper-text text-secondary small">
                  Obligatorio. Únicamente letras y espacios (máximo 50 caracteres).
                </span>
                {errores.nombre && (
                  <span className="error-msg text-danger small d-block mt-1">
                    {errores.nombre}
                  </span>
                )}
              </div>

              {/* 2. Correo Electrónico */}
              <div className="mb-3">
                <label htmlFor="correo" className="form-label text-white small fw-bold">
                  CORREO
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="correo"
                  placeholder="nombre@correo.com"
                  value={formData.correo}
                  onChange={handleChange}
                />
                <span className="helper-text text-secondary small">
                  Formato válido. Debe ser único en la plataforma.
                </span>
                {errores.correo && (
                  <span className="error-msg text-danger small d-block mt-1">
                    {errores.correo}
                  </span>
                )}
              </div>

              {/* 3. Contraseña */}
              <div className="mb-3">
                <label htmlFor="contrasena" className="form-label text-white small fw-bold">
                  CONTRASEÑA
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="contrasena"
                  placeholder="••••••••"
                  value={formData.contrasena}
                  onChange={handleChange}
                />
                <span className="helper-text text-secondary small">
                  Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (@#$%!.*).
                </span>
                {errores.contrasena && (
                  <span className="error-msg text-danger small d-block mt-1">
                    {errores.contrasena}
                  </span>
                )}
              </div>

              {/* 4. Confirmar Contraseña */}
              <div className="mb-3">
                <label htmlFor="confirmarContrasena" className="form-label text-white small fw-bold">
                  CONFIRMAR CONTRASEÑA
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmarContrasena"
                  placeholder="••••••••"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                />
                <span className="helper-text text-secondary small">
                  Debe coincidir con la contraseña anterior.
                </span>
                {errores.confirmarContrasena && (
                  <span className="error-msg text-danger small d-block mt-1">
                    {errores.confirmarContrasena}
                  </span>
                )}
              </div>

              {/* 5. Teléfono */}
              <div className="mb-3">
                <label htmlFor="telefono" className="form-label text-white small fw-bold">
                  TELÉFONO (Opcional)
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="telefono"
                  placeholder="+56 9 1234 5678 o 912345678"
                  value={formData.telefono}
                  onChange={handleChange}
                />
                <span className="helper-text text-secondary small">
                  Opcional. Si se ingresa, debe ser formato móvil chileno válido.
                </span>
                {errores.telefono && (
                  <span className="error-msg text-danger small d-block mt-1">
                    {errores.telefono}
                  </span>
                )}
              </div>

              {/* 6. Región y Comuna Encadenados */}
              <div className="row g-2 mb-4">
                <div className="col-md-6">
                  <label htmlFor="region" className="form-label text-white small fw-bold">
                    REGIÓN
                  </label>
                  <select
                    className="form-select"
                    id="region"
                    value={formData.region}
                    onChange={handleChange}
                  >
                    <option value="">Seleccione su región</option>
                    {Object.keys(REGIONES_DATA).map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                  {errores.region && (
                    <span className="error-msg text-danger small d-block mt-1">
                      {errores.region}
                    </span>
                  )}
                </div>

                <div className="col-md-6">
                  <label htmlFor="comuna" className="form-label text-white small fw-bold">
                    COMUNA
                  </label>
                  <select
                    className="form-select"
                    id="comuna"
                    value={formData.comuna}
                    onChange={handleChange}
                    disabled={!formData.region}
                  >
                    <option value="">Seleccione comuna...</option>
                    {formData.region &&
                      REGIONES_DATA[formData.region]?.map((com) => (
                        <option key={com} value={com}>
                          {com}
                        </option>
                      ))}
                  </select>
                  {errores.comuna && (
                    <span className="error-msg text-danger small d-block mt-1">
                      {errores.comuna}
                    </span>
                  )}
                </div>
              </div>

              {/* Botón de Registro */}
              <div className="text-center mt-4">
                <button type="submit" className="btn btn-outline-light px-5 py-2 fw-bold">
                  Registrar
                </button>
              </div>
            </form>

            <div className="text-center mt-3 pt-3 border-top border-secondary">
              <span className="text-secondary small">¿Ya tienes cuenta? </span>
              <Link to="/login" className="text-info fw-bold text-decoration-none small">
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
