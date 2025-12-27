import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents', 'officers', 'analytics'
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');

  // Mock data
  const mockIncidents = [
    {
      id: 'INC-001234',
      description: 'Car accident with injuries on Main Street',
      type: 'medical',
      location: { lat: 28.6139, lng: 77.2090 },
      status: 'pending',
      severity: 'high',
      timestamp: '2024-01-15T10:30:00Z',
      assignedOfficer: null,
      reporter: { name: 'John Doe', phone: '9876543210' },
      notes: 'Two vehicles involved, multiple injuries'
    },
    {
      id: 'INC-001235',
      description: 'Fire in apartment building, 5th floor',
      type: 'fire',
      location: { lat: 19.0760, lng: 72.8777 },
      status: 'assigned',
      severity: 'critical',
      timestamp: '2024-01-15T09:15:00Z',
      assignedOfficer: { id: 'OFF-001', name: 'Officer Smith', type: 'fire' },
      reporter: { name: 'Jane Smith', phone: '9876543211' },
      notes: 'People trapped, need immediate evacuation'
    },
    {
      id: 'INC-001236',
      description: 'Robbery in progress at bank',
      type: 'police',
      location: { lat: 12.9716, lng: 77.5946 },
      status: 'in_progress',
      severity: 'critical',
      timestamp: '2024-01-14T22:45:00Z',
      assignedOfficer: { id: 'OFF-002', name: 'Officer Johnson', type: 'police' },
      reporter: { name: 'Bank Manager', phone: '9876543212' },
      notes: 'Armed robbery, 2 suspects'
    },
    {
      id: 'INC-001237',
      description: 'Heart attack emergency at Central Park',
      type: 'medical',
      location: { lat: 22.5726, lng: 88.3639 },
      status: 'pending',
      severity: 'critical',
      timestamp: '2024-01-15T11:20:00Z',
      assignedOfficer: null,
      reporter: { name: 'Park Visitor', phone: '9876543213' },
      notes: 'Elderly person collapsed, not breathing'
    },
    {
      id: 'INC-001238',
      description: 'Building collapse due to construction',
      type: 'fire',
      location: { lat: 17.3850, lng: 78.4867 },
      status: 'assigned',
      severity: 'critical',
      timestamp: '2024-01-15T12:00:00Z',
      assignedOfficer: { id: 'OFF-003', name: 'Officer Brown', type: 'fire' },
      reporter: { name: 'Construction Worker', phone: '9876543214' },
      notes: 'Multiple workers trapped under debris'
    }
  ];

  const mockOfficers = [
    { id: 'OFF-001', name: 'Officer Smith', badge: 'F-101', type: 'fire', status: 'available', phone: '9876543201' },
    { id: 'OFF-002', name: 'Officer Johnson', badge: 'P-201', type: 'police', status: 'busy', phone: '9876543202' },
    { id: 'OFF-003', name: 'Officer Brown', badge: 'F-102', type: 'fire', status: 'available', phone: '9876543203' },
    { id: 'OFF-004', name: 'Officer Davis', badge: 'M-301', type: 'medical', status: 'available', phone: '9876543204' },
    { id: 'OFF-005', name: 'Officer Wilson', badge: 'M-302', type: 'medical', status: 'off_duty', phone: '9876543205' },
    { id: 'OFF-006', name: 'Officer Miller', badge: 'P-202', type: 'police', status: 'available', phone: '9876543206' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIncidents(mockIncidents);
      setOfficers(mockOfficers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = incidents.length;
    const pending = incidents.filter(i => i.status === 'pending').length;
    const assigned = incidents.filter(i => i.status === 'assigned' || i.status === 'in_progress').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const availableOfficers = officers.filter(o => o.status === 'available').length;

    return { total, pending, assigned, resolved, availableOfficers };
  };

  const handleAssignOfficer = (incidentId) => {
    const incident = incidents.find(i => i.id === incidentId);
    setSelectedIncident(incident);
    setShowAssignModal(true);
  };

  const confirmAssignment = () => {
    if (!selectedIncident || !selectedOfficerId) {
      alert('Please select an officer');
      return;
    }

    const officer = officers.find(o => o.id === selectedOfficerId);
    const updatedIncidents = incidents.map(incident => {
      if (incident.id === selectedIncident.id) {
        return {
          ...incident,
          status: 'assigned',
          assignedOfficer: {
            id: officer.id,
            name: officer.name,
            type: officer.type,
            badge: officer.badge
          }
        };
      }
      return incident;
    });

    // Update officer status
    const updatedOfficers = officers.map(o => {
      if (o.id === selectedOfficerId) {
        return { ...o, status: 'busy' };
      }
      return o;
    });

    setIncidents(updatedIncidents);
    setOfficers(updatedOfficers);
    setShowAssignModal(false);
    setSelectedIncident(null);
    setSelectedOfficerId('');
    
    alert(`Assigned ${selectedIncident.id} to ${officer.name}`);
  };

  const updateIncidentStatus = (incidentId, newStatus) => {
    const updatedIncidents = incidents.map(incident => {
      if (incident.id === incidentId) {
        // If status is resolved, free up the officer
        if (newStatus === 'resolved' && incident.assignedOfficer) {
          const updatedOfficers = officers.map(o => {
            if (o.id === incident.assignedOfficer.id) {
              return { ...o, status: 'available' };
            }
            return o;
          });
          setOfficers(updatedOfficers);
        }
        
        return { ...incident, status: newStatus };
      }
      return incident;
    });

    setIncidents(updatedIncidents);
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f1c40f';
      case 'low': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'medical': return '⚕️';
      case 'fire': return '🔥';
      case 'police': return '👮';
      default: return '📋';
    }
  };

  const getOfficerStatusColor = (status) => {
    switch (status) {
      case 'available': return '#27ae60';
      case 'busy': return '#e67e22';
      case 'off_duty': return '#95a5a6';
      case 'on_break': return '#3498db';
      default: return '#7f8c8d';
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1> Emergency Response Admin Dashboard</h1>
        <p>Monitor, assign, and manage emergency incidents in real-time</p>
      </div>

      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
           Incidents
        </button>
        <button 
          className={`tab-btn ${activeTab === 'officers' ? 'active' : ''}`}
          onClick={() => setActiveTab('officers')}
        >
           Officers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
           Analytics
        </button>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Total Incidents</h3>
            <p className="stat-number">{stats.total}</p>
            <p className="stat-subtitle">Today: {stats.total}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending}</p>
            <p className="stat-subtitle">Requiring assignment</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Assigned</h3>
            <p className="stat-number">{stats.assigned}</p>
            <p className="stat-subtitle">In progress</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <h3>Resolved</h3>
            <p className="stat-number">{stats.resolved}</p>
            <p className="stat-subtitle">Today: {stats.resolved}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Available Officers</h3>
            <p className="stat-number">{stats.availableOfficers}</p>
            <p className="stat-subtitle">Total: {officers.length}</p>
          </div>
        </div>
      </div>

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="incidents-section">
          <div className="section-header">
            <h2> All Incidents</h2>
            <div className="header-actions">
              <button className="refresh-btn" onClick={fetchData}>
                Refresh
              </button>
              <button className="export-btn">
                 Export CSV
              </button>
            </div>
          </div>

          {incidents.length === 0 ? (
            <div className="no-data">
              <p>📭 No incidents reported yet</p>
            </div>
          ) : (
            <div className="incidents-list">
              {incidents.map(incident => (
                <div key={incident.id} className="incident-card">
                  <div className="incident-header">
                    <div className="incident-id">{incident.id}</div>
                    <div className="incident-actions">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(incident.status) }}
                      >
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span 
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(incident.severity) }}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="incident-body">
                    <div className="incident-type">
                      <span className="type-icon">{getTypeIcon(incident.type)}</span>
                      <span className="type-label">{incident.type.toUpperCase()}</span>
                    </div>
                    
                    <p className="incident-description">{incident.description}</p>
                    
                    <div className="incident-details">
                      <div className="detail-item">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">
                          {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Reporter:</span>
                        <span className="detail-value">{incident.reporter.name} ({incident.reporter.phone})</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">
                          {new Date(incident.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="detail-label">Assigned Officer:</span>
                        <span className="detail-value">
                          {incident.assignedOfficer ? (
                            <span className="assigned-officer">
                              {incident.assignedOfficer.name} ({incident.assignedOfficer.badge})
                            </span>
                          ) : (
                            <span className="not-assigned">Not assigned</span>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    {incident.notes && (
                      <div className="incident-notes">
                        <strong>Notes:</strong> {incident.notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="incident-footer">
                    <div className="action-buttons">
                      {!incident.assignedOfficer ? (
                        <button 
                          className="assign-btn"
                          onClick={() => handleAssignOfficer(incident.id)}
                        >
                           Assign Officer
                        </button>
                      ) : (
                        <div className="officer-actions">
                          <button 
                            className="contact-btn"
                            onClick={() => alert(`Calling ${incident.assignedOfficer.name}...`)}
                          >
                             Contact Officer
                          </button>
                          <button 
                            className="resolve-btn"
                            onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                          >
                             Mark Resolved
                          </button>
                        </div>
                      )}
                      
                      <div className="status-controls">
                        <select 
                          className="status-select"
                          value={incident.status}
                          onChange={(e) => updateIncidentStatus(incident.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Officers Tab */}
      {activeTab === 'officers' && (
        <div className="officers-section">
          <div className="section-header">
            <h2>👮 Emergency Officers</h2>
            <button className="add-officer-btn">
              ➕ Add New Officer
            </button>
          </div>
          
          <div className="officers-grid">
            {officers.map(officer => (
              <div key={officer.id} className="officer-card">
                <div className="officer-header">
                  <div className="officer-badge">{officer.badge}</div>
                  <span 
                    className="officer-status"
                    style={{ backgroundColor: getOfficerStatusColor(officer.status) }}
                  >
                    {officer.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="officer-body">
                  <h3 className="officer-name">{officer.name}</h3>
                  <div className="officer-type">
                    <span className="type-icon">{getTypeIcon(officer.type)}</span>
                    <span className="type-label">{officer.type.toUpperCase()}</span>
                  </div>
                  
                  <div className="officer-contact">
                    <span className="contact-label">Phone:</span>
                    <span className="contact-value">{officer.phone}</span>
                  </div>
                  
                  {/* Assigned Incidents */}
                  <div className="assigned-incidents">
                    <strong>Assigned Incidents:</strong>
                    <div className="incident-list">
                      {incidents
                        .filter(i => i.assignedOfficer?.id === officer.id)
                        .map(incident => (
                          <div key={incident.id} className="mini-incident">
                            <span className="incident-id-small">{incident.id}</span>
                            <span className="incident-status-small" style={{ 
                              color: getStatusColor(incident.status) 
                            }}>
                              {incident.status}
                            </span>
                          </div>
                        ))
                      }
                      {incidents.filter(i => i.assignedOfficer?.id === officer.id).length === 0 && (
                        <span className="no-assignments">No assignments</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="officer-footer">
                  <button 
                    className="update-status-btn"
                    onClick={() => {
                      const newStatus = officer.status === 'available' ? 'busy' : 'available';
                      const updatedOfficers = officers.map(o => 
                        o.id === officer.id ? { ...o, status: newStatus } : o
                      );
                      setOfficers(updatedOfficers);
                    }}
                  >
                    Update Status
                  </button>
                  <button 
                    className="contact-officer-btn"
                    onClick={() => alert(`Calling ${officer.name}...`)}
                  >
                     Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <div className="section-header">
            <h2> System Analytics</h2>
            <div className="time-filter">
              <select className="filter-select">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last quarter</option>
              </select>
            </div>
          </div>
          
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Incidents by Type</h3>
              <div className="type-distribution">
                <div className="type-item">
                  <span className="type-label">Medical</span>
                  <div className="type-bar">
                    <div 
                      className="type-fill medical"
                      style={{ width: `${(incidents.filter(i => i.type === 'medical').length / incidents.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="type-count">
                    {incidents.filter(i => i.type === 'medical').length}
                  </span>
                </div>
                <div className="type-item">
                  <span className="type-label">Fire</span>
                  <div className="type-bar">
                    <div 
                      className="type-fill fire"
                      style={{ width: `${(incidents.filter(i => i.type === 'fire').length / incidents.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="type-count">
                    {incidents.filter(i => i.type === 'fire').length}
                  </span>
                </div>
                <div className="type-item">
                  <span className="type-label">Police</span>
                  <div className="type-bar">
                    <div 
                      className="type-fill police"
                      style={{ width: `${(incidents.filter(i => i.type === 'police').length / incidents.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="type-count">
                    {incidents.filter(i => i.type === 'police').length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="analytics-card">
              <h3>Response Times</h3>
              <div className="response-stats">
                <div className="stat-item">
                  <span className="stat-label">Average Response Time:</span>
                  <span className="stat-value">8.5 minutes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Fastest Response:</span>
                  <span className="stat-value">3.2 minutes</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Slowest Response:</span>
                  <span className="stat-value">15.7 minutes</span>
                </div>
              </div>
            </div>
            
            <div className="analytics-card">
              <h3>Officer Performance</h3>
              <div className="performance-list">
                {officers.map(officer => {
                  const assignedCount = incidents.filter(i => i.assignedOfficer?.id === officer.id).length;
                  const resolvedCount = incidents.filter(i => 
                    i.assignedOfficer?.id === officer.id && i.status === 'resolved'
                  ).length;
                  const performance = assignedCount > 0 ? Math.round((resolvedCount / assignedCount) * 100) : 0;
                  
                  return (
                    <div key={officer.id} className="performance-item">
                      <span className="officer-name-small">{officer.name}</span>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ width: `${performance}%` }}
                        ></div>
                      </div>
                      <span className="performance-value">{performance}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Officer Modal */}
      {showAssignModal && selectedIncident && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="assign-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Officer to {selectedIncident.id}</h3>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <p><strong>Incident:</strong> {selectedIncident.description}</p>
              <p><strong>Type:</strong> {selectedIncident.type.toUpperCase()}</p>
              <p><strong>Severity:</strong> {selectedIncident.severity.toUpperCase()}</p>
              
              <div className="form-group">
                <label>Select Available Officer:</label>
                <select 
                  className="officer-select"
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                >
                  <option value="">-- Select Officer --</option>
                  {officers
                    .filter(o => o.type === selectedIncident.type && o.status === 'available')
                    .map(officer => (
                      <option key={officer.id} value={officer.id}>
                        {officer.name} ({officer.badge}) - {officer.type}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              {selectedOfficerId && (
                <div className="selected-officer">
                  <h4>Selected Officer:</h4>
                  <div className="officer-info">
                    {(() => {
                      const officer = officers.find(o => o.id === selectedOfficerId);
                      return officer ? (
                        <>
                          <p><strong>Name:</strong> {officer.name}</p>
                          <p><strong>Badge:</strong> {officer.badge}</p>
                          <p><strong>Phone:</strong> {officer.phone}</p>
                          <p><strong>Status:</strong> {officer.status}</p>
                        </>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm"
                onClick={confirmAssignment}
                disabled={!selectedOfficerId}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;