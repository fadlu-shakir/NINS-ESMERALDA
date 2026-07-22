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
    guest_count: 1
  });
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    api.get(`rooms/list/${id}/`).then(res => setRoom(res.data)).catch(console.error);
    api.get(`rooms/list/${id}/booked_dates/`).then(res => {
      setBookedDates(res.data);
    }).catch(console.error);
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.check_in_date || !formData.check_out_date) {
        toast.error("Please select both dates");
        return;
    }
    try {
      const res = await api.post('bookings/', {
        room: id,
        ...formData
      });
      toast.success('Booking created! Please complete payment.');
      navigate(`/payment/${res.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.non_field_errors?.[0] || 'Booking failed');
    }
  };

  if (!room) return <div className="text-center my-5">Loading...</div>;

  return (
    <div className="container py-5" style={{ marginTop: '70px' }}>
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-link text-muted p-0 text-decoration-none d-inline-flex align-items-center hover-accent fw-semibold text-uppercase small letter-spacing-1">
          <i className="fas fa-chevron-left me-2" style={{ fontSize: '0.75rem' }}></i> Back
        </button>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow border-0 p-4">
            <h2 className="mb-4">Complete Your Booking</h2>
            
            <div className="d-flex align-items-center mb-4 bg-light p-3 rounded">
              <img src={getImageUrl(room.image) || '/resort_img/8.jpeg'} alt="Room" className="rounded" style={{ width: '100px', height: '80px', objectFit: 'cover' }} />
              <div className="ms-3">
                <h5 className="mb-1">{room.category_name}</h5>
                <p className="text-accent mb-0">₹{room.price_per_night} / night</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-4 mb-4">
                <div className="col-md-12">
                  <label className="form-label text-muted small fw-bold text-uppercase d-block mb-3">
                    Select Check-in & Check-out Dates <span className="text-accent ms-2">({room.check_in_time} to {room.check_out_time})</span>
                  </label>
                  <CustomCalendar 
                    checkInDate={formData.check_in_date}
                    checkOutDate={formData.check_out_date}
                    onDateChange={handleDateChange}
                    bookedDates={bookedDates}
                    minDate={new Date()}
                  />
                  <div className="d-flex justify-content-between mt-2 px-2">
                    {formData.check_in_date && <div className="text-muted small fw-bold"><i className="fas fa-sign-in-alt me-1 text-accent"></i> In: {formData.check_in_date}</div>}
                    {formData.check_out_date && <div className="text-muted small fw-bold"><i className="fas fa-sign-out-alt me-1 text-accent"></i> Out: {formData.check_out_date}</div>}
                  </div>
                </div>
                <div className="col-md-12">
                  <label className="form-label text-muted small fw-bold text-uppercase">Number of Guests</label>
                  <input type="number" className="form-control" name="guest_count" min="1" max={room.capacity} required value={formData.guest_count} onChange={handleChange} />
                </div>
              </div>
              
              <div className="bg-light p-4 rounded mb-4 text-end border-start border-4" style={{ borderColor: 'var(--color-accent) !important' }}>
                <h5 className="text-muted mb-2">Total Amount</h5>
                <h2 className="text-accent mb-0">₹{calculateTotal().toFixed(2)}</h2>
              </div>

              <button type="submit" className="btn btn-primary-modern w-100 py-3 fs-5">Confirm Booking & Pay</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
