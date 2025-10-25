import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CreateAlert = () => {
  const [formData, setFormData] = useState({
    type: 'fire',
    message: '',
    location: '',
    priority: 'high'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Capture user location (optional)
      let coordinates = {};
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('📍 Location captured:', coordinates);
        } catch (geoError) {
          console.warn('Location access denied:', geoError);
          toast.info('Location not available - alert will still be sent');
        }
      }

      const response = await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          coordinates
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Only use fields the backend provides!
        toast.success(data.message || 'Alert created!');
        // Reset form
        setFormData({ type: 'fire', message: '', location: '', priority: 'high' });
      } else {
        toast.error(data.message || 'Failed to create alert');
      }
    } catch (error) {
      toast.error('Failed to create alert');
      console.error('Alert creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">🚨 Create Emergency Alert</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Emergency Type</label>
        <select 
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="w-full p-2 border rounded"
          required
        >
          <option value="fire">🔥 Fire Emergency</option>
          <option value="medical">🚑 Medical Emergency</option>
          <option value="accident">🚗 Traffic Accident</option>
          <option value="police">🚓 Police Emergency</option>
          <option value="traffic">🚦 Traffic Congestion</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          placeholder="e.g., Downtown Plaza, MG Road Junction"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Alert Message</label>
        <textarea
          placeholder="Describe the emergency situation..."
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full p-2 border rounded"
          rows="3"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Priority Level</label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({...formData, priority: e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="critical">⚠️ Critical Priority</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
      >
        {loading ? 'Creating Alert...' : '🚨 Create & Send Emergency Alert'}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        This will notify all admins, emergency drivers, and nearby vehicles
      </p>
    </form>
  );
};

export default CreateAlert;
