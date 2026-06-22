import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('users/list/');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  // Removed early return to prevent layout shift

  const filteredUsers = users.filter(u => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchUsername = (u.username || '').toLowerCase().includes(term);
    const matchEmail = (u.email || '').toLowerCase().includes(term);
    const matchPhone = (u.phone_number || '').toLowerCase().includes(term);
    const matchName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase().includes(term);
    return matchUsername || matchEmail || matchPhone || matchName;
  });

  return (
    <div className="card shadow border-0">
      <div className="card-body">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <h5 className="card-title mb-0">Registered Users</h5>
          <div className="search-box position-relative" style={{ minWidth: '300px' }}>
            <i className="bi bi-search position-absolute text-muted" style={{ top: '10px', left: '15px' }}></i>
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-light border-0" 
              placeholder="Search by name, email, phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-5"><div className="spinner-border text-primary-modern"></div><div className="mt-2 text-muted small">Loading users...</div></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No users found.</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id}>
                  <td><strong>#{u.id}</strong></td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phone_number || '-'}</td>
                  <td>{u.first_name || '-'}</td>
                  <td>{u.last_name || '-'}</td>
                  <td>
                    {u.is_staff ? (
                      <span className="badge bg-accent px-3 py-2">Admin / Staff</span>
                    ) : (
                      <span className="badge bg-secondary px-3 py-2">Customer</span>
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

export default UsersManager;
