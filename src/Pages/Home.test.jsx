import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../Context/CartContext'
import { PRODUCTOS } from '../Data/Productos'
import Home from './Home'

const renderHome = () =>
  render(
    <CartProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </CartProvider>
  )

describe('Página Home', () => {
  it('renderiza el encabezado principal', () => {
    renderHome()

    expect(
      screen.getByRole('heading', { name: 'TIENDA ONLINE GAMER' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Catálogo Destacado' })
    ).toBeInTheDocument()
  })

  it('muestra todos los productos del catálogo con su precio', () => {
    renderHome()

    const articulos = screen.getAllByRole('article')
    expect(articulos).toHaveLength(PRODUCTOS.length)

    PRODUCTOS.forEach((prod, i) => {
      expect(
        screen.getByRole('heading', { name: prod.nombre })
      ).toBeInTheDocument()
      expect(
        within(articulos[i]).getByText(`$${prod.precio.toLocaleString('es-CL')} CLP`)
      ).toBeInTheDocument()
    })
  })

  it('agrega un producto al carrito desde el catálogo', () => {
    renderHome()

    const botonesAgregar = screen.getAllByRole('button', { name: /Agregar/ })
    fireEvent.click(botonesAgregar[0]) // Catan (primer producto)

    expect(window.alert).toHaveBeenCalledWith('"Catan" agregado al carrito.')

    const carrito = JSON.parse(localStorage.getItem('cart_items'))
    expect(carrito).toHaveLength(1)
    expect(carrito[0]).toMatchObject({ id: PRODUCTOS[0].id, cantidad: 1 })
  })

  it('al agregar dos veces el mismo producto queda con cantidad 2', () => {
    renderHome()

    const botonesAgregar = screen.getAllByRole('button', { name: /Agregar/ })
    fireEvent.click(botonesAgregar[0])
    fireEvent.click(botonesAgregar[0])

    const carrito = JSON.parse(localStorage.getItem('cart_items'))
    expect(carrito).toHaveLength(1)
    expect(carrito[0].cantidad).toBe(2)
  })

  it('suscribe el correo del newsletter y lo confirma', () => {
    renderHome()

    const input = document.getElementById('newsletterEmail')
    fireEvent.change(input, { target: { value: 'gamer@correo.com' } })
    fireEvent.submit(input.closest('form'))

    expect(window.alert).toHaveBeenCalledWith('¡Gracias por suscribirte!')
    expect(input).toHaveValue('')
  })
})
