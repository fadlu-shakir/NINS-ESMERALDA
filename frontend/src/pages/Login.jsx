import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific fields
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '', password_confirm: ''
  });

  // OTP specific states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const { login, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
    // Reset OTP states when switching modes
    setOtpSent(false);
    setOtpCode('');
  }, [location.pathname]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleRegisterChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const success = await login(username, password);
      if (success) navigate('/');
    } else {
      if (!otpSent) {
        // Step 1: Submit user registration data
        if (password !== formData.password_confirm) {
          toast.error('Passwords do not match');
          return;
        }
        try {
          const res = await api.post('users/register/', {
            username,
            password,
            ...formData
          });
          if (res.data.status === 'otp_sent') {
            setOtpSent(true);
            setResendCountdown(60);
            toast.success(res.data.message || 'OTP verification code sent to your email.');
          }
        } catch (error) {
          const errorMsg = error.response?.data?.detail || 
                           error.response?.data?.username?.[0] || 
                           error.response?.data?.email?.[0] || 
                           error.response?.data?.password?.[0] || 
                           error.response?.data?.non_field_errors?.[0] || 
                           'Registration failed. Please check your inputs.';
          toast.error(errorMsg);
        }
      } else {
        // Step 2: Verify OTP
        if (otpCode.length !== 6) {
          toast.error('Please enter a valid 6-digit OTP code.');
          return;
        }
        setIsVerifying(true);
        try {
          const res = await api.post('users/verify-otp/', {
            username,
            otp_code: otpCode
          });
          if (res.data.status === 'verified') {
            // Auto-login on verification
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));

            toast.success('Registration verified and logged in successfully!');
            navigate('/');
          }
        } catch (error) {
          toast.error(error.response?.data?.detail || 'Invalid or expired OTP code.');
        } finally {
          setIsVerifying(false);
        }
      }
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    try {
      const res = await api.post('users/resend-otp/', { username });
      if (res.data.status === 'otp_resent') {
        setResendCountdown(60);
        toast.success(res.data.message || 'A new OTP has been sent to your email.');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to resend OTP.');
    }
  };

  const handleBackToRegister = () => {
    setOtpSent(false);
    setOtpCode('');
  };

  const toggleAuthMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setOtpSent(false);
    setOtpCode('');
    navigate(newMode ? '/login' : '/register', { replace: true });
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
                    <h3 className="mb-3">{isLogin ? 'Welcome Back' : (otpSent ? 'Verify Email' : 'Create Account')}</h3>
                    <p className="text-muted">{isLogin ? 'Sign in to manage your bookings' : (otpSent ? `We sent a 6-digit verification code to ${formData.email}` : 'Join us to experience luxury')}</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="animate__animated animate__fadeIn">
                    {!isLogin && !otpSent && (
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <input type="text" name="first_name" className="form-control bg-light" placeholder="First Name" onChange={handleRegisterChange} required={!isLogin} />
                        </div>
                        <div className="col-md-6">
                          <input type="text" name="last_name" className="form-control bg-light" placeholder="Last Name" onChange={handleRegisterChange} required={!isLogin} />
                        </div>
                      </div>
                    )}
                    
                    {!otpSent && (
                      <div className="mb-3">
                        {isLogin && <label className="form-label text-muted small fw-bold text-uppercase">Username</label>}
                        <input 
                          type="text" 
                          className={`form-control bg-light ${isLogin ? 'form-control-lg border-0' : ''}`} 
                          placeholder={!isLogin ? "Username" : ""}
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          required 
                        />
                      </div>
                    )}
                    
                    {!isLogin && !otpSent && (
                      <div className="row g-3 mb-3">
                        <div className="col-12">
                          <input type="email" name="email" className="form-control bg-light" placeholder="Email Address" onChange={handleRegisterChange} required={!isLogin} />
                        </div>
                        <div className="col-12">
                          <input type="text" name="phone_number" className="form-control bg-light" placeholder="Phone Number" onChange={handleRegisterChange} required={!isLogin} />
                        </div>
                      </div>
                    )}

                    {!otpSent && (
                      <div className="mb-4">
                        {isLogin && <label className="form-label text-muted small fw-bold text-uppercase">Password</label>}
                        <input 
                          type="password" 
                          className={`form-control bg-light ${isLogin ? 'form-control-lg border-0' : ''}`} 
                          placeholder={!isLogin ? "Password" : ""}
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                    )}

                    {!isLogin && !otpSent && (
                      <div className="mb-4">
                        <input type="password" name="password_confirm" className="form-control bg-light" placeholder="Confirm Password" onChange={handleRegisterChange} required={!isLogin} />
                      </div>
                    )}

                    {otpSent && (
                      <div className="mb-4 text-center">
                        <label className="form-label text-muted small fw-bold text-uppercase d-block mb-3">
                          Enter 6-Digit OTP Code
                        </label>
                        <input 
                          type="text" 
                          maxLength="6"
                          className="form-control text-center bg-light fw-bold fs-4 tracking-widest py-3 border-0 rounded-3 shadow-sm" 
                          placeholder="0 0 0 0 0 0"
                          style={{ letterSpacing: '8px', fontSize: '24px' }}
                          value={otpCode} 
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                          required 
                        />
                      </div>
                    )}

                    <button type="submit" disabled={otpSent && isVerifying} className="btn btn-primary-modern w-100 py-3 text-uppercase fw-bold mt-2" style={{ transition: 'all 0.3s' }}>
                      {isLogin ? 'Sign In' : (otpSent ? (isVerifying ? 'Verifying...' : 'Verify & Sign In') : 'Register')}
                    </button>
                  </form>
                  
                  <div className="text-center mt-4 text-muted">
                    {isLogin ? (
                      <>Don't have an account? <span onClick={toggleAuthMode} className="text-accent fw-bold text-decoration-none" style={{ cursor: 'pointer' }}>Register Now</span></>
                    ) : (
                      otpSent ? (
                        <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                          <span 
                            onClick={handleBackToRegister} 
                            className="text-muted small fw-bold text-uppercase text-decoration-none" 
                            style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.target.style.color = '#111'}
                            onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                          >
                            ← Edit Details
                          </span>
                          {resendCountdown > 0 ? (
                            <span className="text-muted small fw-bold text-uppercase">
                              Resend in {resendCountdown}s
                            </span>
                          ) : (
                            <span 
                              onClick={handleResendOTP} 
                              className="text-accent small fw-bold text-uppercase text-decoration-none" 
                              style={{ cursor: 'pointer' }}
                            >
                              Resend OTP
                            </span>
                          )}
                        </div>
                      ) : (
                        <>Already have an account? <span onClick={toggleAuthMode} className="text-accent fw-bold text-decoration-none" style={{ cursor: 'pointer' }}>Login</span></>
                      )
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
