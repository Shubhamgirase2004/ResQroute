import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { 
  HiOutlineExclamationCircle, 
  HiOutlineArrowLeft,
  HiOutlineFire,
  HiOutlineTruck,
  HiOutlineShieldCheck,
  HiOutlineLocationMarker,
  HiOutlineRefresh
} from 'react-icons/hi';
import toast from 'react-hot-toast';

function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!user) {
      navigate('/login/admin');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }

    fetchAlerts();
    
    // Auto-refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        navigate('/login/admin');
        return;
      }

      console.log('Fetching alerts...');
      
      const response = await fetch('http://localhost:5000/api/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login/admin');
          return;
        }
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      console.log('Alerts loaded:', data.length);
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      setResolvingId(alertId);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        return;
      }

      console.log('Resolving alert:', alertId);

      const response = await fetch(`http://localhost:5000/api/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('✅ Alert resolved successfully!');
        // Refresh alerts list
        fetchAlerts();
      } else {
        toast.error(data.message || 'Failed to resolve alert');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    } finally {
      setResolvingId(null);
    }
  };

  const getAlertIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'fire':
        return <HiOutlineFire className="w-6 h-6 text-red-600" />;
      case 'medical':
        return <HiOutlineShieldCheck className="w-6 h-6 text-blue-600" />;
      case 'traffic':
        return <HiOutlineTruck className="w-6 h-6 text-yellow-600" />;
      case 'accident':
        return <HiOutlineExclamationCircle className="w-6 h-6 text-orange-600" />;
      case 'police':
        return <HiOutlineShieldCheck className="w-6 h-6 text-blue-700" />;
      default:
        return <HiOutlineLocationMarker className="w-6 h-6 text-gray-600" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type.toLowerCase()) {
      case 'fire':
        return 'bg-red-50 border-red-200';
      case 'medical':
        return 'bg-blue-50 border-blue-200';
      case 'traffic':
        return 'bg-yellow-50 border-yellow-200';
      case 'accident':
        return 'bg-orange-50 border-orange-200';
      case 'police':
        return 'bg-blue-50 border-blue-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityLower = priority?.toLowerCase() || 'medium';
    
    switch (priorityLower) {
      case 'critical':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">CRITICAL</span>;
      case 'high':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white">HIGH</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white">MEDIUM</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">LOW</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-500 text-white">UNKNOWN</span>;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = alert.message.toLowerCase().includes(filter.toLowerCase()) ||
                         alert.type.toLowerCase().includes(filter.toLowerCase()) ||
                         alert.location?.toLowerCase().includes(filter.toLowerCase());
    const matchesType = selectedType === 'all' || alert.type.toLowerCase() === selectedType.toLowerCase();
    return matchesFilter && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
           <button
           onClick={() => navigate(-1)}
           className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
           title="Go Back"
           >
           <HiOutlineArrowLeft className="w-6 h-6 text-gray-700" />
           </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <HiOutlineExclamationCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-red-900">Active Alerts</h1>
                <p className="text-gray-600 text-sm">
                  {filteredAlerts.filter(a => a.status === 'active').length} active emergencies
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchAlerts}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <HiOutlineRefresh className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Filter */}
            <input
              type="text"
              placeholder="Filter by message, type, or location..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="fire">Fire</option>
              <option value="medical">Medical</option>
              <option value="traffic">Traffic</option>
              <option value="accident">Accident</option>
              <option value="police">Police</option>
            </select>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Message
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <HiOutlineExclamationCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-lg font-medium">No alerts found</p>
                      <p className="text-sm">All clear - no active emergencies</p>
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr 
                      key={alert._id} 
                      className={`hover:bg-gray-50 transition-colors border-l-4 ${
                        alert.status === 'active' ? getAlertColor(alert.type) : 'border-gray-200'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getAlertIcon(alert.type)}
                          <span className="font-medium text-gray-900 capitalize">
                            {alert.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(alert.priority)}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {new Date(alert.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {alert.message}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {alert.location || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          alert.status === 'active' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {alert.status === 'active' ? 'Active' : 'Resolved'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {alert.status === 'active' && (
                          <button
                            onClick={() => handleResolveAlert(alert._id)}
                            disabled={resolvingId === alert._id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resolvingId === alert._id ? 'Resolving...' : 'Resolve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
              <HiOutlineExclamationCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
              </div>
              <HiOutlineFire className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.status === 'resolved').length}
                </p>
              </div>
              <HiOutlineShieldCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-blue-600">~5 min</p>
              </div>
              <HiOutlineTruck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alerts;
