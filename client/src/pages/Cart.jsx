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
            <div className="flex min-h-[60vh] flex-col items-center justify-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f4ead8]">
                    <Calendar size={40} className="text-[#7a5527]" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-[#211b14]">Your Cart is Empty</h2>
                <p className="mb-8 text-[#645747]">You haven't selected any dates for your stay yet.</p>
                <button
                    onClick={() => navigate('/farms')}
                    className="rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-primary-800 active:scale-95"
                >
                    Explore Properties
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-5xl px-2 py-5 sm:px-4 sm:py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-8 flex items-center text-[#645747] transition-colors hover:text-[#7a5527]"
            >
                <ChevronLeft size={20} className="mr-1" />
                Back to Property
            </button>

            <h1 className="mb-6 text-2xl font-bold text-[#211b14] sm:mb-8 md:text-4xl">Review Booking Details</h1>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
                {/* Left: Cart Details */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-4 shadow-xl sm:p-6 md:p-8"
                    >
                        <div className="mb-6 flex flex-col gap-4 border-b border-[#ead7b8] pb-6 sm:flex-row sm:items-start">
                            <img
                                src={cartItem.property.images?.[0]}
                                alt={cartItem.property.title}
                                className="h-44 w-full rounded-xl object-cover sm:h-28 sm:w-32 md:h-32 md:w-36"
                            />
                            <div className="min-w-0">
                                <h2 className="mb-2 break-words text-xl font-bold leading-tight text-[#211b14] md:text-2xl">{cartItem.property.title}</h2>
                                <div className="flex items-start text-sm text-[#645747] md:text-base">
                                    <MapPin size={16} className="mr-1 mt-0.5 shrink-0" />
                                    <span className="break-words">{cartItem.property.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:mb-8">
                            <div className="rounded-xl border border-[#ead7b8] bg-[#f8efdf] p-4">
                                <p className="mb-2 text-xs font-semibold uppercase text-[#8b7a66]">Check-in</p>
                                <p className="text-lg font-bold text-[#211b14]">
                                    {new Date(cartItem.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#ead7b8] bg-[#f8efdf] p-4">
                                <p className="mb-2 text-xs font-semibold uppercase text-[#8b7a66]">Check-out</p>
                                <p className="text-lg font-bold text-[#211b14]">
                                    {new Date(cartItem.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-[#ead7b8] bg-[#f4ead8] p-4">
                            <Users size={24} className="mt-0.5 shrink-0 text-primary" />
                            <div className="min-w-0">
                                <p className="font-bold text-[#211b14]">{cartItem.guests} Guests</p>
                                <p className="break-words text-sm text-[#645747]">Guest Name: {cartItem.guestDetails.name}</p>
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
                        className="rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-4 shadow-xl sm:p-6 lg:sticky lg:top-24"
                    >
                        <h3 className="mb-6 text-xl font-bold text-[#211b14]">Price Details</h3>

                        <div className="mb-6 space-y-4 border-b border-[#ead7b8] pb-6">
                            <div className="flex justify-between gap-4 text-sm text-[#645747] sm:text-base">
                                <span>₹{cartItem.pricing.basePrice} x {cartItem.pricing.nights} nights</span>
                                <span>₹{cartItem.pricing.totalPrice}</span>
                            </div>
                            <div className="flex justify-between gap-4 text-sm text-[#645747] sm:text-base">
                                <span>Taxes</span>
                                <span>₹{cartItem.pricing.tax}</span>
                            </div>
                        </div>

                        <div className="mb-8 flex items-center justify-between gap-4">
                            <span className="text-lg font-bold text-[#211b14]">Total (INR)</span>
                            <span className="text-2xl font-bold text-primary">₹{cartItem.pricing.grandTotal}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary-800 active:scale-95"
                        >
                            Proceed to Checkout
                        </button>

                        <button
                            onClick={() => {
                                removeFromCart();
                                navigate(-1);
                            }}
                            className="mt-4 w-full py-3 font-medium text-[#8b7a66] transition-colors hover:text-red-500"
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
