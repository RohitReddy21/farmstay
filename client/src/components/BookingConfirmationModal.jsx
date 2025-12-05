import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Calendar, Users, MapPin, IndianRupee } from 'lucide-react';

const BookingConfirmationModal = ({ isOpen, onClose, bookingDetails }) => {
    if (!bookingDetails) return null;

    const { farm, startDate, endDate, guests, totalPrice, nights } = bookingDetails;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with Success Icon */}
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 text-center relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="inline-block"
                                >
                                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle size={32} className="text-green-500" />
                                    </div>
                                </motion.div>

                                <h2 className="text-xl font-bold text-white mb-1">
                                    Booking Confirmed!
                                </h2>
                                <p className="text-green-50 text-xs">
                                    Your reservation has been successfully confirmed
                                </p>
                            </div>

                            {/* Booking Details */}
                            <div className="p-4 space-y-3">
                                {/* Farm Name */}
                                <div className="text-center pb-2 border-b border-gray-200">
                                    <h3 className="text-base font-bold text-gray-900 mb-0.5">
                                        {farm.title}
                                    </h3>
                                    <p className="text-gray-600 flex items-center justify-center gap-1 text-xs">
                                        <MapPin size={12} />
                                        {farm.location}
                                    </p>
                                </div>

                                {/* Details Grid - Compact */}
                                <div className="space-y-2">
                                    {/* Dates Row */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar size={14} className="text-primary" />
                                                <p className="text-xs text-gray-500">Check-in</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {new Date(startDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar size={14} className="text-primary" />
                                                <p className="text-xs text-gray-500">Check-out</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {new Date(endDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Nights & Guests Row */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 mb-1">Duration</p>
                                            <p className="text-sm font-semibold text-gray-900">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users size={14} className="text-primary" />
                                                <p className="text-xs text-gray-500">Guests</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">{guests} {guests === 1 ? 'guest' : 'guests'}</p>
                                        </div>
                                    </div>

                                    {/* Total Amount */}
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <IndianRupee size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-green-700 font-medium">Total Amount</p>
                                                <p className="text-xl font-bold text-green-700">₹{totalPrice.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Message */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                                    <p className="text-xs text-blue-800 text-center">
                                        View and manage in <span className="font-semibold">"My Bookings"</span>
                                    </p>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={onClose}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                                >
                                    View My Bookings
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default BookingConfirmationModal;
