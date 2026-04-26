import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Calendar, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Cart = () => {
    const { cartItem, removeFromCart } = useCart();
    const navigate = useNavigate();

    if (!cartItem) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Calendar size={40} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">You haven't selected any dates for your stay yet.</p>
                <button 
                    onClick={() => navigate('/farms')}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg active:scale-95"
                >
                    Explore Properties
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-primary mb-8 transition-colors"
            >
                <ChevronLeft size={20} className="mr-1" />
                Back to Property
            </button>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Review Booking Details</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Cart Details */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8"
                    >
                        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
                            <img 
                                src={cartItem.property.images[0]} 
                                alt={cartItem.property.title} 
                                className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
                            />
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{cartItem.property.title}</h2>
                                <div className="flex items-center text-gray-500 text-sm md:text-base">
                                    <MapPin size={16} className="mr-1" />
                                    {cartItem.property.location}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Check-in</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {new Date(cartItem.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Check-out</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {new Date(cartItem.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <Users size={24} className="text-primary" />
                            <div>
                                <p className="font-bold text-gray-900">{cartItem.guests} Guests</p>
                                <p className="text-sm text-gray-600">Guest Name: {cartItem.guestDetails.name}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Price Breakdown */}
                <div className="lg:col-span-1">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 lg:sticky lg:top-24"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Price Details</h3>
                        
                        <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="flex justify-between text-gray-600">
                                <span>₹{cartItem.pricing.basePrice} x {cartItem.pricing.nights} nights</span>
                                <span>₹{cartItem.pricing.totalPrice}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Taxes & Fees (18% GST)</span>
                                <span>₹{cartItem.pricing.tax}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <span className="text-lg font-bold text-gray-900">Total (INR)</span>
                            <span className="text-2xl font-bold text-primary">₹{cartItem.pricing.grandTotal}</span>
                        </div>

                        <button 
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout
                        </button>

                        <button 
                            onClick={() => {
                                removeFromCart();
                                navigate(-1);
                            }}
                            className="w-full mt-4 py-3 text-gray-500 font-medium hover:text-red-500 transition-colors"
                        >
                            Cancel Booking
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
// Vite re-bundle trigger
