import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Dashboard.css';

export default function AdminDashboard() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, uRes, vRes, bRes] = await Promise.all([
        axios.get('/api/admin/analytics'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/vehicles'),
        axios.get('/api/admin/bookings'),
      ]);
      setAnalytics(aRes.data);
      setUsers(uRes.data);
      setVehicles(vRes.data);
      setBookings(bRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVehicle = async (id) => {
    try {
      await axios.put(`/api/admin/vehicles/${id}/approve`);
      fetchAll();
    } catch (err) {
      alert('Failed to approve vehicle');
    }
  };

  const handleToggleUser = async (id, isActive) => {
    try {
      await axios.put(`/api/admin/users/${id}`, { isActive: !isActive });
      fetchAll();
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const formatDate = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className="loading">Loading admin data...</div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview and management</p>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>📊 Analytics</button>
          <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>👥 Users ({users.length})</button>
          <button className={`tab-btn ${tab === 'vehicles' ? 'active' : ''}`} onClick={() => setTab('vehicles')}>🚗 Vehicles ({vehicles.length})</button>
          <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>📅 Bookings ({bookings.length})</button>
        </div>

        {/* Analytics */}
        {tab === 'analytics' && analytics && (
          <div>
            <div className="analytics-grid">
              {[
                { icon: '👥', label: 'Registered Users', value: analytics.totalUsers, color: 'info' },
                { icon: '🚗', label: 'Approved Vehicles', value: analytics.totalVehicles, color: 'success' },
                { icon: '📋', label: 'Total Bookings', value: analytics.totalBookings, color: 'warning' },
                { icon: '✅', label: 'Active Rentals', value: analytics.activeBookings, color: 'success' },
                { icon: '⏳', label: 'Pending Bookings', value: analytics.pendingBookings, color: 'warning' },
                { icon: '🏁', label: 'Completed Bookings', value: analytics.completedBookings, color: 'secondary' },
                { icon: '📅', label: 'Monthly Active Users', value: analytics.monthlyActiveUsers, color: 'info' },
                { icon: '💰', label: 'Total Revenue (₹)', value: `₹${analytics.totalRevenue?.toLocaleString()}`, color: 'success' },
              ].map((s, i) => (
                <div className="analytics-card card" key={i}>
                  <span className="analytics-icon">{s.icon}</span>
                  <div className={`analytics-value color-${s.color}`}>{s.value}</div>
                  <div className="analytics-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="charts-grid">
              <div className="chart-card card">
                <h3 className="chart-title">Booking Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: analytics.pendingBookings || 0 },
                        { name: 'Active', value: analytics.activeBookings || 0 },
                        { name: 'Completed', value: analytics.completedBookings || 0 },
                        { name: 'Others', value: Math.max(0, analytics.totalBookings - analytics.pendingBookings - analytics.activeBookings - analytics.completedBookings) },
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" outerRadius={90}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {['#f5a623','#4fc3f7','#00c896','#a0a0b0'].map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card card">
                <h3 className="chart-title">Platform Overview</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={[
                    { name: 'Users', value: analytics.totalUsers },
                    { name: 'Vehicles', value: analytics.totalVehicles },
                    { name: 'Bookings', value: analytics.totalBookings },
                    { name: 'Active', value: analytics.activeBookings },
                    { name: 'Completed', value: analytics.completedBookings },
                  ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'admin' ? 'danger' : u.role === 'owner' ? 'warning' : 'info'}`}>{u.role}</span></td>
                    <td>{u.phone || '—'}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-secondary'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleUser(u._id, u.isActive)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Vehicles */}
        {tab === 'vehicles' && (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Brand/Model</th>
                  <th>Location</th>
                  <th>Daily Price</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Approval</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v._id}>
                    <td><strong>{v.name}</strong></td>
                    <td>{v.type}</td>
                    <td>{v.brand} {v.model} ({v.modelYear})</td>
                    <td>{v.location}</td>
                    <td>₹{v.pricingPlans?.daily}</td>
                    <td>{v.owner?.name || '—'}</td>
                    <td><span className={`badge badge-${v.availabilityStatus === 'available' ? 'success' : 'warning'}`}>{v.availabilityStatus}</span></td>
                    <td>
                      {v.isApproved ? (
                        <span className="badge badge-success">Approved</span>
                      ) : (
                        <button className="btn btn-success btn-sm" onClick={() => handleApproveVehicle(v._id)}>Approve</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bookings */}
        {tab === 'bookings' && (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.user?.name}</strong><br /><small style={{ color: 'var(--text-secondary)' }}>{b.user?.email}</small></td>
                    <td>{b.vehicle?.name}</td>
                    <td>{formatDate(b.startDate)}</td>
                    <td>{formatDate(b.endDate)}</td>
                    <td>{b.rentalDuration}</td>
                    <td>₹{b.totalPrice}</td>
                    <td>
                      <span className={`badge badge-${b.status === 'pending' ? 'warning' : b.status === 'approved' || b.status === 'completed' ? 'success' : b.status === 'active' ? 'info' : 'secondary'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
