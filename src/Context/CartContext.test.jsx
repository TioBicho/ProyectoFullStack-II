import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CartProvider } from './CartContext'
import { useCart } from './useCart'
import { PRODUCTOS } from '../Data/Productos'

// Componente sonda que expone el contexto para poder probarlo como unidad
function Probe() {
  const {
    productos,
    carrito,
    totalCartCount,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    agregarAlCarrito,
    cambiarCantidad,
    vaciarCarrito,
  } = useCart()

  return (
    <div>
      <span data-testid="cantidad-productos">{productos.length}</span>
      <span data-testid="total">{totalCartCount}</span>
      <span data-testid="nombres">{productos.map((p) => p.nombre).join('|')}</span>
      <span data-testid="precios">
        {productos.map((p) => `${p.id}:${p.precio}`).join('|')}
      </span>
      <ul>
        {carrito.map((item) => (
          <li key={item.id} data-testid={`item-${item.id}`}>
            {item.cantidad}
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          crearProducto({
            id: 'NEW001',
            nombre: 'Producto Nuevo',
            categoria: 'Mouse',
            precio: 15000,
            img: '/imagenes/nuevo.jpg',
          })
        }
      >
        crear
      </button>
      <button onClick={() => actualizarProducto('JM001', { precio: 34990 })}>
        actualizar
      </button>
      <button onClick={() => eliminarProducto('JM001')}>eliminar</button>
      <button onClick={() => agregarAlCarrito({ id: 'JM001', nombre: 'Catan' })}>
        agregar-catan
      </button>
      <button onClick={() => agregarAlCarrito({ id: 'NO001', nombre: 'Fantasma' })}>
        agregar-fantasma
      </button>
      <button onClick={() => cambiarCantidad('JM001', 1)}>sumar</button>
      <button onClick={() => cambiarCantidad('JM001', -1)}>restar</button>
      <button onClick={vaciarCarrito}>vaciar</button>
    </div>
  )
}

const renderProbe = () =>
  render(
    <CartProvider>
      <Probe />
    </CartProvider>
  )

const click = (texto) => fireEvent.click(screen.getByText(texto))

const seedCarrito = (items) =>
  localStorage.setItem('cart_items', JSON.stringify(items))

describe('CartContext - Estado inicial', () => {
  it('carga el catálogo por defecto cuando no hay datos guardados', () => {
    renderProbe()
    expect(screen.getByTestId('cantidad-productos')).toHaveTextContent(
      String(PRODUCTOS.length)
    )
    expect(screen.getByTestId('nombres')).toHaveTextContent('Catan')
  })

  it('carga los productos guardados en localStorage', () => {
    localStorage.setItem(
      'products_data',
      JSON.stringify([
        { id: 'XX001', nombre: 'Guardado', categoria: 'Mouse', precio: 1000, img: '/x.jpg' },
      ])
    )
    renderProbe()
    expect(screen.getByTestId('cantidad-productos')).toHaveTextContent('1')
    expect(screen.getByTestId('nombres')).toHaveTextContent('Guardado')
  })

  it('usa el catálogo por defecto si el JSON guardado está corrupto', () => {
    localStorage.setItem('products_data', '{esto no es json')
    renderProbe()
    expect(screen.getByTestId('cantidad-productos')).toHaveTextContent(
      String(PRODUCTOS.length)
    )
  })

  it('persiste el catálogo en localStorage', () => {
    renderProbe()
    const guardados = JSON.parse(localStorage.getItem('products_data'))
    expect(guardados).toHaveLength(PRODUCTOS.length)
    expect(guardados.some((p) => p.id === 'JM001')).toBe(true)
  })
})

describe('CartContext - CRUD de productos', () => {
  it('crearProducto agrega el producto al catálogo y lo persiste', () => {
    renderProbe()
    click('crear')

    expect(screen.getByTestId('cantidad-productos')).toHaveTextContent(
      String(PRODUCTOS.length + 1)
    )
    expect(screen.getByTestId('nombres')).toHaveTextContent('Producto Nuevo')

    const guardados = JSON.parse(localStorage.getItem('products_data'))
    expect(guardados.some((p) => p.id === 'NEW001')).toBe(true)
  })

  it('actualizarProducto modifica solo el producto indicado', () => {
    renderProbe()
    click('actualizar')

    expect(screen.getByTestId('precios')).toHaveTextContent('JM001:34990')
    // Los demás productos conservan su precio
    expect(screen.getByTestId('precios')).toHaveTextContent('JM002:24990')
    expect(screen.getByTestId('cantidad-productos')).toHaveTextContent(
      String(PRODUCTOS.length)
    )
  })

  it('eliminarProducto quita el producto del catálogo cuando se confirma', () => {
    window.confirm = vi.fn(() => true)
    renderProbe()
    click('eliminar')

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByTestId('cantidad-productos')).toHaveTextContent(
      String(PRODUCTOS.length - 1)
    )
    expect(screen.getByTestId('nombres')).not.toHaveTextContent('Catan')
  })

  it('eliminarProducto NO hace nada si el usuario cancela', () => {
    window.confirm = vi.fn(() => false)
    renderProbe()
    click('eliminar')

    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByTestId('cantidad-productos')).toHaveTextContent(
      String(PRODUCTOS.length)
    )
    expect(screen.getByTestId('nombres')).toHaveTextContent('Catan')
  })

  it('eliminarProducto también elimina el producto del carrito', () => {
    window.confirm = vi.fn(() => true)
    seedCarrito([{ ...PRODUCTOS[0], cantidad: 2 }])
    renderProbe()

    expect(screen.getByTestId('item-JM001')).toBeInTheDocument()

    click('eliminar')

    expect(screen.queryByTestId('item-JM001')).not.toBeInTheDocument()
    const carritoGuardado = JSON.parse(localStorage.getItem('cart_items'))
    expect(carritoGuardado.some((p) => p.id === 'JM001')).toBe(false)
  })
})

