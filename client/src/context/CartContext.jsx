import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const slimProperty = (property = {}) => ({
    _id: property._id,
    title: property.title,
    location: property.location,
    price: property.price,
    capacity: property.capacity,
    images: property.images?.length ? [property.images[0]] : []
});

const slimCartItem = (bookingDetails) => ({
    ...bookingDetails,
    property: slimProperty(bookingDetails.property)
});

export const CartProvider = ({ children }) => {
    const [cartItem, setCartItem] = useState(() => {
        // Load initial state from local storage
        const savedCart = localStorage.getItem('farmstay_cart');
        if (!savedCart) return null;
        try {
            return slimCartItem(JSON.parse(savedCart));
        } catch (error) {
            localStorage.removeItem('farmstay_cart');
            return null;
        }
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
        setCartItem(slimCartItem(bookingDetails));
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
