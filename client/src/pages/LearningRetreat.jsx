import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, CreditCard, MessageCircle, ShoppingBag, X } from 'lucide-react';
import API_URL from '../config';
import { useCart } from '../context/CartContext';

// Import components
import HeroSection from '../components/learning-retreat/HeroSection';
import RetreatHeader from '../components/learning-retreat/RetreatHeader';
import PropertyImageGallery from '../components/learning-retreat/PropertyImageGallery';
import BookingPanel from '../components/learning-retreat/BookingPanel';
import CalendarModal from '../components/learning-retreat/CalendarModal';
import AudienceSection from '../components/learning-retreat/AudienceSection';
import StayOptionsSection from '../components/learning-retreat/StayOptionsSection';
import GallerySection from '../components/learning-retreat/GallerySection';
import ScheduleSection from '../components/learning-retreat/ScheduleSection';
import FAQSection from '../components/learning-retreat/FAQSection';
import ContactSection from '../components/learning-retreat/ContactSection';
import Lightbox from '../components/learning-retreat/Lightbox';
import retreatContent from '../components/learning-retreat/RetreatContent';

// Utility functions
const formatMoney = (value) => `Rs ${Math.round(value).toLocaleString('en-IN')}`;

const toDateValue = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const addDays = (dateValue, days) => {
    const date = new Date(`${dateValue}T00:00:00`);
    date.setDate(date.getDate() + days);
    return toDateValue(date);
};

const isSaturday = (dateValue) => {
    if (!dateValue) return false;
    return new Date(`${dateValue}T00:00:00`).getDay() === 6;
};

