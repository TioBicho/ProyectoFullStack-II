import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from '../Context/CartContext'
import { PRODUCTOS } from '../Data/Productos'
import FormProducto from './FormProducto'

const renderForm = (ruta = '/admin/crear') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <CartProvider>
        <Routes>
          <Route path="/admin" element={<div>PANEL-ADMIN</div>} />
          <Route path="/admin/crear" element={<FormProducto />} />
          <Route path="/admin/editar/:id" element={<FormProducto />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  )

const set = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const enviar = () =>
  fireEvent.submit(
    screen.getByRole('button', { name: /Crear Producto|Guardar Cambios/ }).closest('form')
  )

const llenarFormularioValido = () => {
  set('CÓDIGO / ID PRODUCTO', '  xx001 ')
  set('NOMBRE DEL PRODUCTO', '  Teclado Mecánico  ')
  set('CATEGORÍA', 'Accesorios')
  set('PRECIO (CLP)', '39990')
  set('RUTA O URL DE IMAGEN', '  /imagenes/teclado.jpg  ')
}

describe('FormProducto - Modo creación', () => {
  it('muestra el título de creación y el formulario vacío', () => {
    renderForm()

    expect(screen.getByText('Crear Nuevo Producto')).toBeInTheDocument()
    expect(screen.getByLabelText('CÓDIGO / ID PRODUCTO')).not.toBeDisabled()
    expect(screen.getByLabelText('CÓDIGO / ID PRODUCTO')).toHaveValue('')
  })

  it('muestra todos los errores al enviar el formulario vacío', () => {
    renderForm()
    enviar()

    expect(
      screen.getByText('El ID es obligatorio (ej: JM003, AC005).')
    ).toBeInTheDocument()
    expect(screen.getByText('El nombre del producto es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Seleccione una categoría.')).toBeInTheDocument()
    expect(screen.getByText('Ingrese un precio numérico mayor a 0.')).toBeInTheDocument()
    expect(
      screen.getByText('La ruta o URL de la imagen es obligatoria.')
    ).toBeInTheDocument()
  })

  it('rechaza un id que ya existe en el catálogo (sin importar mayúsculas)', () => {
    renderForm()
    llenarFormularioValido()
    set('CÓDIGO / ID PRODUCTO', 'jm001')
    enviar()

    expect(screen.getByText('Este ID ya existe en el catálogo.')).toBeInTheDocument()
    // No navegó al panel: el producto no se creó
    expect(screen.queryByText('PANEL-ADMIN')).not.toBeInTheDocument()
  })

  it('rechaza un precio negativo', () => {
    renderForm()
    llenarFormularioValido()
    set('PRECIO (CLP)', '-500')
    enviar()

    expect(screen.getByText('Ingrese un precio numérico mayor a 0.')).toBeInTheDocument()
  })

  it('rechaza un precio en cero', () => {
    renderForm()
    llenarFormularioValido()
    set('PRECIO (CLP)', '0')
    enviar()

    expect(screen.getByText('Ingrese un precio numérico mayor a 0.')).toBeInTheDocument()
  })

  it('crea el producto con los datos saneados y navega al panel', () => {
    renderForm()
    llenarFormularioValido()
    enviar()

    expect(window.alert).toHaveBeenCalledWith('Producto creado con éxito.')
    expect(screen.getByText('PANEL-ADMIN')).toBeInTheDocument()

    const guardados = JSON.parse(localStorage.getItem('products_data'))
    const nuevo = guardados.find((p) => p.id === 'XX001')
    expect(nuevo).toMatchObject({
      id: 'XX001', // sin espacios y en mayúsculas
      nombre: 'Teclado Mecánico', // sin espacios extra
      categoria: 'Accesorios',
      precio: 39990, // convertido a número
      img: '/imagenes/teclado.jpg',
    })
  })
})

describe('FormProducto - Modo edición', () => {
  it('carga los datos del producto a editar y bloquea el id', () => {
    renderForm('/admin/editar/JM001')

    expect(screen.getByText('Editar Producto')).toBeInTheDocument()
    expect(screen.getByLabelText('CÓDIGO / ID PRODUCTO')).toHaveValue('JM001')
    expect(screen.getByLabelText('CÓDIGO / ID PRODUCTO')).toBeDisabled()
    expect(screen.getByLabelText('NOMBRE DEL PRODUCTO')).toHaveValue('Catan')
    expect(screen.getByLabelText('CATEGORÍA')).toHaveValue('Juegos de Mesa')
    expect(screen.getByLabelText('PRECIO (CLP)').value).toBe('29990')
    expect(screen.getByLabelText('RUTA O URL DE IMAGEN')).toHaveValue(
      PRODUCTOS[0].img
    )
  })

  it('permite reutilizar un id existente al editar otro producto', () => {
    renderForm('/admin/editar/JM001')
    // El id propio no debe marcarse como duplicado
    enviar()

    expect(screen.queryByText('Este ID ya existe en el catálogo.')).not.toBeInTheDocument()
  })

  it('actualiza el producto y navega al panel', () => {
    renderForm('/admin/editar/JM001')
    set('NOMBRE DEL PRODUCTO', 'Catan Deluxe')
    set('PRECIO (CLP)', '32990')
    enviar()

    expect(window.alert).toHaveBeenCalledWith('Producto actualizado con éxito.')
    expect(screen.getByText('PANEL-ADMIN')).toBeInTheDocument()

    const guardados = JSON.parse(localStorage.getItem('products_data'))
    const editado = guardados.find((p) => p.id === 'JM001')
    expect(editado.nombre).toBe('Catan Deluxe')
    expect(editado.precio).toBe(32990)
    // El resto de los campos se conservan
    expect(editado.categoria).toBe('Juegos de Mesa')
    expect(editado.img).toBe(PRODUCTOS[0].img)
    // No se crearon productos nuevos
    expect(guardados).toHaveLength(PRODUCTOS.length)
  })

  it('redirige al panel si el producto a editar no existe', () => {
    renderForm('/admin/editar/NOEXISTE')

    expect(window.alert).toHaveBeenCalledWith('Producto no encontrado')
    expect(screen.getByText('PANEL-ADMIN')).toBeInTheDocument()
  })
})

describe('FormProducto - Panel de navegación', () => {
  it('al cancelar vuelve al panel de administración', () => {
    renderForm()
    fireEvent.click(screen.getByRole('link', { name: 'Cancelar' }))

    expect(screen.getByText('PANEL-ADMIN')).toBeInTheDocument()
  })
})
