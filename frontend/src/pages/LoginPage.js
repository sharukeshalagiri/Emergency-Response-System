import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock credentials
  const mockCredentials = {
    admin: { username: 'admin', password: 'admin123' },
    officer: { username: 'officer', password: 'officer123' }
  };

  const handleUserLogin = () => {
    const userData = {
      id: 'user-' + Date.now(),
      name: 'Emergency User',
      role: 'user',
      email: 'user@example.com'
    };
    localStorage.setItem('user', JSON.stringify(userData));
    onLogin(userData);
    navigate('/');
  };

  const handleCredentialLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
          navigate('/');
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
          navigate('/');
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
    <div className="login-page-container">
      <div className="login-page-left">
        <div className="login-page-brand">
          <h1>🚨 Emergency Response System</h1>
          <p>Fast, reliable emergency reporting and response coordination</p>
        </div>
        
        <div className="login-page-features">
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">
              <h4>Instant Reporting</h4>
              <p>Report emergencies in under 30 seconds</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📍</div>
            <div className="feature-text">
              <h4>Precise Location</h4>
              <p>GPS accuracy for faster response</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">📱</div>
            <div className="feature-text">
              <h4>24/7 Availability</h4>
              <p>Always available when you need it most</p>
            </div>
          </div>
          
          <div className="feature-item">
            <div className="feature-icon">🛡️</div>
            <div className="feature-text">
              <h4>Secure & Private</h4>
              <p>Your data is protected and encrypted</p>
            </div>
          </div>
        </div>
        
        <div className="login-page-stats">
          <div className="stat">
            <h3>50,000+</h3>
            <p>Emergencies Reported</p>
          </div>
          <div className="stat">
            <h3>98.7%</h3>
            <p>Response Accuracy</p>
          </div>
          <div className="stat">
            <h3>2.5min</h3>
            <p>Avg. Response Time</p>
          </div>
        </div>
      </div>
      
      <div className="login-page-right">
        <div className="login-page-card">
          <div className="login-page-header">
            <h2>Welcome Back</h2>
            <p>Select your role to continue</p>
          </div>

          <div className="role-selection">
            <button
              className={`role-btn ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              <div className="role-icon">👤</div>
              <div className="role-info">
                <h4>Public User</h4>
                <p>Report emergencies</p>
              </div>
            </button>
            
            <button
              className={`role-btn ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <div className="role-icon">🔧</div>
              <div className="role-info">
                <h4>Administrator</h4>
                <p>Manage system</p>
              </div>
            </button>
            
            <button
              className={`role-btn ${activeTab === 'officer' ? 'active' : ''}`}
              onClick={() => setActiveTab('officer')}
            >
              <div className="role-icon">👮</div>
              <div className="role-info">
                <h4>Emergency Officer</h4>
                <p>Respond to incidents</p>
              </div>
            </button>
          </div>

          {/* User Login */}
          {activeTab === 'user' && (
            <div className="user-login-section">
              <div className="user-login-info">
                <h3>Report Emergencies Anonymously</h3>
                <p>No account needed. Start reporting immediately.</p>
              </div>
              <button className="user-login-action-btn" onClick={handleUserLogin}>
                🚨 Continue as Public User
              </button>
              <p className="user-note">
                Your reports will be anonymous. For full features, login as officer or admin.
              </p>
            </div>
          )}

          {/* Admin/Officer Login */}
          {(activeTab === 'admin' || activeTab === 'officer') && (
            <form className="credential-login-form" onSubmit={handleCredentialLogin}>
              <h3>{activeTab === 'admin' ? 'Administrator Login' : 'Officer Login'}</h3>
              
              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`Enter ${activeTab} username`}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="demo-section">
                <p className="demo-label">Demo Credentials:</p>
                <button 
                  type="button"
                  className="demo-fill-btn"
                  onClick={() => handleQuickLogin(activeTab)}
                >
                  Fill {activeTab === 'admin' ? 'Admin (admin/admin123)' : 'Officer (officer/officer123)'}
                </button>
              </div>

              {error && <div className="error-alert">{error}</div>}

              <button 
                type="submit" 
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span> Authenticating...
                  </>
                ) : (
                  `Login as ${activeTab === 'admin' ? 'Administrator' : 'Officer'}`
                )}
              </button>

              <div className="role-permissions-section">
                <h4>Access Permissions:</h4>
                {activeTab === 'admin' ? (
                  <ul>
                    <li>✅ Full system administration</li>
                    <li>✅ View all emergency reports</li>
                    <li>✅ Manage users and responders</li>
                    <li>✅ Analytics and reporting</li>
                  </ul>
                ) : (
                  <ul>
                    <li>✅ View assigned emergencies</li>
                    <li>✅ Update response status</li>
                    <li>✅ Access officer dashboard</li>
                    <li>✅ Real-time notifications</li>
                  </ul>
                )}
              </div>
            </form>
          )}

          <div className="login-page-footer">
            <p className="emergency-contact">
              🚨 For immediate emergency: <strong>112 (EU) | 911 (US) | 108 (IN)</strong>
            </p>
            <p className="support-contact">
              Need help? Contact: <strong>support@emergency-response.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;