import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

import API_URL from '../config';
import FavoriteButton from '../components/FavoriteButton';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import BookingConfirmationModal from '../components/BookingConfirmationModal';

const stripePromise = loadStripe('pk_test_your_key_here'); // Replace with your Stripe public key

const FarmDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [farm, setFarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [dateConflict, setDateConflict] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [eligibleBookingId, setEligibleBookingId] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmedBookingDetails, setConfirmedBookingDetails] = useState(null);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        guests: 1,
        guestName: '',
        guestPhone: ''
    });

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

    useEffect(() => {
        const fetchFarmDetails = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/farms/${id}`);
                setFarm(data);
            } catch (error) {
                console.error('Error fetching farm details:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAvailability = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/bookings/farm/${id}/availability`);
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

        if (!bookingData.startDate || !bookingData.endDate) {
            alert('Please select check-in and check-out dates');
            return;
        }

        if (!bookingData.guestName || !bookingData.guestPhone) {
            alert('Please enter your name and mobile number');
            return;
        }

        try {
            const startDate = new Date(bookingData.startDate);
            const endDate = new Date(bookingData.endDate);

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

            const stripe = await stripePromise;
            const { data } = await axios.post(`${API_URL}/api/bookings`, {
                farmId: id,
                userId: user._id,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                guests: bookingData.guests,
                totalPrice: totalPrice,
                guestName: bookingData.guestName,
                guestPhone: bookingData.guestPhone
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (data.success) {
                // Calculate nights for display
                const nights = Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24));

                // Set booking details and show modal
                setConfirmedBookingDetails({
                    farm,
                    startDate: bookingData.startDate,
                    endDate: bookingData.endDate,
                    guests: bookingData.guests,
                    totalPrice,
                    nights
                });
                setShowConfirmationModal(true);
                return;
            }

            const result = await stripe.redirectToCheckout({
                sessionId: data.id,
            });

            if (result.error) {
                console.error(result.error.message);
            }
        } catch (error) {
            console.error('Booking error:', error);
            if (error.response?.status === 409) {
                alert(`❌ Booking Failed\n\n${error.response.data.message}\n\nPlease select different dates.`);
            } else {
                alert('❌ Booking Failed\n\nSomething went wrong. Please try again or contact support.');
            }
        }
    };

    const nextImage = () => {
        if (farm && farm.images) {
            setCurrentImageIndex((prev) => (prev + 1) % farm.images.length);
        }
    };

    const prevImage = () => {
        if (farm && farm.images) {
            setCurrentImageIndex((prev) => (prev - 1 + farm.images.length) % farm.images.length);
        }
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!farm) return <div className="text-center py-20">Farm not found</div>;

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left: Images */}
                <div className="lg:col-span-2 space-y-3 md:space-y-4">
                    <div className="space-y-3 md:space-y-4">
                        {/* Main Image with Navigation */}
                        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl h-[300px] sm:h-[400px] md:h-[500px] group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={farm.images[currentImageIndex] || 'https://via.placeholder.com/800'}
                                    alt={`${farm.title} - Image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {farm.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 md:p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>

                                    {/* Image Counter */}
                                    <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 bg-black/60 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                                        {currentImageIndex + 1} / {farm.images.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {farm.images.length > 1 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {farm.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`rounded-lg overflow-hidden h-20 transition-all ${index === currentImageIndex
                                            ? 'ring-4 ring-primary scale-105'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Booking Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl shadow-xl lg:sticky lg:top-24 border border-gray-100">
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

                        <form onSubmit={handleBooking} className="space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookingData.startDate}
                                    className={`w-full p-2.5 md:p-3 border-2 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm md:text-base ${dateConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    onChange={(e) => {
                                        const newData = { ...bookingData, startDate: e.target.value };
                                        setBookingData(newData);
                                        checkDateConflict(e.target.value, bookingData.endDate);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={bookingData.endDate}
                                    className={`w-full p-2.5 md:p-3 border-2 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all text-sm md:text-base ${dateConflict ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    onChange={(e) => {
                                        const newData = { ...bookingData, endDate: e.target.value };
                                        setBookingData(newData);
                                        checkDateConflict(bookingData.startDate, e.target.value);
                                    }}
                                />
                            </div>
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
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">{farm.title}</h1>
                        <FavoriteButton farmId={farm._id} size={28} />
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
                                <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                                <span className="text-gray-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
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
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg md:text-xl">
                        {farm.description}
                    </p>
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
                onClose={() => {
                    setShowConfirmationModal(false);
                    navigate('/bookings');
                }}
                bookingDetails={confirmedBookingDetails}
            />
        </div>
    );
};

export default FarmDetails;

