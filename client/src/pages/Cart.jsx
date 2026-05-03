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

    const isDayExperience = cartItem.retreatMeta?.experience === 'day'
        || cartItem.retreatMeta?.package === 'Day Experience'
        || cartItem.pricing?.nights === 0;
    const dateLabel = isDayExperience ? 'Experience Date' : 'Check-in';
    const endDateLabel = isDayExperience ? 'Program Ends' : 'Check-out';
    const priceLabel = isDayExperience
        ? `Farm experience only (${cartItem.guests} guests)`
        : `Rs ${cartItem.pricing.basePrice} x ${cartItem.pricing.nights} nights`;

    return (
        <div className="mx-auto w-full max-w-5xl overflow-hidden px-0 py-4 sm:px-4 sm:py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-5 flex items-center text-sm text-[#645747] transition-colors hover:text-[#7a5527] sm:mb-8 sm:text-base"
            >
                <ChevronLeft size={20} className="mr-1" />
                Back to Property
            </button>

            <h1 className="mb-5 text-2xl font-bold leading-tight text-[#211b14] sm:mb-8 md:text-4xl">Review Booking Details</h1>

            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8">
                {/* Left: Cart Details */}
                <div className="min-w-0 space-y-4 lg:col-span-2 lg:space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full overflow-hidden rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-3 shadow-xl sm:p-6 md:p-8"
                    >
                        <div className="mb-5 flex min-w-0 flex-col gap-3 border-b border-[#ead7b8] pb-5 sm:mb-6 sm:flex-row sm:items-start sm:gap-4 sm:pb-6">
                            <img
                                src={cartItem.property.images?.[0]}
                                alt={cartItem.property.title}
                                loading="lazy"
                                decoding="async"
                                className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-32 md:h-32 md:w-36"
                            />
                            <div className="min-w-0">
                                <h2 className="mb-2 break-words text-lg font-bold leading-tight text-[#211b14] sm:text-xl md:text-2xl">{cartItem.property.title}</h2>
                                <div className="flex items-start text-sm text-[#645747] md:text-base">
                                    <MapPin size={16} className="mr-1 mt-0.5 shrink-0" />
                                    <span className="break-words">{cartItem.property.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 md:mb-8">
                            <div className="min-w-0 rounded-xl border border-[#ead7b8] bg-[#f8efdf] p-3 sm:p-4">
                                <p className="mb-2 text-xs font-semibold uppercase text-[#8b7a66]">{dateLabel}</p>
                                <p className="text-base font-bold text-[#211b14] sm:text-lg">
                                    {new Date(cartItem.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="min-w-0 rounded-xl border border-[#ead7b8] bg-[#f8efdf] p-3 sm:p-4">
                                <p className="mb-2 text-xs font-semibold uppercase text-[#8b7a66]">{endDateLabel}</p>
                                <p className="text-base font-bold text-[#211b14] sm:text-lg">
                                    {isDayExperience
                                        ? 'Same day'
                                        : new Date(cartItem.endDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#ead7b8] bg-[#f4ead8] p-3 sm:p-4">
                            <Users size={24} className="mt-0.5 shrink-0 text-primary" />
                            <div className="min-w-0">
                                <p className="font-bold text-[#211b14]">{cartItem.guests} Guests</p>
                                <p className="break-words text-sm text-[#645747]">Guest Name: {cartItem.guestDetails.name}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Price Breakdown */}
                <div className="min-w-0 lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-full overflow-hidden rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-3 shadow-xl sm:p-6 lg:sticky lg:top-24"
                    >
                        <h3 className="mb-5 text-xl font-bold text-[#211b14] sm:mb-6">Price Details</h3>

                        <div className="mb-5 space-y-4 border-b border-[#ead7b8] pb-5 sm:mb-6 sm:pb-6">
                            <div className="flex justify-between gap-3 text-sm text-[#645747] sm:text-base">
                                <span className="min-w-0 break-words">{priceLabel}</span>
                                <span className="shrink-0">Rs {cartItem.pricing.totalPrice}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-sm text-[#645747] sm:text-base">
                                <span>Taxes</span>
                                <span className="shrink-0">Rs {cartItem.pricing.tax}</span>
                            </div>
                        </div>

                        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
                            <span className="text-lg font-bold text-[#211b14]">Total (INR)</span>
                            <span className="shrink-0 text-xl font-bold text-primary sm:text-2xl">Rs {cartItem.pricing.grandTotal}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-primary-800 active:scale-95 sm:py-4 sm:text-lg"
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
