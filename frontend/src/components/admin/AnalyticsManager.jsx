import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AnalyticsManager = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('analytics/');
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const { current_month_revenue, past_month_revenue, top_category, top_category_revenue } = analytics;
  
  // Calculate percentage change
  let percentageChange = 0;
  if (past_month_revenue > 0) {
    percentageChange = ((current_month_revenue - past_month_revenue) / past_month_revenue) * 100;
  } else if (current_month_revenue > 0) {
    percentageChange = 100; // 100% increase if past was 0 and current > 0
  }

  const isPositive = percentageChange >= 0;

  return (
    <div className="container-fluid p-0">
      <h4 className="mb-4 text-dark fw-bold">Analytics Dashboard</h4>
      
      <div className="row g-4">
        {/* Current Month Revenue Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100 border-0" style={{ background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)', color: 'white' }}>
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <h6 className="text-uppercase mb-2 opacity-75 fw-semibold" style={{ letterSpacing: '1px' }}>Current Month Revenue</h6>
                <h2 className="display-5 fw-bold mb-0">₹{current_month_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="mt-4">
                <div className="d-flex align-items-center">
                  <div className={`badge ${isPositive ? 'bg-success' : 'bg-danger'} p-2 me-2`}>
                    <i className={`fas ${isPositive ? 'fa-arrow-up' : 'fa-arrow-down'} me-1`}></i>
                    {Math.abs(percentageChange).toFixed(1)}%
                  </div>
                  <span className="opacity-75 small">vs last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Past Month Revenue Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100 border-0 bg-white">
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <h6 className="text-uppercase text-muted mb-2 fw-semibold" style={{ letterSpacing: '1px' }}>Past Month Revenue</h6>
                <h2 className="display-5 fw-bold text-dark mb-0">₹{past_month_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              </div>
              <div className="mt-4 text-muted small">
                <i className="far fa-calendar-alt me-2"></i>
                Based on previous calendar month
              </div>
            </div>
          </div>
        </div>

        {/* Top Category Card */}
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm h-100 border-0 bg-white">
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <h6 className="text-uppercase text-muted mb-2 fw-semibold" style={{ letterSpacing: '1px' }}>Top Category by Revenue</h6>
                <h2 className="h1 fw-bold text-primary mb-1">
                  {top_category ? top_category : 'N/A'}
                </h2>
                {top_category && (
                  <h5 className="text-success fw-semibold">
                    ₹{top_category_revenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h5>
                )}
              </div>
              <div className="mt-4 text-muted small">
                <i className="fas fa-trophy text-warning me-2"></i>
                Highest earning room category all-time
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;
