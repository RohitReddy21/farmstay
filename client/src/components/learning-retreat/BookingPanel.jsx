import { useEffect, useState } from 'react';
import axios from 'axios';
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
    X,
    Mail,
    Phone,
    User
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import API_URL from '../../config';

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
    slotAvailability,
    dayAvailability,
    slotLabel,
    slotUnitLabel = 'stay slots',
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
    const { showToast } = useToast();
    const getTenDigitPhone = (value = '') => value.replace(/\D/g, '').slice(0, 10);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [phoneOtpSessionId, setPhoneOtpSessionId] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [phoneOtpStatus, setPhoneOtpStatus] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [isPhoneOtpBusy, setIsPhoneOtpBusy] = useState(false);
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
    const stayTypeHelp = {
        Shared: 'Pay per guest in shared mud cottage accommodation.',
        Couple: 'Book one private couple cottage for up to 2 guests.',
        Group: 'Book the limestone villa for a private group stay.'
    };
    const guestHelpText = experience === 'stay'
        ? selectedStay.type === 'Couple'
            ? 'Choose 1 or 2 guests. One couple cottage slot is used for this booking.'
            : selectedStay.type === 'Group'
                ? 'Choose the total people in your group. Limestone villa capacity is limited.'
                : 'Choose total guests. Shared accommodation is priced per guest.'
        : 'Choose how many people are joining the day farm experience.';
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
    const maxGuests = experience === 'stay' ? selectedStay.maxGuests : Math.max(1, dayAvailability?.available ?? 25);
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
        setPhoneVerified(false);
        setPhoneOtpSessionId('');
        setPhoneOtp('');
        setPhoneOtpStatus('');
    }, [confirmationForm.phone]);

    const requestPhoneOtp = async () => {
        const phone = getTenDigitPhone(confirmationForm.phone);
        const errors = {};

        if (!confirmationForm.name.trim()) errors.name = 'Name is required before sending OTP';
        if (!confirmationForm.email.trim()) errors.email = 'Email is required before sending OTP';
        else if (!/\S+@\S+\.\S+/.test(confirmationForm.email)) errors.email = 'Email is invalid';
        if (phone.length !== 10) errors.phone = 'Phone must be exactly 10 digits';

        setFormErrors((current) => ({ ...current, ...errors }));
        const firstError = Object.values(errors)[0];
        if (firstError) {
            showToast({ type: 'error', title: 'Phone OTP details missing', message: firstError });
            return;
        }

        setIsPhoneOtpBusy(true);
        setPhoneOtpStatus('Sending OTP...');

        try {
            const { data } = await axios.post(`${API_URL}/api/leads/send-phone-otp`, {
                name: confirmationForm.name,
                email: confirmationForm.email,
                phone,
                guests: confirmationForm.guests,
                source: 'learning-retreat-phone-otp',
                retreatName: retreatContent.retreatName,
                marketingConsent: true
            });
            setPhoneOtpSessionId(data.smsSent ? (data.otpSessionId || '') : '');
            setPhoneOtpStatus(data.smsSent
                ? 'OTP sent. Enter it below to verify your number.'
                : 'Lead saved. SMS could not be sent right now, so our team can still follow up by phone.');
            showToast({ type: 'success', title: 'Phone saved', message: 'Customer number saved for follow-up.' });
        } catch (error) {
            const message = error.response?.data?.message || 'Could not send OTP right now.';
            setPhoneOtpStatus(message);
            showToast({ type: 'error', title: 'OTP failed', message });
        } finally {
            setIsPhoneOtpBusy(false);
        }
    };

    const verifyPhoneOtp = async () => {
        if (!phoneOtpSessionId || !phoneOtp.trim()) {
            setPhoneOtpStatus('Enter the OTP sent to your phone.');
            return;
        }

        setIsPhoneOtpBusy(true);
        setPhoneOtpStatus('Verifying OTP...');

        try {
            await axios.post(`${API_URL}/api/leads/verify-phone-otp`, {
                otpSessionId: phoneOtpSessionId,
                phone: getTenDigitPhone(confirmationForm.phone),
                otp: phoneOtp.trim()
            });
            setPhoneVerified(true);
            setPhoneOtpStatus('Phone number verified.');
            showToast({ type: 'success', title: 'Phone verified', message: 'Phone OTP verified successfully.' });
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP.';
            setPhoneOtpStatus(message);
            showToast({ type: 'error', title: 'OTP not verified', message });
        } finally {
            setIsPhoneOtpBusy(false);
        }
    };

    const selectStayVariation = (variation) => {
        setSelectedStayVariation(variation);
        const capacity = Math.max(Number(variation.capacity || 0), Number(selectedStay.maxGuests || 1));
        setGuests((current) => Math.min(Math.max(current, 1), capacity));
        setCalendarError('');
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
        } else if (getTenDigitPhone(confirmationForm.phone).length !== 10) {
            errors.phone = 'Phone must be exactly 10 digits';
        }
        
        if (confirmationForm.guests < 1) {
            errors.guests = 'At least 1 guest is required';
        }
        
        setFormErrors(errors);
        const firstError = Object.values(errors)[0];
        if (firstError) {
            showToast({
                type: 'error',
                title: 'Complete contact details',
                message: firstError
            });
        }
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
                        ['stay', '2 Days Farm Stay + Experience', TreePine]
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
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-2xl">Choose Accommodation</h3>
                            <p className="mt-1 text-sm text-[#6b5d4c] dark:text-[#cfc2b2]">
                                Pick the stay format first, then select the exact cottage or villa below.
                            </p>
                        </div>
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
                                    <p className={`mt-1 hidden text-[10px] leading-tight sm:block ${
                                        stayType === item.type ? 'text-white/80' : 'text-[#6b5d4c] dark:text-[#cfc2b2]'
                                    }`}>
                                        {item.type === 'Shared' ? 'Per guest' : item.type === 'Couple' ? 'Private' : 'Villa'}
                                    </p>
                                </button>
                            ))}
                        </div>
                        <p className="mt-3 rounded-2xl border border-[#ead8b9] bg-white/70 px-3 py-2 text-sm font-semibold text-[#6b5d4c] dark:border-[#31392f] dark:bg-[#232823] dark:text-[#d5c9b7]">
                            {stayTypeHelp[selectedStay.type] || selectedStay.subtitle}
                        </p>
                        {stayVariations.length > 0 && (
                            <div className="mt-6">
                                <label className="mb-3 flex items-center gap-2 text-sm font-bold capitalize text-[#7a5527] dark:text-[#e7c678]">
                                    <div className="h-1 w-4 rounded-full bg-gradient-to-r from-[#7a5527] to-[#d6a23d]"></div>
                                    Choose your {accommodationLabel}
                                    <div className="h-1 w-4 rounded-full bg-gradient-to-r from-[#d6a23d] to-[#7a5527]"></div>
                                </label>
                                <div className="rounded-3xl border border-[#dfd1bb] bg-gradient-to-br from-white via-[#fff9f0] to-[#f7ead5] p-3 shadow-[0_14px_35px_rgba(122,85,39,0.12)] dark:border-[#31392f] dark:from-[#1a211a] dark:via-[#20271f] dark:to-[#2b2a20]">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8b5f25] dark:text-[#e7c678]">
                                        Selected stay unit
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={selectedStayVariation?.type || ''}
                                            onChange={(event) => {
                                                const variation = stayVariations.find((item) => item.type === event.target.value);
                                                if (variation) selectStayVariation(variation);
                                            }}
                                            className="w-full appearance-none rounded-2xl border-2 border-[#dfd1bb] bg-white px-4 py-4 pr-12 text-sm font-black text-[#211b14] outline-none transition-all hover:border-[#d6a23d] focus:border-[#7a5527] focus:ring-4 focus:ring-[#7a5527]/20 dark:border-[#31392f] dark:bg-[#232823] dark:text-[#fff8ea] dark:focus:border-[#e7c678] dark:focus:ring-[#e7c678]/20 sm:text-base"
                                        >
                                            {stayVariations.map((variation) => (
                                                <option key={variation.type} value={variation.type}>
                                                    {variation.label} | {formatMoney(variation.price || stayPricePerGuest)} | Max {variation.capacity || selectedStay.maxGuests} guests
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#7a5527] text-white shadow-md">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                    {selectedStayVariation && (
                                        <div className="mt-3 grid gap-2 rounded-2xl bg-white/70 p-3 dark:bg-[#1a211a]/70 sm:grid-cols-2">
                                            <div className="rounded-2xl bg-[#f0dfc5] px-3 py-2 dark:bg-[#2a2519]">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-[#7a5527] dark:text-[#e7c678]">Price</p>
                                                <p className="text-sm font-black text-[#211b14] dark:text-[#fff8ea]">
                                                    {formatMoney(stayPricePerGuest)} / {stayPriceLabel}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white px-3 py-2 dark:bg-[#232823]">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-[#7a5527] dark:text-[#e7c678]">Capacity</p>
                                                <p className="text-sm font-black text-[#211b14] dark:text-[#fff8ea]">
                                                    Up to {Math.max(Number(selectedStayVariation.capacity || 0), Number(selectedStay.maxGuests || 1))} guests
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Guests Section */}
                <div className="mt-8">
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-[#211b14] dark:text-[#fff8ea] sm:text-2xl">Guests for this booking</h3>
                            <p className="mt-1 text-sm text-[#6b5d4c] dark:text-[#cfc2b2]">{guestHelpText}</p>
                        </div>
                        <div className="rounded-3xl border border-[#ead8b9] bg-white/80 p-4 dark:border-[#31392f] dark:bg-[#232823]/80">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8b5f25] dark:text-[#e7c678]">Selected guests</p>
                                    <p className="mt-1 text-2xl font-black text-[#211b14] dark:text-[#fff8ea]">
                                        {guests} {Number(guests) === 1 ? 'guest' : 'guests'}
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#f0dfc5] px-3 py-1.5 text-xs font-black text-[#7a5527] dark:bg-[#2a2519] dark:text-[#e7c678]">
                                    Max {maxGuests}
                                </span>
                            </div>
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
                        <p className="mt-3 text-xs text-[#6b5d4c] dark:text-[#cfc2b2]">
                            {experience === 'stay'
                                ? `Maximum ${maxGuests} guests for ${selectedStay.type} accommodation.`
                                : `${dayAvailability?.available ?? 25} of ${dayAvailability?.limit ?? 25} day experience seats available for the selected date.`}
                        </p>
                        {experience === 'stay' && slotAvailability && (
                            <p className={`mt-2 text-xs font-bold ${slotAvailability.available > 0 ? 'text-[#527b52]' : 'text-red-600'}`}>
                                {slotAvailability.available > 0
                                    ? `${slotAvailability.available} of ${slotAvailability.limit} ${slotLabel} ${slotUnitLabel} available for this weekend.`
                                    : `${slotLabel} ${slotUnitLabel} are full for this weekend.`}
                            </p>
                        )}
                        </div>
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
                    {calendarError && (
                        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                            {calendarError}
                        </p>
                    )}
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
                            <span className="text-sm font-semibold text-[#645747] dark:text-[#d5c9b7]">Taxes</span>
                            <span className="text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">{formatMoney(tax)}</span>
                        </div>

                        <div className="border-t border-[#d6a23d]/30 pt-3 flex justify-between items-center">
                            <span className="text-base font-bold text-[#211b14] dark:text-[#fff8ea]">Total</span>
                            <span className="text-base font-bold text-[#d6a23d]">{formatMoney(grandTotal)}</span>
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
                        {experience === 'day' ? 'Book Day Experience' : 'Book Farm Stay + Experience'}
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
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, phone: getTenDigitPhone(e.target.value) })}
                                                        placeholder="Enter your phone number"
                                                        inputMode="numeric"
                                                        pattern="[0-9]{10}"
                                                        maxLength="10"
                                                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#dfd1bb] bg-gradient-to-r from-white to-[#fff9f0] dark:from-[#1a211a] dark:to-[#232823] dark:border-[#31392f] text-[#211b14] dark:text-[#fff8ea] placeholder-[#a8a096] focus:border-[#7a5527] focus:ring-4 focus:ring-[#7a5527]/20 outline-none transition-all duration-300 hover:border-[#d6a23d] hover:shadow-lg dark:focus:border-[#e7c678] dark:focus:ring-[#e7c678]/20 dark:hover:border-[#e7c678] text-sm"
                                                    />
                                                    <div className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full bg-gradient-to-r from-[#7a5527]/20 via-[#d6a23d]/30 to-[#7a5527]/20 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"></div>
                                                </div>
                                                {formErrors.phone && <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>}
                                                <div className="mt-3 rounded-2xl border border-[#ead8b9] bg-white/70 p-3 dark:border-[#31392f] dark:bg-[#171d17]">
                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <button
                                                            type="button"
                                                            onClick={requestPhoneOtp}
                                                            disabled={isPhoneOtpBusy || phoneVerified}
                                                            className="flex-1 rounded-xl border border-[#7a5527] px-3 py-2 text-xs font-bold text-[#7a5527] transition hover:bg-[#f6ead8] disabled:cursor-not-allowed disabled:opacity-55 dark:border-[#e7c678] dark:text-[#e7c678] dark:hover:bg-[#232823]"
                                                        >
                                                            {phoneVerified ? 'Phone Verified' : phoneOtpSessionId ? 'Resend OTP' : 'Send Phone OTP'}
                                                        </button>
                                                        {phoneOtpSessionId && !phoneVerified && (
                                                            <div className="flex flex-1 gap-2">
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    maxLength="6"
                                                                    value={phoneOtp}
                                                                    onChange={(event) => setPhoneOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                                                    placeholder="OTP"
                                                                    className="min-w-0 flex-1 rounded-xl border border-[#dfd1bb] px-3 py-2 text-xs font-bold outline-none focus:border-[#7a5527] dark:border-[#31392f] dark:bg-[#232823] dark:text-white"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={verifyPhoneOtp}
                                                                    disabled={isPhoneOtpBusy}
                                                                    className="rounded-xl bg-[#7a5527] px-3 py-2 text-xs font-bold text-white disabled:opacity-55"
                                                                >
                                                                    Verify
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-[11px] leading-relaxed text-[#7a5527] dark:text-[#d5c9b7]">
                                                        {phoneOtpStatus || 'Optional: verify phone now so our team can follow up even if you do not finish booking.'}
                                                    </p>
                                                </div>
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
