import { useState, useEffect } from 'react';
import api from '../../services/api';

const BrokerBookingApprovalNotification = () => {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [knownBookings, setKnownBookings] = useState({}); // { id: status }

  useEffect(() => {
    const fetchInitialBookings = async () => {
      try {
        const res = await api.get(`bookings/?_t=${new Date().getTime()}`);
        if (res.data) {
          const initialKnown = {};
          const unacknowledged = [];
          
          res.data.forEach(b => {
            const acknowledged = localStorage.getItem(`broker_ack_${b.id}`);
            if (b.status === 'Confirmed' && !acknowledged) {
              // Pretend it was pending so the interval will trigger the popup
              initialKnown[b.id] = 'Pending';
              unacknowledged.push(b);
            } else {
              initialKnown[b.id] = b.status;
            }
          });
          
          setKnownBookings(initialKnown);
          
          // Optionally trigger immediately without waiting for interval
          if (unacknowledged.length > 0) {
            setNotificationQueue(prevQ => [...prevQ, ...unacknowledged]);
          }
        }
      } catch (error) {
        console.error('Error fetching initial bookings for notifications:', error);
      }
    };

    fetchInitialBookings();
  }, []);

  useEffect(() => {
    // We can poll even if knownBookings is empty, in case they make a booking after load.
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`bookings/?_t=${new Date().getTime()}`);
        if (res.data) {
          const newlyConfirmed = [];
          setKnownBookings(prevKnown => {
             const updatedKnown = { ...prevKnown };
             res.data.forEach(b => {
               // Check if status changed from Pending (or anything else) to Confirmed
               if (prevKnown[b.id] && prevKnown[b.id] !== 'Confirmed' && b.status === 'Confirmed') {
                 newlyConfirmed.push(b);
               }
               updatedKnown[b.id] = b.status;
             });
             
             if (newlyConfirmed.length > 0) {
               setNotificationQueue(prevQ => [...prevQ, ...newlyConfirmed]);
               window.dispatchEvent(new Event('brokerBookingApproved'));
             }
             return updatedKnown;
          });
        }
      } catch (error) {
        console.error('Error polling bookings:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (notificationQueue.length === 0) return null;

  const currentBooking = notificationQueue[0];
  const remainingCount = notificationQueue.length - 1;

  const handleDismiss = () => {
    localStorage.setItem(`broker_ack_${currentBooking.id}`, 'true');
    setNotificationQueue(prev => prev.slice(1));
  };

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
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-calendar-check-fill me-2"></i> 
            Booking Approved! {remainingCount > 0 && `(+${remainingCount} more)`}
          </h4>
          <button onClick={handleDismiss} className="btn-close btn-close-white"></button>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
          </div>
          <h2 className="mb-4 fw-bold">Great news!</h2>
          <p className="fs-5 text-muted mb-4">
            The administrator has confirmed your booking request.
          </p>
          
          <div className="card border-success shadow-sm mx-auto text-start bg-light" style={{ maxWidth: '100%' }}>
            <div className="card-body p-4">
              <h5 className="border-bottom pb-3 mb-3 text-success fw-bold">Booking Details (ID: #{currentBooking.id})</h5>
              <div className="mb-2 fs-5"><strong>Room:</strong> {currentBooking.room_details?.category_name}</div>
              <div className="mb-2 fs-5"><strong>Guests:</strong> {currentBooking.adults} Adults, {currentBooking.kids} Kids</div>
              <div className="mb-2 fs-5"><strong>Dates:</strong> {currentBooking.check_in_date} to {currentBooking.check_out_date}</div>
              <div className="fs-5 mt-3 pt-3 border-top text-success fw-bold"><strong>Total Amount:</strong> ₹{currentBooking.total_amount}</div>
            </div>
          </div>
          
          <button 
            className="btn btn-success btn-lg mt-5 px-5 rounded-pill fw-bold shadow"
            onClick={handleDismiss}
          >
            {remainingCount > 0 ? `NEXT NOTIFICATION (${remainingCount})` : 'AWESOME, THANKS!'}
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

export default BrokerBookingApprovalNotification;
