import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, Clock, Send } from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';
import { SAMPLE_LOCATIONS } from '../../config/mapbox';
import toast from 'react-hot-toast';

export default function EmergencyForm() {
  const [formData, setFormData] = useState({
    startLocation: '',
    endLocation: '',
    priority: '2',
    vehicleType: 'ambulance',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { createEmergency } = useEmergency();

  const priorityLevels = [
    { value: '1', label: 'Critical', color: 'bg-red-500', description: 'Life-threatening emergency' },
    { value: '2', label: 'High', color: 'bg-orange-500', description: 'Urgent medical attention' },
    { value: '3', label: 'Medium', color: 'bg-yellow-500', description: 'Non-critical transport' }
  ];

  const vehicleTypes = [
    { value: 'ambulance', label: 'Ambulance', icon: '🚑' },
    { value: 'fire', label: 'Fire Truck', icon: '🚒' },
    { value: 'police', label: 'Police', icon: '🚓' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startLocation || !formData.endLocation) {
      toast.error('Please select both start and end locations');
      return;
    }

    setLoading(true);
    try {
      await createEmergency({
        ...formData,
        dispatchTime: new Date(),
        estimatedArrival: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      });
      
      // Reset form
      setFormData({
        startLocation: '',
        endLocation: '',
        priority: '2',
        vehicleType: 'ambulance',
        description: ''
      });
    } catch (error) {
      console.error('Error creating emergency:', error);
    }
    setLoading(false);
  };

  const loadSampleRoute = () => {
    setFormData({
      ...formData,
      startLocation: 'aiims',
      endLocation: 'safdarjung',
      description: 'Patient transfer between hospitals - Demo scenario'
    });
    toast('Sample route loaded!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Create Emergency Dispatch
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadSampleRoute}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          Load Demo Route
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Start Location
            </label>
            <select
              value={formData.startLocation}
              onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select start location</option>
              {Object.entries(SAMPLE_LOCATIONS).map(([key, location]) => (
                <option key={key} value={key}>{location.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination
            </label>
            <select
              value={formData.endLocation}
              onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Select destination</option>
              {Object.entries(SAMPLE_LOCATIONS).map(([key, location]) => (
                <option key={key} value={key}>{location.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Emergency Priority Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {priorityLevels.map((level) => (
              <motion.label
                key={level.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.priority === level.value
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={level.value}
                  checked={formData.priority === level.value}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full ${level.color} mb-2`}></div>
                <span className="font-semibold text-gray-900">{level.label}</span>
                <span className="text-xs text-gray-600 mt-1">{level.description}</span>
              </motion.label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {vehicleTypes.map((vehicle) => (
              <motion.label
                key={vehicle.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.vehicleType === vehicle.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="vehicleType"
                  value={vehicle.value}
                  checked={formData.vehicleType === vehicle.value}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{vehicle.icon}</span>
                <span className="font-medium">{vehicle.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
            placeholder="Additional details about the emergency..."
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Creating Dispatch...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Create Emergency Dispatch
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}