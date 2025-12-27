const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergency.controller');

// Report emergency
router.post('/report', emergencyController.reportEmergency);

// Process voice input
router.post('/process-voice', emergencyController.processVoice);

// Sync offline reports
router.post('/sync-offline', emergencyController.syncOfflineReports);

// Get all incidents
router.get('/incidents', emergencyController.getIncidents);

// Get incident by ID
router.get('/incidents/:id', emergencyController.getIncidentById);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Emergency API is working' });
});

module.exports = router;