import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getImageUrl } from '../utils/formatImage';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('bookings/');
      setBookings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const triggerCancelModal = (id) => {
    setSelectedBookingId(id);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!selectedBookingId) return;
    try {
      await api.post(`bookings/${selectedBookingId}/cancel/`);
      toast.success('Cancellation requested successfully. Awaiting admin approval.');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
    } finally {
      setShowCancelModal(false);
      setSelectedBookingId(null);
    }
  };

  const withdrawCancellation = async (id) => {
    try {
      await api.post(`bookings/${id}/withdraw_cancellation/`);
      toast.success('Cancellation request withdrawn successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to withdraw cancellation request');
    }
  };

  if (loading) return <div className="text-center my-5 py-5"><div className="spinner-border text-accent"></div></div>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeBookings = bookings.filter(b => {
    if (b.status === 'Cancelled') return false;
    const checkoutDate = new Date(b.check_out_date);
    return checkoutDate >= today;
  });

  const historyBookings = bookings.filter(b => {
    if (b.status === 'Cancelled') return true;
    const checkoutDate = new Date(b.check_out_date);
    return checkoutDate < today;
  });

  const renderTable = (bookingList, isActive) => (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light text-muted small text-uppercase">
          <tr>
            <th>Room</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total</th>
            <th>Status</th>
            {isActive && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {bookingList.map(booking => (
            <tr key={booking.id}>
              <td>
                <div className="d-flex align-items-center">
                  <img src={getImageUrl(booking.room_details?.image) || 'https://via.placeholder.com/50'} alt="Room" className="rounded me-3" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  <div>
                    <h6 className="mb-0">{booking.room_details?.category_name}</h6>
                    <small className="text-muted">Room {booking.room_details?.room_number}</small>
                  </div>
                </div>
              </td>
              <td>{booking.check_in_date}</td>
              <td>{booking.check_out_date}</td>
              <td className="fw-bold text-accent">₹{booking.total_amount}</td>
              <td>
                <span className={`badge ${
                  !isActive && booking.status !== 'Cancelled' ? 'bg-success' :
                  booking.status === 'Confirmed' ? 'bg-success' : 
                  booking.status === 'Pending' ? 'bg-warning text-dark' : 
                  booking.status === 'Cancellation Requested' ? 'bg-info text-dark' : 
                  'bg-danger'
                }`}>
                  {!isActive && booking.status !== 'Cancelled' ? 'Arrived' : booking.status}
                </span>
              </td>
              {isActive && (
                <td>
                  {booking.status === 'Pending' && (
                    <div className="d-flex gap-2">
                      <Link to={`/payment/${booking.id}`} className="btn btn-sm btn-success">Pay Now</Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => triggerCancelModal(booking.id)}>Cancel</button>
                    </div>
                  )}
                  {booking.status === 'Confirmed' && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => triggerCancelModal(booking.id)}>Cancel</button>
                  )}
                  {booking.status === 'Cancellation Requested' && (
                    <div className="d-flex flex-column gap-2 align-items-start">
                      <span className="text-muted small"><i className="fas fa-hourglass-half me-1"></i>Awaiting Approval</span>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => withdrawCancellation(booking.id)}>Cancel Request</button>
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="container py-5" style={{ marginTop: '70px' }}>
      <h2 className="mb-4 border-bottom pb-3">My Dashboard</h2>
      
      <div className="row">
        <div className="col-12 mb-5">
          <h4 className="mb-4">My Active Bookings</h4>
          
          {activeBookings.length === 0 ? (
            <div className="text-center p-5 bg-light rounded shadow-sm border-0">
              <p className="text-muted mb-3">You have no active bookings at the moment.</p>
              <Link to="/#rooms" className="btn btn-primary-modern">Browse Rooms</Link>
            </div>
          ) : (
            renderTable(activeBookings, true)
          )}
        </div>

        {historyBookings.length > 0 && (
          <div className="col-12">
            <h4 className="mb-4">Booking History</h4>
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                {renderTable(historyBookings, false)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Cancellation Modal */}
      {showCancelModal && (
        <>
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1055 }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                <div className="modal-header border-0 bg-light p-4 animate__animated animate__fadeInDown" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                  <h5 className="modal-title fw-bold text-primary"><i className="fas fa-exclamation-triangle text-warning me-2"></i>Cancellation Policy</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowCancelModal(false); setSelectedBookingId(null); }} aria-label="Close"></button>
                </div>
                <div className="modal-body p-4 text-start">
                  <p className="mb-3 text-muted">Are you sure you want to cancel this booking?</p>
                  
                  <div className="p-3 bg-light rounded-3 mb-3 border-start border-warning border-3" style={{ fontSize: '0.95rem' }}>
                    <h6 className="fw-bold text-warning mb-2"><i className="fas fa-info-circle me-1"></i>Refund & Charge Terms:</h6>
                    <ul className="mb-0 ps-3 text-muted">
                      <li className="mb-1">Cancellation <strong>2-3 days before check-in</strong>: Charged <strong>40%</strong> of the total amount.</li>
                      <li>Cancellation on the <strong>day of check-in</strong>: Charged <strong>80%</strong> of the total amount.</li>
                    </ul>
                  </div>

                  <p className="small text-danger mb-0">Note: Cancellation requests must be reviewed and approved by the resort administration.</p>
                </div>
                <div className="modal-footer border-0 p-4 pt-0 d-flex gap-2 justify-content-end">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold text-uppercase" style={{ fontSize: '0.85rem' }} onClick={() => { setShowCancelModal(false); setSelectedBookingId(null); }}>Keep Booking</button>
                  <button type="button" className="btn btn-danger px-4 py-2 rounded-3 fw-bold text-uppercase" style={{ fontSize: '0.85rem' }} onClick={confirmCancellation}>Confirm Cancel</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;
