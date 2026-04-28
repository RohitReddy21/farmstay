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
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
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
    stayVariations = [],
    selectedStayVariation,
    setSelectedStayVariation,
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
    isSubmitting,
    stayAccommodationPrice = 0,
    stayPricePerGuest = 0,
    guestExperienceTotal = 0,
    dayExperiencePrice = 0
}) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isStaySelectorOpen, setIsStaySelectorOpen] = useState(false);
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
    const isFlatStayPrice = selectedStay.pricingMode === 'flat';
    const stayPriceLabel = selectedStay.type === 'Group' ? 'villa' : selectedStay.type === 'Couple' ? 'cottage' : 'guest';
    const accommodationLabel = selectedStay.type === 'Group' ? 'limestone villa' : 'mud cottage';
    const selectedCottageName = selectedStayVariation?.availableCottages?.[0] || selectedStayVariation?.type;
    const packagePriceNote = experience === 'day'
        ? 'per person'
        : isFlatStayPrice
            ? 'package starts'
            : 'stay + experience';
    const packageBody = experience === 'day'
        ? 'Guided farm learning, hands-on activities, fresh farm meal, and nature time.'
        : selectedCottageName
            ? `${selectedCottageName} selected for ${selectedStay.type.toLowerCase()} accommodation.`
            : `${selectedStay.subtitle}. Choose a cottage and guest count below.`;
    const packagePricingRows = experience === 'day'
        ? [
            ['Farm experience', `${formatMoney(dayExperiencePrice)} / guest`]
        ]
        : [
            [
                'Stay',
                isFlatStayPrice
                    ? `${formatMoney(stayPricePerGuest)} / ${stayPriceLabel}`
                    : `${formatMoney(stayPricePerGuest)} / guest`
            ],
            ['Farm experience', `${formatMoney(dayExperiencePrice)} / guest`]
        ];
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
        if (Number.isNaN(parsed)) return 1;
        return Math.min(maxGuests, Math.max(1, parsed));
    };

    useEffect(() => {
        const parsedGuests = Number.parseInt(guests, 10);
        setConfirmationForm((current) => ({
            ...current,
            guests: Number.isNaN(parsedGuests) ? 1 : Math.min(maxGuests, Math.max(1, parsedGuests))
        }));
    }, [guests, maxGuests]);

    useEffect(() => {
        setIsStaySelectorOpen(false);
    }, [stayType, experience]);

    const selectStayVariation = (variation) => {
        setSelectedStayVariation(variation);
        setGuests((current) => Math.min(Math.max(current, 1), variation.capacity || selectedStay.maxGuests));
        setCalendarError('');
        setIsStaySelectorOpen(false);
    };

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
        
        if (confirmationForm.guests < 1) {
            errors.guests = 'At least 1 guest is required';
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
                    className="relative mt-5 overflow-hidden rounded-3xl border border-[#d6a23d]/45 bg-gradient-to-br from-white to-[#fff4df] p-4 shadow-[0_18px_42px_rgba(122,85,39,0.16)] dark:border-[#31392f] dark:from-[#171d17] dark:to-[#242018] sm:mt-6 sm:p-5"
                >
                    <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[4.5rem] bg-[#f0dfc5]/70 dark:bg-[#2a2519]" />
                    <div className="relative">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#8b5f25] dark:text-[#e7c678]">
                                    Selected retreat
                                </p>
                                <h3 className="mt-2 text-lg font-black leading-tight text-[#211b14] dark:text-[#fff8ea] sm:text-xl">
                                    {packageTitle}
                                </h3>
                                <p className="mt-1 text-sm leading-relaxed text-[#6b5d4c] dark:text-[#cfc2b2]">
                                    {packageBody}
                                </p>
                            </div>
                            <div className="shrink-0 rounded-2xl border border-[#e0c795] bg-white px-3 py-2 text-right shadow-sm dark:border-[#31392f] dark:bg-[#232823]">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7a5527] dark:text-[#e7c678]">From</p>
                                <p className="text-lg font-black text-[#211b14] dark:text-[#fff8ea]">{formatMoney(activePackage.basePrice)}</p>
                                <p className="max-w-20 text-[10px] font-semibold leading-tight text-[#7a5527] dark:text-[#e7c678]">{packagePriceNote}</p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-[#ead8b9] bg-white/70 p-3 dark:border-[#31392f] dark:bg-[#232823]/80">
                            <div className="space-y-2">
                                {packagePricingRows.map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-bold text-[#6b5d4c] dark:text-[#cfc2b2]">{label}</span>
                                        <span className="font-black text-[#211b14] dark:text-[#fff8ea]">{value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {packageInclusions.slice(0, 4).map((item) => (
                                    <div key={item} className="flex items-center gap-2 rounded-xl bg-[#f6ead8] px-3 py-2 text-xs font-bold text-[#67513a] dark:bg-[#1a211a] dark:text-[#d5c9b7]">
                                        <CheckCircle2 size={14} className="shrink-0 text-[#8b5f25] dark:text-[#e7c678]" />
                                        <span className="min-w-0">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                        {stayVariations.length > 0 && (
                            <div className="mt-6">
                                <label className="mb-3 flex items-center gap-2 text-sm font-bold capitalize text-[#7a5527] dark:text-[#e7c678]">
                                    <div className="h-1 w-4 rounded-full bg-gradient-to-r from-[#7a5527] to-[#d6a23d]"></div>
                                    Select {accommodationLabel}
                                    <div className="h-1 w-4 rounded-full bg-gradient-to-r from-[#d6a23d] to-[#7a5527]"></div>
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsStaySelectorOpen((current) => !current)}
                                        className="group w-full overflow-hidden rounded-3xl border-2 border-[#dfd1bb] bg-gradient-to-br from-white via-[#fff9f0] to-[#f7ead5] p-4 text-left shadow-[0_14px_35px_rgba(122,85,39,0.12)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d6a23d] hover:shadow-[0_18px_45px_rgba(122,85,39,0.18)] focus:border-[#7a5527] focus:ring-4 focus:ring-[#7a5527]/20 dark:border-[#31392f] dark:from-[#1a211a] dark:via-[#20271f] dark:to-[#2b2a20] dark:focus:border-[#e7c678] dark:focus:ring-[#e7c678]/20"
                                        aria-expanded={isStaySelectorOpen}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8b5f25] dark:text-[#e7c678]">
                                                    Selected {accommodationLabel}
                                                </p>
                                                <p className="mt-1 truncate text-sm font-black text-[#211b14] dark:text-[#fff8ea]">
                                                    {selectedStayVariation?.label || `Choose ${accommodationLabel}`}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-[#f0dfc5] px-3 py-1 text-[11px] font-black text-[#7a5527] dark:bg-[#2a2519] dark:text-[#e7c678]">
                                                        {formatMoney(stayPricePerGuest)} / {stayPriceLabel}
                                                    </span>
                                                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#6b5d4c] dark:bg-[#232823] dark:text-[#d5c9b7]">
                                                        Max {selectedStayVariation?.capacity || selectedStay.maxGuests} guests
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7a5527] text-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                                                <ChevronDown size={22} className={`transition-transform duration-300 ${isStaySelectorOpen ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isStaySelectorOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 8, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                transition={{ duration: 0.18 }}
                                                className="absolute left-0 right-0 top-full z-30 overflow-hidden rounded-3xl border border-[#d9bf8d] bg-[#fffaf1] p-2 shadow-[0_22px_55px_rgba(68,45,19,0.24)] dark:border-[#31392f] dark:bg-[#171d17]"
                                            >
                                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                                    {stayVariations.map((variation) => {
                                                        const isSelected = selectedStayVariation?.type === variation.type;
                                                        return (
                                                            <button
                                                                key={variation.type}
                                                                type="button"
                                                                onClick={() => selectStayVariation(variation)}
                                                                className={`w-full rounded-2xl border p-3 text-left transition-all duration-200 ${
                                                                    isSelected
                                                                        ? 'border-[#7a5527] bg-[#7a5527] text-white shadow-md'
                                                                        : 'border-[#ead8b9] bg-white text-[#211b14] hover:border-[#d6a23d] hover:bg-[#fff4df] dark:border-[#31392f] dark:bg-[#232823] dark:text-[#fff8ea] dark:hover:border-[#e7c678]'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-black leading-tight">{variation.label}</p>
                                                                        <p className={`mt-1 text-xs font-semibold ${isSelected ? 'text-white/80' : 'text-[#6b5d4c] dark:text-[#cfc2b2]'}`}>
                                                                            {variation.availableCottages?.[0] || variation.type}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex shrink-0 items-center gap-2">
                                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-black ${isSelected ? 'bg-white/15 text-white' : 'bg-[#f3e5cc] text-[#7a5527] dark:bg-[#1a211a] dark:text-[#e7c678]'}`}>
                                                                            {variation.capacity || selectedStay.maxGuests} guests
                                                                        </span>
                                                                        {isSelected && <Check size={18} />}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Guests Section */}
                <div className="mt-8">
                        <h3 className="mb-4 text-xl font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-2xl">Number of Guests</h3>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <button
                                onClick={() => setGuests(Math.max(1, guests - 1))}
                                className="group rounded-full bg-gradient-to-r from-[#e8dcc8] to-[#dfd1bb] p-3 text-[#7a5527] shadow-md transition-all duration-300 hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed dark:from-[#2a2519] dark:to-[#322f28] dark:text-[#e7c678]"
                                disabled={guests <= 1}
                                type="button"
                            >
                                <Minus size={20} className="transition-transform duration-300 group-hover:rotate-180" />
                            </button>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max={maxGuests}
                                    value={guests}
                                    onChange={(event) => setGuests(normalizeGuests(event.target.value))}
                                    className="h-14 w-24 rounded-2xl border-2 border-[#dfd1bb] bg-gradient-to-r from-white to-[#fff9f0] text-center text-xl font-bold text-[#211b14] outline-none transition-all duration-300 hover:border-[#d6a23d] hover:shadow-lg focus:border-[#7a5527] focus:ring-4 focus:ring-[#7a5527]/20 dark:border-[#31392f] dark:from-[#1a211a] dark:to-[#232823] dark:text-[#fff8ea] dark:hover:border-[#e7c678] dark:focus:border-[#e7c678] dark:focus:ring-[#e7c678]/20"
                                    aria-label="Number of guests"
                                />
                                <div className="absolute -bottom-1 left-1/2 h-1 w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7a5527]/20 via-[#d6a23d]/30 to-[#7a5527]/20"></div>
                            </div>
                            <button
                                onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
                                className="group rounded-full bg-gradient-to-r from-[#e8dcc8] to-[#dfd1bb] p-3 text-[#7a5527] shadow-md transition-all duration-300 hover:shadow-lg hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed dark:from-[#2a2519] dark:to-[#322f28] dark:text-[#e7c678]"
                                disabled={guests >= maxGuests}
                                type="button"
                            >
                                <Plus size={20} className="transition-transform duration-300 group-hover:rotate-90" />
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
                        {experience === 'stay' && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-[#645747] dark:text-[#d5c9b7]">
                                    Stay ({formatMoney(stayPricePerGuest)}{isFlatStayPrice ? ` / ${stayPriceLabel}` : ` x ${guests}`})
                                </span>
                                <span className="text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">{formatMoney(stayAccommodationPrice)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-[#645747] dark:text-[#d5c9b7]">
                                Experience ({formatMoney(dayExperiencePrice)} x {guests})
                            </span>
                            <span className="text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">{formatMoney(guestExperienceTotal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-[#645747] dark:text-[#d5c9b7]">Subtotal</span>
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
                                                <div className="relative group">
                                                    <User size={16} className="absolute left-3 top-3 text-[#7a5527] transition-colors duration-300 group-focus-within:text-[#5d3d19]" />
                                                    <input
                                                        type="text"
                                                        value={confirmationForm.name}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, name: e.target.value })}
                                                        placeholder="Enter your full name"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#dfd1bb] bg-gradient-to-r from-white to-[#fff9f0] dark:from-[#1a211a] dark:to-[#232823] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-4 focus:ring-[#7a5527]/20 outline-none transition-all duration-300 hover:border-[#d6a23d] hover:shadow-lg dark:focus:border-[#e7c678] dark:focus:ring-[#e7c678]/20 dark:hover:border-[#e7c678] text-sm"
                                                    />
                                                    <div className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-[#7a5527]/20 via-[#d6a23d]/30 to-[#7a5527]/20 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
                                                </div>
                                                {formErrors.name && <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>}
                                            </div>

                                            {/* Email Field */}
                                            <div>
                                                <label className="block text-sm font-semibold text-[#7a5527] dark:text-[#e7c678] mb-2">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative group">
                                                    <Mail size={16} className="absolute left-3 top-3 text-[#7a5527] transition-colors duration-300 group-focus-within:text-[#5d3d19]" />
                                                    <input
                                                        type="email"
                                                        value={confirmationForm.email}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, email: e.target.value })}
                                                        placeholder="Enter your email"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#dfd1bb] bg-gradient-to-r from-white to-[#fff9f0] dark:from-[#1a211a] dark:to-[#232823] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-4 focus:ring-[#7a5527]/20 outline-none transition-all duration-300 hover:border-[#d6a23d] hover:shadow-lg dark:focus:border-[#e7c678] dark:focus:ring-[#e7c678]/20 dark:hover:border-[#e7c678] text-sm"
                                                    />
                                                    <div className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-[#7a5527]/20 via-[#d6a23d]/30 to-[#7a5527]/20 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
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
                                                <div className="relative group">
                                                    <Phone size={16} className="absolute left-3 top-3 text-[#7a5527] transition-colors duration-300 group-focus-within:text-[#5d3d19]" />
                                                    <input
                                                        type="tel"
                                                        value={confirmationForm.phone}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, phone: e.target.value })}
                                                        placeholder="Enter your phone number"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#dfd1bb] bg-gradient-to-r from-white to-[#fff9f0] dark:from-[#1a211a] dark:to-[#232823] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-4 focus:ring-[#7a5527]/20 outline-none transition-all duration-300 hover:border-[#d6a23d] hover:shadow-lg dark:focus:border-[#e7c678] dark:focus:ring-[#e7c678]/20 dark:hover:border-[#e7c678] text-sm"
                                                    />
                                                    <div className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-[#7a5527]/20 via-[#d6a23d]/30 to-[#7a5527]/20 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
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
                                                        min="1"
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
