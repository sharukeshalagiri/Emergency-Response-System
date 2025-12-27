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

## 🛠️ Technology Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js with Express
- **Location Services:** Browser Geolocation API
- **Architecture:** Modular REST-based design
