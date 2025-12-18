import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showsAPI, bookingsAPI } from '../services/api';

const Booking = () => {
  const { showId, showtimeId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    showsAPI.getById(showId)
      .then(response => {
        setShow(response.data);
        const selectedShowtime = response.data.showtimes.find(st => st._id === showtimeId);
        setShowtime(selectedShowtime);
      })
      .catch(error => console.error('Error fetching show:', error))
      .finally(() => setLoading(false));
  }, [showId, showtimeId]);

  const handleBooking = async () => {
    setBooking(true);
    try {
      const response = await bookingsAPI.create({
        showId,
        showtimeId,
        seats
      });
      navigate(`/payment/${response.data._id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
      setBooking(false);
    }
  };

  const containerStyle = {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const cardStyle = {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: '1px solid #ddd',
    borderRadius: '4px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#d32f2f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem'
  };

  if (loading) return <div style={{padding: '2rem'}}>Loading...</div>;
  if (!show || !showtime) return <div style={{padding: '2rem'}}>Show not found</div>;

  const totalAmount = seats * showtime.price;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2>Book Tickets</h2>
        <div style={{margin: '1rem 0'}}>
          <h3>{show.title}</h3>
          <p>{new Date(showtime.date).toDateString()} • {showtime.time}</p>
          <p>{showtime.theater}</p>
        </div>

        <div style={{margin: '1rem 0'}}>
          <label>Number of Seats:</label>
          <input
            type="number"
            min="1"
            max={Math.min(showtime.availableSeats, 10)}
            value={seats}
            onChange={(e) => setSeats(parseInt(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div style={{margin: '1rem 0', padding: '1rem', background: '#f5f5f5', borderRadius: '4px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>Seats: {seats}</span>
            <span>₹{showtime.price} each</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.5rem'}}>
            <span>Total Amount:</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <button 
          onClick={handleBooking} 
          disabled={booking}
          style={{...buttonStyle, opacity: booking ? 0.7 : 1}}
        >
          {booking ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default Booking;