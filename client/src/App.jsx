import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';
import Chatbot from './components/Chatbot';
import Footer from './components/layout/Footer';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Farms = lazy(() => import('./pages/Farms'));
const FarmDetails = lazy(() => import('./pages/FarmDetails'));
const LearningRetreat = lazy(() => import('./pages/LearningRetreat'));
const Admin = lazy(() => import('./pages/Admin'));
const Database = lazy(() => import('./pages/Database'));
const Success = lazy(() => import('./pages/Success'));
const Profile = lazy(() => import('./pages/Profile'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const BookingDetails = lazy(() => import('./pages/BookingDetails'));
const Favorites = lazy(() => import('./pages/Favorites'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<Navigate to="/login" replace state={location.state} />} />
                <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
                <Route path="/farms" element={<PageTransition><Farms /></PageTransition>} />
                <Route path="/farm/:id" element={<PageTransition><FarmDetails /></PageTransition>} />
                <Route path="/2-day-learning-retreat" element={<PageTransition><LearningRetreat /></PageTransition>} />
                <Route path="/learning-retreat" element={<PageTransition><LearningRetreat /></PageTransition>} />
                <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
                <Route path="/database" element={<PageTransition><Database /></PageTransition>} />
                <Route path="/success" element={<PageTransition><Success /></PageTransition>} />
                <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="/bookings" element={<PageTransition><MyBookings /></PageTransition>} />
                <Route path="/bookings/:id" element={<PageTransition><BookingDetails /></PageTransition>} />
                <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
                <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
                <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
                <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
            </Routes>
        </AnimatePresence>
    );
};

const App = () => (
    <ThemeProvider>
        <AuthProvider>
            <CartProvider>
                <ToastProvider>
                    <Router>
                        <ScrollToTop />
                        <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-text-primary transition-colors duration-200 dark:bg-[#111611] dark:text-[#f7f0e4]">
                            <Navbar />
                            <main className="container mx-auto w-full flex-grow px-3 py-6 sm:px-4 sm:py-8">
                                <Suspense fallback={<LoadingSpinner />}>
                                    <AnimatedRoutes />
                                </Suspense>
                            </main>
                            <Footer />
                            <Chatbot />
                        </div>
                    </Router>
                </ToastProvider>
            </CartProvider>
        </AuthProvider>
    </ThemeProvider>
);

export default App;
