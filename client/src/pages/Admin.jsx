import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import RegisteredUsersSection from '../components/admin/RegisteredUsersSection';
import AdminBookingsSection from '../components/admin/AdminBookingsSection';
import PrivateCouponsSection from '../components/admin/PrivateCouponsSection';
import AdminCalendarSection from '../components/admin/AdminCalendarSection';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';
const formatDateKey = (date) => {
    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const monthLabel = (date) => new Date(date).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
});

const getMonthGrid = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(start);
        day.setDate(start.getDate() + index);
        return day;
    });
};

const getBookingFarmId = (booking) => {
    if (!booking?.property) return '';
    return typeof booking.property === 'object' ? booking.property._id : booking.property;
};

const bookingIncludesDate = (booking, date) => {
    const key = formatDateKey(date);
    return key >= formatDateKey(booking.startDate) && key <= formatDateKey(booking.endDate);
};

const isActiveCalendarBooking = (booking) => !['Rejected', 'Cancelled'].includes(booking.status);

const isBlockedFarmDate = (farm, date) => {
    const day = date.getDay();
    return farm?.availability === 'Monday to Friday' && (day === 0 || day === 6);
};

const blockIncludesDate = (block, date) => {
    const key = formatDateKey(date);
    return key >= formatDateKey(block.startDate) && key <= formatDateKey(block.endDate);
};

const getBlockFarmId = (block) => {
    if (!block?.farm) return '';
    return typeof block.farm === 'object' ? block.farm._id : block.farm;
};

const getCalendarDayStatus = (farm, date, bookings, blockedDates, openDates = []) => {
    if (!farm) return { type: 'available', label: 'Available', bookings: [] };

    const dayBookings = bookings.filter((booking) => (
        getBookingFarmId(booking) === farm._id
        && isActiveCalendarBooking(booking)
        && bookingIncludesDate(booking, date)
    ));
    const manualBlocks = blockedDates.filter((block) => (
        getBlockFarmId(block) === farm._id && blockIncludesDate(block, date)
    ));
    const openedDates = openDates.filter((openDate) => (
        getBlockFarmId(openDate) === farm._id && blockIncludesDate(openDate, date)
    ));

    const booked = dayBookings.filter((booking) => ['Confirmed', 'Approved', 'Completed'].includes(booking.status));
    const pending = dayBookings.filter((booking) => booking.status === 'Pending');

    if (booked.length) return { type: 'booked', label: 'Booked', bookings: booked };
    if (pending.length) return { type: 'pending', label: 'Pending', bookings: pending };
    if (manualBlocks.length) return { type: 'blocked', label: 'Blocked', bookings: [], blocks: manualBlocks };
    if (openedDates.length) return { type: 'open', label: 'Opened', bookings: [], blocks: [], openDates: openedDates };
    if (isBlockedFarmDate(farm, date)) return { type: 'blocked', label: 'Blocked', bookings: [], blocks: [] };
    return { type: 'available', label: 'Available', bookings: [] };
};

const statusStyles = {
    booked: 'border-[#b9d8ae] bg-[#eef7e9] text-[#2f5f32]',
    pending: 'border-[#ead7b8] bg-[#fff6dd] text-[#8a642d]',
    blocked: 'border-[#ded6ca] bg-[#f1eee7] text-[#7b6a58]',
    open: 'border-[#b8d7ea] bg-[#eef8ff] text-[#245b7a]',
    available: 'border-[#ead7b8] bg-white text-[#645747]'
};

