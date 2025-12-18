import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { showsAPI } from '../services/api';

const Shows = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    showsAPI.getAll()
      .then(response => setShows(response.data))
      .catch(error => console.error('Error fetching shows:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container">Loading shows...</div>;

  return (
    <div className="container">
      <h1>Available Shows</h1>
      <div className="shows-grid">
        {shows.map(show => (
          <Link key={show._id} to={`/shows/${show._id}`} className="show-card">
            <img src={show.poster} alt={show.title} className="show-card-image" />
            <div className="show-card-content">
              <h3>{show.title}</h3>
              <p>{show.genre} • {show.duration} min</p>
              <p>{show.description}</p>
              <div style={{marginTop: '1rem', fontWeight: 'bold'}}>
                Rating: {show.rating}/10
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shows;