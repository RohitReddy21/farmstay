import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Calendar, Users, MapPin, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
});

const getGuestText = (guests) => {
    if (typeof guests === 'object') {
        const adults = Number(guests.adults || 0);
        const children = Number(guests.children || 0);
        return children ? `${adults + children} Guests` : `${adults} Guests`;
    }
    return `${guests} Guests`;
};

const Cart = () => {
    const { cartItems, removeFromCart } = useCart();
    const navigate = useNavigate();

    if (!cartItems.length) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f4ead8]">
                    <Calendar size={40} className="text-[#7a5527]" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-[#211b14]">Your Cart is Empty</h2>
                <p className="mb-8 text-[#645747]">Add one or more stays, then checkout together.</p>
                <button
                    onClick={() => navigate('/farms')}
                    className="rounded-xl bg-primary px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-primary-800 active:scale-95"
                >
                    Explore Properties
                </button>
            </div>
        );
    }

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.pricing?.totalPrice || 0), 0);
    const tax = cartItems.reduce((sum, item) => sum + Number(item.pricing?.tax || 0), 0);
    const grandTotal = subtotal + tax;

    return (
        <div className="mx-auto w-full max-w-6xl overflow-hidden px-4 py-6 sm:py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-5 flex items-center text-sm text-[#645747] transition-colors hover:text-[#7a5527] sm:mb-8 sm:text-base"
            >
                <ChevronLeft size={20} className="mr-1" />
                Back
            </button>

            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a642d]">Brown Cows Dairy</p>
                    <h1 className="mt-2 text-2xl font-bold leading-tight text-[#211b14] md:text-4xl">Review Booking Cart</h1>
                    <p className="mt-2 text-[#645747]">{cartItems.length} booking{cartItems.length === 1 ? '' : 's'} ready for checkout.</p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate('/farms')}
                    className="rounded-xl border border-[#8a642d] px-5 py-3 font-bold text-[#7a5527] transition hover:bg-[#f8efdf]"
                >
                    Add Another Stay
                </button>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-8">
                <div className="min-w-0 space-y-4 lg:col-span-2">
                    {cartItems.map((item, index) => {
                        const isDayExperience = item.retreatMeta?.experience === 'day'
                            || item.retreatMeta?.package === 'Day Experience'
                            || item.pricing?.nights === 0;
                        const priceLabel = isDayExperience
                            ? `Farm experience only (${getGuestText(item.guests)})`
                            : `Rs ${item.pricing?.basePrice} x ${item.pricing?.nights} nights`;

                        return (
                            <motion.div
                                key={item.cartId}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="w-full overflow-hidden rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-4 shadow-xl sm:p-6"
                            >
                                <div className="mb-5 flex min-w-0 flex-col gap-3 border-b border-[#ead7b8] pb-5 sm:flex-row sm:items-start sm:gap-4">
                                    <img
                                        src={item.property.images?.[0]}
                                        alt={item.property.title}
                                        loading="lazy"
                                        decoding="async"
                                        className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-32"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a642d]">Booking {index + 1}</p>
                                                <h2 className="mt-1 break-words text-lg font-bold leading-tight text-[#211b14] sm:text-xl">{item.property.title}</h2>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                                                aria-label="Remove booking"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                        <div className="mt-2 flex items-start text-sm text-[#645747]">
                                            <MapPin size={16} className="mr-1 mt-0.5 shrink-0" />
                                            <span className="break-words">{item.property.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="min-w-0 rounded-xl border border-[#ead7b8] bg-[#f8efdf] p-3">
                                        <p className="mb-2 text-xs font-semibold uppercase text-[#8b7a66]">{isDayExperience ? 'Experience Date' : 'Check-in'}</p>
                                        <p className="font-bold text-[#211b14]">{formatDate(item.startDate)}</p>
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-[#ead7b8] bg-[#f8efdf] p-3">
                                        <p className="mb-2 text-xs font-semibold uppercase text-[#8b7a66]">{isDayExperience ? 'Program Ends' : 'Check-out'}</p>
                                        <p className="font-bold text-[#211b14]">{isDayExperience ? 'Same day' : formatDate(item.endDate)}</p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#ead7b8] bg-[#f4ead8] p-3">
                                        <Users size={22} className="mt-0.5 shrink-0 text-primary" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-[#211b14]">{getGuestText(item.guests)}</p>
                                            <p className="break-words text-sm text-[#645747]">Guest: {item.guestDetails.name}</p>
                                            <p className="break-words text-sm text-[#645747]">Email: {item.guestDetails.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="rounded-xl bg-white p-3 text-sm text-[#645747]">
                                        <div className="flex justify-between gap-4">
                                            <span>{priceLabel}</span>
                                            <span className="font-bold text-[#211b14]">Rs {item.pricing?.totalPrice}</span>
                                        </div>
                                        <div className="mt-1 flex justify-between gap-4">
                                            <span>Taxes</span>
                                            <span>Rs {item.pricing?.tax}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="min-w-0 lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="w-full overflow-hidden rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-4 shadow-xl sm:p-6 lg:sticky lg:top-24"
                    >
                        <h3 className="mb-5 text-xl font-bold text-[#211b14]">Price Details</h3>

                        <div className="mb-5 space-y-4 border-b border-[#ead7b8] pb-5">
                            <div className="flex justify-between gap-3 text-[#645747]">
                                <span>Bookings</span>
                                <span>{cartItems.length}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-[#645747]">
                                <span>Subtotal</span>
                                <span>Rs {subtotal}</span>
                            </div>
                            <div className="flex justify-between gap-3 text-[#645747]">
                                <span>Taxes</span>
                                <span>Rs {tax}</span>
                            </div>
                        </div>

                        <div className="mb-6 flex items-center justify-between gap-3">
                            <span className="text-lg font-bold text-[#211b14]">Total (INR)</span>
                            <span className="shrink-0 text-2xl font-bold text-primary">Rs {grandTotal}</span>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-primary-800 active:scale-95"
                        >
                            Proceed to Checkout
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
