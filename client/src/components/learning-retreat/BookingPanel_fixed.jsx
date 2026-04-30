import { useState } from 'react';
import { motion } from 'framer-motion';
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
    ChevronDown,
    Mail,
    Phone,
    User
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

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
    const { showToast } = useToast();
    const getTenDigitPhone = (value = '') => value.replace(/\D/g, '').slice(0, 10);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [confirmationForm, setConfirmationForm] = useState({
        name: '',
        email: '',
        phone: '',
        guests: guests
    });
    const formatMoney = (value) => `Rs ${Math.round(value).toLocaleString('en-IN')}`;
    const toDateValue = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const isDateAvailable = (date) => {
        const dayOfWeek = date.getDay();
        const isSat = dayOfWeek === 6;
        const isSun = dayOfWeek === 0;
        
        if (experience === 'day' && !isSat) {
            return false;
        }
        
        if (experience === 'stay' && !isSat && !isSun) {
            return false;
        }
        
        const dateValue = toDateValue(date);
        return !blockedDates.includes(dateValue);
    };

    const getDateRange = () => {
        if (selectedDate && experience === 'stay') {
            const selected = new Date(`${selectedDate}T00:00:00`);
            const saturday = new Date(selected);
            saturday.setDate(selected.getDate() - selected.getDay() + 6);
            
            return {
                start: toDateValue(saturday),
                end: selectedDate
            };
        }
        return null;
    };

    const dateRange = getDateRange();
    const todayValue = toDateValue(new Date());

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
        
        if (!confirmationForm.guests || confirmationForm.guests < 1) {
            errors.guests = 'Number of guests is required';
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
            className="max-h-[calc(100vh-4rem)] overflow-y-auto lg:sticky lg:top-8"
        >
            <div className="rounded-[2.5rem] border border-[#dfd1bb] bg-gradient-to-br from-[#fffaf1]/95 to-[#f9f4ed]/95 p-8 shadow-2xl backdrop-blur dark:border-[#31392f] dark:from-[#1a211a]/95 dark:to-[#232823]/95 sm:p-10">
                {/* Experience Type Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {[
                        { id: 'day', label: 'Day Experience', icon: Clock },
                        { id: 'stay', label: 'Weekend Retreat', icon: TreePine }
                    ].map((type) => (
                        <motion.button
                            key={type.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setExperience(type.id)}
                            className={`relative overflow-hidden rounded-2xl border-2 p-4 transition-all duration-300 ${
                                experience === type.id
                                    ? 'border-[#7a5527] bg-gradient-to-r from-[#7a5527]/10 to-[#5d3d19]/10 shadow-lg'
                                    : 'border-[#dfd1bb] bg-white dark:border-[#31392f] dark:bg-[#1a211a] hover:border-[#d6a23d]/50'
                            }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <type.icon 
                                    size={20} 
                                    className={`transition-colors duration-300 ${
                                        experience === type.id 
                                            ? 'text-[#7a5527] dark:text-[#e7c678]' 
                                            : 'text-[#645747] dark:text-[#d5c9b7]'
                                    }`} 
                                />
                                <span className={`text-sm font-semibold transition-colors duration-300 ${
                                    experience === type.id 
                                        ? 'text-[#7a5527] dark:text-[#e7c678]' 
                                        : 'text-[#211b14] dark:text-[#fff8ea]'
                                }`}>
                                    {type.label}
                                </span>
                            </div>
                            {experience === type.id && (
                                <motion.div
                                    layoutId="activeExperience"
                                    className="absolute inset-0 rounded-2xl border-2 border-[#7a5527] bg-gradient-to-r from-[#7a5527]/5 to-[#5d3d19]/5"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Date Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 }}
                    className="mt-8"
                >
                    <label className="block text-sm font-bold text-[#7a5527] dark:text-[#e7c678] uppercase tracking-wider mb-3">
                        {experience === 'day' ? 'Select Saturday' : 'Select Weekend'}
                    </label>
                    <button
                        onClick={() => setIsCalendarOpen(true)}
                        className="w-full rounded-2xl border-2 border-[#dfd1bb] bg-white p-4 text-left shadow-lg transition-all duration-300 hover:border-[#7a5527] hover:shadow-xl dark:border-[#31392f] dark:bg-[#1a211a]"
                    >
                        {selectedDate ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-[#211b14] dark:text-[#fff8ea]">
                                        {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}
                                    </p>
                                    {dateRange && (
                                        <p className="text-sm text-[#645747] dark:text-[#d5c9b7] mt-1">
                                            {dateRange.start === dateRange.end 
                                                ? 'Day Experience' 
                                                : `Weekend Stay (${new Date(`${dateRange.start}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(`${dateRange.end}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
                                            }
                                        </p>
                                    )}
                                </div>
                                <ChevronDown size={20} className="text-[#7a5527] dark:text-[#e7c678]" />
                            </div>
                        ) : (
                            <span className="font-bold text-[#7a5527] dark:text-[#e7c678]">Choose a date</span>
                        )}
                    </button>
                </motion.div>

                {/* Pricing Summary */}
                <div className="mt-8 space-y-4 border-t-2 border-[#eadcc8] pt-8 dark:border-[#31392f]">
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
                    className="mt-8 w-full rounded-2xl bg-gradient-to-r from-[#7a5527] to-[#5d3d19] hover:from-[#8b6230] hover:to-[#6d441a] disabled:from-[#a8a8a8] disabled:to-[#808080] px-6 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 flex items-center justify-center gap-3 border border-[#d6a23d]/30"
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
        <AnimatePresence>
            {showConfirmation && (
                <>
                    <div 
                        className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-md"
                        onClick={() => setShowConfirmation(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-[#1a211a] rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] max-w-2xl w-full p-8 border-2 border-[#dfd1bb] dark:border-[#31392f] relative">
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
                                        <div className="grid grid-cols-2 gap-4">
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
                                        <div className="grid grid-cols-2 gap-4">
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
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, phone: getTenDigitPhone(e.target.value) })}
                                                        placeholder="Enter your phone number"
                                                        inputMode="numeric"
                                                        pattern="[0-9]{10}"
                                                        maxLength="10"
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
                                                        min="1"
                                                        max={selectedStay?.maxGuests || 10}
                                                        value={confirmationForm.guests}
                                                        onChange={(e) => setConfirmationForm({ ...confirmationForm, guests: parseInt(e.target.value) || 1 })}
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
                            <div className="flex gap-4">
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
                                            // Update guestDetails with form data
                                            setGuestDetails({
                                                name: confirmationForm.name,
                                                email: confirmationForm.email,
                                                phone: confirmationForm.phone
                                            });
                                            // Update guests count
                                            setGuests(confirmationForm.guests);
                                            // Close modal and proceed with booking
                                            setShowConfirmation(false);
                                            handleBook();
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
        </AnimatePresence>
        </>
    );
};

export default BookingPanel;
