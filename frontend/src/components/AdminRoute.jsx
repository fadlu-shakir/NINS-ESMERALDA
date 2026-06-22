import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-gold" role="status"></div>
      </div>
    );
  }

  return user && user.is_staff ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
