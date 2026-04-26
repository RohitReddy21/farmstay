import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Download,
    MapPin,
    Minus,
    Phone,
    Plus,
    Sprout,
    Users,
    X
} from 'lucide-react';

const heroVideo = 'https://cdn.shopify.com/videos/c/o/v/7ca795366d7e412bbdf5ccb664d9e691.mp4';

const galleryImages = [
    'https://browncowsdairy.com/cdn/shop/files/DSC00436_a7daa3fb-164d-4d28-96ca-e58bd814a73c.jpg?v=1774962189&width=1200',
    'https://browncowsdairy.com/cdn/shop/files/DSC08718.jpg?v=1776069148&width=1200',
    'https://browncowsdairy.com/cdn/shop/files/IMG_20260326_233235.jpg?v=1776069148&width=1200',
    'https://browncowsdairy.com/cdn/shop/files/DSC08697.jpg?v=1776069148&width=1200'
];

const audienceCards = [
    {
        title: 'Urban Professionals',
        text: 'Escape the city and reconnect with nature through hands-on farm activities.',
        image: 'https://browncowsdairy.com/cdn/shop/files/give-me-other-image.png?v=1775656183&width=600'
    },
    {
        title: 'Families',
        text: 'Create lasting memories while teaching children about sustainable farming and animal care.',
        image: 'https://browncowsdairy.com/cdn/shop/files/families-in-farms.png?v=1775656252&width=600'
    },
    {
        title: 'Students',
        text: 'Learn about agriculture, sustainability, and organic practices in a real-world setting.',
        image: 'https://browncowsdairy.com/cdn/shop/files/students-in-farms.png?v=1775656385&width=600'
    },
    {
        title: 'Nature Lovers',
        text: 'Immerse yourself in rural life and discover the beauty of farm-to-table living.',
        image: 'https://browncowsdairy.com/cdn/shop/files/nature-lovers-in-farms.png?v=1775656472&width=600'
    }
];

const dayOneSchedule = [
    ['9:00 AM', 'Arrival and Farm Breakfast', 'Farm-grown wholesome breakfast, meet and greet, farm philosophy intro, and audiovisual of the farm journey from 2012.'],
    ['10:00 AM', 'SPNF Classroom Session', "Subhash Palekar's Zero Budget Farming, soil microbiology, why fertilizers damage soil biology, and four pillars of SPNF."],
    ['11:30 AM', 'Hands-On Workshop', 'Making Jeevamrutha, Neem Wash organic pest repellents, microbial multiplication, and soil nutrition cycle.'],
    ['1:00 PM', 'Farm Lunch - Vegetarian', 'Organic vegetable curries, millets and roti alternatives, fresh curds, buttermilk, paneer, and cheeses from Gir cows.'],
    ['2:30 PM', 'Mulching and Soil Life', 'Straw mulching, live mulching, woodchips, earthworms, microbial activity, soil texture, and moisture retention.'],
    ['3:30 PM', 'Dairy - Milk to Ghee', 'Goshala visit, A1 vs A2 milk, indigenous breeds, and traditional Bilona butter churning hands-on.'],
    ['5:00 PM', 'Farm Walk and Evening Sightseeing', 'Sunset farm walk, Amangal lakefront guided tour, and campfire.'],
    ['8:00 PM', 'Farm Dinner and Campfire', 'Organic farm meal and fireside talk on farm economics, indigenous breeds, and lessons for new farmers.']
];

const dayTwoSchedule = [
    ['8:00 AM', 'Farm Breakfast', 'Farm-grown wholesome breakfast with reflections and notes from Day 1.'],
    ['9:00 AM', 'Integrated Farming and Economics', 'Vermicompost, compost, mulching, cocopeat, rice husk, and waste-to-input cycles.'],
    ['11:30 AM', 'Hands-On Workshops', 'Audio visual classroom session, Jeevamrutha making, organic inputs, and microbial multiplication.'],
    ['1:00 PM', 'Farm Lunch - Vegetarian', 'Organic vegetable curries, millets, rice alternatives, and fresh A2 dairy.'],
    ['2:30 PM', 'Biogas', 'Biogas production, waste-to-energy cycles, and benefits for the farm.'],
    ['3:30 PM', 'Closing Circle', 'Share learnings, implementation plans, feedback session, and farm gift bags.']
];

