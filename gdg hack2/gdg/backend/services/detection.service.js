class DetectionService {
  constructor() {
    this.keywords = {
      medical: [
        'heart', 'chest', 'pain', 'breath', 'unconscious', 'injured', 'bleeding',
        'accident', 'fall', 'stroke', 'attack', 'hospital', 'ambulance', 'doctor',
        'blood', 'wound', 'fracture', 'broken', 'emergency', 'medical'
      ],
      fire: [
        'fire', 'smoke', 'burn', 'explosion', 'flame', 'heat', 'gas', 'emergency',
        'alarm', 'blaze', 'hot', 'rescue', 'firefighter', 'extinguish', 'danger'
      ],
      police: [
        'attack', 'theft', 'robbery', 'fight', 'danger', 'threat', 'violence',
        'assault', 'suspicious', 'crime', 'police', 'officer', 'help', 'dangerous',
        'weapon', 'gun', 'knife', 'thief', 'burglary', 'harassment'
      ]
    };
  }

  // Detect emergency type from description
  detectEmergency(description) {
    const text = description.toLowerCase();
    
    let scores = {
      medical: 0,
      fire: 0,
      police: 0
    };

    // Count keyword matches
    Object.keys(this.keywords).forEach(type => {
      this.keywords[type].forEach(keyword => {
        if (text.includes(keyword)) {
          scores[type]++;
        }
      });
    });

    // Calculate confidence
    const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
    
    if (totalMatches === 0) {
      return {
        type: 'medical', // Default
        confidence: 0,
        scores
      };
    }

    // Find type with highest score
    let detectedType = 'medical';
    let maxScore = 0;

    Object.keys(scores).forEach(type => {
      if (scores[type] > maxScore) {
        maxScore = scores[type];
        detectedType = type;
      }
    });

    const confidence = maxScore / totalMatches;

    return {
      type: confidence >= 0.6 ? detectedType : 'needs_review',
      confidence: parseFloat(confidence.toFixed(2)),
      scores
    };
  }

  // Get emergency severity
  getSeverity(description, type) {
    const text = description.toLowerCase();
    let severity = 'medium';

    // Severity indicators
    const criticalIndicators = [
      'critical', 'urgent', 'immediate', 'dying', 'unconscious',
      'severe', 'serious', 'emergency', 'help', 'now'
    ];

    const highIndicators = [
      'pain', 'bleeding', 'injured', 'danger', 'threat',
      'attack', 'fire', 'smoke', 'explosion'
    ];

    const lowIndicators = [
      'minor', 'small', 'slight', 'check', 'advice',
      'question', 'information', 'inquiry'
    ];

    const criticalCount = criticalIndicators.filter(word => text.includes(word)).length;
    const highCount = highIndicators.filter(word => text.includes(word)).length;
    const lowCount = lowIndicators.filter(word => text.includes(word)).length;

    if (criticalCount > 0 || highCount > 2) {
      severity = 'critical';
    } else if (highCount > 0 || type === 'fire') {
      severity = 'high';
    } else if (lowCount > 1) {
      severity = 'low';
    }

    return severity;
  }

  // Extract location from description (basic)
  extractLocation(description) {
    const patterns = [
      /\b(\d+)\s+([A-Z][a-z]+)\s+(Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr)\b/gi,
      /\bnear\s+([A-Z][a-z]+\s+)+/gi,
      /\bat\s+([A-Z][a-z]+\s+)+/gi,
      /\b([A-Z][a-z]+)\s+(Hospital|School|Mall|Market|Park)\b/gi
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }
}

module.exports = new DetectionService();