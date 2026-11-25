import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Registro from './Registro'

const renderRegistro = () =>
  render(
    <MemoryRouter initialEntries={['/registro']}>
      <Routes>
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<div>PANTALLA-LOGIN</div>} />
      </Routes>
    </MemoryRouter>
  )

const set = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const enviar = () =>
  fireEvent.submit(screen.getByRole('button', { name: 'Registrar' }).closest('form'))

const llenarFormularioValido = () => {
  set('NOMBRE COMPLETO', 'Benjamin Castro')
  set('CORREO', 'benja@correo.com')
  set('CONTRASEÑA', 'Password1@')
  set('CONFIRMAR CONTRASEÑA', 'Password1@')
  set('TELÉFONO (Opcional)', '+56 9 1234 5678')
  set('REGIÓN', 'Region Metropolitana')
  set('COMUNA', 'Santiago')
}

describe('Página de Registro - Validaciones', () => {
  it('muestra errores al enviar el formulario vacío', () => {
    renderRegistro()
    enviar()

    expect(screen.getByText('El nombre completo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('El correo electrónico es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
    expect(screen.getByText('Debe confirmar su contraseña.')).toBeInTheDocument()
    expect(screen.getByText('Debe seleccionar una región.')).toBeInTheDocument()
    expect(screen.getByText('Debe seleccionar una comuna.')).toBeInTheDocument()
  })

  it('rechaza un nombre que contiene números', () => {
    renderRegistro()
    set('NOMBRE COMPLETO', 'Benjamin 123')
    enviar()

    expect(
      screen.getByText('El nombre sólo debe contener letras y espacios.')
    ).toBeInTheDocument()
  })

  it('rechaza un nombre demasiado largo', () => {
    renderRegistro()
    set('NOMBRE COMPLETO', 'a'.repeat(51))
    enviar()

    expect(
      screen.getByText('El nombre no puede superar los 50 caracteres.')
    ).toBeInTheDocument()
  })

  it('rechaza un correo con formato inválido', () => {
    renderRegistro()
    set('CORREO', 'no-es-un-correo')
    enviar()

    expect(
      screen.getByText('Ingrese un formato de correo válido (ej: usuario@mail.com).')
    ).toBeInTheDocument()
  })

  it('rechaza un correo que ya está registrado (sin importar mayúsculas)', () => {
    localStorage.setItem(
      'users',
      JSON.stringify([{ nombre: 'Otro', correo: 'existente@correo.com' }])
    )
    renderRegistro()
    set('CORREO', 'EXISTENTE@correo.com')
    enviar()

    expect(screen.getByText('Este correo ya se encuentra registrado.')).toBeInTheDocument()
  })

  it('rechaza una contraseña que no cumple la política de seguridad', () => {
    renderRegistro()
    set('CONTRASEÑA', 'abc123')
    enviar()

    expect(
      screen.getByText(
        'Debe tener mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.'
      )
    ).toBeInTheDocument()
  })

  it('rechaza contraseñas que no coinciden', () => {
    renderRegistro()
    set('CONTRASEÑA', 'Password1@')
    set('CONFIRMAR CONTRASEÑA', 'Password2@')
    enviar()

    expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument()
  })

  it('rechaza un teléfono con formato inválido', () => {
    renderRegistro()
    set('TELÉFONO (Opcional)', '12345')
    enviar()

    expect(
      screen.getByText('Formato inválido. Ejemplo: +56 9 1234 5678 o 912345678.')
    ).toBeInTheDocument()
  })

  it('acepta el teléfono vacío (es opcional)', () => {
    renderRegistro()
    llenarFormularioValido()
    set('TELÉFONO (Opcional)', '')
    enviar()

    expect(screen.queryByText(/Formato inválido/)).not.toBeInTheDocument()
    expect(screen.getByText('PANTALLA-LOGIN')).toBeInTheDocument()
  })

  it('la comuna se reinicia al cambiar de región', () => {
    renderRegistro()
    set('REGIÓN', 'Region Metropolitana')
    set('COMUNA', 'Santiago')
    expect(screen.getByLabelText('COMUNA')).toHaveValue('Santiago')

    set('REGIÓN', 'Region de Valparaiso')
    expect(screen.getByLabelText('COMUNA')).toHaveValue('')
  })
})

describe('Página de Registro - Registro exitoso', () => {
  it('guarda el usuario, muestra confirmación y navega al login', () => {
    renderRegistro()
    llenarFormularioValido()
    enviar()

    expect(window.alert).toHaveBeenCalledWith('Registro exitoso.')
    expect(screen.getByText('PANTALLA-LOGIN')).toBeInTheDocument()

    const usuarios = JSON.parse(localStorage.getItem('users'))
    expect(usuarios).toHaveLength(1)
    expect(usuarios[0]).toMatchObject({
      nombre: 'Benjamin Castro',
      correo: 'benja@correo.com',
      contrasena: 'Password1@',
      telefono: '+56 9 1234 5678',
      region: 'Region Metropolitana',
      comuna: 'Santiago',
    })
  })

  it('acumula varios usuarios registrados en localStorage', () => {
    localStorage.setItem(
      'users',
      JSON.stringify([{ nombre: 'Previo', correo: 'previo@correo.com' }])
    )
    renderRegistro()
    llenarFormularioValido()
    enviar()

    const usuarios = JSON.parse(localStorage.getItem('users'))
    expect(usuarios).toHaveLength(2)
    expect(usuarios[1].correo).toBe('benja@correo.com')
  })

  it('no registra nada si hay errores de validación', () => {
    renderRegistro()
    llenarFormularioValido()
    set('CORREO', 'correo-invalido')
    enviar()

    expect(localStorage.getItem('users')).toBeNull()
    expect(screen.queryByText('PANTALLA-LOGIN')).not.toBeInTheDocument()
  })
})
