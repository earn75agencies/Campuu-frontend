import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product._id);
      if (existingItem) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product._id, quantity: 1, ...product }];
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.productId !== productId);
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setCartItems((prev) => {
      const newCart = prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
