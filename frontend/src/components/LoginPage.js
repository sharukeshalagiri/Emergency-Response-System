import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('user'); // user, admin, officer
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock credentials for demo
  const mockCredentials = {
    admin: { username: 'admin', password: 'admin123' },
    officer: { username: 'officer', password: 'officer123' }
  };

  const handleUserLogin = () => {
    // User login - no credentials needed
    const userData = {
      id: 'user-' + Date.now(),
      name: 'Emergency User',
      role: 'user',
      email: 'user@example.com'
    };
    onLogin(userData);
  };

  const handleCredentialLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (activeTab === 'admin') {
        if (username === mockCredentials.admin.username && 
            password === mockCredentials.admin.password) {
          const adminData = {
            id: 'admin-001',
            name: 'System Administrator',
            role: 'admin',
            username: username,
            email: 'admin@emergency.com'
          };
          localStorage.setItem('user', JSON.stringify(adminData));
          onLogin(adminData);
        } else {
          setError('Invalid admin credentials. Use: admin/admin123');
        }
      } else if (activeTab === 'officer') {
        if (username === mockCredentials.officer.username && 
            password === mockCredentials.officer.password) {
          const officerData = {
            id: 'officer-001',
            name: 'Emergency Officer',
            role: 'officer',
            username: username,
            badgeNumber: 'OFF-2024',
            email: 'officer@emergency.com'
          };
          localStorage.setItem('user', JSON.stringify(officerData));
          onLogin(officerData);
        } else {
          setError('Invalid officer credentials. Use: officer/officer123');
        }
      }
      setLoading(false);
    }, 1000);
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else if (role === 'officer') {
      setUsername('officer');
      setPassword('officer123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🚨 Emergency Response System</h2>
          <p>Login to access the emergency response platform</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="role-tabs">
          <button
            className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            👤 Public User
          </button>
          <button
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            🔧 Admin
          </button>
          <button
            className={`tab-btn ${activeTab === 'officer' ? 'active' : ''}`}
            onClick={() => setActiveTab('officer')}
          >
            👮 Officer
          </button>
        </div>

        {/* User Login (No Credentials) */}
        {activeTab === 'user' && (
          <div className="user-login">
            <div className="user-info">
              <h3>Public User Access</h3>
              <p>Report emergencies without creating an account. Your reports will be anonymous.</p>
              <ul className="user-features">
                <li>✅ Report emergencies instantly</li>
                <li>✅ Track response status</li>
                <li>✅ No personal data required</li>
                <li>✅ 24/7 emergency reporting</li>
              </ul>
            </div>
            <button className="user-login-btn" onClick={handleUserLogin}>
              🚨 Continue as Public User
            </button>
            <p className="login-note">
              Note: As a public user, you can report emergencies but cannot access admin features.
            </p>
          </div>
        )}

        {/* Admin/Officer Login (With Credentials) */}
        {(activeTab === 'admin' || activeTab === 'officer') && (
          <form className="credential-login" onSubmit={handleCredentialLogin}>
            <h3>{activeTab === 'admin' ? '🔧 Admin Login' : '👮 Officer Login'}</h3>
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={`Enter ${activeTab} username`}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <p><strong>Demo Credentials:</strong></p>
              <div className="credential-buttons">
                <button 
                  type="button" 
                  className="demo-btn"
                  onClick={() => handleQuickLogin(activeTab)}
                >
                  Fill Demo {activeTab === 'admin' ? 'Admin' : 'Officer'} Credentials
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Logging in...
                </>
              ) : (
                `Login as ${activeTab === 'admin' ? 'Admin' : 'Officer'}`
              )}
            </button>

            <div className="role-permissions">
              <h4>Permissions:</h4>
              {activeTab === 'admin' ? (
                <ul>
                  <li>✅ View all emergency reports</li>
                  <li>✅ Manage users and officers</li>
                  <li>✅ Assign responders</li>
                  <li>✅ Generate analytics reports</li>
                  <li>✅ System configuration</li>
                </ul>
              ) : (
                <ul>
                  <li>✅ View assigned emergencies</li>
                  <li>✅ Update incident status</li>
                  <li>✅ View response metrics</li>
                  <li>✅ Access officer dashboard</li>
                  <li>✅ Real-time notifications</li>
                </ul>
              )}
            </div>
          </form>
        )}

        <div className="login-footer">
          <p>
            <strong>Need help?</strong> Contact emergency support: support@emergency-response.com
          </p>
          <p className="emergency-contact">
            🚨 For immediate emergency assistance, call: 112 (EU) / 911 (US) / 108 (IN)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;