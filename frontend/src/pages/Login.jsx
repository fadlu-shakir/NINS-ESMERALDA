import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

const BrokerStampButton = ({ onClick }) => {
  const serratedPoints = "26.0,0.5 30.8,3.2 35.5,0.5 40.2,3.2 45.0,0.5 49.8,3.2 54.5,0.5 59.2,3.2 64.0,0.5 68.8,3.2 73.5,0.5 78.2,3.2 83.0,0.5 87.8,3.2 92.5,0.5 97.2,3.2 102.0,0.5 106.8,3.2 111.5,0.5 116.2,3.2 121.0,0.5 125.8,3.2 130.5,0.5 135.2,3.2 140.0,0.5 144.8,3.2 149.5,0.5 154.2,3.2 159.0,0.5 163.8,3.2 168.5,0.5 173.2,3.2 178.0,0.5 182.8,3.2 187.5,0.5 192.2,3.2 197.0,0.5 201.8,3.2 206.5,0.5 211.2,3.2 216.0,0.5 220.8,3.2 225.5,0.5 230.2,3.2 235.0,0.5 239.8,3.2 244.5,0.5 249.2,3.2 254.0,0.0 258.0,3.5 262.9,1.6 265.4,6.3 270.7,6.1 271.5,11.3 276.5,13.0 275.4,18.2 279.6,21.5 276.8,26.0 279.6,30.5 275.4,33.8 276.5,39.0 271.5,40.7 270.7,45.9 265.4,45.7 262.9,50.4 258.0,48.5 254.0,51.5 249.2,48.8 244.5,51.5 239.8,48.8 235.0,51.5 230.2,48.8 225.5,51.5 220.8,48.8 216.0,51.5 211.2,48.8 206.5,51.5 201.8,48.8 197.0,51.5 192.2,48.8 187.5,51.5 182.8,48.8 178.0,51.5 173.2,48.8 168.5,51.5 163.8,48.8 159.0,51.5 154.2,48.8 149.5,51.5 144.8,48.8 140.0,51.5 135.2,48.8 130.5,51.5 125.8,48.8 121.0,51.5 116.2,48.8 111.5,51.5 106.8,48.8 102.0,51.5 97.2,48.8 92.5,51.5 87.8,48.8 83.0,51.5 78.2,48.8 73.5,51.5 68.8,48.8 64.0,51.5 59.2,48.8 54.5,51.5 49.8,48.8 45.0,51.5 40.2,48.8 35.5,51.5 30.8,48.8 26.0,52.0 22.0,48.5 17.1,50.4 14.6,45.7 9.3,45.9 8.5,40.7 3.5,39.0 4.6,33.8 0.4,30.5 3.2,26.0 0.4,21.5 4.6,18.2 3.5,13.0 8.5,11.3 9.3,6.1 14.6,6.3 17.1,1.6 22.0,3.5";

  return (
    <button
      type="button"
      onClick={onClick}
      className="vintage-broker-stamp-btn"
      title="Broker Partner Access - Esmeralda Boutique Resort"
      aria-label="Broker Partner Access"
    >
      <div className="vintage-stamp-wrapper">
        <svg 
          className="vintage-stamp-svg" 
          viewBox="0 0 280 52" 
          width="280" 
          height="52"
        >
          <polygon
            points={serratedPoints}
            fill="#ffffff"
            stroke="#9ca3af"
            strokeWidth="0.8"
          />
        </svg>

        <div className="vintage-stamp-inner">
          <div className="vintage-stamp-text-area">
            <span className="vintage-stamp-title">
              Esmeralda Boutique Resort
            </span>
          </div>
          <div className="vintage-stamp-arrow-area">
            <i className="fas fa-arrow-right"></i>
          </div>
        </div>
      </div>
    </button>
  );
};

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const isBrokerInvite = new URLSearchParams(location.search).get('invite') === 'broker';
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    if (isLogin) {
      const success = await login(username, password);
      setIsSubmitting(false);
      if (success) {
         const userStr = localStorage.getItem('user');
         if (userStr) {
             const usr = JSON.parse(userStr);
             if (usr.profile?.is_broker) {
                 navigate(usr.profile.is_broker_verified ? '/broker-dashboard' : '/broker-pending');
                 return;
             }
         }
         navigate('/');
      }
    }
  };

  const toggleAuthMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? '/login' : '/register', { replace: true });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      
      const res = await api.post('users/google-login/', { 
        token: credentialResponse.credential,
        is_broker: isBrokerInvite
      });

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user?.profile?.is_broker) {
          toast.success('Logged in as Broker successfully!');
          navigate(res.data.user.profile.is_broker_verified ? '/broker-dashboard' : '/broker-pending');
      } else {
          toast.success('Logged in with Google successfully!');
          navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Google login failed.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container py-5" style={{ marginTop: '50px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card auth-card shadow-lg border-0 overflow-hidden">
              <div className="row g-0">
                {/* Left Side: Photo with Vintage Stamp Broker Button at bottom */}
                <div className="col-md-5 d-none d-md-block position-relative">
                  <div 
                    className="auth-image h-100" 
                    style={{ 
                      backgroundImage: `url(/resort_img/${isLogin ? '4' : '5'}.jpeg)`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center', 
                      transition: 'background-image 0.5s ease-in-out',
                      position: 'relative',
                      minHeight: '480px'
                    }}
                  >
                    {/* Dark gradient behind button for high readability */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        height: '140px', 
                        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 65%, transparent 100%)', 
                        pointerEvents: 'none' 
                      }} 
                    />

                    {/* Button placed at the bottom of the image on the left side */}
                    <div className="broker-stamp-bottom-container">
                      <BrokerStampButton onClick={() => navigate('/register?invite=broker')} />
                    </div>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="col-md-7 p-5">
                  <div className="text-center mb-4">
                    <h3 className="mb-3">{isLogin ? 'Welcome Back' : (isBrokerInvite ? 'Broker Login' : 'Create Account')}</h3>
                    <p className="text-muted">{isLogin ? 'Sign in to manage your bookings' : (isBrokerInvite ? 'Join our broker network securely using Google' : 'Join us to experience luxury using Google')}</p>
                  </div>
                  
                  {isLogin ? (
                    <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
                      <div className="mb-3">
                        <label className="form-label text-muted small fw-bold text-uppercase">Username</label>
                        <input 
                          type="text" 
                          className="form-control bg-light form-control-lg border-0" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          required 
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label text-muted small fw-bold text-uppercase">Password</label>
                        <input 
                          type="password" 
                          className="form-control bg-light form-control-lg border-0" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>

                      <button type="submit" disabled={isSubmitting} className="btn btn-primary-modern w-100 py-3 text-uppercase fw-bold mt-2" style={{ transition: 'all 0.3s' }}>
                        {isSubmitting ? 'Logging in...' : 'Sign In'}
                      </button>

                      <div className="mt-4">
                        <div className="d-flex align-items-center mb-3">
                          <hr className="flex-grow-1" />
                          <span className="px-3 text-muted small fw-bold text-uppercase">Or continue with</span>
                          <hr className="flex-grow-1" />
                        </div>
                        <div className="d-flex justify-content-center">
                          <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error('Google Login Failed')}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                          />
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="animate__animated animate__fadeIn text-center">
                      <p className="mb-4 text-muted">
                        {isBrokerInvite 
                          ? "You are registering as a broker. You can now securely create an account using your Google account in one click!"
                          : "We have simplified registration. You can now securely create an account using your Google account in one click!"}
                      </p>
                      <div className="d-flex justify-content-center my-4">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => toast.error('Google Registration Failed')}
                          theme="filled_black"
                          shape="pill"
                          size="large"
                          text="signup_with"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mt-4 text-muted position-relative">
                    {isLogin ? (
                      <>Don't have an account? <span onClick={toggleAuthMode} className="text-accent fw-bold text-decoration-none" style={{ cursor: 'pointer' }}>Register Now</span></>
                    ) : (
                      <>Already have an account? <span onClick={toggleAuthMode} className="text-accent fw-bold text-decoration-none" style={{ cursor: 'pointer' }}>Login</span></>
                    )}
                  </div>

                  {/* Mobile broker stamp button */}
                  <div className="d-md-none text-center mt-4 pt-2">
                    <BrokerStampButton onClick={() => navigate('/register?invite=broker')} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped CSS for the Vintage Scalloped Stamp Button */}
      <style>{`
        .vintage-broker-stamp-btn {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          display: inline-block;
          opacity: 0.45;
          transition: opacity 0.3s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.25));
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          outline: none;
        }
        .vintage-broker-stamp-btn:hover {
          opacity: 0.85;
          transform: translateY(-2px) scale(1.03);
          filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.35));
        }
        .vintage-broker-stamp-btn:active {
          transform: translateY(1px) scale(0.98);
        }
        .vintage-stamp-wrapper {
          position: relative;
          width: 280px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .vintage-stamp-svg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .vintage-stamp-inner {
          position: absolute;
          top: 5px;
          left: 6px;
          right: 6px;
          bottom: 5px;
          border-radius: 22px;
          border: 2px solid #4b5563;
          display: flex;
          overflow: hidden;
          z-index: 1;
          background: #ffffff;
        }
        .vintage-stamp-text-area {
          flex: 1;
          background: repeating-linear-gradient(
            to bottom,
            #ffffff,
            #ffffff 3px,
            #f3f4f6 3px,
            #f3f4f6 4.5px
          );
          display: flex;
          align-items: center;
          justify-content: center;
          padding-left: 12px;
          padding-right: 8px;
        }
        .vintage-stamp-title {
          font-family: 'Dancing Script', 'Pacifico', cursive;
          font-size: 1.15rem;
          font-weight: 700;
          color: #1f2937;
          white-space: nowrap;
          letter-spacing: 0.2px;
        }
        .vintage-stamp-arrow-area {
          width: 44px;
          background-color: #4b5563;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 0.95rem;
          border-top-right-radius: 19px;
          border-bottom-right-radius: 19px;
        }
        .vintage-stamp-arrow-area i {
          transition: transform 0.2s ease;
        }
        .vintage-broker-stamp-btn:hover .vintage-stamp-arrow-area i {
          transform: translateX(3px);
        }
        .broker-stamp-bottom-container {
          position: absolute;
          bottom: 22px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 10px;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
