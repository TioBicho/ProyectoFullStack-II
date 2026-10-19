import { createContext, useState, useContext, useEffect } from 'react';
import { PRODUCTOS as PRODUCTOS_INICIALES } from '../Data/Productos';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [productos, setProductos] = useState(() => {
    try {
      const guardados = localStorage.getItem('products_data');
      return guardados ? JSON.parse(guardados) : PRODUCTOS_INICIALES;
    } catch {
      return PRODUCTOS_INICIALES;
    }
  });

  // Guardar en localStorage cada vez que la lista de productos cambie
  useEffect(() => {
    localStorage.setItem('products_data', JSON.stringify(productos));
  }, [productos]);

  // Estado del carrito
  const [carrito, setCarrito] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart_items')) || [];
    } catch {
      return [];
    }
  });

  // Guarda en el localStorage cada vez que el carrito cambia
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(carrito));
  }, [carrito]);

  // --- NUEVAS FUNCIONES CRUD ---
  const crearProducto = (nuevoProd) => {
    setProductos((prev) => [...prev, nuevoProd]);
  };

  const actualizarProducto = (id, prodEditado) => {
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prodEditado } : p))
    );
  };

  const eliminarProducto = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
      // También lo quitamos del carrito si el usuario lo tenía agregado
      setCarrito((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Función para agregar un producto al carrito 
  const agregarAlCarrito = (producto) => {
    const productoExistente = productos.find((p) => p.id === producto.id);
    if (!productoExistente) {
      alert('Producto no encontrado');
      return;
    }

    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...productoExistente, cantidad: 1 }];
    });

    alert(`"${productoExistente.nombre}" agregado al carrito.`);
  };

  // Función para cambiar cantidad
  const cambiarCantidad = (id, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + delta } : item))
        .filter((item) => item.cantidad > 0)
    );
  };

  // Vaciar carrito 
  const vaciarCarrito = () => setCarrito([]);

  const totalCartCount = carrito.reduce((acc, item) => acc + (item.cantidad || 0), 0);

  return (
    <CartContext.Provider
      value={{
        // Exponemos el catálogo y funciones CRUD
        productos,
        crearProducto,
        actualizarProducto,
        eliminarProducto,
        // Exponemos tu carrito y sus funciones originales
        carrito,
        agregarAlCarrito,
        cambiarCantidad,
        vaciarCarrito,
        totalCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);