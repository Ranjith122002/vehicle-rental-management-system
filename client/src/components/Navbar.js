import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🚗</span>
          <span className="brand-text">Drive<span className="brand-accent">Easy</span></span>
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/vehicles" className={`nav-link ${isActive('/vehicles') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Browse Vehicles</Link>

          {user ? (
            <>
              {user.role === 'customer' && (
                <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>My Bookings</Link>
              )}
              {(user.role === 'owner' || user.role === 'admin') && (
                <Link to="/owner" className={`nav-link ${isActive('/owner') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Owner Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <div className="nav-user">
                <span className="user-badge">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.name}</span>
                <span className={`role-tag role-${user.role}`}>{user.role}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
