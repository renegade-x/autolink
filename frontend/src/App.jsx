import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
// Import other pages as we create them
import Login from './pages/Login';
import Signup from './pages/Signup';
import DealerDashboard from './pages/DealerDashboard';
import BookingPage from './pages/BookingPage';
import CustomerBookings from './pages/CustomerBookings';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dealer/dashboard" element={<DealerDashboard />} />
            <Route path="/book/:vehicleId" element={<BookingPage />} />
            <Route path="/bookings" element={<CustomerBookings />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
