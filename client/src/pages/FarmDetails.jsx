import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { MapPin, Users, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Replace with your publishable key
const stripePromise = loadStripe('pk_test_your_publishable_key');

const FarmDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [farm, setFarm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        guests: 1
    });

    useEffect(() => {
        const fetchFarm = async () => {
            try {
                const { data } = await axios.get(`https://farmstay-backend.onrender.com/api/farms/${id}`);
                setFarm(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFarm();
    }, [id]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const stripe = await stripePromise;
            const { data } = await axios.post('https://farmstay-backend.onrender.com/api/bookings', {
                farmId: id,
                userId: user._id,
                ...bookingData
            });

            if (data.success) {
                // Mock success
                navigate('/success');
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
            alert('Booking failed. Please try again.');
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
        <div className="grid md:grid-cols-3 gap-8">
            {/* Left: Images & Info */}
            <div className="md:col-span-2 space-y-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                    {/* Main Image with Navigation */}
                    <div className="relative rounded-3xl overflow-hidden shadow-lg h-[500px] group">
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
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                {/* Image Counter */}
                                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                                    {currentImageIndex + 1} / {farm.images.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {farm.images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
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

                <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{farm.title}</h1>
                    <div className="flex items-center text-gray-600 mb-6">
                        <MapPin size={20} className="mr-2" /> {farm.location}
                        <span className="mx-4">|</span>
                        <Users size={20} className="mr-2" /> Capacity: {farm.capacity} guests
                    </div>

                    <div className="prose max-w-none text-gray-700 mb-8">
                        <h3 className="text-2xl font-semibold mb-4">About this farm</h3>
                        <p>{farm.description}</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-semibold mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {farm.amenities.map((amenity, index) => (
                                <div key={index} className="flex items-center text-gray-600">
                                    <Check size={18} className="text-primary mr-2" /> {amenity}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Booking Card */}
            <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-xl sticky top-24 border border-gray-100">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-3xl font-bold text-gray-900">₹{farm.price}</span>
                        <span className="text-gray-500 mb-1">/ night</span>
                    </div>

                    <form onSubmit={handleBooking} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
                            <input
                                type="number"
                                min="1"
                                max={farm.capacity}
                                required
                                value={bookingData.guests}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-lg transform hover:-translate-y-0.5"
                        >
                            Book Now
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-2">You won't be charged yet</p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FarmDetails;

