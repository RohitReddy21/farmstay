import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Farms from './pages/Farms';
import FarmDetails from './pages/FarmDetails';
import Admin from './pages/Admin';
import Database from './pages/Database';
import Success from './pages/Success';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/AdminDashboard';

import Chatbot from './components/Chatbot';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
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

