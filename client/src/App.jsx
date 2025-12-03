import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Farms from './pages/Farms';
import FarmDetails from './pages/FarmDetails';
import Admin from './pages/Admin';
import Database from './pages/Database';
import Success from './pages/Success';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background flex flex-col">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/farms" element={<Farms />} />
              <Route path="/farm/:id" element={<FarmDetails />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/database" element={<Database />} />
              <Route path="/success" element={<Success />} />
            </Routes>
          </main>
          <footer className="bg-white py-6 text-center text-gray-500">
            <p>&copy; 2024 FarmStay. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
