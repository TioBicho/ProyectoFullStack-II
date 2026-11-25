import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Guardamos las implementaciones originales de jsdom para restaurarlas al final
const alertOriginal = window.alert
const confirmOriginal = window.confirm

beforeEach(() => {
  // Cada teste parte con un almacenamiento limpio
  localStorage.clear()
  // La app usa alert() y confirm() en varios flujos: los simulamos por defecto
  window.alert = vi.fn()
  window.confirm = vi.fn(() => true)
})

afterEach(() => {
  cleanup()
  window.alert = alertOriginal
  window.confirm = confirmOriginal
})
