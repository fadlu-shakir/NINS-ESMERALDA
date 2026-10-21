import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getImageUrl } from '../utils/formatImage';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [formData, setFormData] = useState({
    adults: 1,
    kids: 0,
    guest_name: '',
    guest_phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [redirectingToWhatsApp, setRedirectingToWhatsApp] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username;
        if (name) {
          setFormData(prev => ({
            ...prev,
            guest_name: prev.guest_name || name,
            guest_phone: prev.guest_phone || u.phone_number || ''
          }));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await api.get(`rooms/list/${id}/`);
        setRoom(roomRes.data);
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const hasPrice = room?.price_per_night !== null && room?.price_per_night !== undefined && Number(room?.price_per_night) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guest_name.trim() || !formData.guest_phone.trim()) {
      toast.error("Please enter your name and contact phone number.");
      return;
    }

    setProcessing(true);
    try {
      // 1. Create Booking inquiry in database
      const res = await api.post('bookings/', {
        room: id,
        guest_name: formData.guest_name.trim(),
        guest_phone: formData.guest_phone.trim(),
        adults: formData.adults,
        kids: formData.kids
      });
      const newBooking = res.data;
      const bookingRef = newBooking.booking_key || `#${newBooking.id}`;

      // 2. Prepare pre-filled WhatsApp message
      const message = `🌿 *Esmeralda Boutique Resort Stay Reservation* 🌿\n\n` +
        `Hello, I would like to book a stay with the following details:\n\n` +
        `📌 *Booking Ref:* ${bookingRef}\n` +
        `👤 *Guest Name:* ${formData.guest_name.trim()}\n` +
        `📞 *Contact Phone:* ${formData.guest_phone.trim()}\n` +
        `🏨 *Room:* ${room.category_name}${room.room_number ? ` (Room ${room.room_number})` : ''}\n` +
        `👥 *Guests:* ${formData.adults} Adult${formData.adults > 1 ? 's' : ''}${formData.kids > 0 ? `, ${formData.kids} Child${formData.kids > 1 ? 'ren' : ''}` : ''}\n` +
        (hasPrice ? `💰 *Room Rate:* ₹${Number(room.price_per_night).toLocaleString('en-IN')} / night\n\n` : '\n') +
        `Please confirm room availability and assist me with booking. Thank you!`;

      const phone = "918138011207";
      const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      setBookingDetails({
        ref: bookingRef,
        guestName: formData.guest_name.trim(),
        guestPhone: formData.guest_phone.trim(),
        adults: formData.adults,
        kids: formData.kids
      });
      setWhatsappLink(targetUrl);
      setRedirectingToWhatsApp(true);

      // 3. Open WhatsApp
      setTimeout(() => {
        window.open(targetUrl, '_blank') || (window.location.href = targetUrl);
      }, 1200);

    } catch (error) {
      console.error("Booking creation error, using direct WhatsApp fallback:", error);
      const fallbackRef = `ESM-${Math.floor(100000 + Math.random() * 900000)}`;
      const message = `🌿 *Esmeralda Boutique Resort Stay Reservation* 🌿\n\n` +
        `Hello, I would like to book a stay with the following details:\n\n` +
        `📌 *Inquiry Ref:* ${fallbackRef}\n` +
        `👤 *Guest Name:* ${formData.guest_name.trim()}\n` +
        `📞 *Contact Phone:* ${formData.guest_phone.trim()}\n` +
        `🏨 *Room:* ${room.category_name}${room.room_number ? ` (Room ${room.room_number})` : ''}\n` +
        `👥 *Guests:* ${formData.adults} Adult${formData.adults > 1 ? 's' : ''}${formData.kids > 0 ? `, ${formData.kids} Child${formData.kids > 1 ? 'ren' : ''}` : ''}\n` +
        (hasPrice ? `💰 *Room Rate:* ₹${Number(room.price_per_night).toLocaleString('en-IN')} / night\n\n` : '\n') +
        `Please confirm room availability and assist me with booking. Thank you!`;

      const phone = "918138011207";
      const targetUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      setBookingDetails({
        ref: fallbackRef,
        guestName: formData.guest_name.trim(),
        guestPhone: formData.guest_phone.trim(),
        adults: formData.adults,
        kids: formData.kids
      });
      setWhatsappLink(targetUrl);
      setRedirectingToWhatsApp(true);

      setTimeout(() => {
        window.open(targetUrl, '_blank') || (window.location.href = targetUrl);
      }, 1200);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !room) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-accent" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 bg-light" style={{ marginTop: '70px', minHeight: '100vh' }}>
      
      {/* WhatsApp Redirect / Confirmation Overlay */}
      {redirectingToWhatsApp && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white px-3" style={{ zIndex: 9999 }}>
          <div className="mb-4 animate__animated animate__bounceIn" style={{ color: '#25D366' }}>
            <i className="fab fa-whatsapp" style={{ fontSize: '5.5rem' }}></i>
          </div>
          <h2 className="fw-bold font-serif-luxury animate__animated animate__fadeInUp mb-2 text-center">Reservation Request Ready!</h2>
          <div className="badge bg-light text-dark border font-monospace px-3 py-2 fs-6 mb-3 animate__animated animate__fadeInUp">
            Ref: {bookingDetails?.ref}
          </div>
          <p className="text-muted text-center mb-4 animate__animated animate__fadeInUp" style={{ maxWidth: '480px' }}>
            Your reservation details for <strong>{room.category_name}</strong> have been prepared. Opening WhatsApp to connect with our resort desk...
          </p>
          
          <div className="d-flex flex-column align-items-center gap-3 animate__animated animate__fadeInUp">
            <a 
              href={whatsappLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn text-white px-4 py-3 rounded-pill fw-bold shadow d-inline-flex align-items-center"
              style={{ backgroundColor: '#25D366', fontSize: '1.05rem', boxShadow: '0 8px 25px rgba(37, 211, 102, 0.35)' }}
            >
              <i className="fab fa-whatsapp me-2 fs-4"></i> Continue to WhatsApp
            </a>
            <button 
              type="button" 
              onClick={() => navigate('/#rooms')} 
              className="btn btn-link text-muted text-decoration-none small"
            >
              Back to Resort Stays
            </button>
          </div>
        </div>
      )}

      <div className="row g-0 h-100">
        
        {/* LEFT PANEL - Room Summary */}
        <div className="col-lg-5 col-xl-4 bg-white d-none d-lg-flex flex-column border-end position-relative" style={{ height: 'calc(100vh - 70px)', position: 'sticky', top: '70px' }}>
          
          <button onClick={() => navigate(-1)} className="btn btn-link text-dark position-absolute top-0 start-0 m-4 text-decoration-none d-inline-flex align-items-center hover-accent fw-semibold text-uppercase small letter-spacing-1" style={{ zIndex: 10 }}>
            <i className="fas fa-arrow-left me-2"></i> Back
          </button>
          
          <div className="flex-grow-1 overflow-hidden position-relative">
             <img src={getImageUrl(room.image) || '/resort_img/8.jpeg'} alt="Room" className="w-100 h-100 object-fit-cover" style={{ filter: 'brightness(0.85)' }} />
             <div className="position-absolute bottom-0 start-0 w-100 p-5 bg-gradient-dark text-white">
                <span className="badge bg-accent text-white mb-3 text-uppercase letter-spacing-1">Premium Stay</span>
                <h2 className="font-serif-luxury fw-bold display-6 mb-2 text-white">{room.category_name}</h2>
                <p className="opacity-75 mb-0"><i className="fas fa-map-marker-alt me-2"></i>Esmeralda Retreat</p>
             </div>
          </div>
          
          <div className="p-5 bg-white">
            <h5 className="text-uppercase letter-spacing-1 small text-muted fw-bold mb-4">Stay Overview</h5>
            {hasPrice && (
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                 <span className="text-muted">Rate per night</span>
                 <span className="fw-bold fs-5 text-accent">₹{Number(room.price_per_night).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
               <span className="text-muted">Check-in</span>
               <span className="fw-semibold">From {room.check_in_time}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
               <span className="text-muted">Check-out</span>
               <span className="fw-semibold">Until {room.check_out_time}</span>
            </div>
            <div className="mt-4 p-3 rounded-3 bg-light text-muted small d-flex align-items-center">
               <i className="fab fa-whatsapp text-success fs-3 me-3"></i>
               <span>Direct booking inquiry & assistance via WhatsApp on +91 81380 11207</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Booking Form */}
        <div className="col-lg-7 col-xl-8 overflow-auto" style={{ height: 'calc(100vh - 70px)' }}>
          <div className="container py-5 px-4 px-md-5 mx-auto" style={{ maxWidth: '720px' }}>
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="d-lg-none mb-4 pb-4 border-bottom">
              <button onClick={() => navigate(-1)} className="btn btn-link text-dark p-0 mb-4 text-decoration-none d-inline-flex align-items-center hover-accent fw-semibold text-uppercase small letter-spacing-1">
                <i className="fas fa-arrow-left me-2"></i> Back
              </button>
              <h2 className="font-serif-luxury fw-bold mb-1">{room.category_name}</h2>
              {hasPrice && (
                <p className="text-accent fw-bold mb-0">₹{Number(room.price_per_night).toLocaleString('en-IN')} / night</p>
              )}
            </div>

            <div className="mb-4">
              <span className="text-accent text-uppercase fw-bold letter-spacing-2 small d-block mb-1">Direct Stay Reservation</span>
              <h2 className="font-serif-luxury fw-bold display-6 mb-2">Guest Information</h2>
              <p className="text-muted">Enter your contact details and guest count to reserve this room directly with us via WhatsApp.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="card shadow-sm border-0 rounded-4 mb-4">
                <div className="card-body p-4 p-md-5">
                  
                  {/* Guest Contact Details */}
                  <div className="row g-4 mb-4 pb-4 border-bottom">
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-uppercase letter-spacing-1 fw-bold text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                        Your Full Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted"><i className="far fa-user"></i></span>
                        <input 
                          type="text" 
                          className="form-control rounded-end-3 py-2 px-3 fs-6" 
                          placeholder="e.g. Rahul Sharma"
                          required
                          value={formData.guest_name}
                          onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small text-uppercase letter-spacing-1 fw-bold text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                        Contact Phone / WhatsApp <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted"><i className="fas fa-phone-alt"></i></span>
                        <input 
                          type="tel" 
                          className="form-control rounded-end-3 py-2 px-3 fs-6" 
                          placeholder="e.g. 9876543210"
                          required
                          value={formData.guest_phone}
                          onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Adults Selector */}
                  <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-4">
                    <div>
                      <h6 className="fw-bold mb-1">Adults</h6>
                      <small className="text-muted">Age 13+</small>
                    </div>
                    <div className="d-flex align-items-center bg-light rounded-pill p-1">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-white bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center text-dark" 
                        style={{ width: '38px', height: '38px', border: '1px solid #dee2e6' }} 
                        onClick={() => setFormData({...formData, adults: Math.max(1, formData.adults - 1)})}
                        disabled={formData.adults <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="fw-bold mx-3 fs-5" style={{ minWidth: '20px', textAlign: 'center' }}>{formData.adults}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-white bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center text-dark" 
                        style={{ width: '38px', height: '38px', border: '1px solid #dee2e6' }} 
                        onClick={() => setFormData({...formData, adults: room.adult_capacity > 0 ? Math.min(room.adult_capacity, formData.adults + 1) : formData.adults + 1})}
                        disabled={room.adult_capacity > 0 && formData.adults >= room.adult_capacity}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  {/* Kids Selector */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="fw-bold mb-1">Kids</h6>
                      <small className="text-muted">Ages 2-12</small>
                    </div>
                    <div className="d-flex align-items-center bg-light rounded-pill p-1">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-white bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center text-dark" 
                        style={{ width: '38px', height: '38px', border: '1px solid #dee2e6' }} 
                        onClick={() => setFormData({...formData, kids: Math.max(0, formData.kids - 1)})}
                        disabled={formData.kids <= 0}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="fw-bold mx-3 fs-5" style={{ minWidth: '20px', textAlign: 'center' }}>{formData.kids}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-white bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center text-dark" 
                        style={{ width: '38px', height: '38px', border: '1px solid #dee2e6' }} 
                        onClick={() => setFormData({...formData, kids: room.child_capacity > 0 ? Math.min(room.child_capacity, formData.kids + 1) : formData.kids + 1})}
                        disabled={room.child_capacity > 0 && formData.kids >= room.child_capacity}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* Capacity Warnings */}
                  <div className="mt-4 px-3 py-2 bg-light rounded text-muted small text-center">
                    <i className="fas fa-info-circle me-2"></i>
                    Maximum capacity: {room.adult_capacity > 0 || room.child_capacity > 0 ? `${room.adult_capacity || 0} Adults, ${room.child_capacity || 0} Kids` : 'Flexible'}{room.extra_capacity ? ` • ${room.extra_capacity}` : ''}
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn w-100 py-3 py-md-4 rounded-pill fs-5 fw-bold shadow-lg d-flex justify-content-center align-items-center text-white border-0"
                style={{ 
                  backgroundColor: '#25D366', 
                  letterSpacing: '0.5px', 
                  transition: 'all 0.3s',
                  boxShadow: '0 8px 25px rgba(37, 211, 102, 0.35)'
                }}
                disabled={processing || redirectingToWhatsApp}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></span>
                    Opening WhatsApp...
                  </>
                ) : (
                  <>
                    <i className="fab fa-whatsapp me-3 fs-3"></i>
                    Book the Room via WhatsApp
                  </>
                )}
              </button>
              
              <div className="text-center mt-3">
                <p className="text-muted small mb-1">
                  <i className="fas fa-check-circle me-2 text-success"></i>
                  Connects directly with Esmeralda Boutique Resort desk on WhatsApp.
                </p>
                <small className="text-muted opacity-75">
                  Direct WhatsApp: <a href="tel:+918138011207" className="text-muted text-decoration-none fw-semibold">+91 81380 11207</a>
                </small>
              </div>

            </form>
          </div>
        </div>
      </div>
      
      <style>{`
        .bg-gradient-dark {
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

export default BookingPage;
