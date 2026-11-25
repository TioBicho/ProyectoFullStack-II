import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

const USUARIO = { nombre: 'Benjamin Castro', correo: 'benja@correo.com' }

const renderApp = (ruta = '/') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  )

describe('App - Sesión de usuario', () => {
  it('muestra "Iniciar sesión" cuando no hay usuario guardado', () => {
    renderApp()

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cerrar sesión/ })).not.toBeInTheDocument()
  })

  it('lee el usuario actual desde localStorage y muestra el botón de usuario', () => {
    localStorage.setItem('currentUser', JSON.stringify(USUARIO))
    renderApp()

    expect(
      screen.getByRole('button', { name: /Benjamin/i })
    ).toBeInTheDocument()
  })

  it('no cierra sesión si el usuario cancela la confirmación al pulsar cerrar sesión', () => {
    localStorage.setItem('currentUser', JSON.stringify(USUARIO))
    window.confirm = vi.fn(() => false)
    renderApp()

    // Abre el menú desplegable de usuario
    fireEvent.click(screen.getByRole('button', { name: /Benjamin/i }))

    // Hace clic en "Cerrar sesión" en el menú desplegable
    fireEvent.click(screen.getByRole('menuitem', { name: /Cerrar sesión/i }))

    expect(window.confirm).toHaveBeenCalled()
    expect(localStorage.getItem('currentUser')).not.toBeNull()
    expect(
      screen.getByRole('button', { name: /Benjamin/i })
    ).toBeInTheDocument()
  })
})

describe('App - Rutas', () => {
  it('renderiza la página Home en la ruta raíz', () => {
    renderApp('/')

    expect(
      screen.getByRole('heading', { name: 'TIENDA ONLINE GAMER' })
    ).toBeInTheDocument()
  })

  it('renderiza la página de carrito en /carrito', () => {
    renderApp('/carrito')

    expect(screen.getByText('Mi carrito de compras')).toBeInTheDocument()
  })

  it('renderiza la página de registro en /registro', () => {
    renderApp('/registro')

    expect(screen.getByText('Registro de usuario')).toBeInTheDocument()
  })

  it('renderiza la página de login en /login', () => {
    renderApp('/login')

    expect(screen.getByText('Inicio de sesión')).toBeInTheDocument()
  })

  it('renderiza el panel de administración en /admin', () => {
    renderApp('/admin')

    expect(screen.getByText('Panel de Administración')).toBeInTheDocument()
  })
})
