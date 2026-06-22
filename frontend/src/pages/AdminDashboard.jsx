import { useState } from 'react';
import BookingsManager from '../components/admin/BookingsManager';
import BookingHistory from '../components/admin/BookingHistory';
import RoomsManager from '../components/admin/RoomsManager';
import CategoriesManager from '../components/admin/CategoriesManager';
import NotificationsManager from '../components/admin/NotificationsManager';
import UsersManager from '../components/admin/UsersManager';
import AdminManager from '../components/admin/AdminManager';
import GalleryManager from '../components/admin/GalleryManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="container py-5" style={{ marginTop: '70px' }}>
      <h2 className="mb-4 border-bottom pb-3">Admin Dashboard</h2>
      
      <div className="d-flex flex-wrap gap-2 mb-5 p-2 shadow-sm rounded-4" style={{ background: '#f8f9fa', border: '1px solid #eaeaea' }}>
        {[
          { id: 'bookings', label: 'Active Bookings' },
          { id: 'history', label: 'Booking History' },
          { id: 'rooms', label: 'Rooms' },
          { id: 'categories', label: 'Categories' },
          { id: 'gallery', label: 'Gallery' },
          { id: 'users', label: 'Users' },
          { id: 'admins', label: 'Admins' },
          { id: 'notifications', label: 'Notifications' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn rounded-pill px-4 py-2 fw-semibold ${
              activeTab === tab.id ? 'shadow text-white' : 'text-secondary'
            }`}
            style={{
              background: activeTab === tab.id ? 'linear-gradient(135deg, #3e3325 0%, #1c1917 100%)' : 'transparent',
              border: 'none',
              transition: 'all 0.3s ease',
              transform: activeTab === tab.id ? 'translateY(-1px)' : 'none'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) e.target.style.background = '#e9ecef';
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) e.target.style.background = 'transparent';
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && <BookingsManager />}
      {activeTab === 'history' && <BookingHistory />}
      {activeTab === 'rooms' && <RoomsManager />}
      {activeTab === 'categories' && <CategoriesManager />}
      {activeTab === 'gallery' && <GalleryManager />}
      {activeTab === 'users' && <UsersManager />}
      {activeTab === 'admins' && <AdminManager />}
      {activeTab === 'notifications' && <NotificationsManager />}
    </div>
  );
};

export default AdminDashboard;
