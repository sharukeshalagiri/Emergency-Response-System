import React, { useState, useEffect } from 'react';
import LocationPicker from './LocationPicker';
import { 
  FaMicrophone, 
  FaMapMarkerAlt, 
  FaAmbulance, 
  FaFire, 
  FaShieldAlt,
  FaCrosshairs,
  FaMap
} from 'react-icons/fa';

const EmergencyReport = ({ onReportSubmitted }) => {
  const [description, setDescription] = useState('');
  const [emergencyType, setEmergencyType] = useState('medical');
  const [severity, setSeverity] = useState('medium');
  const [location, setLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [locationMethod, setLocationMethod] = useState('auto'); // 'auto', 'map', 'manual'

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get initial location
    getCurrentLocation();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            method: 'gps'
          };
          setLocation(loc);
          setLocationMethod('auto');
        },
        (error) => {
          console.log('Geolocation failed, using default');
          const defaultLocation = {
            lat: 12.9716,
            lng: 77.5946,
            accuracy: 100,
            method: 'default'
          };
          setLocation(defaultLocation);
        }
      );
    }
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setLocationMethod('map');
    setShowMap(false); // Close map after selection
  };

  const simulateVoiceInput = () => {
    const samples = [
      'I am having chest pain and difficulty breathing',
      'There is a fire in the building, need immediate help',
      'Car accident with injuries, need ambulance immediately',
      'Someone is attacking people, send police quickly',
      'Person fell from height, unconscious, need medical help'
    ];
    const sample = samples[Math.floor(Math.random() * samples.length)];
    setDescription(sample);
    
    // Auto-detect emergency type
    if (sample.includes('fire')) setEmergencyType('fire');
    else if (sample.includes('attack') || sample.includes('police')) setEmergencyType('police');
    else setEmergencyType('medical');
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      alert('Please describe the emergency');
      return;
    }

    if (!location) {
      alert('Please select a location for the emergency');
      return;
    }

    const incident = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      description,
      type: emergencyType,
      severity,
      location,
      timestamp: new Date().toISOString(),
      status: 'received',
      assignedResponder: {
        id: emergencyType === 'medical' ? 'AMB-001' : 
             emergencyType === 'fire' ? 'FIR-001' : 'POL-001',
        name: emergencyType === 'medical' ? 'Ambulance Unit Alpha' :
              emergencyType === 'fire' ? 'Fire Engine Echo' : 'Police Patrol Charlie',
        type: emergencyType,
        eta: '8-12 minutes'
      },
      updates: [
        {
          status: 'received',
          timestamp: new Date().toISOString(),
          message: 'Emergency reported successfully'
        }
      ]
    };

    onReportSubmitted(incident);
  };

  return (
    <div className="emergency-report">
      <div className="section">
        <h3><FaMicrophone /> Describe the Emergency</h3>
        <textarea
          className="input-field"
          rows="3"
          placeholder="What happened? Where? How many people affected?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn btn-voice" onClick={simulateVoiceInput}>
          <FaMicrophone /> Simulate Voice Input
        </button>
      </div>

      <div className="section">
        <h3>Emergency Type</h3>
        <div className="emergency-type-selector">
          <button
            className={`emergency-type-btn ${emergencyType === 'medical' ? 'active' : ''}`}
            onClick={() => setEmergencyType('medical')}
          >
            <FaAmbulance /><br />Medical
          </button>
          <button
            className={`emergency-type-btn ${emergencyType === 'fire' ? 'active' : ''}`}
            onClick={() => setEmergencyType('fire')}
          >
            <FaFire /><br />Fire
          </button>
          <button
            className={`emergency-type-btn ${emergencyType === 'police' ? 'active' : ''}`}
            onClick={() => setEmergencyType('police')}
          >
            <FaShieldAlt /><br />Police
          </button>
        </div>
      </div>

      <div className="section">
        <h3>Severity Level</h3>
        <div className="severity-selector">
          <button 
            className="severity-btn severity-low"
            onClick={() => setSeverity('low')}
          >
            Low
          </button>
          <button 
            className="severity-btn severity-medium"
            onClick={() => setSeverity('medium')}
          >
            Medium
          </button>
          <button 
            className="severity-btn severity-high"
            onClick={() => setSeverity('high')}
          >
            High
          </button>
          <button 
            className="severity-btn severity-critical"
            onClick={() => setSeverity('critical')}
          >
            Critical
          </button>
        </div>
      </div>

      <div className="section">
        <h3><FaMapMarkerAlt /> Location Selection</h3>
        
        <div className="location-methods">
          <button 
            className={`location-method-btn ${locationMethod === 'auto' ? 'active' : ''}`}
            onClick={getCurrentLocation}
          >
            <FaCrosshairs /> Auto-detect
          </button>
          <button 
            className={`location-method-btn ${locationMethod === 'map' ? 'active' : ''}`}
            onClick={() => setShowMap(!showMap)}
          >
            <FaMap /> {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {location && !showMap && (
          <div className="location-summary">
            <div className="location-details">
              <strong>📍 Selected Location:</strong>
              <div>Latitude: {location.lat.toFixed(6)}</div>
              <div>Longitude: {location.lng.toFixed(6)}</div>
              <div>Accuracy: ±{location.accuracy} meters</div>
              <div>Method: {location.method === 'gps' ? 'GPS Auto-detect' : 'Map Selection'}</div>
            </div>
            <button 
              className="btn-change-location"
              onClick={() => setShowMap(true)}
            >
              Change Location
            </button>
          </div>
        )}

        {showMap && (
          <LocationPicker 
            onLocationSelect={handleLocationSelect}
            initialLocation={location}
          />
        )}
      </div>

      {!isOnline && (
        <div className="offline-notice">
          ⚠️ You are offline. Report will be saved locally and sent when you're back online.
        </div>
      )}

      <button className="btn btn-danger" onClick={handleSubmit}>
        🚨 SEND EMERGENCY REPORT
      </button>
    </div>
  );
};

export default EmergencyReport;