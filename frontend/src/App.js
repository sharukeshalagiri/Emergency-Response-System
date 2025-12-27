import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Header from './components/Header';
import LocationPicker from './components/LocationPicker';
import AdminDashboard from './components/AdminDashboard';
import OfficerDashboard from './components/OfficerDashboard';
import About from './components/About';
import LoginPage from './pages/LoginPage';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('report');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('medical');
  const [location, setLocation] = useState(null);
  const [incidentId, setIncidentId] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [recentIncidents, setRecentIncidents] = useState([]);

  useEffect(() => {
    // Check for stored user (only for admin/officer)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load recent incidents from localStorage
    const storedIncidents = localStorage.getItem('recentIncidents');
    if (storedIncidents) {
      setRecentIncidents(JSON.parse(storedIncidents));
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-login as public user on first visit
  useEffect(() => {
    if (!user) {
      const publicUser = {
        id: 'public-user',
        name: 'Public User',
        role: 'user',
        email: 'user@public.com'
      };
      setUser(publicUser);
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Reset to public user
    const publicUser = {
      id: 'public-user',
      name: 'Public User',
      role: 'user',
      email: 'user@public.com'
    };
    setUser(publicUser);
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setShowMap(false);
  };

  const submitReport = () => {
    if (!description.trim()) {
      alert('Please describe the emergency');
      return;
    }
    
    if (!location) {
      alert('Please select a location');
      return;
    }
    
    const id = `INC-${Date.now().toString().slice(-6)}`;
    setIncidentId(id);
    
    // Save incident to localStorage
    const newIncident = {
      id,
      description,
      type,
      location,
      timestamp: new Date().toISOString(),
      status: 'pending',
      severity: type === 'medical' ? 'high' : 
                type === 'fire' ? 'critical' : 'medium',
      reporter: user?.name || 'Public User'
    };
    
    const updatedIncidents = [newIncident, ...recentIncidents.slice(0, 4)];
    setRecentIncidents(updatedIncidents);
    localStorage.setItem('recentIncidents', JSON.stringify(updatedIncidents));
    
    setView('confirmation');
  };

  const getLocation = () => {
    setShowMap(true);
  };

  const sampleReports = [
    "🚗 Car accident with injuries at Main Street intersection",
    "🔥 Fire in apartment building, people trapped inside",
    "⚕️ Person collapsed, not breathing, needs immediate medical attention",
    "👮 Robbery in progress at local convenience store",
    "🏢 Building collapse with multiple workers trapped",
    "💔 Heart attack emergency, elderly person needs CPR"
  ];

  const getRandomSample = () => {
    return sampleReports[Math.floor(Math.random() * sampleReports.length)];
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showMap) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showMap]);

  const getEmergencyTypeColor = (type) => {
    switch(type) {
      case 'medical': return '#e74c3c';
      case 'fire': return '#e67e22';
      case 'police': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <Router>
      <div className="app">
        <Header user={user} onLogout={handleLogout} />
        {!isOnline && (
          <div className="offline-banner">
            ⚠️ Offline Mode - Reports will be saved locally and synced when back online
          </div>
        )}
        
        {/* Map Modal */}
        {showMap && (
          <div className="modal-overlay" onClick={() => setShowMap(false)}>
            <div className="location-picker-modal" onClick={(e) => e.stopPropagation()}>
              <LocationPicker 
                onLocationSelect={handleLocationSelect}
                onClose={() => setShowMap(false)}
              />
            </div>
          </div>
        )}
        
        <Routes>
          {/* Public Home Page - No login required */}
          <Route path="/" element={
            <div className="container">
              <div className="page-header">
                <h1>🚨 Emergency Response System</h1>
                <p>Fast reporting • Real-time tracking • Map-based location • 24/7 Support</p>
              </div>

              {/* Quick Stats */}
              <div className="quick-stats-bar">
                <div className="stat-item">
                  <span className="stat-number">{recentIncidents.length}</span>
                  <span className="stat-label">Incidents Today</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">94%</span>
                  <span className="stat-label">Response Accuracy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2.5min</span>
                  <span className="stat-label">Avg. Response Time</span>
                </div>
              </div>

              <div className="main">
                {view === 'report' ? (
                  <div className="report-section">
                    <div className="report-form-container">
                      <div className="form-header">
                        <h2>📝 Report Emergency</h2>
                        <p>Fill in the details below to report an emergency. Your report will be immediately sent to emergency services.</p>
                      </div>
                      
                      <div className="report-form">
                        <div className="form-group">
                          <label>
                            <span className="label-icon">📋</span>
                            Emergency Description
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the emergency in detail. Include: What happened, number of people involved, visible injuries, immediate dangers..."
                            rows="4"
                          />
                          <button 
                            className="sample-btn"
                            onClick={() => setDescription(getRandomSample())}
                          >
                            🚨 Use Sample Emergency
                          </button>
                        </div>

                        <div className="form-group">
                          <label>
                            <span className="label-icon">🏷️</span>
                            Emergency Type
                          </label>
                          <div className="type-buttons">
                            <button
                              className={`type-btn ${type === 'medical' ? 'active' : ''}`}
                              onClick={() => setType('medical')}
                              style={type === 'medical' ? {borderColor: getEmergencyTypeColor('medical')} : {}}
                            >
                              <span className="type-icon">⚕️</span>
                              <span className="type-label">Medical</span>
                              <span className="type-sub">Ambulance needed</span>
                            </button>
                            <button
                              className={`type-btn ${type === 'fire' ? 'active' : ''}`}
                              onClick={() => setType('fire')}
                              style={type === 'fire' ? {borderColor: getEmergencyTypeColor('fire')} : {}}
                            >
                              <span className="type-icon">🔥</span>
                              <span className="type-label">Fire</span>
                              <span className="type-sub">Fire department</span>
                            </button>
                            <button
                              className={`type-btn ${type === 'police' ? 'active' : ''}`}
                              onClick={() => setType('police')}
                              style={type === 'police' ? {borderColor: getEmergencyTypeColor('police')} : {}}
                            >
                              <span className="type-icon">👮</span>
                              <span className="type-label">Police</span>
                              <span className="type-sub">Police response</span>
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>
                            <span className="label-icon">📍</span>
                            Location Selection
                          </label>
                          <div className="location-section">
                            <button className="location-btn" onClick={getLocation}>
                              <span className="btn-icon">🗺️</span>
                              Click to Open Map & Select Location
                              <span className="btn-sub">Accurate location saves critical time</span>
                            </button>
                            {location && (
                              <div className="location-details">
                                <div className="location-success">
                                  <span className="success-icon">✅</span>
                                  <span className="success-text">Location Selected</span>
                                </div>
                                <div className="location-coordinates">
                                  <div className="coord">
                                    <span className="coord-label">Latitude:</span>
                                    <span className="coord-value">{location.lat.toFixed(6)}</span>
                                  </div>
                                  <div className="coord">
                                    <span className="coord-label">Longitude:</span>
                                    <span className="coord-value">{location.lng.toFixed(6)}</span>
                                  </div>
                                  <div className="coord">
                                    <span className="coord-label">Accuracy:</span>
                                    <span className="coord-value">±{location.accuracy}m</span>
                                  </div>
                                </div>
                                <button 
                                  className="change-location-btn"
                                  onClick={() => setShowMap(true)}
                                >
                                  📍 Change Location
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <button className="submit-btn" onClick={submitReport}>
                          <span className="submit-icon">🚨</span>
                          SEND EMERGENCY REPORT
                          <span className="submit-sub">Emergency services will be notified immediately</span>
                        </button>

                        <div className="demo-note">
                          <div className="note-header">
                            <span className="note-icon">⚠️</span>
                            <span className="note-title">DEMO SYSTEM</span>
                          </div>
                          <p className="note-content">
                            This is a demonstration system. For real emergencies, call:
                            <div className="emergency-numbers">
                              <span className="country">🇮🇳 India: </span>
                              <span className="number">112 / 108</span>
                              <span className="country">🇺🇸 US: </span>
                              <span className="number">911</span>
                              <span className="country">🇬🇧 UK: </span>
                              <span className="number">999</span>
                            </div>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Incidents Sidebar */}
                    <div className="recent-incidents-sidebar">
                      <div className="sidebar-header">
                        <h3>📊 Recent Reports</h3>
                        <button 
                          className="refresh-btn"
                          onClick={() => {
                            const stored = localStorage.getItem('recentIncidents');
                            if (stored) {
                              setRecentIncidents(JSON.parse(stored));
                            }
                          }}
                        >
                          🔄
                        </button>
                      </div>
                      
                      {recentIncidents.length === 0 ? (
                        <div className="no-reports">
                          <span className="no-reports-icon">📭</span>
                          <p>No recent reports</p>
                          <small>Your reports will appear here</small>
                        </div>
                      ) : (
                        <div className="incidents-list">
                          {recentIncidents.map((incident, index) => (
                            <div key={index} className="incident-item">
                              <div className="incident-header">
                                <span className="incident-id">{incident.id}</span>
                                <span 
                                  className="incident-type-badge"
                                  style={{backgroundColor: getEmergencyTypeColor(incident.type)}}
                                >
                                  {incident.type}
                                </span>
                              </div>
                              <p className="incident-desc">{incident.description}</p>
                              <div className="incident-footer">
                                <span className="incident-time">
                                  {new Date(incident.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="incident-status">
                                  {incident.status === 'pending' ? '⏳ Pending' : 
                                   incident.status === 'assigned' ? '👮 Assigned' : '✅ Resolved'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="sidebar-footer">
                        <p className="disclaimer">
                          <strong>Note:</strong> All reports are stored locally in your browser for demonstration purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="confirmation-section">
                    <div className="confirmation-card">
                      <div className="confirmation-header">
                        <div className="success-animation">
                          <div className="success-icon-large">✅</div>
                          <div className="success-pulse"></div>
                        </div>
                        <h2>Emergency Reported Successfully!</h2>
                        <p className="confirmation-subtitle">
                          Your emergency report has been sent to all available responders in the area.
                        </p>
                      </div>
                      
                      <div className="dispatch-card">
                        <div className="dispatch-header">
                          <h3>🚑 Dispatch Information</h3>
                          <span className="dispatch-id">ID: {incidentId}</span>
                        </div>
                        
                        <div className="dispatch-details">
                          <div className="detail-row">
                            <div className="detail-col">
                              <span className="detail-label">Emergency Type:</span>
                              <span 
                                className="detail-value type-highlight"
                                style={{color: getEmergencyTypeColor(type)}}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </span>
                            </div>
                            <div className="detail-col">
                              <span className="detail-label">Location:</span>
                              <span className="detail-value">
                                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="detail-row">
                            <div className="detail-col">
                              <span className="detail-label">Assigned Unit:</span>
                              <span className="detail-value assigned-unit">
                                {type === 'medical' ? '🚑 Ambulance Unit 101' :
                                 type === 'fire' ? '🚒 Fire Truck 301' : '🚔 Police Patrol 201'}
                              </span>
                            </div>
                            <div className="detail-col">
                              <span className="detail-label">Estimated Arrival:</span>
                              <span className="detail-value eta">8-12 minutes</span>
                            </div>
                          </div>
                          
                          <div className="response-team">
                            <h4>Response Team Details:</h4>
                            <div className="team-members">
                              <div className="team-member">
                                <span className="member-role">👨‍⚕️ Paramedic</span>
                                <span className="member-name">Dr. Smith</span>
                                <span className="member-status">En route</span>
                              </div>
                              <div className="team-member">
                                <span className="member-role">👮 Police Officer</span>
                                <span className="member-name">Officer Johnson</span>
                                <span className="member-status">On standby</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="status-timeline">
                        <h3>Response Progress</h3>
                        <div className="timeline">
                          <div className="timeline-step active">
                            <div className="step-number">1</div>
                            <div className="step-label">Reported</div>
                            <div className="step-time">Just now</div>
                          </div>
                          <div className="timeline-connector active"></div>
                          <div className="timeline-step">
                            <div className="step-number">2</div>
                            <div className="step-label">Dispatched</div>
                            <div className="step-time">~1 min</div>
                          </div>
                          <div className="timeline-connector"></div>
                          <div className="timeline-step">
                            <div className="step-number">3</div>
                            <div className="step-label">En Route</div>
                            <div className="step-time">~3 min</div>
                          </div>
                          <div className="timeline-connector"></div>
                          <div className="timeline-step">
                            <div className="step-number">4</div>
                            <div className="step-label">On Scene</div>
                            <div className="step-time">~8 min</div>
                          </div>
                          <div className="timeline-connector"></div>
                          <div className="timeline-step">
                            <div className="step-number">5</div>
                            <div className="step-label">Resolved</div>
                            <div className="step-time">~15 min</div>
                          </div>
                        </div>
                      </div>

                      <div className="metrics-panel">
                        <h3>Response Metrics</h3>
                        <div className="metrics-grid">
                          <div className="metric-card">
                            <div className="metric-icon">⏱️</div>
                            <div className="metric-content">
                              <div className="metric-value">45s</div>
                              <div className="metric-label">Time Saved</div>
                            </div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-icon">🎯</div>
                            <div className="metric-content">
                              <div className="metric-value">94%</div>
                              <div className="metric-label">Location Accuracy</div>
                            </div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-icon">📱</div>
                            <div className="metric-content">
                              <div className="metric-value">24/7</div>
                              <div className="metric-label">Available</div>
                            </div>
                          </div>
                          <div className="metric-card">
                            <div className="metric-icon">👥</div>
                            <div className="metric-content">
                              <div className="metric-value">3</div>
                              <div className="metric-label">Responders</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button 
                          className="back-btn"
                          onClick={() => setView('report')}
                        >
                          ← Report Another Emergency
                        </button>
                        <button 
                          className="share-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(`Emergency Report ID: ${incidentId}`);
                            alert('Incident ID copied to clipboard!');
                          }}
                        >
                          📋 Copy Incident ID
                        </button>
                        <button 
                          className="track-btn"
                          onClick={() => alert('Tracking feature coming soon!')}
                        >
                          📍 Track Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          } />
          
          {/* About Page - No login required */}
          <Route path="/about" element={<About />} />
          
          {/* Admin/Officer Login Page */}
          <Route path="/login" element={
            user?.role === 'admin' || user?.role === 'officer' ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          } />
          
          {/* Admin Dashboard - Requires admin role */}
          <Route path="/admin" element={
            user?.role === 'admin' ? (
              <AdminDashboard />
            ) : user ? (
              <div className="access-denied-container">
                <div className="access-denied">
                  <div className="denied-icon">⛔</div>
                  <h2>Access Denied</h2>
                  <p>You need administrator privileges to access the admin dashboard.</p>
                  <div className="denied-actions">
                    <button onClick={() => window.history.back()}>
                      ← Go Back
                    </button>
                    <button onClick={handleLogout}>
                      🔄 Switch Account
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Officer Dashboard - Requires officer role */}
          <Route path="/officer" element={
            user?.role === 'officer' || user?.role === 'admin' ? (
              <OfficerDashboard />
            ) : user ? (
              <div className="access-denied-container">
                <div className="access-denied">
                  <div className="denied-icon">👮</div>
                  <h2>Officer Access Required</h2>
                  <p>This dashboard is only accessible to emergency officers and administrators.</p>
                  <div className="denied-actions">
                    <button onClick={() => window.history.back()}>
                      ← Go Back
                    </button>
                    <button onClick={handleLogout}>
                      🔄 Switch Account
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Default redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;