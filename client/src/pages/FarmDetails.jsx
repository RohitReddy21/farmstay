import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bath,
    BedDouble,
    Car,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Coffee,
    Dumbbell,
    Fan,
    Flame,
    Gamepad2,
    Heart,
    Home,
    MapPin,
    Microwave,
    Play,
    Refrigerator,
    ShieldPlus,
    Snowflake,
    TreePine,
    Tv,
    Users,
    Utensils,
    WashingMachine,
    Waves,
    Wifi,
    X
} from 'lucide-react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';

import API_URL from '../config';
import FavoriteButton from '../components/FavoriteButton';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import BookingConfirmationModal from '../components/BookingConfirmationModal';
import LazySection from '../components/LazySection';
import { buildImageSrcSet, optimizeImageUrl } from '../utils/imageOptimization';

const FarmDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { showToast } = useToast();
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
    const [showAllGalleryImages, setShowAllGalleryImages] = useState(false);
    const [isVariationSelectorOpen, setIsVariationSelectorOpen] = useState(false);
    const [showStayBookingModal, setShowStayBookingModal] = useState(false);
    const [weekendDateConflict, setWeekendDateConflict] = useState(null);
    const [showRetreatPrompt, setShowRetreatPrompt] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [guestCountError, setGuestCountError] = useState('');
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
        guestEmail: '',
        guestPhone: ''
    });
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedCottage, setSelectedCottage] = useState(null);

    const wholeMudCottageVariation = {
        type: 'Whole Mud Cottage',
        label: 'Whole Mud Cottage - All 4 Cottages',
        price: 19999,
        capacity: 10,
        amenities: ["Whole Mud Cottage Booking", "Shared Accommodation", "Couple Accommodation", "Traditional Mud Cottage", "Earthy Living", "Farm Experience", "Wifi", "AC", "Firepit", "Breakfast Included", "Free Parking", "Bonfire Nights", "Farm Activities"],
        availableCottages: ["Traditional Mud Cottage - 1", "Traditional Mud Cottage - 2", "Traditional Mud Cottage - 3", "Traditional Mud Cottage - 4"]
    };
    const farmVariations = (() => {
        const variations = farm?.variations || [];
        const isMudCottageFarm = farm?.title?.toLowerCase().includes('traditional mud cottage');
        const hasWholeOption = variations.some((variation) => variation.type === wholeMudCottageVariation.type);
        return isMudCottageFarm && !hasWholeOption ? [wholeMudCottageVariation, ...variations] : variations;
    })();
    const hasVariations = farmVariations.length > 0;
    const nightlyPrice = selectedVariation?.price || farm?.price || 0;
    const guestLimit = selectedVariation?.capacity || farm?.capacity || 1;
    const isWholeMudCottageSelected = selectedVariation?.type === wholeMudCottageVariation.type;

    const selectVariation = (variation) => {
        if (!variation) return;
        setSelectedVariation(variation);
        setSelectedCottage(variation.availableCottages?.[0] || null);
        setBookingData((current) => ({
            ...current,
            guests: variation.type === wholeMudCottageVariation.type
                ? variation.capacity
                : Math.min(Number(current.guests) || 1, variation.capacity || farm?.capacity || 1)
        }));
        setIsVariationSelectorOpen(false);
    };

    const handleVariationSelect = (type) => {
        const variation = farmVariations.find((item) => item.type === type);
        selectVariation(variation);
    };

    const showBookingValidationError = (message) => {
        setBookingError(message);
        showToast({
            type: 'error',
            title: 'Complete booking details',
            message
        });
    };

    const validateGuestCount = (value) => {
        const count = Number(value);

        if (!value || Number.isNaN(count) || count < 1) {
            return 'Please enter at least 1 guest.';
        }

        if (count > guestLimit) {
            return `This stay allows a maximum of ${guestLimit} guests. Please reduce the guest count.`;
        }

        return '';
    };

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

    const getAmenityIcon = (amenity = '') => {
        const text = amenity.toLowerCase();
        if (text.includes('wifi')) return Wifi;
        if (text.includes('air conditioning') || text === 'ac') return Snowflake;
        if (text.includes('fan')) return Fan;
        if (text.includes('bed') || text.includes('king')) return BedDouble;
        if (text.includes('bath') || text.includes('hot water')) return Bath;
        if (text.includes('parking')) return Car;
        if (text.includes('washer') || text.includes('dryer') || text.includes('laundry')) return WashingMachine;
        if (text.includes('tv')) return Tv;
        if (text.includes('game') || text.includes('chess') || text.includes('ludo') || text.includes('poker')) return Gamepad2;
        if (text.includes('first aid') || text.includes('safety')) return ShieldPlus;
        if (text.includes('refrigerator') || text.includes('fridge')) return Refrigerator;
        if (text.includes('microwave')) return Microwave;
        if (text.includes('kettle')) return Coffee;
        if (text.includes('pool')) return Waves;
        if (text.includes('breakfast') || text.includes('coffee')) return Coffee;
        if (text.includes('meal') || text.includes('kitchen')) return Utensils;
        if (text.includes('fire') || text.includes('bonfire') || text.includes('bbq')) return Flame;
        if (text.includes('outdoor dining')) return Utensils;
        if (text.includes('gym')) return Dumbbell;
        if (text.includes('garden') || text.includes('farm') || text.includes('earth')) return TreePine;
        if (text.includes('romantic') || text.includes('couple')) return Heart;
        if (text.includes('cottage') || text.includes('villa') || text.includes('stay')) return Home;
        return Check;
    };

    const displayedAmenities = selectedVariation?.amenities?.length ? selectedVariation.amenities : farm?.amenities || [];
    const isWeekdayOnlyFarm = farm?.availability === 'Monday to Friday';
    const getTenDigitPhone = (value = '') => value.replace(/\D/g, '').slice(0, 10);
    const unavailableRanges = useMemo(() => unavailableDates.map((booking) => ({
        ...booking,
        rangeStart: new Date(booking.startDate),
        rangeEnd: new Date(booking.endDate)
    })), [unavailableDates]);
    const visibleThumbnailLimit = 8;
    const mediaThumbnails = useMemo(
        () => allMedia.slice(0, showAllGalleryImages ? allMedia.length : visibleThumbnailLimit),
        [allMedia, showAllGalleryImages]
    );
    const hiddenThumbnailCount = Math.max(0, allMedia.length - visibleThumbnailLimit);

    const rangesOverlap = (startDate, endDate, booking) => {
        const bookingStart = booking.rangeStart || new Date(booking.startDate);
        const bookingEnd = booking.rangeEnd || new Date(booking.endDate);
        return startDate < bookingEnd && endDate > bookingStart;
    };

    const isBookedNightDate = (date, booking) => {
        const bookingStart = booking.rangeStart || new Date(booking.startDate);
        const bookingEnd = booking.rangeEnd || new Date(booking.endDate);
        return date >= bookingStart && date < bookingEnd;
    };

    const isCalendarDisabledBookedDate = (date, booking) => {
        const bookingStart = booking.rangeStart || new Date(booking.startDate);
        const bookingEnd = booking.rangeEnd || new Date(booking.endDate);
        return date > bookingStart && date < bookingEnd;
    };

    const getVariationCottages = (variation) => {
        if (variation?.availableCottages?.length) return variation.availableCottages;
        return variation?.type ? [variation.type] : [];
    };

    const getVariationCottage = (variation) => getVariationCottages(variation)[0] || variation?.type;

    const bookingMatchesVariation = (booking, variation = selectedVariation) => {
        if (!hasVariations) return true;
        if (!booking?.variation?.cottage && !booking?.variation?.cottages?.length) return true;
        const cottages = getVariationCottages(variation);
        const bookedCottages = booking?.variation?.cottages?.length
            ? booking.variation.cottages
            : [booking?.variation?.cottage].filter(Boolean);
        return cottages.some((cottage) => bookedCottages.includes(cottage));
    };

    const variationHasDateConflict = (variation, startDate = dateSelection[0].startDate, endDate = dateSelection[0].endDate) => {
        if (!startDate || !endDate) return false;
        return unavailableRanges.some((booking) => bookingMatchesVariation(booking, variation) && rangesOverlap(startDate, endDate, booking));
    };

    const formatDateForDisplay = (date) => date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const rangeIncludesWeekend = (startDate, endDate) => {
        const cursor = new Date(startDate);
        cursor.setHours(0, 0, 0, 0);
        const last = new Date(endDate);
        last.setHours(0, 0, 0, 0);

        while (cursor < last) {
            const day = cursor.getDay();
            if (day === 0 || day === 6) return true;
            cursor.setDate(cursor.getDate() + 1);
        }

        return false;
    };

    const checkWeekendConflict = (startDate, endDate) => {
        if (!isWeekdayOnlyFarm || !startDate || !endDate) {
            setWeekendDateConflict(null);
            return false;
        }

        if (rangeIncludesWeekend(startDate, endDate)) {
            setWeekendDateConflict({
                start: formatDateForDisplay(startDate),
                end: formatDateForDisplay(endDate)
            });
            setShowRetreatPrompt(true);
            return true;
        }

        setWeekendDateConflict(null);
        return false;
    };

    // Check for date conflicts whenever dates change
    const checkDateConflict = (start, end) => {
        if (!start || !end) {
            setDateConflict(null);
            return false;
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        const conflict = unavailableRanges.find(booking => bookingMatchesVariation(booking) && rangesOverlap(startDate, endDate, booking));

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
        const isBooked = unavailableRanges.some(booking => bookingMatchesVariation(booking) && isCalendarDisabledBookedDate(date, booking));
        if (isBooked) return true;

        // Disable based on farm availability rules
        if (farm?.availability === 'Monday to Friday') {
            const day = date.getDay();
            return day === 0 || day === 6; // Disable Sunday (0) and Saturday (6)
        }

        return false;
    };

    const isBookedDate = (date) => unavailableRanges.some((booking) =>
        bookingMatchesVariation(booking) && isBookedNightDate(date, booking)
    );

    const isWeekendBlockedDate = (date) => {
        if (farm?.availability !== 'Monday to Friday') return false;
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const renderCalendarDay = (date) => {
        const booked = isBookedDate(date);
        const weekendBlocked = isWeekendBlockedDate(date);

        return (
            <span className="relative flex h-full w-full items-center justify-center">
                <span>{date.getDate()}</span>
                {booked && (
                    <span
                        aria-label="Unavailable date"
                        className={`absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${unavailableRanges.some((booking) => booking.source === 'manual-block' && isBookedNightDate(date, booking)) ? 'bg-gray-500' : 'bg-red-500'}`}
                    />
                )}
                {!booked && weekendBlocked && (
                    <span
                        aria-label="Weekend unavailable"
                        className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-500"
                    />
                )}
            </span>
        );
    };

    const visibleUnavailableRanges = useMemo(() => unavailableRanges
        .filter((booking) => bookingMatchesVariation(booking))
        .filter((booking) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return booking.rangeEnd >= today;
        })
        .sort((a, b) => a.rangeStart - b.rangeStart)
        .slice(0, 3), [unavailableRanges, selectedVariation, selectedCottage, hasVariations]);

    const handleDateChange = (item) => {
        setDateSelection([item.selection]);
        setBookingError('');
        
        const startStr = item.selection.startDate.toLocaleDateString('en-CA');
        const endStr = item.selection.endDate.toLocaleDateString('en-CA');
        
        checkDateConflict(startStr, endStr);
        checkWeekendConflict(item.selection.startDate, item.selection.endDate);
    };

    const buildBookingDraft = () => ({
        farmId: id,
        bookingData,
        startDate: dateSelection[0].startDate.toISOString(),
        endDate: dateSelection[0].endDate.toISOString(),
        variationType: selectedVariation?.type || '',
        selectedCottage
    });

    const restoreBookingDraft = (draft, farmData) => {
        if (!draft || draft.farmId !== id) return;

        const restoredStartDate = draft.startDate ? new Date(draft.startDate) : null;
        const restoredEndDate = draft.endDate ? new Date(draft.endDate) : null;
        const restoredVariation = farmData.variations?.find((variation) => variation.type === draft.variationType);

        if (draft.bookingData) {
            setBookingData({
                guests: draft.bookingData.guests || 1,
                guestName: draft.bookingData.guestName || '',
                guestEmail: draft.bookingData.guestEmail || '',
                guestPhone: getTenDigitPhone(draft.bookingData.guestPhone || '')
            });
        }

        if (
            restoredStartDate &&
            restoredEndDate &&
            !Number.isNaN(restoredStartDate.getTime()) &&
            !Number.isNaN(restoredEndDate.getTime())
        ) {
            setDateSelection([{
                startDate: restoredStartDate,
                endDate: restoredEndDate,
                key: 'selection'
            }]);
        }

        if (restoredVariation) {
            setSelectedVariation(restoredVariation);
            setSelectedCottage(draft.selectedCottage || restoredVariation.availableCottages?.[0] || null);
        }

        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    };

    useEffect(() => {
        const fetchFarmDetails = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/farms/${id}`);
                setFarm(data);
                setAllMedia(combineMedia(data));
                setShowAllGalleryImages(false);
                const bookingDraft = location.state?.bookingDraft;

                if (bookingDraft?.farmId === id) {
                    restoreBookingDraft(bookingDraft, data);
                } else if (data.variations?.length > 0) {
                    setSelectedVariation(data.variations[0]);
                    setSelectedCottage(data.variations[0].availableCottages?.[0] || null);
                } else {
                    setSelectedVariation(null);
                    setSelectedCottage(null);
                }
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

    useEffect(() => {
        if (!farm) return;
        const startStr = dateSelection[0].startDate.toLocaleDateString('en-CA');
        const endStr = dateSelection[0].endDate.toLocaleDateString('en-CA');
        checkDateConflict(startStr, endStr);
    }, [selectedVariation, selectedCottage, unavailableRanges, farm]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setBookingError('');

        const startStr = dateSelection[0].startDate.toLocaleDateString('en-CA');
        const endStr = dateSelection[0].endDate.toLocaleDateString('en-CA');

        if (startStr === endStr) {
            showBookingValidationError('Please select a valid date range with at least 1 night.');
            return;
        }

        if (checkWeekendConflict(dateSelection[0].startDate, dateSelection[0].endDate)) {
            showBookingValidationError('This farm stay is not available on Saturday or Sunday. Please choose weekdays or join the Learning Retreat.');
            return;
        }

        if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
            showBookingValidationError('Please enter your full name, email, and mobile number.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(bookingData.guestEmail)) {
            showBookingValidationError('Please enter a valid email address.');
            return;
        }

        if (getTenDigitPhone(bookingData.guestPhone).length !== 10) {
            showBookingValidationError('Mobile number must be exactly 10 digits.');
            return;
        }

        const guestError = isWholeMudCottageSelected ? '' : validateGuestCount(bookingData.guests);
        if (guestError) {
            setGuestCountError(guestError);
            showBookingValidationError(guestError);
            return;
        }

        const guestCount = isWholeMudCottageSelected ? guestLimit : Number(bookingData.guests);

        try {
            const startDate = dateSelection[0].startDate;
            const endDate = dateSelection[0].endDate;

            // Client-side validation: Check for overlaps
            const hasConflict = unavailableRanges.some(booking => bookingMatchesVariation(booking) && rangesOverlap(startDate, endDate, booking));

            if (hasConflict) {
                showBookingValidationError('The selected dates overlap with an existing booking. Please choose different dates.');
                return;
            }

            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const basePrice = nightlyPrice;
            const totalPrice = nights * basePrice;
            const tax = Math.round(totalPrice * 0.18); // 18% GST example

            // Set Cart Data and Navigate to Cart
            addToCart({
                property: {
                    _id: farm._id,
                    title: farm.title,
                    location: farm.location,
                    price: farm.price,
                    capacity: farm.capacity,
                    images: farm.images?.length ? [farm.images[0]] : []
                },
                propertyId: id,
                startDate: startStr,
                endDate: endStr,
                guests: guestCount,
                guestDetails: {
                    name: bookingData.guestName,
                    email: bookingData.guestEmail,
                    phone: bookingData.guestPhone
                },
                variation: selectedVariation ? {
                    type: selectedVariation.type,
                    label: selectedVariation.label,
                    cottage: selectedCottage,
                    cottages: getVariationCottages(selectedVariation)
                } : null,
                pricing: {
                    basePrice,
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
                showBookingValidationError(`${error.response.data.message} Please select different dates.`);
            } else {
                showBookingValidationError('Something went wrong. Please try again or contact support.');
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

    if (loading) {
        return (
            <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="h-[300px] animate-pulse rounded-2xl bg-[#ead7b8] sm:h-[400px] md:h-[500px]" />
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="h-20 animate-pulse rounded-lg bg-[#f1e3cc]" />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
                        <div className="mb-5 h-8 w-3/4 animate-pulse rounded bg-[#ead7b8]" />
                        <div className="mb-5 h-8 w-32 animate-pulse rounded bg-[#ead7b8]" />
                        <div className="mb-5 h-24 animate-pulse rounded-2xl bg-[#f1e3cc]" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-12 animate-pulse rounded-xl bg-[#f1e3cc]" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!farm) return <div className="text-center py-20">Farm not found</div>;

    const isBookingBlocked = Boolean(dateConflict || weekendDateConflict);
    const selectedIsBookedForDates = selectedVariation && variationHasDateConflict(selectedVariation);
    const hasValidDates = Boolean(dateSelection[0].startDate && dateSelection[0].endDate && !isBookingBlocked);
    const hasValidGuestDetails = Boolean(
        bookingData.guestName.trim()
        && /\S+@\S+\.\S+/.test(bookingData.guestEmail)
        && getTenDigitPhone(bookingData.guestPhone).length === 10
    );
    const hasValidGuestCount = isWholeMudCottageSelected
        || (!validateGuestCount(bookingData.guests) && !guestCountError);
    const isReadyToReview = hasValidDates && hasValidGuestDetails && hasValidGuestCount && !selectedIsBookedForDates;
    const bookingStepIndex = !hasValidDates
        ? 0
        : !hasValidGuestDetails || !hasValidGuestCount
            ? 1
            : !isReadyToReview
                ? 2
                : 3;
    const bookingSteps = ['Select Dates', 'Guest Details', 'Review', 'Book'];
    const selectedNights = Math.max(1, Math.ceil((dateSelection[0].endDate - dateSelection[0].startDate) / (1000 * 60 * 60 * 24)));
    const selectedTotal = selectedNights * nightlyPrice;
    const selectedTax = Math.round(selectedTotal * 0.18);
    const selectedGrandTotal = selectedTotal + selectedTax;

    return (
        <div className="space-y-6 md:space-y-8">
            <AnimatePresence>
                {showRetreatPrompt && weekendDateConflict && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.96 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#fffaf1] shadow-2xl ring-1 ring-[#ead7b8]"
                        >
                            <button
                                type="button"
                                onClick={() => setShowRetreatPrompt(false)}
                                className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-[#6b5a45] shadow-sm transition hover:bg-white"
                                aria-label="Close retreat information"
                            >
                                <X size={18} />
                            </button>
                            <div className="bg-gradient-to-br from-[#7a5527] to-[#4f3519] px-6 py-7 text-white">
                                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#f4d59b]">Weekend Reserved</p>
                                <h3 className="mt-3 text-2xl font-bold">Join our Learning Retreat instead</h3>
                                <p className="mt-2 text-sm leading-relaxed text-[#fff2d9]">
                                    Mud Cottages and Limestone Villas are reserved for the 2-day Brown Cows Dairy Learning Retreat on Saturdays and Sundays.
                                </p>
                            </div>
                            <div className="space-y-4 p-6">
                                <div className="rounded-2xl border border-[#ead7b8] bg-white p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a642d]">Your selected dates</p>
                                    <p className="mt-1 font-semibold text-[#211b14]">
                                        {weekendDateConflict.start} - {weekendDateConflict.end}
                                    </p>
                                </div>
                                <p className="text-sm leading-relaxed text-[#645747]">
                                    The retreat includes farm activities, meals, hands-on learning, and stay options in the same cottages and villas.
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowRetreatPrompt(false)}
                                        className="rounded-xl border border-[#d9c18e] px-4 py-3 font-bold text-[#7a5527] transition hover:bg-[#fff3dc]"
                                    >
                                        Choose Weekdays
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/2-day-learning-retreat')}
                                        className="rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-lg transition hover:bg-primary-800"
                                    >
                                        View Retreat
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left: Media Gallery (Images & Videos) */}
                <div className="lg:col-span-2 space-y-3 md:space-y-4">
                    <div className="space-y-3 md:space-y-4">
                        {/* Main Media Display */}
                        <div
                            className="relative h-[300px] w-full rounded-2xl bg-black shadow-xl group cursor-zoom-in overflow-hidden sm:h-[400px] md:h-[500px] md:rounded-3xl"
                            onClick={() => setShowLightbox(true)}
                        >
                            <AnimatePresence mode="wait">
                                {allMedia.length > 0 && allMedia[currentMediaIndex]?.type === 'image' ? (
                                    <motion.img
                                        key={currentMediaIndex}
                                        src={optimizeImageUrl(allMedia[currentMediaIndex].url, { width: 1120, height: 740 })}
                                        srcSet={buildImageSrcSet(allMedia[currentMediaIndex].url, [480, 768, 1120, 1440], { height: 960 })}
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                        alt={`${farm.title} - Media ${currentMediaIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        loading={currentMediaIndex === 0 ? 'eager' : 'lazy'}
                                        fetchPriority={currentMediaIndex === 0 ? 'high' : 'auto'}
                                        decoding="async"
                                        width="1120"
                                        height="740"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.08 }}
                                    />
                                ) : allMedia.length > 0 && allMedia[currentMediaIndex]?.type === 'video' ? (
                                    isVideoFileUrl(allMedia[currentMediaIndex].url) ? (
                                        <motion.video
                                            key={currentMediaIndex}
                                            src={allMedia[currentMediaIndex].url}
                                            title={`${farm.title} - Video ${currentMediaIndex + 1}`}
                                            className="w-full h-full object-cover"
                                            controls
                                            playsInline
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.08 }}
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
                                            transition={{ duration: 0.08 }}
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
                                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-opacity hover:bg-white md:left-4 md:p-3 md:opacity-0 md:group-hover:opacity-100"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-opacity hover:bg-white md:right-4 md:p-3 md:opacity-0 md:group-hover:opacity-100"
                                        aria-label="Next image"
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
                                {mediaThumbnails.map((media, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentMediaIndex(index)}
                                        className={`relative h-20 overflow-hidden rounded-lg transition-all group ${index === currentMediaIndex
                                            ? 'ring-4 ring-primary scale-105'
                                            : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        {media.type === 'image' ? (
                                            <img
                                                src={optimizeImageUrl(media.url, { width: 260, height: 160 })}
                                                srcSet={buildImageSrcSet(media.url, [160, 260, 360], { height: 220 })}
                                                sizes="(max-width: 640px) 30vw, 160px"
                                                alt={`Thumbnail ${index + 1}`}
                                                loading="lazy"
                                                decoding="async"
                                                width="260"
                                                height="160"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                                                {isVideoFileUrl(media.url) ? (
                                                    <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-700" />
                                                ) : (
                                                    <div className="h-full w-full bg-gradient-to-br from-gray-900 to-gray-700" />
                                                )}
                                                <Play className="absolute w-6 h-6 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {!showAllGalleryImages && hiddenThumbnailCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllGalleryImages(true)}
                                        className="h-20 rounded-lg bg-[#211b14] text-sm font-bold text-white transition hover:bg-primary"
                                    >
                                        +{hiddenThumbnailCount} more
                                    </button>
                                )}
                                {showAllGalleryImages && hiddenThumbnailCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllGalleryImages(false)}
                                        className="h-20 rounded-lg border border-[#d9c18e] bg-white text-sm font-bold text-primary transition hover:bg-[#fff7ea]"
                                    >
                                        Show less
                                    </button>
                                )}
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
                            <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{nightlyPrice}</span>
                            <span className="text-gray-500 mb-1 text-sm md:text-base">/ night</span>
                        </div>

                        <div className="mb-5 rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-3">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Booking Progress</p>
                                <p className="text-xs font-bold text-gray-500">Step {Math.min(bookingStepIndex + 1, bookingSteps.length)} of {bookingSteps.length}</p>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {bookingSteps.map((step, index) => {
                                    const isComplete = index < bookingStepIndex;
                                    const isCurrent = index === bookingStepIndex;

                                    return (
                                        <div key={step} className="min-w-0">
                                            <div className={`mb-1 h-1.5 rounded-full transition-colors ${
                                                isComplete || isCurrent ? 'bg-primary' : 'bg-[#ead7b8]'
                                            }`} />
                                            <div className="flex flex-col items-center gap-1 text-center">
                                                <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-black transition-colors ${
                                                    isComplete
                                                        ? 'border-primary bg-primary text-white'
                                                        : isCurrent
                                                            ? 'border-primary bg-white text-primary'
                                                            : 'border-[#ead7b8] bg-white text-gray-400'
                                                }`}>
                                                    {isComplete ? <Check size={14} strokeWidth={4} /> : index + 1}
                                                </span>
                                                <span className={`text-[10px] font-bold leading-tight ${
                                                    isComplete || isCurrent ? 'text-[#211b14]' : 'text-gray-400'
                                                }`}>
                                                    {step}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {hasVariations && (
                            <div className="mb-6 border-b border-gray-100 pb-6">
                                <div className="mb-3 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Choose cottage</p>
                                        <h2 className="text-lg font-bold text-gray-900">Accommodation type</h2>
                                    </div>
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                        Max {guestLimit} guests
                                    </span>
                                </div>
                                <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-[#fffaf4] via-white to-[#fff3df] p-3 shadow-[0_12px_30px_rgba(122,85,39,0.10)]">
                                    <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                        Select cottage
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedVariation?.type || ''}
                                            onChange={(e) => handleVariationSelect(e.target.value)}
                                            className="w-full appearance-none rounded-2xl border-2 border-[#e2c99e] bg-white px-4 py-4 pr-12 text-sm font-black text-gray-900 outline-none transition-all hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/15 md:text-base"
                                        >
                                            {farmVariations.map((variation) => (
                                                <option key={variation.type} value={variation.type}>
                                                    {variation.label} - Rs {variation.price} - Max {variation.capacity} guests
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-md">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                    {selectedVariation && (
                                        <div className="mt-3 rounded-2xl bg-white/75 p-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                                                    Rs {nightlyPrice} / night
                                                </span>
                                                <span className="rounded-full bg-[#f0dfc5] px-3 py-1 text-xs font-black text-[#7a5527]">
                                                    Max {guestLimit} guests
                                                </span>
                                            </div>
                                            <p className="mt-2 text-xs font-semibold leading-relaxed text-gray-500">
                                                {selectedVariation.availableCottages?.join(', ') || selectedVariation.type}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {false && selectedVariation && (
                                    <div className="mt-3 rounded-2xl border border-primary/20 bg-[#fff8ed] p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{selectedVariation.label}</p>
                                                <p className="mt-1 text-xs font-medium text-gray-500">
                                                    {selectedCottage || selectedVariation.availableCottages?.[0]} - {guestLimit} guests max
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-base font-extrabold text-primary">₹{nightlyPrice}</p>
                                        </div>
                                    </div>
                                )}
                                {false && <div className="hidden">
                                    {farm.variations.map((variation, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                setSelectedVariation(variation);
                                                setSelectedCottage(variation.availableCottages?.[0] || null);
                                                setBookingData((current) => ({
                                                    ...current,
                                                    guests: Math.min(Number(current.guests) || 1, variation.capacity || farm.capacity || 1)
                                                }));
                                            }}
                                            className={`group w-full rounded-2xl border p-3 text-left transition-all ${
                                                selectedVariation?.type === variation.type
                                                    ? 'border-primary bg-[#fff8ed] shadow-sm ring-2 ring-primary/10'
                                                    : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                                                    selectedVariation?.type === variation.type
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-gray-200 bg-gray-50 text-gray-400 group-hover:border-primary/40 group-hover:text-primary'
                                                }`}>
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold leading-snug text-gray-900 md:text-base">{variation.label}</p>
                                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                                            {variation.capacity} guests
                                                        </span>
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                                            {variation.label?.toLowerCase().includes('couple') ? 'Couple stay' : 'Shared stay'}
                                                        </span>
                                                    </div>
                                                    {variation.availableCottages?.length > 0 && (
                                                        <p className="mt-2 text-xs font-medium text-gray-500">
                                                            {variation.availableCottages.join(', ')}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="font-bold text-primary">₹{variation.price}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>}

                                {/* Cottage Selection */}
                                {false && selectedVariation?.availableCottages && selectedVariation.availableCottages.length > 1 && (
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Cottage</label>
                                        <select
                                            value={selectedCottage || ''}
                                            onChange={(e) => setSelectedCottage(e.target.value)}
                                            className="w-full rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-[#fff8ed] p-3 text-sm font-bold text-gray-900 outline-none transition-all hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/20 md:text-base"
                                        >
                                            {selectedVariation.availableCottages.map((cottage, idx) => (
                                                <option key={idx} value={cottage}>
                                                    {cottage}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {false && selectedVariation?.availableCottages?.length === 1 && (
                                    <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        Selected cottage: <span className="font-semibold text-gray-900">{selectedVariation.availableCottages[0]}</span>
                                    </p>
                                )}
                            </div>
                        )}

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

                        {weekendDateConflict && (
                            <div className="mb-4 rounded-xl border-2 border-[#d6a23d]/40 bg-[#fff7e8] p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f3e1bf] text-[#7a5527]">
                                        <Home size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 text-sm font-bold text-[#4f3519]">Weekend reserved for Learning Retreat</h4>
                                        <p className="text-xs leading-relaxed text-[#7a5527]">
                                            This stay is available Monday to Friday only. Saturdays and Sundays are used for the 2-day Learning Retreat.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowRetreatPrompt(true)}
                                            className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-primary hover:underline"
                                        >
                                            See retreat details
                                        </button>
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
                                                    rangeColors={['#7a5527']}
                                                    disabledDay={isDateDisabled}
                                                    dayContentRenderer={renderCalendarDay}
                                                    className="border-none rounded-2xl font-inter"
                                                    months={1}
                                                />
                                            </div>
                                            <div className="mt-3 w-full rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-3">
                                                <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-red-500" />
                                                        Booked
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span className="h-2 w-2 rounded-full bg-gray-500" />
                                                        Blocked
                                                    </span>
                                                    {farm?.availability === 'Monday to Friday' && (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                            Weekend unavailable
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                                                    Unavailable dates
                                                </p>
                                                {visibleUnavailableRanges.length > 0 ? (
                                                    <div className="mt-2 space-y-1.5">
                                                        {visibleUnavailableRanges.map((booking) => (
                                                            <div
                                                                key={`${booking.startDate}-${booking.endDate}-${booking._id || booking.id || ''}`}
                                                                className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-700"
                                                            >
                                                                <span>
                                                                    {formatDateForDisplay(booking.rangeStart)} - {formatDateForDisplay(booking.rangeEnd)}
                                                                </span>
                                                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${booking.source === 'manual-block' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-600'}`}>
                                                                    {booking.source === 'manual-block' ? 'Blocked' : 'Booked'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="mt-2 text-xs font-medium text-gray-500">
                                                        No upcoming booked dates for this option.
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-3 pt-4 border-t border-gray-100 flex justify-center w-full">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setIsCalendarOpen(false);
                                                    }}
                                                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-800 transition-all shadow-md active:scale-95 w-full sm:w-auto"
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

                        <div className="space-y-3 md:space-y-4">
                            {bookingError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                    {bookingError}
                                </div>
                            )}
                            {selectedIsBookedForDates && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                                    This cottage is booked for the selected dates. Please choose another available option from the dropdown.
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setBookingError('');
                                    setShowStayBookingModal(true);
                                }}
                                disabled={isBookingBlocked || selectedIsBookedForDates}
                                className={`w-full py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all shadow-lg transform ${isBookingBlocked || selectedIsBookedForDates
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-800 hover:-translate-y-0.5 active:translate-y-0'
                                    }`}
                            >
                                {isBookingBlocked || selectedIsBookedForDates ? 'Dates Unavailable' : 'Book Now'}
                            </button>
                            <p className="text-center text-xs md:text-sm text-gray-500 mt-2">Enter guest details in the next step. You won't be charged yet.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Width Content Section */}
            <LazySection placeholderClassName="min-h-[720px] rounded-2xl md:rounded-3xl bg-white/50">
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
                            <span className="text-base md:text-lg">Up to <span className="font-semibold">{guestLimit}</span> guests</span>
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
                        <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary-800 rounded-full"></div>
                        About this farm
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-xs md:text-base">
                        {farm.description}
    
                    </p>

                    {/* Host Profile Section (Mock Data) */}
                    <div className="mt-8 pt-8 border-t border-gray-100 flex items-start sm:items-center gap-4 md:gap-6 group cursor-pointer">
                        <div className="relative">
                            <img
                                src="/images/host-kusuma.png?v=20260429"
                                alt="Host"
                                loading="lazy"
                                decoding="async"
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-md ring-4 ring-white group-hover:ring-primary/20 transition-all"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-sm">
                                <Check size={12} strokeWidth={4} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Hosted by Kusuma Ijju</h3>
                            <p className="text-gray-500 text-sm mb-2">Superhost · Joined in 2022</p>
                            <p className="text-gray-600 text-sm md:text-base line-clamp-2">
                                We love sharing our organic farm with guests! I'm always available to show you around the vineyards or recommend local hiking trails.
                            </p>
                        </div>
                        <a
  href="https://wa.me/916300612812?text=Hi%20I%20am%20interested%20in%20your%20farmstay"
  target="_blank"
  rel="noopener noreferrer"
  className="hidden sm:block px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-900 hover:bg-gray-50 font-medium transition-all text-center"
>
  Contact Host
</a>
                    </div>
                </div>

                {/* Amenities */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary-800 rounded-full"></div>
                        {selectedVariation ? `${selectedVariation.type} offers` : 'What this place offers'}
                    </h2>
                    {selectedVariation?.availableCottages?.[0] && (
                        <p className="mb-4 text-sm font-medium text-gray-500">
                            Showing amenities for <span className="text-gray-900">{selectedVariation.availableCottages[0]}</span>
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                        {displayedAmenities.map((amenity, index) => {
                            const AmenityIcon = getAmenityIcon(amenity);
                            return (
                            <div key={index} className="group flex min-h-[96px] flex-col justify-between rounded-2xl border border-gray-100 bg-[#fbfaf7] p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-md">
                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                                    <AmenityIcon size={20} />
                                </div>
                                <span className="text-sm font-bold leading-snug text-gray-800 md:text-base">{amenity}</span>
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* Map Section */}
                <div className="border-t border-gray-200 pt-10 mt-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary-800 rounded-full"></div>
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
            </LazySection>

            {/* Reviews Section */}
            {/* <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8 lg:p-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-primary-800 rounded-full"></div>
                    Guest Reviews
                </h2>
                <ReviewList reviews={reviews} />
                {eligibleBookingId && !showReviewForm && (
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-all font-medium"
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
            </div> */}

            {/* Booking Confirmation Modal */}
            <BookingConfirmationModal
                isOpen={showConfirmationModal}
                bookingDetails={confirmedBookingDetails}
                onClose={() => {
                    setShowConfirmationModal(false);
                    navigate('/bookings');
                }}
            />

            {/* Stay Booking Details Modal */}
            <AnimatePresence>
                {showStayBookingModal && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
                        <div
                            className="absolute inset-0"
                            onClick={() => setShowStayBookingModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-[#dfd1bb] bg-white p-5 shadow-2xl sm:p-8"
                        >
                            <button
                                type="button"
                                onClick={() => setShowStayBookingModal(false)}
                                className="absolute right-4 top-4 rounded-full bg-[#f4ead8] p-2 text-[#7a5527] transition hover:bg-[#ead7b8]"
                                aria-label="Close booking details"
                            >
                                <X size={18} />
                            </button>

                            <div className="mb-6 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#7a5527] to-[#5d3d19] text-white">
                                    <Check size={28} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-[0.26em] text-primary">Guest Details</p>
                                <h3 className="mt-2 text-2xl font-bold text-[#211b14]">Confirm Your Stay</h3>
                                <p className="mt-2 text-sm text-[#645747]">
                                    Add the booking contact details for confirmation mail and approval updates.
                                </p>
                            </div>

                            <div className="mb-5 rounded-2xl border border-[#ead7b8] bg-[#fff8ed] p-4">
                                <div className="grid gap-3 text-sm sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a642d]">Stay</p>
                                        <p className="mt-1 font-semibold text-[#211b14]">{selectedVariation?.label || farm.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a642d]">Dates</p>
                                        <p className="mt-1 font-semibold text-[#211b14]">
                                            {dateSelection[0].startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {dateSelection[0].endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8a642d]">Total</p>
                                        <p className="mt-1 font-semibold text-[#211b14]">₹{selectedGrandTotal.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleBooking} noValidate className="space-y-4">
                                {bookingError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                        {bookingError}
                                    </div>
                                )}
                                {selectedIsBookedForDates && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                                        This cottage is booked for the selected dates. Please choose another available option from the dropdown.
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#7a5527]">Full Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your full name"
                                            className="w-full rounded-xl border-2 border-[#dfd1bb] bg-white px-4 py-3 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
                                            value={bookingData.guestName}
                                            onChange={(e) => {
                                                setBookingError('');
                                                setBookingData({ ...bookingData, guestName: e.target.value });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#7a5527]">Email Address <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter email for confirmation"
                                            className="w-full rounded-xl border-2 border-[#dfd1bb] bg-white px-4 py-3 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
                                            value={bookingData.guestEmail}
                                            onChange={(e) => {
                                                setBookingError('');
                                                setBookingData({ ...bookingData, guestEmail: e.target.value.trim() });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-[#7a5527]">Mobile Number <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Enter mobile number"
                                            className="w-full rounded-xl border-2 border-[#dfd1bb] bg-white px-4 py-3 text-base outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
                                            value={bookingData.guestPhone}
                                            onChange={(e) => {
                                                setBookingError('');
                                                setBookingData({ ...bookingData, guestPhone: getTenDigitPhone(e.target.value) });
                                            }}
                                            inputMode="numeric"
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                        />
                                    </div>

                                    {isWholeMudCottageSelected ? (
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-[#7a5527]">Guests</label>
                                            <div className="flex min-h-[52px] items-center gap-3 rounded-xl border-2 border-[#dfd1bb] bg-[#fff8ed] px-4 py-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">Whole Mud Cottages</p>
                                                    <p className="text-xs font-semibold text-gray-600">Max {guestLimit} guests</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-[#7a5527]">Number of Guests <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                required
                                                value={bookingData.guests}
                                                placeholder="Enter number of guests"
                                                aria-invalid={Boolean(guestCountError)}
                                                className={`w-full rounded-xl border-2 px-4 py-3 text-base outline-none transition-all ${
                                                    guestCountError
                                                        ? 'border-red-400 bg-red-50 text-red-900 focus:ring-4 focus:ring-red-200'
                                                        : 'border-[#dfd1bb] bg-white focus:border-primary focus:ring-4 focus:ring-primary/15'
                                                }`}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '');
                                                    const error = validateGuestCount(value);
                                                    setGuestCountError(error);
                                                    setBookingError(error);
                                                    setBookingData({ ...bookingData, guests: value });
                                                }}
                                                onBlur={() => {
                                                    if (!bookingData.guests) {
                                                        setBookingData({ ...bookingData, guests: 1 });
                                                        setGuestCountError('');
                                                        setBookingError('');
                                                    }
                                                }}
                                            />
                                            <p className={`mt-1 text-xs ${guestCountError ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
                                                {guestCountError || `Maximum ${guestLimit} guests`}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => setShowStayBookingModal(false)}
                                        className="flex-1 rounded-2xl border-2 border-[#dfd1bb] bg-white px-6 py-3 font-semibold text-[#645747] transition hover:bg-[#fff8ed]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isBookingBlocked || selectedIsBookedForDates}
                                        className={`flex-1 rounded-2xl px-6 py-3 font-bold text-white shadow-lg transition ${
                                            isBookingBlocked || selectedIsBookedForDates
                                                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                                : 'bg-gradient-to-r from-[#7a5527] to-[#5d3d19] hover:from-[#8b6230] hover:to-[#6d441a]'
                                        }`}
                                    >
                                        {isBookingBlocked || selectedIsBookedForDates ? 'Dates Unavailable' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox Overlay - Media (Images & Videos) */}
            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[120] flex h-[100dvh] items-center justify-center overflow-hidden bg-[#060504] p-0 text-white sm:p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        {allMedia[currentMediaIndex]?.type === 'image' && (
                            <img
                                src={optimizeImageUrl(allMedia[currentMediaIndex]?.url, { width: 1000, crop: 'fill' })}
                                alt=""
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-3xl"
                                loading="eager"
                                decoding="async"
                            />
                        )}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(122,85,39,0.18),rgba(0,0,0,0.72)_48%,rgba(0,0,0,0.96)_100%)]" />

                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute right-3 top-[max(1rem,env(safe-area-inset-top))] z-[140] rounded-full border border-white/15 bg-black/35 p-2.5 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-white hover:text-[#211b14] sm:right-5"
                            aria-label="Close gallery"
                        >
                            <X size={24} />
                        </button>

                        <div
                            className="relative z-[130] flex h-full w-full max-w-7xl flex-col px-3 pb-[6.75rem] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:pb-32 sm:pt-5"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="mb-3 flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 shadow-2xl backdrop-blur-md sm:mb-5">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#e7c678]">Brown Cows Gallery</p>
                                    <h3 className="truncate text-base font-bold sm:text-lg">{farm.title}</h3>
                                </div>
                                {allMedia.length > 1 && (
                                    <div className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white/90">
                                        {currentMediaIndex + 1} / {allMedia.length}
                                    </div>
                                )}
                            </div>

                            <div className="relative flex min-h-0 flex-1 items-center justify-center">
                                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/25 shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-sm">
                                    <AnimatePresence mode="wait">
                                        {allMedia[currentMediaIndex]?.type === 'image' ? (
                                            <motion.img
                                                key={currentMediaIndex}
                                                src={optimizeImageUrl(allMedia[currentMediaIndex]?.url, { width: 1800, crop: 'limit' })}
                                                srcSet={buildImageSrcSet(allMedia[currentMediaIndex]?.url, [768, 1120, 1600, 2048], { crop: 'limit' })}
                                                sizes="100vw"
                                                alt={`${farm.title} gallery image ${currentMediaIndex + 1}`}
                                                className="h-full max-h-[calc(100dvh-12.5rem)] w-full object-contain sm:max-h-[calc(100dvh-14rem)]"
                                                loading="eager"
                                                fetchPriority="high"
                                                decoding="async"
                                                width="1800"
                                                height="1125"
                                                initial={{ x: 28, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -28, opacity: 0 }}
                                                transition={{ duration: 0.24, ease: 'easeOut' }}
                                            />
                                        ) : (
                                            isVideoFileUrl(allMedia[currentMediaIndex]?.url) ? (
                                                <motion.video
                                                    key={currentMediaIndex}
                                                    src={allMedia[currentMediaIndex]?.url}
                                                    className="h-auto max-h-[calc(100dvh-12.5rem)] w-full rounded-2xl shadow-2xl sm:max-h-[calc(100dvh-14rem)]"
                                                    controls
                                                    playsInline
                                                    title="Video Lightbox"
                                                    initial={{ x: 28, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: -28, opacity: 0 }}
                                                    transition={{ duration: 0.24, ease: 'easeOut' }}
                                                />
                                            ) : (
                                                <motion.iframe
                                                    key={currentMediaIndex}
                                                    src={buildEmbedSrc(allMedia[currentMediaIndex]?.url, true)}
                                                    className="aspect-video h-auto max-h-[calc(100dvh-12.5rem)] w-full rounded-2xl shadow-2xl sm:max-h-[calc(100dvh-14rem)]"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    title="Video Lightbox"
                                                    initial={{ x: 28, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: -28, opacity: 0 }}
                                                    transition={{ duration: 0.24, ease: 'easeOut' }}
                                                />
                                            )
                                        )}
                                    </AnimatePresence>

                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent" />
                                </div>

                                {allMedia.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevMedia(); }}
                                            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-3 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-white hover:text-[#211b14] sm:left-5 sm:p-4"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft size={28} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextMedia(); }}
                                            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/35 p-3 text-white shadow-2xl backdrop-blur-md transition-all hover:bg-white hover:text-[#211b14] sm:right-5 sm:p-4"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight size={28} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div
                            className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-[135] px-3 sm:px-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/35 p-2 shadow-2xl backdrop-blur-md sm:justify-center">
                                {allMedia.map((media, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentMediaIndex(idx)}
                                        className={`relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-xl transition-all sm:h-16 sm:w-24 ${idx === currentMediaIndex ? 'scale-105 ring-2 ring-[#e7c678] opacity-100' : 'opacity-60 hover:opacity-95'
                                            }`}
                                        aria-label={`Open gallery item ${idx + 1}`}
                                    >
                                        {media.type === 'image' ? (
                                            <img
                                                src={optimizeImageUrl(media.url, { width: 180, height: 120 })}
                                                srcSet={buildImageSrcSet(media.url, [120, 180, 260], { height: 180 })}
                                                sizes="96px"
                                                alt={`Thumbnail ${idx + 1}`}
                                                loading="lazy"
                                                decoding="async"
                                                width="180"
                                                height="120"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-[#211b14]">
                                                <Play className="h-5 w-5 text-white" />
                                            </div>
                                        )}
                                        {idx === currentMediaIndex && (
                                            <span className="absolute inset-x-2 bottom-1 h-1 rounded-full bg-[#e7c678]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Mobile Booking Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-gray-900 font-bold text-lg">₹{selectedGrandTotal.toLocaleString('en-IN')}<span className="text-xs font-normal text-gray-500"> total</span></p>
                    <p className="truncate text-xs font-semibold text-gray-500">
                        {selectedNights} night{selectedNights === 1 ? '' : 's'} · ₹{nightlyPrice.toLocaleString('en-IN')}/night · Tax ₹{selectedTax.toLocaleString('en-IN')}
                    </p>
                    {dateConflict ? (
                        <p className="text-xs text-red-500 font-medium">Dates unavailable</p>
                    ) : (
                        <p className="text-xs text-secondary font-medium">
                            {dateSelection[0].startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {dateSelection[0].endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => {
                        if (isBookingBlocked || selectedIsBookedForDates) {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            setIsCalendarOpen(true);
                            return;
                        }
                        setBookingError('');
                        setShowStayBookingModal(true);
                    }}
                    className="shrink-0 bg-primary text-white px-5 py-3 rounded-xl font-bold hover:bg-primary-800 transition-all shadow-lg active:scale-95"
                >
                    Book Now
                </button>
            </div>
        </div>
    );
};

export default FarmDetails;
// Triggering Vite re-bundle after dependency installation
