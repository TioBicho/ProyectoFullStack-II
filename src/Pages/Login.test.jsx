import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Login from './Login'

const USUARIO = {
  nombre: 'Benjamin Castro',
  correo: 'benja@correo.com',
  contrasena: 'Password1@',
  telefono: '912345678',
  region: 'Region Metropolitana',
  comuna: 'Santiago',
}

const renderLogin = (setCurrentUser = vi.fn()) => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/" element={<div>PANTALLA-HOME</div>} />
      </Routes>
    </MemoryRouter>
  )
  return setCurrentUser
}

const set = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const enviar = () =>
  fireEvent.submit(screen.getByRole('button', { name: 'Iniciar sesión' }).closest('form'))

describe('Página de Login - Validaciones', () => {
  it('muestra errores si el correo y la contraseña están vacíos', () => {
    renderLogin()
    enviar()

    expect(screen.getByText('El correo es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('La contraseña es obligatoria.')).toBeInTheDocument()
  })

  it('rechaza un correo con formato inválido', () => {
    renderLogin()
    set('CORREO', 'esto-no-es-un-mail')
    set('CONTRASEÑA', 'Password1@')
    enviar()

    expect(screen.getByText('El correo no es válido.')).toBeInTheDocument()
  })

  it('rechaza un correo que no está registrado', () => {
    localStorage.setItem('users', JSON.stringify([USUARIO]))
    renderLogin()
    set('CORREO', 'otra-cuenta@correo.com')
    set('CONTRASEÑA', 'Password1@')
    enviar()

    expect(screen.getByText('El correo no está registrado.')).toBeInTheDocument()
  })

  it('rechaza una contraseña incorrecta', () => {
    localStorage.setItem('users', JSON.stringify([USUARIO]))
    renderLogin()
    set('CORREO', USUARIO.correo)
    set('CONTRASEÑA', 'contrasena-equivocada')
    enviar()

    expect(screen.getByText('La contraseña es incorrecta.')).toBeInTheDocument()
    expect(localStorage.getItem('currentUser')).toBeNull()
  })
})

describe('Página de Login - Autenticación exitosa', () => {
  it('guarda el usuario, notifica y navega al inicio', () => {
    localStorage.setItem('users', JSON.stringify([USUARIO]))
    const setCurrentUser = renderLogin()
    set('CORREO', USUARIO.correo)
    set('CONTRASEÑA', USUARIO.contrasena)
    enviar()

    const guardado = JSON.parse(localStorage.getItem('currentUser'))
    expect(guardado).toMatchObject({ correo: USUARIO.correo })

    expect(setCurrentUser).toHaveBeenCalledWith(
      expect.objectContaining({ correo: USUARIO.correo })
    )
    expect(window.alert).toHaveBeenCalledWith(
      '¡Bienvenido, Benjamin Castro! Has iniciado sesión correctamente.'
    )
    expect(screen.getByText('PANTALLA-HOME')).toBeInTheDocument()
  })

  it('compara el correo sin importar mayúsculas', () => {
    localStorage.setItem('users', JSON.stringify([USUARIO]))
    renderLogin()
    set('CORREO', '  BENJA@correo.com  ')
    set('CONTRASEÑA', USUARIO.contrasena)
    enviar()

    expect(screen.getByText('PANTALLA-HOME')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('currentUser')).correo).toBe(USUARIO.correo)
  })
})
