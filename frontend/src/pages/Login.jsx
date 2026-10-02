import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

const AuthPage = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const urlParams = new URLSearchParams(location.search);
  const isBrokerInvite = urlParams.get('invite') === 'broker';

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      const res = await api.post('users/google-login/', { token: credentialResponse.credential });
      
      // Check if they came from a broker invite URL
      if (isBrokerInvite && !res.data.user?.profile?.is_broker) {
          // If needed, we can update them to a broker here via an API call in the future
      }

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
              <div className="row g-0" style={{ minHeight: '500px' }}>
                <div className="col-md-5 d-none d-md-block">
                  <div className="auth-image h-100" style={{ backgroundImage: `url(/resort_img/4.jpeg)`, backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '0.375rem', borderBottomLeftRadius: '0.375rem' }}></div>
                </div>
                <div className="col-md-7 p-5 d-flex flex-column justify-content-center align-items-center">
                  <div className="text-center mb-5 w-100">
                    <h3 className="mb-3 fw-bold text-dark">Welcome to Smart Resort</h3>
                    <p className="text-muted">Sign in with Google to continue</p>
                  </div>
                  
                  <div className="d-flex justify-content-center mb-4 w-100">
                    {isSubmitting ? (
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            toast.error('Google Login Failed');
                          }}
                          theme="filled_black"
                          shape="pill"
                          size="large"
                          text="continue_with"
                        />
                    )}
                  </div>
                  
                  <div className="text-center mt-auto text-muted small position-relative w-100 pt-5">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                    <span 
                         onClick={() => navigate('/login?invite=broker')}
                         style={{ position: 'absolute', right: '-35px', bottom: '-40px', opacity: 0.10, cursor: 'pointer', padding: '10px', fontSize: '10px', userSelect: 'none' }}
                         title="b"
                       >
                         b
                       </span>
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
