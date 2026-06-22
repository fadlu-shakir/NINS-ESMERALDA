import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`bookings/${id}/`).then(res => setBooking(res.data)).catch(console.error);
  }, [id]);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment process delay
    setTimeout(async () => {
      try {
        await api.post(`bookings/${id}/pay/`);
        toast.success('Payment Successful! Your booking is confirmed.');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Payment failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  if (!booking) return <div className="text-center my-5">Loading...</div>;

  return (
    <div className="container py-5" style={{ marginTop: '70px' }}>
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-link text-muted p-0 text-decoration-none d-inline-flex align-items-center hover-accent fw-semibold text-uppercase small letter-spacing-1">
          <i className="fas fa-chevron-left me-2" style={{ fontSize: '0.75rem' }}></i> Back
        </button>
      </div>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow border-0 text-center p-5">
            <div className="mb-4">
              <i className="fas fa-credit-card text-accent" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="mb-3">Secure Payment</h2>
            <p className="text-muted mb-4">You are about to pay for Booking #{booking.id}</p>
            
            <div className="bg-light p-4 rounded mb-4">
              <h1 className="text-accent mb-0">₹{booking.total_amount}</h1>
            </div>

            <button 
              className="btn btn-primary-modern btn-lg w-100" 
              onClick={handlePayment} 
              disabled={loading || booking.status === 'Confirmed'}
            >
              {loading ? (
                <span><i className="fas fa-spinner fa-spin me-2"></i>Processing...</span>
              ) : booking.status === 'Confirmed' ? (
                'Already Paid'
              ) : (
                'Pay Now'
              )}
            </button>
            
            <p className="small text-muted mt-3">
              <i className="fas fa-lock me-1"></i> This is a dummy payment .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
