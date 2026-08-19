import { useState, useEffect } from 'react';
import api from '../../services/api';

const NewBrokerNotification = () => {
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [lastBrokerId, setLastBrokerId] = useState(null);

  useEffect(() => {
    const fetchInitialBrokers = async () => {
      try {
        const res = await api.get(`brokers/?_t=${new Date().getTime()}`);
        if (res.data && res.data.length > 0) {
          const currentMaxId = Math.max(...res.data.map(b => Number(b.id)));
          const storedMaxId = localStorage.getItem('lastKnownBrokerId');
          
          if (storedMaxId && currentMaxId > parseInt(storedMaxId)) {
            const missedBrokers = res.data.filter(b => Number(b.id) > parseInt(storedMaxId));
            missedBrokers.sort((a, b) => Number(a.id) - Number(b.id));
            setNotificationQueue(missedBrokers);
          }
          
          setLastBrokerId(currentMaxId);
          localStorage.setItem('lastKnownBrokerId', currentMaxId.toString());
        } else {
          setLastBrokerId(0);
          localStorage.setItem('lastKnownBrokerId', '0');
        }
      } catch (error) {
        console.error('Error fetching initial brokers:', error);
      }
    };

    fetchInitialBrokers();
  }, []);

  useEffect(() => {
    if (lastBrokerId === null) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`brokers/?_t=${new Date().getTime()}`);
        if (res.data && res.data.length > 0) {
          const currentMaxId = Math.max(...res.data.map(b => Number(b.id)));
          if (currentMaxId > lastBrokerId) {
            const newBrokers = res.data.filter(b => Number(b.id) > lastBrokerId);
            newBrokers.sort((a, b) => Number(a.id) - Number(b.id));
            
            setNotificationQueue(prev => [...prev, ...newBrokers]);
            setLastBrokerId(currentMaxId);
            localStorage.setItem('lastKnownBrokerId', currentMaxId.toString());
            
            window.dispatchEvent(new Event('newBrokerArrived'));
          }
        }
      } catch (error) {
        console.error('Error polling brokers:', error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [lastBrokerId]);

  if (notificationQueue.length === 0) return null;

  const currentBroker = notificationQueue[0];
  const remainingCount = notificationQueue.length - 1;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999
    }}>
      <div className="bg-white rounded-4 shadow-lg overflow-hidden text-center" style={{ maxWidth: '600px', width: '90%', animation: 'popIn 0.3s ease-out' }}>
        <div className="bg-warning text-dark py-3 px-4 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-briefcase-fill me-2"></i> 
            New Broker Registration Alert! {remainingCount > 0 && `(+${remainingCount} more)`}
          </h4>
          <button onClick={() => setNotificationQueue(prev => prev.slice(1))} className="btn-close"></button>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <i className="bi bi-person-badge-fill text-warning" style={{ fontSize: '5rem' }}></i>
          </div>
          <h2 className="mb-4 fw-bold">A new broker has registered!</h2>
          
          <div className="card border-warning shadow-sm mx-auto text-start bg-light" style={{ maxWidth: '100%' }}>
            <div className="card-body p-4">
              <h5 className="border-bottom pb-3 mb-3 text-warning fw-bold">Broker Details (ID: #{currentBroker.id})</h5>
              <div className="mb-2 fs-5"><strong>Name:</strong> {currentBroker.first_name} {currentBroker.last_name || currentBroker.username}</div>
              <div className="mb-2 fs-5"><strong>Email:</strong> {currentBroker.email}</div>
              {currentBroker.phone_number && (
                <div className="mb-2 fs-5"><strong>Phone:</strong> {currentBroker.phone_number}</div>
              )}
            </div>
          </div>
          
          <button 
            className="btn btn-warning btn-lg mt-5 px-5 rounded-pill fw-bold shadow text-dark"
            onClick={() => setNotificationQueue(prev => prev.slice(1))}
          >
            {remainingCount > 0 ? `NEXT NOTIFICATION (${remainingCount})` : 'ACKNOWLEDGE & DISMISS'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NewBrokerNotification;
