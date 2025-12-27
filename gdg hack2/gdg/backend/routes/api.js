const express = require('express');
const router = express.Router();

const emergencyRoutes = require('./emergency.routes');
const statusRoutes = require('./status.routes');
const adminRoutes = require('./admin.routes');

// API versioning
const API_VERSION = 'v1';

// API Health Check
router.get('/', (req, res) => {
  res.json({
    api: 'Emergency Response System API',
    version: API_VERSION,
    endpoints: {
      emergency: `/api/${API_VERSION}/emergency`,
      status: `/api/${API_VERSION}/status`,
      incidents: `/api/${API_VERSION}/incidents`
    }
  });
});

// Versioned API Routes
router.use(`/${API_VERSION}/emergency`, emergencyRoutes);
router.use(`/${API_VERSION}/status`, statusRoutes);
router.use(`/${API_VERSION}/admin`, adminRoutes);

// 404 for undefined API routes
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;