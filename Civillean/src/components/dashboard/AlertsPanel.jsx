import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, CheckCircle, X, Radio } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';
import { formatDistanceToNow } from 'date-fns';

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const { demoMode } = useEmergency();

  useEffect(() => {
    if (demoMode) {
      // Simulate incoming alerts
      const interval = setInterval(() => {
        const alertTypes = [
          {
            type: 'traffic',
            message: 'Heavy traffic detected on Ring Road',
            priority: 'high',
            icon: AlertTriangle,
            color: 'text-red-600'
          },
          {
            type: 'geofence',
            message: 'Emergency vehicle approaching checkpoint',
            priority: 'medium',
            icon: Radio,
            color: 'text-blue-600'
          },
          {
            type: 'route',
            message: 'Alternative route available - 5 mins faster',
            priority: 'low',
            icon: Info,
            color: 'text-green-600'
          }
        ];

        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
          id: Date.now(),
          ...randomAlert,
          timestamp: new Date(),
          read: false
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep only last 10 alerts
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [demoMode]);

  const markAsRead = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-600" />
          Live Alerts & Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-medium px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        
        {demoMode && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live Demo Active
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No alerts at the moment</p>
              <p className="text-sm mt-1">
                {demoMode ? 'Demo alerts will appear soon...' : 'All systems running normally'}
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const IconComponent = alert.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-lg border-l-4 transition-all ${
                    alert.read 
                      ? 'bg-gray-50 border-l-gray-300' 
                      : alert.priority === 'high'
                        ? 'bg-red-50 border-l-red-500'
                        : alert.priority === 'medium'
                          ? 'bg-yellow-50 border-l-yellow-500'
                          : 'bg-blue-50 border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${alert.color}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${alert.read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {alert.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(alert.timestamp)} ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!alert.read && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => markAsRead(alert.id)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </motion.button>
                      )}
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{alerts.length} total alerts</span>
            <button
              onClick={() => setAlerts([])}
              className="text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}