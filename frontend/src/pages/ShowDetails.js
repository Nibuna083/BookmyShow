import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { showsAPI } from '../services/api';

const ShowDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    showsAPI.getById(id)
      .then(response => setShow(response.data))
      .catch(error => console.error('Error fetching show:', error))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container">Loading...</div>;
  if (!show) return <div className="container">Show not found</div>;

  return (
    <div className="container">
      <div className="show-details-grid">
        <img src={show.poster} alt={show.title} className="show-details-poster" />
        <div>
          <h1>{show.title}</h1>
          <p style={{fontSize: '1.1rem', margin: '1rem 0'}}>{show.description}</p>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0'}}>
            <div><strong>Genre:</strong> {show.genre}</div>
            <div><strong>Duration:</strong> {show.duration} minutes</div>
            <div><strong>Rating:</strong> {show.rating}/10</div>
          </div>
        </div>
      </div>

      <div className="showtimes-container">
        <h2>Showtimes</h2>
        {show.showtimes.map(showtime => (
          <div key={showtime._id} className="showtime-card">
            <div>
              <div><strong>{new Date(showtime.date).toDateString()}</strong></div>
              <div>{showtime.time} • {showtime.theater}</div>
              <div>Available: {showtime.availableSeats}/{showtime.totalSeats}</div>
            </div>
            <div style={{textAlign: 'right'}}>
              <div style={{fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
                ₹{showtime.price}
              </div>
              {showtime.availableSeats > 0 ? (
                <Link 
                  to={`/booking/${show._id}/${showtime._id}`}
                  className="btn"
                >
                  Book Now
                </Link>
              ) : (
                <span style={{color: 'red'}}>Sold Out</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowDetails;