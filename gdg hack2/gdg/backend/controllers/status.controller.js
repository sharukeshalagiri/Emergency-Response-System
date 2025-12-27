const responders = require('../data/responders.json');

class StatusController {
  // Update incident status
  async updateStatus(req, res) {
    try {
      const { incidentId, status, message } = req.body;

      // This would be connected to a database in production
      // For now, we'll simulate with in-memory array
      const incident = require('./emergency.controller').incidents
        .find(i => i.id === incidentId);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      // Update incident status
      incident.status = status;
      incident.updates.push({
        status,
        timestamp: new Date().toISOString(),
        message: message || `Status updated to ${status}`
      });

      // If resolved, make responder available
      if (status === 'resolved') {
        const responderIndex = responders.findIndex(r => r.id === incident.assignedResponder.id);
        if (responderIndex !== -1) {
          responders[responderIndex].available = true;
        }
      }

      res.json({
        success: true,
        incident,
        message: `Status updated to ${status}`
      });

    } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update status'
      });
    }
  }

  // Get live updates for incident
  async getLiveUpdates(req, res) {
    try {
      const { incidentId } = req.params;

      const incident = require('./emergency.controller').incidents
        .find(i => i.id === incidentId);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      res.json({
        success: true,
        updates: incident.updates,
        currentStatus: incident.status
      });

    } catch (error) {
      console.error('Error getting updates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch updates'
      });
    }
  }

  // Get responder status
  async getResponders(req, res) {
    try {
      const { type, available } = req.query;

      let filtered = [...responders];

      // Apply filters
      if (type) {
        filtered = filtered.filter(r => r.type === type);
      }

      if (available !== undefined) {
        filtered = filtered.filter(r => r.available === (available === 'true'));
      }

      res.json({
        success: true,
        responders: filtered,
        stats: {
          total: responders.length,
          available: responders.filter(r => r.available).length,
          medical: responders.filter(r => r.type === 'medical').length,
          police: responders.filter(r => r.type === 'police').length,
          fire: responders.filter(r => r.type === 'fire').length
        }
      });

    } catch (error) {
      console.error('Error getting responders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch responders'
      });
    }
  }
}

module.exports = new StatusController();