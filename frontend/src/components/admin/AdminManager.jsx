import { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const AdminManager = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await api.post('users/verify-password/', { password });
      setIsVerified(true);
      toast.success('Access granted.');
      fetchUsers();
    } catch (error) {
      toast.error('Incorrect password. Access denied.');
    } finally {
      setVerifying(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('users/list/');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, isStaff) => {
    if (userId === currentUser?.id) {
      toast.warning('You cannot change your own admin status.');
      return;
    }
    
    const action = isStaff ? 'remove admin privileges from' : 'grant admin privileges to';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await api.post(`users/${userId}/toggle-admin/`);
      toast.success('Admin status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update admin status');
    }
  };

  if (!isVerified) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ maxWidth: '450px', width: '100%' }}>
          <div className="bg-dark p-4 text-center text-white position-relative">
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25" style={{ background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}></div>
            <i className="fas fa-lock fs-1 mb-3 position-relative z-1 text-accent"></i>
            <h4 className="fw-bold position-relative z-1">Restricted Area</h4>
            <p className="small text-white-50 mb-0 position-relative z-1">Please verify your password to manage administrators.</p>
          </div>
          <div className="card-body p-4 p-md-5 bg-white">
            <form onSubmit={handleVerify}>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold">Admin Password</label>
                <input 
                  type="password" 
                  className="form-control form-control-lg bg-light border-0" 
                  placeholder="Enter your password..." 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary-modern w-100 py-3 d-flex justify-content-center align-items-center" disabled={verifying}>
                {verifying ? <div className="spinner-border spinner-border-sm me-2"></div> : <i className="fas fa-shield-alt me-2"></i>}
                {verifying ? 'Verifying...' : 'Verify & Unlock'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchUsername = (u.username || '').toLowerCase().includes(term);
    const matchEmail = (u.email || '').toLowerCase().includes(term);
    return matchUsername || matchEmail;
  });

  return (
    <div className="card shadow border-0 rounded-4 overflow-hidden">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 border-bottom pb-3">
          <div>
            <h4 className="fw-bold mb-1"><i className="fas fa-user-shield text-accent me-2"></i>Manage Administrators</h4>
            <p className="text-muted small mb-0">Promote or demote users. Admins have full access to this dashboard.</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="search-box position-relative" style={{ minWidth: '250px' }}>
              <i className="bi bi-search position-absolute text-muted" style={{ top: '10px', left: '15px' }}></i>
              <input 
                type="text" 
                className="form-control rounded-pill ps-5 bg-light border-0" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className="btn btn-outline-secondary rounded-pill px-4 shadow-sm" 
              onClick={() => {
                setIsVerified(false);
                setPassword('');
              }}
            >
              <i className="fas fa-lock me-2"></i> Done
            </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>User Details</th>
                <th>Contact</th>
                <th>Role</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary-modern"></div><div className="mt-2 text-muted small">Loading users...</div></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No users found.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} className={u.is_staff ? 'table-primary-subtle' : ''}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '40px', height: '40px' }}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold">{u.first_name} {u.last_name}</div>
                        <div className="small text-muted">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="small">{u.email}</div>
                    <div className="small text-muted">{u.phone_number || 'No phone'}</div>
                  </td>
                  <td>
                    {u.is_staff ? (
                      <span className="badge bg-primary text-white px-3 py-2 rounded-pill"><i className="fas fa-star me-1 text-warning"></i> Admin</span>
                    ) : (
                      <span className="badge bg-light text-dark border px-3 py-2 rounded-pill">User</span>
                    )}
                  </td>
                  <td className="text-end">
                    {u.id === currentUser?.id ? (
                      <span className="text-muted small fst-italic">Current User</span>
                    ) : u.is_staff ? (
                      <button className="btn btn-sm btn-outline-danger px-3 rounded-pill" onClick={() => handleToggleAdmin(u.id, u.is_staff)}>
                        <i className="fas fa-user-minus me-1"></i> Remove Admin
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline-success px-3 rounded-pill" onClick={() => handleToggleAdmin(u.id, u.is_staff)}>
                        <i className="fas fa-user-plus me-1"></i> Make Admin
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManager;
