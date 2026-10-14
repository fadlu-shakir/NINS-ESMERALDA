import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function BrokerPending() {
  const { user } = useContext(AuthContext);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="bg-light min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom sticky-top mb-0">
        <div className="container py-2">
          <div className="d-flex align-items-center">
            <img 
              src="/resort_img/diamond_icon_only.png" 
              alt="Diamond Icon" 
              className="me-3" 
              style={{ 
                height: '42px', 
                width: 'auto',
                objectFit: 'contain' 
              }} 
            />
            <div className="d-flex flex-column justify-content-center align-items-start text-start" style={{ color: '#111827', marginTop: '2px' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '0.3em', lineHeight: '1', fontWeight: '600' }}>NINS</span>
              <span className="font-serif-luxury" style={{ fontSize: '1.45rem', letterSpacing: '0.05em', lineHeight: '1', margin: '2px 0' }}>ESMERALDA</span>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: '0.42rem', letterSpacing: '0.25em', lineHeight: '1', fontWeight: '500', opacity: 0.8 }}>BOUTIQUE RESORT</span>
                <span className="badge bg-dark text-white text-uppercase" style={{ fontSize: '0.55rem', letterSpacing: '1px', padding: '2px 6px', borderRadius: '4px' }}>BROKER PORTAL</span>
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center">
             <div className="d-none d-md-block me-3 text-end border-end pe-3">
               <span className="d-block fw-bold text-dark lh-1 mb-1">Broker Partner</span>
               <small className="text-muted">Pending Verification</small>
             </div>
            <button className="btn btn-dark rounded-pill px-4 shadow-sm" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Sub-bar below navbar: 20% TAC per Bookings */}
      <div 
        className="broker-tac-subbar py-2 text-center border-bottom shadow-sm mb-4" 
        style={{ 
          background: 'linear-gradient(90deg, #f9fafb 0%, #ffffff 50%, #f9fafb 100%)', 
          borderTop: '1px solid #f3f4f6',
          letterSpacing: '0.8px',
          fontSize: '0.92rem',
          fontWeight: '600',
          color: '#1f2937'
        }}
      >
        <div className="container d-flex align-items-center justify-content-center gap-2">
          <span className="badge bg-dark text-white" style={{ fontSize: '0.72rem', letterSpacing: '1px', padding: '3px 8px' }}>COMMISSION</span>
          <span>20% TAC per Bookings</span>
        </div>
      </div>
      <div className="container py-5 text-center">
        <div className="card shadow border-0 p-5 mx-auto" style={{ maxWidth: '600px', marginTop: '100px' }}>
          <i className="bi bi-hourglass-split display-1 text-warning mb-4"></i>
          <h2 className="mb-3">Verification Pending</h2>
          <p className="lead text-muted mb-4">
            Hello {user?.first_name || user?.username}, your broker account is currently under review by our administrators.
          </p>
          <p className="mb-4">
            You will gain access to the Broker Dashboard as soon as your account is verified. 
            If you believe this is taking too long, please contact support.
          </p>
          <button onClick={handleLogout} className="btn btn-outline-secondary px-4 py-2">Return to Login</button>
        </div>
      </div>
    </div>
  );
}

export default BrokerPending;
