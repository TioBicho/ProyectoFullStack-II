import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../Context/CartContext'
import AdminProductos from './AdminProductos'

const renderAdmin = () =>
  render(
    <CartProvider>
      <MemoryRouter>
        <AdminProductos />
      </MemoryRouter>
    </CartProvider>
  )

const buscar = (texto) =>
  fireEvent.change(screen.getByPlaceholderText(/Buscar por ID, nombre o categoría/), {
    target: { value: texto },
  })

const filasDeProductos = () => {
  // Excluye la fila de encabezado (thead)
  const filas = screen.getAllByRole('row')
  return filas.slice(1)
}

describe('AdminProductos - Listado', () => {
  it('muestra la tabla con todos los productos del catálogo', () => {
    renderAdmin()

    // Encabezado + 9 productos
    expect(screen.getAllByRole('row')).toHaveLength(10)
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('PlayStation 5')).toBeInTheDocument()
  })

  it('muestra un mensaje cuando no hay coincidencias', () => {
    renderAdmin()
    buscar('zzzzzz')

    expect(
      screen.getByText('No se encontraron productos registrados.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
  })
})

describe('AdminProductos - Búsqueda', () => {
  it('filtra por nombre', () => {
    renderAdmin()
    buscar('catan')

    const filas = filasDeProductos()
    expect(filas).toHaveLength(1)
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.queryByText('Carcassonne')).not.toBeInTheDocument()
  })

  it('filtra por nombre sin importar mayúsculas', () => {
    renderAdmin()
    buscar('CATAN')

    expect(filasDeProductos()).toHaveLength(1)
    expect(screen.getByText('Catan')).toBeInTheDocument()
  })

  it('filtra por categoría', () => {
    renderAdmin()
    buscar('Juegos de Mesa')

    expect(filasDeProductos()).toHaveLength(2)
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(screen.getByText('Carcassonne')).toBeInTheDocument()
  })

  it('filtra por id', () => {
    renderAdmin()
    buscar('AC001')

    expect(filasDeProductos()).toHaveLength(1)
    expect(screen.getByText('Controlador Inalámbrico Xbox Series X')).toBeInTheDocument()
  })
})

describe('AdminProductos - Eliminación', () => {
  it('elimina el producto cuando el usuario confirma', () => {
    window.confirm = vi.fn(() => true)
    renderAdmin()

    fireEvent.click(screen.getAllByRole('button', { name: /Eliminar/ })[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.queryByText('Catan')).not.toBeInTheDocument()
    expect(filasDeProductos()).toHaveLength(8)

    const guardados = JSON.parse(localStorage.getItem('products_data'))
    expect(guardados.some((p) => p.id === 'JM001')).toBe(false)
  })

  it('NO elimina el producto cuando el usuario cancela', () => {
    window.confirm = vi.fn(() => false)
    renderAdmin()

    fireEvent.click(screen.getAllByRole('button', { name: /Eliminar/ })[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByText('Catan')).toBeInTheDocument()
    expect(filasDeProductos()).toHaveLength(9)
  })
})
