import { useState, useEffect } from 'react';
import api from '../../services/api';

const NewBookingNotification = () => {
  const [show, setShow] = useState(false);
  const [newBooking, setNewBooking] = useState(null);
  const [lastBookingId, setLastBookingId] = useState(null);

  useEffect(() => {
    const fetchInitialBookings = async () => {
      try {
        const res = await api.get(`bookings/?_t=${new Date().getTime()}`);
        if (res.data && res.data.length > 0) {
          const currentMaxId = Math.max(...res.data.map(b => Number(b.id)));
          const storedMaxId = localStorage.getItem('lastKnownBookingId');
          
          if (storedMaxId && currentMaxId > parseInt(storedMaxId)) {
            const latestBooking = res.data.find(b => Number(b.id) === currentMaxId);
            setNewBooking(latestBooking);
            setShow(true);
          }
          
          setLastBookingId(currentMaxId);
          localStorage.setItem('lastKnownBookingId', currentMaxId.toString());
        } else {
          setLastBookingId(0);
          localStorage.setItem('lastKnownBookingId', '0');
        }
      } catch (error) {
        console.error('Error fetching initial bookings:', error);
      }
    };

    fetchInitialBookings();
  }, []);

  useEffect(() => {
    if (lastBookingId === null) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`bookings/?_t=${new Date().getTime()}`);
        if (res.data && res.data.length > 0) {
          const currentMaxId = Math.max(...res.data.map(b => Number(b.id)));
          if (currentMaxId > lastBookingId) {
            const latestBooking = res.data.find(b => Number(b.id) === currentMaxId);
            setNewBooking(latestBooking);
            setShow(true);
            setLastBookingId(currentMaxId);
            localStorage.setItem('lastKnownBookingId', currentMaxId.toString());
            
            window.dispatchEvent(new Event('newBookingArrived'));
          }
        }
      } catch (error) {
        console.error('Error polling bookings:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastBookingId]);

  if (!show || !newBooking) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999
    }}>
      <div className="bg-white rounded-4 shadow-lg overflow-hidden text-center" style={{ maxWidth: '600px', width: '90%', animation: 'popIn 0.3s ease-out' }}>
        <div className="bg-success text-white py-3 px-4 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold"><i className="bi bi-bell-fill me-2"></i> New Booking Alert!</h4>
          <button onClick={() => setShow(false)} className="btn-close btn-close-white"></button>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
          </div>
          <h2 className="mb-4 fw-bold">A new booking has arrived!</h2>
          
          <div className="card border-success shadow-sm mx-auto text-start bg-light" style={{ maxWidth: '100%' }}>
            <div className="card-body p-4">
              <h5 className="border-bottom pb-3 mb-3 text-success fw-bold">Latest Booking Details (ID: #{newBooking.id})</h5>
              <div className="mb-2 fs-5"><strong>Guest Name:</strong> {newBooking.username}</div>
              <div className="mb-2 fs-5"><strong>Email:</strong> {newBooking.user_email}</div>
              <div className="mb-2 fs-5"><strong>Room:</strong> {newBooking.room_details?.room_number || 'N/A'} - {newBooking.room_details?.category_name}</div>
              <div className="mb-2 fs-5"><strong>Dates:</strong> {newBooking.check_in_date} to {newBooking.check_out_date}</div>
              <div className="fs-5 mt-3 pt-3 border-top text-success fw-bold"><strong>Total Amount:</strong> ₹{newBooking.total_amount}</div>
            </div>
          </div>
          
          <button 
            className="btn btn-success btn-lg mt-5 px-5 rounded-pill fw-bold shadow"
            onClick={() => setShow(false)}
          >
            ACKNOWLEDGE & DISMISS
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NewBookingNotification;
