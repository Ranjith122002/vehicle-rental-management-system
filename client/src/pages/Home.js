import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: '🔍', title: 'Search & Filter', desc: 'Find vehicles by type, price, fuel type, and location' },
    { icon: '📅', title: 'Flexible Rentals', desc: 'Book daily, weekly, or monthly rental plans' },
    { icon: '✅', title: 'Instant Booking', desc: 'Send booking requests and get owner approval fast' },
    { icon: '📊', title: 'Track Bookings', desc: 'View your booking history and rental status anytime' },
  ];

  const stats = [
    { value: '500+', label: 'Vehicles Available' },
    { value: '10K+', label: 'Happy Customers' },
    { value: '50+', label: 'Cities Covered' },
    { value: '99%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
        </div>
        <div className="container hero-content fade-in">
          <div className="hero-tag">🚀 Trusted Vehicle Rental Platform</div>
          <h1 className="hero-title">
            Rent Any Vehicle,<br />
            <span className="gradient-text">Anywhere, Anytime</span>
          </h1>
          <p className="hero-subtitle">
            Browse 2-wheelers and 4-wheelers. Flexible durations. Hassle-free booking.
            Join thousands of happy renters today.
          </p>
          <div className="hero-actions">
            <Link to="/vehicles" className="btn btn-primary btn-lg">Browse Vehicles</Link>
            {!user && (
              <Link to="/register" className="btn btn-secondary btn-lg">Get Started Free</Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div className="stat-card fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose DriveEasy?</h2>
            <p>Everything you need for a seamless vehicle rental experience</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card card fade-in" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card card">
            <h2>Ready to Hit the Road?</h2>
            <p>Join DriveEasy today and access hundreds of vehicles near you.</p>
            <div className="cta-actions">
              <Link to="/vehicles" className="btn btn-primary btn-lg">Browse All Vehicles</Link>
              {!user && (
                <Link to="/register?role=owner" className="btn btn-secondary btn-lg">List Your Vehicle</Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
