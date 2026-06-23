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

  const handleDateChange = (date, field) => {
    if (date) {
        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        setFormData({ ...formData, [field]: offsetDate.toISOString().split('T')[0] });
    } else {
        setFormData({ ...formData, [field]: '' });
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
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold text-uppercase d-block mb-3">
                    Check-in Date <span className="text-accent ms-2">({room.check_in_time})</span>
                  </label>
                  <CustomCalendar 
                    selectedDate={formData.check_in_date}
                    onDateChange={(date) => handleDateChange(date, 'check_in_date')}
                    bookedDates={bookedDates}
                    minDate={new Date()}
                  />
                  {formData.check_in_date && <div className="mt-2 text-success small">Selected: {formData.check_in_date}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold text-uppercase d-block mb-3">
                    Check-out Date <span className="text-accent ms-2">({room.check_out_time})</span>
                  </label>
                  <CustomCalendar 
                    selectedDate={formData.check_out_date}
                    onDateChange={(date) => handleDateChange(date, 'check_out_date')}
                    bookedDates={bookedDates}
                    minDate={formData.check_in_date ? new Date(new Date(formData.check_in_date + 'T00:00:00').getTime() + 86400000) : new Date()}
                  />
                  {formData.check_out_date && <div className="mt-2 text-success small">Selected: {formData.check_out_date}</div>}
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
