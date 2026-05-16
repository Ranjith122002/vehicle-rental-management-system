import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Bookings.css';

const statusConfig = {
  pending: { badge: 'badge-warning', label: 'Pending' },
  approved: { badge: 'badge-success', label: 'Approved' },
  rejected: { badge: 'badge-danger', label: 'Rejected' },
  active: { badge: 'badge-info', label: 'Active' },
  completed: { badge: 'badge-secondary', label: 'Completed' },
  cancelled: { badge: 'badge-secondary', label: 'Cancelled' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/my');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="bookings-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Track all your vehicle rental bookings</p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">📅</div>
            <h3>No bookings yet</h3>
            <p>Browse vehicles and make your first booking!</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(b => {
              const cfg = statusConfig[b.status] || statusConfig.pending;
              return (
                <div className="booking-item card fade-in" key={b._id}>
                  <div className="booking-vehicle-icon">
                    {b.vehicle?.type === '2W' ? '🏍️' : '🚗'}
                  </div>
                  <div className="booking-details">
                    <div className="booking-header-row">
                      <h3 className="booking-vehicle-name">{b.vehicle?.name || 'Vehicle'}</h3>
                      <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                    </div>
                    <p className="booking-vehicle-info">
                      {b.vehicle?.brand} {b.vehicle?.model} · {b.vehicle?.location}
                    </p>
                    <div className="booking-meta">
                      <span>📅 {formatDate(b.startDate)} → {formatDate(b.endDate)}</span>
                      <span>⏱️ {b.rentalDuration}</span>
                      <span>💰 ₹{b.totalPrice}</span>
                    </div>
                    {b.notes && <p className="booking-notes">"{b.notes}"</p>}
                  </div>
                  <div className="booking-actions">
                    {['pending', 'approved'].includes(b.status) && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
