import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';

import RoomDetails from './pages/RoomDetails';
import BookingPage from './pages/BookingPage';
import PaymentPage from './pages/PaymentPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import BrokerRoute from './components/BrokerRoute';
import NotFound from './pages/NotFound';
import WhatsAppButton from './components/WhatsAppButton';
import BrokerPending from './pages/BrokerPending';
import BrokerDashboard from './pages/BrokerDashboard';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

function App() {
  const { user } = useContext(AuthContext);
  const isBroker = user?.profile?.is_broker;
  const isBrokerVerified = user?.profile?.is_broker_verified;

  if (isBroker) {
    return (
      <Router>
        <div className="watermark-overlay"></div>
        <Routes>
          {isBrokerVerified ? (
            <Route path="*" element={<BrokerDashboard />} />
          ) : (
            <Route path="*" element={<BrokerPending />} />
          )}
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    );
  }

  return (
    <Router>
      <div className="watermark-overlay"></div>
      <Navbar />
      <div className="main-content" style={{ minHeight: 'calc(100vh - 300px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/booking/:id" element={<BookingPage />} />
            <Route path="/payment/:id" element={<PaymentPage />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>
          
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <WhatsAppButton />
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
