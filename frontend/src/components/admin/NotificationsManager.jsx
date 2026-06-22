import { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const NotificationsManager = () => {
  const [formData, setFormData] = useState({ title: '', message: '', is_broadcast: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('notifications/', formData);
      toast.success('Notification sent to all users!');
      setFormData({ title: '', message: '', is_broadcast: true });
    } catch (error) {
      toast.error('Failed to send notification.');
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4">
      <h4 className="fw-bold mb-4">Send Broadcast Notification</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label text-muted small fw-bold">Title</label>
          <input 
            type="text" 
            className="form-control" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            placeholder="e.g. Special Offer!"
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label text-muted small fw-bold">Message</label>
          <textarea 
            className="form-control" 
            rows="4"
            value={formData.message} 
            onChange={(e) => setFormData({...formData, message: e.target.value})} 
            placeholder="Enter the notification message for all users..."
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary-modern px-5 py-2">
          <i className="fas fa-paper-plane me-2"></i> Send to All Users
        </button>
      </form>
    </div>
  );
};

export default NotificationsManager;
