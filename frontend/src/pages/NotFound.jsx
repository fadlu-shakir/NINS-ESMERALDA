import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center" style={{ height: 'calc(100vh - 200px)', marginTop: '70px' }}>
      <div className="text-center">
        <h1 className="display-1 fw-bold text-gold font-secondary">404</h1>
        <h3 className="text-dark-blue mb-4">Page Not Found</h3>
        <p className="text-muted mb-4">The page you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/" className="btn btn-luxury px-4 py-2">Go to Homepage</Link>
      </div>
    </div>
  );
};

export default NotFound;
