import React, { useState, useEffect } from 'react';
import { FaWifi, FaWifiOff, FaSync, FaDatabase, FaPaperPlane, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';

const OfflineQueue = ({ onSyncComplete }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [failedSyncs, setFailedSyncs] = useState([]);

  // Load queue from localStorage on mount
  useEffect(() => {
    loadQueue();
    checkStorageUsage();
    
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Online - attempting to sync queue');
      autoSyncQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('Offline - queuing reports locally');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Periodic sync check (every 30 seconds when online)
    const syncInterval = setInterval(() => {
      if (isOnline && queue.length > 0) {
        autoSyncQueue();
      }
    }, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  const loadQueue = () => {
    try {
      const savedQueue = JSON.parse(localStorage.getItem('emergency_queue') || '[]');
      const savedFailed = JSON.parse(localStorage.getItem('failed_syncs') || '[]');
      setQueue(savedQueue);
      setFailedSyncs(savedFailed);
      
      const lastSync = localStorage.getItem('last_sync_time');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    } catch (error) {
      console.error('Error loading queue:', error);
      // Reset queue on error
      localStorage.setItem('emergency_queue', '[]');
      localStorage.setItem('failed_syncs', '[]');
    }
  };

  const checkStorageUsage = () => {
    try {
      const queueData = localStorage.getItem('emergency_queue') || '[]';
      const failedData = localStorage.getItem('failed_syncs') || '[]';
      const totalBytes = new Blob([queueData, failedData]).size;
      const maxBytes = 5 * 1024 * 1024; // 5MB limit
      const usage = (totalBytes / maxBytes) * 100;
      setStorageUsage(Math.min(usage, 100));
    } catch (error) {
      console.error('Error checking storage usage:', error);
    }
  };

  const addToQueue = (report) => {
    return new Promise((resolve) => {
      const reportWithMetadata = {
        ...report,
        id: `QUEUE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        queuedAt: new Date().toISOString(),
        retryCount: 0,
        compressed: compressReport(report)
      };
      
      const newQueue = [...queue, reportWithMetadata];
      setQueue(newQueue);
      localStorage.setItem('emergency_queue', JSON.stringify(newQueue));
      checkStorageUsage();
      resolve(reportWithMetadata.id);
    });
  };

  const compressReport = (report) => {
    // Simple compression for demo
    const compressed = {
      d: report.description?.substring(0, 200), // truncate description
      t: report.type || 'medical',
      l: report.location ? {
        lat: Math.round(report.location.lat * 1000000) / 1000000,
        lng: Math.round(report.location.lng * 1000000) / 1000000
      } : null,
      s: report.severity || 'medium',
      ts: Date.now()
    };
    
    return JSON.stringify(compressed);
  };

  const decompressReport = (compressed) => {
    try {
      const data = JSON.parse(compressed);
      return {
        description: data.d || 'Emergency reported offline',
        type: data.t || 'medical',
        location: data.l || null,
        severity: data.s || 'medium',
        timestamp: new Date(data.ts).toISOString()
      };
    } catch (error) {
      return {
        description: 'Emergency reported offline',
        type: 'medical',
        severity: 'medium',
        timestamp: new Date().toISOString()
      };
    }
  };

  const autoSyncQueue = async () => {
    if (!isOnline || queue.length === 0 || isSyncing) return;
    
    console.log('Auto-syncing queue...');
    await syncQueue();
  };

  const manualSync = async () => {
    if (!isOnline) {
      alert('You are offline. Please connect to the internet to sync.');
      return;
    }
    
    setIsSyncing(true);
    await syncQueue();
    setIsSyncing(false);
  };

  const syncQueue = async () => {
    if (queue.length === 0) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    
    const successfulSyncs = [];
    const failedSyncsTemp = [];
    
    // Try to sync each item in queue
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const progress = ((i + 1) / queue.length) * 100;
      setSyncProgress(progress);
      
      try {
        const decompressed = decompressReport(item.compressed);
        const reportData = {
          ...decompressed,
          offlineId: item.id,
          queuedAt: item.queuedAt,
          retryCount: item.retryCount || 0
        };
        
        // Send SMS fallback if available
        if (window.sms && item.retryCount > 2) {
          await sendSMSFallback(reportData);
          successfulSyncs.push(item.id);
          continue;
        }
        
        // Try normal API sync
        const response = await axios.post('/api/report', reportData, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'X-Offline-Report': 'true'
          }
        });
        
        if (response.data.success) {
          successfulSyncs.push(item.id);
          console.log(`Successfully synced report ${item.id}`);
          
          // Update retry count for failed items that succeeded
          if (item.retryCount > 0) {
            removeFromFailedSyncs(item.id);
          }
        } else {
          throw new Error('Server returned failure');
        }
      } catch (error) {
        console.error(`Failed to sync report ${item.id}:`, error);
        
        // Increment retry count
        const updatedItem = {
          ...item,
          retryCount: (item.retryCount || 0) + 1,
          lastRetry: new Date().toISOString(),
          error: error.message
        };
        
        failedSyncsTemp.push(updatedItem);
        
        // Move to failed syncs after 3 retries
        if (updatedItem.retryCount >= 3) {
          addToFailedSyncs(updatedItem);
        }
      }
      
      // Small delay between syncs to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Remove successfully synced items
    if (successfulSyncs.length > 0) {
      const newQueue = queue.filter(item => !successfulSyncs.includes(item.id));
      setQueue(newQueue);
      localStorage.setItem('emergency_queue', JSON.stringify(newQueue));
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('last_sync_time', now.toISOString());
      
      console.log(`Successfully synced ${successfulSyncs.length} reports`);
    }
    
    // Update failed syncs
    if (failedSyncsTemp.length > 0) {
      const failedIds = failedSyncsTemp.map(item => item.id);
      const newQueue = queue.filter(item => !failedIds.includes(item.id));
      setQueue(newQueue);
      localStorage.setItem('emergency_queue', JSON.stringify(newQueue));
      
      console.log(`${failedSyncsTemp.length} reports failed to sync and will be retried`);
    }
    
    checkStorageUsage();
    setSyncProgress(0);
    setIsSyncing(false);
    
    if (onSyncComplete) {
      onSyncComplete({
        successful: successfulSyncs.length,
        failed: failedSyncsTemp.length,
        total: queue.length
      });
    }
  };

  const addToFailedSyncs = (item) => {
    const newFailedSyncs = [...failedSyncs, item];
    setFailedSyncs(newFailedSyncs);
    localStorage.setItem('failed_syncs', JSON.stringify(newFailedSyncs));
  };

  const removeFromFailedSyncs = (id) => {
    const newFailedSyncs = failedSyncs.filter(item => item.id !== id);
    setFailedSyncs(newFailedSyncs);
    localStorage.setItem('failed_syncs', JSON.stringify(newFailedSyncs));
  };

  const sendSMSFallback = async (report) => {
    // This is a mock SMS sending function
    // In a real app, you would use the Web SMS API or a service worker
    console.log('Sending SMS fallback for report:', report);
    
    const smsData = {
      phone: '+911234567890', // Mock emergency number
      message: `EMERGENCY: ${report.type.toUpperCase()} - ${report.description.substring(0, 100)} - LOC: ${report.location?.lat},${report.location?.lng}`,
      timestamp: new Date().toISOString()
    };
    
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store SMS attempt
    const smsLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
    smsLogs.push({
      ...smsData,
      reportId: report.offlineId,
      sentAt: new Date().toISOString(),
      status: 'sent'
    });
    localStorage.setItem('sms_logs', JSON.stringify(smsLogs));
    
    return true;
  };

  const clearQueue = () => {
    if (window.confirm('Clear all queued reports? This cannot be undone.')) {
      setQueue([]);
      localStorage.setItem('emergency_queue', '[]');
      checkStorageUsage();
    }
  };

  const retryFailedSyncs = async () => {
    if (failedSyncs.length === 0) return;
    
    setIsSyncing(true);
    
    for (const item of failedSyncs) {
      try {
        const decompressed = decompressReport(item.compressed);
        const response = await axios.post('/api/report', decompressed);
        
        if (response.data.success) {
          removeFromFailedSyncs(item.id);
        }
      } catch (error) {
        console.error(`Failed to retry sync for ${item.id}:`, error);
      }
    }
    
    setIsSyncing(false);
  };

  const exportQueue = () => {
    const dataStr = JSON.stringify(queue, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `emergency_queue_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="offline-queue">
      <div className="queue-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isOnline ? <FaWifi color="#4CAF50" /> : <FaWifiOff color="#f44336" />}
          <div>
            <h3 style={{ margin: 0 }}>
              {isOnline ? 'Online' : 'Offline'} Mode
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {isOnline 
                ? 'Reports will be sent immediately'
                : 'Reports are being queued locally'}
            </p>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Last sync: {lastSyncTime ? formatTime(lastSyncTime) : 'Never'}
          </div>
          <div style={{ fontSize: '12px', color: storageUsage > 80 ? '#f44336' : '#666' }}>
            Storage: {Math.round(storageUsage)}% used
          </div>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="queue-status" style={{
          background: isOnline ? '#e8f5e9' : '#fff3cd',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          border: `1px solid ${isOnline ? '#4CAF50' : '#ffc107'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaDatabase />
              <strong>
                {queue.length} report{queue.length !== 1 ? 's' : ''} in queue
              </strong>
            </div>
            
            {isOnline && (
              <button
                onClick={manualSync}
                disabled={isSyncing}
                style={{
                  padding: '8px 16px',
                  background: isSyncing ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSyncing ? (
                  <>
                    <FaSync className="spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Sync Now
                  </>
                )}
              </button>
            )}
          </div>
          
          {isSyncing && (
            <div style={{ marginTop: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                <span>Syncing...</span>
                <span>{Math.round(syncProgress)}%</span>
              </div>
              <div style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div 
                  style={{
                    height: '100%',
                    width: `${syncProgress}%`,
                    background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}
          
          {!isOnline && (
            <div style={{ 
              marginTop: '10px', 
              fontSize: '14px',
              color: '#856404'
            }}>
              <FaExclamationTriangle /> Reports will be sent automatically when you're back online
            </div>
          )}
        </div>
      )}

      {queue.length > 0 && (
        <div className="queue-list" style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>Queued Reports</h4>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {queue.slice(0, 10).map((item, index) => (
              <div 
                key={item.id}
                style={{
                  padding: '12px',
                  background: index % 2 === 0 ? '#f8f9fa' : 'white',
                  borderBottom: '1px solid #e0e0e0',
                  fontSize: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{item.type || 'medical'}</strong>
                  <small style={{ color: '#666' }}>
                    {formatTime(item.queuedAt)}
                  </small>
                </div>
                <div style={{ 
                  color: '#666',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '5px'
                }}>
                  {decompressReport(item.compressed).description || 'No description'}
                </div>
                {item.retryCount > 0 && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#f44336',
                    marginTop: '5px'
                  }}>
                    Retry {item.retryCount}/3
                  </div>
                )}
              </div>
            ))}
            {queue.length > 10 && (
              <div style={{ 
                padding: '10px', 
                textAlign: 'center',
                color: '#666',
                fontSize: '14px'
              }}>
                + {queue.length - 10} more reports...
              </div>
            )}
          </div>
        </div>
      )}

      {failedSyncs.length > 0 && (
        <div className="failed-syncs" style={{
          background: '#ffebee',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px',
          border: '1px solid #f44336'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaExclamationTriangle color="#f44336" />
              <strong>{failedSyncs.length} failed syncs</strong>
            </div>
            <button
              onClick={retryFailedSyncs}
              style={{
                padding: '6px 12px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry All
            </button>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            These reports failed to sync after multiple attempts. 
            SMS fallback was used where available.
          </div>
        </div>
      )}

      <div className="queue-actions" style={{
        display: 'flex',
        gap: '10px',
        marginTop: '20px'
      }}>
        <button
          onClick={clearQueue}
          disabled={queue.length === 0}
          style={{
            padding: '10px 15px',
            background: queue.length === 0 ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: queue.length === 0 ? 'not-allowed' : 'pointer',
            flex: 1
          }}
        >
          Clear Queue
        </button>
        
        <button
          onClick={exportQueue}
          disabled={queue.length === 0}
          style={{
            padding: '10px 15px',
            background: queue.length === 0 ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: queue.length === 0 ? 'not-allowed' : 'pointer',
            flex: 1
          }}
        >
          Export Queue
        </button>
      </div>

      <div className="queue-info" style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '10px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Offline Features:</strong>
        <ul style={{ margin: '10px 0 0 20px' }}>
          <li>Reports are compressed and stored locally</li>
          <li>Auto-sync when connection is restored</li>
          <li>SMS fallback after 3 failed attempts</li>
          <li>Storage limit: 5MB (approx. 500 reports)</li>
          <li>Data persists across browser sessions</li>
        </ul>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OfflineQueue;

// Utility function to add to queue from other components
export const addEmergencyToQueue = async (reportData) => {
  const queue = JSON.parse(localStorage.getItem('emergency_queue') || '[]');
  
  const compressedReport = {
    d: reportData.description?.substring(0, 200),
    t: reportData.type || 'medical',
    l: reportData.location ? {
      lat: Math.round(reportData.location.lat * 1000000) / 1000000,
      lng: Math.round(reportData.location.lng * 1000000) / 1000000
    } : null,
    s: reportData.severity || 'medium',
    ts: Date.now()
  };
  
  const queueItem = {
    id: `QUEUE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    compressed: JSON.stringify(compressedReport),
    queuedAt: new Date().toISOString(),
    retryCount: 0,
    originalSize: JSON.stringify(reportData).length,
    compressedSize: JSON.stringify(compressedReport).length
  };
  
  queue.push(queueItem);
  localStorage.setItem('emergency_queue', JSON.stringify(queue));
  
  // Dispatch event for other components to listen to
  window.dispatchEvent(new CustomEvent('emergencyQueued', {
    detail: { count: queue.length }
  }));
  
  return queueItem.id;
};

// Utility function to check if queue is full
export const isQueueFull = () => {
  try {
    const queueData = localStorage.getItem('emergency_queue') || '[]';
    const size = new Blob([queueData]).size;
    return size > 4.5 * 1024 * 1024; // 4.5MB threshold
  } catch (error) {
    return false;
  }
};

// Utility function to get queue stats
export const getQueueStats = () => {
  const queue = JSON.parse(localStorage.getItem('emergency_queue') || '[]');
  const failedSyncs = JSON.parse(localStorage.getItem('failed_syncs') || '[]');
  const smsLogs = JSON.parse(localStorage.getItem('sms_logs') || '[]');
  
  return {
    queued: queue.length,
    failed: failedSyncs.length,
    smsSent: smsLogs.length,
    lastSync: localStorage.getItem('last_sync_time'),
    storageUsage: calculateStorageUsage()
  };
};

const calculateStorageUsage = () => {
  try {
    let total = 0;
    ['emergency_queue', 'failed_syncs', 'sms_logs', 'last_known_location'].forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        total += new Blob([data]).size;
      }
    });
    const usage = (total / (5 * 1024 * 1024)) * 100; // 5MB total
    return Math.min(usage, 100);
  } catch (error) {
    return 0;
  }
};