const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware');

const Farm = require('../models/Farm');

// @route   POST /api/admin/seed
// @desc    Seed database with correct content
router.post('/seed', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await Farm.deleteMany({});

        const farms = [
            {
                title: "Vineyard Farm Stay",
                location: "Amangal, Telangana",
                price: 4999,
                capacity: 12,
                images: [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: [
                    "Swimming Pool",
                    "BBQ Grill",
                    "Bar",
                    "Open Campfire",
                    "Music",
                    "WiFi",
                    "Parking",
                    "Hot Water",
                    "AC"
                ],
                description: `Step away from the noise of everyday life and into the soothing embrace of nature.
Here, time slows down and serenity takes over, as you’re surrounded by acres of sun-kissed vineyards, gentle breezes, and a sky that turns gold at dusk.
The tranquil landscapes of Amangal.

Our Rooms – Simple. Traditional. Peaceful.
Vineyard Farm Stay offers three cozy rooms, each inspired by traditional South Indian design.

What to Expect:
• Comfortable beds with clean, cotton sheets.
• Spacious bathrooms with modern fittings and hot water.
• Common Dining Area.
• Verandah or sit-out area to relax with a cup of chai.

A Peaceful Escape at Vineyard Farm Stay

Amenities at Vineyard Farm Stay:
• BBQ Grill – Enjoy a fun evening grilling and dining outdoors.
• Bar – Relax with refreshing drinks while enjoying vineyard views.
• Open Campfire – Gather around the campfire to relax and share stories.
• Music – Enjoy music in the common areas or by the campfire.
• Swimming Pool

Room Tariffs (Per Night):
• KRISHNA: ₹6,400
• GODAVARI: ₹4,999
• KAVERI: ₹5,600

Includes:
• Complimentary breakfast
• Free Wi-Fi
• Access to all amenities (BBQ grill, swimming pool, etc.)

Additional Charges:
• Extra bed (per night): ₹999
• Lunch + Dinner (per person): ₹1,100

Contact & Location:
📍 Sarayu Green Farms, Talakondapalli Road, Amangal, Telangana – 509410
📞 Phone: +91 9989854411
📧 Email: vineyardfarmstay@gmail.com
📸 Instagram: @vineyardfarmstay
🕒 Check-in: 11 AM | Check-out: 11 AM`
            },
            {
                title: "Sarayu Green Farms",
                location: "Amangal, Telangana",
                price: 3500,
                capacity: 8,
                images: [
                    "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=800&q=80"
                ],
                amenities: ["WiFi", "Kitchen", "Parking", "Garden", "Pets Allowed"],
                description: "A beautiful green farm stay located in Amangal, perfect for weekend getaways with family and friends. Enjoy the lush greenery and fresh air."
            }
        ];

        await Farm.insertMany(farms);
        res.json({ message: 'Database updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
router.get('/bookings', verifyAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email')
            .populate('property', 'title location');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   PUT /api/admin/bookings/:id/status
// @desc    Update booking status (accept, reject with reason)
router.put('/bookings/:id/status', verifyAdmin, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        
        if (!['Confirmed', 'Rejected', 'Completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'Rejected') {
            updateData.rejectionReason = rejectionReason;
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
    try {
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await mongoose.model('User').findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   DELETE /api/admin/bookings/:id
// @desc    Delete a booking
router.delete('/bookings/:id', verifyAdmin, async (req, res) => {
    try {
        const booking = await mongoose.model('Booking').findByIdAndDelete(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        res.json({ message: 'Booking removed' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   DELETE /api/admin/farms/:id
// @desc    Delete a farm
router.delete('/farms/:id', verifyAdmin, async (req, res) => {
    try {
        const farm = await mongoose.model('Farm').findByIdAndDelete(req.params.id);
        if (!farm) {
            return res.status(404).json({ message: 'Farm not found' });
        }
        res.json({ message: 'Farm removed' });
    } catch (error) {
        console.error('Error deleting farm:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
