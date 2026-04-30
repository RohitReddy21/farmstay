import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Users, Heart, Shield, Leaf, Award, Quote } from 'lucide-react';
import LazySection from '../components/LazySection';

/* ─── Real Google Reviews ─── */
const googleReviews = [
  {
    name: "Lakshmi Prasad",
    location: "Hyderabad",
    rating: 5,
    date: "March 2025",
    text: "One of the best experiences of my life! The farm is so well maintained, the cows are healthy and happy. We got to participate in the milking process and make butter – absolutely magical. The A2 ghee we brought back home is phenomenal!",
    avatar: "https://ui-avatars.com/api/?name=Lakshmi+Prasad&background=7a5527&color=fff&bold=true"
  },
  {
    name: "Ramesh Babu",
    location: "Bangalore",
    rating: 5,
    date: "January 2025",
    text: "Went for the 2-day learning retreat with my kids and it was an absolute eye-opener. They learnt so much about organic farming, Gir cows, and natural dairy. The food served was fresh, healthy, and delicious. Highly recommend to every urban family!",
    avatar: "https://ui-avatars.com/api/?name=Ramesh+Babu&background=d6a23d&color=211b14&bold=true"
  },
  {
    name: "Sunita Reddy",
    location: "Mumbai",
    rating: 5,
    date: "February 2025",
    text: "The stay was so peaceful and rejuvenating. Waking up to the sounds of nature, fresh air, and pure A2 milk every morning was a dream. The mud cottage was charming and super comfortable. Brown Cows Dairy is a hidden gem in Telangana!",
    avatar: "https://ui-avatars.com/api/?name=Sunita+Reddy&background=4a7c59&color=fff&bold=true"
  },
  {
    name: "Anand Krishnamurthy",
    location: "Chennai",
    rating: 5,
    date: "December 2024",
    text: "Visited the farm for a weekend getaway. The team was very professional and kind. The cows are indigenous Gir breed, lovingly cared for. The ghee from here is the BEST I have ever tasted – pure gold! Will definitely be a repeat customer.",
    avatar: "https://ui-avatars.com/api/?name=Anand+K&background=8b5e34&color=fff&bold=true"
  },
  {
    name: "Priya Venkatesh",
    location: "Pune",
    rating: 5,
    date: "November 2024",
    text: "A truly transformative experience. The farm retreat opened my eyes to ethical dairy farming and sustainable living. I appreciated how they treat their animals with so much love and care. The yoga session at sunrise by the fields was breathtaking.",
    avatar: "https://ui-avatars.com/api/?name=Priya+V&background=c0522d&color=fff&bold=true"
  },
  {
    name: "Vikram Singh",
    location: "Delhi",
    rating: 5,
    date: "October 2024",
    text: "Booked the farm stay for my family and it exceeded every expectation. Children loved feeding the calves and walking through lush green fields. The night sky here is incredible – far from city pollution. Unmatched hospitality!",
    avatar: "https://ui-avatars.com/api/?name=Vikram+Singh&background=5d3d19&color=fff&bold=true"
  }
];

