import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Users, Heart, Shield, Leaf, Award } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl mx-4 mt-4 group">
                <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                    alt="Farm Landscape"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center">
                    <div className="container mx-auto px-8 md:px-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-2xl text-white"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-1 mb-6 text-primary-100 font-medium"
                            >
                                🌿 Experience Rural Luxury
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
                                Escape to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">Nature's</span> Embrace
                            </h1>
                            <p className="text-xl mb-8 text-gray-200 leading-relaxed max-w-lg">
                                Discover unique farm stays, connect with local hosts, and experience the tranquility of rural life.
                            </p>
                            <div className="flex gap-4">
                                <Link to="/farms" className="inline-flex items-center bg-primary hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-primary/50">
                                    Explore Farms <ArrowRight className="ml-2" />
                                </Link>
                                <Link to="/register" className="inline-flex items-center bg-white/10 backdrop-blur-md hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all border border-white/30">
                                    Join Us
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose FarmStay?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">We curate the best farm experiences for you to unwind and reconnect with nature.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Authentic Experience", desc: "Live like a local and enjoy farm-to-table meals.", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80", icon: <Star className="text-yellow-400" /> },
                        { title: "Peaceful Getaways", desc: "Disconnect from the city and recharge in nature.", img: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=800&q=80", icon: <MapPin className="text-red-400" /> },
                        { title: "Family Friendly", desc: "Perfect for kids to learn about animals and farming.", img: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80", icon: <Users className="text-blue-400" /> }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-gray-100 group"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm z-10">
                                    {feature.icon}
                                </div>
                                <img src={feature.img} alt={feature.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-8">
                                <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="bg-gradient-to-br from-primary/5 to-green-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Book your perfect farm stay in just a few simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
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
                                className="text-center"
                            >
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-primary">
                                    {item.icon}
                                </div>
                                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">What Our Guests Say</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Real experiences from real travelers</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "Priya Sharma", location: "Mumbai", rating: 5, text: "An absolutely wonderful experience! The farm was beautiful and the hosts were incredibly welcoming.", avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=10b981&color=fff" },
                        { name: "Rajesh Kumar", location: "Bangalore", rating: 5, text: "Perfect weekend getaway with family. Kids loved the animals and fresh farm food was amazing!", avatar: "https://ui-avatars.com/api/?name=Rajesh+Kumar&background=10b981&color=fff" },
                        { name: "Anita Desai", location: "Delhi", rating: 5, text: "A peaceful retreat from city life. Highly recommend for anyone looking to reconnect with nature.", avatar: "https://ui-avatars.com/api/?name=Anita+Desai&background=10b981&color=fff" }
                    ].map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center mb-4">
                                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                                <div>
                                    <h4 className="font-bold">{testimonial.name}</h4>
                                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                                </div>
                            </div>
                            <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 italic">"{testimonial.text}"</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-primary to-green-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl"
                >
                    <Award className="w-16 h-16 mx-auto mb-6" />
                    <h2 className="text-4xl font-bold mb-4">Ready for Your Farm Adventure?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Join thousands of happy travelers who have discovered the joy of farm stays
                    </p>
                    <Link
                        to="/farms"
                        className="inline-flex items-center bg-white text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                        Start Exploring <ArrowRight className="ml-2" />
                    </Link>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;

