import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Instagram, Mail, MessageCircle, Youtube } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Farms = lazy(() => import('./pages/Farms'));
const FarmDetails = lazy(() => import('./pages/FarmDetails'));
const LearningRetreat = lazy(() => import('./pages/LearningRetreat'));
const Admin = lazy(() => import('./pages/Admin'));
const Database = lazy(() => import('./pages/Database'));
const Success = lazy(() => import('./pages/Success'));
const Profile = lazy(() => import('./pages/Profile'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
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
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
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
        <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const Footer = () => {
  const socials = [
    {
      label: 'Mail',
      href: 'mailto:browncowsdairy@gmail.com',
      Icon: Mail
    },
    {
      label: 'WhatsApp',
      href: 'https://wa.me/919989854411',
      Icon: MessageCircle
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      Icon: Instagram
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/',
      Icon: Youtube
    }
  ];

  return (
    <footer className="border-t border-[#ead7b8] bg-[#fffaf1] text-[#4c3f30] transition-colors duration-200 dark:border-[#31392f] dark:bg-[#151b15] dark:text-[#cfc2b2]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a5527] dark:text-[#e7c678]">
            Brown Cows Organic Dairy
          </p>
          <h2 className="mt-3 text-2xl font-black text-[#211b14] dark:text-[#fff8ea]">
            Farm stays, retreats, and slow rural experiences.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#645747] dark:text-[#d5c9b7]">
            Traditional mud cottages, limestone villas, fresh meals, and hands-on learning at Brown Cows Dairy.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                aria-label={label}
                title={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dfcaa8] bg-white text-[#7a5527] shadow-sm transition hover:-translate-y-0.5 hover:border-[#7a5527] hover:bg-[#7a5527] hover:text-white dark:border-[#31392f] dark:bg-[#1f261f] dark:text-[#e7c678] dark:hover:border-[#e7c678] dark:hover:bg-[#e7c678] dark:hover:text-[#151b15]"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#211b14] dark:text-[#fff8ea]">Explore</h3>
          <div className="mt-4 grid gap-2 text-sm font-semibold">
            <Link to="/farms" className="transition hover:text-[#7a5527] dark:hover:text-[#e7c678]">Farm Stays</Link>
            <Link to="/2-day-learning-retreat" className="transition hover:text-[#7a5527] dark:hover:text-[#e7c678]">Learning Retreat</Link>
            <Link to="/cart" className="transition hover:text-[#7a5527] dark:hover:text-[#e7c678]">Cart</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.16em] text-[#211b14] dark:text-[#fff8ea]">Contact</h3>
          <div className="mt-4 grid gap-2 text-sm font-semibold">
            <a href="tel:+919989854411" className="transition hover:text-[#7a5527] dark:hover:text-[#e7c678]">+91 99898 54411</a>
            <a href="mailto:browncowsdairy@gmail.com" className="transition hover:text-[#7a5527] dark:hover:text-[#e7c678]">browncowsdairy@gmail.com</a>
            <span>Gouripally Village, Telangana</span>
          </div>
        </div>
      </div>
      <div className="border-t border-[#ead7b8] px-4 py-4 text-center text-xs font-semibold text-[#756751] dark:border-[#31392f] dark:text-[#a99f90]">
        &copy; 2026 Brown Cows Organic Dairy. All rights reserved.
      </div>
    </footer>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen overflow-x-hidden bg-background text-text-primary dark:bg-[#111611] dark:text-[#f7f0e4] flex flex-col transition-colors duration-200">
              <Navbar />
              <main className="flex-grow container mx-auto w-full px-3 py-6 sm:px-4 sm:py-8">
                <Suspense fallback={<LoadingSpinner />}>
                  <AnimatedRoutes />
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
