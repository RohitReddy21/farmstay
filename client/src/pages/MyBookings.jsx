import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Loader, MapPin, MessageCircle, X } from 'lucide-react';
import API_URL from '../config';
import {
    getGuestBookingContact,
    getGuestBookingRefs,
    rememberGuestBooking,
    updateStoredGuestBooking
} from '../utils/guestBookings';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';
const formatCurrency = (amount) => `Rs ${Number(amount || 0).toLocaleString('en-IN')}`;

const formatDateInput = (date) => {
    if (!date) return '';
    const value = new Date(date);
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTodayInput = () => formatDateInput(new Date());

const getGuestCount = (guests) => {
    if (!guests) return '-';
    if (typeof guests === 'object') {
        const adults = Number(guests.adults || 0);
        const children = Number(guests.children || 0);
        return children ? `${adults} adults, ${children} children` : `${adults} adults`;
    }
    return `${guests} guests`;
};

const getGuestNumber = (guests) => {
    if (!guests) return 1;
    if (typeof guests === 'object') {
        return Math.max(1, Number(guests.adults || 0) + Number(guests.children || 0));
    }
    return Math.max(1, Number(guests) || 1);
};

const isEditableBooking = (booking) => {
    const closedStatuses = ['Cancelled', 'Completed', 'Rejected'];
    return formatDateInput(booking.startDate) >= getTodayInput() && !closedStatuses.includes(booking.status);
};

const getBookingGuestLimit = (booking) => {
    const variation = booking.property?.variations?.find((item) => (
        (booking.variation?.type && item.type === booking.variation.type)
        || (booking.variation?.label && item.label === booking.variation.label)
    ));
    return Number(variation?.capacity || booking.property?.capacity || 1);
};

const getBookingNightlyPrice = (booking) => {
    const variation = booking.property?.variations?.find((item) => (
        (booking.variation?.type && item.type === booking.variation.type)
        || (booking.variation?.label && item.label === booking.variation.label)
    ));

    if (variation?.price) return Number(variation.price);
    if (booking.property?.price) return Number(booking.property.price);

    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    return Math.round(Number(booking.totalPrice || 0) / nights);
};

const parseDateInput = (value) => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const calculateEditPricing = (booking, form) => {
    const oldSubtotal = Number(booking?.totalPrice || 0);
    const oldTax = Number(booking?.tax || 0);
    const oldTotal = oldSubtotal + oldTax;
    const nightlyPrice = getBookingNightlyPrice(booking);
    const start = parseDateInput(form?.startDate);
    const end = parseDateInput(form?.endDate);
    const nights = start && end && end > start
        ? Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        : 0;
    const newSubtotal = nights * nightlyPrice;
    const newTax = Math.round(newSubtotal * 0.18);
    const newTotal = newSubtotal + newTax;

    return {
        oldSubtotal,
        oldTax,
        oldTotal,
        nightlyPrice,
        nights,
        newSubtotal,
        newTax,
        newTotal,
        difference: newTotal - oldTotal
    };
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

const getBookingNumber = (booking) => booking?.bookingCode || booking?._id || '';

const getBookingWhatsAppUrl = (booking, action) => {
    const bookingNumber = getBookingNumber(booking);
    const title = booking?.property?.title || booking?.propertyTitle || booking?.farm?.title || 'Brown Cows Dairy booking';
    const dateText = `${formatDate(booking?.startDate)} to ${formatDate(booking?.endDate)}`;
    const message = action === 'cancel'
        ? `Hi, I want to cancel my Brown Cows Dairy booking. Booking Number: ${bookingNumber}. Stay: ${title}. Dates: ${dateText}.`
        : `Hi, I want to edit/reschedule my Brown Cows Dairy booking. Booking Number: ${bookingNumber}. Stay: ${title}. Dates: ${dateText}.`;

    return `https://wa.me/919989854411?text=${encodeURIComponent(message)}`;
};

const BookingWhatsAppActions = ({ booking, className = '' }) => (
    <div className={`grid gap-2 sm:grid-cols-2 ${className}`}>
        <a
            href={getBookingWhatsAppUrl(booking, 'edit')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7a5527] px-4 py-2.5 text-sm font-bold text-[#7a5527] transition hover:bg-[#fffaf1] dark:border-[#e7c678] dark:text-[#e7c678] dark:hover:bg-[#171d17]"
        >
            <MessageCircle size={15} />
            Edit Booking
        </a>
        <a
            href={getBookingWhatsAppUrl(booking, 'cancel')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
        >
            <MessageCircle size={15} />
            Cancel Booking
        </a>
    </div>
);

const MyBookings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [editingBooking, setEditingBooking] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editError, setEditError] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [guestBookingNumber, setGuestBookingNumber] = useState('');
    const [guestContact, setGuestContact] = useState('');
    const [guestLookupError, setGuestLookupError] = useState('');
    const [guestLookupLoading, setGuestLookupLoading] = useState(false);
    const [showGuestLookup, setShowGuestLookup] = useState(false);

    useEffect(() => {
        if (!user) {
            fetchGuestBookings();
            return;
        }

        fetchBookings();
    }, [user]);

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

    const fetchGuestBookings = async () => {
        const refs = getGuestBookingRefs();
        if (!refs.length) {
            setBookings([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const results = await Promise.allSettled(refs.map((item) => (
                axios.get(`${API_URL}/api/bookings/guest/${item.id}`, {
                    params: { contact: item.contact }
                })
            )));

            const loadedBookings = results
                .filter((result) => result.status === 'fulfilled')
                .map((result) => result.value.data);

            loadedBookings.forEach(updateStoredGuestBooking);
            setBookings(loadedBookings);
        } catch (error) {
            console.error('Error fetching guest bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const lookupGuestBooking = async (event) => {
        event.preventDefault();
        setGuestLookupError('');

        const bookingNumber = guestBookingNumber.trim();
        const contact = guestContact.trim();
        if (!bookingNumber || !contact) {
            setGuestLookupError('Enter your booking number and phone/email.');
            return;
        }

        try {
            setGuestLookupLoading(true);
            const { data } = await axios.get(`${API_URL}/api/bookings/guest/${bookingNumber}`, {
                params: { contact }
            });
            setBookings([data]);
            rememberGuestBooking({ bookingId: data._id, contact, booking: data });
            sessionStorage.setItem('guest_booking_lookup', JSON.stringify({
                id: data._id,
                contact,
                booking: data
            }));
        } catch (error) {
            setBookings([]);
            setGuestLookupError(error.response?.data?.message || 'Could not find a booking with those details.');
        } finally {
            setGuestLookupLoading(false);
        }
    };

    const openEditBooking = (booking) => {
        setEditingBooking(booking);
        setEditForm({
            startDate: formatDateInput(booking.startDate),
            endDate: formatDateInput(booking.endDate),
            guests: getGuestNumber(booking.guests),
            name: booking.guestDetails?.name || user?.name || '',
            phone: booking.guestDetails?.phone || user?.phone || '',
            email: booking.guestDetails?.email || user?.email || ''
        });
        setEditError('');
    };

    const closeEditBooking = () => {
        if (editSaving) return;
        setEditingBooking(null);
        setEditForm(null);
        setEditError('');
    };

    const handleEditChange = (field, value) => {
        setEditForm((current) => ({ ...current, [field]: value }));
        setEditError('');
    };

    const saveBookingEdit = async (event) => {
        event.preventDefault();
        if (!editingBooking || !editForm) return;

        const guestLimit = getBookingGuestLimit(editingBooking);
        const guestCount = Number(editForm.guests);
        const phoneDigits = String(editForm.phone || '').replace(/\D/g, '');

        if (!editForm.startDate || !editForm.endDate) {
            setEditError('Please select check-in and check-out dates.');
            return;
        }

        if (new Date(editForm.endDate) <= new Date(editForm.startDate)) {
            setEditError('Check-out date must be after check-in date.');
            return;
        }

        if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > guestLimit) {
            setEditError(`Maximum ${guestLimit} guests allowed for this stay.`);
            return;
        }

        if (!editForm.name.trim()) {
            setEditError('Please enter the guest name.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(String(editForm.email || '').trim())) {
            setEditError('Please enter the booking email.');
            return;
        }

        if (phoneDigits.length !== 10) {
            setEditError('Mobile number must be exactly 10 digits.');
            return;
        }

        try {
            setEditSaving(true);
            const payload = {
                startDate: editForm.startDate,
                endDate: editForm.endDate,
                guests: guestCount,
                guestDetails: {
                    name: editForm.name.trim(),
                    phone: phoneDigits,
                    email: String(editForm.email || '').trim().toLowerCase()
                }
            };
            const guestEditContact = getGuestBookingContact(editingBooking._id);
            const { data } = user
                ? await axios.put(`${API_URL}/api/users/bookings/${editingBooking._id}`, payload, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                : await axios.put(`${API_URL}/api/bookings/guest/${editingBooking._id}`, {
                    ...payload,
                    contact: guestEditContact || editForm.email || editForm.phone
                });

            setBookings((current) => current.map((booking) => (
                booking._id === editingBooking._id ? data.booking : booking
            )));
            updateStoredGuestBooking(data.booking);
            setEditingBooking(null);
            setEditForm(null);
            setEditError('');
        } catch (error) {
            setEditError(error.response?.data?.message || 'Could not update booking. Please try again.');
        } finally {
            setEditSaving(false);
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

    if (loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 space-y-3">
                    <div className="h-4 w-40 animate-pulse rounded bg-[#ead7b8]" />
                    <div className="h-9 w-56 animate-pulse rounded bg-[#ead7b8]" />
                    <div className="h-5 w-full max-w-md animate-pulse rounded bg-[#f1e3cc]" />
                </div>
                <div className="space-y-4 md:hidden">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-4 shadow-md">
                            <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-[#ead7b8]" />
                            <div className="mb-3 grid grid-cols-2 gap-3">
                                <div className="h-20 animate-pulse rounded-xl bg-[#f1e3cc]" />
                                <div className="h-20 animate-pulse rounded-xl bg-[#f1e3cc]" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 animate-pulse rounded bg-[#f1e3cc]" />
                                <div className="h-4 w-4/5 animate-pulse rounded bg-[#f1e3cc]" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="hidden rounded-3xl border border-[#ead7b8] bg-[#fffaf1] p-5 shadow-xl md:block">
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="grid grid-cols-6 gap-4">
                                {Array.from({ length: 6 }).map((__, cell) => (
                                    <div key={cell} className="h-10 animate-pulse rounded bg-[#f1e3cc]" />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        const guestBooking = bookings[0];
        const guestTotal = guestBooking
            ? Number(guestBooking.totalPrice || 0) + Number(guestBooking.tax || 0)
            : 0;

        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <div className="rounded-3xl border border-[#ead7b8] bg-[#fffaf1] p-6 shadow-xl dark:border-[#31392f] dark:bg-[#151b15] sm:p-10">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ead8] text-[#7a5527] dark:bg-[#232823] dark:text-[#e7c678]">
                        <Calendar size={30} />
                    </div>
                    <div className="text-center">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a642d] dark:text-[#e7c678]">Brown Cows Dairy</p>
                        <h1 className="text-3xl font-bold text-[#211b14] dark:text-[#fff8ea]">My Bookings</h1>
                        <p className="mx-auto mt-3 max-w-xl text-[#645747] dark:text-[#d5c9b7]">
                            Bookings made on this device appear here automatically. You can open details or edit eligible upcoming bookings without logging in.
                        </p>
                    </div>

                    {bookings.length > 0 && (
                        <div className="mt-7 space-y-4">
                            {bookings.map((booking) => {
                                const total = Number(booking.totalPrice || 0) + Number(booking.tax || 0);
                                return (
                                    <div key={booking._id} className="rounded-2xl border border-[#ead7b8] bg-[#f8efdf] p-4 dark:border-[#31392f] dark:bg-[#232823]">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a642d] dark:text-[#e7c678]">Booking Number</p>
                                                <p className="mt-1 break-all text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">{booking.bookingCode || booking._id}</p>
                                                <h2 className="mt-3 text-xl font-bold text-[#211b14] dark:text-[#fff8ea]">
                                                    {booking.property?.title || booking.propertyTitle || 'Brown Cows Dairy Stay'}
                                                </h2>
                                                <p className="mt-1 text-sm text-[#645747] dark:text-[#d5c9b7]">
                                                    {formatDate(booking.startDate)} to {formatDate(booking.endDate)} · {formatCurrency(total)}
                                                </p>
                                            </div>
                                            {getStatusBadge(booking.status)}
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    sessionStorage.setItem('guest_booking_lookup', JSON.stringify({
                                                        id: booking._id,
                                                        contact: getGuestBookingContact(booking._id),
                                                        booking
                                                    }));
                                                    navigate(`/bookings/${booking._id}`);
                                                }}
                                                className="flex-1 rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary-800"
                                            >
                                                Open Details
                                            </button>
                                        </div>
                                        <BookingWhatsAppActions booking={booking} className="mt-3" />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {(showGuestLookup || bookings.length === 0) && (
                    <form onSubmit={lookupGuestBooking} className="mt-7 space-y-4 rounded-2xl border border-[#ead7b8] bg-white/70 p-4 dark:border-[#31392f] dark:bg-[#1a2118]">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-[#7a5527] dark:text-[#e7c678]">Booking Number</label>
                            <input
                                type="text"
                                value={guestBookingNumber}
                                onChange={(event) => setGuestBookingNumber(event.target.value)}
                                placeholder="Paste booking number from email"
                                className="w-full rounded-xl border border-[#dfd1bb] px-4 py-3 text-[#211b14] outline-none focus:border-[#7a5527] dark:border-[#31392f] dark:bg-[#232823] dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-bold text-[#7a5527] dark:text-[#e7c678]">Phone or Email used for booking</label>
                            <input
                                type="text"
                                value={guestContact}
                                onChange={(event) => setGuestContact(event.target.value)}
                                placeholder="10-digit phone or email"
                                className="w-full rounded-xl border border-[#dfd1bb] px-4 py-3 text-[#211b14] outline-none focus:border-[#7a5527] dark:border-[#31392f] dark:bg-[#232823] dark:text-white"
                            />
                        </div>
                        {guestLookupError && (
                            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                {guestLookupError}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={guestLookupLoading}
                            className="w-full rounded-xl bg-[#7a5527] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#5d3d19] disabled:opacity-60"
                        >
                            {guestLookupLoading ? 'Checking...' : 'View Booking'}
                        </button>
                    </form>
                    )}

                    {showGuestLookup && guestBooking && (
                        <div className="mt-5 rounded-2xl border border-[#ead7b8] bg-[#f8efdf] p-4 dark:border-[#31392f] dark:bg-[#232823]">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a642d] dark:text-[#e7c678]">Booking found</p>
                                    <h2 className="mt-1 text-xl font-bold text-[#211b14] dark:text-[#fff8ea]">
                                        {guestBooking.property?.title || guestBooking.propertyTitle || 'Brown Cows Dairy Stay'}
                                    </h2>
                                    <p className="mt-1 text-sm text-[#645747] dark:text-[#d5c9b7]">
                                        {formatDate(guestBooking.startDate)} to {formatDate(guestBooking.endDate)} · {formatCurrency(guestTotal)}
                                    </p>
                                </div>
                                {getStatusBadge(guestBooking.status)}
                            </div>
                            <button
                                type="button"
                                onClick={() => navigate(`/bookings/${guestBooking._id}`)}
                                className="mt-4 w-full rounded-xl border border-[#7a5527] px-5 py-3 font-bold text-[#7a5527] transition hover:bg-[#fffaf1] dark:border-[#e7c678] dark:text-[#e7c678] dark:hover:bg-[#171d17]"
                            >
                                Open Full Details
                            </button>
                            <BookingWhatsAppActions booking={guestBooking} className="mt-3" />
                        </div>
                    )}

                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <button
                            onClick={() => setShowGuestLookup((current) => !current)}
                            className="rounded-xl bg-[#7a5527] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#5d3d19]"
                        >
                            {showGuestLookup ? 'Hide Manual Search' : 'Find Another Booking'}
                        </button>
                        <a
                            href="https://wa.me/919989854411?text=Hi%2C+I+want+to+check+my+booking+status.+My+booking+number+is+"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl border border-[#7a5527] px-6 py-3 font-bold text-[#7a5527] transition hover:bg-[#f4ead8] dark:border-[#e7c678] dark:text-[#e7c678] dark:hover:bg-[#232823]"
                        >
                            Check by WhatsApp
                        </a>
                    </div>

                    {editingBooking && editForm && (
                        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
                            <form
                                onSubmit={saveBookingEdit}
                                className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[#ead7b8] bg-[#fffaf1] p-5 shadow-2xl sm:rounded-3xl sm:p-6"
                            >
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a642d]">Edit Booking</p>
                                        <h2 className="mt-1 text-2xl font-bold text-[#211b14]">
                                            {editingBooking.property?.title || editingBooking.propertyTitle || 'Farm Stay'}
                                        </h2>
                                        <p className="mt-1 text-sm text-[#645747]">
                                            Your saved booking contact is used to verify this edit.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={closeEditBooking}
                                        className="rounded-full border border-[#ead7b8] p-2 text-[#645747] transition hover:bg-[#f8efdf]"
                                        aria-label="Close edit booking"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {editError && (
                                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                        {editError}
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-bold text-[#211b14]">
                                        Check-in
                                        <input
                                            type="date"
                                            min={getTodayInput()}
                                            value={editForm.startDate}
                                            onChange={(event) => handleEditChange('startDate', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                        />
                                    </label>
                                    <label className="text-sm font-bold text-[#211b14]">
                                        Check-out
                                        <input
                                            type="date"
                                            min={editForm.startDate || getTodayInput()}
                                            value={editForm.endDate}
                                            onChange={(event) => handleEditChange('endDate', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                        />
                                    </label>
                                </div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-bold text-[#211b14]">
                                        Guest Name
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(event) => handleEditChange('name', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                        />
                                    </label>
                                    <label className="text-sm font-bold text-[#211b14]">
                                        Mobile Number
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={editForm.phone}
                                            onChange={(event) => handleEditChange('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                        />
                                    </label>
                                </div>

                                <label className="mt-4 block text-sm font-bold text-[#211b14]">
                                    Booking Email
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(event) => handleEditChange('email', event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                    />
                                </label>

                                <label className="mt-4 block text-sm font-bold text-[#211b14]">
                                    Number of Guests
                                    <input
                                        type="number"
                                        min="1"
                                        max={getBookingGuestLimit(editingBooking)}
                                        value={editForm.guests}
                                        onChange={(event) => handleEditChange('guests', event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                    />
                                    <span className="mt-1 block text-xs font-medium text-[#8b7a66]">
                                        Maximum {getBookingGuestLimit(editingBooking)} guests
                                    </span>
                                </label>

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeEditBooking}
                                        className="rounded-xl border border-[#8a642d] px-5 py-3 font-bold text-[#7a5527] transition hover:bg-[#f8efdf]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editSaving}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary-800 disabled:opacity-60"
                                    >
                                        {editSaving && <Loader size={18} className="animate-spin" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="mb-8">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a642d]">Brown Cows Dairy</p>
                    <h1 className="text-3xl font-bold text-[#211b14]">My Bookings</h1>
                    <p className="mt-2 text-[#645747]">Track every booking, approval status, guest detail, and payment status in one table.</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ead7b8] bg-[#fffaf1] px-4 py-2 text-sm font-semibold text-[#7a5527]">
                        <MessageCircle size={16} />
                        Need to cancel? Contact us on WhatsApp or email.
                    </p>
                </div>
            </div>

            {location.state?.bookingSuccess && (
                <div className="mb-6 rounded-2xl border border-[#cfe4c8] bg-[#f1f8ec] p-4 text-[#3f6b3f]">
                    {location.state?.message || 'Booking received. Your booking is pending approval.'}
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
                <>
                    <div className="space-y-4 md:hidden">
                        {filteredBookings.map((booking, index) => {
                            const title = booking.property?.title || booking.propertyTitle || booking.farm?.title || 'Unknown Property';
                            const location = booking.property?.location || booking.propertyLocation || booking.farm?.location || '';
                            const total = Number(booking.totalPrice || 0) + Number(booking.tax || 0);
                            const isLast = index === filteredBookings.length - 1;

                            return (
                                <div key={booking._id} className="relative pl-8">
                                    {!isLast && (
                                        <div className="absolute left-[11px] top-7 h-[calc(100%+1rem)] w-px bg-[#ead7b8]" />
                                    )}
                                    <div className="absolute left-0 top-5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#ead7b8] bg-[#fffaf1]">
                                        <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                    </div>

                                    <article className="rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-4 shadow-md">
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h2 className="text-lg font-bold leading-tight text-[#211b14]">{title}</h2>
                                                <div className="mt-1 flex items-center gap-1 text-xs text-[#645747]">
                                                    <MapPin size={13} className="shrink-0" />
                                                    <span className="truncate">{location || 'Brown Cows Dairy'}</span>
                                                </div>
                                            </div>
                                            {getStatusBadge(booking.status)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#ead7b8] bg-white p-3">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a642d]">Check-in</p>
                                                <p className="mt-1 font-bold text-[#211b14]">{formatDate(booking.startDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a642d]">Check-out</p>
                                                <p className="mt-1 font-bold text-[#211b14]">{formatDate(booking.endDate)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid gap-3 text-sm">
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-[#645747]">Guest</span>
                                                <span className="text-right font-semibold text-[#211b14]">
                                                    {booking.guestDetails?.name || user?.name || '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-[#645747]">Phone</span>
                                                <span className="text-right font-semibold text-[#211b14]">
                                                    {booking.guestDetails?.phone || user?.phone || '-'}
                                                </span>
                                            </div>
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-[#645747]">Guests</span>
                                                <span className="text-right font-semibold text-[#211b14]">{getGuestCount(booking.guests)}</span>
                                            </div>
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="text-[#645747]">Payment</span>
                                                <span className="text-right font-semibold text-[#211b14]">{booking.paymentStatus || 'Pending'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl bg-[#f8efdf] p-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm font-semibold text-[#645747]">Total</span>
                                                <span className="text-lg font-bold text-primary">Rs {total.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="mt-1 flex items-center justify-between gap-4 text-xs text-[#8b7a66]">
                                                <span>Tax</span>
                                                <span>Rs {Number(booking.tax || 0).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3">
                                            <span className="text-xs font-semibold text-[#8b7a66]">
                                                Booked {formatDate(booking.createdAt)}
                                            </span>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/bookings/${booking._id}`)}
                                                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-800"
                                                >
                                                    Details
                                                </button>
                                                <BookingWhatsAppActions booking={booking} className="flex-1 sm:grid-cols-2" />
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden overflow-hidden rounded-3xl border border-[#ead7b8] bg-[#fffaf1] shadow-xl md:block">
                        <div className="overflow-x-auto">
                        <table className="min-w-[1220px] w-full text-left text-sm">
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
                                    <th className="px-5 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ead7b8]">
                                {filteredBookings.map((booking) => {
                                    const title = booking.property?.title || booking.propertyTitle || booking.farm?.title || 'Unknown Property';
                                    const location = booking.property?.location || booking.propertyLocation || booking.farm?.location || '';
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
                                            <td className="px-5 py-4">
                                                <div className="flex min-w-[190px] flex-col gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/bookings/${booking._id}`)}
                                                        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-800"
                                                    >
                                                        Details
                                                    </button>
                                                    <BookingWhatsAppActions booking={booking} className="grid-cols-1" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </>
            )}

            {editingBooking && editForm && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4">
                    <form
                        onSubmit={saveBookingEdit}
                        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[#ead7b8] bg-[#fffaf1] p-5 shadow-2xl sm:rounded-3xl sm:p-6"
                    >
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a642d]">Edit Booking</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#211b14]">
                                    {editingBooking.property?.title || editingBooking.propertyTitle || 'Farm Stay'}
                                </h2>
                                <p className="mt-1 text-sm text-[#645747]">
                                    Cancellation requests are handled by Brown Cows Dairy support.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditBooking}
                                className="rounded-full border border-[#ead7b8] p-2 text-[#645747] transition hover:bg-[#f8efdf]"
                                aria-label="Close edit booking"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {editError && (
                            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                {editError}
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-bold text-[#211b14]">
                                Check-in
                                <input
                                    type="date"
                                    min={getTodayInput()}
                                    value={editForm.startDate}
                                    onChange={(event) => handleEditChange('startDate', event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                />
                            </label>

                            <label className="text-sm font-bold text-[#211b14]">
                                Check-out
                                <input
                                    type="date"
                                    min={editForm.startDate || getTodayInput()}
                                    value={editForm.endDate}
                                    onChange={(event) => handleEditChange('endDate', event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                />
                            </label>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <label className="text-sm font-bold text-[#211b14]">
                                Guest Name
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(event) => handleEditChange('name', event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                />
                            </label>

                            <label className="text-sm font-bold text-[#211b14]">
                                Mobile Number
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    value={editForm.phone}
                                    onChange={(event) => handleEditChange('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                                />
                            </label>
                        </div>

                        <label className="mt-4 block text-sm font-bold text-[#211b14]">
                            Booking Email
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={(event) => handleEditChange('email', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                            />
                        </label>

                        <label className="mt-4 block text-sm font-bold text-[#211b14]">
                            Number of Guests
                            <input
                                type="number"
                                min="1"
                                max={getBookingGuestLimit(editingBooking)}
                                value={editForm.guests}
                                onChange={(event) => handleEditChange('guests', event.target.value)}
                                className="mt-2 w-full rounded-xl border border-[#ead7b8] bg-white px-4 py-3 text-base outline-none transition focus:border-[#8a642d] focus:ring-2 focus:ring-[#ead7b8]"
                            />
                            <span className="mt-1 block text-xs font-medium text-[#8b7a66]">
                                Maximum {getBookingGuestLimit(editingBooking)} guests
                            </span>
                        </label>

                        {(() => {
                            const pricing = calculateEditPricing(editingBooking, editForm);
                            const isValidDateRange = pricing.nights > 0;
                            const differenceTone = pricing.difference > 0
                                ? 'text-[#8a642d]'
                                : pricing.difference < 0
                                    ? 'text-[#3f6b3f]'
                                    : 'text-[#645747]';

                            return (
                                <div className="mt-5 rounded-2xl border border-[#ead7b8] bg-[#f8efdf] p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a642d]">Price Breakdown</p>
                                            <p className="mt-1 text-sm text-[#645747]">
                                                {isValidDateRange
                                                    ? `${pricing.nights} night${pricing.nights === 1 ? '' : 's'} at ${formatCurrency(pricing.nightlyPrice)} / night`
                                                    : 'Select valid dates to preview the new amount.'}
                                            </p>
                                        </div>
                                        <div className={`rounded-full bg-white px-3 py-1 text-xs font-bold ${differenceTone}`}>
                                            {pricing.difference === 0
                                                ? 'No change'
                                                : `${pricing.difference > 0 ? '+' : '-'}${formatCurrency(Math.abs(pricing.difference))}`}
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl border border-[#ead7b8] bg-white p-3">
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8b7a66]">Current Amount</p>
                                            <div className="mt-3 space-y-2 text-sm text-[#645747]">
                                                <div className="flex justify-between gap-3">
                                                    <span>Subtotal</span>
                                                    <span>{formatCurrency(pricing.oldSubtotal)}</span>
                                                </div>
                                                <div className="flex justify-between gap-3">
                                                    <span>Tax</span>
                                                    <span>{formatCurrency(pricing.oldTax)}</span>
                                                </div>
                                                <div className="border-t border-[#ead7b8] pt-2 font-bold text-[#211b14]">
                                                    <div className="flex justify-between gap-3">
                                                        <span>Total</span>
                                                        <span>{formatCurrency(pricing.oldTotal)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-[#8a642d]/30 bg-white p-3">
                                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8a642d]">New Amount</p>
                                            <div className="mt-3 space-y-2 text-sm text-[#645747]">
                                                <div className="flex justify-between gap-3">
                                                    <span>Subtotal</span>
                                                    <span>{isValidDateRange ? formatCurrency(pricing.newSubtotal) : '-'}</span>
                                                </div>
                                                <div className="flex justify-between gap-3">
                                                    <span>Tax</span>
                                                    <span>{isValidDateRange ? formatCurrency(pricing.newTax) : '-'}</span>
                                                </div>
                                                <div className="border-t border-[#ead7b8] pt-2 font-bold text-[#211b14]">
                                                    <div className="flex justify-between gap-3">
                                                        <span>Total</span>
                                                        <span>{isValidDateRange ? formatCurrency(pricing.newTotal) : '-'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <a
                                href="https://wa.me/919989854411?text=Hi%2C%20I%20need%20help%20with%20my%20Brown%20Cows%20Dairy%20booking."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex justify-center rounded-xl border border-[#8a642d] px-5 py-3 font-bold text-[#7a5527] transition hover:bg-[#f8efdf]"
                            >
                                Contact for cancellation
                            </a>
                            <button
                                type="submit"
                                disabled={editSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {editSaving && <Loader size={18} className="animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MyBookings;
