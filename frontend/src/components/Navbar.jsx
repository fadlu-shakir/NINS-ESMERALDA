import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IoDiamondOutline, IoNotificationsOutline } from "react-icons/io5";
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    fetchCategories();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('rooms/categories/');
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('notifications/unread_count/');
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('notifications/?active_only=true');
      setNotifications(res.data);
      setShowNotifications(true);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`notifications/${id}/mark_as_read/`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeNavbar = () => {
    const offcanvasNavbar = document.getElementById('navbarNav');
    if (offcanvasNavbar && offcanvasNavbar.classList.contains('show')) {
      const offcanvasCloseBtn = offcanvasNavbar.querySelector('.btn-close');
      if (offcanvasCloseBtn) offcanvasCloseBtn.click();
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${isTransparent ? 'transparent' : 'scrolled'}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <IoDiamondOutline className="me-2 text-accent" />
          ESMERALDA BOUTIQUE RESORT
        </Link>
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#navbarNav" aria-controls="navbarNav">
          <i className="fas fa-bars text-white fs-4"></i>
        </button>

        <div className="offcanvas offcanvas-start" tabIndex="-1" id="navbarNav" aria-labelledby="offcanvasNavbarLabel" style={{ width: '300px' }}>
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title d-flex align-items-center fw-bold text-dark m-0" id="offcanvasNavbarLabel">
              <IoDiamondOutline className="me-2 text-accent fs-4" /> ESMERALDA
            </h5>
            <button type="button" className="btn-close shadow-none" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <a className="nav-link" href="/#" onClick={closeNavbar}>Home</a>
            </li>
            <li className="nav-item nav-item-has-megamenu">
              <a className="nav-link" href="/#rooms" onClick={closeNavbar}>Rooms & Suites <i className="fas fa-chevron-down ms-1 x-small" style={{ fontSize: '0.65rem' }}></i></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#gallery" onClick={closeNavbar}>Gallery</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#about" onClick={closeNavbar}>About Us</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#reviews" onClick={closeNavbar}>Reviews</a>
            </li>

            {user ? (
              <>
                {/* Notifications Bell */}
                <li className="nav-item me-3 position-relative">
                  <button
                    className="btn btn-link nav-link p-0 position-relative"
                    onClick={fetchNotifications}
                  >
                    <IoNotificationsOutline size={24} className={!isTransparent ? "text-dark" : "text-white"} style={{ filter: isTransparent ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' : 'none' }} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="notification-dropdown shadow-lg bg-white rounded-3 p-0 animate__animated animate__fadeIn">
                      <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light rounded-top-3">
                        <h6 className="mb-0 fw-bold">Notifications</h6>
                        <button className="btn btn-sm btn-link text-muted p-0" onClick={() => setShowNotifications(false)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div key={n.id} className={`p-3 border-bottom notification-item ${!n.is_read ? 'unread bg-light' : ''}`}>
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="fw-bold small">{n.title}</span>
                                {!n.is_read && <button className="btn btn-sm btn-link p-0 text-accent x-small fw-bold" onClick={() => markAsRead(n.id)}>Mark as read</button>}
                              </div>
                              <p className="small text-muted mb-0">{n.message}</p>
                              <small className="x-small text-muted-50">{new Date(n.created_at).toLocaleDateString()}</small>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted small">No notifications</div>
                        )}
                      </div>
                    </div>
                  )}
                </li>

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                    <img
                      src="https://i1-c.pinimg.com/736x/93/1d/17/931d176cf12d85d1943d76684de79137.jpg"
                      alt={user.username}
                      className="rounded-circle me-1.5"
                      style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                    />
                    {user.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                    {user.is_staff && (
                      <li><Link className="dropdown-item" to="/admin" onClick={closeNavbar}><i className="fas fa-cog me-2"></i>Admin Dashboard</Link></li>
                    )}
                    <li><Link className="dropdown-item" to="/dashboard" onClick={closeNavbar}><i className="fas fa-tachometer-alt me-2"></i>Dashboard</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-danger" onClick={() => { handleLogout(); closeNavbar(); }}><i className="fas fa-sign-out-alt me-2"></i>Logout</button></li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={closeNavbar}>Login / Register</Link>
              </li>
            )}
          </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
