import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

function BrokersManager() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    try {
      const res = await api.get('brokers/');
      setBrokers(res.data);
    } catch (error) {
      toast.error('Failed to load brokers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (broker) => {
    const isVerified = broker.profile?.is_broker_verified;
    const action = isVerified ? 'unverify' : 'verify';
    try {
      await api.post(`brokers/${broker.id}/${action}/`);
      toast.success(`Broker ${action === 'verify' ? 'verified' : 'unverified'} successfully`);
      fetchBrokers();
    } catch (error) {
      toast.error('Failed to update broker status');
    }
  };

  const handleDeleteBroker = async (brokerId) => {
    if (window.confirm('Are you sure you want to delete this broker? This action cannot be undone.')) {
      try {
        await api.delete(`brokers/${brokerId}/`);
        toast.success('Broker deleted successfully');
        fetchBrokers();
      } catch (error) {
        toast.error('Failed to delete broker');
      }
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary" role="status"></div></div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0 text-dark fw-bold">Broker Verification Requests</h4>
      </div>
      
      {brokers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox fs-1 mb-3"></i>
          <h5>No broker requests found</h5>
        </div>
      ) : (
        <div className="row g-4">
          {brokers.map(broker => {
            const verified = broker.profile?.is_broker_verified;
            return (
              <div key={broker.id} className="col-12 col-md-6 col-lg-4">
                <div className={`card h-100 border-0 shadow-sm ${verified ? 'border-success' : 'border-warning'}`} style={{ borderTop: `4px solid ${verified ? '#198754' : '#ffc107'}` }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title fw-bold mb-1">{broker.first_name} {broker.last_name || broker.username}</h5>
                        <p className="text-muted small mb-0">@{broker.username}</p>
                      </div>
                      <span className={`badge ${verified ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center text-muted mb-2">
                        <i className="bi bi-envelope me-2"></i>
                        <span className="small">{broker.email}</span>
                      </div>
                      {broker.phone_number && (
                        <div className="d-flex align-items-center text-muted">
                          <i className="bi bi-telephone me-2"></i>
                          <span className="small">{broker.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0 pt-0 pb-3 d-flex gap-2">
                    <button 
                      className={`btn flex-grow-1 fw-bold shadow-sm ${verified ? 'btn-outline-danger' : 'btn-success'}`}
                      onClick={() => toggleVerification(broker)}
                      style={{ transition: 'all 0.3s ease' }}
                    >
                      {verified ? (
                        <><i className="bi bi-x-circle me-2"></i> Revoke Access</>
                      ) : (
                        <><i className="bi bi-check-circle me-2"></i> Verify</>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-danger fw-bold shadow-sm px-3"
                      onClick={() => handleDeleteBroker(broker.id)}
                      title="Delete Broker"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BrokersManager;
