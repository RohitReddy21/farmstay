const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }, // Optional for now, required later
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guests: {
        adults: { type: Number, required: true },
        children: { type: Number, default: 0 }
    },
    totalPrice: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    guestDetails: {
        name: { type: String, required: true },
        email: { type: String },
        phone: { type: String, required: true },
        specialRequests: { type: String }
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    rejectionReason: { type: String },
    paymentId: { type: String }, // Razorpay Order ID or Payment ID
    paymentStatus: { type: String, enum: ['Pending', 'Authorized', 'Captured', 'Failed', 'Refunded'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
