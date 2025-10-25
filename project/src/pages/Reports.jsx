import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { 
  HiOutlineDocumentReport,
  HiOutlineArrowLeft,
  HiOutlineFilter
} from 'react-icons/hi';
import toast from 'react-hot-toast';

function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login/admin');
      return;
    }

    if (user.role !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }

    fetchReports();
  }, [user, navigate]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login first');
        navigate('/login/admin');
        return;
      }

      console.log('Fetching reports...');
      
      const response = await fetch('http://localhost:5000/api/reports', {
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
        throw new Error('Failed to fetch reports');
      }

      const data = await response.json();
      console.log('Reports loaded:', data.logs.length);
      setLogs(data.logs);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const actionStyles = {
      login: 'bg-green-100 text-green-800',
      logout: 'bg-gray-100 text-gray-800',
      alert_created: 'bg-red-100 text-red-800',
      alert_resolved: 'bg-blue-100 text-blue-800',
      user_created: 'bg-purple-100 text-purple-800',
      user_updated: 'bg-yellow-100 text-yellow-800',
      user_deleted: 'bg-red-100 text-red-800',
      role_changed: 'bg-indigo-100 text-indigo-800',
      profile_updated: 'bg-cyan-100 text-cyan-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${actionStyles[action] || 'bg-gray-100 text-gray-800'}`}>
        {action.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(filter.toLowerCase()) ||
                         log.user?.name?.toLowerCase().includes(filter.toLowerCase()) ||
                         log.user?.email?.toLowerCase().includes(filter.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <HiOutlineDocumentReport className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activity Reports</h1>
                <p className="text-gray-600 text-sm">{filteredLogs.length} activities found</p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchReports}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by description, name, or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="alert_created">Alert Created</option>
              <option value="alert_resolved">Alert Resolved</option>
              <option value="user_created">User Created</option>
              <option value="user_updated">User Updated</option>
              <option value="user_deleted">User Deleted</option>
              <option value="role_changed">Role Changed</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Action</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No activity logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{log.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{log.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                    <td className="px-6 py-4 text-gray-700">{log.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;
