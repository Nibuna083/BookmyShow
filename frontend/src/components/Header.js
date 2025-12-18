import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, logout }) => {
  return (
    <header className="header">
      <Link to="/shows" style={{fontSize: '1.5rem', fontWeight: 'bold'}}>
        BookMyShow
      </Link>
      {user && (
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/shows">Shows</Link>
          <Link to="/my-bookings">My Bookings</Link>
          <span style={{ color: 'white' }}>Hi, {user.name}</span>
          <button onClick={logout} className="btn">
            Logout
          </button>
        </nav>
      )}
    </header>
  );
};

export default Header;