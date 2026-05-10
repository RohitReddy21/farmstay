import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Instagram, Mail, MessageCircle, Youtube, X, Facebook, Phone, MapPin } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import PageTransition from './components/PageTransition';

// Lazy load pages
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

// Policy Modal Component
const PolicyModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-[#fffaf1] shadow-2xl dark:bg-[#1a2118] border border-[#ead7b8] dark:border-[#31392f]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[#ead7b8] dark:border-[#31392f] bg-[#fffaf1] dark:bg-[#1a2118] px-6 py-4 z-10">
              <h2 className="text-xl font-bold text-[#211b14] dark:text-[#fff8ea]">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-[#7a5527] hover:bg-[#f4ead8] dark:text-[#e7c678] dark:hover:bg-[#232823] transition-all"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-sm text-[#4c3f30] dark:text-[#cfc2b2] leading-relaxed space-y-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CancellationPolicy = () => (
  <>
    <p className="text-base font-semibold text-[#211b14] dark:text-[#fff8ea]">
      Brown Cows Organic Dairy – Cancellation & Refund Policy
    </p>
    <p>We understand that plans can change. Here is our cancellation and refund policy for all farm stay bookings:</p>

    <div className="bg-[#f4ead8] dark:bg-[#232823] rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-[#7a5527] dark:text-[#e7c678]">Farm Stay Bookings</h3>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>15+ days before check-in:</strong> Full refund (100%) — No questions asked.</li>
        <li><strong>7–14 days before check-in:</strong> 50% refund of the total booking amount.</li>
        <li><strong>Less than 7 days before check-in:</strong> No refund. However, you may reschedule (subject to availability) by paying a rescheduling fee of ₹500.</li>
        <li><strong>No-show:</strong> No refund or rescheduling.</li>
      </ul>
    </div>

    <div className="bg-[#f4ead8] dark:bg-[#232823] rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-[#7a5527] dark:text-[#e7c678]">Learning Retreat Bookings</h3>
      <ul className="list-disc list-inside space-y-1">
        <li><strong>30+ days before the retreat:</strong> Full refund (100%).</li>
        <li><strong>15–29 days before the retreat:</strong> 50% refund.</li>
        <li><strong>Less than 15 days:</strong> No refund, but seat transfer to another person is allowed.</li>
      </ul>
    </div>

    <div className="bg-[#f4ead8] dark:bg-[#232823] rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-[#7a5527] dark:text-[#e7c678]">Refund Processing</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>Approved refunds will be processed within <strong>5–7 business days</strong> to the original payment method.</li>
        <li>Razorpay payment gateway charges (if any) are non-refundable.</li>
      </ul>
    </div>

    <div className="bg-[#fff8ea] dark:bg-[#1a2118] border border-[#ead7b8] dark:border-[#31392f] rounded-xl p-4">
      <p className="font-semibold text-[#7a5527] dark:text-[#e7c678]">Force Majeure</p>
      <p className="mt-1">In case of natural calamities, government restrictions, or events beyond our control, a full credit note valid for 12 months will be issued.</p>
    </div>

    <p className="text-xs text-[#8b7a66] dark:text-[#a99f90]">
      To initiate a cancellation, please contact us at <a href="mailto:browncowsdairy@gmail.com" className="underline text-[#7a5527] dark:text-[#e7c678]">browncowsdairy@gmail.com</a> or WhatsApp <a href="https://wa.me/919989854411" className="underline text-[#7a5527] dark:text-[#e7c678]">+91 99898 54411</a>.
    </p>
  </>
);

const RefundPolicy = () => (
  <>
    <p className="text-base font-semibold text-[#211b14] dark:text-[#fff8ea]">
      Brown Cows Organic Dairy – Refund Policy
    </p>
    <p>We strive to provide the best farm experience. If you are not satisfied, here's how we handle refunds:</p>

    <div className="bg-[#f4ead8] dark:bg-[#232823] rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-[#7a5527] dark:text-[#e7c678]">Eligibility</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>Refunds are processed only for bookings cancelled in line with our Cancellation Policy.</li>
        <li>No refunds for partial stays or early checkouts.</li>
        <li>Product (Ghee/Milk) purchases: Refund is applicable only if the product is damaged or defective on delivery.</li>
      </ul>
    </div>

    <div className="bg-[#f4ead8] dark:bg-[#232823] rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-[#7a5527] dark:text-[#e7c678]">Refund Process</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>Submit a refund request via email within 48 hours of cancellation or delivery.</li>
        <li>Include your booking ID / order ID and reason for refund.</li>
        <li>Our team will review and respond within 2 business days.</li>
        <li>Approved refunds are credited within <strong>5–7 business days</strong>.</li>
      </ul>
    </div>

    <div className="bg-[#fff8ea] dark:bg-[#1a2118] border border-[#ead7b8] dark:border-[#31392f] rounded-xl p-4">
      <p className="font-semibold text-[#7a5527] dark:text-[#e7c678]">Contact for Refunds</p>
      <p className="mt-1">Email: <a href="mailto:browncowsdairy@gmail.com" className="underline text-[#7a5527] dark:text-[#e7c678]">browncowsdairy@gmail.com</a></p>
      <p>WhatsApp: <a href="https://wa.me/919989854411" className="underline text-[#7a5527] dark:text-[#e7c678]">+91 99898 54411</a></p>
    </div>

    <p className="text-xs text-[#8b7a66] dark:text-[#a99f90]">
      Last updated: April 2026. Brown Cows Organic Dairy reserves the right to modify this policy at any time.
    </p>
  </>
);

const PrivacyPolicy = () => (
  <>
    <p className="text-base font-semibold text-[#211b14] dark:text-[#fff8ea]">
      Brown Cows Organic Dairy – Privacy Policy
    </p>
    <p>We respect your privacy. This policy explains how we collect, use, and protect your personal information.</p>

    <div className="bg-[#f4ead8] dark:bg-[#232823] rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-[#7a5527] dark:text-[#e7c678]">Information We Collect</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>Name, email, phone number when you register or book.</li>
        <li>Payment details (processed securely via Razorpay — we do not store card data).</li>
        <li>Usage data and preferences to improve your experience.</li>
      </ul>
    </div>

    <div className="bg-[#f4ead8] dark:bg-[#232823] rounded-xl p-4 space-y-2">
      <h3 className="font-bold text-[#7a5527] dark:text-[#e7c678]">How We Use Your Information</h3>
      <ul className="list-disc list-inside space-y-1">
        <li>To process bookings and send confirmations.</li>
        <li>To communicate offers, retreats, and updates (opt-out available anytime).</li>
        <li>To improve our services and website experience.</li>
        <li>We never sell your data to third parties.</li>
      </ul>
    </div>

    <p className="text-xs text-[#8b7a66] dark:text-[#a99f90]">
      Questions? Email <a href="mailto:browncowsdairy@gmail.com" className="underline text-[#7a5527] dark:text-[#e7c678]">browncowsdairy@gmail.com</a>
    </p>
  </>
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16.01 3.2c-7.04 0-12.76 5.72-12.76 12.75 0 2.25.59 4.45 1.72 6.38L3.15 29l6.83-1.79a12.7 12.7 0 0 0 6.03 1.53h.01c7.03 0 12.75-5.72 12.75-12.75S23.05 3.2 16.01 3.2Zm0 23.39h-.01c-1.91 0-3.78-.51-5.42-1.48l-.39-.23-4.05 1.06 1.08-3.95-.25-.41a10.55 10.55 0 0 1-1.62-5.63c0-5.87 4.78-10.64 10.66-10.64 2.84 0 5.51 1.11 7.52 3.12a10.58 10.58 0 0 1 3.12 7.51c0 5.87-4.78 10.65-10.64 10.65Zm5.84-7.97c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.98-2.34-.26-.61-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.66s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.15-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
  </svg>
);

const FloatingWhatsApp = () => {
  const location = useLocation();
  const isFarmDetailsPage = /^\/farm\//.test(location.pathname);

  if (isFarmDetailsPage) return null;

  return (
    <motion.a
      href="https://wa.me/919989854411?text=Hi%2C%20I%20need%20help%20with%20Brown%20Cows%20Dairy%20farm%20stays."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Brown Cows Dairy on WhatsApp"
      title="Need help booking?"
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-32 right-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_34px_rgba(37,211,102,0.35)] ring-4 ring-white/80 transition hover:bg-[#1fb85a] dark:ring-[#111611]/80 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8"
    >
      <span className="absolute -left-40 hidden whitespace-nowrap rounded-full border border-[#dcefdc] bg-white px-4 py-2 text-sm font-bold text-[#1f6f3f] shadow-lg lg:block">
        Need help booking?
      </span>
      <WhatsAppIcon size={27} />
    </motion.a>
  );
};

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);

  const socials = [
    {
      label: 'WhatsApp',
      href: 'https://wa.me/919989854411',
      Icon: WhatsAppIcon,
      color: 'hover:bg-green-500 hover:border-green-500'
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/browncowsdairy/',
      Icon: Instagram,
      color: 'hover:bg-pink-500 hover:border-pink-500'
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/browncowsdairy',
      Icon: Facebook,
      color: 'hover:bg-blue-600 hover:border-blue-600'
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@browncowsdairy',
      Icon: Youtube,
      color: 'hover:bg-red-500 hover:border-red-500'
    },
    {
      label: 'Mail',
      href: 'mailto:browncowsdairy@gmail.com',
      Icon: Mail,
      color: 'hover:bg-[#7a5527] hover:border-[#7a5527]'
    },
  ];

  const policies = [
    { key: 'cancellation', label: 'Cancellation Policy' },
    { key: 'refund', label: 'Refund Policy' },
    { key: 'privacy', label: 'Privacy Policy' },
  ];

  return (
    <>
      {/* Policy Modals */}
      <PolicyModal isOpen={activeModal === 'cancellation'} onClose={() => setActiveModal(null)} title="Cancellation Policy">
        <CancellationPolicy />
      </PolicyModal>
      <PolicyModal isOpen={activeModal === 'refund'} onClose={() => setActiveModal(null)} title="Refund Policy">
        <RefundPolicy />
      </PolicyModal>
      <PolicyModal isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)} title="Privacy Policy">
        <PrivacyPolicy />
      </PolicyModal>

      <footer className="relative overflow-hidden border-t border-[#ead7b8] bg-gradient-to-br from-[#fffaf1] via-[#fdf5e6] to-[#f9edd4] text-[#4c3f30] transition-colors duration-200 dark:border-[#2a3228] dark:from-[#0f1510] dark:via-[#111812] dark:to-[#0d1410] dark:text-[#cfc2b2]">

        {/* Decorative top border accent */}
        <div className="h-1 w-full bg-gradient-to-r from-[#d6a23d] via-[#7a5527] to-[#d6a23d]" />

        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">

            {/* Brand Column */}
            <div className="space-y-5">
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="inline-block"
              >
                <Link to="/">
                  <img
                    src="/logo.png"
                    alt="Brown Cows Organic Dairy"
                    className="h-24 w-auto drop-shadow-md"
                  />
                </Link>
              </motion.div>

              <p className="max-w-xs text-sm leading-relaxed text-[#645747] dark:text-[#b5a898]">
                A working farm dedicated to ethical dairy and immersive farm experiences. Hands-on retreats, A2 Gir cow milk products, and slow rural living.
              </p>

              {/* Social Icons */}
              <div className="flex flex-wrap gap-3">
                {socials.map(({ label, href, Icon, color }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    aria-label={label}
                    title={label}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#dfcaa8] bg-[#f7f0e4] text-[#7a5527] shadow-sm transition-all duration-300 hover:text-[#7a5527] dark:border-[#31392f] dark:bg-[#1a2118] dark:text-[#e7c678]`}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Explore Column */}
            <div>
              <h3 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-[#7a5527] dark:text-[#e7c678]">Explore</h3>
              <div className="space-y-3 text-sm font-medium">
                {[
                  { to: '/farms', label: 'Farm Stays' },
                  { to: '/2-day-learning-retreat', label: 'Learning Retreat' },
                  { href: 'https://browncowsdairy.com/', label: 'Our Products' },
                  { to: '/bookings', label: 'My Bookings' },
                  { to: '/cart', label: 'Cart' },
                  { href: 'https://browncowsdairy.com/pages/our-story', label: 'Our Story' },
                  { href: 'https://browncowsdairy.com/pages/promise-of-purity', label: 'Promise of Purity' },
                ].map(({ to, href, label }) =>
                  to ? (
                    <Link
                      key={label}
                      to={to}
                      className="group flex items-center gap-1.5 text-[#645747] transition-all hover:text-[#7a5527] dark:text-[#b5a898] dark:hover:text-[#e7c678]"
                    >
                      <span className="h-px w-0 bg-[#7a5527] transition-all group-hover:w-3 dark:bg-[#e7c678]" />
                      {label}
                    </Link>
                  ) : (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-1.5 text-[#645747] transition-all hover:text-[#7a5527] dark:text-[#b5a898] dark:hover:text-[#e7c678]"
                    >
                      <span className="h-px w-0 bg-[#7a5527] transition-all group-hover:w-3 dark:bg-[#e7c678]" />
                      {label}
                    </a>
                  )
                )}
              </div>
            </div>

            {/* Policies Column */}
            <div>
              <h3 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-[#7a5527] dark:text-[#e7c678]">Policies</h3>
              <div className="space-y-3 text-sm font-medium">
                {policies.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveModal(key)}
                    className="group flex items-center gap-1.5 text-left text-[#645747] transition-all hover:text-[#7a5527] dark:text-[#b5a898] dark:hover:text-[#e7c678]"
                  >
                    <span className="h-px w-0 bg-[#7a5527] transition-all group-hover:w-3 dark:bg-[#e7c678]" />
                    {label}
                  </button>
                ))}
                {/* <a
                  href="https://browncowsdairy.com/pages/terms-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-[#645747] transition-all hover:text-[#7a5527] dark:text-[#b5a898] dark:hover:text-[#e7c678]"
                >
                  <span className="h-px w-0 bg-[#7a5527] transition-all group-hover:w-3 dark:bg-[#e7c678]" />
                  Terms & Conditions
                </a>
                <a
                  href="https://browncowsdairy.com/pages/shipping"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-[#645747] transition-all hover:text-[#7a5527] dark:text-[#b5a898] dark:hover:text-[#e7c678]"
                >
                  <span className="h-px w-0 bg-[#7a5527] transition-all group-hover:w-3 dark:bg-[#e7c678]" />
                  Shipping Policy
                </a> */}
              </div>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-[#7a5527] dark:text-[#e7c678]">Contact Us</h3>
              <div className="space-y-4 text-sm">
                <a
                  href="tel:+919989854411"
                  className="flex items-start gap-3 text-[#645747] transition-all hover:text-[#7a5527] dark:text-[#b5a898] dark:hover:text-[#e7c678] group"
                >
                  <Phone size={16} className="mt-0.5 flex-shrink-0 text-[#d6a23d]" />
                  <span>+91 99898 54411</span>
                </a>
                <a
                  href="mailto:browncowsdairy@gmail.com"
                  className="flex items-start gap-3 text-[#645747] transition-all hover:text-[#7a5527] dark:text-[#b5a898] dark:hover:text-[#e7c678] group"
                >
                  <Mail size={16} className="mt-0.5 flex-shrink-0 text-[#d6a23d]" />
                  <span>browncowsdairy@gmail.com</span>
                </a>
                <div className="flex items-start gap-3 text-[#645747] dark:text-[#b5a898]">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#d6a23d]" />
                  <span>Gouripally Village,<br />Medak, Telangana</span>
                </div>

                {/* WhatsApp CTA */}
                <motion.a
                  href="https://wa.me/919989854411?text=Hi%2C+I+have+a+question+about+your+farm+experiences."
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-green-800 transition-all"
                >
                  <MessageCircle size={14} />
                  Chat on WhatsApp
                </motion.a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 border-t border-[#ead7b8] dark:border-[#2a3228]" />

          {/* Bottom bar */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs font-medium text-[#8b7a66] sm:flex-row dark:text-[#7a6f60]">
            <p>© 2022 Brown Cows Organic Dairy. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {/* <span>Made with in Telangana</span> */}
              <a
                href="https://browncowsdairy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[#7a5527] dark:hover:text-[#e7c678]"
              >
                browncowsdairy.com ↗
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
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
                <FloatingWhatsApp />
              </div>
            </Router>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
