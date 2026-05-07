const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Farm = require('../models/Farm');
const BlockedDate = require('../models/BlockedDate');
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { sendResendEmail } = require('../utils/email');
const { buildBookingStatusEmail } = require('../utils/bookingEmail');

const getBookingUserId = (booking) => {
    if (!booking?.user) return null;
    return typeof booking.user === 'object' ? booking.user._id : booking.user;
};

const sendBookingStatusEmail = async (booking, status, rejectionReason = '', context = {}) => {
    const userId = getBookingUserId(booking);
    let user = typeof booking.user === 'object' && booking.user?.email ? booking.user : null;

    if (!user && userId) {
        user = await User.findById(userId).select('name email');
        if (!user) {
            console.error('Booking status email user not found:', {
                bookingId: booking?._id,
                userId
            });
        }
    }

    const email =
        context.requestEmail ||
        booking.guestDetails?.email ||
        user?.email ||
        booking.user?.email ||
        booking.email;

    console.log('EMAIL DEBUG:', {
        requestEmail: context.requestEmail,
        userEmail: user?.email || booking.user?.email,
        bookingEmail: booking?.email,
        guestDetailsEmail: booking.guestDetails?.email,
        bookingId: booking?._id,
        status
    });

    if (!email) {
        console.error('Email missing, skipping email send', {
            bookingId: booking?._id,
            userId,
            hasUser: Boolean(booking?.user)
        });
        return;
    }

    if (!process.env.RESEND_API_KEY) {
        console.log('Booking status email skipped: Resend not configured', {
            bookingId: booking._id,
            to: email,
            status,
            emailConfigured: Boolean(process.env.RESEND_API_KEY)
        });
        return;
    }

    const guestName = booking.guestDetails?.name || user?.name || booking.user?.name || 'Guest';
    const emailContent = buildBookingStatusEmail(
        booking,
        { name: guestName, email },
        status,
        rejectionReason
    );

    await sendResendEmail({
        to: email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
        replyTo: process.env.OWNER_EMAIL || process.env.EMAIL_FROM || undefined
    });
};

const fileToPublicUrl = (req, file) => {
    const pathOrUrl = file?.path ? String(file.path) : '';
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;

    const filename = file?.filename ? String(file.filename) : '';
    if (!filename) return pathOrUrl;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/uploads/${filename}`;
};

const farmMediaUpload = (req, res, next) => {
    const handler = upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }]);
    handler(req, res, (err) => {
        if (!err) return next();
        console.error('Farm media upload error:', err);
        return res.status(400).json({
            message: 'Upload failed',
            error: err.message
        });
    });
};

const splitList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String);
    if (typeof value !== 'string') return [String(value)];
    return value
        .split(/[\n,]+/g)
        .map((s) => s.trim())
        .filter(Boolean);
};

const startOfDay = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
};

const hasRangeOverlap = (startDate, endDate) => ({
    $and: [{
        $or: [
            { startDate: { $lte: startDate }, endDate: { $gte: startDate } },
            { startDate: { $lte: endDate }, endDate: { $gte: endDate } },
            { startDate: { $gte: startDate }, endDate: { $lte: endDate } }
        ]
    }]
});

const normalizeVideoUrl = (rawUrl) => {
    const url = String(rawUrl || '').trim();
    if (!url) return '';

    try {
        // Convert common YouTube URLs to embed format (FarmDetails renders embeds)
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            const id = u.pathname.split('/').filter(Boolean)[0];
            return id ? `https://www.youtube.com/embed/${id}` : url;
        }

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            if (u.pathname === '/watch') {
                const id = u.searchParams.get('v');
                return id ? `https://www.youtube.com/embed/${id}` : url;
            }
            if (u.pathname.startsWith('/shorts/')) {
                const id = u.pathname.split('/').filter(Boolean)[1];
                return id ? `https://www.youtube.com/embed/${id}` : url;
            }
            if (u.pathname.startsWith('/embed/')) {
                return url;
            }
        }
    } catch (e) {
        // Not a valid URL; keep as-is
    }

    return url;
};

