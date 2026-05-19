import { ShieldCheck } from 'lucide-react';

const CheckoutSuccess = ({
    completedBooking,
    bookingTypeLabel,
    propertyTitle,
    confirmationMessage,
    user,
    formatDate,
    navigate
}) => (
    <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-3xl border border-[#cfe4c8] bg-[#fffaf1] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#edf7e9] text-[#3f6b3f]">
                <ShieldCheck size={34} />
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#8a642d]">Booking Received</p>
            <h1 className="text-3xl font-bold text-[#211b14]">Your booking is pending approval</h1>
            <p className="mx-auto mt-3 max-w-lg text-[#645747]">
                {confirmationMessage || 'We will notify you after admin review.'}
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#3f6b3f]">
                Your booking confirmation has been sent to your email{user ? ' and saved in My Bookings.' : '.'}
            </p>

            <div className="mt-8 rounded-2xl border border-[#ead7b8] bg-[#f8efdf] p-5 text-left">
                {completedBooking?.bookingId ? (
                    <div className="mb-3 flex items-center justify-between gap-4">
                        <span className="text-sm text-[#645747]">{completedBooking.bookingIds?.length > 1 ? 'Booking Numbers' : 'Booking Number'}</span>
                        <span className="text-right font-bold text-[#211b14]">
                            {completedBooking.bookingIds?.length > 1 ? completedBooking.bookingCodes?.join(', ') : completedBooking.bookingCode}
                        </span>
                    </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#645747]">{completedBooking?.bookingTypeLabel || bookingTypeLabel}</span>
                    <span className="text-right font-bold text-[#211b14]">{completedBooking?.propertyTitle || propertyTitle}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-[#645747]">Dates</span>
                    <span className="text-right font-semibold text-[#211b14]">
                        {completedBooking?.bookingIds?.length > 1
                            ? 'Multiple dates'
                            : `${formatDate(completedBooking?.startDate)} to ${formatDate(completedBooking?.endDate)}`}
                    </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-[#645747]">Guests</span>
                    <span className="font-semibold text-[#211b14]">{completedBooking?.guestsText || '-'}</span>
                </div>
                {completedBooking?.total ? (
                    <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-sm text-[#645747]">Amount</span>
                        <span className="font-bold text-primary">Rs {completedBooking.total}</span>
                    </div>
                ) : null}
                {completedBooking?.discountAmount ? (
                    <div className="mt-3 flex items-center justify-between gap-4">
                        <span className="text-sm text-[#645747]">Coupon</span>
                        <span className="font-semibold text-[#3f6b3f]">
                            {completedBooking.couponCode} saved Rs {completedBooking.discountAmount}
                        </span>
                    </div>
                ) : null}
                <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="text-sm text-[#645747]">Payment</span>
                    <span className="font-semibold text-[#211b14]">
                        {completedBooking?.paymentMethod === 'cod' ? 'COD / Pay at Farm' : 'Razorpay Online'}
                    </span>
                </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                    type="button"
                    onClick={() => navigate('/bookings', {
                        state: {
                            bookingSuccess: true,
                            message: confirmationMessage
                        }
                    })}
                    className="rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg transition hover:bg-primary-800"
                >
                    View My Bookings
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/farms')}
                    className="rounded-xl border border-[#7a5527] px-6 py-3 font-bold text-[#7a5527] transition hover:bg-[#7a5527] hover:text-white"
                >
                    Explore More Stays
                </button>
            </div>
        </div>
    </div>
);

export default CheckoutSuccess;