// Floating WhatsApp Component
const FloatingWhatsApp = ({ phone }) => (
    <a
        href={`https://wa.me/${phone.replace(/\D/g, '')}?text=Hi! I'm interested in the Learning Retreat`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 lg:bottom-8 lg:right-8"
        aria-label="Contact on WhatsApp"
    >
        <MessageCircle size={24} />
    </a>
);

const LearningRetreat = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [farms, setFarms] = useState([]);
    const [experience, setExperience] = useState('day');
    const [stayType, setStayType] = useState('Solo');
    const [guests, setGuests] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(() => new Date());
    const [calendarError, setCalendarError] = useState('');
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [showBrochure, setShowBrochure] = useState(false);
    const [leadStatus, setLeadStatus] = useState('');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: '', email: '', phone: '', guests: 1 });
    const [guestDetails, setGuestDetails] = useState({ name: '', email: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);

    const selectedStay = useMemo(
        () => retreatContent.packages.stays.find((item) => item.type === stayType) || retreatContent.packages.stays[0],
        [stayType]
    );

    const activePackage = experience === 'day' ? retreatContent.packages.day : selectedStay;
    const seasonalMultiplier = selectedDate ? (retreatContent.seasonalPricing[selectedDate] || 1) : 1;
    const baseTotal = activePackage.basePrice * (experience === 'day' ? guests : 1) * seasonalMultiplier;
    const tax = Math.round(baseTotal * activePackage.taxRate || baseTotal * 0.18);
    const grandTotal = Math.round(baseTotal + tax);

    // Generate calendar dates
    const monthDates = useMemo(() => {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const dates = [];
        const current = new Date(startDate);
        
        while (current <= lastDay || current.getDay() !== 0) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    }, [selectedMonth]);

    const monthLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    useEffect(() => {
        document.title = `${retreatContent.retreatName} | Brown Cows Organic Dairy`;

        const description = retreatContent.subtitle;
        const ensureMeta = (selector, attr, value, content) => {
            let tag = document.head.querySelector(selector);
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, value);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        ensureMeta('meta[name="description"]', 'name', 'description', description);
        ensureMeta('meta[property="og:title"]', 'property', 'og:title', retreatContent.retreatName);
        ensureMeta('meta[property="og:description"]', 'property', 'og:description', description);
        ensureMeta('meta[property="og:image"]', 'property', 'og:image', retreatContent.heroImage);

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', `${window.location.origin}/2-day-learning-retreat`);

        const schema = document.createElement('script');
        schema.type = 'application/ld+json';
        schema.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristTrip',
            name: retreatContent.retreatName,
            description,
            image: retreatContent.heroImage,
            provider: { '@type': 'Organization', name: 'Brown Cows Organic Dairy' },
            offers: { '@type': 'Offer', priceCurrency: 'INR', price: 3500 }
        });
        document.head.appendChild(schema);

        return () => {
            document.head.removeChild(schema);
        };
    }, []);

    useEffect(() => {
        axios.get(`${API_URL}/api/farms`)
            .then(({ data }) => setFarms(Array.isArray(data) ? data : []))
            .catch(() => setFarms([]));
    }, []);

    useEffect(() => {
        if (experience === 'stay') {
            setGuests((current) => Math.min(Math.max(current, 0), selectedStay.maxGuests));
        }
    }, [experience, selectedStay]);

    const resolveFarmForBooking = () => {
        const hint = activePackage.propertyTitleHint;
        return farms.find((farm) => farm.title?.toLowerCase().includes(hint.toLowerCase())) || farms[0];
    };

    const handleBook = async (overrides = {}) => {
        const bookingGuestDetails = overrides.guestDetails || guestDetails;
        const bookingGuests = overrides.guests ?? guests;
        const bookingBaseTotal = activePackage.basePrice * (experience === 'day' ? bookingGuests : 1) * seasonalMultiplier;
        const bookingTax = Math.round(bookingBaseTotal * activePackage.taxRate || bookingBaseTotal * 0.18);
        const bookingGrandTotal = Math.round(bookingBaseTotal + bookingTax);

        // Validation
        const errors = {};
        if (!bookingGuestDetails.name.trim()) errors.name = 'Name is required';
        if (!bookingGuestDetails.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(bookingGuestDetails.email)) errors.email = 'Email is invalid';
        if (!bookingGuestDetails.phone.trim()) errors.phone = 'Phone is required';
        if (!selectedDate) errors.date = 'Please select a date';

        if (Object.keys(errors).length > 0) {
            setCalendarError(errors.date || 'Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const dayOfWeek = new Date(`${selectedDate}T00:00:00`).getDay();
            const isSat = dayOfWeek === 6;
            const isSun = dayOfWeek === 0;
            
            if (experience === 'day' && !isSat) {
                setCalendarError('Only Saturdays are available for day experiences.');
                setIsSubmitting(false);
                return;
            }
            
            if (experience === 'stay' && !isSat && !isSun) {
                setCalendarError('Only Saturdays and Sundays are available for 2-day retreats.');
                setIsSubmitting(false);
                return;
            }
            
            if (retreatContent.blockedDates.includes(selectedDate)) {
                setCalendarError('This date is blocked. Please choose another date.');
                setIsSubmitting(false);
                return;
            }

            const linkedFarm = resolveFarmForBooking();
            if (!linkedFarm?._id) {
                setCalendarError('Booking data is still loading. Please try again in a moment.');
                setIsSubmitting(false);
                return;
            }

            const endDate = experience === 'day' ? addDays(selectedDate, 1) : addDays(selectedDate, 2);
            const packageLabel = experience === 'day' ? 'Day Experience' : `${stayType} 2-Day Farm Stay`;

            // Match the farmstay flow: add selection to cart, then checkout creates the booking/payment order.
            addToCart({
                propertyId: linkedFarm._id,
                property: {
                    ...linkedFarm,
                    title: `${retreatContent.retreatName} - ${packageLabel}`,
                    location: retreatContent.location,
                    images: [retreatContent.heroImage, ...(linkedFarm.images || [])]
                },
                startDate: selectedDate,
                endDate,
                guests: bookingGuests,
                guestDetails: {
                    name: bookingGuestDetails.name,
                    email: bookingGuestDetails.email,
                    phone: bookingGuestDetails.phone,
                    specialRequests: `${packageLabel}; Pending approval after payment`
                },
                pricing: {
                    basePrice: Math.round(bookingBaseTotal),
                    nights: experience === 'day' ? 1 : 2,
                    totalPrice: Math.round(bookingBaseTotal),
                    tax: bookingTax,
                    grandTotal: bookingGrandTotal,
                    addOns: [],
                    status: 'Pending Approval'
                },
                retreatMeta: {
                    package: packageLabel,
                    stayType: experience === 'day' ? null : stayType,
                    seasonalMultiplier
                }
            });

            setBookingSuccess({
                packageLabel,
                total: bookingGrandTotal
            });

            window.setTimeout(() => {
                navigate('/cart');
            }, 1500);
        } catch (error) {
            console.error('Booking error:', error);
            setCalendarError(error.response?.data?.message || 'An error occurred while booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitLead = async (event) => {
        event.preventDefault();
        setLeadStatus('Saving your request...');

        try {
            await axios.post(`${API_URL}/api/leads`, {
                ...leadForm,
                source: '2-day-learning-retreat',
                retreatName: retreatContent.retreatName
            });
            setLeadStatus('Thank you. Your brochure download has started.');
        } catch (error) {
            setLeadStatus('Your brochure download has started. We could not save the lead right now.');
        }

        // Simulate brochure download
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(`
BROWN COWS DAIRY - 2-DAY LEARNING RETREAT

${retreatContent.title}

${retreatContent.subtitle}

RETREAT HIGHLIGHTS:
${retreatContent.highlights.map(h => `• ${h}`).join('\n')}

PACKAGES:
• Day Experience: ${formatMoney(retreatContent.packages.day.basePrice)} per person
• Solo Stay: ${formatMoney(retreatContent.packages.stays[0].basePrice)} per person
• Couple Stay: ${formatMoney(retreatContent.packages.stays[1].basePrice)} per couple
• Group Stay: ${formatMoney(retreatContent.packages.stays[2].basePrice)} per group

LOCATION:
${retreatContent.location}

CONTACT:
📱 ${retreatContent.whatsapp}
📧 ${retreatContent.email}

For bookings and inquiries, visit: ${window.location.origin}
        `);
        link.download = retreatContent.brochureFileName;
        link.click();
    };

    return (
        <div className="-mx-4 -my-8 overflow-x-hidden bg-[#f5efe3] text-[#211b14] dark:bg-[#111611] dark:text-[#f7f0e4]">
            <FloatingWhatsApp phone={retreatContent.whatsapp} />

            <HeroSection
                retreatContent={retreatContent}
                setShowBrochure={setShowBrochure}
                onBookNow={() => {
                    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    window.setTimeout(() => setIsCalendarOpen(true), 450);
                }}
            />

            <main className="w-full space-y-16 py-14 sm:space-y-24 sm:py-20 lg:space-y-32 lg:py-24">
                <div className="mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-10">
                <section id="booking" className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)] lg:items-start lg:gap-12">
                    <div className="space-y-8">
                        <RetreatHeader retreatContent={retreatContent} />
                        
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <PropertyImageGallery 
                                experience={experience}
                                stayType={stayType}
                                stayOptions={retreatContent.stayOptions}
                                linkedFarm={resolveFarmForBooking()}
                                retreatHeroImage={retreatContent.heroImage}
                            />
                        </motion.div>
                    </div>

                    <div className="lg:sticky lg:top-8">
                        <BookingPanel
                            experience={experience}
                            setExperience={setExperience}
                            stayType={stayType}
                            setStayType={setStayType}
                            guests={guests}
                            setGuests={setGuests}
                            selectedStay={selectedStay}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            selectedMonth={selectedMonth}
                            setSelectedMonth={setSelectedMonth}
                            monthDates={monthDates}
                            monthLabel={monthLabel}
                            blockedDates={retreatContent.blockedDates}
                            seasonalPricing={retreatContent.seasonalPricing}
                            calendarError={calendarError}
                            setCalendarError={setCalendarError}
                            baseTotal={baseTotal}
                            tax={tax}
                            grandTotal={grandTotal}
                            handleBook={handleBook}
                            isCalendarOpen={isCalendarOpen}
                            setIsCalendarOpen={setIsCalendarOpen}
                            activePackage={activePackage}
                            seasonalMultiplier={seasonalMultiplier}
                            retreatContent={retreatContent}
                            guestDetails={guestDetails}
                            setGuestDetails={setGuestDetails}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </section>

                <div className="h-4 sm:h-8 lg:h-12"></div>

                <AudienceSection audience={retreatContent.audience} />
                
                <StayOptionsSection stayOptions={retreatContent.stayOptions} />
                
                <div className="h-4 sm:h-8"></div>
                
                <ScheduleSection schedule={retreatContent.schedule} />
                
                <div className="h-4 sm:h-8"></div>
                
                <GallerySection 
                    gallery={retreatContent.gallery} 
                    lightboxIndex={lightboxIndex}
                    setLightboxIndex={setLightboxIndex}
                />
                
                <div className="h-4 sm:h-8"></div>
                
                <FAQSection faqs={retreatContent.faqs} />
                
                <div className="h-4 sm:h-8"></div>
                
                <ContactSection retreatContent={retreatContent} />

                <Lightbox
                    index={lightboxIndex}
                    images={retreatContent.gallery}
                    onClose={() => setLightboxIndex(null)}
                    onPrev={() => setLightboxIndex((lightboxIndex + retreatContent.gallery.length - 1) % retreatContent.gallery.length)}
                    onNext={() => setLightboxIndex((lightboxIndex + 1) % retreatContent.gallery.length)}
                />
                </div>
            </main>

            {/* Booking Success Redirect */}
            <AnimatePresence>
                {bookingSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#21170d]/65 p-4 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 18, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 18, scale: 0.96 }}
                            transition={{ duration: 0.25 }}
                            className="w-full max-w-md rounded-[2rem] border border-[#e4c58f] bg-[#fffaf1] p-6 text-center shadow-[0_24px_80px_rgba(52,34,16,0.35)] dark:border-[#31392f] dark:bg-[#151b15] sm:p-8"
                        >
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#527b52] text-white shadow-xl">
                                <CheckCircle2 size={34} />
                            </div>
                            <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-[#8b5f25] dark:text-[#e7c678]">
                                Booking details confirmed
                            </p>
                            <h3 className="mt-3 text-2xl font-bold text-[#211b14] dark:text-[#fff8ea]">
                                Added to your cart
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-[#645747] dark:text-[#d5c9b7]">
                                {bookingSuccess.packageLabel} is ready. Taking you to the cart review page now.
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                                <div className="rounded-2xl bg-[#f4ead8] p-4 dark:bg-[#232823]">
                                    <ShoppingBag className="mb-2 text-[#7a5527] dark:text-[#e7c678]" size={20} />
                                    <p className="text-xs text-[#645747] dark:text-[#d5c9b7]">Cart total</p>
                                    <p className="font-bold text-[#211b14] dark:text-[#fff8ea]">{formatMoney(bookingSuccess.total)}</p>
                                </div>
                                <div className="rounded-2xl bg-[#f4ead8] p-4 dark:bg-[#232823]">
                                    <CreditCard className="mb-2 text-[#7a5527] dark:text-[#e7c678]" size={20} />
                                    <p className="text-xs text-[#645747] dark:text-[#d5c9b7]">Next step</p>
                                    <p className="font-bold text-[#211b14] dark:text-[#fff8ea]">Review cart</p>
                                </div>
                            </div>
                            <div className="mx-auto mt-6 h-1.5 w-28 overflow-hidden rounded-full bg-[#ead7b8] dark:bg-[#31392f]">
                                <motion.div
                                    className="h-full rounded-full bg-[#7a5527]"
                                    initial={{ width: '0%' }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 1.5, ease: 'linear' }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Calendar Modal */}
            <AnimatePresence>
                {isCalendarOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-50 bg-[#21170d]/55 backdrop-blur-md"
                            onClick={() => setIsCalendarOpen(false)}
                        />
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="pointer-events-auto w-full max-w-[380px]">
                                <CalendarModal
                                    experience={experience}
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                    selectedMonth={selectedMonth}
                                    setSelectedMonth={setSelectedMonth}
                                    monthDates={monthDates}
                                    monthLabel={monthLabel}
                                    blockedDates={retreatContent.blockedDates}
                                    setCalendarError={setCalendarError}
                                    onClose={() => setIsCalendarOpen(false)}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Brochure Modal */}
            <AnimatePresence>
                {showBrochure && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setShowBrochure(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-[#1c211c] sm:p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowBrochure(false)}
                                className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                            >
                                <X size={20} />
                            </button>
                            
                            <h3 className="text-2xl font-bold mb-4 text-[#211b14] dark:text-[#fff8ea]">
                                Download Retreat Brochure
                            </h3>
                            
                            <form onSubmit={submitLead} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={leadForm.name}
                                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#7a5527] focus:outline-none focus:ring-2 focus:ring-[#7a5527]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={leadForm.email}
                                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#7a5527] focus:outline-none focus:ring-2 focus:ring-[#7a5527]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={leadForm.phone}
                                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#7a5527] focus:outline-none focus:ring-2 focus:ring-[#7a5527]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={leadStatus === 'Saving your request...'}
                                    className="w-full rounded-full bg-[#7a5527] px-6 py-3 font-semibold text-white transition hover:bg-[#5d3d19] disabled:opacity-50"
                                >
                                    {leadStatus === 'Saving your request...' ? 'Saving...' : 'Download Brochure'}
                                </button>
                                
                                {leadStatus && (
                                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                                        {leadStatus}
                                    </p>
                                )}
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LearningRetreat;
