const detectionService = require('../services/detection.service');
const routingService = require('../services/routing.service');
const voiceService = require('../services/voice.service');

// Mock data (in production, use database)
let incidents = [];
let incidentCounter = 1;

const responders = require('../data/responders.json');

class EmergencyController {
  // Report emergency
  async reportEmergency(req, res) {
    try {
      const { description, location, userType, severity, language, offlineId } = req.body;

      // Validate required fields
      if (!description || !location) {
        return res.status(400).json({
          success: false,
          error: 'Description and location are required'
        });
      }

      // Detect emergency type
      const detection = detectionService.detectEmergency(description);
      const emergencyType = userType || detection.type;

      // Find and assign responder
      const assignedResponder = routingService.assignResponder(
        emergencyType, 
        location, 
        responders
      );

      // Generate dispatch ID
      const dispatchId = this.generateDispatchId();

      // Create incident
      const incident = {
        id: dispatchId,
        description,
        location,
        type: emergencyType,
        severity: severity || 'medium',
        detectedType: detection.type,
        confidence: detection.confidence,
        assignedResponder,
        status: 'received',
        timestamp: new Date().toISOString(),
        language: language || 'en-US',
        updates: [
          {
            status: 'received',
            timestamp: new Date().toISOString(),
            message: 'Emergency reported successfully'
          }
        ],
        metadata: {
          offlineId,
          source: offlineId ? 'offline_sync' : 'online'
        }
      };

      // Store incident
      incidents.push(incident);

      // Mark responder as unavailable
      routingService.updateResponderStatus(assignedResponder.id, false, responders);

      // Simulate initial status update
      this.simulateStatusUpdate(incident);

      res.json({
        success: true,
        incident,
        message: `Emergency reported. Dispatch ID: ${dispatchId}`,
        estimatedArrival: '8-12 minutes'
      });

    } catch (error) {
      console.error('Error reporting emergency:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to report emergency',
        details: error.message
      });
    }
  }

  // Process voice input
  async processVoice(req, res) {
    try {
      const { audio, language } = req.body;

      // Simulate voice processing
      const result = await voiceService.processVoiceInput(audio, language);

      // Detect emergency from transcript
      const detection = detectionService.detectEmergency(result.transcript);

      res.json({
        success: true,
        ...result,
        detectedType: detection.type,
        confidence: detection.confidence,
        suggestedType: detection.confidence >= 0.6 ? detection.type : 'needs_review'
      });

    } catch (error) {
      console.error('Error processing voice:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process voice input'
      });
    }
  }

  // Sync offline reports
  async syncOfflineReports(req, res) {
    try {
      const { reports } = req.body;

      if (!Array.isArray(reports)) {
        return res.status(400).json({
          success: false,
          error: 'Reports must be an array'
        });
      }

      const results = [];
      const errors = [];

      // Process each offline report
      for (const report of reports) {
        try {
          // Process report
          const response = await this.reportEmergency(
            { body: report },
            { json: (data) => data }
          );

          results.push({
            offlineId: report.offlineId,
            success: true,
            dispatchId: response.incident.id
          });
        } catch (error) {
          errors.push({
            offlineId: report.offlineId,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        synced: results.length,
        failed: errors.length,
        results,
        errors
      });

    } catch (error) {
      console.error('Error syncing offline reports:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to sync offline reports'
      });
    }
  }

  // Get all incidents
  async getIncidents(req, res) {
    try {
      const { status, type, limit = 50 } = req.query;

      let filtered = [...incidents];

      // Apply filters
      if (status) {
        filtered = filtered.filter(incident => incident.status === status);
      }

      if (type) {
        filtered = filtered.filter(incident => incident.type === type);
      }

      // Sort by timestamp (newest first)
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Apply limit
      filtered = filtered.slice(0, parseInt(limit));

      // Calculate statistics
      const stats = {
        total: incidents.length,
        active: incidents.filter(i => !['resolved', 'closed'].includes(i.status)).length,
        critical: incidents.filter(i => i.severity === 'critical').length,
        resolved: incidents.filter(i => i.status === 'resolved').length
      };

      res.json({
        success: true,
        incidents: filtered,
        stats,
        count: filtered.length
      });

    } catch (error) {
      console.error('Error getting incidents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incidents'
      });
    }
  }

  // Get incident by ID
  async getIncidentById(req, res) {
    try {
      const { id } = req.params;

      const incident = incidents.find(i => i.id === id);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      res.json({
        success: true,
        incident
      });

    } catch (error) {
      console.error('Error getting incident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incident'
      });
    }
  }

  // Helper methods
  generateDispatchId() {
    const id = `INC-${String(incidentCounter).padStart(4, '0')}`;
    incidentCounter++;
    return id;
  }

  simulateStatusUpdate(incident) {
    // In production, this would be handled by a queue/worker
    const updates = [
      { status: 'dispatched', delay: 5000, message: 'Responder dispatched' },
      { status: 'enroute', delay: 15000, message: 'Responder en route to location' },
      { status: 'arrived', delay: 30000, message: 'Responder arrived at scene' },
      { status: 'resolved', delay: 45000, message: 'Incident resolved successfully' }
    ];

    updates.forEach(({ status, delay, message }) => {
      setTimeout(() => {
        const incidentIndex = incidents.findIndex(i => i.id === incident.id);
        if (incidentIndex !== -1) {
          incidents[incidentIndex].status = status;
          incidents[incidentIndex].updates.push({
            status,
            timestamp: new Date().toISOString(),
            message
          });

          // If resolved, make responder available
          if (status === 'resolved') {
            routingService.updateResponderStatus(
              incidents[incidentIndex].assignedResponder.id, 
              true, 
              responders
            );
          }
        }
      }, delay);
    });
  }

  // Assign responder to incident (admin function)
  async assignIncident(req, res) {
    try {
      const { id } = req.params;
      const { responderType } = req.body;

      const incidentIndex = incidents.findIndex(i => i.id === id);
      if (incidentIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found'
        });
      }

      // Find new responder
      const newResponder = routingService.assignResponder(
        responderType,
        incidents[incidentIndex].location,
        responders
      );

      // Update incident
      incidents[incidentIndex].assignedResponder = newResponder;
      incidents[incidentIndex].type = responderType;

      res.json({
        success: true,
        incident: incidents[incidentIndex]
      });

    } catch (error) {
      console.error('Error assigning incident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign incident'
      });
    }
  }
}

module.exports = new EmergencyController();