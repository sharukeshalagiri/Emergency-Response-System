# 🚨 ResQLink – Emergency Response System (Prototype)

ResQLink is a web-based emergency response prototype designed to help campuses and local communities **report emergencies quickly**, **share accurate location details**, and **track response status in real time**.

The project focuses on building a **fast, accessible, and easy-to-use interface** for high-stress situations, while demonstrating a complete end-to-end emergency workflow from incident reporting to response coordination.

This repository contains a **functional prototype** created for hackathon and learning purposes.

---

## ❗ Problem Statement

In emergency situations, delays often occur due to:
- ❌ Lack of a single, centralized reporting system  
- 📍 Difficulty in sharing precise location details  
- 👀 No visibility into response or dispatch status  
- 😵 Systems that are hard to use under stress  

ResQLink addresses these challenges by providing a unified platform that simplifies emergency reporting and improves coordination between users and responders.

---

## ✨ Key Features

### 📝 1. Emergency Reporting
- Users can report emergencies through a simple, mobile-friendly web interface.
- Emergency type selection (Medical / Police / Fire).
- Severity level selection to help prioritize response.

### 📍 2. Location Capture
- Uses the browser’s Geolocation API to capture GPS coordinates.
- Helps responders quickly identify the incident location.
- Designed to minimize user effort during emergencies.

### 🧠 3. Smart Intent Detection
- A lightweight, rule-based intent detection system analyzes user input.
- Automatically categorizes incidents into emergency types.
- Chosen for reliability, explainability, and demo stability.

### 🔄 4. Incident Lifecycle Tracking
- Each reported emergency generates a unique incident ID.
- Clear status progression:
  - Reported  
  - Dispatched  
  - En-route  
  - Resolved  
- Enables transparency and reassurance for users.

### 🖥️ 5. Admin / Dispatcher Dashboard
- Centralized view to monitor all reported incidents.
- Ability to update incident status.
- Simulates real-world response coordination.

### 📡 6. Offline Awareness
- Detects when the user is offline.
- Displays clear UI feedback indicating offline state.
- Highlights reliability considerations for low-network environments.

### 🔐 7. Privacy-First Design
- Only minimal and essential data is handled.
- No permanent storage of sensitive personal information.
- Designed with data minimization principles in mind.

---

## 📦 Prototype Scope

### ✅ Implemented in this Prototype
The current prototype demonstrates the core emergency-response workflow with the following fully implemented features:

- Web-based emergency reporting interface
- Emergency type and severity selection
- GPS-based location capture using browser APIs
- Rule-based emergency intent detection
- Unique incident ID generation and status tracking
- Admin / dispatcher monitoring dashboard
- Offline-aware UI feedback for low-network scenarios
- Privacy-first handling of minimal and essential data

---

### 🚀 Final Product Vision
The complete application is envisioned to extend the prototype with additional capabilities to improve accessibility, intelligence, and real-world impact:

- Voice-based emergency reporting for hands-free usage
- Multilingual support to serve diverse user populations
- WhatsApp / SMS intake for non-smartphone and low-bandwidth users
- Real-time incident updates using WebSockets
- Live map-based tracking with ETA estimation
- AI-assisted intent classification with confidence scoring and human fallback

---

## 🛠️ Technology Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js with Express
- **Location Services:** Browser Geolocation API
- **Architecture:** Modular REST-based design
