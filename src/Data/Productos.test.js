import { describe, it, expect } from 'vitest'
import process from 'node:process'
import { PRODUCTOS } from './Productos'

describe('Datos del catálogo (src/Data/Productos.js)', () => {
  it('contiene productos', () => {
    expect(PRODUCTOS.length).toBeGreaterThan(0)
  })

  it('cada producto tiene los campos obligatorios con tipos correctos', () => {
    PRODUCTOS.forEach((prod) => {
      expect(prod).toMatchObject({
        id: expect.any(String),
        nombre: expect.any(String),
        categoria: expect.any(String),
        precio: expect.any(Number),
        img: expect.any(String),
      })
      expect(prod.precio).toBeGreaterThan(0)
      expect(prod.id.trim()).not.toBe('')
      expect(prod.nombre.trim()).not.toBe('')
      expect(prod.categoria.trim()).not.toBe('')
      expect(prod.img).toMatch(/^\/.+/)
    })
  })

  it('los id son únicos (sin duplicados)', () => {
    const ids = PRODUCTOS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('incluye el producto Catan con su precio esperado', () => {
    const catan = PRODUCTOS.find((p) => p.id === 'JM001')
    expect(catan).toBeDefined()
    expect(catan).toMatchObject({
      nombre: 'Catan',
      categoria: 'Juegos de Mesa',
      precio: 29990,
      img: '/imagenes/catan.jpg',
    })
  })

  it('las imágenes apuntan a archivos existentes en /public/imagenes', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const dirPublic = path.resolve(process.cwd(), 'public')

    PRODUCTOS.forEach((prod) => {
      const rutaAbsoluta = path.join(dirPublic, prod.img)
      expect(
        fs.existsSync(rutaAbsoluta),
        `No existe el archivo para "${prod.id}": ${prod.img}`
      ).toBe(true)
    })
  })
})
