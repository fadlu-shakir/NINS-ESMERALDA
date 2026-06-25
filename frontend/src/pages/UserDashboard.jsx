import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getImageUrl } from '../utils/formatImage';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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

  const openInvoice = (booking) => {
    setSelectedInvoice(booking);
    setShowInvoiceModal(true);
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

  const renderCards = (bookingList, isActive) => (
    <div className="row g-4">
      {bookingList.map(booking => (
        <div className="col-md-6 col-lg-4" key={booking.id}>
          <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative hover-lift transition-all" style={{ transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div className="position-relative">
              <img 
                src={getImageUrl(booking.room_details?.image) || 'https://via.placeholder.com/400x250'} 
                alt="Room" 
                className="card-img-top" 
                style={{ height: '220px', objectFit: 'cover' }} 
              />
              <div className="position-absolute top-0 end-0 m-3">
                <span className={`badge ${
                  !isActive && booking.status !== 'Cancelled' ? 'bg-success' :
                  booking.status === 'Confirmed' ? 'bg-success' : 
                  booking.status === 'Pending' ? 'bg-warning text-dark' : 
                  booking.status === 'Cancellation Requested' ? 'bg-info text-dark' : 
                  'bg-danger'
                } px-3 py-2 rounded-pill shadow-sm letter-spacing-1 fw-bold`} style={{ fontSize: '0.75rem' }}>
                  {!isActive && booking.status !== 'Cancelled' ? 'COMPLETED' : booking.status.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="card-body p-4 d-flex flex-column">
              <h5 className="fw-bold mb-1 text-dark">{booking.room_details?.category_name}</h5>
              <p className="text-muted small mb-3">Room {booking.room_details?.room_number}</p>
              
              <div className="d-flex justify-content-between mb-4 p-3 bg-light rounded-3 border">
                <div>
                  <small className="text-muted d-block text-uppercase letter-spacing-1" style={{ fontSize: '0.7rem' }}>Check In</small>
                  <span className="fw-bold text-dark">{booking.check_in_date}</span>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block text-uppercase letter-spacing-1" style={{ fontSize: '0.7rem' }}>Check Out</small>
                  <span className="fw-bold text-dark">{booking.check_out_date}</span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4 mt-auto border-bottom pb-3">
                <span className="text-muted fw-medium text-uppercase letter-spacing-1" style={{ fontSize: '0.8rem' }}>Total Amount</span>
                <span className="fw-bold text-accent fs-5">₹{booking.total_amount}</span>
              </div>
              
              {isActive ? (
                <div className="d-flex gap-2 flex-wrap">
                  {booking.status === 'Pending' && (
                    <>
                      <Link to={`/payment/${booking.id}`} className="btn btn-success flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '0.8rem' }}>Pay Now</Link>
                      <button className="btn btn-outline-danger flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '0.8rem' }} onClick={() => triggerCancelModal(booking.id)}>Cancel</button>
                    </>
                  )}
                  {booking.status === 'Confirmed' && (
                    <>
                      <button className="btn btn-primary-modern flex-grow-1 text-uppercase" style={{ fontSize: '0.8rem' }} onClick={() => openInvoice(booking)}>
                        <i className="fas fa-file-invoice me-2"></i>Invoice
                      </button>
                      <button className="btn btn-outline-danger flex-grow-1 fw-bold text-uppercase" style={{ fontSize: '0.8rem' }} onClick={() => triggerCancelModal(booking.id)}>Cancel</button>
                    </>
                  )}
                  {booking.status === 'Cancellation Requested' && (
                    <div className="w-100 text-center">
                      <p className="text-muted small mb-2"><i className="fas fa-hourglass-half me-1"></i>Awaiting Admin Approval</p>
                      <button className="btn btn-outline-secondary w-100 fw-bold text-uppercase" style={{ fontSize: '0.8rem' }} onClick={() => withdrawCancellation(booking.id)}>
                        <i className="fas fa-undo me-2"></i>Withdraw Request
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary w-100 fw-bold text-uppercase" style={{ fontSize: '0.8rem' }} onClick={() => openInvoice(booking)}>
                    <i className="fas fa-file-invoice me-2"></i>View Receipt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <style>
        {`
          @media print {
            body {
              background-color: white !important;
            }
            /* Hide everything that is not the invoice */
            .d-print-none, nav, footer, .navbar {
              display: none !important;
            }
            .modal-backdrop {
              display: none !important;
            }
            /* Make sure the modal doesn't have a background overlay on print */
            .modal {
              background: transparent !important;
              position: absolute !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .modal-dialog {
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              transform: none !important;
            }
            .modal-content {
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
            }
            #invoice-print-area {
              padding: 0 !important;
            }
            /* Collapse body height */
            html, body {
              height: auto !important;
              min-height: auto !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
      
      <div className="container py-5 d-print-none" style={{ marginTop: '70px' }}>
        <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
          <div>
            <h6 className="text-accent text-uppercase fw-bold letter-spacing-2 mb-1" style={{ fontSize: '0.75rem' }}>Welcome Back</h6>
            <h2 className="mb-0 fw-bold font-serif-luxury text-dark">My Dashboard</h2>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12 mb-5">
            <h4 className="mb-4 text-dark fw-bold"><i className="fas fa-calendar-check text-accent me-2"></i>Active Bookings</h4>
            
            {activeBookings.length === 0 ? (
              <div className="text-center p-5 bg-white rounded-5 shadow-sm border" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                  <i className="fas fa-suitcase-rolling text-muted fs-1"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">No Active Bookings</h5>
                <p className="text-muted mb-4">You don't have any upcoming stays with us at the moment.</p>
                <Link to="/#rooms" className="btn btn-primary-modern px-5 rounded-pill">Browse Rooms</Link>
              </div>
            ) : (
              renderCards(activeBookings, true)
            )}
          </div>

          {historyBookings.length > 0 && (
            <div className="col-12 mt-4">
              <h4 className="mb-4 text-dark fw-bold"><i className="fas fa-history text-accent me-2"></i>Past Stays</h4>
              {renderCards(historyBookings, false)}
            </div>
          )}
        </div>
      </div>

      {/* Premium Cancellation Modal */}
      {showCancelModal && (
        <>
          <div className="modal fade show d-print-none" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1055 }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                <div className="modal-header border-0 bg-light p-4 animate__animated animate__fadeInDown" style={{ borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                  <h5 className="modal-title fw-bold text-dark"><i className="fas fa-exclamation-triangle text-warning me-2"></i>Cancellation Policy</h5>
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

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <>
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1055 }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px' }}>
                <div className="modal-header border-bottom bg-light p-4 d-print-none">
                  <h5 className="modal-title fw-bold text-dark"><i className="fas fa-file-invoice text-accent me-2"></i>Booking Invoice</h5>
                  <button type="button" className="btn-close" onClick={() => setShowInvoiceModal(false)} aria-label="Close"></button>
                </div>
                
                <div className="modal-body p-4 p-md-5" id="invoice-print-area" style={{ backgroundColor: '#fff' }}>
                  <div className="d-flex justify-content-between align-items-center mb-5 pb-4 border-bottom border-light">
                    <div>
                      <h2 className="fw-bold text-accent mb-0 font-serif-luxury">Esmeralda</h2>
                      <p className="text-muted mb-0 small text-uppercase letter-spacing-1">Boutique Resort</p>
                    </div>
                    <div className="text-end">
                      <h4 className="fw-bold text-dark mb-1 letter-spacing-1">INVOICE</h4>
                      <p className="text-muted mb-0 small">Booking ID: <span className="text-dark fw-bold">#{selectedInvoice.id}</span></p>
                      <p className="text-muted mb-0 small">Date Issued: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="row mb-5">
                    <div className="col-sm-6 mb-4 mb-sm-0">
                      <h6 className="fw-bold text-dark mb-3 text-uppercase letter-spacing-1" style={{ fontSize: '0.8rem' }}>Billed To:</h6>
                      {/* Using logged-in username or guest_name */}
                      <p className="mb-1 text-dark fw-bold">{user?.username || selectedInvoice.guest_name || 'Valued Guest'}</p>
                      {selectedInvoice.guest_phone && <p className="text-muted mb-1 small"><i className="fas fa-phone me-2 text-accent"></i>{selectedInvoice.guest_phone}</p>}
                      <p className="text-muted mb-0 small"><i className="fas fa-map-marker-alt me-2 text-accent"></i>Thusharagiri, Kerala</p>
                    </div>
                    <div className="col-sm-6 text-sm-end">
                      <h6 className="fw-bold text-dark mb-3 text-uppercase letter-spacing-1" style={{ fontSize: '0.8rem' }}>Stay Details:</h6>
                      <p className="mb-1 small">Check-in: <span className="text-dark fw-bold">{selectedInvoice.check_in_date}</span></p>
                      <p className="mb-1 small">Check-out: <span className="text-dark fw-bold">{selectedInvoice.check_out_date}</span></p>
                      <p className="mb-0 small">Status: <span className="text-success fw-bold text-uppercase">{selectedInvoice.status}</span></p>
                    </div>
                  </div>

                  <div className="table-responsive mb-5 rounded border border-light">
                    <table className="table table-borderless mb-0">
                      <thead className="bg-light border-bottom border-light">
                        <tr>
                          <th className="text-uppercase small fw-bold text-muted py-3 px-4">Description</th>
                          <th className="text-uppercase small fw-bold text-muted text-end py-3 px-4">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-4 px-4">
                            <p className="fw-bold text-dark mb-1">{selectedInvoice.room_details?.category_name}</p>
                            <p className="text-muted small mb-0">Room Number: {selectedInvoice.room_details?.room_number}</p>
                          </td>
                          <td className="text-end align-middle fw-bold text-dark py-4 px-4 fs-6">₹{selectedInvoice.total_amount}</td>
                        </tr>
                      </tbody>
                      <tfoot className="border-top border-light bg-light">
                        <tr>
                          <td className="text-end fw-bold text-dark py-4 px-4 text-uppercase letter-spacing-1">Total Paid</td>
                          <td className="text-end fw-bold text-accent fs-4 py-4 px-4">₹{selectedInvoice.total_amount}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="text-center mt-5 pt-4 border-top border-light">
                    <i className="fas fa-leaf text-accent fs-4 mb-3 opacity-50"></i>
                    <p className="text-muted small font-serif-luxury fst-italic mb-0" style={{ fontSize: '1rem' }}>"Thank you for choosing Esmeralda. We wish you a peaceful stay."</p>
                  </div>
                </div>
                
                <div className="modal-footer border-top bg-light p-4 d-flex justify-content-end d-print-none" style={{ borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px' }}>
                  <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.8rem' }} onClick={() => setShowInvoiceModal(false)}>Close</button>
                  <button type="button" className="btn btn-primary-modern px-5 py-2 rounded-pill text-uppercase" style={{ fontSize: '0.8rem' }} onClick={() => window.print()}><i className="fas fa-print me-2"></i>Print Invoice</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show d-print-none" style={{ zIndex: 1050 }}></div>
        </>
      )}
    </>
  );
};

export default UserDashboard;
