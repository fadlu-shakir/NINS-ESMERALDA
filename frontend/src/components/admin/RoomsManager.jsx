import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/formatImage';

const RoomsManager = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [roomForm, setRoomForm] = useState({
    room_number: '', category: '', description: '', price_per_night: '', capacity: 2, facilities: '', images: [],
    check_in_time: '03:30 PM', check_out_time: '02:30 PM'
  });
  const [editingRoom, setEditingRoom] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomRes, catRes] = await Promise.all([
        api.get('rooms/list/'),
        api.get('rooms/categories/')
      ]);
      setRooms(roomRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to load rooms data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in roomForm) {
      if (key !== 'images' && roomForm[key] !== null && roomForm[key] !== '') {
        formData.append(key, roomForm[key]);
      }
    }
    
    if (roomForm.images && roomForm.images.length > 0) {
      roomForm.images.forEach((file, index) => {
        const fieldName = index === 0 ? 'image' : `image${index + 1}`;
        formData.append(fieldName, file);
      });
    }

    try {
      if (editingRoom) {
        await api.put(`rooms/list/${editingRoom}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Room updated successfully');
      } else {
        await api.post('rooms/list/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Room added successfully');
      }
      setRoomForm({ room_number: '', category: '', description: '', price_per_night: '', capacity: 2, facilities: '', images: [], check_in_time: '03:30 PM', check_out_time: '02:30 PM' });
      setEditingRoom(null);
      fetchData();
    } catch (error) {
      console.error("API Error Response:", error.response?.data);
      let errorMessage = editingRoom ? 'Failed to update room' : 'Failed to add room';
      if (error.response?.data && typeof error.response.data === 'object') {
        const firstKey = Object.keys(error.response.data)[0];
        if (firstKey) {
           const firstError = error.response.data[firstKey];
           errorMessage = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
        }
      }
      toast.error(errorMessage);
    }
  };

  const handleEditRoom = (room) => {
    setRoomForm({
      room_number: room.room_number,
      category: room.category,
      description: room.description,
      price_per_night: room.price_per_night,
      capacity: room.capacity,
      facilities: room.facilities,
      check_in_time: room.check_in_time || '03:30 PM',
      check_out_time: room.check_out_time || '02:30 PM',
      images: []
    });
    setEditingRoom(room.id);
  };

  const handleCancelRoomEdit = () => {
    setRoomForm({ room_number: '', category: '', description: '', price_per_night: '', capacity: 2, facilities: '', images: [], check_in_time: '03:30 PM', check_out_time: '02:30 PM' });
    setEditingRoom(null);
  };

  const handleRoomStatusChange = async (roomId, is_available) => {
    try {
      await api.patch(`rooms/list/${roomId}/`, { is_available });
      toast.success('Room status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRoom = async (id) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await api.delete(`rooms/list/${id}/`);
        toast.success('Room deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete room. It might have existing bookings.');
      }
    }
  };

  // Removed early return to prevent layout shift

  const filteredRooms = rooms.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchNo = (r.room_number || '').toLowerCase().includes(term);
    const matchCat = (r.category_name || '').toLowerCase().includes(term);
    return matchNo || matchCat;
  });

  const renderImagePreviews = () => {
    if (roomForm.images && roomForm.images.length > 0) {
      return (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {roomForm.images.map((file, index) => (
            <div key={index} className="position-relative border rounded p-1 bg-white shadow-sm" style={{ width: '80px', height: '80px' }}>
              <img src={URL.createObjectURL(file)} alt={`preview-${index}`} className="w-100 h-100 object-fit-cover rounded" />
              {index === 0 && <span className="position-absolute bottom-0 start-50 translate-middle-x badge bg-primary" style={{ fontSize: '0.55rem', zIndex: 1 }}>Cover</span>}
            </div>
          ))}
        </div>
      );
    } else if (editingRoom) {
      const room = rooms.find(r => r.id === editingRoom);
      if (room) {
        const existingImages = [room.image, room.image2, room.image3, room.image4, room.image5].filter(Boolean);
        if (existingImages.length > 0) {
          return (
            <div className="mt-3">
              <small className="text-muted fw-bold d-block mb-2">Current Images:</small>
              <div className="d-flex flex-wrap gap-2">
                {existingImages.map((imgUrl, index) => (
                  <div key={index} className="position-relative border rounded p-1 bg-white shadow-sm" style={{ width: '80px', height: '80px' }}>
                    <img src={getImageUrl(imgUrl)} alt={`current-${index}`} className="w-100 h-100 object-fit-cover rounded" />
                    {index === 0 && <span className="position-absolute bottom-0 start-50 translate-middle-x badge bg-secondary" style={{ fontSize: '0.55rem', zIndex: 1 }}>Cover</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        }
      }
    }
    return null;
  };

  return (
    <div className="row">
      <div className="col-lg-4 mb-4">
        <div className="card shadow border-0 p-4 bg-light">
          <h4 className="mb-4">{editingRoom ? 'Edit Room' : 'Add New Room'}</h4>
          <form onSubmit={handleRoomSubmit}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Room Number (Optional)</label>
              <input type="text" className="form-control" value={roomForm.room_number || ''} onChange={e => setRoomForm({...roomForm, room_number: e.target.value})} placeholder="Leave blank for unnumbered" />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Category</label>
              <select className="form-select" required value={roomForm.category} onChange={e => setRoomForm({...roomForm, category: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Price / Night (₹)</label>
              <input type="number" step="0.01" className="form-control" required value={roomForm.price_per_night} onChange={e => setRoomForm({...roomForm, price_per_night: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Capacity</label>
              <input type="number" className="form-control" required value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Facilities (comma separated)</label>
              <input type="text" className="form-control" required value={roomForm.facilities} onChange={e => setRoomForm({...roomForm, facilities: e.target.value})} placeholder="WiFi, TV, AC" />
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Description</label>
              <textarea className="form-control" rows="3" required value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})}></textarea>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small fw-bold">Check-in Time</label>
                <input type="text" className="form-control" value={roomForm.check_in_time} onChange={e => setRoomForm({...roomForm, check_in_time: e.target.value})} placeholder="03:30 PM" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label text-muted small fw-bold">Check-out Time</label>
                <input type="text" className="form-control" value={roomForm.check_out_time} onChange={e => setRoomForm({...roomForm, check_out_time: e.target.value})} placeholder="02:30 PM" />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Images (Up to 5)</label>
              <input type="file" className="form-control" multiple accept="image/*" onChange={e => {
                const files = Array.from(e.target.files).slice(0, 5);
                setRoomForm({...roomForm, images: files});
              }} />
              <small className="text-muted d-block mt-1">First image will be the primary cover image.</small>
              {renderImagePreviews()}
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary-modern flex-grow-1">
                {editingRoom ? 'Update Room' : 'Add Room'}
              </button>
              {editingRoom && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelRoomEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card shadow border-0">
          <div className="card-body">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
              <h5 className="card-title mb-0">Existing Rooms</h5>
              <div className="search-box position-relative" style={{ minWidth: '250px' }}>
                <i className="bi bi-search position-absolute text-muted" style={{ top: '10px', left: '15px' }}></i>
                <input 
                  type="text" 
                  className="form-control rounded-pill ps-5 bg-light border-0" 
                  placeholder="Search rooms..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>No.</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Cap</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border text-primary-modern"></div><div className="mt-2 text-muted small">Loading rooms...</div></td></tr>
                  ) : filteredRooms.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No rooms found.</td></tr>
                  ) : filteredRooms.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.room_number || <span className="text-muted fst-italic">Unnumbered</span>}</strong></td>
                      <td>{r.category_name}</td>
                      <td>₹{r.price_per_night}</td>
                      <td>{r.capacity}</td>
                      <td>
                        <select 
                          className={`form-select form-select-sm border-0 ${r.is_available ? 'bg-success text-white' : 'bg-danger text-white'}`}
                          value={r.is_available} 
                          onChange={(e) => handleRoomStatusChange(r.id, e.target.value === 'true')}
                        >
                          <option value="true">Active</option>
                          <option value="false">Offline</option>
                        </select>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button className="btn btn-sm btn-outline-primary" title="Edit" onClick={() => handleEditRoom(r)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteRoom(r.id)}>
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsManager;
