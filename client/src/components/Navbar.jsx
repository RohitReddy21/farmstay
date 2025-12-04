import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Tractor } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
                        <Tractor size={28} />
                        <span>FarmStay</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/farms" className="text-gray-600 hover:text-primary transition">Explore Farms</Link>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                        <Link to="/admin" className="text-gray-600 hover:text-primary transition">Admin</Link>
                                        <Link to="/database" className="text-gray-600 hover:text-primary transition">Database</Link>
                                    </>
                                )}
                                <Link to="/profile" className="text-gray-600 hover:text-primary transition">Profile</Link>
                                <Link to="/bookings" className="text-gray-600 hover:text-primary transition">My Bookings</Link>
                                <span className="text-gray-800 font-medium">Hi, {user.name}</span>
                                <button onClick={logout} className="text-red-500 hover:text-red-600 transition">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-primary transition">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-full hover:bg-green-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 focus:outline-none">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t"
                    >
                        <div className="px-4 py-4 space-y-4 flex flex-col">
                            <Link to="/farms" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-primary">Explore Farms</Link>
                            {user ? (
                                <>
                                    <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-primary">Profile</Link>
                                    <Link to="/bookings" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-primary">My Bookings</Link>
                                    <span className="text-gray-800 font-medium">Hi, {user.name}</span>
                                    <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-red-500 hover:text-red-600">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-primary">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="bg-primary text-white px-4 py-2 rounded-full text-center">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

