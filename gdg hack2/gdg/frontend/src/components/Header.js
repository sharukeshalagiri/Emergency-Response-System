import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ user, onLogout }) => {
  const getUserDisplay = () => {
    if (!user) return 'Public User';
    if (user.role === 'user') return `👤 Public User`;
    if (user.role === 'admin') return `🔧 Administrator`;
    if (user.role === 'officer') return `👮 Officer`;
    return user.name;
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          🚨 <span>Emergency Response</span>
        </Link>
      </div>
      
      <nav className="header-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Dashboard</Link>
        )}
        {user?.role === 'officer' && (
          <Link to="/officer" className="nav-link">Dashboard</Link>
        )}
      </nav>
      
      <div className="header-right">
        <div className="user-section">
          <div className="user-info">
            <span className="user-role-badge">
              {getUserDisplay()}
            </span>
            {user?.role === 'user' && (
              <span className="user-status">
                Ready to report emergencies
              </span>
            )}
          </div>
          
          {/* Show login/logout based on role */}
          {user?.role === 'admin' || user?.role === 'officer' ? (
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          ) : (
            <Link to="/login" className="login-btn">
              Admin/Officer Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;