import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../Context/CartContext'
import { PRODUCTOS } from '../Data/Productos'
import Carrito from './Carrito'

const renderCarrito = (items = []) => {
  localStorage.setItem('cart_items', JSON.stringify(items))
  return render(
    <CartProvider>
      <MemoryRouter>
        <Carrito />
      </MemoryRouter>
    </CartProvider>
  )
}

const catan = (cantidad) => ({ ...PRODUCTOS[0], cantidad })
const mando = (cantidad) => ({ ...PRODUCTOS[2], cantidad })

// Ej: "$29.990" (como se muestra en el precio unitario y subtotal por ítem)
const monto = (n) => `$${n.toLocaleString('es-CL')}`
// Ej: "$29.990 CLP" (como se muestra en subtotal y total de la reserva)
const montoClp = (n) => `${monto(n)} CLP`

const boton = (selector) => document.querySelector(selector).closest('button')

const aplicarCupon = (codigo) => {
  if (codigo !== null) {
    fireEvent.change(screen.getByLabelText('Ingresa el cupón de descuento:'), {
      target: { value: codigo },
    })
  }
  fireEvent.click(screen.getByRole('button', { name: 'APLICAR' }))
}

describe('Carrito - Visualización', () => {
  it('muestra el mensaje de carrito vacío cuando no hay productos', () => {
    renderCarrito()

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(screen.getByText('Resumen')).toBeInTheDocument()
  })

  it('lista los productos del carrito con su subtotal por ítem', () => {
    renderCarrito([catan(2)])

    expect(screen.getByRole('heading', { name: 'Catan' })).toBeInTheDocument()
    const lista = document.getElementById('lista-carrito')
    // Subtotal del ítem: 29.990 x 2
    expect(within(lista).getByText(monto(PRODUCTOS[0].precio * 2))).toBeInTheDocument()
  })

  it('calcula el subtotal general sumando precio x cantidad', () => {
    renderCarrito([catan(2), mando(1)])

    const esperado = PRODUCTOS[0].precio * 2 + PRODUCTOS[2].precio
    expect(document.getElementById('subtotal-monto')).toHaveTextContent(montoClp(esperado))
  })

  it('muestra el total del carrito (igual al subtotal sin cupón)', () => {
    renderCarrito([catan(1)])

    const filaTotal = screen.getByText('TOTAL:').parentElement
    expect(
      within(filaTotal).getByText(montoClp(PRODUCTOS[0].precio))
    ).toBeInTheDocument()
  })
})

describe('Carrito - Controles de cantidad', () => {
  it('el botón "+" incrementa la cantidad y el subtotal del ítem', () => {
    renderCarrito([catan(1)])

    fireEvent.click(boton('.bi-plus'))

    const lista = document.getElementById('lista-carrito')
    expect(within(lista).getByText('2')).toBeInTheDocument()
    expect(within(lista).getByText(monto(PRODUCTOS[0].precio * 2))).toBeInTheDocument()
  })

  it('el botón "-" decrementa la cantidad', () => {
    renderCarrito([catan(2)])

    fireEvent.click(boton('.bi-dash'))

    const lista = document.getElementById('lista-carrito')
    expect(within(lista).getByText('1')).toBeInTheDocument()
    expect(within(lista).getByText(monto(PRODUCTOS[0].precio))).toBeInTheDocument()
  })

  it('el botón "-" elimina el producto cuando la cantidad llega a 0', () => {
    renderCarrito([catan(1)])

    fireEvent.click(boton('.bi-dash'))

    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('cart_items'))).toHaveLength(0)
  })
})

describe('Carrito - Cupón de descuento', () => {
  it('muestra error si el cupón está vacío', () => {
    renderCarrito([catan(1)])
    aplicarCupon(null)

    expect(screen.getByText('Ingrese un código de cupón.')).toBeInTheDocument()
    expect(screen.queryByText(/Cupón aplicado/)).not.toBeInTheDocument()
  })

  it('muestra error si el cupón es inválido', () => {
    renderCarrito([catan(1)])
    aplicarCupon('PROMO10')

    expect(screen.getByText('Cupón inválido. Intente nuevamente.')).toBeInTheDocument()
    expect(screen.queryByText(/Cupón aplicado/)).not.toBeInTheDocument()
  })

  it('aplica el cupón DUOC20 con 20% de descuento (ignora mayúsculas y espacios)', () => {
    renderCarrito([catan(1)])
    aplicarCupon('  duoc20  ')

    expect(
      screen.getByText('¡Cupón aplicado! 20% de descuento.')
    ).toBeInTheDocument()

    const subtotal = PRODUCTOS[0].precio
    const montoDescuento = Math.round(subtotal * 0.2)
    const total = Math.round(subtotal - subtotal * 0.2)

    expect(
      screen.getByText(`-$${montoDescuento.toLocaleString('es-CL')} CLP`)
    ).toBeInTheDocument()
    expect(screen.getByText(montoClp(total))).toBeInTheDocument()
  })

  it('un cupón inválido anula un descuento aplicado anteriormente', () => {
    renderCarrito([catan(1)])
    aplicarCupon('DUOC20')
    aplicarCupon('OTROCUPON')

    expect(screen.getByText('Cupón inválido. Intente nuevamente.')).toBeInTheDocument()
    expect(screen.queryByText(/Descuento aplicado/)).not.toBeInTheDocument()
  })
})

describe('Carrito - Pago', () => {
  it('no permite pagar con el carrito vacío', () => {
    renderCarrito()

    fireEvent.click(screen.getByRole('button', { name: 'PAGAR' }))

    expect(window.alert).toHaveBeenCalledWith(
      'Error: No puedes realizar el pago porque el carrito no tiene productos.'
    )
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
  })

  it('al pagar vacía el carrito, limpia el cupón y confirma el pago', () => {
    renderCarrito([catan(3)])
    aplicarCupon('DUOC20')

    fireEvent.click(screen.getByRole('button', { name: 'PAGAR' }))

    expect(window.alert).toHaveBeenCalledWith(
      '¡Pago realizado con éxito! Gracias por tu compra en Level-Up Gamer.'
    )
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument()
    expect(localStorage.getItem('cart_items')).toBe('[]')
    expect(screen.queryByText(/Cupón aplicado/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Descuento aplicado/)).not.toBeInTheDocument()
    // El input del cupón queda limpio
    expect(screen.getByLabelText('Ingresa el cupón de descuento:')).toHaveValue('')
  })
})
