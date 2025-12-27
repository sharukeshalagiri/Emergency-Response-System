import React, { useState, useEffect } from 'react';
import { FaAmbulance, FaTruck, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';

const Confirmation = ({ incident, onBack }) => {
  const [status, setStatus] = useState('received');
  const [liveUpdates, setLiveUpdates] = useState([]);

  useEffect(() => {
    if (!incident) return;

    // Simulate status updates
    const updates = [
      { status: 'dispatched', delay: 3000, message: 'Responder dispatched to location' },
      { status: 'enroute', delay: 8000, message: 'Responder en route to your location' },
      { status: 'arrived', delay: 15000, message: 'Responder arrived at scene' },
      { status: 'resolved', delay: 25000, message: 'Incident resolved successfully' }
    ];

    updates.forEach(({ status, delay, message }) => {
      setTimeout(() => {
        setStatus(status);
        setLiveUpdates(prev => [...prev, {
          status,
          message,
          timestamp: new Date().toISOString()
        }]);
      }, delay);
    });
  }, [incident]);

  const statuses = [
    { key: 'received', label: 'Reported', icon: <FaCheckCircle /> },
    { key: 'dispatched', label: 'Dispatched', icon: <FaTruck /> },
    { key: 'enroute', label: 'En Route', icon: <FaMapMarkerAlt /> },
    { key: 'arrived', label: 'Arrived', icon: <FaAmbulance /> },
    { key: 'resolved', label: 'Resolved', icon: <FaCheckCircle /> }
  ];

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="confirmation">
      <div className="confirmation-box">
        <h2>🚨 Emergency Reported Successfully!</h2>
        <div className="dispatch-id">{incident?.id}</div>
        <p>Help is on the way! Track response below:</p>
      </div>

      <div className="responder-info">
        <h3><FaAmbulance /> Assigned Responder</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '15px 0' }}>
          <div style={{ 
            background: '#4CAF50', 
            color: 'white', 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {incident?.assignedResponder?.id?.charAt(0) || 'R'}
          </div>
          <div>
            <h4>{incident?.assignedResponder?.name}</h4>
            <p style={{ color: '#666' }}>
              {incident?.type?.charAt(0).toUpperCase() + incident?.type?.slice(1)} Unit
            </p>
          </div>
        </div>
        
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '15px'
        }}>
          <p><strong>Estimated arrival:</strong> 8-12 minutes</p>
          <p><strong>Distance:</strong> ~2.4 km</p>
        </div>
      </div>

      <div className="status-timeline">
        <h3>Response Timeline</h3>
        {statuses.map((statusItem, index) => {
          const isActive = statuses.findIndex(s => s.key === status) >= index;
          return (
            <div key={statusItem.key} className="timeline-item">
              <div className={`timeline-dot ${isActive ? 'active' : ''}`}>
                {statusItem.icon}
              </div>
              <div className="timeline-content">
                <h4>{statusItem.label}</h4>
                {status === statusItem.key && (
                  <p>Current status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {liveUpdates.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>📡 Live Updates</h3>
          {liveUpdates.slice(0, 3).map((update, index) => (
            <div key={index} className="live-update">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Update {index + 1}</strong>
                <small>{formatTime(update.timestamp)}</small>
              </div>
              <p>{update.message}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '15px', 
        margin: '25px 0' 
      }}>
        <div className="metric-card">
          <div className="metric-value">45s</div>
          <div className="metric-label">Time Saved</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">5</div>
          <div className="metric-label">Languages</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">94%</div>
          <div className="metric-label">Accuracy</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">24/7</div>
          <div className="metric-label">Availability</div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={onBack}>
        ← Report Another Emergency
      </button>
    </div>
  );
};

export default Confirmation;