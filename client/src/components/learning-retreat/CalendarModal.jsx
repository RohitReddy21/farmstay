import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const CalendarModal = ({ 
    experience, 
    selectedSlotType = 'shared',
    slotLabel = 'Single/Shared',
    slotUnitLabel = 'guest slots',
    selectedDate, 
    setSelectedDate, 
    selectedMonth, 
    setSelectedMonth, 
    monthDates, 
    monthLabel, 
    blockedDates,
    availability = {},
    setCalendarError,
    onClose 
}) => {
    const staySlotLimits = { shared: 4, couple: 2, group: 8 };
    const daySeatLimit = 25;
    const toDateValue = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const todayValue = toDateValue(new Date());
    
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

    return (
        <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[24px] border border-[#ead7b8] bg-[#fffaf1] shadow-[0_24px_80px_rgba(52,34,16,0.26)] dark:border-[#31392f] dark:bg-[#111611]">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#7a5527] to-[#5d3d19] px-4 py-3 text-white">
                <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f6d99f]">Brown Cows Retreat</p>
                    <h2 className="mt-0.5 text-base font-bold">Select Your Date</h2>
                </div>
                <button 
                    onClick={onClose}
                    className="rounded-full bg-white/10 p-1.5 text-white transition hover:bg-white/20"
                    aria-label="Close calendar"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4">
                {/* Month Navigation */}
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#211b14] dark:text-[#fff8ea]">{monthLabel}</h3>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
                            className="rounded-full p-1.5 transition hover:bg-[#efe4d1] dark:hover:bg-[#232823]"
                        >
                            <ChevronLeft size={16} className="text-[#7a5527]" />
                        </button>
                        <button 
                            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
                            className="rounded-full p-1.5 transition hover:bg-[#efe4d1] dark:hover:bg-[#232823]"
                        >
                            <ChevronRight size={16} className="text-[#7a5527]" />
                        </button>
                    </div>
                </div>

                {/* Weekday Headers */}
                <div className="mb-1.5 grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-0.5 text-center text-[10px] font-bold text-[#8b7a66] dark:text-[#cfc2b2]">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {monthDates.map((date) => {
                        const value = toDateValue(date);
                        const inMonth = date.getMonth() === selectedMonth.getMonth();
                        const available = isDateAvailable(date);
                        const blocked = blockedDates.includes(value) || value < todayValue;
                        const selected = selectedDate === value;
                        const isAvailable = available && !blocked;
                        const daySeats = experience === 'day' ? availability[value]?.day : null;
                        const weekendKey = (() => {
                            const weekend = new Date(date);
                            if (weekend.getDay() === 0) weekend.setDate(weekend.getDate() - 1);
                            return toDateValue(weekend);
                        })();
                        const staySeats = experience === 'stay'
                            ? availability[weekendKey]?.[selectedSlotType]
                            : null;

                        return (
                            <button
                                key={value}
                                disabled={!isAvailable}
                                onClick={() => {
                                    if (experience === 'stay' && available && !blocked) {
                                        const dayOfWeek = date.getDay();
                                        if (dayOfWeek === 6) { // Saturday selected for 2-day stay
                                            setSelectedDate(value);
                                            setCalendarError('');
                                        } else if (dayOfWeek === 0) { // Sunday selected for 2-day stay
                                            setSelectedDate(value);
                                            setCalendarError('');
                                        }
                                    } else if (experience === 'day' && available && !blocked) {
                                        setSelectedDate(value);
                                        setCalendarError('');
                                    }
                                }}
                                className={`
                                    relative h-8 rounded-xl text-xs font-bold transition-all duration-300
                                    ${!inMonth ? 'opacity-20 text-[#c0b5a0] cursor-default' : ''}
                                    ${selected ? 'scale-105 border border-[#d6a23d] bg-gradient-to-r from-[#7a5527] to-[#5d3d19] text-white shadow-lg' : ''}
                                    ${dateRange && isDateInRange(date, dateRange.start, dateRange.end) && !selected ? 'border border-[#d6a23d]/70 bg-[#f3e7d4] text-[#7a5527] shadow-sm dark:bg-[#232823] dark:text-[#e7c678]' : ''}
                                    ${isAvailable && !selected && !(dateRange && isDateInRange(date, dateRange.start, dateRange.end)) ? 'cursor-pointer border border-[#e8c991] bg-white text-[#211b14] hover:border-[#d6a23d] hover:bg-[#fff3dc] hover:shadow-md dark:bg-[#1a211a] dark:text-[#e8dccd] dark:hover:bg-[#232823]' : ''}
                                    ${!isAvailable ? 'cursor-not-allowed bg-white/55 text-[#b7aa98] opacity-45 dark:bg-[#1a1a1a]' : ''}
                                `}
                            >
                                {date.getDate()}
                                {experience === 'day' && inMonth && daySeats && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black leading-none opacity-75">
                                        {daySeats.available}
                                    </span>
                                )}
                                {experience === 'stay' && inMonth && staySeats && (
                                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black leading-none opacity-75">
                                        {staySeats.available}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {experience === 'day' && selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-xl border border-[#e4c58f] bg-[#f4ead8] p-3 dark:border-[#31392f] dark:bg-[#232823]"
                    >
                        <p className="text-xs font-semibold text-[#7a5527] dark:text-[#e7c678]">
                            Day experience seats
                        </p>
                        <p className="mt-1 text-xs text-[#645747] dark:text-[#d5c9b7]">
                            {(availability[selectedDate]?.day?.available ?? daySeatLimit)} of {(availability[selectedDate]?.day?.limit ?? daySeatLimit)} seats available.
                        </p>
                    </motion.div>
                )}

                {experience === 'stay' && selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-xl border border-[#e4c58f] bg-[#f4ead8] p-3 dark:border-[#31392f] dark:bg-[#232823]"
                    >
                        <p className="text-xs font-semibold text-[#7a5527] dark:text-[#e7c678]">
                            {slotLabel} availability
                        </p>
                        <p className="mt-1 text-xs text-[#645747] dark:text-[#d5c9b7]">
                            {(() => {
                                const key = (() => {
                                    const date = new Date(`${selectedDate}T00:00:00`);
                                    if (date.getDay() === 0) date.setDate(date.getDate() - 1);
                                    return toDateValue(date);
                                })();
                                const seats = availability[key]?.[selectedSlotType];
                                const fallbackLimit = staySlotLimits[selectedSlotType] || 0;
                                return `${seats?.available ?? fallbackLimit} of ${seats?.limit ?? fallbackLimit} ${slotUnitLabel} available.`;
                            })()}
                        </p>
                    </motion.div>
                )}

                {/* Date Range Display */}
                {dateRange && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-xl border border-[#e4c58f] bg-[#f4ead8] p-3 dark:border-[#31392f] dark:bg-[#232823]"
                    >
                        <p className="mb-2 text-xs font-semibold text-[#7a5527] dark:text-[#e7c678]">
                            Your 2-Day Retreat
                        </p>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-[#645747] dark:text-[#d5c9b7]">Check-in</p>
                                <p className="text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">
                                    {new Date(`${dateRange.start}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="h-0.5 bg-gradient-to-r from-[#d6a23d] to-[#d6a23d] rounded-full"></div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-[#645747] dark:text-[#d5c9b7]">Check-out</p>
                                <p className="text-sm font-bold text-[#211b14] dark:text-[#fff8ea]">
                                    {new Date(`${dateRange.end}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Info Text */}
                <div className="mt-3 rounded-xl border border-[#ead7b8] bg-white/70 p-2.5 dark:border-[#31392f] dark:bg-[#1a211a]">
                    <p className="text-center text-[11px] leading-relaxed text-[#645747] dark:text-[#d5c9b7]">
                        {experience === 'day' 
                            ? 'Select a Saturday for your day experience. Small numbers show seats left.'
                            : 'Select Saturday or Sunday for your 2-day retreat. Small numbers show available slots.'}
                    </p>
                </div>

                {/* Apply Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="mt-3 w-full rounded-xl border border-[#d6a23d]/30 bg-gradient-to-r from-[#7a5527] to-[#5d3d19] py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-[#8b6230] hover:to-[#6d441a]"
                >
                    {selectedDate ? 'Confirm Date' : 'Select a Date'}
                </motion.button>
            </div>
        </div>
    );
};

export default CalendarModal;
