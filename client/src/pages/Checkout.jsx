import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import API_URL from '../config';
import { rememberGuestBooking } from '../utils/guestBookings';
import CheckoutSuccess from '../components/checkout/CheckoutSuccess';
import CheckoutSummary from '../components/checkout/CheckoutSummary';
import CheckoutPaymentPanel from '../components/checkout/CheckoutPaymentPanel';

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
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

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
    const discountAmount = Number(appliedCoupon?.discountAmount || 0);
    const amountToPay = Math.max(1, grandTotal - discountAmount);
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
            total: amountToPay,
            couponCode: appliedCoupon?.code,
            discountAmount,
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
                    couponCode: appliedCoupon?.code,
                    discountAmount: index === 0 ? discountAmount : 0,
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

        const payload = items.length === 1 ? items[0] : { items };
        if (appliedCoupon?.code) {
            payload.couponCode = appliedCoupon.code;
        }
        return payload;
    };

    const handleCouponInput = (value) => {
        setCouponCode(value.toUpperCase());
        setCouponError('');
        setCouponMessage('');
        if (appliedCoupon && value.trim().toUpperCase() !== appliedCoupon.code) {
            setAppliedCoupon(null);
        }
    };

    const handleApplyCoupon = async () => {
        const code = couponCode.trim().toUpperCase();
        if (!code) {
            setCouponError('Enter your coupon code.');
            return;
        }

        try {
            setIsApplyingCoupon(true);
            setCouponError('');
            setCouponMessage('');
            const payload = buildBookingPayload();
            const { data } = await axios.post(`${API_URL}/api/bookings/validate-coupon`, {
                ...payload,
                couponCode: code
            }, authConfig);

            setAppliedCoupon({
                code: data.coupon.code,
                discountAmount: data.discountAmount,
                finalAmount: data.finalAmount
            });
            setCouponCode(data.coupon.code);
            setCouponMessage(data.message || `Coupon ${data.coupon.code} applied.`);
        } catch (err) {
            setAppliedCoupon(null);
            setCouponError(err.response?.data?.message || 'Could not apply this coupon.');
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponMessage('');
        setCouponError('');
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
            const bookingPayload = buildBookingPayload();
            const { data } = await axios.post(`${API_URL}/api/bookings/cod`, bookingPayload, authConfig);

            if (!data.success) {
                throw new Error('Failed to place COD booking');
            }

            finishCheckout('Your COD booking request has been received. Brown Cows will review and confirm availability.', data);
        } catch (err) {
            console.error('COD checkout error:', err);
            setError(err.response?.data?.message || err.message || 'Something went wrong while placing your COD booking.');
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
            <CheckoutSuccess
                completedBooking={completedBooking}
                bookingTypeLabel={bookingTypeLabel}
                propertyTitle={propertyTitle}
                confirmationMessage={confirmationMessage}
                user={user}
                formatDate={formatDate}
                navigate={navigate}
            />
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
                            Choose online payment or COD to submit your booking for host review.
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

                    <CheckoutSummary
                        checkoutItems={checkoutItems}
                        lineItemLabel={lineItemLabel}
                        taxTotal={taxTotal}
                        couponCode={couponCode}
                        appliedCoupon={appliedCoupon}
                        isApplyingCoupon={isApplyingCoupon}
                        couponMessage={couponMessage}
                        couponError={couponError}
                        discountAmount={discountAmount}
                        amountToPay={amountToPay}
                        onCouponInput={handleCouponInput}
                        onApplyCoupon={handleApplyCoupon}
                        onRemoveCoupon={handleRemoveCoupon}
                    />

                    <CheckoutPaymentPanel
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        isProcessing={isProcessing}
                        isCheckoutComplete={isCheckoutComplete}
                        amountToPay={amountToPay}
                        onSubmitPayment={handleSubmitPayment}
                    />
                </div>
            </div>
        </div>
    );
};

export default Checkout;
