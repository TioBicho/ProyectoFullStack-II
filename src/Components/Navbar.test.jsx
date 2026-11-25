import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../Context/CartContext'
import { PRODUCTOS } from '../Data/Productos'
import Navbar from './Navbar'

const renderNavbar = (props = {}) => {
  const onLogout = props.onLogout ?? vi.fn()
  render(
    <CartProvider>
      <MemoryRouter>
        <Navbar currentUser={null} {...props} onLogout={onLogout} />
      </MemoryRouter>
    </CartProvider>
  )
  return onLogout
}

describe('Navbar - Sesión', () => {
  it('muestra "Iniciar sesión" cuando no hay usuario', () => {
    renderNavbar()

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cerrar sesión/ })).not.toBeInTheDocument()
  })

  it('muestra el botón de perfil con el primer nombre del usuario cuando está logueado', () => {
    renderNavbar({ currentUser: { nombre: 'Benjamin Castro' } })

    expect(
      screen.getByRole('button', { name: /Benjamin/i })
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument()
  })

  it('usa "Usuario" si el usuario no tiene nombre', () => {
    renderNavbar({ currentUser: {} })

    expect(
      screen.getByRole('button', { name: /Usuario/i })
    ).toBeInTheDocument()
  })

  it('al pulsar el botón de perfil abre el menú con Perfil, Admin y Cerrar sesión, y ejecuta onLogout', () => {
    const onLogout = renderNavbar({
      currentUser: { nombre: 'Ana Pérez' },
      onLogout: vi.fn(),
    })

    const userBtn = screen.getByRole('button', { name: /Ana/i })
    fireEvent.click(userBtn)

    expect(screen.getByRole('menuitem', { name: /Perfil/i })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Admin/i })).toBeInTheDocument()
    const logoutBtn = screen.getByRole('menuitem', { name: /Cerrar sesión/i })
    expect(logoutBtn).toBeInTheDocument()

    fireEvent.click(logoutBtn)
    expect(onLogout).toHaveBeenCalledTimes(1)
  })
})

describe('Navbar - Contenido general y compacto', () => {
  it('muestra los enlaces principales (Inicio, Productos, Carrito)', () => {
    renderNavbar()

    expect(screen.getByRole('link', { name: /Inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Productos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Carrito/i })).toBeInTheDocument()
  })

  it('muestra la cantidad de productos del carrito sin paréntesis', () => {
    localStorage.setItem(
      'cart_items',
      JSON.stringify([
        { ...PRODUCTOS[0], cantidad: 2 },
        { ...PRODUCTOS[1], cantidad: 1 },
      ])
    )
    renderNavbar()

    const cartCount = document.getElementById('cart-count')
    expect(cartCount).toHaveTextContent('3')
    expect(cartCount.textContent).not.toContain('(')
    expect(cartCount.textContent).not.toContain(')')
  })

  it('muestra 0 en el contador cuando el carrito está vacío', () => {
    renderNavbar()

    expect(document.getElementById('cart-count')).toHaveTextContent('0')
  })

  it('al pulsar el botón del carrito abre un menú desplegable con productos y botón para ir al carrito', () => {
    localStorage.setItem(
      'cart_items',
      JSON.stringify([{ ...PRODUCTOS[0], cantidad: 2 }])
    )
    renderNavbar()

    const cartBtn = screen.getByRole('button', { name: /Carrito/i })
    fireEvent.click(cartBtn)

    expect(screen.getByText(PRODUCTOS[0].nombre)).toBeInTheDocument()
    expect(screen.getByText(/2 x/)).toBeInTheDocument()

    const linkCarrito = screen.getByRole('link', { name: /Ir a la página del carrito/i })
    expect(linkCarrito).toBeInTheDocument()
    expect(linkCarrito).toHaveAttribute('href', '/carrito')
  })

  it('muestra mensaje de carrito vacío en el desplegable cuando no hay artículos', () => {
    renderNavbar()

    const cartBtn = screen.getByRole('button', { name: /Carrito/i })
    fireEvent.click(cartBtn)

    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument()
  })

  it('renderiza la barra de búsqueda y permite buscar productos', () => {
    renderNavbar()

    const searchInput = screen.getByRole('searchbox', { name: /Buscar productos/i })
    expect(searchInput).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'teclado' } })
    expect(searchInput).toHaveValue('teclado')

    const clearButton = screen.getByRole('button', { name: /Limpiar búsqueda/i })
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)
    expect(searchInput).toHaveValue('')
  })

  it('permite alternar entre modo claro y modo oscuro', () => {
    localStorage.setItem('theme', 'dark')
    renderNavbar()

    const themeBtn = screen.getByRole('button', { name: /Cambiar a modo claro/i })
    expect(themeBtn).toBeInTheDocument()

    fireEvent.click(themeBtn)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    const themeBtnLight = screen.getByRole('button', { name: /Cambiar a modo oscuro/i })
    expect(themeBtnLight).toBeInTheDocument()

    fireEvent.click(themeBtnLight)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
