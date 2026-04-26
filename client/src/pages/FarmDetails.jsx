import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Check, ChevronLeft, ChevronRight, AlertCircle, X, Play } from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';

import API_URL from '../config';
import FavoriteButton from '../components/FavoriteButton';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import BookingConfirmationModal from '../components/BookingConfirmationModal';

const FarmDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [farm, setFarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [allMedia, setAllMedia] = useState([]); // Combined images and videos
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [dateConflict, setDateConflict] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [eligibleBookingId, setEligibleBookingId] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);
    const [showLightbox, setShowLightbox] = useState(false);
    const [dateSelection, setDateSelection] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [bookingData, setBookingData] = useState({
        guests: 1,
        guestName: '',
        guestPhone: ''
    });

    // Combine images and videos into a single media array
    const combineMedia = (farmData) => {
        const images = (farmData.images || []).map(img => ({ type: 'image', url: img }));
        const videos = (farmData.videos || []).map(vid => ({ type: 'video', url: vid }));
        return [...images, ...videos];
    };

    const isVideoFileUrl = (url) => {
        const u = String(url || '');
        return (
            /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(u) ||
            u.includes('/video/upload/') ||
            u.includes('resource_type=video')
        );
    };

    const toYouTubeEmbedUrl = (rawUrl) => {
        const url = String(rawUrl || '').trim();
        if (!url) return '';

        try {
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
            // ignore
        }

        return url;
    };

    const buildEmbedSrc = (rawUrl, controls) => {
        const embedUrl = toYouTubeEmbedUrl(rawUrl);
        if (!embedUrl) return '';
        const sep = embedUrl.includes('?') ? '&' : '?';
        return `${embedUrl}${sep}controls=${controls ? 1 : 0}`;
    };

    // Check for date conflicts whenever dates change
    const checkDateConflict = (start, end) => {
        if (!start || !end) {
            setDateConflict(null);
            return false;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        const conflict = unavailableDates.find(booking => {
            const bookingStart = new Date(booking.startDate);
            const bookingEnd = new Date(booking.endDate);
            return (startDate <= bookingEnd && endDate >= bookingStart);
        });

        if (conflict) {
            setDateConflict({
                start: new Date(conflict.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                end: new Date(conflict.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            });
            return true;
        }

        setDateConflict(null);
        return false;
    };

    const isDateDisabled = (date) => {
        // Disable past dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return true;

        // Disable unavailable dates from bookings
        const isBooked = unavailableDates.some(booking => {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            return date >= start && date <= end;
        });
        if (isBooked) return true;

        // Disable based on farm availability rules
        if (farm?.availability === 'Monday to Friday') {
            const day = date.getDay();
            return day === 0 || day === 6; // Disable Sunday (0) and Saturday (6)
        }

        return false;
    };

    const handleDateChange = (item) => {
        setDateSelection([item.selection]);
        
        const startStr = item.selection.startDate.toLocaleDateString('en-CA');
        const endStr = item.selection.endDate.toLocaleDateString('en-CA');
        
        checkDateConflict(startStr, endStr);
    };

    useEffect(() => {
        const fetchFarmDetails = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/farms/${id}`);
                setFarm(data);
                setAllMedia(combineMedia(data));
            } catch (error) {
                console.error('Error fetching farm details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAvailability = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/bookings/property/${id}/availability`);
                setUnavailableDates(data);
            } catch (error) {
                console.error('Error fetching availability:', error);
            }
        };

        const fetchReviews = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/reviews/farm/${id}`);
                setReviews(data.reviews);
                setAverageRating(data.averageRating);
                setTotalReviews(data.totalReviews);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        const checkReviewEligibility = async () => {
            if (!user) return;
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_URL}/api/users/bookings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const completedBooking = data.find(b =>
                    b.farm._id === id &&
                    b.status === 'completed'
                );

                if (completedBooking) {
                    setEligibleBookingId(completedBooking._id);
                }
            } catch (error) {
                console.error('Error checking eligibility:', error);
            }
        };

        fetchFarmDetails();
        fetchAvailability();
        fetchReviews();
        checkReviewEligibility();
    }, [id, user]);

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!user) {
            alert('Please log in to make a booking');
            navigate('/login');
            return;
        }

        const startStr = dateSelection[0].startDate.toLocaleDateString('en-CA');
        const endStr = dateSelection[0].endDate.toLocaleDateString('en-CA');

        if (startStr === endStr) {
            alert('Please select a valid date range (minimum 1 night).');
            return;
        }

        if (!bookingData.guestName || !bookingData.guestPhone) {
            alert('Please enter your name and mobile number');
            return;
        }

        try {
            const startDate = dateSelection[0].startDate;
            const endDate = dateSelection[0].endDate;

            // Client-side validation: Check for overlaps
            const hasConflict = unavailableDates.some(booking => {
                const bookingStart = new Date(booking.startDate);
                const bookingEnd = new Date(booking.endDate);
                return (startDate <= bookingEnd && endDate >= bookingStart);
            });

            if (hasConflict) {
                alert('❌ Booking Failed\n\nThe selected dates overlap with an existing booking.\n\nPlease choose different dates.');
                return;
            }

            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const totalPrice = nights * farm.price;
            const tax = Math.round(totalPrice * 0.18); // 18% GST example

            // Set Cart Data and Navigate to Cart
            addToCart({
                property: farm,
                propertyId: id,
                startDate: startStr,
                endDate: endStr,
                guests: bookingData.guests,
                guestDetails: {
                    name: bookingData.guestName,
                    phone: bookingData.guestPhone
                },
                pricing: {
                    basePrice: farm.price,
                    nights,
                    totalPrice,
                    tax,
                    grandTotal: totalPrice + tax
                }
            });

            navigate('/cart');

        } catch (error) {
            console.error('Booking error:', error);
            if (error.response?.status === 409) {
                alert(`❌ Booking Failed\n\n${error.response.data.message}\n\nPlease select different dates.`);
            } else {
                alert('❌ Booking Failed\n\nSomething went wrong. Please try again or contact support.');
            }
        }
    };

    const nextMedia = () => {
        if (allMedia.length > 0) {
            setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
        }
    };

    const prevMedia = () => {
        if (allMedia.length > 0) {
            setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!farm) return <div className="text-center py-20">Farm not found</div>;

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left: Media Gallery (Images & Videos) */}
                <div className="lg:col-span-2 space-y-3 md:space-y-4">
                    <div className="space-y-3 md:space-y-4">
                        {/* Main Media Display */}
                        <div
                            className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl h-[300px] sm:h-[400px] md:h-[500px] group cursor-zoom-in bg-black"
                            onClick={() => setShowLightbox(true)}
                        >
                            <AnimatePresence mode="wait">
                                {allMedia.length > 0 && allMedia[currentMediaIndex]?.type === 'image' ? (
                                    <motion.img
                                        key={currentMediaIndex}
                                        src={allMedia[currentMediaIndex].url}
                                        alt={`${farm.title} - Media ${currentMediaIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                ) : allMedia.length > 0 && allMedia[currentMediaIndex]?.type === 'video' ? (
                                    isVideoFileUrl(allMedia[currentMediaIndex].url) ? (
                                        <motion.video
                                            key={currentMediaIndex}
                                            src={allMedia[currentMediaIndex].url}
                                            title={`${farm.title} - Video ${currentMediaIndex + 1}`}
                                            className="w-full h-full"
                                            controls
                                            playsInline
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    ) : (
                                        <motion.iframe
                                            key={currentMediaIndex}
                                            src={buildEmbedSrc(allMedia[currentMediaIndex].url, true)}
                                            title={`${farm.title} - Video ${currentMediaIndex + 1}`}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )
                                ) : (
                                    <motion.div className="w-full h-full bg-gray-300" />
                                )}
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {allMedia.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>

                                    {/* Media Counter */}
                                    <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 bg-black/60 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm z-10">
                                        {currentMediaIndex + 1} / {allMedia.length}
                                    </div>
                                </>
                            )}

                            {/* Video Indicator */}
                            {allMedia.length > 0 && allMedia[currentMediaIndex]?.type === 'video' && (
                                <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
                                    <Play size={12} /> Video
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {allMedia.length > 1 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {allMedia.map((media, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentMediaIndex(index)}
                                        className={`rounded-lg overflow-hidden h-20 transition-all relative group ${index === currentMediaIndex
                                            ? 'ring-4 ring-primary scale-105'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        {media.type === 'image' ? (
                                            <img
                                                src={media.url}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                                                {isVideoFileUrl(media.url) ? (
                                                    <video
                                                        src={media.url}
                                                        className="w-full h-full object-cover opacity-70"
                                                        muted
                                                        playsInline
                                                    />
                                                ) : (
                                                    <iframe
                                                        src={buildEmbedSrc(media.url, false)}
                                                        className="w-full h-full"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                        title={`Video Thumbnail ${index + 1}`}
                                                    />
                                                )}
                                                <Play className="absolute w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Booking Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl shadow-xl lg:sticky lg:top-24 border border-gray-100">
                        <div className="mb-4 pb-4 border-b border-gray-100">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{farm.title}</h1>
                        </div>
                        <div className="flex justify-between items-end mb-4 md:mb-6">
                            <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{farm.price}</span>
                            <span className="text-gray-500 mb-1 text-sm md:text-base">/ night</span>
                        </div>

                        {/* Dynamic Date Conflict Warning */}
                        {dateConflict && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl shadow-sm animate-pulse">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-red-900 font-bold text-sm mb-1">Dates Unavailable</h4>
                                        <p className="text-red-700 text-xs leading-relaxed">
                                            These dates overlap with an existing booking from <span className="font-semibold">{dateConflict.start}</span> to <span className="font-semibold">{dateConflict.end}</span>. Please select different dates.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Dates</label>

                            {/* Date Trigger Button */}
                            <div
                                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99]"
                            >
                                <div className="flex-1 text-center border-r border-gray-200">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Check-in</p>
                                    <p className="font-bold text-lg text-gray-900">
                                        {dateSelection[0].startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Check-out</p>
                                    <p className="font-bold text-lg text-gray-900">
                                        {dateSelection[0].endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            {/* Calendar Popup */}
                            <AnimatePresence>
                                {isCalendarOpen && (
                                    <>
                                        {/* Modal Wrapper */}
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm">
                                            {/* Backdrop Click Area */}
                                            <div 
                                                className="absolute inset-0"
                                                onClick={() => setIsCalendarOpen(false)}
                                            />
                                            
                                            {/* Calendar Modal */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="relative z-10 bg-white rounded-3xl shadow-2xl p-4 md:p-6 w-full max-w-[min(100%,400px)] border border-gray-100 flex flex-col items-center"
                                            >
                                            <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar flex justify-center">
                                                <DateRange
                                                    ranges={dateSelection}
                                                    onChange={handleDateChange}
                                                    minDate={new Date()}
                                                    rangeColors={['#16a34a']}
                                                    disabledDay={isDateDisabled}
                                                    className="border-none rounded-2xl font-inter"
                                                    months={1}
                                                />
                                            </div>
                                            <div className="mt-3 pt-4 border-t border-gray-100 flex justify-center w-full">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setIsCalendarOpen(false);
                                                    }}
                                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-md active:scale-95 w-full sm:w-auto"
                                                >
                                                    Apply Dates
                                                </button>
                                            </div>
                                        </motion.div>
                                        </div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        <form onSubmit={handleBooking} className="space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter your full name"
                                    className="w-full p-2.5 md:p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm md:text-base"
                                    value={bookingData.guestName}
                                    onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="Enter mobile number"
                                    className="w-full p-2.5 md:p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm md:text-base"
                                    value={bookingData.guestPhone}
                                    onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={farm.capacity}
                                    required
                                    value={bookingData.guests}
                                    className="w-full p-2.5 md:p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm md:text-base"
                                    onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Maximum {farm.capacity} guests</p>
                            </div>

                            <button
                                type="submit"
                                disabled={dateConflict}
                                className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all shadow-lg transform ${dateConflict
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-green-600 hover:-translate-y-0.5 active:translate-y-0'
                                    }`}
                            >
                                {dateConflict ? 'Dates Unavailable' : 'Book Now'}
                            </button>
                            <p className="text-center text-xs md:text-sm text-gray-500 mt-2">You won't be charged yet</p>
                        </form>
                    </div>
                </div>
            </div>

            {/* Full Width Content Section */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 lg:p-10">
                {/* Title and Meta Info */}
                <div className="border-b border-gray-200 pb-6 mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <FavoriteButton farmId={farm._id} size={28} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600 mb-4">
                        {farm.subCategory && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-200">
                                {farm.subCategory}
                            </span>
                        )}
                        {farm.availability && (
                            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                                farm.availability === 'All Days'
                                ? 'bg-purple-100 text-purple-800 border-purple-200'
                                : 'bg-orange-100 text-orange-800 border-orange-200'
                            }`}>
                                {farm.availability}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <MapPin size={20} className="text-primary" />
                            </div>
                            <span className="font-medium text-base md:text-lg">{farm.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users size={20} className="text-primary" />
                            </div>
                            <span className="text-base md:text-lg">Up to <span className="font-semibold">{farm.capacity}</span> guests</span>
                        </div>
                        {totalReviews > 0 && (
                            <div className="flex items-center gap-2">
                                <StarRating rating={averageRating} size={20} />
                                <span className="font-bold text-xs">{averageRating.toFixed(1)}</span>
                                <span className="text-gray-500 text-xs">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-green-600 rounded-full"></div>
                        About this farm
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-xs md:text-base">
                        {farm.description}
                    </p>

                    {/* Host Profile Section (Mock Data) */}
                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-start sm:items-center gap-4 md:gap-6 group cursor-pointer">
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
                                alt="Host"
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-md ring-4 ring-white group-hover:ring-primary/20 transition-all"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-sm">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Hosted by Thomas</h3>
                            <p className="text-gray-500 text-sm mb-2">Superhost · Joined December 2021</p>
                            <p className="text-gray-600 text-sm md:text-base line-clamp-2">
                                We love sharing our organic farm with guests! I'm always available to show you around the vineyards or recommend local hiking trails.
                            </p>
                        </div>
                        <button className="hidden sm:block px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 font-medium transition-all">
                            Contact Host
                        </button>
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-green-600 rounded-full"></div>
                        What this place offers
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {farm.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md hover:scale-105 transition-all duration-200 border border-gray-100">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                                    <Check size={20} className="text-white" />
                                </div>
                                <span className="text-gray-800 font-medium text-base">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Section */}
                <div className="border-t border-gray-200 pt-10 mt-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-green-600 rounded-full"></div>
                        Where you'll be
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">{farm.location}</p>
                    <div className="w-full h-[300px] md:h-[400px] bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(farm.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                            title="Farm Location"
                            className="grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                        ></iframe>
                        {/* Map Overlay Guard (Optional: prevents accidental scrolling unless clicked/active, but simple iframe is usually fine) */}
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 lg:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-green-600 rounded-full"></div>
                    Guest Reviews
                </h2>
                <ReviewList reviews={reviews} />
                {eligibleBookingId && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all font-medium"
                    >
                        Write a Review
                    </button>
                )}
                {showReviewForm && (
                    <ReviewForm
                        farmId={id}
                        bookingId={eligibleBookingId}
                        onReviewSubmitted={() => {
                            setShowReviewForm(false);
                            fetchReviews();
                        }}
                    />
                )}
            </div>

            {/* Booking Confirmation Modal */}
            <BookingConfirmationModal
                isOpen={showConfirmationModal}
                bookingDetails={confirmedBookingDetails}
                onClose={() => {
                    setShowConfirmationModal(false);
                    navigate('/bookings');
                }}
            />

            {/* Lightbox Overlay - Media (Images & Videos) */}
            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors z-[60]"
                        >
                            <X size={32} />
                        </button>

                        <div className="relative w-full max-w-6xl max-h-screen flex items-center justify-center p-2" onClick={e => e.stopPropagation()}>
                            <AnimatePresence mode="wait">
                                {allMedia[currentMediaIndex]?.type === 'image' ? (
                                    <motion.img
                                        key={currentMediaIndex}
                                        src={allMedia[currentMediaIndex]?.url}
                                        alt="Full screen view"
                                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        transition={{ delay: 0.1 }}
                                    />
                                ) : (
                                    isVideoFileUrl(allMedia[currentMediaIndex]?.url) ? (
                                        <motion.video
                                            key={currentMediaIndex}
                                            src={allMedia[currentMediaIndex]?.url}
                                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                                            controls
                                            playsInline
                                            title="Video Lightbox"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ delay: 0.1 }}
                                        />
                                    ) : (
                                        <motion.iframe
                                            key={currentMediaIndex}
                                            src={buildEmbedSrc(allMedia[currentMediaIndex]?.url, true)}
                                            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title="Video Lightbox"
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ delay: 0.1 }}
                                        />
                                    )
                                )}
                            </AnimatePresence>

                            {/* Lightbox Navigation */}
                            {allMedia.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                                        className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all backdrop-blur-md z-20"
                                    >
                                        <ChevronLeft size={32} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                        className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 md:p-4 rounded-full transition-all backdrop-blur-md z-20"
                                    >
                                        <ChevronRight size={32} />
                                    </button>
                                </>
                            )}

                            {/* Media Counter */}
                            {allMedia.length > 1 && (
                                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/20 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md z-20">
                                    {currentMediaIndex + 1} / {allMedia.length}
                                </div>
                            )}
                        </div>

                        {/* Lightbox Thumbnails */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-2 p-2">
                                {allMedia.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentMediaIndex(idx)}
                                        className={`w-16 h-12 rounded-md overflow-hidden flex-shrink-0 transition-all relative ${idx === currentMediaIndex ? 'ring-2 ring-white scale-110 opacity-100' : 'opacity-50 hover:opacity-80'
                                            }`}
                                    >
                                        {media.type === 'image' ? (
                                            <img src={media.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                <Play className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Mobile Booking Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
                <div>
                    <p className="text-gray-900 font-bold text-lg">₹{farm.price}<span className="text-sm font-normal text-gray-500"> / night</span></p>
                    {dateConflict ? (
                        <p className="text-xs text-red-500 font-medium">Dates unavailable</p>
                    ) : (
                        <p className="text-xs text-green-600 font-medium">Available now</p>
                    )}
                </div>
                <button
                    onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        // Optional: Open calendar automatically if desired
                        setIsCalendarOpen(true);
                    }}
                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg active:scale-95"
                >
                    Reserve
                </button>
            </div>
        </div>
    );
};

export default FarmDetails;
// Triggering Vite re-bundle after dependency installation
