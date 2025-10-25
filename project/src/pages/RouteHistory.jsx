import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, ArrowLeft, MapPin, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';

const RouteHistory = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample route history data
  const routes = [
    {
      id: 'R001',
      date: '2025-10-25',
      time: '14:30',
      from: 'Central Hospital',
      to: 'Downtown Plaza',
      vehicleType: 'Ambulance',
      status: 'completed',
      duration: '12 min',
      distance: '5.2 km'
    },
    {
      id: 'R002',
      date: '2025-10-25',
      time: '13:15',
      from: 'Fire Station A',
      to: 'Industrial Zone',
      vehicleType: 'Fire Truck',
      status: 'completed',
      duration: '18 min',
      distance: '8.7 km'
    },
    {
      id: 'R003',
      date: '2025-10-25',
      time: '12:00',
      from: 'Police HQ',
      to: 'City Center',
      vehicleType: 'Police',
      status: 'completed',
      duration: '10 min',
      distance: '4.3 km'
    },
    {
      id: 'R004',
      date: '2025-10-24',
      time: '16:45',
      from: 'Rescue Base',
      to: 'Mountain Road',
      vehicleType: 'Rescue Vehicle',
      status: 'cancelled',
      duration: '-',
      distance: '-'
    },
    {
      id: 'R005',
      date: '2025-10-24',
      time: '11:20',
      from: 'Medical Center',
      to: 'Airport',
      vehicleType: 'Ambulance',
      status: 'completed',
      duration: '25 min',
      distance: '15.1 km'
    }
  ];

  const filteredRoutes = filterStatus === 'all' 
    ? routes 
    : routes.filter(r => r.status === filterStatus);

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          <CheckCircle className="h-4 w-4 mr-1" />
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
        <XCircle className="h-4 w-4 mr-1" />
        Cancelled
      </span>
    );
  };

  const getVehicleEmoji = (type) => {
    const icons = {
      'Ambulance': '🚑',
      'Fire Truck': '🚒',
      'Police': '🚓',
      'Rescue Vehicle': '🚐'
    };
    return icons[type] || '🚗';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Navigation className="h-8 w-8 mr-3 text-green-600" />
                Route History
              </h1>
              <p className="text-gray-600 mt-2">View all past dispatch routes and their details</p>
            </div>
            
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Routes</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {filteredRoutes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Navigation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No routes found for the selected filter</p>
            </div>
          ) : (
            filteredRoutes.map((route) => (
              <div key={route.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getVehicleEmoji(route.vehicleType)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{route.id}</h3>
                      <p className="text-sm text-gray-500">{route.vehicleType}</p>
                    </div>
                  </div>
                  {getStatusBadge(route.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Route Info */}
                  <div className="col-span-2">
                    <div className="flex items-start space-x-4">
                      <div className="flex-grow">
                        <div className="flex items-center text-gray-700 mb-2">
                          <MapPin className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium">From:</span>
                          <span className="ml-2">{route.from}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <MapPin className="h-5 w-5 text-red-600 mr-2" />
                          <span className="font-medium">To:</span>
                          <span className="ml-2">{route.to}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{route.duration}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Navigation className="h-5 w-5 text-gray-500 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-semibold text-gray-900">{route.distance}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {route.date} at {route.time}
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteHistory;
