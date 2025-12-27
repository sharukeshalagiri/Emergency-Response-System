import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h2>About Emergency Response System</h2>
        <p>
          Our Emergency Response System is designed to provide fast and efficient emergency reporting
          and response coordination. Using cutting-edge technology, we connect citizens with emergency
          services instantly.
        </p>

        <div className="features">
          <div className="feature">
            <h3>🚨 Fast Reporting</h3>
            <p>Report emergencies with just a few clicks or voice commands.</p>
          </div>
          <div className="feature">
            <h3>📍 Precise Location</h3>
            <p>GPS-based location selection ensures accurate emergency dispatch.</p>
          </div>
          <div className="feature">
            <h3>📊 Real-time Tracking</h3>
            <p>Track the status of your emergency response in real-time.</p>
          </div>
          <div className="feature">
            <h3>🔄 Offline Support</h3>
            <p>Reports can be saved offline and synced when connection is restored.</p>
          </div>
        </div>

        <div className="emergency-numbers">
          <h3>Emergency Contact Numbers</h3>
          <ul>
            <li><strong>Medical Emergency:</strong> 108 (India), 911 (US)</li>
            <li><strong>Police:</strong> 100 (India), 911 (US)</li>
            <li><strong>Fire:</strong> 101 (India), 911 (US)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;