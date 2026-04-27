import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-[#ead7b8] bg-[#fffaf1]/95 shadow-md backdrop-blur transition-colors duration-200 dark:border-[#31392f] dark:bg-[#151b15]/95">
            <div className="container mx-auto">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="Brown Cows Organic Dairy"
                            className="h-12 w-auto md:h-14"
                        />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                        <Link to="/farms" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Explore Farms</Link>
                        <Link to="/2-day-learning-retreat" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Learning Retreat</Link>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="rounded-full bg-[#f4ead8] p-2 text-[#7a5527] transition-all hover:bg-[#ead7b8] dark:bg-[#232823] dark:text-[#e7c678] dark:hover:bg-[#30382f]"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                        <Link to="/admin/dashboard" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Dashboard</Link>
                                        <Link to="/admin" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Admin</Link>
                                        <Link to="/database" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Database</Link>
                                    </>
                                )}
                                <Link to="/profile" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Profile</Link>
                                <Link to="/bookings" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">My Bookings</Link>
                                <Link to="/favorites" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Favorites</Link>
                                <span className="hidden px-2 py-1 font-medium text-[#211b14] dark:text-[#fff8ea] lg:inline">Hi, {user.name}</span>
                                <button onClick={logout} className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 transition px-2 py-1">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-2 py-1 text-[#645747] transition hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:text-[#e7c678]">Login</Link>
                                <Link to="/register" className="transform rounded-full bg-primary px-4 py-2 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary-800 hover:shadow-xl">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="rounded-full bg-[#f4ead8] p-2 text-[#7a5527] transition-all hover:bg-[#ead7b8] dark:bg-[#232823] dark:text-[#e7c678] dark:hover:bg-[#30382f]"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="rounded-lg p-2 text-[#7a5527] transition-colors hover:bg-[#f4ead8] focus:outline-none dark:text-[#e7c678] dark:hover:bg-[#232823]"
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
                        className="border-t border-[#ead7b8] bg-[#fffaf1] shadow-lg dark:border-[#31392f] dark:bg-[#151b15] md:hidden"
                    >
                        <div className="px-4 py-6 space-y-1 flex flex-col max-h-[calc(100vh-4rem)] overflow-y-auto">
                            <Link
                                to="/farms"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                            >
                                Explore Farms
                            </Link>
                            <Link
                                to="/2-day-learning-retreat"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                            >
                                Learning Retreat
                            </Link>

                            {user ? (
                                <>
                                    {user.role === 'admin' && (
                                        <>
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setIsOpen(false)}
                                                className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                                            >
                                                Analytics Dashboard
                                            </Link>
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsOpen(false)}
                                                className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                                            >
                                                Admin Dashboard
                                            </Link>
                                            <Link
                                                to="/database"
                                                onClick={() => setIsOpen(false)}
                                                className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                                            >
                                                Database
                                            </Link>
                                        </>
                                    )}

                                    <div className="my-2 border-t border-[#ead7b8] dark:border-[#31392f]"></div>

                                    <div className="px-4 py-2">
                                        <p className="mb-1 text-xs uppercase tracking-wide text-[#8b7a66] dark:text-[#cfc2b2]">Account</p>
                                        <p className="font-semibold text-[#211b14] dark:text-[#fff8ea]">Hi, {user.name}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/bookings"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                                    >
                                        My Bookings
                                    </Link>
                                    <Link
                                        to="/favorites"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                                    >
                                        Favorites
                                    </Link>

                                    <div className="my-2 border-t border-[#ead7b8] dark:border-[#31392f]"></div>

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
                                        className="rounded-lg px-4 py-3 font-medium text-[#645747] transition-all hover:bg-[#f4ead8] hover:text-[#7a5527] dark:text-[#d5c9b7] dark:hover:bg-[#232823] dark:hover:text-[#e7c678]"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="rounded-lg bg-primary px-4 py-3 text-center font-semibold text-white shadow-md transition-all hover:bg-primary-800"
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

