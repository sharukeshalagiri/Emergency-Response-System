class RoutingService {
  // Assign responder based on emergency type and location
  assignResponder(emergencyType, location, responders) {
    // Filter available responders by type
    let availableResponders = responders.filter(r => 
      r.type === emergencyType && r.available
    );

    // If no responder of exact type, find any available
    if (availableResponders.length === 0) {
      availableResponders = responders.filter(r => r.available);
    }

    // If still no responders, use the first one (for demo)
    if (availableResponders.length === 0) {
      availableResponders = [responders[0]];
    }

    // Find nearest responder (mock implementation)
    // In production, use proper distance calculation
    const nearestResponder = this.findNearestResponder(
      location, 
      availableResponders
    );

    return {
      ...nearestResponder,
      assignedAt: new Date().toISOString(),
      eta: this.calculateETA(location, nearestResponder.location)
    };
  }

  // Find nearest responder (mock implementation)
  findNearestResponder(emergencyLocation, responders) {
    if (!emergencyLocation || !responders.length) {
      return responders[0];
    }

    // Simple distance calculation (for demo)
    // In production, use Haversine formula
    let nearest = responders[0];
    let minDistance = Infinity;

    responders.forEach(responder => {
      if (responder.location) {
        const distance = this.calculateDistance(
          emergencyLocation,
          responder.location
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = responder;
        }
      }
    });

    return nearest;
  }

  // Calculate distance between two points (mock)
  calculateDistance(point1, point2) {
    const latDiff = point1.lat - point2.lat;
    const lngDiff = point1.lng - point2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  // Calculate ETA (Estimated Time of Arrival)
  calculateETA(emergencyLocation, responderLocation) {
    const distance = this.calculateDistance(emergencyLocation, responderLocation);
    
    // Mock ETA calculation
    // In production, use routing API
    const baseMinutes = 8;
    const additionalMinutes = Math.floor(distance * 100);
    
    return {
      minutes: baseMinutes + additionalMinutes,
      range: `${baseMinutes}-${baseMinutes + additionalMinutes + 4} minutes`
    };
  }

  // Update responder status
  updateResponderStatus(responderId, available, responders) {
    const index = responders.findIndex(r => r.id === responderId);
    if (index !== -1) {
      responders[index].available = available;
      responders[index].lastUpdate = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Get responder by ID
  getResponderById(responderId, responders) {
    return responders.find(r => r.id === responderId);
  }

  // Get all responders of a type
  getRespondersByType(type, responders) {
    return responders.filter(r => r.type === type);
  }
}

module.exports = new RoutingService();