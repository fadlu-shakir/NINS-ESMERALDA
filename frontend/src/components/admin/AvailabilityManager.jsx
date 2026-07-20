import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AvailabilityManager = () => {
  const [rooms, setRooms] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    room: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, blockedRes] = await Promise.all([
        api.get('rooms/list/'),
        api.get('availability/blocked-dates/')
      ]);
      setRooms(roomsRes.data);
      setBlockedDates(blockedRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.room || !formData.start_date || !formData.end_date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (formData.start_date >= formData.end_date) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      await api.post('availability/blocked-dates/', formData);
      toast.success('Dates successfully blocked');
      setFormData({ room: '', start_date: '', end_date: '', reason: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.non_field_errors?.[0] || 'Failed to block dates. Check for overlapping blocks.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to unblock these dates?')) {
      try {
        await api.delete(`availability/blocked-dates/${id}/`);
        toast.success('Dates unblocked successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to unblock dates');
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <div className="card shadow border-0 mb-4">
        <div className="card-body p-4">
          <h5 className="card-title mb-4">Block Room Dates</h5>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Room</label>
                <select 
                  className="form-select" 
                  name="room" 
                  value={formData.room} 
                  onChange={handleInputChange} 
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.category_name} {room.room_number ? `(${room.room_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Start Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="start_date" 
                  value={formData.start_date} 
                  onChange={handleInputChange} 
                  min={today}
                  required 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase">End Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  name="end_date" 
                  value={formData.end_date} 
                  onChange={handleInputChange} 
                  min={formData.start_date || today}
                  required 
                />
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small fw-bold text-uppercase">Reason (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="reason" 
                  value={formData.reason} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Maintenance" 
                />
              </div>
              <div className="col-12 mt-3 text-end">
                <button type="submit" className="btn btn-danger px-4">
                  <i className="fas fa-ban me-2"></i> Block Dates
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow border-0">
        <div className="card-body p-4">
          <h5 className="card-title mb-4">Currently Blocked Dates</h5>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : blockedDates.length === 0 ? (
            <div className="text-center py-5 bg-light rounded text-muted">
              <i className="far fa-calendar-check fs-1 mb-3"></i>
              <h5>No blocked dates</h5>
              <p className="mb-0">All rooms are available for booking.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedDates.map(block => (
                    <tr key={block.id}>
                      <td>
                        <span className="fw-semibold">{block.room_name}</span>
                        {block.room_number && (
                          <span className="ms-2 badge bg-secondary">{block.room_number}</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="far fa-calendar-alt text-muted me-2"></i>
                          {block.start_date}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="far fa-calendar-alt text-muted me-2"></i>
                          {block.end_date}
                        </div>
                      </td>
                      <td>{block.reason || <span className="text-muted fst-italic">None</span>}</td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => handleDelete(block.id)}
                          title="Unblock Dates"
                        >
                          <i className="fas fa-unlock me-1"></i> Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AvailabilityManager;
