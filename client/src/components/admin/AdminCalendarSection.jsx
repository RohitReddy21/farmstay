import { Ban, CalendarDays, ChevronLeft, ChevronRight, Loader, LockOpen, Plus, Trash2 } from 'lucide-react';

const AdminCalendarSection = ({
    farms,
    selectedFarmId,
    onSelectedFarmChange,
    calendarMonth,
    monthLabel,
    shiftCalendarMonth,
    calendarStats,
    statusStyles,
    blockForm,
    openForm,
    blockError,
    openError,
    openNotice,
    blockSaving,
    openSaving,
    onBlockFormChange,
    onOpenFormChange,
    onCreateBlockedDate,
    onCreateOpenDate,
    onPrepareUnblockDate,
    selectedFarmBlocks,
    selectedFarmOpenDates,
    onDeleteBlockedDate,
    onDeleteOpenDate,
    calendarDays,
    formatDateKey,
    getCalendarDayStatus,
    selectedFarm,
    bookings,
    blockedDates,
    openDates,
    visibleMonth,
    formatDate
}) => {
    const selectedFarmCottageOptions = Array.from(new Set(
        (selectedFarm?.variations || []).flatMap((variation) => variation.availableCottages || [])
    ));

    return (
    <section className="order-5 mb-8 rounded-xl border border-[#ead7b8] bg-white p-4 shadow-md sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
                <div className="flex items-center gap-2 text-[#7a5527]">
                    <CalendarDays size={22} />
                    <h2 className="text-xl font-bold text-gray-800">Admin Calendar View</h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    View booked, pending, blocked, and available dates by farm.
                </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                    value={selectedFarmId}
                    onChange={(event) => onSelectedFarmChange(event.target.value)}
                    className="rounded-lg border border-[#ead7b8] bg-[#fffaf1] px-3 py-2 text-sm font-semibold text-[#211b14] outline-none focus:border-primary"
                >
                    {farms.map((farm) => (
                        <option key={farm._id} value={farm._id}>
                            {farm.title}
                        </option>
                    ))}
                </select>

                <div className="flex items-center justify-between rounded-lg border border-[#ead7b8] bg-[#fffaf1]">
                    <button
                        type="button"
                        onClick={() => shiftCalendarMonth(-1)}
                        className="p-2 text-[#7a5527] transition hover:bg-[#f8efdf]"
                        aria-label="Previous month"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="min-w-[150px] px-3 text-center text-sm font-bold text-[#211b14]">
                        {monthLabel(calendarMonth)}
                    </span>
                    <button
                        type="button"
                        onClick={() => shiftCalendarMonth(1)}
                        className="p-2 text-[#7a5527] transition hover:bg-[#f8efdf]"
                        aria-label="Next month"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>

        {farms.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#ead7b8] bg-[#fffaf1] p-8 text-center text-gray-500">
                No farms available for calendar view.
            </div>
        ) : (
            <>
                <div className="mb-4 grid gap-2 sm:grid-cols-5">
                    {[
                        ['booked', 'Booked', calendarStats.booked],
                        ['pending', 'Pending', calendarStats.pending],
                        ['blocked', 'Blocked', calendarStats.blocked],
                        ['open', 'Unblocked', calendarStats.open],
                        ['available', 'Available', calendarStats.available]
                    ].map(([key, label, count]) => (
                        <div key={key} className={`rounded-xl border px-3 py-2 text-sm font-bold ${statusStyles[key]}`}>
                            <div>{label}</div>
                            <div className="text-lg">{count}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-4 grid gap-4 lg:grid-cols-2">
                    <form onSubmit={onCreateBlockedDate} className="rounded-xl border border-[#ead7b8] bg-[#fffaf1] p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#7a5527]">
                            <Ban size={18} />
                            <h3 className="font-bold text-[#211b14]">Block Dates Manually</h3>
                        </div>

                        {blockError && (
                            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                {blockError}
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-3">
                            <label className="text-sm font-bold text-[#211b14]">
                                Start Date
                                <input
                                    type="date"
                                    value={blockForm.startDate}
                                    onChange={(event) => onBlockFormChange('startDate', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                                />
                            </label>
                            <label className="text-sm font-bold text-[#211b14]">
                                End Date
                                <input
                                    type="date"
                                    min={blockForm.startDate}
                                    value={blockForm.endDate}
                                    onChange={(event) => onBlockFormChange('endDate', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                                />
                            </label>
                            <label className="text-sm font-bold text-[#211b14]">
                                Reason
                                <input
                                    type="text"
                                    value={blockForm.reason}
                                    onChange={(event) => onBlockFormChange('reason', event.target.value)}
                                    placeholder="Maintenance"
                                    className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={blockSaving}
                            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {blockSaving ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
                            Block Dates
                        </button>
                    </form>

                    <form id="unblock-dates-form" onSubmit={onCreateOpenDate} className="rounded-xl border border-[#b8d7ea] bg-[#f3fbff] p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#245b7a]">
                            <LockOpen size={18} />
                            <h3 className="font-bold text-[#211b14]">Unblock Dates for Booking</h3>
                        </div>
                        <p className="mb-3 text-sm text-[#566978]">
                            Use this for manual blocks or weekend-unavailable dates. Selected dates become bookable by clients.
                        </p>

                        {openError && (
                            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                                {openError}
                            </div>
                        )}
                        {openNotice && (
                            <div className="mb-3 rounded-lg border border-[#b9d8ae] bg-[#eef7e9] px-3 py-2 text-sm font-semibold text-[#2f5f32]">
                                {openNotice}
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-3">
                            <label className="text-sm font-bold text-[#211b14]">
                                Start Date
                                <input
                                    type="date"
                                    value={openForm.startDate}
                                    onChange={(event) => onOpenFormChange('startDate', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-[#b8d7ea] bg-white px-3 py-2 text-base outline-none focus:border-[#245b7a]"
                                />
                            </label>
                            <label className="text-sm font-bold text-[#211b14]">
                                End Date
                                <input
                                    type="date"
                                    min={openForm.startDate}
                                    value={openForm.endDate}
                                    onChange={(event) => onOpenFormChange('endDate', event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-[#b8d7ea] bg-white px-3 py-2 text-base outline-none focus:border-[#245b7a]"
                                />
                            </label>
                            <label className="text-sm font-bold text-[#211b14]">
                                Reason
                                <input
                                    type="text"
                                    value={openForm.reason}
                                    onChange={(event) => onOpenFormChange('reason', event.target.value)}
                                    placeholder="Available for booking"
                                    className="mt-1 w-full rounded-lg border border-[#b8d7ea] bg-white px-3 py-2 text-base outline-none focus:border-[#245b7a]"
                                />
                            </label>
                        </div>

                        {selectedFarmCottageOptions.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-2 text-sm font-bold text-[#211b14]">
                                    Cottages to unblock <span className="font-medium text-gray-500">(leave all unchecked to open all)</span>
                                </p>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {selectedFarmCottageOptions.map((cottage) => (
                                        <label key={cottage} className="flex items-center gap-2 rounded-lg border border-[#b8d7ea] bg-white px-3 py-2 text-sm font-semibold text-[#211b14]">
                                            <input
                                                type="checkbox"
                                                checked={openForm.cottages.includes(cottage)}
                                                onChange={(event) => {
                                                    const nextCottages = event.target.checked
                                                        ? [...openForm.cottages, cottage]
                                                        : openForm.cottages.filter((item) => item !== cottage);
                                                    onOpenFormChange('cottages', nextCottages);
                                                }}
                                                className="h-4 w-4 accent-[#245b7a]"
                                            />
                                            {cottage}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={openSaving}
                            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#245b7a] px-4 py-2 font-bold text-white transition hover:bg-[#1c4962] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {openSaving ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
                            Unblock Dates
                        </button>
                    </form>
                </div>

                <div className="mb-4 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-[#ead7b8] bg-[#fffaf1] p-4">
                        <h3 className="mb-3 font-bold text-[#211b14]">Manual Blocks</h3>
                        <div className="max-h-[210px] space-y-2 overflow-y-auto pr-1">
                            {selectedFarmBlocks.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-[#ead7b8] bg-white p-3 text-sm text-gray-500">
                                    No manual blocks for this farm.
                                </p>
                            ) : (
                                selectedFarmBlocks.map((block) => (
                                    <div key={block._id} className="flex items-start justify-between gap-3 rounded-lg border border-[#ead7b8] bg-white p-3">
                                        <div>
                                            <div className="text-sm font-bold text-[#211b14]">
                                                {formatDate(block.startDate)} to {formatDate(block.endDate)}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {block.reason || 'Blocked by admin'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteBlockedDate(block._id)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#b8d7ea] bg-[#eef8ff] px-3 py-2 text-xs font-bold text-[#245b7a] transition hover:bg-[#dceffc]"
                                            aria-label="Unblock this date range"
                                        >
                                            <LockOpen size={14} />
                                            Unblock
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#b8d7ea] bg-[#f3fbff] p-4">
                        <h3 className="mb-3 font-bold text-[#211b14]">Unblocked Dates</h3>
                        <div className="max-h-[210px] space-y-2 overflow-y-auto pr-1">
                            {selectedFarmOpenDates.length === 0 ? (
                                <p className="rounded-lg border border-dashed border-[#b8d7ea] bg-white p-3 text-sm text-gray-500">
                                    No unblocked dates for this farm.
                                </p>
                            ) : (
                                selectedFarmOpenDates.map((openDate) => (
                                    <div key={openDate._id} className="flex items-start justify-between gap-3 rounded-lg border border-[#b8d7ea] bg-white p-3">
                                        <div>
                                            <div className="text-sm font-bold text-[#211b14]">
                                                {formatDate(openDate.startDate)} to {formatDate(openDate.endDate)}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {openDate.cottages?.length ? openDate.cottages.join(', ') : 'All cottages'}
                                            </div>
                                            <div className="mt-1 text-xs text-gray-500">
                                                {openDate.reason || 'Unblocked by admin'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onDeleteOpenDate(openDate._id)}
                                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                            aria-label="Remove unblock permission"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#ead7b8]">
                    <div className="min-w-[760px] bg-[#fffaf1]">
                        <div className="grid grid-cols-7 border-b border-[#ead7b8] bg-[#f8efdf] text-center text-xs font-bold uppercase tracking-[0.14em] text-[#7a5527]">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="px-2 py-3">{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {calendarDays.map((day) => {
                                const dayKey = formatDateKey(day);
                                const status = getCalendarDayStatus(selectedFarm, day, bookings, blockedDates, openDates);
                                const isMuted = day.getMonth() !== visibleMonth;
                                const isToday = dayKey === formatDateKey(new Date());

                                return (
                                    <div
                                        key={dayKey}
                                        className={`min-h-[118px] border-b border-r border-[#ead7b8] p-2 ${isMuted ? 'bg-[#f8efdf]/55 text-gray-400' : 'bg-white'}`}
                                    >
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-primary text-white' : 'text-[#211b14]'}`}>
                                                {day.getDate()}
                                            </span>
                                            {!isMuted && (
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusStyles[status.type]}`}>
                                                    {status.label}
                                                </span>
                                            )}
                                        </div>

                                        {!isMuted && status.bookings.slice(0, 2).map((booking) => (
                                            <div key={booking._id} className="mb-1 truncate rounded-md bg-[#f8efdf] px-2 py-1 text-[11px] font-semibold text-[#211b14]">
                                                {booking.guestDetails?.name || booking.user?.name || 'Guest'}
                                            </div>
                                        ))}
                                        {!isMuted && status.bookings.length > 2 && (
                                            <div className="text-[11px] font-semibold text-[#7a5527]">
                                                +{status.bookings.length - 2} more
                                            </div>
                                        )}
                                        {!isMuted && status.blocks?.slice(0, 1).map((block) => (
                                            <div key={block._id} className="mb-1 truncate rounded-md bg-[#f1eee7] px-2 py-1 text-[11px] font-semibold text-[#7b6a58]">
                                                {block.reason || 'Manual block'}
                                            </div>
                                        ))}
                                        {!isMuted && status.openDates?.slice(0, 1).map((openDate) => (
                                            <div key={openDate._id} className="mb-1 truncate rounded-md bg-[#eef8ff] px-2 py-1 text-[11px] font-semibold text-[#245b7a]">
                                                {openDate.cottages?.length ? openDate.cottages.join(', ') : 'Unblocked for booking'}
                                            </div>
                                        ))}
                                        {!isMuted && status.type === 'blocked' && (
                                            <button
                                                type="button"
                                                onClick={() => onPrepareUnblockDate(dayKey)}
                                                className="mt-1 inline-flex items-center gap-1 rounded-md border border-[#b8d7ea] bg-[#eef8ff] px-2 py-1 text-[11px] font-bold text-[#245b7a] transition hover:bg-[#dceffc]"
                                            >
                                                <LockOpen size={12} />
                                                Unblock
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </>
        )}
    </section>
    );
};

export default AdminCalendarSection;
