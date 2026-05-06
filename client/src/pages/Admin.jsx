import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Ban, CalendarDays, ChevronLeft, ChevronRight, Loader, Plus, Trash2 } from 'lucide-react';
import API_URL from '../config';

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

const getCalendarDayStatus = (farm, date, bookings, blockedDates) => {
    if (!farm) return { type: 'available', label: 'Available', bookings: [] };

    const dayBookings = bookings.filter((booking) => (
        getBookingFarmId(booking) === farm._id
        && isActiveCalendarBooking(booking)
        && bookingIncludesDate(booking, date)
    ));
    const manualBlocks = blockedDates.filter((block) => (
        getBlockFarmId(block) === farm._id && blockIncludesDate(block, date)
    ));

    const booked = dayBookings.filter((booking) => ['Confirmed', 'Approved', 'Completed'].includes(booking.status));
    const pending = dayBookings.filter((booking) => booking.status === 'Pending');

    if (booked.length) return { type: 'booked', label: 'Booked', bookings: booked };
    if (pending.length) return { type: 'pending', label: 'Pending', bookings: pending };
    if (manualBlocks.length) return { type: 'blocked', label: 'Blocked', bookings: [], blocks: manualBlocks };
    if (isBlockedFarmDate(farm, date)) return { type: 'blocked', label: 'Blocked', bookings: [], blocks: [] };
    return { type: 'available', label: 'Available', bookings: [] };
};

