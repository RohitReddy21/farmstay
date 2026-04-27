const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['Created', 'Authorized', 'Captured', 'Refunded', 'Failed', 'COD'], default: 'Created' },
    paymentMethod: { type: String, default: 'Razorpay' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
