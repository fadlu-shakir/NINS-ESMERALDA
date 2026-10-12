import { useState } from 'react';
import { createPortal } from 'react-dom';

const AdminInvoiceModal = ({ booking, onClose }) => {
  const [step, setStep] = useState('form'); // 'form' or 'invoice'
  const [formData, setFormData] = useState({
    name: booking?.username && booking.username !== 'guest_whatsapp' ? booking.username : '',
    phone: booking?.user_phone && booking.user_phone !== 'No phone' ? booking.user_phone : '',
    address: ''
  });
  const [validated, setValidated] = useState(false);

  if (!booking) return null;

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn + 'T00:00:00');
    const end = new Date(checkOut + 'T00:00:00');
    const diff = end - start;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 1;
  };

  const handleGenerateInvoice = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setValidated(true);
      return;
    }
    setStep('invoice');
  };

  const handlePrint = () => {
    window.print();
  };

  const nights = calculateNights(booking.check_in_date, booking.check_out_date);
  const formattedTotal = Number(booking.total_amount || 0).toLocaleString('en-IN');
  const invoiceNumber = `INV-${booking.booking_key || booking.id}`;
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const modalContent = (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            max-height: 100% !important;
            overflow: hidden !important;
            background: #ffffff !important;
            color: #111827 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Completely isolate print content: eliminate #root and all background elements */
          #root, 
          .modal-backdrop, 
          .navbar, 
          nav, 
          footer, 
          .watermark-overlay, 
          .d-print-none {
            display: none !important;
          }

          /* Reset portal modal container */
          #admin-invoice-modal-portal {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
          }

          #admin-invoice-modal-portal .modal-dialog {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
          }

          #admin-invoice-modal-portal .modal-content {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          #admin-invoice-print-area {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111827 !important;
            font-size: 11px !important;
            line-height: 1.35 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          #admin-invoice-print-area * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          #admin-invoice-print-area table {
            width: 100% !important;
            margin-bottom: 10px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          #admin-invoice-print-area th,
          #admin-invoice-print-area td {
            padding: 5px 8px !important;
            font-size: 11px !important;
          }

          #admin-invoice-print-area .badge {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div
        id="admin-invoice-modal-portal"
        className="modal fade show d-block"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1055 }}
        tabIndex="-1"
        role="dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={`modal-dialog modal-dialog-centered ${step === 'invoice' ? 'modal-lg' : 'modal-md'}`}
          role="document"
        >
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            
            {/* STEP 1: INPUT FORM */}
            {step === 'form' && (
              <div>
                <div className="modal-header border-bottom bg-light p-4">
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }}>
                      <i className="fas fa-file-invoice fs-6"></i>
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold mb-0">Generate Customer Invoice</h5>
                      <small className="text-muted font-monospace">Ref: {booking.booking_key || `#${booking.id}`}</small>
                    </div>
                  </div>
                  <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                </div>

                <form onSubmit={handleGenerateInvoice}>
                  <div className="modal-body p-4">
                    <div className="alert alert-light border small text-muted mb-4 d-flex align-items-center gap-2">
                      <i className="fas fa-info-circle text-primary fs-5"></i>
                      <span>Enter the guest details to display on the invoice. These can be downloaded or printed for the customer.</span>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small text-uppercase letter-spacing-1 text-muted">
                        Customer Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control rounded-3 py-2 px-3 ${validated && !formData.name.trim() ? 'is-invalid' : ''}`}
                        placeholder="e.g. Rahul Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoFocus
                      />
                      {validated && !formData.name.trim() && (
                        <div className="invalid-feedback">Please enter the customer name.</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small text-uppercase letter-spacing-1 text-muted">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control rounded-3 py-2 px-3 ${validated && !formData.phone.trim() ? 'is-invalid' : ''}`}
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                      {validated && !formData.phone.trim() && (
                        <div className="invalid-feedback">Please enter a contact phone number.</div>
                      )}
                    </div>

                    <div className="mb-2">
                      <label className="form-label fw-bold small text-uppercase letter-spacing-1 text-muted">
                        Address <span className="text-muted fw-normal">(Optional)</span>
                      </label>
                      <textarea
                        className="form-control rounded-3 py-2 px-3"
                        rows="2"
                        placeholder="e.g. Wayanad Road, Calicut, Kerala - 673571"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="modal-footer border-top bg-light p-3 d-flex justify-content-between">
                    <button type="button" className="btn btn-outline-secondary px-4 rounded-pill" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2">
                      <span>View & Print Invoice</span>
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: INVOICE PREVIEW & PRINT */}
            {step === 'invoice' && (
              <div>
                <div className="modal-header border-bottom bg-light p-3 d-print-none">
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary rounded-pill me-2"
                      onClick={() => setStep('form')}
                    >
                      <i className="fas fa-arrow-left me-1"></i> Edit Details
                    </button>
                    <span className="fw-bold text-dark">Invoice Preview</span>
                  </div>
                  <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                </div>

                <div className="modal-body p-4 p-md-4" id="admin-invoice-print-area" style={{ backgroundColor: '#ffffff' }}>
                  
                  {/* Resort Header & Invoice Header */}
                  <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
                    <div>
                      <h3 className="fw-bold mb-1 font-serif-luxury" style={{ color: '#111827', letterSpacing: '1px' }}>
                        Esmeralda
                      </h3>
                      <p className="text-uppercase small fw-bold text-muted letter-spacing-2 mb-1" style={{ fontSize: '0.75rem' }}>Boutique Resort</p>
                      <div className="small text-muted" style={{ lineHeight: '1.35', fontSize: '0.8rem' }}>
                        <div>Thusharagiri, Kozhikode, Kerala 673580</div>
                        <div>Phone: +91 85901 30953</div>
                        <div>Email: ninsesmeralda@gmail.com</div>
                      </div>
                    </div>
                    <div className="text-end">
                      <h4 className="fw-bold text-uppercase letter-spacing-2 text-dark mb-1">Invoice</h4>
                      <div className="badge bg-light text-dark border font-monospace px-2 py-1 fs-6 mb-1">
                        {invoiceNumber}
                      </div>
                      <div className="small text-muted" style={{ fontSize: '0.8rem', lineHeight: '1.35' }}>
                        <div>Date Issued: <strong className="text-dark">{todayFormatted}</strong></div>
                        <div>Booking Ref: <strong className="text-dark font-monospace">{booking.booking_key || `#${booking.id}`}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Billed To & Stay Details */}
                  <div className="row g-3 mb-3 pb-3 border-bottom">
                    <div className="col-6">
                      <h6 className="text-uppercase small fw-bold letter-spacing-1 text-muted mb-1" style={{ fontSize: '0.75rem' }}>Billed To</h6>
                      <h5 className="fw-bold text-dark mb-1 fs-6">{formData.name}</h5>
                      <div className="text-muted small mb-1" style={{ fontSize: '0.8rem' }}>
                        <i className="fas fa-phone me-1 text-muted"></i>{formData.phone}
                      </div>
                      {formData.address ? (
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          <i className="fas fa-map-marker-alt me-1 text-muted"></i>{formData.address}
                        </div>
                      ) : (
                        <div className="text-muted small fst-italic" style={{ fontSize: '0.8rem' }}>Address: Not specified</div>
                      )}
                    </div>
                    <div className="col-6 text-end">
                      <h6 className="text-uppercase small fw-bold letter-spacing-1 text-muted mb-1" style={{ fontSize: '0.75rem' }}>Stay Details</h6>
                      <div className="mb-1">
                        <strong className="text-dark fs-6">{booking.room_details?.category_name}</strong>
                        {booking.room_details?.room_number && (
                          <span className="badge bg-dark text-white ms-2" style={{ fontSize: '0.75rem' }}>Room {booking.room_details.room_number}</span>
                        )}
                      </div>
                      <div className="small text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                        <span>Check-in: <strong className="text-dark">{booking.check_in_date}</strong></span>
                        <span className="mx-2">|</span>
                        <span>Check-out: <strong className="text-dark">{booking.check_out_date}</strong></span>
                      </div>
                      <div className="small text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                        <span>{nights} Night{nights > 1 ? 's' : ''}</span>
                        <span className="mx-2">•</span>
                        <span>{booking.adults} Adults{booking.kids > 0 ? `, ${booking.kids} Kids` : ''}</span>
                      </div>
                      <div>
                        <span className="badge bg-success px-2 py-1 text-uppercase fw-bold letter-spacing-1" style={{ fontSize: '0.75rem' }}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Charges Table */}
                  <div className="table-responsive mb-3">
                    <table className="table table-bordered mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th className="py-2 px-3 text-uppercase small fw-bold text-muted" style={{ fontSize: '0.75rem' }}>Item / Description</th>
                          <th className="py-2 px-3 text-center text-uppercase small fw-bold text-muted" style={{ width: '110px', fontSize: '0.75rem' }}>Duration</th>
                          <th className="py-2 px-3 text-end text-uppercase small fw-bold text-muted" style={{ width: '150px', fontSize: '0.75rem' }}>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 px-3">
                            <div className="fw-bold text-dark">{booking.room_details?.category_name || 'Resort Stay'}</div>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Stay from {booking.check_in_date} to {booking.check_out_date} for {booking.adults} adult(s)
                            </small>
                          </td>
                          <td className="p-2 px-3 text-center fw-semibold">
                            {nights} Night{nights > 1 ? 's' : ''}
                          </td>
                          <td className="p-2 px-3 text-end fw-bold text-dark">
                            ₹{formattedTotal}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="table-light">
                          <td colSpan="2" className="text-end py-2 px-3 fw-bold text-uppercase small letter-spacing-1" style={{ fontSize: '0.75rem' }}>
                            Grand Total (INR)
                          </td>
                          <td className="text-end py-2 px-3 fw-bold fs-6 text-dark">
                            ₹{formattedTotal}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Payment Note & Signatures */}
                  <div className="row mt-3 pt-3 border-top">
                    <div className="col-7">
                      <h6 className="fw-bold small text-dark mb-1" style={{ fontSize: '0.8rem' }}>Reservation Policy & Notes</h6>
                      <p className="text-muted small mb-0" style={{ fontSize: '0.75rem', lineHeight: '1.35' }}>
                        This is an official confirmation invoice issued by Nins Esmeralda Boutique Resort, Thusharagiri. 
                        Check-in time is 2:00 PM and check-out is 11:00 AM.
                      </p>
                    </div>
                    <div className="col-5 text-end">
                      <div className="small text-muted mb-3" style={{ fontSize: '0.75rem' }}>Authorized Signature</div>
                      <div className="fw-bold text-dark font-serif-luxury" style={{ letterSpacing: '1px', fontSize: '0.95rem' }}>Esmeralda Retreat</div>
                      <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>Management & Guest Relations</small>
                    </div>
                  </div>

                  <div className="text-center mt-3 pt-2 border-top text-muted small" style={{ fontSize: '0.72rem' }}>
                    Thank you for choosing Esmeralda Boutique Resort. We look forward to hosting you!
                  </div>

                </div>

                <div className="modal-footer border-top bg-light p-3 d-flex justify-content-between d-print-none">
                  <button type="button" className="btn btn-outline-secondary px-4 rounded-pill" onClick={onClose}>
                    Close
                  </button>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary px-3 rounded-pill fw-semibold"
                      onClick={() => setStep('form')}
                    >
                      <i className="fas fa-edit me-1"></i> Edit Details
                    </button>
                    <button
                      type="button"
                      className="btn btn-success px-4 rounded-pill fw-bold shadow-sm d-flex align-items-center gap-2"
                      onClick={handlePrint}
                    >
                      <i className="fas fa-print"></i>
                      <span>Print / Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
};

export default AdminInvoiceModal;
