import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Shows from './pages/Shows';
import ShowDetails from './pages/ShowDetails';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getProfile()
        .then(response => setUser(response.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div style={{padding: '20px'}}>Loading...</div>;

  return (
    <Router>
      <Header user={user} logout={logout} />
      <Routes>
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/shows" />} />
        <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/shows" />} />
        <Route path="/shows" element={user ? <Shows /> : <Navigate to="/login" />} />
        <Route path="/shows/:id" element={user ? <ShowDetails /> : <Navigate to="/login" />} />
        <Route path="/booking/:showId/:showtimeId" element={user ? <Booking /> : <Navigate to="/login" />} />
        <Route path="/payment/:bookingId" element={user ? <Payment /> : <Navigate to="/login" />} />
        <Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={user ? "/shows" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;