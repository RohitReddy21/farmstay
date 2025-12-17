import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Farms = lazy(() => import('./pages/Farms'));
const FarmDetails = lazy(() => import('./pages/FarmDetails'));
const Admin = lazy(() => import('./pages/Admin'));
const Database = lazy(() => import('./pages/Database'));
const Success = lazy(() => import('./pages/Success'));
const Profile = lazy(() => import('./pages/Profile'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const Favorites = lazy(() => import('./pages/Favorites'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/farms" element={<Farms />} />
                  <Route path="/farm/:id" element={<FarmDetails />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/database" element={<Database />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/bookings" element={<MyBookings />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
              </Suspense>
            </main>
            <Chatbot />
            <footer className="bg-white dark:bg-gray-800 py-6 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
              <p>&copy; 2024 FarmStay. All rights reserved.</p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

