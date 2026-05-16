import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const INITIAL_VEHICLE = {
  name: '', brand: '', model: '', modelYear: '', vehicleNumber: '',
  type: '4W', fuelType: 'Petrol', transmission: 'Manual',
  location: '', specs: '', photos: [],
  pricingPlans: { daily: '', weekly: '', monthly: '' }
};

export default function OwnerDashboard() {
  const [tab, setTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_VEHICLE);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, bRes] = await Promise.all([
        axios.get('/api/vehicles/owner/my'),
        axios.get('/api/bookings/owner')
      ]);
      setVehicles(vRes.data);
      setBookings(bRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('pricing.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, pricingPlans: { ...f.pricingPlans, [key]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      let photos = form.photos || [];

      // Upload photo if selected
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        const uploadRes = await axios.post('/api/upload/vehicle-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photos = [uploadRes.data.url];
      }

      const payload = {
        ...form,
        photos,
        pricingPlans: {
          daily: Number(form.pricingPlans.daily),
          weekly: form.pricingPlans.weekly ? Number(form.pricingPlans.weekly) : undefined,
          monthly: form.pricingPlans.monthly ? Number(form.pricingPlans.monthly) : undefined,
        }
      };
      if (editId) {
        await axios.put(`/api/vehicles/${editId}`, payload);
      } else {
        await axios.post('/api/vehicles', payload);
      }
      setShowForm(false);
      setEditId(null);
      setForm(INITIAL_VEHICLE);
      setPhotoFile(null);
      setPhotoPreview('');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.msg || 'Failed to save vehicle');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (v) => {
    setForm({
      name: v.name, brand: v.brand, model: v.model, modelYear: v.modelYear,
      vehicleNumber: v.vehicleNumber, type: v.type, fuelType: v.fuelType,
      transmission: v.transmission, location: v.location, specs: v.specs || '',
      photos: v.photos || [],
      pricingPlans: {
        daily: v.pricingPlans?.daily || '',
        weekly: v.pricingPlans?.weekly || '',
        monthly: v.pricingPlans?.monthly || '',
      }
    });
    setEditId(v._id);
    setPhotoFile(null);
    setPhotoPreview(v.photos?.[0] || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await axios.delete(`/api/vehicles/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to delete');
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to update booking');
    }
  };

  const handleMaintenance = async (vehicleId) => {
    try {
      await axios.put(`/api/vehicles/${vehicleId}`, { availabilityStatus: 'maintenance' });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'active');

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Owner Dashboard</h1>
          <p className="page-subtitle">Manage your fleet and booking requests</p>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat card">
            <span className="dash-stat-icon">🚗</span>
            <div>
              <div className="dash-stat-value">{vehicles.length}</div>
              <div className="dash-stat-label">Total Vehicles</div>
            </div>
          </div>
          <div className="dash-stat card">
            <span className="dash-stat-icon">⏳</span>
            <div>
              <div className="dash-stat-value">{pendingBookings.length}</div>
              <div className="dash-stat-label">Pending Requests</div>
            </div>
          </div>
          <div className="dash-stat card">
            <span className="dash-stat-icon">✅</span>
            <div>
              <div className="dash-stat-value">{activeBookings.length}</div>
              <div className="dash-stat-label">Active Rentals</div>
            </div>
          </div>
          <div className="dash-stat card">
            <span className="dash-stat-icon">📋</span>
            <div>
              <div className="dash-stat-value">{bookings.length}</div>
              <div className="dash-stat-label">Total Bookings</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'vehicles' ? 'active' : ''}`} onClick={() => setTab('vehicles')}>
            🚗 My Vehicles ({vehicles.length})
          </button>
          <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
            📅 Booking Requests {pendingBookings.length > 0 && <span className="tab-badge">{pendingBookings.length}</span>}
          </button>
        </div>

        {/* Vehicles Tab */}
        {tab === 'vehicles' && (
          <div>
            <div className="tab-actions">
              <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(INITIAL_VEHICLE); }}>
                {showForm ? '✕ Cancel' : '+ Add Vehicle'}
              </button>
            </div>

            {showForm && (
              <div className="form-card card fade-in">
                <h3>{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                {formError && <div className="error-msg">{formError}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Vehicle Name</label>
                      <input className="form-control" name="name" placeholder="e.g. Honda Activa" value={form.name} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label>Brand</label>
                      <input className="form-control" name="brand" placeholder="Honda" value={form.brand} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label>Model</label>
                      <input className="form-control" name="model" placeholder="Activa 6G" value={form.model} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label>Model Year</label>
                      <input className="form-control" type="number" name="modelYear" placeholder="2023" value={form.modelYear} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label>Vehicle Number</label>
                      <input className="form-control" name="vehicleNumber" placeholder="KA01AB1234" value={form.vehicleNumber} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select className="form-control" name="type" value={form.type} onChange={handleFormChange}>
                        <option value="2W">2-Wheeler</option>
                        <option value="4W">4-Wheeler</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fuel Type</label>
                      <select className="form-control" name="fuelType" value={form.fuelType} onChange={handleFormChange}>
                        <option>Petrol</option>
                        <option>Diesel</option>
                        <option>Electric</option>
                        <option>CNG</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Transmission</label>
                      <select className="form-control" name="transmission" value={form.transmission} onChange={handleFormChange}>
                        <option>Manual</option>
                        <option>Automatic</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input className="form-control" name="location" placeholder="Bangalore" value={form.location} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label>Daily Price (₹)</label>
                      <input className="form-control" type="number" name="pricing.daily" placeholder="500" value={form.pricingPlans.daily} onChange={handleFormChange} required />
                    </div>
                    <div className="form-group">
                      <label>Weekly Price (₹, optional)</label>
                      <input className="form-control" type="number" name="pricing.weekly" placeholder="3000" value={form.pricingPlans.weekly} onChange={handleFormChange} />
                    </div>
                    <div className="form-group">
                      <label>Monthly Price (₹, optional)</label>
                      <input className="form-control" type="number" name="pricing.monthly" placeholder="10000" value={form.pricingPlans.monthly} onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description / Specs</label>
                    <textarea className="form-control" name="specs" rows={3} placeholder="Vehicle description..." value={form.specs} onChange={handleFormChange} />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Photo (optional)</label>
                    <input className="form-control" type="file" accept="image/*" onChange={handlePhotoChange} />
                    {photoPreview && (
                      <div style={{ marginTop: 10 }}>
                        <img src={photoPreview.startsWith('blob:') ? photoPreview : `http://localhost:5000${photoPreview}`} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={formLoading}>
                    {formLoading ? 'Saving...' : (editId ? 'Update Vehicle' : 'Add Vehicle')}
                  </button>
                </form>
              </div>
            )}

            {vehicles.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-icon">🚗</div>
                <h3>No vehicles listed</h3>
                <p>Add your first vehicle to start receiving bookings.</p>
              </div>
            ) : (
              <div className="owner-vehicles-list">
                {vehicles.map(v => (
                  <div className="owner-vehicle-item card" key={v._id}>
                    <div className="owner-vehicle-icon">{v.type === '2W' ? '🏍️' : '🚗'}</div>
                    <div className="owner-vehicle-info">
                      <div className="owner-vehicle-header">
                        <h3>{v.name}</h3>
                        <div className="owner-vehicle-badges">
                          <span className={`badge ${v.isApproved ? 'badge-success' : 'badge-warning'}`}>
                            {v.isApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                          <span className={`badge badge-${v.availabilityStatus === 'available' ? 'success' : v.availabilityStatus === 'booked' ? 'danger' : 'warning'}`}>
                            {v.availabilityStatus}
                          </span>
                        </div>
                      </div>
                      <p className="owner-vehicle-meta">{v.brand} {v.model} · {v.modelYear} · {v.vehicleNumber} · {v.location}</p>
                      <p className="owner-vehicle-price">₹{v.pricingPlans?.daily}/day</p>
                    </div>
                    <div className="owner-vehicle-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(v)}>Edit</button>
                      {v.availabilityStatus !== 'maintenance' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleMaintenance(v._id)}>Set Maintenance</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="bookings-list">
            {bookings.length === 0 ? (
              <div className="empty-state card">
                <div className="empty-icon">📅</div>
                <h3>No booking requests yet</h3>
              </div>
            ) : (
              bookings.map(b => (
                <div className="booking-item card fade-in" key={b._id}>
                  <div className="booking-vehicle-icon">{b.vehicle?.type === '2W' ? '🏍️' : '🚗'}</div>
                  <div className="booking-details">
                    <div className="booking-header-row">
                      <h3 className="booking-vehicle-name">{b.vehicle?.name}</h3>
                      <span className={`badge badge-${b.status === 'pending' ? 'warning' : b.status === 'approved' ? 'success' : b.status === 'active' ? 'info' : 'secondary'}`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="booking-vehicle-info">
                      Customer: <strong>{b.user?.name}</strong> ({b.user?.email})
                    </p>
                    <div className="booking-meta">
                      <span>📅 {formatDate(b.startDate)} → {formatDate(b.endDate)}</span>
                      <span>⏱️ {b.rentalDuration}</span>
                      <span>💰 ₹{b.totalPrice}</span>
                    </div>
                  </div>
                  {b.status === 'pending' && (
                    <div className="booking-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleBookingStatus(b._id, 'approved')}>Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleBookingStatus(b._id, 'rejected')}>Reject</button>
                    </div>
                  )}
                  {b.status === 'active' && (
                    <div className="booking-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleBookingStatus(b._id, 'completed')}>Mark Completed</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
