import { useEffect, useRef, useState } from 'react';
import {
    ExternalLink,
    MessageCircle,
    Send,
    X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const WHATSAPP_NUMBER = '919989854411';

const makeWhatsAppUrl = (message) => (
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
);

const quickTopics = [
    { label: 'Book stay', topic: 'booking' },
    { label: 'Edit details', topic: 'edit' },
    { label: 'Refund', topic: 'refund' },
    { label: 'Privacy', topic: 'privacy' }
];

const suggestedPrompts = [
    'How do I book?',
    'Can I change my dates?',
    'What is the refund policy?',
    'I need support'
];

const bookingWhatsAppMessage = [
    'Hi Brown Cows Dairy, I want to book a farm stay.',
    'Preferred dates:',
    'Number of guests:',
    'Farm/property name, if selected:',
    'Please guide me.'
].join('\n');

const editWhatsAppMessage = [
    'Hi Brown Cows Dairy, I want to edit/reschedule my booking.',
    'Booking number:',
    'Name on booking:',
    'Current dates:',
    'New preferred dates:',
    'Guest count:',
    'Phone/email used for booking:'
].join('\n');

const responses = {
    booking: {
        text: [
            'Here is the easiest way to book a farm stay:',
            '',
            '1. Open Farm Stays and choose a property.',
            '2. Check photos, price, capacity, and stay details.',
            '3. Select check-in, check-out, and guest count.',
            '4. Add it to cart and review the final amount.',
            '5. Complete checkout with online payment.',
            '6. Your booking stays Pending until Brown Cows Dairy confirms it.',
            '',
            'For assisted booking, send your dates and guest count on WhatsApp.'
        ].join('\n'),
        actions: [
            { label: 'Open Farm Stays', type: 'route', to: '/farms' },
            { label: 'Book on WhatsApp', type: 'whatsapp', href: makeWhatsAppUrl(bookingWhatsAppMessage) }
        ]
    },
    availability: {
        text: [
            'To check availability:',
            '',
            '1. Open the farm stay you like.',
            '2. Select your check-in and check-out dates.',
            '3. Choose guests based on the stay capacity.',
            '4. If the dates are unavailable, try nearby dates or ask us on WhatsApp.',
            '',
            'Weekend and retreat slots can fill faster, so checking early is best.'
        ].join('\n'),
        actions: [
            { label: 'Browse Stays', type: 'route', to: '/farms' },
            { label: 'Ask availability', type: 'whatsapp', href: makeWhatsAppUrl(bookingWhatsAppMessage) }
        ]
    },
    pricing: {
        text: [
            'Prices depend on the property, dates, guest count, and package.',
            '',
            'For the exact amount:',
            '1. Select your stay and dates.',
            '2. Add guests.',
            '3. Review the cart before checkout.',
            '',
            'The checkout total includes applicable taxes. For custom help, share your dates on WhatsApp.'
        ].join('\n'),
        actions: [
            { label: 'Check Prices', type: 'route', to: '/farms' },
            { label: 'Ask price on WhatsApp', type: 'whatsapp', href: makeWhatsAppUrl(bookingWhatsAppMessage) }
        ]
    },
    edit: {
        text: [
            'Stay changes are handled on WhatsApp so our team can confirm availability correctly.',
            '',
            'Please share:',
            '- Booking number',
            '- Name on booking',
            '- Current dates',
            '- New preferred dates',
            '- Guest count',
            '- Phone/email used for booking',
            '',
            'Past, completed, cancelled, or rejected bookings cannot be edited. Date changes depend on availability and fare difference, if any.'
        ].join('\n'),
        actions: [
            { label: 'WhatsApp edit request', type: 'whatsapp', href: makeWhatsAppUrl(editWhatsAppMessage) }
        ]
    },
    refund: {
        text: [
            'Cancellation and refund policy:',
            '',
            '- 15+ days before check-in: 100% refund.',
            '- 7-14 days before check-in: 50% refund.',
            '- Less than 7 days: no refund, but rescheduling may be possible with a Rs 500 fee, subject to availability.',
            '- No-show: no refund or rescheduling.',
            '',
            'Approved refunds are processed in 5-7 business days. Razorpay gateway charges, if any, are non-refundable.'
        ].join('\n'),
        actions: [
            {
                label: 'Cancel via WhatsApp',
                type: 'whatsapp',
                href: makeWhatsAppUrl([
                    'Hi Brown Cows Dairy, I want to cancel/refund my booking.',
                    'Booking number:',
                    'Name on booking:',
                    'Check-in date:',
                    'Reason for cancellation:'
                ].join('\n'))
            }
        ]
    },
    privacy: {
        text: [
            'Privacy policy summary:',
            '',
            '- We collect only details needed for booking and support.',
            '- This may include name, email, phone number, guest details, booking dates, and booking details.',
            '- Payments are handled securely through Razorpay.',
            '- Card details are not stored by this website.',
            '- Details are used for booking confirmation, service updates, support, and website improvement.',
            '- Brown Cows Dairy does not sell customer data to third parties.'
        ].join('\n'),
        actions: [
            {
                label: 'Privacy question',
                type: 'whatsapp',
                href: makeWhatsAppUrl('Hi, I have a privacy policy question about Brown Cows Dairy farm stay bookings.')
            }
        ]
    },
    payment: {
        text: [
            'Payment guide:',
            '',
            '- Online payment is handled through Razorpay.',
            '- COD / Pay at Farm is temporarily unavailable.',
            '- After checkout, the booking is still Pending until the host confirms it.',
            '- You will receive booking details by email and/or WhatsApp based on the details provided.'
        ].join('\n'),
        actions: [
            { label: 'Go to Cart', type: 'route', to: '/cart' },
            { label: 'Payment help', type: 'whatsapp', href: makeWhatsAppUrl('Hi, I need payment help for my Brown Cows Dairy booking.') }
        ]
    },
    retreat: {
        text: [
            'Learning retreat booking:',
            '',
            '1. Open the Learning Retreat page.',
            '2. Choose day visit or stay package.',
            '3. Select retreat date, guests, and contact details.',
            '4. Continue to cart and checkout.',
            '5. Booking goes for confirmation after payment or booking request.',
            '',
            'Retreat refunds: 30+ days is 100%, 15-29 days is 50%, less than 15 days has no refund but seat transfer is allowed.'
        ].join('\n'),
        actions: [
            { label: 'Open Retreat', type: 'route', to: '/2-day-learning-retreat' },
            {
                label: 'Retreat WhatsApp help',
                type: 'whatsapp',
                href: makeWhatsAppUrl([
                    'Hi Brown Cows Dairy, I want help booking the learning retreat.',
                    'Preferred date:',
                    'Number of guests:',
                    'Day visit or stay package:'
                ].join('\n'))
            }
        ]
    },
    contact: {
        text: [
            'You can reach Brown Cows Dairy here:',
            '',
            'WhatsApp: +91 99898 54411',
            'Email: browncowsdairy@gmail.com',
            'Location: Gouripally Village, Medak, Telangana',
            '',
            'For booking support, include your name, date, guest count, and booking number if already booked.'
        ].join('\n'),
        actions: [
            { label: 'Open WhatsApp', type: 'whatsapp', href: makeWhatsAppUrl('Hi, I need help with Brown Cows Dairy farm stays.') }
        ]
    },
    greeting: {
        text: [
            'Hi, I am the Brown Cows Dairy stay assistant.',
            '',
            'I can help with booking, availability, price guidance, edit requests, refunds, privacy, retreat bookings, and support.'
        ].join('\n'),
        actions: quickTopics.map((item) => ({ ...item, type: 'topic' }))
    }
};

const hasAny = (text, words) => words.some((word) => text.includes(word));

const getResponseKey = (query) => {
    const text = query.toLowerCase().replace(/[^\w\s-]/g, ' ');

    if (/(^|\s)(hi|hello|hey|namaste|good morning|good evening)(\s|$)/.test(text)) return 'greeting';

    if (hasAny(text, ['refund', 'return', 'cancel', 'cancellation', 'money back', 'no show', 'no-show', 'not coming', 'cannot come', 'unable to come'])) return 'refund';
    if (hasAny(text, ['privacy', 'personal data', 'my data', 'data safe', 'secure data', 'information', 'details safe'])) return 'privacy';
    if (hasAny(text, ['edit', 'change', 'reschedule', 'modify', 'update', 'postpone', 'prepone', 'change date', 'change dates', 'new date', 'new dates', 'guest count', 'change guest', 'change phone', 'wrong phone', 'wrong name'])) return 'edit';
    if (hasAny(text, ['retreat', 'learning', 'workshop', 'day visit', 'day package', 'stay package', '2 day', 'two day'])) return 'retreat';
    if (hasAny(text, ['payment', 'pay', 'paid', 'checkout', 'cart', 'cod', 'cash', 'pay at farm', 'razorpay', 'transaction'])) return 'payment';
    if (hasAny(text, ['available', 'availability', 'date', 'dates', 'slot', 'slots', 'weekend', 'vacancy'])) return 'availability';
    if (hasAny(text, ['price', 'cost', 'rate', 'tariff', 'amount', 'charge', 'charges', 'total'])) return 'pricing';
    if (hasAny(text, ['contact', 'support', 'phone', 'call', 'whatsapp', 'whatsup', 'email', 'address', 'location', 'where', 'reach you', 'talk to'])) return 'contact';
    if (hasAny(text, ['book', 'booking', 'reservation', 'reserve', 'stay', 'farm stay', 'farmhouse', 'farm house', 'room', 'rooms', 'property', 'farm', 'check in', 'check-in', 'check out', 'check-out', 'guest', 'guests', 'family', 'couple'])) return 'booking';

    return 'booking';
};

const getTopicLabel = (topic) => quickTopics.find((item) => item.topic === topic)?.label || topic;

const Chatbot = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ type: 'bot', ...responses.greeting }]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, isTyping]);

    useEffect(() => () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    }, []);

    const addBotResponse = (responseKey) => {
        const response = responses[responseKey] || responses.booking;
        setIsTyping(true);

        timeoutRef.current = window.setTimeout(() => {
            setMessages((current) => [...current, { type: 'bot', ...response }]);
            setIsTyping(false);
        }, Math.min(900, 280 + response.text.length * 2));
    };

    const handleTopic = (topic) => {
        if (isTyping) return;

        setMessages((current) => [...current, { type: 'user', text: getTopicLabel(topic) }]);
        addBotResponse(topic);
    };

    const handleAction = (action) => {
        if (action.type === 'route') {
            setIsOpen(false);
            navigate(action.to);
            return;
        }

        if (action.type === 'topic') {
            handleTopic(action.topic);
            return;
        }

        if (action.type === 'whatsapp') {
            window.open(action.href, '_blank', 'noopener,noreferrer');
        }
    };

    const handlePromptClick = (prompt) => {
        if (isTyping) return;

        setMessages((current) => [...current, { type: 'user', text: prompt }]);
        addBotResponse(getResponseKey(prompt));
    };

    const handleSend = (event) => {
        event.preventDefault();
        const query = inputText.trim();
        if (!query || isTyping) return;

        setMessages((current) => [...current, { type: 'user', text: query }]);
        setInputText('');
        addBotResponse(getResponseKey(query));
    };

    const clearChat = () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        setMessages([{ type: 'bot', ...responses.greeting }]);
        setInputText('');
        setIsTyping(false);
    };

    return (
        <div className="fixed bottom-5 right-4 z-[90] sm:bottom-6 sm:right-6">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        className="mb-4 flex h-[520px] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-[#ead7b8] bg-[#fffaf1] shadow-2xl dark:border-[#31392f] dark:bg-[#151b15]"
                    >
                        <div className="flex items-center justify-between bg-[#7a5527] px-4 py-3 text-white">
                            <div className="flex items-center gap-2">
                                <MessageCircle size={22} />
                                <div>
                                    <p className="text-sm font-bold leading-tight">Brown Cows Assistant</p>
                                    <p className="text-xs text-white/80">Website booking help only</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={clearChat}
                                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-bold text-white/90 hover:bg-white/15"
                                >
                                    Clear
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-full p-2 hover:bg-white/15"
                                    aria-label="Close assistant"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto bg-[#f8efdf] p-4 dark:bg-[#101610]">
                            {messages.map((message, index) => (
                                <div key={`${message.type}-${index}`} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[86%] whitespace-pre-line rounded-2xl px-3.5 py-3 text-sm leading-relaxed shadow-sm ${message.type === 'user'
                                            ? 'rounded-tr-md bg-[#7a5527] text-white'
                                            : 'rounded-tl-md border border-[#ead7b8] bg-white text-[#211b14] dark:border-[#31392f] dark:bg-[#1d251d] dark:text-[#fff8ea]'
                                            }`}
                                    >
                                        <p>{message.text}</p>

                                        {message.actions?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {message.actions.map((action) => (
                                                    <button
                                                        key={`${action.label}-${action.type}-${action.to || action.topic || action.href}`}
                                                        type="button"
                                                        onClick={() => handleAction(action)}
                                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dfcaa8] bg-[#fffaf1] px-3 py-1.5 text-xs font-bold text-[#7a5527] hover:bg-[#f4ead8] dark:border-[#3a4538] dark:bg-[#111611] dark:text-[#e7c678] dark:hover:bg-[#232823]"
                                                    >
                                                        {action.type === 'whatsapp' && <MessageCircle size={13} />}
                                                        {action.type === 'route' && <ExternalLink size={13} />}
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-[#ead7b8] bg-white px-4 py-3 shadow-sm dark:border-[#31392f] dark:bg-[#1d251d]">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#25D366]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#25D366] [animation-delay:120ms]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-[#25D366] [animation-delay:240ms]" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="border-t border-[#ead7b8] bg-[#fffaf1] p-3 dark:border-[#31392f] dark:bg-[#151b15]">
                            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                                {quickTopics.map((item) => (
                                    <button
                                        key={item.topic}
                                        type="button"
                                        onClick={() => handleTopic(item.topic)}
                                        disabled={isTyping}
                                        className="shrink-0 rounded-full border border-[#dfcaa8] px-3 py-1.5 text-xs font-bold text-[#7a5527] hover:bg-[#f4ead8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#3a4538] dark:text-[#e7c678] dark:hover:bg-[#232823]"
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(event) => setInputText(event.target.value)}
                                    placeholder="Ask about booking, dates, refund..."
                                    className="min-w-0 flex-1 rounded-xl border border-[#dfcaa8] bg-white px-3 py-2.5 text-sm text-[#211b14] outline-none focus:border-[#7a5527] focus:ring-2 focus:ring-[#ead7b8] dark:border-[#3a4538] dark:bg-[#111611] dark:text-[#fff8ea]"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim() || isTyping}
                                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#7a5527] text-white hover:bg-[#5d3d19] disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Send message"
                                >
                                    <Send size={18} />
                                </button>
                            </form>

                            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                                {suggestedPrompts.map((prompt) => (
                                    <button
                                        key={prompt}
                                        type="button"
                                        onClick={() => handlePromptClick(prompt)}
                                        disabled={isTyping}
                                        className="shrink-0 rounded-full bg-[#f4ead8] px-3 py-1.5 text-[11px] font-semibold text-[#7a5527] hover:bg-[#ead7b8] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#232823] dark:text-[#e7c678]"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen((current) => !current)}
                className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_rgba(37,211,102,0.35)] ring-4 ring-white/80 hover:bg-[#1fb85a] dark:ring-[#111611]/80"
                aria-label={isOpen ? 'Close Brown Cows chat assistant' : 'Open Brown Cows chat assistant'}
                title="Need help booking?"
            >
                <span className="absolute -left-40 hidden whitespace-nowrap rounded-full border border-[#dcefdc] bg-white px-4 py-2 text-sm font-bold text-[#1f6f3f] shadow-lg lg:block">
                    Need help booking?
                </span>
                {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
            </motion.button>
        </div>
    );
};

export default Chatbot;
