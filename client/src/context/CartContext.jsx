import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItem, setCartItem] = useState(() => {
        // Load initial state from local storage
        const savedCart = localStorage.getItem('farmstay_cart');
        return savedCart ? JSON.parse(savedCart) : null;
    });

    useEffect(() => {
        // Save to local storage whenever cart changes
        if (cartItem) {
            localStorage.setItem('farmstay_cart', JSON.stringify(cartItem));
        } else {
            localStorage.removeItem('farmstay_cart');
        }
    }, [cartItem]);

    const addToCart = (bookingDetails) => {
        setCartItem(bookingDetails);
    };

    const removeFromCart = () => {
        setCartItem(null);
    };

    const clearCart = () => {
        setCartItem(null);
    };

    return (
        <CartContext.Provider value={{ cartItem, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
