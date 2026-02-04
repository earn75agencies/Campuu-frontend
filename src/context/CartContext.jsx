import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  const [syncedWithServer, setSyncedWithServer] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  }, []);

  // Sync cart with server when user logs in
  useEffect(() => {
    if (isAuthenticated && !syncedWithServer && cartItems.length > 0) {
      syncCartWithServer();
    } else if (isAuthenticated && syncedWithServer) {
      // Load cart from server on login if no local cart
      loadCartFromServer();
    }
    // Reset sync flag when user logs out
    if (!isAuthenticated) {
      setSyncedWithServer(false);
    }
  }, [isAuthenticated]);

  const loadCartFromServer = async () => {
    try {
      const response = await api.get('/cart');
      const serverCart = response.data.cart || [];
      if (serverCart.length > 0) {
        setCartItems(serverCart);
        localStorage.setItem('cartItems', JSON.stringify(serverCart));
      }
    } catch (error) {
      console.error('Error loading cart from server:', error);
    }
  };

  const syncCartWithServer = async () => {
    if (!isAuthenticated || cartItems.length === 0) return;

    try {
      // Merge local cart with server cart
      const response = await api.post('/cart/merge', { localCart: cartItems });
      const mergedCart = response.data.cart || [];

      setCartItems(mergedCart);
      localStorage.setItem('cartItems', JSON.stringify(mergedCart));
      setSyncedWithServer(true);
    } catch (error) {
      console.error('Error syncing cart with server:', error);
    }
  };

  const saveCartToServer = async () => {
    if (!isAuthenticated) return;

    try {
      await api.post('/cart/save', { cart: cartItems });
    } catch (error) {
      console.error('Error saving cart to server:', error);
    }
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.productId === product._id);
      let newCart;
      if (existingItem) {
        newCart = prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prev, { productId: product._id, quantity: 1, ...product }];
      }

      // Save to localStorage and server
      if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(newCart));
      }
      saveCartToServer();
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.productId !== productId);
      localStorage.setItem('cartItems', JSON.stringify(newCart));
      saveCartToServer();
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
      saveCartToServer();
      return newCart;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');

    // Clear from server if authenticated
    if (isAuthenticated) {
      try {
        await api.delete('/cart');
      } catch (error) {
        console.error('Error clearing server cart:', error);
      }
    }
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
    cartCount,
    syncedWithServer
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