const getGuests = (guests) => {
    if (!guests) return '-';
    if (typeof guests === 'object') {
        return `${guests.adults || 0}${guests.children ? ` + ${guests.children} children` : ''}`;
    }
    return guests;
};
const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const getDefaultCouponForm = () => {
    const end = new Date();
    end.setDate(end.getDate() + 30);
    return {
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: formatDateKey(new Date()),
        endDate: formatDateKey(end),
        isActive: true
    };
};
const formatCouponDiscount = (coupon) => {
    if (!coupon) return '-';
    return coupon.discountType === 'Percentage'
        ? `${coupon.discountValue}%${coupon.maxDiscount ? ` up to Rs ${Number(coupon.maxDiscount).toLocaleString('en-IN')}` : ''}`
        : `Rs ${Number(coupon.discountValue || 0).toLocaleString('en-IN')}`;
};
const getBookingNetTotal = (booking) => (
    Math.max(0, Number(booking.totalPrice || 0) + Number(booking.tax || 0) - Number(booking.discountAmount || 0))
);

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [farms, setFarms] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [openDates, setOpenDates] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [couponForm, setCouponForm] = useState(getDefaultCouponForm);
    const [couponSaving, setCouponSaving] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [selectedFarmId, setSelectedFarmId] = useState('');
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [blockForm, setBlockForm] = useState({
        startDate: formatDateKey(new Date()),
        endDate: formatDateKey(new Date()),
        reason: ''
    });
    const [openForm, setOpenForm] = useState({
        startDate: formatDateKey(new Date()),
        endDate: formatDateKey(new Date()),
        cottages: [],
        reason: ''
    });
    const [blockSaving, setBlockSaving] = useState(false);
    const [blockError, setBlockError] = useState('');
    const [openSaving, setOpenSaving] = useState(false);
    const [openError, setOpenError] = useState('');
    const [bookingFilter, setBookingFilter] = useState('all');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user]);

    const authConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const fetchData = async () => {
        try {
            const usersRes = await axios.get(`${API_URL}/api/admin/users`, authConfig());
            setUsers(usersRes.data);

            const farmsRes = await axios.get(`${API_URL}/api/admin/farms`, authConfig());
            setFarms(farmsRes.data);
            setSelectedFarmId((current) => current || farmsRes.data?.[0]?._id || '');

            const bookingsRes = await axios.get(`${API_URL}/api/admin/bookings`, authConfig());
            setBookings(bookingsRes.data);

            const blockedDatesRes = await axios.get(`${API_URL}/api/admin/blocked-dates`, authConfig());
            setBlockedDates(blockedDatesRes.data);

            const openDatesRes = await axios.get(`${API_URL}/api/admin/open-dates`, authConfig());
            setOpenDates(openDatesRes.data);

            const couponsRes = await axios.get(`${API_URL}/api/admin/coupons`, authConfig());
            setCoupons(couponsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role: newRole }, authConfig());
            await new Promise((resolve) => setTimeout(resolve, 200));
            fetchData();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    const handleDeleteUser = async (userId, email) => {
        if (email === user?.email) {
            alert('You cannot delete your own account while logged in.');
            return;
        }

        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                await axios.delete(`${API_URL}/api/admin/users/${userId}`, authConfig());
                fetchData();
                alert('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const handleBookingStatus = async (bookingId, status) => {
        try {
            let rejectionReason = '';
            if (status === 'Rejected') {
                rejectionReason = window.prompt('Please enter a reason for rejection:');
                if (rejectionReason === null) return;
            }

            const booking = bookings.find((item) => item._id === bookingId);
            const isOnlinePaidBooking = booking && (
                booking.paymentMethod === 'Razorpay'
                || ['Authorized', 'Captured'].includes(booking.paymentStatus)
            );
            const isCodBooking = booking && (booking.paymentMethod === 'COD' || booking.paymentStatus === 'COD');

            await axios.put(`${API_URL}/api/admin/bookings/${bookingId}/status`, { status, rejectionReason }, authConfig());
            fetchData();
            alert(status === 'Rejected'
                ? `Booking rejected and guest email sent if configured.${isOnlinePaidBooking ? ' Refund notice included: any debited amount will be refunded within 7 working days.' : ''}${isCodBooking ? ' COD payment notice included: no online amount was collected.' : ''}`
                : 'Booking accepted and guest email sent if configured.');
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert(error.response?.data?.message || 'Failed to update booking status');
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to permanently delete this booking?')) {
            try {
                await axios.delete(`${API_URL}/api/admin/bookings/${bookingId}`, authConfig());
                fetchData();
                alert('Booking deleted successfully');
            } catch (error) {
                console.error('Error deleting booking:', error);
                alert(error.response?.data?.message || 'Failed to delete booking');
            }
        }
    };

    const handleResetContent = async () => {
        if (window.confirm('Are you sure? This will reset all farms to the default content.')) {
            try {
                await axios.post(`${API_URL}/api/admin/seed`, {}, authConfig());
                alert('Content updated successfully! Please refresh the page.');
            } catch (error) {
                console.error('Error resetting content:', error);
                alert('Failed to reset content');
            }
        }
    };

    const downloadBookings = () => {
        const headers = [
            'Booking ID',
            'Property',
            'Location',
            'Guest Name',
            'Guest Phone',
            'Guest Email',
            'User Email',
            'Check-in',
            'Check-out',
            'Guests',
            'Base Price',
            'Tax',
            'Discount',
            'Total',
            'Payment Status',
            'Booking Status',
            'Rejection Reason',
            'Booked On'
        ];

        const rows = bookings.map((b) => [
            b._id,
            b.property?.title || b.propertyTitle || b.farm?.title || 'Unknown Property',
            b.property?.location || b.propertyLocation || b.farm?.location || '',
            b.guestDetails?.name || b.user?.name || '',
            b.guestDetails?.phone || '',
            b.guestDetails?.email || '',
            b.user?.email || '',
            formatDate(b.startDate),
            formatDate(b.endDate),
            getGuests(b.guests),
            b.totalPrice || 0,
            b.tax || 0,
            b.discountAmount || 0,
            getBookingNetTotal(b),
            b.paymentStatus || 'Pending',
            b.status || 'Pending',
            b.rejectionReason || '',
            formatDate(b.createdAt)
        ]);

        const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'brown-cows-all-bookings.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCouponFormChange = (field, value) => {
        setCouponForm((current) => ({ ...current, [field]: value }));
        setCouponError('');
    };

    const handleCreateCoupon = async (event) => {
        event.preventDefault();
        try {
            setCouponSaving(true);
            setCouponError('');
            const { data } = await axios.post(`${API_URL}/api/admin/coupons`, couponForm, authConfig());
            setCoupons((current) => [data, ...current]);
            setCouponForm(getDefaultCouponForm());
        } catch (error) {
            setCouponError(error.response?.data?.message || 'Could not create coupon.');
        } finally {
            setCouponSaving(false);
        }
    };

    const handleToggleCoupon = async (coupon) => {
        try {
            const payload = {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscount: coupon.maxDiscount || '',
                usageLimit: coupon.usageLimit || '',
                startDate: formatDateKey(coupon.startDate),
                endDate: formatDateKey(coupon.endDate),
                isActive: !coupon.isActive
            };
            const { data } = await axios.put(`${API_URL}/api/admin/coupons/${coupon._id}`, payload, authConfig());
            setCoupons((current) => current.map((item) => (item._id === coupon._id ? data : item)));
        } catch (error) {
            alert(error.response?.data?.message || 'Could not update coupon.');
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        if (!window.confirm('Delete this private coupon code?')) return;

        try {
            await axios.delete(`${API_URL}/api/admin/coupons/${couponId}`, authConfig());
            setCoupons((current) => current.filter((coupon) => coupon._id !== couponId));
        } catch (error) {
            alert(error.response?.data?.message || 'Could not delete coupon.');
        }
    };

    const selectedFarm = farms.find((farm) => farm._id === selectedFarmId);
    const calendarDays = getMonthGrid(calendarMonth);
    const visibleMonth = calendarMonth.getMonth();
    const calendarStats = calendarDays.reduce((stats, day) => {
        if (day.getMonth() !== visibleMonth) return stats;
        const status = getCalendarDayStatus(selectedFarm, day, bookings, blockedDates, openDates).type;
        stats[status] += 1;
        return stats;
    }, { booked: 0, pending: 0, blocked: 0, open: 0, available: 0 });
    const selectedFarmBlocks = blockedDates
        .filter((block) => getBlockFarmId(block) === selectedFarmId)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const selectedFarmOpenDates = openDates
        .filter((openDate) => getBlockFarmId(openDate) === selectedFarmId)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filteredBookings = bookings.filter((booking) => {
        if (bookingFilter === 'pending') return booking.status === 'Pending';
        if (bookingFilter === 'upcoming') return new Date(booking.startDate) >= today && !['Cancelled', 'Rejected', 'Completed'].includes(booking.status);
        if (bookingFilter === 'cod') return booking.paymentStatus === 'COD' || booking.paymentMethod === 'COD';
        if (bookingFilter === 'paid') return ['Authorized', 'Captured'].includes(booking.paymentStatus);
        if (bookingFilter === 'rejected') return booking.status === 'Rejected';
        return true;
    });
    const quickFilters = [
        { key: 'all', label: 'All', count: bookings.length },
        { key: 'pending', label: 'Pending', count: bookings.filter((booking) => booking.status === 'Pending').length },
        { key: 'upcoming', label: 'Upcoming', count: bookings.filter((booking) => new Date(booking.startDate) >= today && !['Cancelled', 'Rejected', 'Completed'].includes(booking.status)).length },
        { key: 'cod', label: 'COD', count: bookings.filter((booking) => booking.paymentStatus === 'COD' || booking.paymentMethod === 'COD').length },
        { key: 'paid', label: 'Paid', count: bookings.filter((booking) => ['Authorized', 'Captured'].includes(booking.paymentStatus)).length },
        { key: 'rejected', label: 'Rejected', count: bookings.filter((booking) => booking.status === 'Rejected').length },
        { key: 'blocked', label: 'Blocked Dates', count: blockedDates.length }
    ];

    const shiftCalendarMonth = (direction) => {
        setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
    };

    const handleSelectedFarmChange = (farmId) => {
        setSelectedFarmId(farmId);
        setOpenForm((current) => ({ ...current, cottages: [] }));
        setBlockError('');
        setOpenError('');
    };

    const handleBlockFormChange = (field, value) => {
        setBlockForm((current) => ({ ...current, [field]: value }));
        setBlockError('');
    };

    const handleOpenFormChange = (field, value) => {
        setOpenForm((current) => ({ ...current, [field]: value }));
        setOpenError('');
    };

    const handleCreateBlockedDate = async (event) => {
        event.preventDefault();
        if (!selectedFarmId) return;

        if (!blockForm.startDate || !blockForm.endDate) {
            setBlockError('Please select start and end dates.');
            return;
        }

        if (new Date(blockForm.endDate) < new Date(blockForm.startDate)) {
            setBlockError('End date must be the same as or after start date.');
            return;
        }

        try {
            setBlockSaving(true);
            const { data } = await axios.post(`${API_URL}/api/admin/blocked-dates`, {
                farm: selectedFarmId,
                startDate: blockForm.startDate,
                endDate: blockForm.endDate,
                reason: blockForm.reason
            }, authConfig());

            setBlockedDates((current) => [...current, data]);
            setBlockForm({
                startDate: blockForm.startDate,
                endDate: blockForm.endDate,
                reason: ''
            });
        } catch (error) {
            setBlockError(error.response?.data?.message || 'Could not block dates.');
        } finally {
            setBlockSaving(false);
        }
    };

    const handleCreateOpenDate = async (event) => {
        event.preventDefault();
        if (!selectedFarmId) return;

        if (!openForm.startDate || !openForm.endDate) {
            setOpenError('Please select start and end dates.');
            return;
        }

        if (new Date(openForm.endDate) < new Date(openForm.startDate)) {
            setOpenError('End date must be the same as or after start date.');
            return;
        }

        try {
            setOpenSaving(true);
            const { data } = await axios.post(`${API_URL}/api/admin/open-dates`, {
                farm: selectedFarmId,
                startDate: openForm.startDate,
                endDate: openForm.endDate,
                cottages: openForm.cottages,
                reason: openForm.reason
            }, authConfig());

            setOpenDates((current) => [...current, data]);
            setOpenForm({
                startDate: openForm.startDate,
                endDate: openForm.endDate,
                cottages: [],
                reason: ''
            });
        } catch (error) {
            setOpenError(error.response?.data?.message || 'Could not open dates.');
        } finally {
            setOpenSaving(false);
        }
    };

    const handleDeleteBlockedDate = async (blockId) => {
        if (!window.confirm('Remove this manual date block?')) return;

        try {
            await axios.delete(`${API_URL}/api/admin/blocked-dates/${blockId}`, authConfig());
            setBlockedDates((current) => current.filter((block) => block._id !== blockId));
        } catch (error) {
            console.error('Error deleting blocked date:', error);
            alert(error.response?.data?.message || 'Could not remove blocked date.');
        }
    };

    const handleDeleteOpenDate = async (openDateId) => {
        if (!window.confirm('Remove this opened weekend permission?')) return;

        try {
            await axios.delete(`${API_URL}/api/admin/open-dates/${openDateId}`, authConfig());
            setOpenDates((current) => current.filter((openDate) => openDate._id !== openDateId));
        } catch (error) {
            console.error('Error deleting open date:', error);
            alert(error.response?.data?.message || 'Could not remove opened date.');
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col px-2 py-5 sm:px-4 sm:py-8">
            <div className="order-1 mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-[#211b14]">Admin Dashboard</h1>
                <button
                    onClick={handleResetContent}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                >
                    Reset Website Content
                </button>
            </div>

            <PrivateCouponsSection
                coupons={coupons}
                couponForm={couponForm}
                couponError={couponError}
                couponSaving={couponSaving}
                onCouponFormChange={handleCouponFormChange}
                onCreateCoupon={handleCreateCoupon}
                onToggleCoupon={handleToggleCoupon}
                onDeleteCoupon={handleDeleteCoupon}
                formatDate={formatDate}
                formatCouponDiscount={formatCouponDiscount}
            />

            <RegisteredUsersSection
                users={users}
                onRoleUpdate={handleRoleUpdate}
                onDeleteUser={handleDeleteUser}
            />

            <AdminCalendarSection
                farms={farms}
                selectedFarmId={selectedFarmId}
                onSelectedFarmChange={handleSelectedFarmChange}
                calendarMonth={calendarMonth}
                monthLabel={monthLabel}
                shiftCalendarMonth={shiftCalendarMonth}
                calendarStats={calendarStats}
                statusStyles={statusStyles}
                blockForm={blockForm}
                openForm={openForm}
                blockError={blockError}
                openError={openError}
                blockSaving={blockSaving}
                openSaving={openSaving}
                onBlockFormChange={handleBlockFormChange}
                onOpenFormChange={handleOpenFormChange}
                onCreateBlockedDate={handleCreateBlockedDate}
                onCreateOpenDate={handleCreateOpenDate}
                selectedFarmBlocks={selectedFarmBlocks}
                selectedFarmOpenDates={selectedFarmOpenDates}
                onDeleteBlockedDate={handleDeleteBlockedDate}
                onDeleteOpenDate={handleDeleteOpenDate}
                calendarDays={calendarDays}
                formatDateKey={formatDateKey}
                getCalendarDayStatus={getCalendarDayStatus}
                selectedFarm={selectedFarm}
                bookings={bookings}
                blockedDates={blockedDates}
                openDates={openDates}
                visibleMonth={visibleMonth}
                formatDate={formatDate}
            />

            <AdminBookingsSection
                bookingFilter={bookingFilter}
                setBookingFilter={setBookingFilter}
                quickFilters={quickFilters}
                filteredBookings={filteredBookings}
                blockedDates={blockedDates}
                bookings={bookings}
                downloadBookings={downloadBookings}
                onDeleteBlockedDate={handleDeleteBlockedDate}
                onBookingStatus={handleBookingStatus}
                onDeleteBooking={handleDeleteBooking}
                formatDate={formatDate}
                getGuests={getGuests}
                getBookingNetTotal={getBookingNetTotal}
            />
        </div>
    );
};

export default Admin;
