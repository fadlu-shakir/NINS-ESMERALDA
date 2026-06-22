import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const BookingHistory = () => {
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
      toast.error('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  // Removed early return to prevent layout shifts

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const historyBookings = bookings.filter(b => {
    if (b.status === 'Cancelled') return true;
    const checkoutDate = new Date(b.check_out_date);
    return checkoutDate < today;
  });

  const filteredHistory = historyBookings.filter(b => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchUsername = (b.username || '').toLowerCase().includes(term);
    const matchPhone = (b.user_phone || '').toLowerCase().includes(term);
    const matchCheckIn = (b.check_in_date || '').includes(term);
    const matchCheckOut = (b.check_out_date || '').includes(term);
    
    return matchUsername || matchPhone || matchCheckIn || matchCheckOut;
  });

  return (
    <div className="card shadow border-0">
      <div className="card-body">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h5 className="card-title mb-0">Booking History</h5>
          <div className="search-box position-relative" style={{ minWidth: '300px' }}>
            <i className="bi bi-search position-absolute text-muted" style={{ top: '10px', left: '15px' }}></i>
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-light border-0" 
              placeholder="Search by name, phone, or date..." 
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary-modern"></div><div className="mt-2 text-muted small">Loading history...</div></td></tr>
              ) : filteredHistory.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No booking history matches your search.</td></tr>
              ) : (
                filteredHistory.map(booking => (
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
                      <span className={`badge ${booking.status === 'Cancelled' ? 'bg-danger' : 'bg-success'}`}>
                        {booking.status === 'Cancelled' ? 'Cancelled' : 'Arrived'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