const faqs = [
    {
        question: 'What is included in the farm experience?',
        answer: 'Guided farm activities, hands-on learning sessions, cow interaction, milking demonstration, natural farming insights, freshly prepared farm meals, nature walks, and a peaceful rural environment. For 2-day retreats, accommodation and extended activities are included.'
    },
    {
        question: 'How long is the retreat program?',
        answer: 'The 1-day experience runs from morning to evening. The 2-day retreat includes an overnight stay with a more immersive schedule across both days.'
    },
    {
        question: 'What should I bring with me?',
        answer: 'Bring comfortable clothing, farm-friendly footwear, personal essentials, medications, sunscreen, a hat, and a reusable water bottle. For overnight stays, carry a change of clothes and basic toiletries.'
    },
    {
        question: 'Is the experience suitable for children?',
        answer: 'Yes. Children can learn about nature, animals, and sustainable farming in a safe and engaging environment. Children should be accompanied by adults at all times.'
    },
    {
        question: 'What is your cancellation policy?',
        answer: 'Confirmed bookings follow the farm cancellation policy. Depending on timing and availability, cancellations may be eligible for partial refunds or rescheduling.'
    }
];

const isSaturday = (dateValue) => {
    if (!dateValue) return false;
    const date = new Date(`${dateValue}T00:00:00`);
    return date.getDay() === 6;
};

