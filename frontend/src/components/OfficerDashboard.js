import React, { useState, useEffect } from 'react';
import './OfficerDashboard.css';

const OfficerDashboard = () => {
  const [assignedIncidents, setAssignedIncidents] = useState([]);
  const [officerInfo, setOfficerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned', 'available', 'history'
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState('available');

  // Mock officer data
  const mockOfficer = {
    id: 'OFF-002',
    name: 'Officer Johnson',
    badge: 'P-201',
    type: 'police',
    phone: '9876543202',
    email: 'johnson@emergency.gov',
    department: 'Police Response Unit',
    experience: '5 years'
  };

  // Mock incidents assigned to this officer
  const mockAssignedIncidents = [
    {
      id: 'INC-001236',
      description: 'Robbery in progress at bank',
      type: 'police',
      location: { lat: 12.9716, lng: 77.5946 },
      status: 'in_progress',
      severity: 'critical',
      timestamp: '2024-01-14T22:45:00Z',
      reporter: { name: 'Bank Manager', phone: '9876543212' },
      notes: 'Armed robbery, 2 suspects wearing black masks',
      priority: 1,
      estimatedArrival: '5 minutes'
    },
    {
      id: 'INC-001239',
      description: 'Domestic disturbance reported',
      type: 'police',
      location: { lat: 12.9717, lng: 77.5947 },
      status: 'pending',
      severity: 'medium',
      timestamp: '2024-01-15T13:30:00Z',
      reporter: { name: 'Neighbor', phone: '9876543215' },
      notes: 'Loud arguments heard, possible violence',
      priority: 2,
      estimatedArrival: '10 minutes'
    }
  ];

  // Mock available incidents for this officer type
  const mockAvailableIncidents = [
    {
      id: 'INC-001240',
      description: 'Suspicious package found',
      type: 'police',
      location: { lat: 12.9718, lng: 77.5948 },
      status: 'pending',
      severity: 'high',
      timestamp: '2024-01-15T14:00:00Z',
      reporter: { name: 'Security Guard', phone: '9876543216' },
      notes: 'Unattended bag at metro station',
      priority: 1,
      distance: '2.3 km'
    }
  ];

  useEffect(() => {
    fetchData();
    getCurrentLocation();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOfficerInfo(mockOfficer);
      setAssignedIncidents(mockAssignedIncidents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default location
          setCurrentLocation({ lat: 12.9716, lng: 77.5946, accuracy: 100 });
        }
      );
    }
  };

  const updateIncidentStatus = (incidentId, newStatus) => {
    const updatedIncidents = assignedIncidents.map(incident => {
      if (incident.id === incidentId) {
        return { ...incident, status: newStatus };
      }
      return incident;
    });
    
    setAssignedIncidents(updatedIncidents);
    
    // If status is completed, show completion modal
    if (newStatus === 'resolved') {
      alert(`Incident ${incidentId} marked as resolved!`);
    }
  };

  const acceptIncident = (incidentId) => {
    const incident = mockAvailableIncidents.find(i => i.id === incidentId);
    if (incident) {
      const updatedAssigned = [...assignedIncidents, { ...incident, status: 'assigned' }];
      setAssignedIncidents(updatedAssigned);
      alert(`Accepted incident ${incidentId}`);
    }
  };

  const updateOfficerStatus = (newStatus) => {
    setStatus(newStatus);
    alert(`Status updated to: ${newStatus}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#e74c3c';
      case 'assigned': return '#f39c12';
      case 'in_progress': return '#3498db';
      case 'resolved': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return '#e74c3c';
      case 2: return '#e67e22';
      case 3: return '#f1c40f';
      default: return '#2ecc71';
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    // Simple distance calculation (approximate)
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading officer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="officer-dashboard-container">
      <div className="dashboard-header">
        <div className="officer-profile">
          <div className="profile-avatar">
            {officerInfo.name.charAt(0)}
          </div>
          <div className="profile-info">
            <h1>👮 Officer Dashboard</h1>
            <p>{officerInfo.name} | {officerInfo.badge} | {officerInfo.department}</p>
          </div>
        </div>
        
        <div className="status-control">
          <div className="current-status">
            <span className="status-label">Current Status:</span>
            <select 
              className="status-select"
              value={status}
              onChange={(e) => updateOfficerStatus(e.target.value)}
            >
              <option value="available">🟢 Available</option>
              <option value="busy">🟡 Busy</option>
              <option value="on_break">🔵 On Break</option>
              <option value="off_duty">⚪ Off Duty</option>
            </select>
          </div>
          
          {currentLocation && (
            <div className="location-info">
              <span className="location-label">📍 Current Location:</span>
              <span className="location-value">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>Assigned Incidents</h3>
            <p className="stat-number">{assignedIncidents.length}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>Avg Response Time</h3>
            <p className="stat-number">8.2 min</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Resolved Today</h3>
            <p className="stat-number">3</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Performance Score</h3>
            <p className="stat-number">94%</p>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'assigned' ? 'active' : ''}`}
          onClick={() => setActiveTab('assigned')}
        >
          🎯 Assigned Incidents ({assignedIncidents.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          📋 Available Incidents ({mockAvailableIncidents.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 History
        </button>
      </div>

      {/* Assigned Incidents */}
      {activeTab === 'assigned' && (
        <div className="incidents-section">
          {assignedIncidents.length === 0 ? (
            <div className="no-incidents">
              <p>📭 No assigned incidents. You're all caught up!</p>
              <button className="check-available-btn" onClick={() => setActiveTab('available')}>
                Check Available Incidents
              </button>
            </div>
          ) : (
            <div className="assigned-incidents-list">
              {assignedIncidents.map(incident => (
                <div key={incident.id} className="incident-card">
                  <div className="incident-header">
                    <div className="incident-id">{incident.id}</div>
                    <div className="priority-badge" style={{ 
                      backgroundColor: getPriorityColor(incident.priority) 
                    }}>
                      Priority {incident.priority}
                    </div>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(incident.status) }}
                    >
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="incident-body">
                    <h3 className="incident-title">{incident.description}</h3>
                    
                    <div className="incident-details">
                      <div className="detail-row">
                        <div className="detail-item">
                          <span className="detail-label">📍 Location:</span>
                          <span className="detail-value">
                            {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                          </span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">📞 Reporter:</span>
                          <span className="detail-value">{incident.reporter.name} ({incident.reporter.phone})</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-item">
                          <span className="detail-label">⏱️ Reported:</span>
                          <span className="detail-value">
                            {new Date(incident.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {currentLocation && (
                          <div className="detail-item">
                            <span className="detail-label">📏 Distance:</span>
                            <span className="detail-value">
                              {calculateDistance(
                                currentLocation.lat,
                                currentLocation.lng,
                                incident.location.lat,
                                incident.location.lng
                              )} km
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {incident.notes && (
                        <div className="notes-section">
                          <strong>📝 Notes:</strong>
                          <p>{incident.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="incident-footer">
                    <div className="action-buttons">
                      <button 
                        className="btn-navigate"
                        onClick={() => {
                          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${incident.location.lat},${incident.location.lng}`;
                          window.open(mapsUrl, '_blank');
                        }}
                      >
                        🗺️ Navigate
                      </button>
                      
                      <button 
                        className="btn-call-reporter"
                        onClick={() => alert(`Calling ${incident.reporter.name}...`)}
                      >
                        📞 Call Reporter
                      </button>
                      
                      <select 
                        className="status-update-select"
                        value={incident.status}
                        onChange={(e) => updateIncidentStatus(incident.id, e.target.value)}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_scene">On Scene</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      
                      {incident.status === 'resolved' && (
                        <button className="btn-report" onClick={() => alert(`Generate report for ${incident.id}`)}>
                          📄 Generate Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Available Incidents */}
      {activeTab === 'available' && (
        <div className="available-incidents-section">
          {mockAvailableIncidents.length === 0 ? (
            <div className="no-available-incidents">
              <p>🎉 No available incidents. Great job!</p>
            </div>
          ) : (
            <div className="available-incidents-list">
              {mockAvailableIncidents.map(incident => (
                <div key={incident.id} className="available-incident-card">
                  <div className="incident-header">
                    <div className="incident-id">{incident.id}</div>
                    <div className="severity-badge" style={{ 
                      backgroundColor: getPriorityColor(incident.priority) 
                    }}>
                      {incident.severity.toUpperCase()}
                    </div>
                    <div className="distance-badge">
                      {incident.distance} away
                    </div>
                  </div>
                  
                  <div className="incident-body">
                    <h3>{incident.description}</h3>
                    
                    <div className="incident-details">
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{incident.type.toUpperCase()}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">
                          {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Reporter:</span>
                        <span className="detail-value">{incident.reporter.name}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Reported:</span>
                        <span className="detail-value">
                          {new Date(incident.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    {incident.notes && (
                      <div className="notes">
                        <strong>Notes:</strong> {incident.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="incident-footer">
                    <button 
                      className="btn-accept"
                      onClick={() => acceptIncident(incident.id)}
                    >
                      ✅ Accept Incident
                    </button>
                    
                    <button 
                      className="btn-view-details"
                      onClick={() => alert(`Viewing details for ${incident.id}`)}
                    >
                      👁️ View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="history-section">
          <div className="history-filters">
            <select className="filter-select">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>All time</option>
            </select>
            
            <select className="filter-select">
              <option>All types</option>
              <option>Police</option>
              <option>Medical</option>
              <option>Fire</option>
            </select>
          </div>
          
          <div className="history-stats">
            <div className="stat-box">
              <h4>Total Incidents Handled</h4>
              <p className="stat-number">127</p>
            </div>
            
            <div className="stat-box">
              <h4>Average Response Time</h4>
              <p className="stat-number">7.8 min</p>
            </div>
            
            <div className="stat-box">
              <h4>Resolved Rate</h4>
              <p className="stat-number">96%</p>
            </div>
          </div>
          
          <div className="history-table">
            <table>
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Response Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>INC-001200</td>
                  <td>Traffic accident</td>
                  <td>2024-01-14</td>
                  <td>6.5 min</td>
                  <td><span className="status-resolved">Resolved</span></td>
                </tr>
                <tr>
                  <td>INC-001195</td>
                  <td>Public disturbance</td>
                  <td>2024-01-13</td>
                  <td>8.2 min</td>
                  <td><span className="status-resolved">Resolved</span></td>
                </tr>
                <tr>
                  <td>INC-001190</td>
                  <td>Missing person</td>
                  <td>2024-01-12</td>
                  <td>9.1 min</td>
                  <td><span className="status-resolved">Resolved</span></td>
                </tr>
                <tr>
                  <td>INC-001185</td>
                  <td>Vandalism</td>
                  <td>2024-01-11</td>
                  <td>5.7 min</td>
                  <td><span className="status-resolved">Resolved</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions Panel */}
      <div className="quick-actions-panel">
        <h3>⚡ Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => alert('Opening map...')}>
            🗺️ View Map
          </button>
          <button className="action-btn" onClick={() => alert('Starting patrol...')}>
            🚗 Start Patrol
          </button>
          <button className="action-btn" onClick={() => alert('Reporting on duty...')}>
            📋 Report On Duty
          </button>
          <button className="action-btn" onClick={() => alert('Requesting backup...')}>
            🆘 Request Backup
          </button>
          <button className="action-btn" onClick={() => alert('Accessing resources...')}>
            📚 Resources
          </button>
          <button className="action-btn" onClick={() => alert('Calling dispatch...')}>
            📞 Call Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;