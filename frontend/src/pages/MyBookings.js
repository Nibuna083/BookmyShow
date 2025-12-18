import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    bookingsAPI.getAll()
      .then(response => setBookings(response.data))
      .catch(error => console.error('Error fetching bookings:', error))
      .finally(() => setLoading(false));
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.cancel(bookingId);
        alert('Booking cancelled and refunded successfully');
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.message || 'Cancellation failed');
      }
    }
  };

  const containerStyle = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const bookingCardStyle = {
    background: 'white',
    padding: '1.5rem',
    margin: '1rem 0',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const statusStyle = (status) => ({
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    background: status === 'confirmed' ? '#4caf50' : status === 'cancelled' ? '#f44336' : '#ff9800',
    color: 'white'
  });

  const buttonStyle = {
    padding: '0.5rem 1rem',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading bookings...</div>;

  return (
    <div style={containerStyle}>
      <h1>My Bookings</h1>
      {bookings.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <p>No bookings found</p>
        </div>
      ) : (
        bookings.map(booking => (
          <div key={booking._id} style={bookingCardStyle}>
            <div>
              <h3>{booking.show.title}</h3>
              <p>Seats: {booking.seats}</p>
              <p>Amount: ₹{booking.totalAmount}</p>
              <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
              {booking.paymentId && <p>Payment ID: {booking.paymentId}</p>}
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={statusStyle(booking.status)}>
                {booking.status.toUpperCase()}
              </div>
              {booking.status === 'confirmed' && (
                <button 
                  onClick={() => handleCancel(booking._id)}
                  style={{...buttonStyle, marginTop: '1rem'}}
                >
                  Cancel & Refund
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;