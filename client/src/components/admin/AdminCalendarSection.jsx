import { Ban, CalendarDays, ChevronLeft, ChevronRight, Loader, Plus, Trash2 } from 'lucide-react';

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
    blockError,
    blockSaving,
    onBlockFormChange,
    onCreateBlockedDate,
    selectedFarmBlocks,
    onDeleteBlockedDate,
    calendarDays,
    formatDateKey,
    getCalendarDayStatus,
    selectedFarm,
    bookings,
    blockedDates,
    visibleMonth,
    formatDate
}) => (
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
                <div className="mb-4 grid gap-2 sm:grid-cols-4">
                    {[
                        ['booked', 'Booked', calendarStats.booked],
                        ['pending', 'Pending', calendarStats.pending],
                        ['blocked', 'Blocked', calendarStats.blocked],
                        ['available', 'Available', calendarStats.available]
                    ].map(([key, label, count]) => (
                        <div key={key} className={`rounded-xl border px-3 py-2 text-sm font-bold ${statusStyles[key]}`}>
                            <div>{label}</div>
                            <div className="text-lg">{count}</div>
                        </div>
                    ))}
                </div>

                <div className="mb-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
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
                                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                            aria-label="Delete blocked date"
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
                                const status = getCalendarDayStatus(selectedFarm, day, bookings, blockedDates);
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

export default AdminCalendarSection;
