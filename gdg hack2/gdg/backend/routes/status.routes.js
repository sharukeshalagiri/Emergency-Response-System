const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');

// Update incident status
router.post('/update', statusController.updateStatus);

// Get live updates for incident
router.get('/updates/:incidentId', statusController.getLiveUpdates);

// Get responder status
router.get('/responders', statusController.getResponders);

module.exports = router;