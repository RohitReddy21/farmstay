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
    cartId: bookingDetails.cartId || `${bookingDetails.propertyId || bookingDetails.property?._id}-${bookingDetails.startDate}-${bookingDetails.endDate}-${Date.now()}`,
    property: slimProperty(bookingDetails.property)
});

const normalizeCart = (savedCart) => {
    if (!savedCart) return [];
    const parsed = JSON.parse(savedCart);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items.filter(Boolean).map(slimCartItem);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load initial state from local storage
        const savedCart = localStorage.getItem('farmstay_cart');
        if (!savedCart) return [];
        try {
            return normalizeCart(savedCart);
        } catch (error) {
            localStorage.removeItem('farmstay_cart');
            return [];
        }
    });

    useEffect(() => {
        // Save to local storage whenever cart changes
        if (cartItems.length) {
            localStorage.setItem('farmstay_cart', JSON.stringify(cartItems));
        } else {
            localStorage.removeItem('farmstay_cart');
        }
    }, [cartItems]);

    const addToCart = (bookingDetails) => {
        setCartItems((current) => [...current, slimCartItem(bookingDetails)]);
    };

    const removeFromCart = (cartId) => {
        if (!cartId) {
            setCartItems([]);
            return;
        }
        setCartItems((current) => current.filter((item) => item.cartId !== cartId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartItem = cartItems[0] || null;
    const cartCount = cartItems.length;

    return (
        <CartContext.Provider value={{ cartItem, cartItems, cartCount, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
