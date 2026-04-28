import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';
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

            const bookingsRes = await axios.get(`${API_URL}/api/admin/bookings`, authConfig());
            setBookings(bookingsRes.data);
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

            <div className="rounded-xl border border-[#ead7b8] bg-white p-6 shadow-md">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-xl font-bold text-gray-800">Bookings Table ({bookings.length})</h2>
                    <button
                        onClick={downloadBookings}
                        disabled={bookings.length === 0}
                        className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Download Bookings CSV
                    </button>
                </div>
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
                            {bookings.map((b) => (
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
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="py-8 text-center text-gray-500">No recent bookings</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Admin;