const statusStyles = {
    booked: 'border-[#b9d8ae] bg-[#eef7e9] text-[#2f5f32]',
    pending: 'border-[#ead7b8] bg-[#fff6dd] text-[#8a642d]',
    blocked: 'border-[#ded6ca] bg-[#f1eee7] text-[#7b6a58]',
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

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [farms, setFarms] = useState([]);
    const [blockedDates, setBlockedDates] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState('');
    const [calendarMonth, setCalendarMonth] = useState(() => new Date());
    const [blockForm, setBlockForm] = useState({
        startDate: formatDateKey(new Date()),
        endDate: formatDateKey(new Date()),
        reason: ''
    });
    const [blockSaving, setBlockSaving] = useState(false);
    const [blockError, setBlockError] = useState('');
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

            await axios.put(`${API_URL}/api/admin/bookings/${bookingId}/status`, { status, rejectionReason }, authConfig());
            fetchData();
            alert(status === 'Rejected' ? 'Booking rejected and guest email sent if configured.' : 'Booking accepted and guest email sent if configured.');
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
            Number(b.totalPrice || 0) + Number(b.tax || 0),
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

    const selectedFarm = farms.find((farm) => farm._id === selectedFarmId);
    const calendarDays = getMonthGrid(calendarMonth);
    const visibleMonth = calendarMonth.getMonth();
    const calendarStats = calendarDays.reduce((stats, day) => {
        if (day.getMonth() !== visibleMonth) return stats;
        const status = getCalendarDayStatus(selectedFarm, day, bookings, blockedDates).type;
        stats[status] += 1;
        return stats;
    }, { booked: 0, pending: 0, blocked: 0, available: 0 });
    const selectedFarmBlocks = blockedDates
        .filter((block) => getBlockFarmId(block) === selectedFarmId)
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

    const handleBlockFormChange = (field, value) => {
        setBlockForm((current) => ({ ...current, [field]: value }));
        setBlockError('');
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

    return (
        <div className="mx-auto w-full max-w-7xl px-2 py-5 sm:px-4 sm:py-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-[#211b14]">Admin Dashboard</h1>
                <button
                    onClick={handleResetContent}
                    className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                >
                    Reset Website Content
                </button>
            </div>

            <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
                <h2 className="mb-4 text-xl font-bold text-gray-800">Registered Users ({users.length})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-[760px] w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="pb-2">Name</th>
                                <th className="pb-2">Email</th>
                                <th className="pb-2">Mobile</th>
                                <th className="pb-2">Email Verified</th>
                                <th className="pb-2">Role</th>
                                <th className="pb-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} className="border-b last:border-0">
                                    <td className="py-3 font-medium">{u.name}</td>
                                    <td className="py-3 text-gray-600">{u.email}</td>
                                    <td className="py-3 text-gray-600">{u.phone || '-'}</td>
                                    <td className="py-3 text-gray-600">{u.isEmailVerified ? 'Yes' : 'No'}</td>
                                    <td className="py-3">
                                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-[#eef7e9] text-[#3f6b3f]'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        {u.email !== 'admin@farmstay.com' && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <select
                                                    className="rounded border p-1 text-sm"
                                                    defaultValue={u.role}
                                                    onChange={(e) => {
                                                        if (e.target.value === 'custom') {
                                                            const newRole = prompt('Enter new role name:');
                                                            if (newRole) handleRoleUpdate(u._id, newRole.toLowerCase());
                                                        } else {
                                                            handleRoleUpdate(u._id, e.target.value);
                                                        }
                                                    }}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    {!['user', 'admin'].includes(u.role) && <option value={u.role}>{u.role}</option>}
                                                    <option value="custom">+ Add New Role</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteUser(u._id, u.email)}
                                                    className="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-8 rounded-xl border border-[#ead7b8] bg-white p-4 shadow-md sm:p-6">
                <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <div className="flex items-center gap-2 text-[#7a5527]">
                            <CalendarDays size={22} />
                            <h2 className="text-xl font-bold text-gray-800">Admin Calendar View</h2>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            View booked, pending, blocked, and available dates by farm.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                            value={selectedFarmId}
                            onChange={(event) => setSelectedFarmId(event.target.value)}
                            className="rounded-lg border border-[#ead7b8] bg-[#fffaf1] px-3 py-2 text-sm font-semibold text-[#211b14] outline-none focus:border-primary"
                        >
                            {farms.map((farm) => (
                                <option key={farm._id} value={farm._id}>
                                    {farm.title}
                                </option>
                            ))}
                        </select>

                        <div className="flex items-center justify-between rounded-lg border border-[#ead7b8] bg-[#fffaf1]">
                            <button
                                type="button"
                                onClick={() => shiftCalendarMonth(-1)}
                                className="p-2 text-[#7a5527] transition hover:bg-[#f8efdf]"
                                aria-label="Previous month"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="min-w-[150px] px-3 text-center text-sm font-bold text-[#211b14]">
                                {monthLabel(calendarMonth)}
                            </span>
                            <button
                                type="button"
                                onClick={() => shiftCalendarMonth(1)}
                                className="p-2 text-[#7a5527] transition hover:bg-[#f8efdf]"
                                aria-label="Next month"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {farms.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#ead7b8] bg-[#fffaf1] p-8 text-center text-gray-500">
                        No farms available for calendar view.
                    </div>
                ) : (
                    <>
                        <div className="mb-4 grid gap-2 sm:grid-cols-4">
                            {[
                                ['booked', 'Booked', calendarStats.booked],
                                ['pending', 'Pending', calendarStats.pending],
                                ['blocked', 'Blocked', calendarStats.blocked],
                                ['available', 'Available', calendarStats.available]
                            ].map(([key, label, count]) => (
                                <div key={key} className={`rounded-xl border px-3 py-2 text-sm font-bold ${statusStyles[key]}`}>
                                    <div>{label}</div>
                                    <div className="text-lg">{count}</div>
                                </div>
                            ))}
                        </div>

                        <div className="mb-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                            <form onSubmit={handleCreateBlockedDate} className="rounded-xl border border-[#ead7b8] bg-[#fffaf1] p-4">
                                <div className="mb-3 flex items-center gap-2 text-[#7a5527]">
                                    <Ban size={18} />
                                    <h3 className="font-bold text-[#211b14]">Block Dates Manually</h3>
                                </div>

                                {blockError && (
                                    <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                        {blockError}
                                    </div>
                                )}

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <label className="text-sm font-bold text-[#211b14]">
                                        Start Date
                                        <input
                                            type="date"
                                            value={blockForm.startDate}
                                            onChange={(event) => handleBlockFormChange('startDate', event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                                        />
                                    </label>
                                    <label className="text-sm font-bold text-[#211b14]">
                                        End Date
                                        <input
                                            type="date"
                                            min={blockForm.startDate}
                                            value={blockForm.endDate}
                                            onChange={(event) => handleBlockFormChange('endDate', event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                                        />
                                    </label>
                                    <label className="text-sm font-bold text-[#211b14]">
                                        Reason
                                        <input
                                            type="text"
                                            value={blockForm.reason}
                                            onChange={(event) => handleBlockFormChange('reason', event.target.value)}
                                            placeholder="Maintenance"
                                            className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                                        />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={blockSaving}
                                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {blockSaving ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
                                    Block Dates
                                </button>
                            </form>

                            <div className="rounded-xl border border-[#ead7b8] bg-[#fffaf1] p-4">
                                <h3 className="mb-3 font-bold text-[#211b14]">Manual Blocks</h3>
                                <div className="max-h-[210px] space-y-2 overflow-y-auto pr-1">
                                    {selectedFarmBlocks.length === 0 ? (
                                        <p className="rounded-lg border border-dashed border-[#ead7b8] bg-white p-3 text-sm text-gray-500">
                                            No manual blocks for this farm.
                                        </p>
                                    ) : (
                                        selectedFarmBlocks.map((block) => (
                                            <div key={block._id} className="flex items-start justify-between gap-3 rounded-lg border border-[#ead7b8] bg-white p-3">
                                                <div>
                                                    <div className="text-sm font-bold text-[#211b14]">
                                                        {formatDate(block.startDate)} to {formatDate(block.endDate)}
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {block.reason || 'Blocked by admin'}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteBlockedDate(block._id)}
                                                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                    aria-label="Delete blocked date"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-[#ead7b8]">
                            <div className="min-w-[760px] bg-[#fffaf1]">
                                <div className="grid grid-cols-7 border-b border-[#ead7b8] bg-[#f8efdf] text-center text-xs font-bold uppercase tracking-[0.14em] text-[#7a5527]">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="px-2 py-3">{day}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7">
                                    {calendarDays.map((day) => {
                                        const dayKey = formatDateKey(day);
                                        const status = getCalendarDayStatus(selectedFarm, day, bookings, blockedDates);
                                        const isMuted = day.getMonth() !== visibleMonth;
                                        const isToday = dayKey === formatDateKey(new Date());

                                        return (
                                            <div
                                                key={dayKey}
                                                className={`min-h-[118px] border-b border-r border-[#ead7b8] p-2 ${isMuted ? 'bg-[#f8efdf]/55 text-gray-400' : 'bg-white'}`}
                                            >
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-primary text-white' : 'text-[#211b14]'}`}>
                                                        {day.getDate()}
                                                    </span>
                                                    {!isMuted && (
                                                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyles[status.type]}`}>
                                                            {status.label}
                                                        </span>
                                                    )}
                                                </div>

                                                {!isMuted && status.bookings.slice(0, 2).map((booking) => (
                                                    <div key={booking._id} className="mb-1 truncate rounded-md bg-[#f8efdf] px-2 py-1 text-[11px] font-semibold text-[#211b14]">
                                                        {booking.guestDetails?.name || booking.user?.name || 'Guest'}
                                                    </div>
                                                ))}
                                                {!isMuted && status.bookings.length > 2 && (
                                                    <div className="text-[11px] font-semibold text-[#7a5527]">
                                                        +{status.bookings.length - 2} more
                                                    </div>
                                                )}
                                                {!isMuted && status.blocks?.slice(0, 1).map((block) => (
                                                    <div key={block._id} className="mb-1 truncate rounded-md bg-[#f1eee7] px-2 py-1 text-[11px] font-semibold text-[#7b6a58]">
                                                        {block.reason || 'Manual block'}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="rounded-xl border border-[#ead7b8] bg-white p-6 shadow-md">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {bookingFilter === 'blocked' ? 'Blocked Dates' : `Bookings Table (${filteredBookings.length})`}
                    </h2>
                    <button
                        onClick={downloadBookings}
                        disabled={bookings.length === 0}
                        className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Download Bookings CSV
                    </button>
                </div>

                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                    {quickFilters.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setBookingFilter(item.key)}
                            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                                bookingFilter === item.key
                                    ? 'border-primary bg-primary text-white shadow-md'
                                    : 'border-[#ead7b8] bg-[#fffaf1] text-[#7a5527] hover:border-primary'
                            }`}
                        >
                            {item.label} ({item.count})
                        </button>
                    ))}
                </div>

                {bookingFilter === 'blocked' ? (
                    <div className="overflow-x-auto rounded-xl border border-[#ead7b8]">
                        <table className="min-w-[760px] w-full text-left text-sm">
                            <thead className="bg-[#f8efdf] text-xs uppercase tracking-wide text-[#7a5527]">
                                <tr>
                                    <th className="px-4 py-3">Farm</th>
                                    <th className="px-4 py-3">Dates</th>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">Created By</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ead7b8]">
                                {blockedDates.map((block) => (
                                    <tr key={block._id} className="hover:bg-[#fffaf1]">
                                        <td className="px-4 py-3 font-bold text-gray-900">{block.farm?.title || 'Farm'}</td>
                                        <td className="px-4 py-3">{formatDate(block.startDate)} to {formatDate(block.endDate)}</td>
                                        <td className="px-4 py-3 text-gray-600">{block.reason || 'Blocked by admin'}</td>
                                        <td className="px-4 py-3 text-gray-600">{block.createdBy?.name || block.createdBy?.email || '-'}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteBlockedDate(block._id)}
                                                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {blockedDates.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">No blocked dates</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                <div className="overflow-x-auto rounded-xl border border-[#ead7b8]">
                    <table className="min-w-[1050px] w-full text-left text-sm">
                        <thead className="bg-[#f8efdf] text-xs uppercase tracking-wide text-[#7a5527]">
                            <tr>
                                <th className="px-4 py-3">Property</th>
                                <th className="px-4 py-3">Guest Details</th>
                                <th className="px-4 py-3">Dates</th>
                                <th className="px-4 py-3">Guests</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ead7b8]">
                            {filteredBookings.map((b) => (
                                <tr key={b._id} className="align-top hover:bg-[#fffaf1]">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-gray-900">{b.property?.title || b.propertyTitle || b.farm?.title || 'Unknown Property'}</div>
                                        <div className="text-xs text-gray-500">{b.property?.location || b.propertyLocation || b.farm?.location || ''}</div>
                                        <div className="mt-1 text-[11px] text-gray-400">ID: {b._id}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-900">{b.guestDetails?.name || b.user?.name || 'Unknown'}</div>
                                        <a href={`tel:${b.guestDetails?.phone}`} className="block text-primary hover:underline">{b.guestDetails?.phone || '-'}</a>
                                        <a href={`mailto:${b.guestDetails?.email || b.user?.email}`} className="block text-xs text-gray-500 hover:underline">{b.guestDetails?.email || b.user?.email || '-'}</a>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{formatDate(b.startDate)}</div>
                                        <div className="text-xs text-gray-500">to {formatDate(b.endDate)}</div>
                                        <div className="mt-1 text-xs text-gray-500">Booked: {formatDate(b.createdAt)}</div>
                                    </td>
                                    <td className="px-4 py-3">{getGuests(b.guests)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-primary">Rs {(Number(b.totalPrice || 0) + Number(b.tax || 0)).toLocaleString('en-IN')}</div>
                                        <div className="text-xs text-gray-500">Base Rs {Number(b.totalPrice || 0).toLocaleString('en-IN')}</div>
                                        <div className="text-xs text-gray-500">Tax Rs {Number(b.tax || 0).toLocaleString('en-IN')}</div>
                                    </td>
                                    <td className="px-4 py-3">{b.paymentStatus || 'Pending'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${b.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                b.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    b.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                            {b.status || 'Pending'}
                                        </span>
                                        {b.rejectionReason && (
                                            <div className="mt-2 rounded border border-red-100 bg-red-50 p-2 text-xs text-red-700">
                                                {b.rejectionReason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex min-w-[150px] flex-col gap-2">
                                            {b.status !== 'Confirmed' && b.status !== 'Completed' && (
                                                <>
                                                    <button onClick={() => handleBookingStatus(b._id, 'Confirmed')} className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition hover:bg-secondary-800">
                                                        Accept
                                                    </button>
                                                </>
                                            )}
                                            {b.status !== 'Rejected' && b.status !== 'Completed' && (
                                                <>
                                                    <button onClick={() => handleBookingStatus(b._id, 'Rejected')} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600">
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleDeleteBooking(b._id)} className="rounded-lg bg-gray-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="py-8 text-center text-gray-500">No recent bookings</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