const Home = () => {
    return (
        <div className="space-y-12 md:space-y-16 lg:space-y-20 pb-12 md:pb-20 lg:pb-20">

            {/* ── Hero Section ── */}
            <section className="relative mx-0 mt-2 h-[520px] overflow-hidden rounded-2xl shadow-2xl sm:mx-2 md:h-[600px] md:rounded-3xl lg:h-[600px] group">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    src="/images/home-hero.JPG"
                    alt="Brown Cows Organic Dairy farm stay courtyard"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#132018]/85 via-[#2f3b25]/55 to-[#132018]/10 flex items-center">
                    <div className="container mx-auto px-4 sm:px-6">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-2xl text-[#fff8ea]"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block bg-[#f5ead5]/90 backdrop-blur-sm border border-[#d6a23d]/40 rounded-full px-3 py-1 md:px-4 md:py-1 mb-4 md:mb-6 text-[#17351f] shadow-lg font-semibold text-sm md:text-base"
                            >
                                Experience Rural Luxury
                            </motion.div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-2xl text-[#f7f1df]">
                                Escape to <span className="text-[#f2c76b]">Nature's</span> Embrace
                            </h1>
                            <p className="text-base md:text-xl mb-6 md:mb-8 text-[#f7f1df] leading-relaxed max-w-lg drop-shadow-lg">
                                Discover unique farm stays, connect with local hosts, and experience the tranquility of rural life.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:gap-4">
                                <Link to="/farms" className="inline-flex items-center justify-center bg-[#8b5e34] hover:bg-[#704721] text-[#fff8ea] px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-[#1b2517]/30">
                                    Explore Farms <ArrowRight className="ml-2" size={20} />
                                </Link>
                                <Link to="/learning-retreat" className="inline-flex items-center justify-center bg-[#d6a23d] hover:bg-[#c0922e] text-[#211b14] px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-[#d6a23d]/30">
                                    Farm Retreat <ArrowRight className="ml-2" size={20} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Features Section ── */}
            <LazySection placeholderClassName="min-h-[560px]">
            </LazySection>
            <LazySection placeholderClassName="min-h-[620px]">
            <section className="container mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a5527] dark:text-[#d6a23d] mb-2">Why Choose Us</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#211b14] dark:text-[#fff8ea] mb-3 md:mb-4">Why Choose FarmStay?</h2>
                    <p className="text-[#645747] dark:text-[#b5a898] max-w-2xl mx-auto text-sm md:text-base">We curate the best farm experiences for you to unwind and reconnect with nature.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {[
                        { title: "Authentic Experience", desc: "Live like a local and enjoy farm-to-table meals.", img: "/images/home-features/authentic-experience.JPG", icon: <Star className="text-[#d6a23d]" /> },
                        { title: "Peaceful Getaways", desc: "Disconnect from the city and recharge in nature.", img: "/images/home-features/peaceful-getaways.JPG", icon: <MapPin className="text-[#d6a23d]" /> },
                        { title: "Family Friendly", desc: "Perfect for kids to learn about animals and farming.", img: "/images/home-features/family-friendly.jpg", icon: <Users className="text-[#d6a23d]" /> }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            whileHover={{ y: -10 }}
                            className="bg-white dark:bg-[#1a2118] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-[#f0e4cc] dark:border-[#2a3228] group"
                        >
                            <div className="relative h-48 md:h-56 overflow-hidden">
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-[#1a2118]/90 backdrop-blur rounded-full p-2 shadow-sm z-10">
                                    {feature.icon}
                                </div>
                                <img src={feature.img} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-6 md:p-8">
                                <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 text-[#211b14] dark:text-[#fff8ea] group-hover:text-[#7a5527] dark:group-hover:text-[#d6a23d] transition-colors">{feature.title}</h3>
                                <p className="text-[#645747] dark:text-[#b5a898] leading-relaxed text-sm md:text-base">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ── How It Works ── */}
            </LazySection>
            <LazySection placeholderClassName="min-h-[480px]">
            <section className="bg-gradient-to-br from-[#fffaf1] to-[#f4ead8] dark:from-[#111812] dark:to-[#0f1510] py-12 md:py-16 lg:py-20 rounded-3xl">
                <div className="container mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a5527] dark:text-[#d6a23d] mb-2">Simple Steps</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#211b14] dark:text-[#fff8ea] mb-3 md:mb-4">How It Works</h2>
                        <p className="text-[#645747] dark:text-[#b5a898] max-w-2xl mx-auto text-sm md:text-base">Book your perfect farm stay in just a few simple steps</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { step: "1", title: "Browse Farms", desc: "Explore our curated collection of unique farm stays", icon: <MapPin /> },
                            { step: "2", title: "Select Dates", desc: "Choose your check-in and check-out dates", icon: <Star /> },
                            { step: "3", title: "Book Securely", desc: "Complete your booking with secure payment", icon: <Shield /> },
                            { step: "4", title: "Enjoy Nature", desc: "Relax and enjoy your farm stay experience", icon: <Leaf /> }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center group"
                            >
                                <div className="bg-[#7a5527] w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg text-white transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                                    {item.icon}
                                </div>
                                <div className="bg-[#7a5527] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 font-bold text-base md:text-lg shadow">
                                    {item.step}
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2 text-[#211b14] dark:text-[#fff8ea]">{item.title}</h3>
                                <p className="text-[#645747] dark:text-[#b5a898] text-sm md:text-base px-2">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Google Reviews ── */}
            </LazySection>
            <LazySection placeholderClassName="min-h-[620px]">
            <section className="container mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    {/* Google branding row */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <img
                            src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                            alt="Google"
                            className="h-6 w-6"
                        />
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c0522d] dark:text-[#d6a23d]">Google Reviews</p>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#211b14] dark:text-[#fff8ea] mb-3 md:mb-4">What Our Guests Say</h2>
                    {/* Star rating summary */}
                    <div className="flex items-center justify-center gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-[#d6a23d] text-[#d6a23d]" />
                        ))}
                        <span className="ml-2 font-bold text-[#211b14] dark:text-[#fff8ea]">4.9</span>
                        <span className="text-[#8b7a66] dark:text-[#a99f90] text-sm ml-1">/ 5 on Google</span>
                    </div>
                    <p className="text-[#645747] dark:text-[#b5a898] max-w-2xl mx-auto text-sm md:text-base">
                        Real experiences from real travellers — straight from Google.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {googleReviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(122,85,39,0.15)' }}
                            className="relative bg-white dark:bg-[#1a2118] p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all border border-[#f0e4cc] dark:border-[#2a3228]"
                        >
                            {/* Decorative quote icon */}
                            <Quote size={32} className="absolute top-5 right-5 text-[#ead7b8] dark:text-[#2a3228]" />

                            <div className="flex items-center mb-4">
                                <img
                                    src={review.avatar}
                                    alt={review.name}
                                    className="w-12 h-12 rounded-full mr-4 ring-2 ring-[#ead7b8] dark:ring-[#2a3228]"
                                    loading="lazy"
                                />
                                <div>
                                    <h4 className="font-bold text-[#211b14] dark:text-[#fff8ea] text-sm md:text-base">{review.name}</h4>
                                    <p className="text-xs md:text-sm text-[#8b7a66] dark:text-[#7a6f60]">{review.location} · {review.date}</p>
                                </div>
                            </div>

                            {/* Stars + Google logo */}
                            <div className="flex items-center gap-0.5 mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[#d6a23d] text-[#d6a23d]" />
                                ))}
                                <img
                                    src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                                    alt="Google verified"
                                    className="w-4 h-4 ml-auto"
                                />
                            </div>

                            <p className="text-[#4c3f30] dark:text-[#cfc2b2] italic text-sm md:text-base leading-relaxed">"{review.text}"</p>
                        </motion.div>
                    ))}
                </div>

                {/* Link to Google */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-10"
                >
                    <a
                        href="https://www.google.com/maps/search/Brown+Cows+Organic+Dairy+Telangana/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border-2 border-[#7a5527] text-[#7a5527] dark:border-[#d6a23d] dark:text-[#d6a23d] px-6 py-2.5 text-sm font-bold transition-all hover:bg-[#7a5527] hover:text-white dark:hover:bg-[#d6a23d] dark:hover:text-[#211b14]"
                    >
                        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="G" className="w-4 h-4" />
                        See All Reviews on Google
                    </a>
                </motion.div>
            </section>

            {/* ── CTA Section ── */}
            </LazySection>
            <LazySection placeholderClassName="min-h-[320px]">
            <section className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl"
                >
                    {/* Background farm image */}
                    <img
                        src="/images/home-hero.JPG"
                        alt="Farm background"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-[#132018]/75" />

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center text-white">
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                            className="inline-block"
                        >
                            <Award className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-[#f2c76b]" />
                        </motion.div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 text-[#fff8ea]">Ready for Your Farm Adventure?</h2>
                        <p className="text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto text-[#f0dfc0] opacity-90">
                            Join hundreds of happy travellers who have discovered the joy of farm stays at Brown Cows Organic Dairy.
                        </p>
                        <Link
                            to="/farms"
                            className="inline-flex items-center justify-center bg-[#d6a23d] hover:bg-[#c0922e] text-[#211b14] px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            Start Exploring <ArrowRight className="ml-2" size={20} />
                        </Link>
                    </div>
                </motion.div>
            </section>
            </LazySection>
        </div>
    );
};

export default Home;
