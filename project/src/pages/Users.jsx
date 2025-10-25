import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { HiOutlineUsers, HiOutlineArrowLeft, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import toast from 'react-hot-toast';

const Users = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Check authentication and fetch users
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      console.log('❌ No user, redirecting to login');
      navigate('/login/admin');
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('❌ Not admin, access denied');
      toast.error('Unauthorized access - Admin only');
      navigate('/');
      return;
    }

    console.log('✅ User authenticated, fetching users...');
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found');
        toast.error('Please login first');
        navigate('/login/admin');
        return;
      }

      console.log('📡 Fetching from: http://localhost:5000/api/users');
      
      // ✅ Correct: Full URL + Authorization header
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login/admin');
          return;
        }
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Users loaded:', data.length, 'users');
      setUsers(data);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh list
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User role updated successfully');
        fetchUsers(); // Refresh list
      } else {
        toast.error(data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800',
      driver: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleStyles[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(filter.toLowerCase()) ||
                         u.email.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
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
                <HiOutlineUsers className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
                <p className="text-gray-600 text-sm">{filteredUsers.length} users found</p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchUsers}
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
              placeholder="Search by name or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="driver">Drivers</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Change Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg font-medium">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-gray-700">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="user">User</option>
                        <option value="driver">Driver</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Admins</p>
            <p className="text-2xl font-bold text-red-600">{users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Drivers</p>
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'driver').length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Regular Users</p>
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'user').length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
