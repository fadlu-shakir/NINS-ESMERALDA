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
      <nav className="navbar navbar-expand-lg navbar-light bg-white mb-4 shadow-sm border-bottom sticky-top">
        <div className="container py-2">
          <div className="d-flex align-items-center">
            <div className="rounded bg-dark text-white d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
              <i className="bi bi-briefcase-fill fs-5"></i>
            </div>
            <div>
              <span className="navbar-brand fw-bold text-dark m-0 d-block lh-1" style={{ letterSpacing: '2px', fontFamily: 'var(--font-serif)' }}>NINS ESMERALDA</span>
              <small className="text-muted fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '2px' }}>BROKER PORTAL</small>
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
