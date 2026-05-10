const GUEST_BOOKINGS_KEY = 'brown_cows_guest_bookings';

const normalizeContact = (value = '') => String(value).trim().toLowerCase();

export const getGuestBookingRefs = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(GUEST_BOOKINGS_KEY) || '[]');
        return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.contact) : [];
    } catch (error) {
        localStorage.removeItem(GUEST_BOOKINGS_KEY);
        return [];
    }
};

export const rememberGuestBooking = ({ bookingId, contact, booking }) => {
    const id = String(bookingId || booking?._id || '').trim();
    const normalizedContact = normalizeContact(contact);
    if (!id || !normalizedContact) return;

    const current = getGuestBookingRefs();
    const nextRecord = {
        id,
        contact: normalizedContact,
        booking: booking || null,
        savedAt: new Date().toISOString()
    };

    const next = [
        nextRecord,
        ...current.filter((item) => item.id !== id)
    ].slice(0, 20);

    localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(next));
};

export const updateStoredGuestBooking = (booking) => {
    if (!booking?._id) return;
    const current = getGuestBookingRefs();
    const next = current.map((item) => (
        item.id === booking._id
            ? { ...item, booking, savedAt: new Date().toISOString() }
            : item
    ));
    localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(next));
};

export const getGuestBookingContact = (bookingId) => {
    const match = getGuestBookingRefs().find((item) => item.id === bookingId);
    return match?.contact || '';
};
