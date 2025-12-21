const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyAdmin } = require('../middleware/authMiddleware');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics data
router.get('/dashboard', verifyAdmin, async (req, res) => {
    try {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

        const Booking = mongoose.model('Booking');
        const User = mongoose.model('User');
        const Farm = mongoose.model('Farm');

        // 1. Total Revenue
        const totalRevenueAgg = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;

        // 2. Total Bookings
        const totalBookings = await Booking.countDocuments({ status: { $ne: 'cancelled' } });

        // 3. Total Users
        const totalUsers = await User.countDocuments({ role: 'user' });

        // 4. Total Farms
        const totalFarms = await Farm.countDocuments();

        // 5. Monthly Revenue (Past 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    status: 'confirmed',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Format for frontend
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenueChartData = monthlyRevenue.map(item => ({
            name: `${months[item._id.month - 1]} ${item._id.year}`,
            revenue: item.revenue
        }));

        // 6. Farm Distribution
        const farmDistribution = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$farm',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'farms',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'farmDetails'
                }
            },
            { $unwind: '$farmDetails' },
            {
                $project: {
                    name: '$farmDetails.title',
                    value: '$count'
                }
            }
        ]);

        // 7. Recent Bookings (Last 10)
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('farm', 'title location')
            .select('startDate endDate guests totalPrice status createdAt guestName guestPhone');

        res.json({
            stats: {
                totalRevenue,
                totalBookings,
                totalUsers,
                totalFarms
            },
            revenueChart: revenueChartData,
            farmDistribution,
            recentBookings
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
