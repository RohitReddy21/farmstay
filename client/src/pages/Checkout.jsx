import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShieldCheck, ChevronLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from '../config';

const Checkout = () => {
    const { cartItem, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        if (!cartItem) {
            navigate('/farms');
        } else if (!user) {
            navigate('/login');
        }
    }, [cartItem, user, navigate]);

    if (!cartItem || !user) {
        return null;
    }

    const handlePayment = async () => {
        setIsProcessing(true);
        setError(null);

        try {
            // 1. Create Razorpay Order on Backend
            const { data: orderData } = await axios.post(`${API_URL}/api/bookings/create-order`, {
                propertyId: cartItem.propertyId,
                startDate: cartItem.startDate,
                endDate: cartItem.endDate,
                guests: { adults: cartItem.guests },
                totalPrice: cartItem.pricing.totalPrice,
                tax: cartItem.pricing.tax,
                guestDetails: cartItem.guestDetails
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (!orderData.success) {
                throw new Error('Failed to create order');
            }

            // Fetch Razorpay Key
            const { data: keyData } = await axios.get(`${API_URL}/api/bookings/razorpay-key`);

            // 2. Initialize Razorpay Checkout
            const options = {
                key: keyData.key,
                amount: orderData.amount,
                currency: "INR",
                name: "Brown Cows Dairy",
                description: `Booking for ${cartItem.property.title}`,
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment Signature
                        const verifyRes = await axios.post(`${API_URL}/api/bookings/verify-payment`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: orderData.bookingId
                        }, { 
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
                        });

                        if (verifyRes.data.success) {
                            clearCart();
                            navigate('/bookings', { state: { bookingSuccess: true } });
                        }
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: cartItem.guestDetails.name,
                    contact: cartItem.guestDetails.phone,
                    email: user.email
                },
                theme: { color: "#16a34a" },
                modal: {
                    ondismiss: function() {
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
            setError(err.response?.data?.message || 'Something went wrong while initiating payment.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <button 
                onClick={() => navigate('/cart')}
                className="flex items-center text-gray-600 hover:text-primary mb-8 transition-colors"
            >
                <ChevronLeft size={20} className="mr-1" />
                Back to Cart
            </button>

            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
                        <p className="text-gray-500 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-green-500" />
                            Encrypted and secure payment via Razorpay
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 to-green-50 rounded-2xl border border-primary/10">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Final Summary</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">{cartItem.property.title}</span>
                            <span className="font-semibold text-gray-900">₹{cartItem.pricing.totalPrice}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-primary/10">
                            <span className="text-gray-600">Taxes (18%)</span>
                            <span className="font-semibold text-gray-900">₹{cartItem.pricing.tax}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl">
                            <span className="font-bold text-gray-900">Amount to Pay</span>
                            <span className="font-bold text-primary">₹{cartItem.pricing.grandTotal}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment</h3>
                        <p className="text-gray-500 text-sm mb-4">All transactions are secure and encrypted.</p>
                        
                        <div className="border-2 border-[#005cff] rounded-xl overflow-hidden bg-blue-50/10">
                            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#005cff]/20 gap-3">
                                <span className="font-medium text-gray-900">Razorpay Secure (UPI, Cards, Int'l Cards, Wallets)</span>
                                <div className="flex gap-1.5 items-center">
                                    <div className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-green-700 flex items-center justify-center italic">UPI</div>
                                    <div className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-bold text-blue-800 italic flex items-center justify-center">VISA</div>
                                    <div className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-xs flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#eb001b] -mr-1 z-10"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#f79e1b]"></div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-500 flex items-center justify-center">+18</div>
                                </div>
                            </div>
                            <div className="p-8 bg-gray-50 text-center text-gray-600 text-sm flex flex-col items-center">
                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                You'll be redirected to Razorpay Secure (UPI, Cards, Int'l Cards, Wallets) to complete your purchase.
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex justify-center items-center gap-3 ${
                                isProcessing 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-primary hover:bg-green-600 active:scale-[0.98]'
                            }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader className="animate-spin" size={24} />
                                    Processing Securely...
                                </>
                            ) : (
                                `Pay ₹${cartItem.pricing.grandTotal}`
                            )}
                        </button>
                        
                        <p className="text-center text-xs text-gray-500 mt-4">
                            By clicking "Pay", you agree to the terms and conditions and cancellation policy of Brown Cows Dairy.
                            Your booking will be placed in "Pending Approval" state until confirmed by the host.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
// Vite re-bundle trigger
