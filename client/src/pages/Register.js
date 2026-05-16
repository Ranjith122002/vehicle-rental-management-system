import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: searchParams.get('role') || 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-in">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h1>Create Account</h1>
          <p>Join DriveEasy and start renting today</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" type="text" name="name" placeholder="Your full name"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input className="form-control" type="tel" name="phone" placeholder="+91 98765 43210"
              value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" name="password" placeholder="At least 6 characters"
              value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Register As</label>
            <select className="form-control" name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer — I want to rent vehicles</option>
              <option value="owner">Owner — I want to list my vehicles</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
