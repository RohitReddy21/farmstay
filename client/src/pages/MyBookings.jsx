import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Users, X, Clock } from 'lucide-react';
import API_URL from '../config';

const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, upcoming, past

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

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/users/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state
            setBookings(bookings.map(b =>
                b._id === bookingId ? { ...b, status: 'cancelled' } : b
            ));

            alert('Booking cancelled successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to cancel booking');
        }
    };

    const getFilteredBookings = () => {
        const now = new Date();

        if (filter === 'upcoming') {
            return bookings.filter(b => new Date(b.startDate) >= now && b.status !== 'cancelled');
        } else if (filter === 'past') {
            return bookings.filter(b => new Date(b.endDate) < now || b.status === 'cancelled' || b.status === 'completed');
        }
        return bookings;
    };

    const getStatusBadge = (status) => {
        const styles = {
            confirmed: 'bg-green-100 text-green-800 border-green-200',
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            completed: 'bg-blue-100 text-blue-800 border-blue-200'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredBookings = getFilteredBookings();

    if (loading) {
        return <div className="text-center py-20">Loading bookings...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
                {['all', 'upcoming', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`pb-3 px-4 font-medium transition-all ${filter === tab
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No bookings found</p>
                    <button
                        onClick={() => navigate('/farms')}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-all"
                    >
                        Explore Farms
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Farm Image */}
                                <div className="md:w-48 h-32 flex-shrink-0">
                                    <img
                                        src={booking.farm?.images?.[0] || 'https://via.placeholder.com/300'}
                                        alt={booking.farm?.title}
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {booking.farm?.title}
                                            </h3>
                                            <p className="text-gray-600 flex items-center gap-1 text-sm">
                                                <MapPin size={16} />
                                                {booking.farm?.location}
                                            </p>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                            <p className="font-semibold text-sm flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(booking.startDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                            <p className="font-semibold text-sm flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(booking.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Guests</p>
                                            <p className="font-semibold text-sm flex items-center gap-1">
                                                <Users size={14} />
                                                {booking.guests}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Total</p>
                                            <p className="font-semibold text-sm">₹{booking.totalPrice.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={14} />
                                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && new Date(booking.startDate) > new Date() && (
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleCancelBooking(booking._id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2 font-medium text-sm"
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;
