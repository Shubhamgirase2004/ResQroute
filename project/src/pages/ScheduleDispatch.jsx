import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const ScheduleDispatch = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    location: '',
    vehicleType: 'ambulance',
    incidentType: '',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Scheduled dispatch:', formData);
    toast.success('Dispatch scheduled successfully!');
    
    // Navigate back to dashboard after 1 second
    setTimeout(() => navigate('/dispatcher'), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 mr-3 text-blue-600" />
            Schedule Dispatch
          </h1>
          <p className="text-gray-600 mt-2">Plan and schedule future emergency vehicle dispatches</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Scheduled Date
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Scheduled Time
                </label>
                <input
                  type="time"
                  id="scheduledTime"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Dispatch Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location or address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Vehicle Type and Incident */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ambulance">🚑 Ambulance</option>
                  <option value="police">🚓 Police</option>
                  <option value="fire">🚒 Fire Truck</option>
                  <option value="rescue">🚐 Rescue Vehicle</option>
                </select>
              </div>

              <div>
                <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Incident Type
                </label>
                <input
                  type="text"
                  id="incidentType"
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleInputChange}
                  placeholder="e.g., Medical Transport, Routine Check"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="Any special instructions or requirements..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Clock className="h-5 w-5 mr-2" />
                Schedule Dispatch
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDispatch;
