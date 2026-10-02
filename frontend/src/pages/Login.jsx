import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  
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
      
      const urlParams = new URLSearchParams(window.location.search);
      const isBrokerInvite = urlParams.get('invite') === 'broker';

      const res = await api.post('users/google-login/', { 
        token: credentialResponse.credential,
        is_broker: isBrokerInvite
      });

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Logged in with Google successfully!');
      
      if (res.data.user?.profile?.is_broker) {
          navigate(res.data.user.profile.is_broker_verified ? '/broker-dashboard' : '/broker-pending');
      } else {
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
            <div className="card auth-card shadow-lg border-0">
              <div className="row g-0">
                <div className="col-md-5 d-none d-md-block">
                  <div className="auth-image h-100" style={{ backgroundImage: `url(/resort_img/${isLogin ? '4' : '5'}.jpeg)`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image 0.5s ease-in-out' }}></div>
                </div>
                <div className="col-md-7 p-5">
                  <div className="text-center mb-4">
                    <h3 className="mb-3">{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
                    <p className="text-muted">{isLogin ? 'Sign in to manage your bookings' : 'Join us to experience luxury using Google'}</p>
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
                      <p className="mb-4 text-muted">We have simplified registration. You can now securely create an account using your Google account in one click!</p>
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
                    
                    {!isLogin && (
                       <span 
                         onClick={() => navigate('/register?invite=broker')}
                         style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.10, cursor: 'pointer', padding: '10px', fontSize: '10px', userSelect: 'none' }}
                         title="b"
                       >
                         b
                       </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
