const AdminBookingsSection = ({
    bookingFilter,
    setBookingFilter,
    quickFilters,
    filteredBookings,
    blockedDates,
    bookings,
    downloadBookings,
    onDeleteBlockedDate,
    onBookingStatus,
    onDeleteBooking,
    formatDate,
    getGuests,
    getBookingNetTotal
}) => (
    <section className="order-3 rounded-xl border border-[#ead7b8] bg-white p-6 shadow-md">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold text-gray-800">
                {bookingFilter === 'blocked' ? 'Blocked Dates' : `Bookings Table (${filteredBookings.length})`}
            </h2>
            <button
                type="button"
                onClick={downloadBookings}
                disabled={bookings.length === 0}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Download Bookings CSV
            </button>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {quickFilters.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    onClick={() => setBookingFilter(item.key)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                        bookingFilter === item.key
                            ? 'border-primary bg-primary text-white shadow-md'
                            : 'border-[#ead7b8] bg-[#fffaf1] text-[#7a5527] hover:border-primary'
                    }`}
                >
                    {item.label} ({item.count})
                </button>
            ))}
        </div>

        {bookingFilter === 'blocked' ? (
            <div className="overflow-x-auto rounded-xl border border-[#ead7b8]">
                <table className="min-w-[760px] w-full text-left text-sm">
                    <thead className="bg-[#f8efdf] text-xs uppercase tracking-wide text-[#7a5527]">
                        <tr>
                            <th className="px-4 py-3">Farm</th>
                            <th className="px-4 py-3">Dates</th>
                            <th className="px-4 py-3">Reason</th>
                            <th className="px-4 py-3">Created By</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ead7b8]">
                        {blockedDates.map((block) => (
                            <tr key={block._id} className="hover:bg-[#fffaf1]">
                                <td className="px-4 py-3 font-bold text-gray-900">{block.farm?.title || 'Farm'}</td>
                                <td className="px-4 py-3">{formatDate(block.startDate)} to {formatDate(block.endDate)}</td>
                                <td className="px-4 py-3 text-gray-600">{block.reason || 'Blocked by admin'}</td>
                                <td className="px-4 py-3 text-gray-600">{block.createdBy?.name || block.createdBy?.email || '-'}</td>
                                <td className="px-4 py-3">
                                    <button
                                        type="button"
                                        onClick={() => onDeleteBlockedDate(block._id)}
                                        className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {blockedDates.length === 0 && (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">No blocked dates</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="overflow-x-auto rounded-xl border border-[#ead7b8]">
                <table className="min-w-[1050px] w-full text-left text-sm">
                    <thead className="bg-[#f8efdf] text-xs uppercase tracking-wide text-[#7a5527]">
                        <tr>
                            <th className="px-4 py-3">Property</th>
                            <th className="px-4 py-3">Guest Details</th>
                            <th className="px-4 py-3">Dates</th>
                            <th className="px-4 py-3">Guests</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Payment</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ead7b8]">
                        {filteredBookings.map((booking) => (
                            <tr key={booking._id} className="align-top hover:bg-[#fffaf1]">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-gray-900">{booking.property?.title || booking.propertyTitle || booking.farm?.title || 'Unknown Property'}</div>
                                    <div className="text-xs text-gray-500">{booking.property?.location || booking.propertyLocation || booking.farm?.location || ''}</div>
                                    <div className="mt-1 text-[11px] text-gray-400">ID: {booking._id}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-gray-900">{booking.guestDetails?.name || booking.user?.name || 'Unknown'}</div>
                                    <a href={`tel:${booking.guestDetails?.phone}`} className="block text-primary hover:underline">{booking.guestDetails?.phone || '-'}</a>
                                    <a href={`mailto:${booking.guestDetails?.email || booking.user?.email}`} className="block text-xs text-gray-500 hover:underline">{booking.guestDetails?.email || booking.user?.email || '-'}</a>
                                </td>
                                <td className="px-4 py-3">
                                    <div>{formatDate(booking.startDate)}</div>
                                    <div className="text-xs text-gray-500">to {formatDate(booking.endDate)}</div>
                                    <div className="mt-1 text-xs text-gray-500">Booked: {formatDate(booking.createdAt)}</div>
                                </td>
                                <td className="px-4 py-3">{getGuests(booking.guests)}</td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-primary">Rs {getBookingNetTotal(booking).toLocaleString('en-IN')}</div>
                                    <div className="text-xs text-gray-500">Base Rs {Number(booking.totalPrice || 0).toLocaleString('en-IN')}</div>
                                    <div className="text-xs text-gray-500">Tax Rs {Number(booking.tax || 0).toLocaleString('en-IN')}</div>
                                    {Number(booking.discountAmount || 0) > 0 && (
                                        <div className="text-xs font-semibold text-[#3f6b3f]">
                                            Coupon {booking.couponCode}: -Rs {Number(booking.discountAmount || 0).toLocaleString('en-IN')}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">{booking.paymentStatus || 'Pending'}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                booking.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {booking.status || 'Pending'}
                                    </span>
                                    {booking.rejectionReason && (
                                        <div className="mt-2 rounded border border-red-100 bg-red-50 p-2 text-xs text-red-700">
                                            {booking.rejectionReason}
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex min-w-[150px] flex-col gap-2">
                                        {booking.status !== 'Confirmed' && booking.status !== 'Completed' && (
                                            <button
                                                type="button"
                                                onClick={() => onBookingStatus(booking._id, 'Confirmed')}
                                                className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition hover:bg-secondary-800"
                                            >
                                                Accept
                                            </button>
                                        )}
                                        {booking.status !== 'Rejected' && booking.status !== 'Completed' && (
                                            <button
                                                type="button"
                                                onClick={() => onBookingStatus(booking._id, 'Rejected')}
                                                className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => onDeleteBooking(booking._id)}
                                            className="rounded-lg bg-gray-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredBookings.length === 0 && (
                            <tr>
                                <td colSpan="8" className="py-8 text-center text-gray-500">No recent bookings</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </section>
);

export default AdminBookingsSection;
