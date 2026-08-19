import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomCalendar from '../components/CustomCalendar';
import api from '../services/api';
import { getImageUrl } from '../utils/formatImage';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [formData, setFormData] = useState({
    check_in_date: '',
    check_out_date: '',
    adults: 1,
    kids: 0
  });
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await api.get(`rooms/list/${id}/`);
        setRoom(roomRes.data);
        const bookedRes = await api.get(`rooms/list/${id}/booked_dates/`);
        setBookedDates(bookedRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Smart Defaults: Auto-select next available dates
  useEffect(() => {
    if (room && !loading && !formData.check_in_date) {
      const getNextAvailableDates = () => {
        let checkIn = new Date();
        checkIn.setHours(0,0,0,0);
        let checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 1);

        const isDateBooked = (dStr) => bookedDates.some(b => (dStr >= b.check_in && dStr < b.check_out));
        
        for(let attempts = 0; attempts < 30; attempts++) {
          const inStr = checkIn.toISOString().split('T')[0];
          const outStr = checkOut.toISOString().split('T')[0];
          if (!isDateBooked(inStr) && !isDateBooked(outStr) && 
              !bookedDates.some(b => (b.check_in >= inStr && b.check_in < outStr))) {
              return { checkIn: inStr, checkOut: outStr };
          }
          checkIn.setDate(checkIn.getDate() + 1);
          checkOut.setDate(checkOut.getDate() + 1);
        }
        return { checkIn: '', checkOut: '' };
      };

      const defaults = getNextAvailableDates();
      setFormData(prev => ({
        ...prev,
        check_in_date: defaults.checkIn,
        check_out_date: defaults.checkOut
      }));
    }
  }, [room, loading, bookedDates]);

  const handleDateChange = (date) => {
    if (!date) {
        setFormData({ ...formData, check_in_date: '', check_out_date: '' });
        return;
    }
    
    if (date) {
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        const dStr = offsetDate.toISOString().split('T')[0];
        
        if (!formData.check_in_date || (formData.check_in_date && formData.check_out_date)) {
            setFormData({ ...formData, check_in_date: dStr, check_out_date: '' });
        } else if (formData.check_in_date && !formData.check_out_date) {
            if (new Date(dStr) > new Date(formData.check_in_date)) {
                // Check if there are booked dates in between
                const isConflict = bookedDates.some(booking => {
                    return (booking.check_in >= formData.check_in_date && booking.check_in < dStr) ||
                           (booking.check_out > formData.check_in_date && booking.check_out <= dStr) ||
                           (booking.check_in <= formData.check_in_date && booking.check_out >= dStr);
                });
                if (isConflict) {
                    toast.error("You cannot book dates that include already reserved days.");
                    setFormData({ ...formData, check_in_date: dStr, check_out_date: '' });
                } else {
                    setFormData({ ...formData, check_out_date: dStr });
                }
            } else {
                setFormData({ ...formData, check_in_date: dStr, check_out_date: '' });
            }
        }
    }
  };

  const calculateTotal = () => {
    if (!formData.check_in_date || !formData.check_out_date || !room) return 0;
    const start = new Date(formData.check_in_date + 'T00:00:00');
    const end = new Date(formData.check_out_date + 'T00:00:00');
    const diffTime = end - start;
    if (diffTime <= 0) return room.price_per_night;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * room.price_per_night;
  };

  const calculateDays = () => {
    if (!formData.check_in_date || !formData.check_out_date) return 1;
    const start = new Date(formData.check_in_date + 'T00:00:00');
    const end = new Date(formData.check_out_date + 'T00:00:00');
    const diffTime = end - start;
    return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.check_in_date || !formData.check_out_date) {
        toast.error("Please select both check-in and check-out dates.");
        return;
    }
    
    setProcessing(true);
    try {
      // 1. Create Booking
      const res = await api.post('bookings/', {
        room: id,
        ...formData
      });
      const newBookingId = res.data.id;

      // 2. Simulate Payment Delay for UX
      setTimeout(async () => {
        try {
          await api.post(`bookings/${newBookingId}/pay/`);
          setPaymentSuccess(true);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } catch (paymentErr) {
          toast.error("Booking created, but payment simulation failed.");
          navigate('/dashboard'); // Still navigate to dashboard so they can pay manually
        }
      }, 1500);

    } catch (error) {
      toast.error(error.response?.data?.non_field_errors?.[0] || 'Booking failed. Please try again.');
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
      
      {/* Payment Success Overlay */}
      {paymentSuccess && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white" style={{ zIndex: 9999 }}>
          <div className="text-success mb-4 animate__animated animate__zoomIn">
            <i className="fas fa-check-circle" style={{ fontSize: '6rem' }}></i>
          </div>
          <h2 className="fw-bold font-serif-luxury animate__animated animate__fadeInUp">Booking Confirmed!</h2>
          <p className="text-muted animate__animated animate__fadeInUp animate__delay-1s">Redirecting to your dashboard...</p>
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
            <h5 className="text-uppercase letter-spacing-1 small text-muted fw-bold mb-4">Summary</h5>
            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
               <span className="text-muted">Rate per night</span>
               <span className="fw-bold">₹{room.price_per_night}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
               <span className="text-muted">Nights</span>
               <span className="fw-bold">{calculateDays()}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-4">
               <span className="fw-bold fs-5 text-dark">Total</span>
               <span className="fw-bold fs-3 text-accent">₹{calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Booking Form */}
        <div className="col-lg-7 col-xl-8 overflow-auto" style={{ height: 'calc(100vh - 70px)' }}>
          <div className="container py-5 px-4 px-md-5 mx-auto" style={{ maxWidth: '800px' }}>
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="d-lg-none mb-4 pb-4 border-bottom">
              <button onClick={() => navigate(-1)} className="btn btn-link text-dark p-0 mb-4 text-decoration-none d-inline-flex align-items-center hover-accent fw-semibold text-uppercase small letter-spacing-1">
                <i className="fas fa-arrow-left me-2"></i> Back
              </button>
              <h2 className="font-serif-luxury fw-bold mb-1">{room.category_name}</h2>
              <p className="text-accent fw-bold mb-0">₹{room.price_per_night} / night</p>
            </div>

            <div className="d-flex align-items-center gap-3 mb-5">
               <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>1</div>
               <h3 className="mb-0 fw-bold font-serif-luxury">Select Dates</h3>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="card shadow-sm border-0 rounded-4 overflow-hidden mb-5">
                <div className="card-body p-4 p-md-5">
                  <CustomCalendar 
                    checkInDate={formData.check_in_date}
                    checkOutDate={formData.check_out_date}
                    onDateChange={handleDateChange}
                    bookedDates={bookedDates}
                    minDate={new Date()}
                  />
                  
                  <div className="row mt-4 pt-4 border-top">
                    <div className="col-6 border-end">
                      <small className="text-muted d-block text-uppercase letter-spacing-1 fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Check-in</small>
                      <div className="fw-bold text-dark fs-5">{formData.check_in_date || 'Select date'}</div>
                      <small className="text-muted">From {room.check_in_time}</small>
                    </div>
                    <div className="col-6 ps-4">
                      <small className="text-muted d-block text-uppercase letter-spacing-1 fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Check-out</small>
                      <div className="fw-bold text-dark fs-5">{formData.check_out_date || 'Select date'}</div>
                      <small className="text-muted">Until {room.check_out_time}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-5 mt-5">
                 <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>2</div>
                 <h3 className="mb-0 fw-bold font-serif-luxury">Guest Details</h3>
              </div>

              <div className="card shadow-sm border-0 rounded-4 mb-5">
                <div className="card-body p-4 p-md-5">
                  
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
                        onClick={() => setFormData({...formData, adults: Math.min(room.adult_capacity, formData.adults + 1)})}
                        disabled={formData.adults >= room.adult_capacity}
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
                        onClick={() => setFormData({...formData, kids: Math.min(room.child_capacity, formData.kids + 1)})}
                        disabled={formData.kids >= room.child_capacity}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  {/* Capacity Warnings */}
                  <div className="mt-4 px-3 py-2 bg-light rounded text-muted small text-center">
                    <i className="fas fa-info-circle me-2"></i>
                    Maximum capacity: {room.adult_capacity} Adults, {room.child_capacity} Kids
                  </div>

                </div>
              </div>

              {/* Mobile Total Price (Hidden on Desktop) */}
              <div className="d-lg-none card shadow-sm border-0 rounded-4 mb-5 bg-dark text-white">
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="d-block text-white-50 text-uppercase letter-spacing-1 small mb-1">Total Amount</span>
                    <h3 className="mb-0 fw-bold">₹{calculateTotal().toFixed(2)}</h3>
                  </div>
                  <div className="text-end text-white-50 small">
                    {calculateDays()} Nights
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`btn btn-primary-modern w-100 py-4 rounded-pill fs-5 fw-bold shadow-lg d-flex justify-content-center align-items-center ${processing ? 'disabled' : ''}`}
                style={{ letterSpacing: '1px', transition: 'all 0.3s' }}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Confirm & Pay <i className="fas fa-arrow-right ms-3"></i>
                  </>
                )}
              </button>
              
              <div className="text-center mt-4">
                <p className="text-muted small"><i className="fas fa-lock me-2"></i>Secure dummy payment processing powered by Esmeralda.</p>
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
