import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage
    const savedCart = localStorage.getItem('milesCart');
    return savedCart ? JSON.parse(savedCart) : { storeSlug: null, items: [] };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('milesCart', JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, storeSlug) => {
    setCart((prevCart) => {
      // If switching to a different store, clear cart
      if (prevCart.storeSlug && prevCart.storeSlug !== storeSlug) {
        return {
          storeSlug,
          items: [{
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            stock: product.stock_quantity,
          }],
        };
      }

      // Check if product already in cart
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.productId === product.id
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevCart.items];
        const newQuantity = updatedItems[existingItemIndex].quantity + 1;

        // Check stock availability
        if (newQuantity > product.stock_quantity) {
          alert(`Sorry, only ${product.stock_quantity} items available in stock`);
          return prevCart;
        }

        updatedItems[existingItemIndex].quantity = newQuantity;
        return { ...prevCart, items: updatedItems };
      }

      // Add new item
      return {
        storeSlug,
        items: [
          ...prevCart.items,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
            stock: product.stock_quantity,
          },
        ],
      };
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => ({
      ...prevCart,
      items: prevCart.items.filter((item) => item.productId !== productId),
    }));
  };

  // Update item quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) => {
        if (item.productId === productId) {
          // Check stock availability
          if (newQuantity > item.stock) {
            alert(`Sorry, only ${item.stock} items available in stock`);
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      return { ...prevCart, items: updatedItems };
    });
  };

  // Clear entire cart
  const clearCart = () => {
    setCart({ storeSlug: null, items: [] });
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  // Get cart item count
  const getCartItemCount = () => {
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.items.some((item) => item.productId === productId);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
