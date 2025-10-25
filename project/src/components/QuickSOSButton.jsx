import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineExclamation } from 'react-icons/hi';

const QuickSOSButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emergencyType, setEmergencyType] = useState('medical');

  const handleEmergency = async () => {
    if (!window.confirm('Are you sure you want to send an emergency alert?')) {
      return;
    }

    setLoading(true);

    try {
      // ✅ GET TOKEN FROM LOCALSTORAGE
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first to send emergency alerts');
        setLoading(false);
        setIsOpen(false);
        return;
      }

      // Get current location
      let coordinates = {};
      let locationName = 'Unknown Location';

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true
            });
          });
          
          coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          locationName = `Lat: ${coordinates.latitude.toFixed(4)}, Lng: ${coordinates.longitude.toFixed(4)}`;
          
          console.log('📍 Emergency location captured:', coordinates);
        } catch (geoError) {
          console.warn('Location access denied:', geoError);
          toast.error('Location access is required for emergency alerts. Please enable location services.');
          setLoading(false);
          return;
        }
      } else {
        toast.error('Your device does not support location services');
        setLoading(false);
        return;
      }

      // Send emergency alert
      console.log('🚨 Sending emergency alert...');
      
      const response = await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,  // ✅ ADD TOKEN
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: emergencyType,
          message: `EMERGENCY: ${emergencyType.toUpperCase()} assistance needed immediately!`,
          location: locationName,
          coordinates,
          priority: 'critical'
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok) {
        toast.success('🚨 Emergency alert sent! Help is on the way!');
        setIsOpen(false);
      } else {
        toast.error(data.message || 'Failed to send alert');
        console.error('Alert error:', data);
      }
    } catch (error) {
      toast.error('Failed to send emergency alert');
      console.error('Emergency alert error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-6 shadow-2xl animate-pulse hover:animate-none transition-all"
        title="Emergency SOS"
      >
        <HiOutlineExclamation className="w-10 h-10" />
      </button>

      {/* Emergency Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <HiOutlineExclamation className="w-8 h-8" />
              Emergency Alert
            </h2>
            
            <p className="text-gray-700 mb-6">
              Select the type of emergency and we'll immediately alert nearby emergency services and vehicles.
            </p>

            {/* Emergency Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Emergency Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'medical', label: '🚑 Medical', color: 'red' },
                  { value: 'fire', label: '🔥 Fire', color: 'orange' },
                  { value: 'accident', label: '🚗 Accident', color: 'yellow' },
                  { value: 'police', label: '🚓 Police', color: 'blue' }
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setEmergencyType(type.value)}
                    className={`p-3 rounded-lg border-2 transition ${
                      emergencyType === type.value
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="block font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your current location will be shared with emergency services.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergency}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Sending...' : '🚨 Send Alert'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickSOSButton;
