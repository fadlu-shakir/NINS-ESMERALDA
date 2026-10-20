import { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/formatImage';

const BASE_FACILITIES = [
  'Free WiFi', 'Air Conditioning', 'Smart TV',
  'Room Service',  'Private Balcony', 'In-Room Safe', 
  'Coffee Maker', 'Bathtub', 'Hairdryer', 'Workspace',
  'King Bed', 'Twin Beds', 'Lounge Area', 'Pool Access'
];
const RoomsManager = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [roomForm, setRoomForm] = useState({
    room_number: '', category: '', description: '', price_per_night: '', adult_capacity: 2, child_capacity: 0, extra_capacity: '', facilities: '', images: [],
    check_in_time: '03:30 PM', check_out_time: '02:30 PM'
  });
  const [newFacilityInput, setNewFacilityInput] = useState('');
  const [customFacilities, setCustomFacilities] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomImages, setRoomImages] = useState([]);
  const fileInputRef = useRef(null);

  const dynamicFacilities = useMemo(() => {
    const facilitiesSet = new Set(BASE_FACILITIES);
    rooms.forEach(room => {
      if (room.facilities) {
        room.facilities.split(',').forEach(f => {
          const trimmed = f.trim();
          if (trimmed) facilitiesSet.add(trimmed);
        });
      }
    });
    customFacilities.forEach(f => facilitiesSet.add(f));
    if (roomForm.facilities) {
      roomForm.facilities.split(',').forEach(f => {
        const trimmed = f.trim();
        if (trimmed) facilitiesSet.add(trimmed);
      });
    }
    return Array.from(facilitiesSet).sort();
  }, [rooms, customFacilities, roomForm.facilities]);

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
      if (key !== 'images') {
        if (roomForm[key] !== null && roomForm[key] !== '') {
          formData.append(key, roomForm[key]);
        } else if (key === 'description' || key === 'room_number' || key === 'extra_capacity' || key === 'facilities') {
          formData.append(key, '');
        } else if (key === 'price_per_night') {
          formData.append(key, '0.00');
        } else if (key === 'adult_capacity' || key === 'child_capacity') {
          formData.append(key, '0');
        }
      }
    }

    try {
      if (editingRoom) {
        const imagesMeta = [];
        let newCounter = 0;
        roomImages.slice(0, 5).forEach((item) => {
          if (item.type === 'existing') {
            imagesMeta.push({ type: 'existing', field: item.field });
          } else if (item.type === 'new') {
            const fileKey = `new_image_${newCounter++}`;
            imagesMeta.push({ type: 'new', file_key: fileKey });
            formData.append(fileKey, item.file);
          }
        });
        formData.append('images_meta', JSON.stringify(imagesMeta));

        await api.put(`rooms/list/${editingRoom}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Room updated successfully');
      } else {
        roomImages.slice(0, 5).forEach((item, index) => {
          const fieldName = index === 0 ? 'image' : `image${index + 1}`;
          if (item.file) {
            formData.append(fieldName, item.file);
          }
        });

        await api.post('rooms/list/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Room added successfully');
      }
      setRoomForm({ room_number: '', category: '', description: '', price_per_night: '', adult_capacity: 2, child_capacity: 0, extra_capacity: '', facilities: '', images: [], check_in_time: '03:30 PM', check_out_time: '02:30 PM' });
      setRoomImages([]);
      setEditingRoom(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      room_number: room.room_number || '',
      category: room.category || '',
      description: room.description || '',
      price_per_night: room.price_per_night !== null && room.price_per_night !== undefined ? room.price_per_night : '',
      adult_capacity: room.adult_capacity !== null && room.adult_capacity !== undefined ? room.adult_capacity : '',
      child_capacity: room.child_capacity !== null && room.child_capacity !== undefined ? room.child_capacity : '',
      extra_capacity: room.extra_capacity || '',
      facilities: room.facilities || '',
      check_in_time: room.check_in_time || '03:30 PM',
      check_out_time: room.check_out_time || '02:30 PM',
      images: []
    });

    const existing = [];
    ['image', 'image2', 'image3', 'image4', 'image5'].forEach((field) => {
      if (room[field]) {
        existing.push({
          id: `existing-${field}`,
          type: 'existing',
          field: field,
          url: getImageUrl(room[field])
        });
      }
    });
    setRoomImages(existing);
    setEditingRoom(room.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddCustomFacility = (e) => {
    if (e) e.preventDefault();
    const trimmed = newFacilityInput.trim();
    if (!trimmed) return;

    if (!customFacilities.includes(trimmed)) {
      setCustomFacilities(prev => [...prev, trimmed]);
    }

    const currentFacilities = roomForm.facilities 
      ? roomForm.facilities.split(',').map(f => f.trim()).filter(Boolean) 
      : [];

    if (!currentFacilities.includes(trimmed)) {
      currentFacilities.push(trimmed);
      setRoomForm(prev => ({ ...prev, facilities: currentFacilities.join(', ') }));
    }

    setNewFacilityInput('');
  };

  const handleCancelRoomEdit = () => {
    setRoomForm({ room_number: '', category: '', description: '', price_per_night: '', adult_capacity: 2, child_capacity: 0, extra_capacity: '', facilities: '', images: [], check_in_time: '03:30 PM', check_out_time: '02:30 PM' });
    setRoomImages([]);
    setEditingRoom(null);
    setNewFacilityInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remainingSlots = 5 - roomImages.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum 5 images allowed per room.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const toAdd = files.slice(0, remainingSlots).map((file, i) => ({
      id: `new-${Date.now()}-${i}-${Math.random()}`,
      type: 'new',
      file: file,
      url: URL.createObjectURL(file)
    }));
    setRoomImages(prev => [...prev, ...toAdd]);
    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} photo(s) added (max 5 photos per room).`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = (index) => {
    const isCover = index === 0;
    setRoomImages(prev => prev.filter((_, idx) => idx !== index));
    if (isCover && roomImages.length > 1) {
      toast.info('Cover image removed. Next photo became cover. Click "Update Room" to save.', { autoClose: 2500 });
    } else {
      toast.info('Photo removed. Click "Update Room" to save.', { autoClose: 2000 });
    }
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    setRoomImages(prev => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return updated;
    });
    toast.success('Cover image changed! Click "Update Room" to save.', { autoClose: 2000 });
  };

  return (
    <div className="row">
      <div className="col-lg-4 mb-4">
        <div className="card shadow border-0 p-4 bg-light">
          <h4 className="mb-4">{editingRoom ? 'Edit Room' : 'Add New Room'}</h4>
          <form onSubmit={handleRoomSubmit}>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-muted small fw-bold mb-0">Select Room Number</label>
                  <button  
                    type="button" 
                    className="btn btn-sm btn-outline-primary py-0 px-2"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => {
                      const allAvailable = Array.from({ length: 8 }, (_, i) => `R${i + 1}`).filter(rNum => {
                        const usageCount = rooms.filter(r => {
                          if (r.id === editingRoom || !r.room_number) return false;
                          return r.room_number.split(',').map(s => s.trim()).includes(rNum);
                        }).length;
                        return usageCount < 3;
                      });
                      
                      const currentNumbers = roomForm.room_number ? roomForm.room_number.split(',').map(s => s.trim()).filter(Boolean) : [];
                      
                      if (currentNumbers.length === allAvailable.length && allAvailable.length > 0) {
                        setRoomForm({...roomForm, room_number: ''});
                      } else {
                        setRoomForm({...roomForm, room_number: allAvailable.join(', ')});
                      }
                    }}
                  >
                    {roomForm.room_number && roomForm.room_number.split(',').filter(Boolean).length === Array.from({ length: 8 }, (_, i) => `R${i + 1}`).filter(rNum => {
                        const usageCount = rooms.filter(r => (!r.room_number ? false : r.room_number.split(',').map(s => s.trim()).includes(rNum))).length;
                        return usageCount < 3;
                      }).length ? 'Deselect All' : 'Select All'}
                  </button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {Array.from({ length: 8 }, (_, i) => `R${i + 1}`).map(rNum => {
                  const usageCount = rooms.filter(r => {
                    if (r.id === editingRoom || !r.room_number) return false;
                    return r.room_number.split(',').map(s => s.trim()).includes(rNum);
                  }).length;
                  const isUsed = usageCount >= 3;
                  
                  const currentNumbers = roomForm.room_number ? roomForm.room_number.split(',').map(s => s.trim()).filter(Boolean) : [];
                  const isSelected = currentNumbers.includes(rNum);
                  
                  const handleToggleSelection = () => {
                    if (isUsed) return;
                    let newNumbers = [...currentNumbers];
                    if (isSelected) {
                      newNumbers = newNumbers.filter(n => n !== rNum);
                    } else {
                      newNumbers.push(rNum);
                    }
                    // Sort them correctly R1, R2, R10
                    newNumbers.sort((a, b) => parseInt(a.replace('R', '')) - parseInt(b.replace('R', '')));
                    setRoomForm({...roomForm, room_number: newNumbers.join(', ')});
                  };

                  return (
                    <div 
                      key={rNum}
                      onClick={handleToggleSelection}
                      className={`border rounded d-flex align-items-center justify-content-center p-2 shadow-sm 
                        ${isSelected ? 'bg-primary-modern text-white border-primary border-2' : isUsed ? 'bg-secondary text-white opacity-50' : 'bg-white'}`}
                      style={{ 
                        width: '45px', 
                        height: '45px', 
                        cursor: isUsed ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'scale(1.1)' : 'none'
                      }}
                      title={isUsed ? 'Room already used 3 times' : 'Toggle selection'}
                    >
                      <span className="fw-bold" style={{ fontSize: '0.9rem' }}>{rNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Category</label>
              <select className="form-select" required value={roomForm.category} onChange={e => setRoomForm({...roomForm, category: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Price / Night (₹) <span className="text-muted fw-normal">(Optional)</span></label>
              <input type="number" step="0.01" className="form-control" placeholder="0.00 (Optional)" value={roomForm.price_per_night} onChange={e => setRoomForm({...roomForm, price_per_night: e.target.value})} />
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Adult Capacity <span className="text-muted fw-normal">(Optional)</span></label>
                <input type="number" className="form-control" placeholder="2 (Optional)" value={roomForm.adult_capacity} onChange={e => setRoomForm({...roomForm, adult_capacity: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">Kids Capacity <span className="text-muted fw-normal">(Optional)</span></label>
                <input type="number" className="form-control" placeholder="0 (Optional)" value={roomForm.child_capacity} onChange={e => setRoomForm({...roomForm, child_capacity: e.target.value})} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Additional Capacity / Guest Notes <span className="text-muted fw-normal">(Optional)</span></label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. +1 Extra bed on request, Infants free, Max 5 total..." 
                value={roomForm.extra_capacity || ''} 
                onChange={e => setRoomForm({...roomForm, extra_capacity: e.target.value})} 
              />
              <small className="text-muted" style={{ fontSize: '0.78rem' }}>Add custom capacity notes (e.g. extra bed rules, infant policy, or overall capacity limits).</small>
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold mb-2">Facilities & Features <span className="text-muted fw-normal">(Optional)</span></label>
              
              {/* Text bar to add custom feature with '+' button */}
              <div className="input-group mb-2">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type a new facility / feature (e.g. Jacuzzi, Mini Bar)..." 
                  value={newFacilityInput} 
                  onChange={e => setNewFacilityInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomFacility();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn btn-primary-modern px-3 d-flex align-items-center gap-1"
                  onClick={handleAddCustomFacility}
                  title="Add this feature"
                >
                  <i className="fas fa-plus"></i>
                  <span>Add</span>
                </button>
              </div>
              <small className="text-muted d-block mb-3" style={{ fontSize: '0.78rem' }}>Type any feature above and click <strong>+ Add</strong> (or press Enter) to add consecutive features.</small>

              {/* Facility Badges / Quick Selection */}
              <div className="d-flex flex-wrap gap-2">
                {dynamicFacilities.map(facility => {
                  const currentFacilities = roomForm.facilities ? roomForm.facilities.split(',').map(f => f.trim()).filter(Boolean) : [];
                  const isSelected = currentFacilities.includes(facility);
                  
                  return (
                    <div 
                      key={facility}
                      onClick={() => {
                        let updated = [...currentFacilities];
                        if (isSelected) updated = updated.filter(f => f !== facility);
                        else updated.push(facility);
                        setRoomForm({...roomForm, facilities: updated.join(', ')});
                      }}
                      className={`badge border p-2 ${isSelected ? 'bg-primary-modern text-white border-primary' : 'bg-white text-dark border-secondary'}`}
                      style={{ cursor: 'pointer', fontSize: '0.8rem', userSelect: 'none', transition: 'all 0.2s' }}
                    >
                      <i className={`fas ${isSelected ? 'fa-check text-white' : 'fa-plus text-muted'} me-1`}></i> {facility}
                    </div>
                  );
                })}
              </div>

              {roomForm.facilities && (
                <div className="mt-2 text-muted small">
                  <strong>Selected ({roomForm.facilities.split(',').filter(f => f.trim()).length}):</strong> {roomForm.facilities}
                </div>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Description <span className="text-muted fw-normal">(Optional)</span></label>
              <textarea className="form-control" rows="3" placeholder="Optional room description..." value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})}></textarea>
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-muted small fw-bold mb-0">
                  Room Photos ({roomImages.length}/5)
                </label>
                {roomImages.length < 5 && (
                  <span className="badge bg-light text-secondary border" style={{ fontSize: '0.75rem' }}>
                    {5 - roomImages.length} slot{5 - roomImages.length > 1 ? 's' : ''} left
                  </span>
                )}
              </div>

              {/* Upload Input */}
              {roomImages.length < 5 ? (
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="form-control" 
                    multiple 
                    accept="image/*" 
                    onChange={handleAddFiles} 
                  />
                  <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>
                    Photo 1 is the <strong>Primary Cover Image</strong>. You can change cover or delete anytime below.
                  </small>
                </div>
              ) : (
                <div className="alert alert-secondary py-2 px-3 small text-muted mb-0 d-flex align-items-center justify-content-between rounded-3">
                  <span><i className="fas fa-check-circle text-success me-2"></i>Max 5 photos reached</span>
                  <small>Delete a photo to add a new one</small>
                </div>
              )}

              {/* Previews / Management Grid */}
              {roomImages.length > 0 && (
                <div className="mt-3">
                  <div className="row g-2">
                    {roomImages.map((imgItem, index) => {
                      const isCover = index === 0;
                      return (
                        <div key={imgItem.id} className="col-6 col-sm-4">
                          <div 
                            className={`card h-100 border shadow-sm position-relative overflow-hidden ${isCover ? 'border-warning border-2' : ''}`}
                            style={{ borderRadius: '10px' }}
                          >
                            {/* Badges Bar */}
                            <div className="position-absolute top-0 start-0 w-100 p-1 d-flex justify-content-between align-items-center" style={{ zIndex: 2 }}>
                              {isCover ? (
                                <span className="badge bg-warning text-dark fw-bold shadow-sm" style={{ fontSize: '0.65rem' }}>
                                  Cover
                                </span>
                              ) : (
                                <span className="badge bg-dark bg-opacity-75 text-white" style={{ fontSize: '0.65rem' }}>
                                  #{index + 1}
                                </span>
                              )}

                              <button 
                                type="button" 
                                className="btn btn-sm btn-danger rounded-circle p-0 shadow-sm d-flex align-items-center justify-content-center"
                                style={{ width: '22px', height: '22px' }}
                                onClick={() => handleDeleteImage(index)}
                                title="Delete image"
                              >
                                <i className="fas fa-times" style={{ fontSize: '0.65rem' }}></i>
                              </button>
                            </div>

                            {/* Image Thumbnail */}
                            <div style={{ height: '90px', backgroundColor: '#f8f9fa' }}>
                              <img 
                                src={imgItem.url} 
                                alt={`photo-${index}`} 
                                className="w-100 h-100 object-fit-cover" 
                              />
                            </div>

                            {/* Action Bar */}
                            <div className="p-1 bg-white border-top text-center">
                              {isCover ? (
                                <span className="text-warning-emphasis fw-bold d-block" style={{ fontSize: '0.7rem' }}>
                                  <i className="fas fa-star me-1 text-warning"></i>Cover Image
                                </span>
                              ) : (
                                <button 
                                  type="button" 
                                  className="btn btn-xs btn-outline-primary w-100 py-1 fw-bold"
                                  style={{ fontSize: '0.68rem', borderRadius: '6px' }}
                                  onClick={() => handleSetCover(index)}
                                  title="Make this the Cover Image"
                                >
                                  <i className="fas fa-star text-warning me-1"></i>Set Cover
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img 
                            src={getImageUrl(r.image) || '/resort_img/7.jpeg'} 
                            alt="Cover" 
                            className="rounded object-fit-cover border shadow-sm" 
                            style={{ width: '38px', height: '38px' }} 
                          />
                          <strong>{r.room_number || <span className="text-muted fst-italic">Unnumbered</span>}</strong>
                        </div>
                      </td>
                      <td>{r.category_name}</td>
                      <td>{r.price_per_night && Number(r.price_per_night) > 0 ? `₹${r.price_per_night}` : <span className="text-muted fst-italic">Not set</span>}</td>
                      <td>
                        <div>
                          {r.adult_capacity > 0 || r.child_capacity > 0
                            ? `${r.adult_capacity || 0}A, ${r.child_capacity || 0}K`
                            : (r.extra_capacity ? '-' : <span className="text-muted fst-italic">Optional</span>)}
                        </div>
                        {r.extra_capacity && (
                          <div className="text-muted fst-italic" style={{ fontSize: '0.75rem', lineHeight: '1.2', marginTop: '2px' }}>
                            {r.extra_capacity}
                          </div>
                        )}
                      </td>
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
