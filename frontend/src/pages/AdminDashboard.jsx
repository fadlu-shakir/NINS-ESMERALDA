import { useState } from 'react';
import BookingsManager from '../components/admin/BookingsManager';
import BookingHistory from '../components/admin/BookingHistory';
import RoomsManager from '../components/admin/RoomsManager';
import CategoriesManager from '../components/admin/CategoriesManager';
import NotificationsManager from '../components/admin/NotificationsManager';
import GalleryManager from '../components/admin/GalleryManager';
import NewBookingNotification from '../components/admin/NewBookingNotification';
import AvailabilityManager from '../components/admin/AvailabilityManager';
import AnalyticsManager from '../components/admin/AnalyticsManager';
import UsersManager from '../components/admin/UsersManager';
import AdminManager from '../components/admin/AdminManager';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="container py-5" style={{ marginTop: '70px' }}>
      <NewBookingNotification />
      <h2 className="mb-4 border-bottom pb-3">Admin Dashboard</h2>
      
      <div className="position-relative mb-5" style={{ zIndex: 10 }}>
        <div 
          className="d-flex align-items-center gap-3 overflow-auto py-3 px-4 shadow-sm"
          style={{ 
            background: 'rgba(255, 255, 255, 0.65)', 
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '100px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none'  // IE/Edge
          }}
        >
          <style>{`
            .d-flex::-webkit-scrollbar { display: none; }
          `}</style>
          
          {[
            { id: 'analytics', label: 'Analytics', icon: 'fa-chart-pie' },
            { id: 'bookings', label: 'Active', icon: 'fa-calendar-check' },
            { id: 'history', label: 'History', icon: 'fa-history' },
            { id: 'categories', label: 'Categories', icon: 'fa-layer-group' },
            { id: 'rooms', label: 'Rooms', icon: 'fa-door-open' },
            { id: 'availability', label: 'Availability', icon: 'fa-calendar-times' },
            { id: 'gallery', label: 'Gallery', icon: 'fa-images' },
            { id: 'users', label: 'Users', icon: 'fa-users' },
            { id: 'admins', label: 'Admins', icon: 'fa-user-shield' },
            { id: 'notifications', label: 'Alerts', icon: 'fa-bell' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn d-flex align-items-center gap-2 rounded-pill px-4 py-2 fw-bold text-nowrap ${
                activeTab === tab.id ? 'shadow text-white' : 'text-secondary'
              }`}
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #111827 0%, #374151 100%)' : 'transparent',
                border: 'none',
                letterSpacing: '0.5px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: activeTab === tab.id ? 'translateY(-2px)' : 'none'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.color = '#111827';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6c757d'; // secondary text
                }
              }}
            >
              <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-white' : 'opacity-75'}`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      { activeTab === 'bookings' && <BookingsManager /> }
      { activeTab === 'history' && <BookingHistory /> }
      { activeTab === 'analytics' && <AnalyticsManager /> }
    
      { activeTab === 'categories' && <CategoriesManager /> }
      { activeTab === 'rooms' && <RoomsManager /> }
      { activeTab === 'availability' && <AvailabilityManager /> }
      
      { activeTab === 'gallery' && <GalleryManager /> }
      { activeTab === 'users' && <UsersManager /> }
      { activeTab === 'admins' && <AdminManager /> }
      { activeTab === 'notifications' && <NotificationsManager /> }
    </div>
  );
};

export default AdminDashboard;
