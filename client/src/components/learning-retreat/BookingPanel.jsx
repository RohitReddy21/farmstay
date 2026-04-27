import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
    ArrowRight, 
    CheckCircle2, 
    Clock, 
    TreePine, 
    Users, 
    Sparkles, 
    ShieldCheck,
    Minus,
    Plus,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    X,
    Mail,
    Phone,
    User
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const BookingPanel = ({
    experience,
    setExperience,
    stayType,
    setStayType,
    guests,
    setGuests,
    selectedStay,
    selectedDate,
    setSelectedDate,
    selectedMonth,
    setSelectedMonth,
    monthDates,
    monthLabel,
    blockedDates,
    seasonalPricing,
    calendarError,
    setCalendarError,
    baseTotal,
    tax,
    grandTotal,
    handleBook,
    isCalendarOpen,
    setIsCalendarOpen,
    activePackage,
    seasonalMultiplier,
    retreatContent,
    guestDetails,
    setGuestDetails,
    isSubmitting
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [confirmationForm, setConfirmationForm] = useState({
        name: '',
        email: '',
        phone: '',
        guests: guests
    });
    const formatMoney = (value) => `Rs ${Math.round(value).toLocaleString('en-IN')}`;
    const packageTitle = experience === 'day' ? retreatContent.packages.day.title : selectedStay.title;
    const packageSubtitle = experience === 'day' ? retreatContent.packages.day.subtitle : selectedStay.subtitle;
    const packageInclusions = experience === 'day'
        ? ['Guided farm tour', 'Hands-on learning', 'Fresh farm meal']
        : selectedStay.inclusions;
    const toDateValue = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isDateAvailable = (date) => {
        const dayOfWeek = date.getDay();
        if (experience === 'day') {
            return dayOfWeek === 6; // Saturday only
        } else {
            return dayOfWeek === 6 || dayOfWeek === 0; // Saturday and Sunday
        }
    };

    const getSundayForSaturday = (saturdayDate) => {
        const sunday = new Date(saturdayDate);
        sunday.setDate(sunday.getDate() + 1);
        return toDateValue(sunday);
    };

    const isDateInRange = (date, startDate, endDate) => {
        const dateValue = toDateValue(date);
        return dateValue >= startDate && dateValue <= endDate;
    };

    const getDateRange = () => {
        if (!selectedDate || experience === 'day') return null;
        
        const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
        const dayOfWeek = selectedDateObj.getDay();
        
        if (dayOfWeek === 6) { // Saturday selected
            return {
                start: selectedDate,
                end: getSundayForSaturday(selectedDateObj)
            };
        } else if (dayOfWeek === 0) { // Sunday selected
            const saturday = new Date(selectedDateObj);
            saturday.setDate(saturday.getDate() - 1);
            return {
                start: toDateValue(saturday),
                end: selectedDate
            };
        }
        return null;
    };

    const dateRange = getDateRange();
    const todayValue = toDateValue(new Date());
    const maxGuests = experience === 'stay' ? selectedStay.maxGuests : 50;
    const normalizeGuests = (value) => {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed)) return 0;
        return Math.min(maxGuests, Math.max(0, parsed));
    };

    useEffect(() => {
        const parsedGuests = Number.parseInt(guests, 10);
        setConfirmationForm((current) => ({
            ...current,
            guests: Number.isNaN(parsedGuests) ? 0 : Math.min(maxGuests, Math.max(0, parsedGuests))
        }));
    }, [guests, maxGuests]);

    const validateConfirmationForm = () => {
        const errors = {};
        
        if (!confirmationForm.name.trim()) {
            errors.name = 'Name is required';
        }
        
        if (!confirmationForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(confirmationForm.email)) {
            errors.email = 'Email is invalid';
        }
        
        if (!confirmationForm.phone.trim()) {
            errors.phone = 'Phone is required';
        } else if (!/^\+?[\d\s\-\(\)]+$/.test(confirmationForm.phone)) {
            errors.phone = 'Phone is invalid';
        }
        
        if (confirmationForm.guests < 0) {
            errors.guests = 'Number of guests cannot be negative';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    return (
        <>
        <motion.aside 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:sticky lg:top-8"
        >
            <div className="rounded-3xl border border-[#dfd1bb] bg-gradient-to-br from-[#fffaf1]/95 to-[#f9f4ed]/95 p-4 shadow-2xl backdrop-blur dark:border-[#31392f] dark:from-[#1a211a]/95 dark:to-[#232823]/95 sm:p-6 lg:rounded-[2.5rem] lg:p-8 xl:p-10">
                {/* Experience Type Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="grid grid-cols-2 gap-2 sm:gap-3"
                >
                    {[
                        ['day', 'Day Experience', Clock],
                        ['stay', '2-Day Farm Stay', TreePine]
                    ].map(([value, label, Icon]) => (
                        <motion.button
                            key={value}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setExperience(value)}
                            className={`relative overflow-hidden rounded-2xl px-3 py-3 text-sm font-bold transition-all duration-300 sm:px-4 sm:py-4 sm:text-base lg:text-lg ${
                                experience === value 
                                    ? 'bg-gradient-to-r from-[#7a5527] to-[#5d3d19] text-white shadow-xl border-2 border-[#d6a23d]/50' 
                                    : 'bg-gradient-to-r from-[#e8dcc8] to-[#dfd1bb] text-[#7a5527] hover:from-[#dfd1bb] hover:to-[#d6c8b8] border-2 border-[#d6a23d]/20 dark:from-[#2a2519] dark:to-[#322f28] dark:text-[#e7c678] dark:hover:from-[#322f28] dark:hover:to-[#3a352c]'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <Icon size={20} className={experience === value ? 'text-white' : 'text-[#7a5527] dark:text-[#e7c678]'} />
                                <span>{label}</span>
                            </div>
                            {experience === value && (
                                <motion.div
                                    layoutId="experienceIndicator"
                                    className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                                    initial={false}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                <motion.div
                    key={`${experience}-${stayType}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-5 rounded-3xl border border-[#e5d2b0] bg-white/60 p-4 shadow-sm dark:border-[#31392f] dark:bg-[#171d17]/75 sm:mt-6 sm:p-5"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b5f25] dark:text-[#e7c678]">
                                Selected experience
                            </p>
                            <h3 className="mt-2 text-xl font-bold text-[#211b14] dark:text-[#fff8ea]">
                                {packageTitle}
                            </h3>
                            <p className="mt-1 text-sm text-[#6b5d4c] dark:text-[#cfc2b2]">
                                {packageSubtitle}
                            </p>
                        </div>
                        <div className="shrink-0 rounded-2xl bg-[#f0dfc5] px-3 py-2 text-right dark:bg-[#2a2519]">
                            <p className="text-xs font-semibold text-[#7a5527] dark:text-[#e7c678]">From</p>
                            <p className="font-bold text-[#211b14] dark:text-[#fff8ea]">{formatMoney(activePackage.basePrice)}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        {packageInclusions.map((item) => (
                            <div key={item} className="rounded-2xl bg-[#f8efdf] px-3 py-2 text-xs font-semibold text-[#67513a] dark:bg-[#232823] dark:text-[#d5c9b7]">
                                {item}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Stay Type Section */}
                {experience === 'stay' && (
                    <div className="mt-8">
                        <h3 className="mb-4 text-xl font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-2xl">Choose Your Stay Type</h3>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {retreatContent.packages.stays.map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => {
                                        setStayType(item.type);
                                        setCalendarError('');
                                    }}
                                    className={`rounded-2xl border-2 p-2 text-center transition-all sm:p-3 ${
                                        stayType === item.type
                                            ? 'border-[#7a5527] bg-[#7a5527] text-white'
                                            : 'border-[#dfd1bb] bg-white text-[#211b14] hover:border-[#d6a23d] dark:border-[#31392f] dark:bg-[#1a211a] dark:text-[#fff8ea]'
                                    }`}
                                >
                                    <p className="text-xs font-bold sm:text-sm">{item.type}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Guests Section */}
                <div className="mt-8">
                        <h3 className="mb-4 text-xl font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-2xl">Number of Guests</h3>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => setGuests(Math.max(0, guests - 1))}
                                className="rounded-full bg-[#e8dcc8] p-2 text-[#7a5527] hover:bg-[#dfd1bb] dark:bg-[#2a2519] dark:text-[#e7c678]"
                                disabled={guests <= 0}
                                type="button"
                            >
                                <Minus size={20} />
                            </button>
                            <input
                                type="number"
                                min="0"
                                max={maxGuests}
                                value={guests}
                                onChange={(event) => setGuests(normalizeGuests(event.target.value))}
                                className="h-12 w-20 rounded-2xl border-2 border-[#dfd1bb] bg-white text-center text-xl font-bold text-[#211b14] outline-none transition focus:border-[#7a5527] focus:ring-2 focus:ring-[#7a5527]/20 dark:border-[#31392f] dark:bg-[#1a211a] dark:text-[#fff8ea]"
                                aria-label="Number of guests"
                            />
                            <button
                                onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                                className="rounded-full bg-[#e8dcc8] p-2 text-[#7a5527] hover:bg-[#dfd1bb] dark:bg-[#2a2519] dark:text-[#e7c678]"
                                disabled={guests >= maxGuests}
                                type="button"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-[#6b5d4c] dark:text-[#cfc2b2]">
                            {experience === 'stay' ? `Maximum ${maxGuests} guests for ${selectedStay.type}.` : 'Type a guest count or use the controls.'}
                        </p>
                    </div>

                {/* Calendar Button */}
                <div className="mt-7">
                    <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#7a5527] mb-3 dark:text-[#e7c678]">
                        {experience === 'day' ? 'Select Saturday' : 'Select Saturday (includes Sunday)'}
                    </p>
                    <button
                        onClick={() => setIsCalendarOpen(true)}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#dfd1bb] bg-[#f9f4ed] p-3 transition-all hover:bg-[#efe4d1] dark:border-[#31392f] dark:bg-[#232823] dark:hover:bg-[#2a2f2a] sm:gap-4 sm:p-4"
                    >
                        {selectedDate ? (
                            <>
                                {experience === 'stay' ? (
                                    <div className="w-full">
                                        <p className="text-xs font-bold text-[#7a5527] dark:text-[#e7c678] uppercase mb-2 text-center">Your Weekend Retreat</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-center">
                                                <p className="text-xs text-[#645747] dark:text-[#d5c9b7] mb-1">Check-in</p>
                                                <p className="text-xs font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-sm">
                                                    {(() => {
                                                        const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
                                                        const dayOfWeek = selectedDateObj.getDay();
                                                        if (dayOfWeek === 0) { // Sunday selected
                                                            const saturday = new Date(selectedDateObj);
                                                            saturday.setDate(saturday.getDate() - 1);
                                                            return saturday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                                        }
                                                        return selectedDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                                    })()}
                                                </p>
                                            </div>
                                            <div className="mx-1 flex-1 sm:mx-3">
                                                <div className="h-0.5 bg-gradient-to-r from-[#d6a23d] to-[#d6a23d] rounded-full"></div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-[#645747] dark:text-[#d5c9b7] mb-1">Check-out</p>
                                                <p className="text-xs font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-sm">
                                                    {(() => {
                                                        const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
                                                        const dayOfWeek = selectedDateObj.getDay();
                                                        if (dayOfWeek === 6) { // Saturday selected
                                                            const sunday = new Date(selectedDateObj);
                                                            sunday.setDate(sunday.getDate() + 1);
                                                            return sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                                        }
                                                        return selectedDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 text-center">
                                        <p className="text-xs font-bold text-[#7a5527] dark:text-[#e7c678] uppercase mb-1">Selected Date</p>
                                        <p className="text-base font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-lg">
                                            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="font-bold text-[#7a5527] dark:text-[#e7c678]">Choose a date</span>
                        )}
                    </button>
                </div>

                {/* Pricing Summary */}
                <div className="mt-6 space-y-4 rounded-3xl border border-[#e5d2b0] bg-white/55 p-4 dark:border-[#31392f] dark:bg-[#171d17]/75">
                    {/* Price Breakdown */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-[#645747] dark:text-[#d5c9b7]">Base Price</span>
                            <span className="text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">{formatMoney(baseTotal)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-[#645747] dark:text-[#d5c9b7]">Taxes (18%) + Total</span>
                            <span className="text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">{formatMoney(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmation(true)} 
                    disabled={isSubmitting}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d6a23d]/30 bg-gradient-to-r from-[#7a5527] to-[#5d3d19] px-4 py-3.5 text-base font-bold text-white shadow-xl transition-all duration-300 hover:from-[#8b6230] hover:to-[#6d441a] disabled:from-[#a8a8a8] disabled:to-[#808080] sm:gap-3 sm:px-6 sm:py-4 sm:text-lg"
                >
                    <>
                        <Sparkles size={20} className="animate-pulse" />
                        {experience === 'day' ? 'Book Day Experience' : 'Book Your Weekend Retreat'}
                        <ArrowRight size={20} />
                    </>
                </motion.button>

                <div className="mt-4 flex items-center gap-2 text-xs text-center text-[#6b5d4c] dark:text-[#cfc2b2] justify-center">
                    <ShieldCheck size={14} />
                    <span>Payment places booking in Pending Approval. Admin confirmation required.</span>
                </div>
            </div>
        </motion.aside>
        
        {/* Confirmation Modal */}
        {createPortal(
            <AnimatePresence>
                {showConfirmation && (
                    <>
                        <div 
                            className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowConfirmation(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4"
                        >
                            <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-[#dfd1bb] bg-white p-5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:border-[#31392f] dark:bg-[#1a211a] sm:p-8">
                            <div className="text-center mb-6">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-[#7a5527] to-[#5d3d19] rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 size={32} className="text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-[#211b14] dark:text-[#fff8ea] mb-2">
                                    Enter Your Details
                                </h3>
                                <p className="text-[#645747] dark:text-[#d5c9b7]">
                                    Please fill in your contact details to confirm booking
                                </p>
                            </div>

                            {/* Customer Details Form */}
                            <div className="mb-6">
                                <div className="bg-[#f9f4ed] dark:bg-[#232823] rounded-2xl p-4">
                                    <h4 className="font-semibold text-[#7a5527] dark:text-[#e7c678] mb-4">Customer Details <span className="text-red-500">*</span></h4>
                                    <div className="space-y-6">
                                        {/* First Row: Name and Email */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Name Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#7a5527] dark:text-[#e7c678] mb-2">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <User size={16} className="absolute left-3 top-3 text-[#7a5527]" />
                                                    <input
                                                        type="text"
                                                        value={confirmationForm.name}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, name: e.target.value })}
                                                        placeholder="Enter your full name"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#dfd1bb] bg-white dark:bg-[#1a211a] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-2 focus:ring-[#7a5527]/20 outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                {formErrors.name && <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>}
                                            </div>

                                            {/* Email Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#7a5527] dark:text-[#e7c678] mb-2">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Mail size={16} className="absolute left-3 top-3 text-[#7a5527]" />
                                                    <input
                                                        type="email"
                                                        value={confirmationForm.email}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, email: e.target.value })}
                                                        placeholder="Enter your email"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#dfd1bb] bg-white dark:bg-[#1a211a] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-2 focus:ring-[#7a5527]/20 outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                {formErrors.email && <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>}
                                            </div>
                                        </div>

                                        {/* Second Row: Phone and Guests */}
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {/* Phone Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#7a5527] dark:text-[#e7c678] mb-2">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Phone size={16} className="absolute left-3 top-3 text-[#7a5527]" />
                                                    <input
                                                        type="tel"
                                                        value={confirmationForm.phone}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, phone: e.target.value })}
                                                        placeholder="Enter your phone number"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#dfd1bb] bg-white dark:bg-[#1a211a] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-2 focus:ring-[#7a5527]/20 outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                {formErrors.phone && <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>}
                                            </div>

                                            {/* Guests Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#7a5527] dark:text-[#e7c678] mb-2">
                                                    Number of Guests <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <Users size={16} className="absolute left-3 top-3 text-[#7a5527]" />
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxGuests}
                                                        value={confirmationForm.guests}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, guests: normalizeGuests(e.target.value) })}
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#dfd1bb] bg-white dark:bg-[#1a211a] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-2 focus:ring-[#7a5527]/20 outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                {formErrors.guests && <p className="text-red-600 text-xs mt-1">{formErrors.guests}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 px-6 py-3 rounded-2xl border-2 border-[#dfd1bb] dark:border-[#31392f] bg-white dark:bg-[#1a211a] text-[#645747] dark:text-[#d5c9b7] font-semibold transition-all duration-300"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (validateConfirmationForm()) {
                                            const details = {
                                                name: confirmationForm.name,
                                                email: confirmationForm.email,
                                                phone: confirmationForm.phone
                                            };
                                            // Update guestDetails with form data
                                            setGuestDetails(details);
                                            // Update guests count
                                            setGuests(confirmationForm.guests);
                                            // Close modal and proceed with booking
                                            setShowConfirmation(false);
                                            handleBook({ guestDetails: details, guests: confirmationForm.guests });
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7a5527] to-[#5d3d19] hover:from-[#8b6230] hover:to-[#6d441a] text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                                                <Sparkles size={16} />
                                            </motion.div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Confirm Booking
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
            document.body
        )}
        </>
    );
};

export default BookingPanel;
