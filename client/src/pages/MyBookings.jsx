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
        <div className="max-w-6xl mx-auto py-6 md:py-8 px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8">My Bookings</h1>

            {/* Filter Tabs */}
            <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 border-b border-gray-200 overflow-x-auto">
                {['all', 'upcoming', 'past'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`pb-2 md:pb-3 px-3 md:px-4 font-medium transition-all whitespace-nowrap text-sm md:text-base ${filter === tab
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
                    <Calendar size={40} className="md:w-12 md:h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-base md:text-lg">No bookings found</p>
                    <button
                        onClick={() => navigate('/farms')}
                        className="mt-4 px-5 md:px-6 py-2 md:py-2 bg-primary text-white rounded-lg hover:bg-green-600 transition-all text-sm md:text-base"
                    >
                        Explore Farms
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking._id}
                            className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                {/* Farm Image */}
                                <div className="w-full md:w-48 h-40 md:h-32 flex-shrink-0">
                                    <img
                                        src={booking.farm?.images?.[0] || 'https://via.placeholder.com/300'}
                                        alt={booking.farm?.title}
                                        className="w-full h-full object-cover rounded-lg md:rounded-xl"
                                    />
                                </div>

                                {/* Booking Details */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                                                {booking.farm?.title}
                                            </h3>
                                            <p className="text-gray-600 flex items-center gap-1 text-xs md:text-sm">
                                                <MapPin size={14} className="md:w-4 md:h-4" />
                                                {booking.farm?.location}
                                            </p>
                                        </div>
                                        {getStatusBadge(booking.status)}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                            <p className="font-semibold text-xs md:text-sm flex items-center gap-1">
                                                <Calendar size={12} className="md:w-3.5 md:h-3.5" />
                                                {new Date(booking.startDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                            <p className="font-semibold text-xs md:text-sm flex items-center gap-1">
                                                <Calendar size={12} className="md:w-3.5 md:h-3.5" />
                                                {new Date(booking.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Guests</p>
                                            <p className="font-semibold text-xs md:text-sm flex items-center gap-1">
                                                <Users size={12} className="md:w-3.5 md:h-3.5" />
                                                {booking.guests}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Total</p>
                                            <p className="font-semibold text-xs md:text-sm">₹{booking.totalPrice.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={12} className="md:w-3.5 md:h-3.5" />
                                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                {booking.status !== 'cancelled' && booking.status !== 'completed' && new Date(booking.startDate) > new Date() && (
                                    <div className="flex items-center mt-3 md:mt-0">
                                        <button
                                            onClick={() => handleCancelBooking(booking._id)}
                                            className="w-full md:w-auto px-4 py-2 md:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center gap-2 font-medium text-sm"
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
