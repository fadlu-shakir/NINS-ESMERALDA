import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const BookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('bookings/');
      setBookings(res.data);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (id) => {
    try {
      await api.post(`bookings/${id}/approve/`);
      toast.success('Booking approved');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm('Force cancel this booking?')) {
      try {
        await api.post(`bookings/${id}/cancel/`);
        // We can just use the regular cancel endpoint but admin has power
        toast.success('Booking cancelled');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to cancel');
      }
    }
  };

  const approveCancellation = async (id) => {
    try {
      await api.post(`bookings/${id}/approve_cancellation/`);
      toast.success('Cancellation approved');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to approve cancellation');
    }
  };

  const rejectCancellation = async (id) => {
    try {
      await api.post(`bookings/${id}/reject_cancellation/`);
      toast.success('Cancellation rejected');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to reject cancellation');
    }
  };

  // Removed early return to prevent layout shifts

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

  const filteredBookings = activeBookings.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchUsername = (b.username || '').toLowerCase().includes(term);
    const matchPhone = (b.user_phone || '').toLowerCase().includes(term);
    const matchCheckIn = (b.check_in_date || '').includes(term);
    const matchCheckOut = (b.check_out_date || '').includes(term);
    return matchUsername || matchPhone || matchCheckIn || matchCheckOut;
  });

  const pendingCancellations = activeBookings.filter(b => b.status === 'Cancellation Requested');

  return (
    <>
      {pendingCancellations.length > 0 && (
        <div className="alert alert-info shadow-sm border-info d-flex align-items-center mb-4">
          <i className="fas fa-exclamation-triangle fs-4 me-3 text-info"></i>
          <div>
            <strong>Attention Required!</strong> You have {pendingCancellations.length} pending cancellation request(s) awaiting approval.
          </div>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Total Bookings</h5>
              <h2 className="display-6">{bookings.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Confirmed</h5>
              <h2 className="display-6">{bookings.filter(b => b.status === 'Confirmed').length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning mb-3 shadow">
            <div className="card-body">
              <h5 className="card-title">Pending</h5>
              <h2 className="display-6">{bookings.filter(b => b.status === 'Pending').length}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow border-0">
        <div className="card-body">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <h5 className="card-title mb-0">Manage Active Bookings</h5>
            <div className="search-box position-relative" style={{ minWidth: '300px' }}>
              <i className="bi bi-search position-absolute text-muted" style={{ top: '10px', left: '15px' }}></i>
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-light border-0" 
                placeholder="Search active bookings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>User Details</th>
                  <th>Room Details</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary-modern"></div><div className="mt-2 text-muted small">Loading active bookings...</div></td></tr>
                ) : filteredBookings.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No active bookings found matching your search.</td></tr>
                ) : (
                  filteredBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>
                        <div className="fw-bold">{booking.username}</div>
                        <div className="small text-muted">{booking.user_email}</div>
                        <div className="small text-muted">{booking.user_phone || 'No phone'}</div>
                      </td>
                      <td>
                        <strong>Room {booking.room_details?.room_number || 'N/A'}</strong>
                        <div className="small text-muted">{booking.room_details?.category_name}</div>
                      </td>
                      <td>{booking.check_in_date} to {booking.check_out_date}</td>
                      <td>₹{booking.total_amount}</td>
                      <td>
                        <span className={`badge ${booking.status === 'Confirmed' ? 'bg-success' : booking.status === 'Pending' ? 'bg-warning text-dark' : booking.status === 'Cancellation Requested' ? 'bg-info text-dark' : 'bg-danger'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group gap-1">
                          {booking.status === 'Pending' && (
                            <button className="btn btn-sm btn-success" onClick={() => approveBooking(booking.id)}>Approve</button>
                          )}
                          {booking.status === 'Cancellation Requested' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => approveCancellation(booking.id)}>Approve Cancel</button>
                              <button className="btn btn-sm btn-secondary" onClick={() => rejectCancellation(booking.id)}>Reject</button>
                            </>
                          )}
                          {booking.status !== 'Cancelled' && booking.status !== 'Cancellation Requested' && (
                            <button className="btn btn-sm btn-danger" onClick={() => cancelBooking(booking.id)}>Force Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </>
  );
};

export default BookingsManager;
