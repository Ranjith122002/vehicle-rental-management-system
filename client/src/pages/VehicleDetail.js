import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './VehicleDetail.css';

export default function VehicleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({
    startDate: '', endDate: '', rentalDuration: 'daily', notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        setVehicle(res.data);
      } catch {
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, navigate]);

  const calcTotal = () => {
    if (!vehicle || !booking.startDate || !booking.endDate) return 0;
    const days = Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 0;
    if (booking.rentalDuration === 'monthly') return vehicle.pricingPlans?.monthly || vehicle.pricingPlans?.daily * 28;
    if (booking.rentalDuration === 'weekly') return vehicle.pricingPlans?.weekly || vehicle.pricingPlans?.daily * 7;
    return vehicle.pricingPlans?.daily * days;
  };

  const handleBook = async e => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setBookingError('');
    setBookingLoading(true);
    try {
      await axios.post('/api/bookings', {
        vehicleId: vehicle._id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        rentalDuration: booking.rentalDuration,
        notes: booking.notes
      });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.response?.data?.msg || 'Booking failed. Try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading vehicle details...</div>;
  if (!vehicle) return null;

  return (
    <div className="vehicle-detail-page">
      <div className="container">
        <div className="back-link">
          <Link to="/vehicles">← Back to vehicles</Link>
        </div>

        <div className="detail-grid">
          {/* Vehicle Info */}
          <div className="detail-main">
            <div className="detail-image card">
              {vehicle.photos && vehicle.photos.length > 0
                ? <img src={`http://localhost:5000${vehicle.photos[0]}`} alt={vehicle.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                : <span className="detail-emoji">{vehicle.type === '2W' ? '🏍️' : '🚗'}</span>
              }
            </div>

            <div className="detail-info card">
              <div className="detail-header">
                <div>
                  <div className="detail-type-tag">{vehicle.type === '2W' ? '2-Wheeler' : '4-Wheeler'}</div>
                  <h1 className="detail-title">{vehicle.name}</h1>
                  <p className="detail-subtitle">{vehicle.brand} {vehicle.model} · {vehicle.modelYear}</p>
                </div>
                <span className={`badge badge-${vehicle.availabilityStatus === 'available' ? 'success' : 'danger'}`}>
                  {vehicle.availabilityStatus}
                </span>
              </div>

              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-icon">⛽</span>
                  <span className="spec-label">Fuel</span>
                  <span className="spec-value">{vehicle.fuelType}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">⚙️</span>
                  <span className="spec-label">Transmission</span>
                  <span className="spec-value">{vehicle.transmission}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">📍</span>
                  <span className="spec-label">Location</span>
                  <span className="spec-value">{vehicle.location}</span>
                </div>
                <div className="spec-item">
                  <span className="spec-icon">🏷️</span>
                  <span className="spec-label">Vehicle No.</span>
                  <span className="spec-value">{vehicle.vehicleNumber}</span>
                </div>
              </div>

              {vehicle.specs && (
                <div className="vehicle-specs-text">
                  <h4>Description</h4>
                  <p>{vehicle.specs}</p>
                </div>
              )}

              <div className="pricing-section">
                <h4>Pricing Plans</h4>
                <div className="pricing-grid">
                  <div className="pricing-card">
                    <span className="pricing-period">Daily</span>
                    <span className="pricing-amount">₹{vehicle.pricingPlans?.daily}</span>
                  </div>
                  {vehicle.pricingPlans?.weekly && (
                    <div className="pricing-card">
                      <span className="pricing-period">Weekly</span>
                      <span className="pricing-amount">₹{vehicle.pricingPlans.weekly}</span>
                    </div>
                  )}
                  {vehicle.pricingPlans?.monthly && (
                    <div className="pricing-card">
                      <span className="pricing-period">Monthly</span>
                      <span className="pricing-amount">₹{vehicle.pricingPlans.monthly}</span>
                    </div>
                  )}
                </div>
              </div>

              {vehicle.owner && (
                <div className="owner-info">
                  <h4>Listed by</h4>
                  <p>{vehicle.owner.name} · {vehicle.owner.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="booking-sidebar">
            <div className="booking-card card">
              <h2 className="booking-title">📅 Book This Vehicle</h2>

              {bookingSuccess ? (
                <div className="booking-success">
                  <div className="success-icon">✅</div>
                  <h3>Booking Requested!</h3>
                  <p>Your booking request has been sent. The owner will review and confirm soon.</p>
                  <Link to="/my-bookings" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                    View My Bookings
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleBook}>
                  {bookingError && <div className="error-msg">{bookingError}</div>}

                  <div className="form-group">
                    <label>Rental Duration</label>
                    <select className="form-control" value={booking.rentalDuration}
                      onChange={e => setBooking({ ...booking, rentalDuration: e.target.value })}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Start Date</label>
                    <input className="form-control" type="date" value={booking.startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setBooking({ ...booking, startDate: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input className="form-control" type="date" value={booking.endDate}
                      min={booking.startDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setBooking({ ...booking, endDate: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label>Notes (Optional)</label>
                    <textarea className="form-control" rows={3} placeholder="Any special requirements..."
                      value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })} />
                  </div>

                  {calcTotal() > 0 && (
                    <div className="price-summary">
                      <span>Estimated Total</span>
                      <span className="total-price">₹{calcTotal()}</span>
                    </div>
                  )}

                  {!user ? (
                    <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Login to Book
                    </Link>
                  ) : user.role !== 'customer' ? (
                    <div className="error-msg">Only customers can book vehicles.</div>
                  ) : vehicle.availabilityStatus !== 'available' ? (
                    <div className="error-msg">This vehicle is currently not available.</div>
                  ) : (
                    <button type="submit" className="btn btn-primary btn-block" disabled={bookingLoading}>
                      {bookingLoading ? 'Sending Request...' : 'Send Booking Request'}
                    </button>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
