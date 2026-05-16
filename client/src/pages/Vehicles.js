import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Vehicles.css';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '', fuelType: '', transmission: '', minPrice: '', maxPrice: '', location: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await axios.get('/api/vehicles', { params });
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleFilterChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleReset = () => {
    setFilters({ type: '', fuelType: '', transmission: '', minPrice: '', maxPrice: '', location: '' });
    setTimeout(() => fetchVehicles(), 0);
  };

  const getStatusBadge = (status) => {
    const map = { available: 'success', booked: 'danger', maintenance: 'warning' };
    return `badge badge-${map[status] || 'secondary'}`;
  };

  return (
    <div className="vehicles-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Browse Vehicles</h1>
          <p className="page-subtitle">Find your perfect ride from our fleet of 2-wheelers and 4-wheelers</p>
        </div>

        {/* Filters */}
        <form className="filters-card card" onSubmit={handleSearch}>
          <div className="filters-grid">
            <div className="form-group">
              <label>Vehicle Type</label>
              <select className="form-control" name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">All Types</option>
                <option value="2W">2-Wheeler</option>
                <option value="4W">4-Wheeler</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fuel Type</label>
              <select className="form-control" name="fuelType" value={filters.fuelType} onChange={handleFilterChange}>
                <option value="">All Fuels</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transmission</label>
              <select className="form-control" name="transmission" value={filters.transmission} onChange={handleFilterChange}>
                <option value="">All</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="form-control" name="location" placeholder="City or area"
                value={filters.location} onChange={handleFilterChange} />
            </div>
            <div className="form-group">
              <label>Min Price (₹/day)</label>
              <input className="form-control" type="number" name="minPrice" placeholder="0"
                value={filters.minPrice} onChange={handleFilterChange} />
            </div>
            <div className="form-group">
              <label>Max Price (₹/day)</label>
              <input className="form-control" type="number" name="maxPrice" placeholder="5000"
                value={filters.maxPrice} onChange={handleFilterChange} />
            </div>
          </div>
          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">🔍 Search Vehicles</button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>Reset Filters</button>
          </div>
        </form>

        {/* Results */}
        <div className="results-header">
          <span className="results-count">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} found</span>
        </div>

        {loading ? (
          <div className="loading">Loading vehicles...</div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon">🚗</div>
            <h3>No vehicles found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="vehicles-grid">
            {vehicles.map(v => (
              <div className="vehicle-card card fade-in" key={v._id}>
                <div className="vehicle-type-badge">{v.type === '2W' ? '🏍️ 2-Wheeler' : '🚗 4-Wheeler'}</div>
                <div className="vehicle-image-placeholder">
                  {v.photos && v.photos.length > 0
                    ? <img src={`http://localhost:5000${v.photos[0]}`} alt={v.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span className="vehicle-emoji">{v.type === '2W' ? '🏍️' : '🚗'}</span>
                  }
                </div>
                <div className="vehicle-info">
                  <div className="vehicle-name-row">
                    <h3 className="vehicle-name">{v.name}</h3>
                    <span className={getStatusBadge(v.availabilityStatus)}>{v.availabilityStatus}</span>
                  </div>
                  <p className="vehicle-brand">{v.brand} {v.model} · {v.modelYear}</p>
                  <div className="vehicle-tags">
                    <span className="tag">{v.fuelType}</span>
                    <span className="tag">{v.transmission}</span>
                    <span className="tag">📍 {v.location}</span>
                  </div>
                  <div className="vehicle-price-row">
                    <div>
                      <span className="price-main">₹{v.pricingPlans?.daily}</span>
                      <span className="price-unit">/day</span>
                    </div>
                    {v.pricingPlans?.weekly && (
                      <span className="price-alt">₹{v.pricingPlans.weekly}/week</span>
                    )}
                  </div>
                  <Link to={`/vehicles/${v._id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
