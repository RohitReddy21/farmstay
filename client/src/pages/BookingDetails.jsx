import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { CalendarDays, ChevronLeft, CreditCard, Hash, MapPin, Phone, UserRound, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import { getGuestBookingContact, updateStoredGuestBooking } from '../utils/guestBookings';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';
const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const getGuestCount = (guests) => {
    if (!guests) return '-';
    if (typeof guests === 'object') {
        const adults = Number(guests.adults || 0);
        const children = Number(guests.children || 0);
        return children ? `${adults} adults, ${children} children` : `${adults} adults`;
    }
    return `${guests} guests`;
};

const statusClass = (status = 'Pending') => {
    const normalized = status.toLowerCase();
    if (['confirmed', 'approved'].includes(normalized)) return 'border-[#cfe4c8] bg-[#eef7e9] text-[#3f6b3f]';
    if (normalized === 'pending') return 'border-[#ead7b8] bg-[#fff6dd] text-[#8a642d]';
    if (['rejected', 'cancelled'].includes(normalized)) return 'border-red-200 bg-red-50 text-red-700';
    return 'border-[#d8c9b7] bg-[#f1eee7] text-[#645747]';
};

const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="rounded-2xl border border-[#ead7b8] bg-white p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8a642d]">
            <Icon size={15} />
            {label}
        </div>
        <div className="font-bold text-[#211b14]">{value}</div>
    </div>
);

const BookingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            const fetchGuestBooking = async () => {
                try {
                    const storedLookup = JSON.parse(sessionStorage.getItem('guest_booking_lookup') || '{}');
                    const contact = storedLookup?.id === id
                        ? storedLookup.contact
                        : getGuestBookingContact(id);

                    if (!contact && storedLookup?.id === id && storedLookup?.booking) {
                        setBooking(storedLookup.booking);
                        return;
                    }

                    if (!contact) {
                        setBooking(null);
                        return;
                    }

                    const { data } = await axios.get(`${API_URL}/api/bookings/guest/${id}`, {
                        params: { contact }
                    });
                    updateStoredGuestBooking(data);
                    setBooking(data);
                } catch (error) {
                    console.error('Error fetching guest booking details:', error);
                    setBooking(null);
                } finally {
                    setLoading(false);
                }
            };

            fetchGuestBooking();
            return;
        }

        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/api/users/bookings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBooking(data.find((item) => item._id === id) || null);
            } catch (error) {
                console.error('Error fetching booking details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id, user]);

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-5 h-10 w-32 animate-pulse rounded-xl bg-[#ead7b8]" />
                <div className="rounded-3xl border border-[#ead7b8] bg-[#fffaf1] p-5">
                    <div className="mb-5 h-8 w-2/3 animate-pulse rounded bg-[#ead7b8]" />
                    <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-24 animate-pulse rounded-2xl bg-[#f1e3cc]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-[#211b14]">Booking not found</h1>
                <button onClick={() => navigate('/bookings')} className="mt-5 rounded-xl bg-primary px-5 py-3 font-bold text-white">
                    Back to My Bookings
                </button>
            </div>
        );
    }

    const title = booking.property?.title || booking.propertyTitle || 'Brown Cows Dairy Stay';
    const location = booking.property?.location || booking.propertyLocation || 'Brown Cows Dairy';
    const total = Number(booking.totalPrice || 0) + Number(booking.tax || 0);

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#7a5527] hover:underline"
            >
                <ChevronLeft size={18} />
                Back to My Bookings
            </button>

            <div className="overflow-hidden rounded-3xl border border-[#ead7b8] bg-[#fffaf1] shadow-xl">
                <div className="border-b border-[#ead7b8] bg-[#f8efdf] p-5 sm:p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a642d]">Booking Details</p>
                            <h1 className="mt-2 text-2xl font-bold text-[#211b14] sm:text-3xl">{title}</h1>
                            <p className="mt-2 flex items-center gap-2 text-[#645747]">
                                <MapPin size={16} />
                                {location}
                            </p>
                        </div>
                        <span className={`w-fit rounded-full border px-4 py-2 text-sm font-bold ${statusClass(booking.status)}`}>
                            {booking.status || 'Pending'}
                        </span>
                    </div>
                </div>

                <div className="p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <DetailRow icon={CalendarDays} label="Check-in" value={formatDate(booking.startDate)} />
                        <DetailRow icon={CalendarDays} label="Check-out" value={formatDate(booking.endDate)} />
                        <DetailRow icon={Hash} label="Booking Number" value={booking.bookingCode || booking._id} />
                        <DetailRow icon={UserRound} label="Guest Name" value={booking.guestDetails?.name || user?.name || '-'} />
                        <DetailRow icon={Phone} label="Phone" value={booking.guestDetails?.phone || user?.phone || '-'} />
                        <DetailRow icon={Users} label="Guests" value={getGuestCount(booking.guests)} />
                        <DetailRow icon={CreditCard} label="Payment" value={`${booking.paymentStatus || 'Pending'} · ${booking.paymentMethod || 'Razorpay'}`} />
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#ead7b8] bg-[#f8efdf] p-5">
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <span className="font-semibold text-[#645747]">Subtotal</span>
                            <span className="font-bold text-[#211b14]">{formatCurrency(booking.totalPrice)}</span>
                        </div>
                        <div className="mb-3 flex items-center justify-between gap-4">
                            <span className="font-semibold text-[#645747]">Tax</span>
                            <span className="font-bold text-[#211b14]">{formatCurrency(booking.tax)}</span>
                        </div>
                        <div className="border-t border-[#ead7b8] pt-3">
                            <div className="flex items-center justify-between gap-4 text-lg">
                                <span className="font-bold text-[#211b14]">Total</span>
                                <span className="font-bold text-primary">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[#ead7b8] bg-white p-4 text-sm text-[#645747]">
                        For cancellation requests, contact Brown Cows Dairy support by WhatsApp or email. Eligible upcoming bookings can be edited from the My Bookings page.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;