// @route   GET /api/admin/farms
// @desc    Get all farms for management
router.get('/farms', verifyAdmin, async (req, res) => {
    try {
        const farms = await Farm.find({});
        res.json(farms);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/admin/blocked-dates
// @desc    Get manual blocked date ranges
router.get('/blocked-dates', verifyAdmin, async (req, res) => {
    try {
        const query = req.query.farm ? { farm: req.query.farm } : {};
        const blockedDates = await BlockedDate.find(query)
            .populate('farm', 'title location')
            .populate('createdBy', 'name email')
            .sort({ startDate: 1 });
        res.json(blockedDates);
    } catch (error) {
        console.error('Error fetching blocked dates:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/admin/blocked-dates
// @desc    Create a manual blocked date range
router.post('/blocked-dates', verifyAdmin, async (req, res) => {
    try {
        const { farm, startDate, endDate, reason } = req.body;
        const selectedFarm = await Farm.findById(farm);
        if (!selectedFarm) {
            return res.status(404).json({ message: 'Farm not found' });
        }

        const start = startOfDay(startDate);
        const end = startOfDay(endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Please select valid start and end dates.' });
        }

        if (end < start) {
            return res.status(400).json({ message: 'End date must be the same as or after start date.' });
        }

        const conflictingBooking = await Booking.findOne({
            property: farm,
            status: { $in: ['Confirmed', 'Pending', 'Approved'] },
            ...hasRangeOverlap(start, end)
        });

        if (conflictingBooking) {
            return res.status(409).json({ message: 'A booking already exists in this date range.' });
        }

        const existingBlock = await BlockedDate.findOne({
            farm,
            ...hasRangeOverlap(start, end)
        });

        if (existingBlock) {
            return res.status(409).json({ message: 'This date range overlaps an existing manual block.' });
        }

        const blockedDate = await BlockedDate.create({
            farm,
            startDate: start,
            endDate: end,
            reason: String(reason || 'Blocked by admin').trim(),
            createdBy: req.user._id
        });

        const populatedBlock = await BlockedDate.findById(blockedDate._id)
            .populate('farm', 'title location')
            .populate('createdBy', 'name email');

        res.status(201).json(populatedBlock);
    } catch (error) {
        console.error('Error creating blocked date:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/admin/blocked-dates/:id
// @desc    Remove a manual blocked date range
router.delete('/blocked-dates/:id', verifyAdmin, async (req, res) => {
    try {
        const blockedDate = await BlockedDate.findByIdAndDelete(req.params.id);
        if (!blockedDate) {
            return res.status(404).json({ message: 'Blocked date not found' });
        }
        res.json({ message: 'Blocked date removed' });
    } catch (error) {
        console.error('Error deleting blocked date:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/admin/farms
// @desc    Create a new farm
router.post('/farms', verifyAdmin, farmMediaUpload, async (req, res) => {
    try {
        const { title, description, location, price, capacity, amenities, category, subCategory, availability, videoLinks } = req.body;
        
        const imageUrls = req.files?.images ? req.files.images.map(file => fileToPublicUrl(req, file)) : [];
        const uploadedVideoUrls = req.files?.videos ? req.files.videos.map(file => fileToPublicUrl(req, file)) : [];
        const linkVideos = splitList(videoLinks).map(normalizeVideoUrl).filter(Boolean);
        const videoUrls = [...linkVideos, ...uploadedVideoUrls];

        const farm = new Farm({
            title,
            description,
            location,
            price: Number(price),
            capacity: Number(capacity),
            amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(a => a.trim()) : []),
            images: imageUrls,
            videos: videoUrls,
            category,
            subCategory,
            availability
        });

        await farm.save();
        res.status(201).json(farm);
    } catch (error) {
        console.error('Error creating farm:', error);
        res.status(500).json({
            message: 'Server Error',
            error: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
    }
});

// @route   PUT /api/admin/farms/:id
// @desc    Update a farm
router.put('/farms/:id', verifyAdmin, farmMediaUpload, async (req, res) => {
    try {
        console.log('Update Farm Request:', {
            id: req.params.id,
            body: req.body,
            imagesCount: req.files?.images ? req.files.images.length : 0,
            videosCount: req.files?.videos ? req.files.videos.length : 0
        });

        const { title, description, location, price, capacity, amenities, category, subCategory, availability, existingImages, existingVideos, videoLinks } = req.body;
        
        let imageUrls = [];
        if (existingImages) {
            try {
                imageUrls = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
            } catch (e) {
                console.warn('Failed to parse existingImages JSON, using as fallback:', existingImages);
                imageUrls = Array.isArray(existingImages) ? existingImages : [existingImages];
            }
        }

        if (req.files?.images && req.files.images.length > 0) {
            const newImageUrls = req.files.images.map(file => fileToPublicUrl(req, file));
            imageUrls = [...imageUrls, ...newImageUrls];
        }

        let videoUrls = [];
        if (existingVideos) {
            try {
                videoUrls = typeof existingVideos === 'string' ? JSON.parse(existingVideos) : existingVideos;
            } catch (e) {
                console.warn('Failed to parse existingVideos JSON, using as fallback:', existingVideos);
                videoUrls = Array.isArray(existingVideos) ? existingVideos : [existingVideos];
            }
        }

        const linkVideos = splitList(videoLinks).map(normalizeVideoUrl).filter(Boolean);
        videoUrls = [...videoUrls, ...linkVideos];

        if (req.files?.videos && req.files.videos.length > 0) {
            const newVideoUrls = req.files.videos.map(file => fileToPublicUrl(req, file));
            videoUrls = [...videoUrls, ...newVideoUrls];
        }

        const updateData = {
            title,
            description,
            location,
            price: isNaN(Number(price)) ? 0 : Number(price),
            capacity: isNaN(Number(capacity)) ? 0 : Number(capacity),
            amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map(a => a.trim()) : []),
            images: imageUrls,
            videos: videoUrls,
            category,
            subCategory,
            availability
        };

        const farm = await Farm.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (!farm) {
            return res.status(404).json({ message: 'Farm not found' });
        }

        res.json(farm);
    } catch (error) {
        console.error('Error updating farm:', error);
        res.status(500).json({
            message: 'Server Error',
            error: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
        });
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
            .populate('property', 'title location availability capacity');
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
        
        if (!['Confirmed', 'Approved', 'Rejected', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'Rejected') {
            updateData.rejectionReason = rejectionReason;
        }

        await Booking.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        const booking = await Booking.findById(req.params.id)
            .populate('user')
            .populate('property', 'title location');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (status === 'Confirmed' || status === 'Approved' || status === 'Rejected') {
            sendBookingStatusEmail(booking, status, rejectionReason, {
                requestEmail: req.body?.email
            }).catch((emailError) => {
                console.error('Booking status email failed:', emailError);
            });
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
