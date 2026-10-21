import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IoDiamondOutline, IoNotificationsOutline } from "react-icons/io5";
import api from '../services/api';
import brandIcon from '../../resort_img/diamond_icon_only.png';

const BrandLogo = ({ isMobile = false, isBroker = false }) => (
  <div className="d-flex align-items-center">
    <img 
      src={brandIcon || "/resort_img/diamond_icon_only.png"} 
      alt="Diamond Icon" 
      className="me-3" 
      style={{ 
        height: isMobile ? '35px' : '45px', 
        width: 'auto',
        objectFit: 'contain' 
      }} 
    />
    <div className="d-flex flex-column justify-content-center align-items-start text-start" style={{ color: 'inherit', marginTop: '2px' }}>
      <span style={{ fontSize: isMobile ? '0.45rem' : '0.55rem', letterSpacing: '0.3em', lineHeight: '1', fontWeight: '600' }}>NINS</span>
      <span className="font-serif-luxury" style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', letterSpacing: '0.05em', lineHeight: '1', margin: '2px 0' }}>ESMERALDA</span>
      <div className="d-flex align-items-center gap-2">
        <span style={{ fontSize: isMobile ? '0.4rem' : '0.45rem', letterSpacing: '0.25em', lineHeight: '1', fontWeight: '500', opacity: 0.8 }}>BOUTIQUE RESORT</span>
        {isBroker && (
          <span className="badge bg-dark text-white text-uppercase" style={{ fontSize: '0.5rem', letterSpacing: '1px', padding: '2px 5px', borderRadius: '3px' }}>BROKER PORTAL</span>
        )}
      </div>
    </div>
  </div>
);

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  const userDropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const hamburgerRef = useRef(null);

  const isBroker = location.search.includes('invite=broker');
  const isHomePage = location.pathname === '/';
  const isTransparent = isHomePage && !isScrolled;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target)) {
        setShowHamburgerMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      if (window.bootstrap) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasNavbar);
        if (bsOffcanvas) {
          bsOffcanvas.hide();
          return;
        }
      }
      // Fallback if Bootstrap JS instance is unavailable
      offcanvasNavbar.classList.remove('show');
      const backdrop = document.querySelector('.offcanvas-backdrop');
      if (backdrop) backdrop.remove();
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${isTransparent ? 'transparent' : 'scrolled'}`}>
      <div className="container-fluid px-3 px-md-4">
        <Link className="navbar-brand p-0" to="/">
          <BrandLogo isBroker={isBroker} />
        </Link>
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#navbarNav" aria-controls="navbarNav">
          <i className={`fas fa-bars fs-4 ${!isTransparent ? 'text-dark' : 'text-white'}`}></i>
        </button>

        <div className="offcanvas-lg offcanvas-end flex-grow-1" tabIndex="-1" id="navbarNav" aria-labelledby="offcanvasNavbarLabel">
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title m-0" id="offcanvasNavbarLabel">
              <BrandLogo isMobile={true} isBroker={isBroker} />
            </h5>
            <button type="button" className="btn-close shadow-none" onClick={closeNavbar} aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <a className="nav-link" href="/#" onClick={closeNavbar}>Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/#gallery" onClick={closeNavbar}>Gallery</a>
            </li>
            <li className="nav-item nav-item-has-megamenu">
              <a className="nav-link" href="/#rooms" onClick={closeNavbar}>Rooms & Suites <i className="fas fa-chevron-down ms-1 x-small" style={{ fontSize: '0.65rem' }}></i></a>
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
                <li className="nav-item me-3 position-relative" ref={notificationsRef}>
                  <button
                    className="btn btn-link nav-link p-0 position-relative shadow-none border-0"
                    onClick={() => {
                      setShowUserDropdown(false);
                      if (showNotifications) {
                        setShowNotifications(false);
                      } else {
                        fetchNotifications();
                      }
                    }}
                    type="button"
                    aria-label="Notifications"
                  >
                    <IoNotificationsOutline size={24} className="notification-icon" />
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
                        <button className="btn btn-sm btn-link text-muted p-0 shadow-none border-0" onClick={() => setShowNotifications(false)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                      <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length > 0 ? (
                          notifications.map(n => (
                            <div key={n.id} className={`p-3 border-bottom notification-item ${!n.is_read ? 'unread bg-light' : ''}`}>
                              <div className="d-flex justify-content-between align-items-start mb-1">
                                <span className="fw-bold small">{n.title}</span>
                                {!n.is_read && <button className="btn btn-sm btn-link p-0 text-accent x-small fw-bold shadow-none" onClick={() => markAsRead(n.id)}>Mark as read</button>}
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

                {/* User Dropdown */}
                <li className="nav-item position-relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    className="btn nav-link d-flex align-items-center gap-2 border-0 bg-transparent text-reset p-1 shadow-none"
                    onClick={() => {
                      setShowNotifications(false);
                      setShowUserDropdown(prev => !prev);
                    }}
                    aria-expanded={showUserDropdown}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src="/resort_img/icon.png"
                      alt={user.username}
                      className="rounded-circle shadow-sm"
                      style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                    />
                    <span className="fw-semibold">{user.username}</span>
                    <i 
                      className="fas fa-chevron-down ms-1" 
                      style={{ 
                        fontSize: '0.65rem',
                        transform: showUserDropdown ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease'
                      }}
                    ></i>
                  </button>

                  {showUserDropdown && (
                    <div className="navbar-user-dropdown-menu animate__animated animate__fadeIn">
                      {user.is_staff && (
                        <Link 
                          className="dropdown-item py-2 px-3 fw-medium d-flex align-items-center" 
                          to="/admin" 
                          onClick={() => { setShowUserDropdown(false); closeNavbar(); }}
                        >
                          <i className="fas fa-cog me-2 text-accent"></i>Admin Dashboard
                        </Link>
                      )}
                      <Link 
                        className="dropdown-item py-2 px-3 fw-medium d-flex align-items-center" 
                        to="/dashboard" 
                        onClick={() => { setShowUserDropdown(false); closeNavbar(); }}
                      >
                        <i className="fas fa-tachometer-alt me-2 text-accent"></i>Dashboard
                      </Link>
                      <hr className="dropdown-divider my-1" />
                      <button 
                        type="button"
                        className="dropdown-item py-2 px-3 text-danger fw-medium d-flex align-items-center w-100 text-start bg-transparent border-0" 
                        onClick={() => { setShowUserDropdown(false); handleLogout(); closeNavbar(); }}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>Logout
                      </button>
                    </div>
                  )}
                </li>
              </>
            ) : (
              <li className="nav-item ms-lg-2 position-relative" ref={hamburgerRef}>
                {/* Desktop Hamburger Button */}
                <button 
                  type="button"
                  className="btn-navbar-hamburger d-none d-lg-inline-flex" 
                  onClick={() => {
                    setShowNotifications(false);
                    setShowUserDropdown(false);
                    setShowHamburgerMenu(prev => !prev);
                  }}
                  aria-expanded={showHamburgerMenu}
                  aria-label="Menu"
                >
                  <i className={`fas ${showHamburgerMenu ? 'fa-times' : 'fa-bars'}`}></i>
                </button>

                {/* Luxury Dropdown Menu for Desktop */}
                {showHamburgerMenu && (
                  <div className="navbar-hamburger-dropdown shadow-lg animate__animated animate__fadeIn">
                    <div className="dropdown-header-custom px-3 pt-3 pb-2">
                      <span className="text-uppercase letter-spacing-2 text-muted fw-bold" style={{ fontSize: '0.68rem' }}>Guest Access</span>
                    </div>

                    <div className="px-3 pb-2">
                      <Link 
                        to="/login" 
                        className="btn btn-dark w-100 rounded-pill py-2 px-3 fw-bold d-flex align-items-center justify-content-center gap-2 mb-2 shadow-sm text-white"
                        style={{ fontSize: '0.85rem' }}
                        onClick={() => { setShowHamburgerMenu(false); closeNavbar(); }}
                      >
                        <i className="fas fa-user-circle fs-5"></i>
                        <span>Login / Register</span>
                      </Link>
                      <Link 
                        to="/login?invite=broker" 
                        className="btn btn-outline-dark w-100 rounded-pill py-2 px-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                        style={{ fontSize: '0.85rem' }}
                        onClick={() => { setShowHamburgerMenu(false); closeNavbar(); }}
                      >
                        <i className="fas fa-briefcase"></i>
                        <span>Broker Portal</span>
                      </Link>
                    </div>

                    <div className="dropdown-divider my-1"></div>

                    <div className="px-3 pt-2 pb-1">
                      <span className="text-uppercase letter-spacing-2 text-muted fw-bold" style={{ fontSize: '0.68rem' }}>Quick Navigation</span>
                    </div>

                    <div className="px-2 pb-2">
                      <a 
                        href="/#rooms" 
                        className="dropdown-item py-2 px-3 rounded-2 fw-medium d-flex align-items-center gap-2"
                        onClick={() => { setShowHamburgerMenu(false); closeNavbar(); }}
                      >
                        <i className="fas fa-door-open text-muted" style={{ width: '16px' }}></i>
                        <span>Rooms & Suites</span>
                      </a>
                      <a 
                        href="/#gallery" 
                        className="dropdown-item py-2 px-3 rounded-2 fw-medium d-flex align-items-center gap-2"
                        onClick={() => { setShowHamburgerMenu(false); closeNavbar(); }}
                      >
                        <i className="fas fa-images text-muted" style={{ width: '16px' }}></i>
                        <span>Photo Gallery</span>
                      </a>
                      <a 
                        href="/#about" 
                        className="dropdown-item py-2 px-3 rounded-2 fw-medium d-flex align-items-center gap-2"
                        onClick={() => { setShowHamburgerMenu(false); closeNavbar(); }}
                      >
                        <i className="fas fa-hotel text-muted" style={{ width: '16px' }}></i>
                        <span>About Resort</span>
                      </a>
                      <a 
                        href="/#reviews" 
                        className="dropdown-item py-2 px-3 rounded-2 fw-medium d-flex align-items-center gap-2"
                        onClick={() => { setShowHamburgerMenu(false); closeNavbar(); }}
                      >
                        <i className="fas fa-star text-muted" style={{ width: '16px' }}></i>
                        <span>Guest Reviews</span>
                      </a>
                    </div>

                    <div className="dropdown-divider my-1"></div>

                    <div className="p-2">
                      <a 
                        href="https://wa.me/918138011207" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="d-flex align-items-center gap-2 p-2 px-3 rounded-3 text-decoration-none"
                        style={{ backgroundColor: '#e6f7ef', color: '#107c41', fontSize: '0.8rem', fontWeight: '600' }}
                        onClick={() => { setShowHamburgerMenu(false); closeNavbar(); }}
                      >
                        <i className="fab fa-whatsapp fs-5"></i>
                        <span>Direct WhatsApp Desk</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Mobile View inside Offcanvas Drawer */}
                <div className="d-lg-none mt-3 pt-3 border-top w-100">
                  <Link 
                    to="/login" 
                    className="btn btn-dark w-100 rounded-pill py-2 mb-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm text-white"
                    onClick={closeNavbar}
                  >
                    <i className="fas fa-user-circle fs-5"></i>
                    <span>Login / Register</span>
                  </Link>
                  <Link 
                    to="/login?invite=broker" 
                    className="btn btn-outline-dark w-100 rounded-pill py-2 fw-medium d-flex align-items-center justify-content-center gap-2"
                    onClick={closeNavbar}
                  >
                    <i className="fas fa-briefcase"></i>
                    <span>Broker Portal</span>
                  </Link>
                </div>
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
