import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import CustomCalendar from '../components/CustomCalendar';
import BrokerBookingApprovalNotification from '../components/broker/BrokerBookingApprovalNotification';

const RoomCalendar = ({ roomId }) => {
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await api.get(`rooms/list/${roomId}/booked_dates/`);
        setBookedDates(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedDates();
  }, [roomId]);

  if (loading) return <div className="text-center p-3"><div className="spinner-border spinner-border-sm text-primary"></div></div>;

  return (
    <div className="mt-2 w-100">
      <CustomCalendar 
        bookedDates={bookedDates} 
        onDateChange={() => {}} 
      />
    </div>
  );
};

function BrokerDashboard() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingFormData, setBookingFormData] = useState({
    check_in_date: '',
    check_out_date: '',
    adults: 1,
    kids: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedRoomBookedDates, setSelectedRoomBookedDates] = useState([]);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);

  useEffect(() => {
    fetchRooms();
    fetchMyBookings();

    const handleBookingApproved = () => {
      fetchMyBookings();
    };
    window.addEventListener('brokerBookingApproved', handleBookingApproved);
    return () => window.removeEventListener('brokerBookingApproved', handleBookingApproved);
  }, []);

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('bookings/');
      setMyBookings(res.data);
    } catch (error) {
      console.error('Error fetching my bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('rooms/list/');
      setRooms(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingModal = async (room) => {
    setSelectedRoom(room);
    setBookingFormData({
      check_in_date: '',
      check_out_date: '',
      adults: 1,
      kids: 0
    });
    setSelectedRoomBookedDates([]);
    setShowBookingModal(true);

    try {
      const res = await api.get(`rooms/list/${room.id}/booked_dates/`);
      setSelectedRoomBookedDates(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (date) => {
    if (!date) {
        setBookingFormData({ ...bookingFormData, check_in_date: '', check_out_date: '' });
        return;
    }
    
    const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    const dStr = offsetDate.toISOString().split('T')[0];
    
    if (!bookingFormData.check_in_date || (bookingFormData.check_in_date && bookingFormData.check_out_date)) {
        setBookingFormData({ ...bookingFormData, check_in_date: dStr, check_out_date: '' });
    } else if (bookingFormData.check_in_date && !bookingFormData.check_out_date) {
        if (new Date(dStr) > new Date(bookingFormData.check_in_date)) {
            const isConflict = selectedRoomBookedDates.some(booking => {
                return (booking.check_in >= bookingFormData.check_in_date && booking.check_in < dStr) ||
                       (booking.check_out > bookingFormData.check_in_date && booking.check_out <= dStr) ||
                       (booking.check_in <= bookingFormData.check_in_date && booking.check_out >= dStr);
            });
            if (isConflict) {
                toast.error("You cannot book dates that include already reserved days.");
                setBookingFormData({ ...bookingFormData, check_in_date: dStr, check_out_date: '' });
            } else {
                setBookingFormData({ ...bookingFormData, check_out_date: dStr });
            }
        } else {
            setBookingFormData({ ...bookingFormData, check_in_date: dStr, check_out_date: '' });
        }
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingFormData.check_in_date || !bookingFormData.check_out_date) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('bookings/', {
        room: selectedRoom.id,
        ...bookingFormData
      });
      toast.success('Booking request submitted! Awaiting admin approval.');
      setShowBookingModal(false);
      fetchMyBookings();
    } catch (error) {
      toast.error(error.response?.data?.non_field_errors?.[0] || 'Booking request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4 shadow-sm border-bottom sticky-top d-print-none">
        <div className="container py-2">
          <div className="d-flex align-items-center">
            <div className="rounded bg-dark text-white d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
              <i className="bi bi-briefcase-fill fs-5"></i>
            </div>
            <div>
              <span className="navbar-brand fw-bold text-dark m-0 d-block lh-1" style={{ letterSpacing: '2px', fontFamily: 'var(--font-serif)' }}>NINS ESMERALDA</span>
              <small className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>BROKER PORTAL</small>
            </div>
          </div>
          <div className="d-flex align-items-center">
             <div className="d-none d-md-block me-3 text-end border-end pe-3">
               <span className="d-block fw-bold text-dark lh-1 mb-1">Broker Partner</span>
               <small className="text-muted">Verified</small>
             </div>
            <button className="btn btn-dark rounded-pill px-4 shadow-sm" onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4 d-print-none">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <h2 className="mb-1 fw-bold">Availability Matrix</h2>
            <p className="text-muted mb-0">Real-time room availability for broker bookings.</p>
          </div>
          <button className="btn btn-primary" onClick={fetchRooms}>
            <i className="bi bi-arrow-clockwise me-2"></i> Refresh Data
          </button>
        </div>
      
      {loading ? (
        <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
      ) : (
        <div className="row g-4">
          {rooms.map(room => {
            const getImageUrl = (url) => {
              if (!url) return '/resort_img/7.jpeg';
              if (url.startsWith('http')) return url;
              return `http://localhost:8000${url}`;
            };
            const imageUrl = getImageUrl(room.image);

            return (
            <div key={room.id} className="col-12">
              <div className="card shadow-sm border-0 overflow-hidden d-flex flex-column flex-lg-row" style={{ minHeight: '350px' }}>
                
                {/* Left side: Room Image */}
                <div className="d-flex flex-column position-relative" style={{ 
                    flex: '0 0 30%', 
                    background: `url(${imageUrl}) center/cover no-repeat`,
                    minHeight: '250px'
                }}>
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)' }}></div>
                  <div className="p-3 position-relative z-index-1">
                    <span className={`badge ${room.is_available ? 'bg-success' : 'bg-danger'} shadow-sm px-3 py-2 fs-6`}>
                      {room.is_available ? 'Ready for Booking' : 'Currently Unavailable'}
                    </span>
                  </div>
                </div>
                
                {/* Middle: Details */}
                <div className="p-4 d-flex flex-column border-end-lg" style={{ flex: '1 1 auto', borderRight: window.innerWidth > 992 ? '1px solid #dee2e6' : 'none', borderBottom: window.innerWidth <= 992 ? '1px solid #dee2e6' : 'none' }}>
                  <h4 className="fw-bold font-serif-luxury text-dark mb-1">
                    {room.category_name} 
                  </h4>
                  <p className="text-muted mb-4 fs-5">Room #{room.room_number || 'TBA'}</p>
                  
                  <div className="mb-4">
                    <p className="mb-2 text-muted">
                      <i className="bi bi-people-fill text-primary me-2"></i> 
                      Capacity: <span className="text-dark fw-medium">{room.adult_capacity} Adults, {room.child_capacity} Kids</span>
                    </p>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-tag-fill text-primary me-2"></i> 
                      Broker Rate: <span className="text-dark fw-bold fs-5">₹{room.price_per_night}</span> <small>/ night</small>
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-3">
                    <button 
                      className="btn btn-primary w-100 fw-bold"
                      onClick={() => handleOpenBookingModal(room)}
                      disabled={!room.is_available}
                    >
                      <i className="bi bi-calendar-plus me-2"></i> Request Booking
                    </button>
                  </div>
                </div>

                {/* Right side: Calendar Matrix */}
                <div className="bg-light p-4 d-flex flex-column align-items-center justify-content-center" style={{ flex: '0 0 40%' }}>
                  <div className="w-100">
                    <h6 className="fw-bold text-center mb-3 text-secondary text-uppercase" style={{ letterSpacing: '1px' }}>
                      <i className="bi bi-calendar3 me-2"></i> Availability Matrix
                    </h6>
                    <div className="mx-auto" style={{ maxWidth: '400px' }}>
                      <RoomCalendar roomId={room.id} />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )})}
        </div>
      )}

      {/* My Bookings Section */}
      <div className="mt-5 mb-4">
        <h3 className="fw-bold mb-3">My Booking Requests</h3>
        {loadingBookings ? (
          <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
        ) : myBookings.length === 0 ? (
          <div className="alert alert-light border text-center py-4 text-muted">You have no booking requests yet.</div>
        ) : (
          <div className="table-responsive bg-white rounded-3 shadow-sm border-0">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking ID</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myBookings.map(b => (
                  <tr key={b.id} onClick={() => setSelectedInvoiceBooking(b)} style={{ cursor: 'pointer' }} className="hover-shadow-sm transition-all">
                    <td><span className="fw-bold text-muted">#{b.id}</span></td>
                    <td>{b.room_details?.category_name || 'N/A'} {b.room_details?.room_number ? `(#${b.room_details.room_number})` : ''}</td>
                    <td>{b.check_in_date} <i className="bi bi-arrow-right text-muted mx-1"></i> {b.check_out_date}</td>
                    <td>{b.adults} Adults, {b.kids} Kids</td>
                    <td className="fw-bold">₹{b.total_amount}</td>
                    <td>
                      <span className={`badge rounded-pill ${b.status === 'Confirmed' ? 'bg-success' : b.status === 'Pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div> {/* Closes container py-4 d-print-none */}

      {/* Invoice Modal */}
      {selectedInvoiceBooking && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Booking Details & Invoice</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedInvoiceBooking(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="card border-0 bg-light rounded-3 p-4 mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
                    <div>
                      <h4 className="fw-bold mb-1">Invoice #{selectedInvoiceBooking.booking_key || selectedInvoiceBooking.id}</h4>
                      <div className="text-muted small">Date: {new Date(selectedInvoiceBooking.created_at).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className={`badge px-3 py-2 rounded-pill ${selectedInvoiceBooking.status === 'Confirmed' ? 'bg-success' : selectedInvoiceBooking.status === 'Pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {selectedInvoiceBooking.status}
                      </span>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-sm-6">
                      <h6 className="text-muted fw-bold mb-2">Billed To:</h6>
                      <div className="fw-bold fs-5">{selectedInvoiceBooking.username}</div>
                      <div>{selectedInvoiceBooking.user_email}</div>
                      <div>{selectedInvoiceBooking.user_phone}</div>
                    </div>
                    <div className="col-sm-6 text-sm-end mt-4 mt-sm-0">
                      <h6 className="text-muted fw-bold mb-2">Room Details:</h6>
                      <div className="fw-bold fs-5">{selectedInvoiceBooking.room_details?.category_name}</div>
                      <div>Room #{selectedInvoiceBooking.room_details?.room_number || 'TBD'}</div>
                      <div>{selectedInvoiceBooking.adults} Adults, {selectedInvoiceBooking.kids} Kids</div>
                    </div>
                  </div>

                  <div className="table-responsive bg-white rounded shadow-sm border mb-0">
                    <table className="table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Description</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="fw-bold">Accommodation</div>
                            <div className="small text-muted">
                              {selectedInvoiceBooking.check_in_date} to {selectedInvoiceBooking.check_out_date}
                            </div>
                          </td>
                          <td className="text-end align-middle">₹{selectedInvoiceBooking.total_amount}</td>
                        </tr>
                        {selectedInvoiceBooking.payment && (
                          <tr>
                            <td>
                              <div className="fw-bold">Payment Status</div>
                              <div className="small text-muted">Txn: {selectedInvoiceBooking.payment.transaction_id}</div>
                            </td>
                            <td className="text-end align-middle">
                              <span className="badge bg-success">{selectedInvoiceBooking.payment.payment_status}</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="table-light fw-bold">
                        <tr>
                          <td className="text-end text-uppercase">Total</td>
                          <td className="text-end fs-5 text-primary">₹{selectedInvoiceBooking.total_amount}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                
                <div className="text-end">
                  <button className="btn btn-primary px-4 fw-bold rounded-pill" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i> Print Invoice
                  </button>
                </div>
              </div>
            <style>{`
              @media print {
                @page { size: auto; margin: 0; }
                body, html { margin: 0; padding: 0; height: 100%; }
                .print-bg-white { background-color: white !important; min-height: 0 !important; }
                
                .modal {
                  position: static !important;
                  display: block !important;
                  background-color: white !important;
                  padding: 20px !important;
                }
                .modal-dialog {
                  max-width: 100%;
                  margin: 0;
                  transform: none !important;
                }
                .btn, .btn-close {
                  display: none !important;
                }
                .card {
                  box-shadow: none !important;
                  border: none !important;
                }
              }
            `}</style>
          </div>
        </div>
      </div>
      )}

      <BrokerBookingApprovalNotification />

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Request Booking - {selectedRoom.category_name}</h5>
                <button type="button" className="btn-close" onClick={() => setShowBookingModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleBookingSubmit}>
                  <div className="mb-4">
                    <label className="form-label small text-muted fw-bold">Select Dates</label>
                    <CustomCalendar 
                      bookedDates={selectedRoomBookedDates}
                      checkInDate={bookingFormData.check_in_date}
                      checkOutDate={bookingFormData.check_out_date}
                      onDateChange={handleDateChange}
                    />
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <label className="form-label small text-muted fw-bold">Check-in Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={bookingFormData.check_in_date || 'Select from calendar'}
                        readOnly
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted fw-bold">Check-out Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={bookingFormData.check_out_date || 'Select from calendar'}
                        readOnly
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted fw-bold">Adults (Max: {selectedRoom.adult_capacity})</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={bookingFormData.adults}
                        min="1"
                        max={selectedRoom.adult_capacity}
                        onChange={(e) => setBookingFormData({...bookingFormData, adults: parseInt(e.target.value) || 1})}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted fw-bold">Kids (Max: {selectedRoom.child_capacity})</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={bookingFormData.kids}
                        min="0"
                        max={selectedRoom.child_capacity}
                        onChange={(e) => setBookingFormData({...bookingFormData, kids: parseInt(e.target.value) || 0})}
                        required
                      />
                    </div>
                  </div>
                  <div className="alert alert-info py-2 small mb-4 border-0 bg-light text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    This booking request will be placed in a pending state. It must be approved by an administrator before it is confirmed.
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrokerDashboard;