describe('CartContext - Carrito de compras', () => {
  it('agregarAlCarrito agrega un producto nuevo con cantidad 1', () => {
    renderProbe()
    click('agregar-catan')

    expect(screen.getByTestId('item-JM001')).toHaveTextContent('1')
    expect(screen.getByTestId('total')).toHaveTextContent('1')
    expect(window.alert).toHaveBeenCalledWith('"Catan" agregado al carrito.')
  })

  it('agregarAlCarrito incrementa la cantidad si el producto ya está en el carrito', () => {
    renderProbe()
    click('agregar-catan')
    click('agregar-catan')

    expect(screen.getByTestId('item-JM001')).toHaveTextContent('2')
    expect(screen.getByTestId('total')).toHaveTextContent('2')
    // No se duplica la línea en el carrito
    expect(screen.getAllByTestId(/^item-/)).toHaveLength(1)
  })

  it('agregarAlCarrito no agrega productos que no existen en el catálogo', () => {
    renderProbe()
    click('agregar-fantasma')

    expect(screen.queryByTestId('item-NO001')).not.toBeInTheDocument()
    expect(screen.getByTestId('total')).toHaveTextContent('0')
    expect(window.alert).toHaveBeenCalledWith('Producto no encontrado')
  })

  it('agregarAlCarrito persiste el carrito en localStorage', () => {
    renderProbe()
    click('agregar-catan')

    const guardado = JSON.parse(localStorage.getItem('cart_items'))
    expect(guardado).toHaveLength(1)
    expect(guardado[0]).toMatchObject({ id: 'JM001', cantidad: 1 })
  })

  it('cambiarCantidad incrementa y decrementa la cantidad', () => {
    seedCarrito([{ ...PRODUCTOS[0], cantidad: 1 }])
    renderProbe()

    click('sumar')
    expect(screen.getByTestId('item-JM001')).toHaveTextContent('2')

    click('restar')
    expect(screen.getByTestId('item-JM001')).toHaveTextContent('1')
  })

  it('cambiarCantidad elimina el producto cuando la cantidad llega a 0', () => {
    seedCarrito([{ ...PRODUCTOS[0], cantidad: 1 }])
    renderProbe()

    click('restar')

    expect(screen.queryByTestId('item-JM001')).not.toBeInTheDocument()
    expect(screen.getByTestId('total')).toHaveTextContent('0')
  })

  it('vaciarCarrito deja el carrito vacío y lo persiste', () => {
    seedCarrito([
      { ...PRODUCTOS[0], cantidad: 2 },
      { ...PRODUCTOS[1], cantidad: 3 },
    ])
    renderProbe()

    expect(screen.getByTestId('total')).toHaveTextContent('5')

    click('vaciar')

    expect(screen.getByTestId('total')).toHaveTextContent('0')
    expect(localStorage.getItem('cart_items')).toBe('[]')
  })

  it('totalCartCount suma las cantidades de todos los productos', () => {
    seedCarrito([
      { ...PRODUCTOS[0], cantidad: 2 },
      { ...PRODUCTOS[1], cantidad: 3 },
    ])
    renderProbe()

    expect(screen.getByTestId('total')).toHaveTextContent('5')
  })

  it('carga el carrito guardado en localStorage al iniciar', () => {
    seedCarrito([{ ...PRODUCTOS[2], cantidad: 4 }])
    renderProbe()

    expect(screen.getByTestId('item-AC001')).toHaveTextContent('4')
    expect(screen.getByTestId('total')).toHaveTextContent('4')
  })

  it('guarda el carrito asociado al usuario y lo restaura tras cerrar y volver a iniciar sesión', () => {
    const usuario = { id: 10, nombre: 'Gamer Pro', correo: 'gamer@levelup.cl' }
    localStorage.setItem('currentUser', JSON.stringify(usuario))

    renderProbe()
    click('agregar-catan')

    // Se guardó en cart_items y en user_cart_gamer@levelup.cl
    expect(localStorage.getItem('cart_items')).toContain('JM001')
    expect(localStorage.getItem('user_cart_gamer@levelup.cl')).toContain('JM001')

    // Simula logout (se dispara levelup:logout)
    fireEvent(window, new Event('levelup:logout'))
    expect(screen.getByTestId('total')).toHaveTextContent('0')

    // Simula login de nuevo con el mismo usuario
    fireEvent(
      window,
      new CustomEvent('levelup:login', { detail: usuario })
    )

    // El carrito se restauró automáticamente
    expect(screen.getByTestId('item-JM001')).toHaveTextContent('1')
    expect(screen.getByTestId('total')).toHaveTextContent('1')
  })
})