const LearningRetreat = () => {
    const [showBrochure, setShowBrochure] = useState(false);
    const [brochureSubmitted, setBrochureSubmitted] = useState(false);
    const [brochureForm, setBrochureForm] = useState({ name: '', email: '', phone: '', guests: 1 });
    const [experienceType, setExperienceType] = useState('day');
    const [guests, setGuests] = useState(1);
    const [stayType, setStayType] = useState('Solo');
    const [selectedDate, setSelectedDate] = useState('');
    const [dateError, setDateError] = useState('');
    const [openImage, setOpenImage] = useState(null);
    const [openFaq, setOpenFaq] = useState(0);

    const bookingSummary = useMemo(() => {
        if (experienceType === 'day') {
            return `1 Day Farm Experience for ${guests} guest${guests > 1 ? 's' : ''}`;
        }
        return `2-Day Farm Stay for ${stayType} booking, ${guests} guest${guests > 1 ? 's' : ''}`;
    }, [experienceType, guests, stayType]);

    const updateGuests = (delta) => {
        setGuests((current) => Math.max(1, current + delta));
    };

    const submitBrochure = (event) => {
        event.preventDefault();
        setBrochureSubmitted(true);

        const brochure = [
            'Brown Cows Organic Dairy - Farm Learning Retreat',
            '',
            'Experience: 1-day farm visit or 2-day farm stay retreat',
            'Includes: guided farm activities, natural farming learning, cow interaction, farm meals, nature walks, and hands-on workshops.',
            'Location: 4-140, Gouripally Village, Amangal Mandal, Telangana 509321',
            'Contact: 99898 54411 | browncowsdairy@gmail.com'
        ].join('\n');

        const blob = new Blob([brochure], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'brown-cows-learning-retreat-brochure.txt';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const bookSlot = () => {
        if (!isSaturday(selectedDate)) {
            setDateError('Please select a Saturday. The retreat includes Saturday and Sunday.');
            return;
        }

        setDateError('');
        const text = encodeURIComponent(`Hi, I want to book ${bookingSummary} on ${selectedDate}.`);
        window.open(`https://wa.me/919989854411?text=${text}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-12 md:space-y-16 text-gray-900 dark:text-white">
            <section className="relative min-h-[620px] overflow-hidden rounded-2xl md:rounded-3xl bg-[#1f2b20] shadow-2xl">
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={heroVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#152018]/90 via-[#3f4a32]/65 to-[#152018]/20" />
                <div className="relative z-10 flex min-h-[620px] items-center px-5 py-10 sm:px-8 lg:px-14">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl text-[#fff8ea]"
                    >
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5c16b]/40 bg-[#fff8ea]/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                            <Sprout size={18} />
                            Farm Learning Retreat
                        </div>
                        <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
                            Fun, Learning and Memories in One Farm Experience
                        </h1>
                        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#f7f1df] sm:text-xl">
                            A hands-on Brown Cows farm retreat for kids and adults with natural farming, fresh air, farm meals, cow interaction, and meaningful rural living.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => document.getElementById('retreat-booking')?.scrollIntoView({ behavior: 'smooth' })}
                                className="inline-flex items-center justify-center rounded-full bg-[#8b5e34] px-7 py-3.5 font-semibold text-[#fff8ea] shadow-lg transition hover:bg-[#704721]"
                            >
                                Book Your Spot <ArrowRight className="ml-2" size={20} />
                            </button>
                            <button
                                onClick={() => setShowBrochure(true)}
                                className="inline-flex items-center justify-center rounded-full border border-[#fff8ea]/50 bg-[#fff8ea]/15 px-7 py-3.5 font-semibold text-[#fff8ea] backdrop-blur transition hover:bg-[#fff8ea]/25"
                            >
                                <Download className="mr-2" size={20} />
                                Download Brochure
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b5e34] dark:text-[#f2c76b]">Discover your farm journey</p>
                    <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white md:text-5xl">Leave the city noise behind</h2>
                    <p className="mt-5 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                        Step into a world where time slows down. Learn traditional farming practices, reconnect with nature, and discover the simple joy of rural living through workshops, farm walks, and meals from the land.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        'Learn authentic farming techniques from experienced farmers',
                        'Experience the calming rhythm of rural life',
                        'Enjoy fresh organic meals straight from the farm',
                        'Create lasting memories in a peaceful natural setting'
                    ].map((item) => (
                        <div key={item} className="rounded-xl border border-[#e8ddc7] bg-[#fffaf0] p-4 text-sm font-medium text-[#31402a] shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            <CheckCircle2 className="mb-3 text-[#8b5e34]" size={22} />
                            {item}
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b5e34] dark:text-[#f2c76b]">Who should join?</p>
                        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Built for curious learners</h2>
                    </div>
                    <p className="max-w-2xl text-gray-600 dark:text-gray-300">
                        The retreat welcomes everyone curious about sustainable living and authentic farm life.
                    </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {audienceCards.map((card) => (
                        <article key={card.title} className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700">
                            <img src={card.image} alt={card.title} className="h-44 w-full object-cover" loading="lazy" />
                            <div className="p-5">
                                <h3 className="text-xl font-bold">{card.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{card.text}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section id="retreat-booking" className="grid gap-8 rounded-2xl bg-[#f7f1df] p-5 shadow-xl dark:bg-gray-800 md:p-8 lg:grid-cols-[0.85fr_1.15fr]">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b5e34] dark:text-[#f2c76b]">Schedule your experience</p>
                    <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Choose your retreat</h2>
                    <div className="mt-6 grid grid-cols-2 rounded-full bg-white p-1 shadow-inner dark:bg-gray-900">
                        {[
                            ['day', 'Day Experience'],
                            ['stay', '2-Day Farm Stay']
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => setExperienceType(value)}
                                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${experienceType === value ? 'bg-[#8b5e34] text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold">
                                    {experienceType === 'day' ? 'Farm Day Experience' : '2-Day Farm Stay'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                    {experienceType === 'day' ? '1 day learning program' : 'Saturday and Sunday immersive farm stay'}
                                </p>
                            </div>
                            <div className="rounded-full bg-[#e8f5dc] px-3 py-1 text-sm font-bold text-[#31551e]">
                                {experienceType === 'day' ? 'Rs 3,500 + taxes' : 'Weekend stay'}
                            </div>
                        </div>

                        <div className="mt-5 space-y-5">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Number of guests</label>
                                <div className="mt-2 flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
                                    <button onClick={() => updateGuests(-1)} className="rounded-full p-2 hover:bg-white dark:hover:bg-gray-700" aria-label="Decrease guests">
                                        <Minus size={18} />
                                    </button>
                                    <span className="min-w-12 text-center font-bold">{guests}</span>
                                    <button onClick={() => updateGuests(1)} className="rounded-full p-2 hover:bg-white dark:hover:bg-gray-700" aria-label="Increase guests">
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {experienceType === 'stay' && (
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Choose your stay type</label>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        {['Solo', 'Couple', 'Group'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setStayType(type)}
                                                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${stayType === type ? 'border-[#8b5e34] bg-[#8b5e34] text-white' : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Select date</label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                                    <CalendarDays size={20} className="text-[#8b5e34]" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(event) => {
                                            setSelectedDate(event.target.value);
                                            setDateError('');
                                        }}
                                        className="w-full bg-transparent text-gray-900 outline-none dark:text-white"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please select a Saturday. Weekend stays include Saturday and Sunday.</p>
                                {dateError && <p className="mt-2 text-sm font-semibold text-red-600">{dateError}</p>}
                            </div>

                            <button
                                onClick={bookSlot}
                                className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f7f67] px-5 py-3 font-bold text-white shadow-lg transition hover:bg-[#0b6552]"
                            >
                                {experienceType === 'day' ? 'Book Day Experience' : 'Book Your Slot'}
                                <ArrowRight className="ml-2" size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <ScheduleBlock title="Day 1" items={dayOneSchedule} />
                    {experienceType === 'stay' && <ScheduleBlock title="Day 2" items={dayTwoSchedule} />}
                </div>
            </section>

            <section>
                <div className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8b5e34] dark:text-[#f2c76b]">Experience farm life</p>
                    <h2 className="mt-2 text-3xl font-bold md:text-4xl">Moments from the farm</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {galleryImages.map((image, index) => (
                        <button
                            key={image}
                            onClick={() => setOpenImage(index)}
                            className="group overflow-hidden rounded-2xl bg-gray-100 shadow-lg"
                        >
                            <img src={image} alt={`Farm retreat moment ${index + 1}`} className="h-56 w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
                        </button>
                    ))}
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-2xl bg-[#3f4f5f] p-6 text-white shadow-xl md:p-8">
                    <h2 className="text-3xl font-bold">Visit our farm</h2>
                    <div className="mt-6 space-y-4 text-[#f7f1df]">
                        <p className="flex gap-3"><MapPin className="mt-1 shrink-0" />4-140, Gouripally Village, Amangal Mandal, Telangana 509321</p>
                        <p className="flex gap-3"><Phone className="mt-1 shrink-0" />99898 54411</p>
                        <p className="flex gap-3"><BookOpen className="mt-1 shrink-0" />browncowsdairy@gmail.com</p>
                    </div>
                    <a
                        href="https://wa.me/919989854411?text=Hi%2C%20I%20want%20to%20know%20more%20about%20the%20Brown%20Cows%20learning%20retreat."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex items-center rounded-full bg-[#8b5e34] px-6 py-3 font-semibold text-white transition hover:bg-[#704721]"
                    >
                        Chat on WhatsApp <ArrowRight className="ml-2" size={18} />
                    </a>
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold">Frequently asked questions</h2>
                    {faqs.map((faq, index) => (
                        <div key={faq.question} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                            >
                                {faq.question}
                                <ChevronDown className={`shrink-0 transition ${openFaq === index ? 'rotate-180' : ''}`} size={20} />
                            </button>
                            <AnimatePresence initial={false}>
                                {openFaq === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-5 pb-5 leading-relaxed text-gray-600 dark:text-gray-300">{faq.answer}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            <AnimatePresence>
                {showBrochure && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold">Get Our Brochure</h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Fill in your details and the download starts instantly.</p>
                                </div>
                                <button onClick={() => setShowBrochure(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close brochure form">
                                    <X size={22} />
                                </button>
                            </div>
                            <form onSubmit={submitBrochure} className="mt-6 space-y-4">
                                <Input label="Full Name" value={brochureForm.name} onChange={(value) => setBrochureForm({ ...brochureForm, name: value })} required />
                                <Input label="Email Address" type="email" value={brochureForm.email} onChange={(value) => setBrochureForm({ ...brochureForm, email: value })} required />
                                <Input label="Phone Number" type="tel" value={brochureForm.phone} onChange={(value) => setBrochureForm({ ...brochureForm, phone: value })} required />
                                <Input label="Number of Guests" type="number" min="1" value={brochureForm.guests} onChange={(value) => setBrochureForm({ ...brochureForm, guests: value })} />
                                <button type="submit" className="inline-flex w-full items-center justify-center rounded-xl bg-[#0f7f67] px-5 py-3 font-bold text-white hover:bg-[#0b6552]">
                                    Get Brochure <ArrowRight className="ml-2" size={18} />
                                </button>
                                {brochureSubmitted && <p className="text-sm font-semibold text-[#0f7f67]">Thank you. Your brochure download has started.</p>}
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {openImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
                    >
                        <button onClick={() => setOpenImage(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Close image">
                            <X />
                        </button>
                        <button onClick={() => setOpenImage((openImage + galleryImages.length - 1) % galleryImages.length)} className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Previous image">
                            <ChevronLeft />
                        </button>
                        <img src={galleryImages[openImage]} alt="Farm retreat gallery preview" className="max-h-[84vh] max-w-[88vw] rounded-2xl object-contain" />
                        <button onClick={() => setOpenImage((openImage + 1) % galleryImages.length)} className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" aria-label="Next image">
                            <ChevronRight />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ScheduleBlock = ({ title, items }) => (
    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
        <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold">
            <CalendarDays className="text-[#8b5e34]" />
            {title}
        </h3>
        <div className="space-y-4">
            {items.map(([time, heading, detail]) => (
                <div key={`${time}-${heading}`} className="grid gap-2 border-l-2 border-[#d6a23d] pl-4 sm:grid-cols-[90px_1fr]">
                    <div className="text-sm font-bold text-[#8b5e34] dark:text-[#f2c76b]">{time}</div>
                    <div>
                        <h4 className="font-bold">{heading}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{detail}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const Input = ({ label, value, onChange, type = 'text', ...props }) => (
    <label className="block">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-[#8b5e34] focus:ring-2 focus:ring-[#8b5e34]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            {...props}
        />
    </label>
);

export default LearningRetreat;
