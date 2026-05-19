import { MessageCircle } from 'lucide-react';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';

const getBookingNumber = (booking) => booking?.bookingCode || booking?._id || '';

const getBookingWhatsAppUrl = (booking, action) => {
    const bookingNumber = getBookingNumber(booking);
    const title = booking?.property?.title || booking?.propertyTitle || booking?.farm?.title || 'Brown Cows Dairy booking';
    const dateText = `${formatDate(booking?.startDate)} to ${formatDate(booking?.endDate)}`;
    const message = action === 'cancel'
        ? `Hi, I want to cancel my Brown Cows Dairy booking. Booking Number: ${bookingNumber}. Stay: ${title}. Dates: ${dateText}.`
        : `Hi, I want to edit/reschedule my Brown Cows Dairy booking. Booking Number: ${bookingNumber}. Stay: ${title}. Dates: ${dateText}.`;

    return `https://wa.me/919989854411?text=${encodeURIComponent(message)}`;
};

const BookingWhatsAppActions = ({ booking, className = '' }) => (
    <div className={`grid gap-2 sm:grid-cols-2 ${className}`}>
        <a
            href={getBookingWhatsAppUrl(booking, 'edit')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#7a5527] px-4 py-2.5 text-sm font-bold text-[#7a5527] transition hover:bg-[#fffaf1] dark:border-[#e7c678] dark:text-[#e7c678] dark:hover:bg-[#171d17]"
        >
            <MessageCircle size={15} />
            Edit Booking
        </a>
        <a
            href={getBookingWhatsAppUrl(booking, 'cancel')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50"
        >
            <MessageCircle size={15} />
            Cancel Booking
        </a>
    </div>
);

export default BookingWhatsAppActions;
