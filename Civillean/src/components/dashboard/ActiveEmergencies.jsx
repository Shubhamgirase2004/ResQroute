import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';
import { SAMPLE_LOCATIONS } from '../../config/mapbox';
import { formatDistanceToNow } from 'date-fns';

export default function ActiveEmergencies() {
  const { activeEmergencies, updateEmergencyStatus } = useEmergency();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case '1': return 'bg-red-500';
      case '2': return 'bg-orange-500';
      case '3': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600';
      case 'en-route': return 'text-orange-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleStatusUpdate = (emergencyId, newStatus) => {
    updateEmergencyStatus(emergencyId, { 
      status: newStatus,
      updatedAt: new Date(),
      progress: newStatus === 'completed' ? 100 : newStatus === 'en-route' ? 50 : 25
    });
  };

  if (activeEmergencies.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Emergencies</h3>
        <p className="text-gray-600">Create a new emergency dispatch to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Navigation className="w-6 h-6 text-blue-600" />
        Active Emergency Dispatches
        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
          {activeEmergencies.length}
        </span>
      </h2>

      <div className="space-y-4">
        <AnimatePresence>
          {activeEmergencies.map((emergency) => (
            <motion.div
              key={emergency.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${getPriorityColor(emergency.priority)}`}></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Priority {emergency.priority} - {emergency.vehicleType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {emergency.createdAt && formatDistanceToNow(emergency.createdAt.toDate())} ago
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(emergency.status)}`}>
                  {emergency.status?.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span>From: {SAMPLE_LOCATIONS[emergency.startLocation]?.name || emergency.startLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>To: {SAMPLE_LOCATIONS[emergency.endLocation]?.name || emergency.endLocation}</span>
                </div>
              </div>

              {emergency.description && (
                <p className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-lg">
                  {emergency.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    ETA: {emergency.estimatedArrival && 
                      formatDistanceToNow(emergency.estimatedArrival.toDate())}
                  </span>
                </div>

                <div className="flex gap-2">
                  {emergency.status === 'active' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(emergency.id, 'en-route')}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                    >
                      Mark En Route
                    </motion.button>
                  )}
                  {emergency.status === 'en-route' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(emergency.id, 'completed')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </motion.button>
                  )}
                </div>
              </div>

              {emergency.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{emergency.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${emergency.progress}%` }}
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}