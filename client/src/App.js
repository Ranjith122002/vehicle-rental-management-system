import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import MyBookings from './pages/MyBookings';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/my-bookings" element={
          <PrivateRoute roles={['customer']}><MyBookings /></PrivateRoute>
        } />
        <Route path="/owner" element={
          <PrivateRoute roles={['owner', 'admin']}><OwnerDashboard /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
