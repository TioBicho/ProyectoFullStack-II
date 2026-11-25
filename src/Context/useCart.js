import { createContext, useContext } from 'react';

// Contexto compartido del catálogo y el carrito
export const CartContext = createContext();

// Hook para consumir el contexto desde cualquier componente
export const useCart = () => useContext(CartContext);
