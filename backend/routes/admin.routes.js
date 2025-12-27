const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergency.controller');

// Assign responder to incident
router.put('/assign/:id', emergencyController.assignIncident);

module.exports = router;