import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Tractor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
            <div className="container mx-auto">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl lg:text-2xl">
                        <Tractor size={28} className="lg:w-8 lg:h-8" />
                        <span>FarmStay</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                        <Link to="/farms" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition px-2 py-1">Explore Farms</Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                        <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition px-2 py-1">Admin</Link>
                                        <Link to="/database" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition px-2 py-1">Database</Link>
                                    </>
                                )}
                                <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition px-2 py-1">Profile</Link>
                                <Link to="/bookings" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition px-2 py-1">My Bookings</Link>
                                <Link to="/favorites" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition px-2 py-1">Favorites</Link>
                                <span className="text-gray-800 dark:text-gray-200 font-medium px-2 py-1 hidden lg:inline">Hi, {user.name}</span>
                                <button onClick={logout} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition px-2 py-1">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition px-2 py-1">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-full hover:bg-green-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 dark:text-gray-300 focus:outline-none p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        >
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
                        className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                        <div className="px-4 py-6 space-y-1 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
                            <Link
                                to="/farms"
                                onClick={() => setIsOpen(false)}
                                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition-all font-medium"
                            >
                                Explore Farms
                            </Link>

                            {user ? (
                                <>
                                    {user.role === 'admin' && (
                                        <>
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsOpen(false)}
                                                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition-all font-medium"
                                            >
                                                Admin Dashboard
                                            </Link>
                                            <Link
                                                to="/database"
                                                onClick={() => setIsOpen(false)}
                                                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition-all font-medium"
                                            >
                                                Database
                                            </Link>
                                        </>
                                    )}

                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                                    <div className="px-4 py-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Account</p>
                                        <p className="text-gray-800 dark:text-gray-200 font-semibold">Hi, {user.name}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition-all font-medium"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/bookings"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition-all font-medium"
                                    >
                                        My Bookings
                                    </Link>
                                    <Link
                                        to="/favorites"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition-all font-medium"
                                    >
                                        Favorites
                                    </Link>

                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="text-left text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-3 rounded-lg transition-all font-medium w-full"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-lg transition-all font-medium"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-primary text-white px-4 py-3 rounded-lg text-center font-semibold hover:bg-green-600 transition-all shadow-md"
                                    >
                                        Sign Up
                                    </Link>
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

