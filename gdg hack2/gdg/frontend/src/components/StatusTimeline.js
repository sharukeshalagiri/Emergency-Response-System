import React from 'react';
import { 
  FaCheckCircle, 
  FaTruck, 
  FaMapMarkerAlt, 
  FaFlagCheckered,
  FaClock
} from 'react-icons/fa';

const StatusTimeline = ({ status, updates }) => {
  const statuses = [
    { key: 'received', label: 'Reported', icon: <FaClock /> },
    { key: 'dispatched', label: 'Dispatched', icon: <FaTruck /> },
    { key: 'enroute', label: 'En Route', icon: <FaMapMarkerAlt /> },
    { key: 'arrived', label: 'Arrived', icon: <FaFlagCheckered /> },
    { key: 'resolved', label: 'Resolved', icon: <FaCheckCircle /> }
  ];

  const getStatusIndex = (status) => {
    return statuses.findIndex(s => s.key === status);
  };

  const currentIndex = getStatusIndex(status);
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="status-timeline">
      <h3>Response Timeline</h3>
      
      {statuses.map((statusItem, index) => {
        const isActive = index <= currentIndex;
        const update = updates?.find(u => u.status === statusItem.key);
        
        return (
          <div key={statusItem.key} className="timeline-item">
            <div className={`timeline-dot ${isActive ? 'active' : ''}`}>
              {statusItem.icon}
            </div>
            <div className="timeline-content">
              <h4>{statusItem.label}</h4>
              {update && (
                <p>
                  {formatTime(update.timestamp)} - {update.message}
                </p>
              )}
              {!update && index === 0 && (
                <p>Emergency reported successfully</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTimeline;