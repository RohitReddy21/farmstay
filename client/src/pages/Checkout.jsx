import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShieldCheck, ChevronLeft, Loader, CreditCard, Banknote } from 'lucide-react';
import API_URL from '../config';
import { rememberGuestBooking } from '../utils/guestBookings';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';

const getGuestCountText = (guests) => {
    if (!guests) return '-';
    if (typeof guests === 'object') {
        const adults = Number(guests.adults || 0);
        const children = Number(guests.children || 0);
        return children ? `${adults} adults, ${children} children` : `${adults} guests`;
    }
    return `${guests} guests`;
};

const Checkout = () => {
    const { cartItem, cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
    const [completedBooking, setCompletedBooking] = useState(null);

    React.useEffect(() => {
        if (isCheckoutComplete) {
            return;
        }

        if (!cartItems.length) {
            navigate('/farms');
        }
    }, [cartItems.length, navigate, isCheckoutComplete]);

    if (!cartItems.length && !isCheckoutComplete) {
        return null;
    }

    const checkoutItems = cartItems.length ? cartItems : (cartItem ? [cartItem] : []);
    const primaryItem = checkoutItems[0];
    const subtotal = checkoutItems.reduce((sum, item) => sum + Number(item.pricing?.totalPrice || 0), 0);
    const taxTotal = checkoutItems.reduce((sum, item) => sum + Number(item.pricing?.tax || 0), 0);
    const grandTotal = subtotal + taxTotal;
    const propertyTitle = cartItem?.property?.title || completedBooking?.propertyTitle || 'Brown Cows Dairy Stay';
    const isDayExperience = cartItem?.retreatMeta?.experience === 'day'
        || cartItem?.retreatMeta?.package === 'Day Experience'
        || cartItem?.pricing?.nights === 0;
    const bookingTypeLabel = isDayExperience ? 'Experience' : 'Stay';
    const lineItemLabel = isDayExperience
        ? `Farm experience only (${cartItem?.guests} guests)`
        : propertyTitle;
    const token = localStorage.getItem('token');
    const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const finishCheckout = (message, bookingResponse = {}) => {
        const bookingIds = bookingResponse.bookingIds?.length ? bookingResponse.bookingIds : (bookingResponse.bookingId ? [bookingResponse.bookingId] : []);
        const bookingCodes = bookingResponse.bookingCodes?.length ? bookingResponse.bookingCodes : (bookingResponse.bookingCode ? [bookingResponse.bookingCode] : bookingIds);
        const nextCompletedBooking = {
            bookingId: bookingIds[0],
            bookingIds,
            bookingCode: bookingCodes[0],
            bookingCodes,
            propertyTitle: checkoutItems.length > 1 ? `${checkoutItems.length} bookings` : propertyTitle,
            total: grandTotal,
            paymentMethod,
            bookingTypeLabel,
            startDate: primaryItem?.startDate,
            endDate: primaryItem?.endDate,
            guestsText: checkoutItems.length > 1 ? 'Multiple guest details' : getGuestCountText(primaryItem?.guests)
        };

        bookingIds.forEach((bookingId, index) => {
            const item = checkoutItems[index] || primaryItem;
            const guestContact = item?.guestDetails?.email || item?.guestDetails?.phone || user?.email || user?.phone;
            rememberGuestBooking({
                bookingId,
                contact: guestContact,
                booking: {
                    _id: bookingId,
                    bookingCode: bookingCodes[index] || bookingId,
                    property: item?.property,
                    propertyTitle: item?.property?.title,
                    propertyLocation: item?.property?.location,
                    room: item?.roomId,
                    startDate: item?.startDate,
                    endDate: item?.endDate,
                    guests: item?.guests,
                    guestDetails: item?.guestDetails,
                    variation: item?.variation,
                    retreatMeta: item?.retreatMeta,
                    totalPrice: item?.pricing?.totalPrice,
                    tax: item?.pricing?.tax,
                    status: 'Pending',
                    paymentStatus: paymentMethod === 'cod' ? 'COD' : 'Authorized',
                    paymentMethod: paymentMethod === 'cod' ? 'COD' : 'Razorpay',
                    createdAt: new Date().toISOString()
                }
            });
        });

        setCompletedBooking(nextCompletedBooking);
        setIsCheckoutComplete(true);
        setConfirmationMessage(message);
        clearCart();
        setIsProcessing(false);
    };

    const buildBookingPayload = () => {
        const items = checkoutItems.map((item) => {
            const adults = Number(item.guests?.adults ?? item.guests) || 1;
            const children = Number(item.guests?.children) || 0;

            return {
                propertyId: item.propertyId,
                roomId: item.roomId,
                startDate: item.startDate,
                endDate: item.endDate,
                guests: { adults, children },
                totalPrice: item.pricing.totalPrice,
                tax: item.pricing.tax,
                guestDetails: item.guestDetails,
                variation: item.variation,
                retreatMeta: item.retreatMeta
            };
        });

        return items.length === 1 ? items[0] : { items };
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const bookingPayload = buildBookingPayload();
            const { data: orderData } = await axios.post(`${API_URL}/api/bookings/create-order`, bookingPayload, authConfig);

            if (!orderData.success) {
                throw new Error('Failed to create order');
            }

            if (!window.Razorpay) {
                throw new Error('Razorpay checkout is not loaded. Please refresh and try again.');
            }

            const { data: keyData } = await axios.get(`${API_URL}/api/bookings/razorpay-key`);

            const options = {
                key: keyData.key,
                amount: orderData.amount,
                currency: 'INR',
                name: 'Brown Cows Dairy',
                description: checkoutItems.length > 1 ? `${checkoutItems.length} Brown Cows bookings` : `Booking for ${propertyTitle}`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post(`${API_URL}/api/bookings/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingDetails: bookingPayload
                        }, authConfig);

                        if (verifyRes.data.success) {
                            finishCheckout('Payment received. We will notify you after admin review.', verifyRes.data);
                        }
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: primaryItem.guestDetails.name,
                    contact: primaryItem.guestDetails.phone,
                    email: primaryItem.guestDetails.email || user?.email || ''
                },
                theme: { color: '#7a5527' },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(`Payment failed: ${response.error.description}`);
                setIsProcessing(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.response?.data?.message || err.message || 'Something went wrong while initiating payment.');
            setIsProcessing(false);
        }
    };

    const handleCodBooking = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            const { data } = await axios.post(`${API_URL}/api/bookings/cod`, buildBookingPayload(), authConfig);

            if (!data.success) {
                throw new Error('Failed to create COD booking');
            }

            finishCheckout('COD booking placed. We will notify you after admin review.', data);
        } catch (err) {
            console.error('COD checkout error:', err);
            setError(err.response?.data?.message || 'Could not place COD booking. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleSubmitPayment = () => {
        if (paymentMethod === 'cod') {
            handleCodBooking();
            return;
        }

        handlePayment();
    };

    if (isCheckoutComplete) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-12">
                <div className="rounded-3xl border border-[#cfe4c8] bg-[#fffaf1] p-8 text-center shadow-2xl">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#edf7e9] text-[#3f6b3f]">
                        <ShieldCheck size={34} />
                    </div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a642d]">Booking Received</p>
                    <h1 className="text-3xl font-bold text-[#211b14]">Your booking is pending approval</h1>
                    <p className="mx-auto mt-3 max-w-lg text-[#645747]">
                        {confirmationMessage || 'We will notify you after admin review.'}
                    </p>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-[#3f6b3f]">
                        Your booking confirmation has been sent to your email{user ? ' and saved in My Bookings.' : '.'}
                    </p>

                    <div className="mt-8 rounded-2xl border border-[#ead7b8] bg-[#f8efdf] p-5 text-left">
                        {completedBooking?.bookingId ? (
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <span className="text-sm text-[#645747]">{completedBooking.bookingIds?.length > 1 ? 'Booking Numbers' : 'Booking Number'}</span>
                                <span className="text-right font-bold text-[#211b14]">
                                    {completedBooking.bookingIds?.length > 1 ? completedBooking.bookingCodes?.join(', ') : completedBooking.bookingCode}
                                </span>
                            </div>
                        ) : null}
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-[#645747]">{completedBooking?.bookingTypeLabel || bookingTypeLabel}</span>
                            <span className="text-right font-bold text-[#211b14]">{completedBooking?.propertyTitle || propertyTitle}</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-sm text-[#645747]">Dates</span>
                            <span className="text-right font-semibold text-[#211b14]">
                                {completedBooking?.bookingIds?.length > 1
                                    ? 'Multiple dates'
                                    : `${formatDate(completedBooking?.startDate)} to ${formatDate(completedBooking?.endDate)}`}
                            </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-sm text-[#645747]">Guests</span>
                            <span className="font-semibold text-[#211b14]">{completedBooking?.guestsText || '-'}</span>
                        </div>
                        {completedBooking?.total ? (
                            <div className="mt-3 flex items-center justify-between gap-4">
                                <span className="text-sm text-[#645747]">Amount</span>
                                <span className="font-bold text-primary">Rs {completedBooking.total}</span>
                            </div>
                        ) : null}
                        <div className="mt-3 flex items-center justify-between gap-4">
                            <span className="text-sm text-[#645747]">Payment</span>
                            <span className="font-semibold text-[#211b14]">
                                {completedBooking?.paymentMethod === 'cod' ? 'COD / Pay at Farm' : 'Razorpay Online'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={() => navigate('/bookings', {
                                state: {
                                    bookingSuccess: true,
                                    message: confirmationMessage
                                }
                            })}
                            className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg transition hover:bg-primary-800"
                        >
                            View My Bookings
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/farms')}
                            className="rounded-xl border border-[#7a5527] px-6 py-3 font-bold text-[#7a5527] transition hover:bg-[#7a5527] hover:text-white"
                        >
                            Explore More Stays
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <button
                onClick={() => navigate('/cart')}
                className="mb-8 flex items-center text-[#645747] transition-colors hover:text-[#7a5527]"
            >
                <ChevronLeft size={20} className="mr-1" />
                Back to Cart
            </button>

            <div className="overflow-hidden rounded-3xl border border-[#ead7b8] bg-[#fffaf1] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#ead7b8] bg-[#f8efdf] p-8">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-[#211b14]">Secure Checkout</h1>
                        <p className="flex items-center gap-2 text-[#645747]">
                            <ShieldCheck size={18} className="text-[#527b52]" />
                            Complete online payment or place a COD booking.
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    {confirmationMessage && (
                        <div className="mb-6 rounded-2xl border border-[#cfe4c8] bg-[#f1f8ec] p-5 text-[#3f6b3f] shadow-sm">
                            <div className="text-lg font-bold">Booking received</div>
                            <p className="mt-1 text-sm">{confirmationMessage}</p>
                            <button
                                type="button"
                                onClick={() => navigate('/bookings', {
                                    state: {
                                        bookingSuccess: true,
                                        message: confirmationMessage
                                    }
                                })}
                                className="mt-4 rounded-xl bg-[#3f6b3f] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#315631]"
                            >
                                View My Bookings
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="mb-8 rounded-2xl border border-[#ead7b8] bg-gradient-to-br from-[#fffaf1] to-[#f4ead8] p-6">
                        <h3 className="mb-4 text-lg font-bold text-[#211b14]">Final Summary</h3>
                        <div className="mb-4 space-y-2">
                            {checkoutItems.map((item) => (
                                <div key={item.cartId} className="flex items-center justify-between gap-4">
                                    <span className="min-w-0 truncate text-[#645747]">{item.property?.title || lineItemLabel}</span>
                                    <span className="font-semibold text-[#211b14]">Rs {item.pricing.totalPrice}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mb-4 flex items-center justify-between border-b border-[#ead7b8] pb-4">
                            <span className="text-[#645747]">Taxes</span>
                            <span className="font-semibold text-[#211b14]">Rs {taxTotal}</span>
                        </div>
                        <div className="flex items-center justify-between text-xl">
                            <span className="font-bold text-[#211b14]">Amount to Pay</span>
                            <span className="font-bold text-primary">Rs {grandTotal}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="mb-2 text-xl font-bold text-[#211b14]">Payment</h3>
                        <p className="mb-4 text-sm text-[#645747]">Choose how you want to place this pending approval booking.</p>

                        <div className="mb-4 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('razorpay')}
                                className={`rounded-2xl border p-4 text-left transition ${paymentMethod === 'razorpay'
                                    ? 'border-[#7a5527] bg-[#f8efdf] shadow-md'
                                    : 'border-[#ead7b8] bg-white hover:border-[#cfa86b]'
                                    }`}
                            >
                                <div className="mb-2 flex items-center gap-2 font-bold text-[#211b14]">
                                    <CreditCard size={20} className="text-[#7a5527]" />
                                    Razorpay Online
                                </div>
                                <p className="text-sm text-[#645747]">Pay now with UPI, cards, wallets, or net banking.</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cod')}
                                className={`rounded-2xl border p-4 text-left transition ${paymentMethod === 'cod'
                                    ? 'border-[#7a5527] bg-[#f8efdf] shadow-md'
                                    : 'border-[#ead7b8] bg-white hover:border-[#cfa86b]'
                                    }`}
                            >
                                <div className="mb-2 flex items-center gap-2 font-bold text-[#211b14]">
                                    <Banknote size={20} className="text-[#527b52]" />
                                    COD / Pay at Farm
                                </div>
                                <p className="text-sm text-[#645747]">Place the booking now and pay after admin approval.</p>
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-xl border-2 border-[#d6a23d]/60 bg-[#fffaf1]">
                            {paymentMethod === 'razorpay' ? (
                                <>
                                    <div className="flex flex-col justify-between gap-3 border-b border-[#ead7b8] p-4 sm:flex-row sm:items-center">
                                        <span className="font-medium text-[#211b14]">Razorpay Secure (UPI, Cards, Wallets)</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="rounded border border-[#e4d4bd] bg-white px-2 py-0.5 text-xs font-bold italic text-[#527b52]">UPI</div>
                                            <div className="rounded border border-[#e4d4bd] bg-white px-2 py-0.5 text-xs font-bold italic text-[#7a5527]">VISA</div>
                                            <div className="flex items-center rounded border border-[#e4d4bd] bg-white px-1.5 py-0.5">
                                                <div className="z-10 -mr-1 h-2.5 w-2.5 rounded-full bg-[#8d3a24]"></div>
                                                <div className="h-2.5 w-2.5 rounded-full bg-[#d6a23d]"></div>
                                            </div>
                                            <div className="rounded border border-[#e4d4bd] bg-white px-2 py-0.5 text-xs text-[#8b7a66]">+18</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center bg-[#f8efdf] p-8 text-center text-sm text-[#645747]">
                                        <ShieldCheck className="mb-4 h-12 w-12 text-[#c8a978]" strokeWidth={1.5} />
                                        You will be redirected to Razorpay Secure to complete your payment. Your booking is sent for host review only after payment succeeds.
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center bg-[#f8efdf] p-8 text-center text-sm text-[#645747]">
                                    <Banknote className="mb-4 h-12 w-12 text-[#527b52]" strokeWidth={1.5} />
                                    No online payment will be collected now. Your booking will be stored as COD and reviewed by the admin before confirmation.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={handleSubmitPayment}
                            disabled={isProcessing || isCheckoutComplete}
                            className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all ${isProcessing || isCheckoutComplete
                                ? 'cursor-not-allowed bg-[#b7aa98]'
                                : 'bg-primary hover:bg-primary-800 active:scale-[0.98]'
                                }`}
                        >
                            {isCheckoutComplete ? (
                                'Booking Received'
                            ) : isProcessing ? (
                                <>
                                    <Loader className="animate-spin" size={24} />
                                    Processing Securely...
                                </>
                            ) : paymentMethod === 'cod' ? (
                                'Confirm COD Booking'
                            ) : (
                                `Pay Rs ${grandTotal}`
                            )}
                        </button>

                        <p className="mt-4 text-center text-xs text-[#8b7a66]">
                            By continuing, you agree to the terms, conditions, and cancellation policy of Brown Cows Dairy.
                            Online bookings are submitted to the host after successful payment.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
