import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Download, MapPin } from 'lucide-react';
import API_URL from '../config';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';

const getGuestCount = (guests) => {
    if (!guests) return '-';
    if (typeof guests === 'object') {
        const adults = Number(guests.adults || 0);
        const children = Number(guests.children || 0);
        return children ? `${adults} adults, ${children} children` : `${adults} adults`;
    }
    return `${guests} guests`;
};

const getStatusBadge = (status = 'Pending') => {
    const normalized = status.toLowerCase();
    const styles = {
        confirmed: 'bg-[#eef7e9] text-[#3f6b3f] border-[#cfe4c8]',
        approved: 'bg-[#eef7e9] text-[#3f6b3f] border-[#cfe4c8]',
        pending: 'bg-[#fff6dd] text-[#8a642d] border-[#ead7b8]',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        cancelled: 'bg-red-50 text-red-700 border-red-200',
        completed: 'bg-[#f1eee7] text-[#645747] border-[#d8c9b7]'
    };

    return (
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${styles[normalized] || styles.pending}`}>
            {status}
        </span>
    );
};

const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/api/users/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredBookings = () => {
        const now = new Date();

        if (filter === 'upcoming') {
            return bookings.filter((booking) => new Date(booking.startDate) >= now && !['Cancelled', 'Rejected'].includes(booking.status));
        }

        if (filter === 'past') {
            return bookings.filter((booking) => new Date(booking.endDate) < now || ['Cancelled', 'Completed', 'Rejected'].includes(booking.status));
        }

        return bookings;
    };

    const filteredBookings = getFilteredBookings();

    const downloadBookings = () => {
        const headers = [
            'Booking ID',
            'Property',
            'Location',
            'Guest Name',
            'Guest Phone',
            'Guest Email',
            'Check-in',
            'Check-out',
            'Guests',
            'Base Price',
            'Tax',
            'Total',
            'Payment Status',
            'Booking Status',
            'Booked On'
        ];

        const rows = filteredBookings.map((booking) => [
            booking._id,
            booking.property?.title || booking.farm?.title || 'Unknown Property',
            booking.property?.location || booking.farm?.location || '',
            booking.guestDetails?.name || user?.name || '',
            booking.guestDetails?.phone || user?.phone || '',
            booking.guestDetails?.email || user?.email || '',
            formatDate(booking.startDate),
            formatDate(booking.endDate),
            getGuestCount(booking.guests),
            booking.totalPrice || 0,
            booking.tax || 0,
            Number(booking.totalPrice || 0) + Number(booking.tax || 0),
            booking.paymentStatus || 'Pending',
            booking.status || 'Pending',
            formatDate(booking.createdAt)
        ]);

        const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `brown-cows-bookings-${filter}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="py-20 text-center text-[#645747]">Loading bookings...</div>;
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a642d]">Brown Cows Dairy</p>
                    <h1 className="text-3xl font-bold text-[#211b14]">My Bookings</h1>
                    <p className="mt-2 text-[#645747]">Track every booking, approval status, guest detail, and payment status in one table.</p>
                </div>
                <button
                    onClick={downloadBookings}
                    disabled={filteredBookings.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-lg transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Download size={18} />
                    Download CSV
                </button>
            </div>

            {location.state?.bookingSuccess && (
                <div className="mb-6 rounded-2xl border border-[#cfe4c8] bg-[#f1f8ec] p-4 text-[#3f6b3f]">
                    {location.state?.message || 'Booking received. Your booking is pending admin approval.'}
                </div>
            )}

            <div className="mb-6 flex gap-2 overflow-x-auto border-b border-[#ead7b8]">
                {['all', 'upcoming', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`whitespace-nowrap px-4 pb-3 text-sm font-bold transition ${
                            filter === tab
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-[#645747] hover:text-[#211b14]'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {filteredBookings.length === 0 ? (
                <div className="rounded-3xl border border-[#ead7b8] bg-[#fffaf1] py-16 text-center">
                    <Calendar size={44} className="mx-auto mb-4 text-[#c8a978]" />
                    <p className="text-lg font-semibold text-[#211b14]">No bookings found</p>
                    <button
                        onClick={() => navigate('/farms')}
                        className="mt-5 rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-800"
                    >
                        Explore Farms
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-3xl border border-[#ead7b8] bg-[#fffaf1] shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="min-w-[1100px] w-full text-left text-sm">
                            <thead className="bg-[#f8efdf] text-xs uppercase tracking-[0.16em] text-[#7a5527]">
                                <tr>
                                    <th className="px-5 py-4">Property</th>
                                    <th className="px-5 py-4">Guest</th>
                                    <th className="px-5 py-4">Dates</th>
                                    <th className="px-5 py-4">Guests</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4">Payment</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Booked On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ead7b8]">
                                {filteredBookings.map((booking) => {
                                    const title = booking.property?.title || booking.farm?.title || 'Unknown Property';
                                    const location = booking.property?.location || booking.farm?.location || '';
                                    const total = Number(booking.totalPrice || 0) + Number(booking.tax || 0);

                                    return (
                                        <tr key={booking._id} className="bg-[#fffaf1] transition hover:bg-[#f8efdf]/70">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-[#211b14]">{title}</div>
                                                <div className="mt-1 flex items-center gap-1 text-xs text-[#645747]">
                                                    <MapPin size={13} />
                                                    {location || 'Brown Cows Dairy'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-[#211b14]">{booking.guestDetails?.name || user?.name || '-'}</div>
                                                <div className="text-xs text-[#645747]">{booking.guestDetails?.phone || user?.phone || '-'}</div>
                                                <div className="text-xs text-[#645747]">{booking.guestDetails?.email || user?.email || '-'}</div>
                                            </td>
                                            <td className="px-5 py-4 text-[#211b14]">
                                                <div>{formatDate(booking.startDate)}</div>
                                                <div className="text-xs text-[#645747]">to {formatDate(booking.endDate)}</div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-[#211b14]">{getGuestCount(booking.guests)}</td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-[#211b14]">Rs {total.toLocaleString('en-IN')}</div>
                                                <div className="text-xs text-[#645747]">Tax: Rs {Number(booking.tax || 0).toLocaleString('en-IN')}</div>
                                            </td>
                                            <td className="px-5 py-4 text-[#645747]">{booking.paymentStatus || 'Pending'}</td>
                                            <td className="px-5 py-4">{getStatusBadge(booking.status)}</td>
                                            <td className="px-5 py-4 text-[#645747]">{formatDate(booking.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
