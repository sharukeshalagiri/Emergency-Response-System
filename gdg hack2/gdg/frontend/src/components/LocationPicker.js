import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom icons
const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const emergencyLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map click handler
function MapClickHandler({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return null;
}

const LocationPicker = ({ onLocationSelect, onClose }) => {
  const [position, setPosition] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef();

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          };
          setCurrentLocation(loc);
          setPosition(loc);
          
          if (mapRef.current) {
            mapRef.current.flyTo([loc.lat, loc.lng], 15);
          }
          
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLocating(false);
        }
      );
    }
  };

  const handleConfirm = () => {
    if (position) {
      const locationData = {
        lat: position.lat,
        lng: position.lng,
        accuracy: position.accuracy || 10
      };
      onLocationSelect(locationData);
      if (onClose) onClose();
    }
  };

  return (
    <div className="location-picker-modal">
      <div className="modal-header">
        <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>📍 Select Emergency Location</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="map-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search for location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button style={{ padding: '10px', background: '#667eea', color: 'white', border: 'none', cursor: 'pointer' }}>
            🔍
          </button>
        </div>
        <button 
          className="locate-btn"
          onClick={getCurrentLocation}
          disabled={isLocating}
          style={{ 
            padding: '10px 15px', 
            background: isLocating ? '#ccc' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLocating ? 'not-allowed' : 'pointer'
          }}
        >
          {isLocating ? 'Locating...' : '📍 Use My Location'}
        </button>
      </div>
      
      <div className="map-container">
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={13}
          style={{ height: '400px', width: '100%', borderRadius: '8px' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Current location marker */}
          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
              <Popup>
                Your current location<br />
                Accuracy: ±{currentLocation.accuracy}m
              </Popup>
            </Marker>
          )}
          
          {/* Selected location marker */}
          {position && (
            <Marker position={[position.lat, position.lng]} icon={emergencyLocationIcon}>
              <Popup>
                Emergency Location<br />
                Latitude: {position.lat.toFixed(6)}<br />
                Longitude: {position.lng.toFixed(6)}
              </Popup>
            </Marker>
          )}
          
          <MapClickHandler setPosition={setPosition} />
        </MapContainer>
      </div>
      
      {position && (
        <div className="location-info">
          <h4>Selected Location:</h4>
          <div className="coordinates">
            <div>Latitude: {position.lat.toFixed(6)}</div>
            <div>Longitude: {position.lng.toFixed(6)}</div>
          </div>
        </div>
      )}
      
      <div className="modal-footer">
        <button 
          className="btn-cancel" 
          onClick={onClose}
          style={{ padding: '10px 20px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button 
          className="btn-confirm" 
          onClick={handleConfirm}
          disabled={!position}
          style={{ 
            padding: '10px 20px', 
            background: !position ? '#ccc' : '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: !position ? 'not-allowed' : 'pointer'
          }}
        >
          ✅ Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;