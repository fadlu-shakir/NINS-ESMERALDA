import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import AdminInvoiceModal from './AdminInvoiceModal';

const BookingHistory = () => {
  const [bookings, setBookings] = useState(() => {
    try {
      const cached = sessionStorage.getItem('admin_cached_bookings');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    const cached = sessionStorage.getItem('admin_cached_bookings');
    return !cached;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState(null);
  const [activeView, setActiveView] = useState('interactions'); // 'interactions' | 'past_stays'

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!sessionStorage.getItem('admin_cached_bookings')) {
      setLoading(true);
    }
    try {
      const res = await api.get('bookings/');
      setBookings(res.data);
      sessionStorage.setItem('admin_cached_bookings', JSON.stringify(res.data));
    } catch (error) {
      toast.error('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (booking) => {
    try {
      await api.post(`bookings/${booking.id}/approve/`);
      toast.success(`Booking #${booking.id} (${booking.booking_key || ''}) approved!`);
      fetchBookings();
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  // Generate list of distinct months available in bookings
  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    monthsSet.add(currentMonthStr);
    bookings.forEach(b => {
      if (b.created_at) {
        const d = new Date(b.created_at);
        if (!isNaN(d.getTime())) {
          monthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      }
      if (b.approved_at) {
        const d = new Date(b.approved_at);
        if (!isNaN(d.getTime())) {
          monthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      }
    });
    return Array.from(monthsSet).sort().reverse();
  }, [bookings, currentMonthStr]);

  const formatMonthName = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // 1. WhatsApp Interactions: all bookings created through website redirecting to WhatsApp
  const whatsappInteractions = useMemo(() => {
    return bookings.filter(b => b.redirected_to_whatsapp !== false);
  }, [bookings]);

  const totalWhatsAppInteractions = whatsappInteractions.length;

  // 2. WhatsApp Interactions for the Selected Month
  const monthInteractions = useMemo(() => {
    return whatsappInteractions.filter(b => {
      if (!b.created_at) return false;
      const d = new Date(b.created_at);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return mStr === selectedMonth;
    });
  }, [whatsappInteractions, selectedMonth]);

  // 3. Approved in Selected Month
  const monthApprovedBookings = useMemo(() => {
    return whatsappInteractions.filter(b => {
      if (b.status !== 'Confirmed') return false;
      const approvalDate = b.approved_at ? new Date(b.approved_at) : (b.created_at ? new Date(b.created_at) : null);
      if (!approvalDate || isNaN(approvalDate.getTime())) return false;
      const mStr = `${approvalDate.getFullYear()}-${String(approvalDate.getMonth() + 1).padStart(2, '0')}`;
      return mStr === selectedMonth;
    });
  }, [whatsappInteractions, selectedMonth]);

  // 4. Past Stays (classic history)
  const historyBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === 'Cancelled') return true;
      if (!b.check_out_date) return false;
      const checkoutDate = new Date(b.check_out_date);
      return checkoutDate < today;
    });
  }, [bookings, today]);

  // Filtered lists based on search term
  const filteredInteractions = useMemo(() => {
    if (!searchTerm) return whatsappInteractions;
    const term = searchTerm.toLowerCase();
    return whatsappInteractions.filter(b => {
      const matchName = (b.guest_name || b.username || '').toLowerCase().includes(term);
      const matchPhone = (b.guest_phone || b.user_phone || '').toLowerCase().includes(term);
      const matchKey = (b.booking_key || '').toLowerCase().includes(term);
      const matchRoom = (b.room_details?.category_name || '').toLowerCase().includes(term);
      const matchId = String(b.id).includes(term);
      return matchName || matchPhone || matchKey || matchRoom || matchId;
    });
  }, [whatsappInteractions, searchTerm]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return historyBookings;
    const term = searchTerm.toLowerCase();
    return historyBookings.filter(b => {
      const matchUsername = (b.username || '').toLowerCase().includes(term);
      const matchPhone = (b.user_phone || '').toLowerCase().includes(term);
      const matchCheckIn = (b.check_in_date || '').includes(term);
      const matchCheckOut = (b.check_out_date || '').includes(term);
      return matchUsername || matchPhone || matchCheckIn || matchCheckOut;
    });
  }, [historyBookings, searchTerm]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="booking-history-wrapper">
      
      {/* ======================================================== */}
      {/* INTERACTIONS SECTION: STATS & MONTHLY APPROVAL METRICS    */}
      {/* ======================================================== */}
      <div className="card shadow-sm border-0 mb-4 rounded-4 overflow-hidden bg-white">
        <div className="card-body p-4 p-md-5">
          
          {/* Header & Month Selector */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 mb-4 border-bottom">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#e6f7ef', color: '#107c41' }}>
                  <i className="fab fa-whatsapp me-1 fs-6"></i> Website Inquiries
                </span>
                <span className="badge bg-light text-muted border rounded-pill px-3 py-2">Analytics</span>
              </div>
              <h3 className="font-serif-luxury fw-bold mb-1 mt-2 text-dark">Website Booking Interactions</h3>
              <p className="text-muted small mb-0">
                Track guest booking inquiries redirected to WhatsApp and monitor monthly approvals.
              </p>
            </div>

            {/* Month Filter Selector */}
            <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-pill border">
              <i className="fas fa-calendar-alt text-muted ms-2"></i>
              <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Month:</span>
              <select 
                className="form-select form-select-sm border-0 bg-transparent fw-bold text-dark pe-4"
                style={{ cursor: 'pointer', minWidth: '160px' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {availableMonths.map(mStr => (
                  <option key={mStr} value={mStr}>
                    {formatMonthName(mStr)} {mStr === currentMonthStr ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3 Analytics Metric Cards */}
          <div className="row g-4">
            
            {/* Card 1: Total WhatsApp Redirect Interactions */}
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 rounded-4 shadow-sm text-white position-relative overflow-hidden" 
                   style={{ background: 'linear-gradient(135deg, #107c41 0%, #25D366 100%)' }}>
                <div className="card-body p-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-uppercase letter-spacing-1 small fw-bold text-white-50">Website Interactions</span>
                    <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                      <i className="fab fa-whatsapp fs-4 text-white"></i>
                    </div>
                  </div>
                  <h2 className="display-5 fw-bold mb-1 text-white">{totalWhatsAppInteractions}</h2>
                  <div className="small text-white text-opacity-90">
                    <i className="fas fa-globe me-1"></i> Total booking interactions via WhatsApp (All-Time)
                  </div>
                </div>
                <i className="fab fa-whatsapp position-absolute end-0 bottom-0 mb-n3 me-n3 text-white opacity-10" style={{ fontSize: '9rem' }}></i>
              </div>
            </div>

            {/* Card 2: Approved in Selected Month */}
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 rounded-4 shadow-sm text-white position-relative overflow-hidden" 
                   style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                <div className="card-body p-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-uppercase letter-spacing-1 small fw-bold text-white-50">Approved Bookings</span>
                    <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                      <i className="fas fa-check-double fs-4 text-white"></i>
                    </div>
                  </div>
                  <h2 className="display-5 fw-bold mb-1 text-white">{monthApprovedBookings.length}</h2>
                  <div className="small text-white text-opacity-90">
                    <i className="fas fa-calendar-check me-1"></i> Approved in <strong>{formatMonthName(selectedMonth)}</strong>
                  </div>
                </div>
                <i className="fas fa-calendar-check position-absolute end-0 bottom-0 mb-n3 me-n3 text-white opacity-10" style={{ fontSize: '9rem' }}></i>
              </div>
            </div>

            {/* Card 3: Monthly Inquiries & Conversion Rate */}
            <div className="col-12 col-md-4">
              <div className="card h-100 border-0 rounded-4 shadow-sm text-white position-relative overflow-hidden" 
                   style={{ background: 'linear-gradient(135deg, #c29d59 0%, #dfba73 100%)' }}>
                <div className="card-body p-4 position-relative" style={{ zIndex: 2 }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="text-uppercase letter-spacing-1 small fw-bold text-white-50">Monthly Inquiries</span>
                    <div className="rounded-circle bg-white bg-opacity-25 p-2 d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                      <i className="fas fa-chart-line fs-4 text-white"></i>
                    </div>
                  </div>
                  <h2 className="display-5 fw-bold mb-1 text-white">{monthInteractions.length}</h2>
                  <div className="small text-white text-opacity-90">
                    <i className="fas fa-percentage me-1"></i> Conversion: <strong>{monthInteractions.length > 0 ? `${Math.round((monthApprovedBookings.length / monthInteractions.length) * 100)}%` : '0%'}</strong> in {formatMonthName(selectedMonth)}
                  </div>
                </div>
                <i className="fas fa-chart-line position-absolute end-0 bottom-0 mb-n3 me-n3 text-white opacity-10" style={{ fontSize: '9rem' }}></i>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DATA TABLES: TOGGLE BETWEEN INTERACTIONS LOG & PAST ARCHIVE */}
      {/* ======================================================== */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
        <div className="card-body p-4">
          
          {/* Sub-Tabs Switcher & Search Bar */}
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4 pb-3 border-bottom">
            
            {/* View Switcher Pills */}
            <div className="d-flex gap-2 p-1 bg-light rounded-pill border" style={{ width: 'fit-content' }}>
              <button 
                type="button"
                className={`btn btn-sm rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 ${
                  activeView === 'interactions' 
                    ? 'btn-dark text-white shadow-sm' 
                    : 'btn-light text-muted border-0'
                }`}
                onClick={() => setActiveView('interactions')}
              >
                <i className="fab fa-whatsapp text-success fs-6"></i>
                <span>WhatsApp Inquiries</span>
                <span className="badge rounded-pill bg-secondary ms-1">{whatsappInteractions.length}</span>
              </button>

              <button 
                type="button"
                className={`btn btn-sm rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 ${
                  activeView === 'past_stays' 
                    ? 'btn-dark text-white shadow-sm' 
                    : 'btn-light text-muted border-0'
                }`}
                onClick={() => setActiveView('past_stays')}
              >
                <i className="fas fa-history text-muted fs-6"></i>
                <span>Past Stays Archive</span>
                <span className="badge rounded-pill bg-secondary ms-1">{historyBookings.length}</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="search-box position-relative" style={{ minWidth: '320px' }}>
              <i className="fas fa-search position-absolute text-muted" style={{ top: '12px', left: '16px' }}></i>
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-light border-0 py-2" 
                placeholder={activeView === 'interactions' ? "Search by guest, phone, ref..." : "Search past bookings..."} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button"
                  className="btn btn-link btn-sm position-absolute end-0 top-0 text-muted mt-1 me-2 text-decoration-none"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          {/* VIEW 1: WHATSAPP INTERACTION INQUIRIES TABLE */}
          {activeView === 'interactions' && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Ref / ID</th>
                    <th>Guest Contact</th>
                    <th>Room Details</th>
                    <th>Guests</th>
                    <th>Interaction Time</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-accent mb-2" role="status"></div>
                        <div className="text-muted small">Loading WhatsApp interactions...</div>
                      </td>
                    </tr>
                  ) : filteredInteractions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <i className="fab fa-whatsapp fs-1 text-muted opacity-50 mb-3 d-block"></i>
                        No WhatsApp booking interactions match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredInteractions.map(booking => {
                      const isApproved = booking.status === 'Confirmed';
                      const isCancelled = booking.status === 'Cancelled';
                      const isPending = booking.status === 'Pending' || booking.status === 'Cancellation Requested';

                      return (
                        <tr key={booking.id}>
                          <td>
                            <div className="fw-bold font-monospace text-dark">
                              {booking.booking_key || `#${booking.id}`}
                            </div>
                            <span className="badge rounded-pill bg-light text-muted border" style={{ fontSize: '0.68rem' }}>
                              ID #{booking.id}
                            </span>
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{booking.guest_name || booking.username || 'Guest'}</div>
                            <div className="small text-muted d-flex align-items-center gap-1">
                              <i className="fas fa-phone-alt text-success" style={{ fontSize: '0.75rem' }}></i>
                              {booking.guest_phone || booking.user_phone ? (
                                <a 
                                  href={`https://wa.me/${(booking.guest_phone || booking.user_phone).replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-decoration-none text-muted hover-accent"
                                >
                                  {booking.guest_phone || booking.user_phone}
                                </a>
                              ) : (
                                <span>No phone</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">
                              {booking.room_details?.category_name || 'Room Stay'}
                            </div>
                            <div className="small text-muted">
                              {booking.room_details?.room_number ? `Room No. ${booking.room_details.room_number}` : 'Unnumbered'}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              <i className="fas fa-users me-1 text-muted"></i>
                              {booking.adults || 1}A {booking.kids > 0 ? `, ${booking.kids}K` : ''}
                            </span>
                          </td>
                          <td>
                            <div className="small fw-semibold text-dark">
                              {formatDateTime(booking.created_at)}
                            </div>
                            {booking.approved_at && (
                              <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                Approved: {formatDateTime(booking.approved_at)}
                              </div>
                            )}
                          </td>
                          <td>
                            {isApproved && (
                              <span className="badge rounded-pill bg-success px-3 py-2">
                                <i className="fas fa-check-circle me-1"></i> Approved
                              </span>
                            )}
                            {isPending && (
                              <span className="badge rounded-pill bg-warning text-dark px-3 py-2">
                                <i className="fas fa-clock me-1"></i> Pending Approval
                              </span>
                            )}
                            {isCancelled && (
                              <span className="badge rounded-pill bg-danger px-3 py-2">
                                <i className="fas fa-times-circle me-1"></i> Cancelled
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-2">
                              {isPending && (
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-success d-inline-flex align-items-center rounded-pill px-3 py-1 fw-bold"
                                  onClick={() => approveBooking(booking)}
                                >
                                  <i className="fas fa-check me-1"></i> Approve
                                </button>
                              )}
                              {isApproved && (
                                <button 
                                  type="button"
                                  className="btn btn-sm btn-outline-dark d-inline-flex align-items-center rounded-pill px-3 py-1 fw-semibold"
                                  onClick={() => setSelectedInvoiceBooking(booking)}
                                >
                                  <i className="fas fa-file-invoice me-1"></i> Invoice
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 2: PAST STAYS ARCHIVE TABLE */}
          {activeView === 'past_stays' && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>User Details</th>
                    <th>Room Details</th>
                    <th>Dates</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-accent mb-2" role="status"></div>
                        <div className="text-muted small">Loading history...</div>
                      </td>
                    </tr>
                  ) : filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No past stays match your search.
                      </td>
                    </tr>
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
                        <td>
                          {booking.check_in_date && booking.check_out_date ? (
                            `${booking.check_in_date} to ${booking.check_out_date}`
                          ) : (
                            <span className="text-muted">Direct Inquiry</span>
                          )}
                        </td>
                        <td>₹{booking.total_amount || 0}</td>
                        <td>
                          <span className={`badge rounded-pill ${booking.status === 'Cancelled' ? 'bg-danger' : 'bg-success'} px-3 py-2`}>
                            {booking.status === 'Cancelled' ? 'Cancelled' : 'Completed / Arrived'}
                          </span>
                        </td>
                        <td className="text-end">
                          {booking.status !== 'Cancelled' && (
                            <button 
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 d-inline-flex align-items-center"
                              onClick={() => setSelectedInvoiceBooking(booking)}
                            >
                              <i className="fas fa-file-invoice me-1"></i> Print Invoice
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Admin Invoice Modal */}
      {selectedInvoiceBooking && (
        <AdminInvoiceModal 
          booking={selectedInvoiceBooking} 
          onClose={() => setSelectedInvoiceBooking(null)} 
        />
      )}
    </div>
  );
};

export default BookingHistory;
