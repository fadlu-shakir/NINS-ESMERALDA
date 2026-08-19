import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function BrokerRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="d-flex justify-content-center py-5"><div className="spinner-border text-primary" role="status"></div></div>;
  }

  // Ensure user is broker and verified
  if (!user || !user.profile?.is_broker) {
    return <Navigate to="/login" />;
  }
  
  if (!user.profile.is_broker_verified) {
      return <Navigate to="/broker-pending" />;
  }

  return <Outlet />;
}

export default BrokerRoute;
