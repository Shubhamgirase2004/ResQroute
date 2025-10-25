import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { 
  HiOutlineUserGroup, 
  HiOutlineExclamationCircle, 
  HiOutlineDocumentReport, 
  HiOutlineCog, 
  HiOutlineLogout 
} from 'react-icons/hi';
import CreateAlert from '../components/CreateAlert';
import Analytics from '../pages/Analytics';

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, activeAlerts: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch real stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch users count
        const usersRes = await fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        
        // Fetch alerts count
        const alertsRes = await fetch('http://localhost:5000/api/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const alertsData = await alertsRes.json();
        
        setStats({
          users: Array.isArray(usersData) ? usersData.length : 0,
          activeAlerts: Array.isArray(alertsData) ? alertsData.filter(a => a.status === 'active').length : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 pb-24">
      {/* NAVIGATION TABS */}
      <nav className="w-full max-w-6xl flex items-center justify-between py-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Analytics
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold shadow hover:bg-red-700 transition flex items-center gap-2"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Logout
        </button>
      </nav>

      {/* CONTENT */}
      {activeTab === 'dashboard' && (
        <>
          {/* WELCOME BANNER */}
          <div className="w-full max-w-6xl p-8 mt-2 bg-gradient-to-r from-blue-200 to-green-100 rounded-xl shadow">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              {/* Welcome Text */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome, {user?.name || 'Admin'}!
                </h2>
                <p className="text-lg text-gray-700">
                  Monitor real-time stats, manage users and alerts, and access all admin tools below.
                </p>
              </div>
              {/* Stats Mini Cards */}
              <div className="flex gap-5 items-start">
                <DashboardStat
                  icon={<HiOutlineUserGroup className="w-8 h-8 text-blue-600 mb-1" />}
                  value={stats.users}
                  label="Users"
                  link="/users"
                  color="blue"
                />
                <DashboardStat
                  icon={<HiOutlineExclamationCircle className="w-8 h-8 text-red-500 mb-1" />}
                  value={stats.activeAlerts}
                  label="Active Alerts"
                  link="/alerts"
                  color="red"
                />
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="w-full max-w-6xl mt-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🚨 Quick Actions</h3>
            <CreateAlert />
          </div>

          {/* ACTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl mt-14">
            <InteractiveCard
              icon={<HiOutlineDocumentReport className="w-9 h-9 text-green-700" />}
              title="View Reports"
              desc="Audit, filter and analyze detailed user activity, system logs and more."
              link="/reports"
              cta="Go to Reports"
              bg="from-green-100 to-white"
            />
            <InteractiveCard
              icon={<HiOutlineCog className="w-9 h-9 text-purple-700" />}
              title="Manage Accounts"
              desc="Create, update, or deactivate accounts. Control admin privileges."
              link="/accounts"
              cta="Manage Accounts"
              bg="from-purple-100 to-white"
            />
            <InteractiveCard
              icon={<HiOutlineExclamationCircle className="w-9 h-9 text-red-700" />}
              title="Alert System"
              desc="Monitor and respond to active emergency alerts in real-time."
              link="/alerts"
              cta="View Alerts"
              bg="from-red-100 to-white"
            />
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <div className="w-full max-w-7xl mt-4">
          <Analytics />
        </div>
      )}
    </div>
  );
}

// Dashboard stat mini-card (clickable)
function DashboardStat({ icon, value, label, link, color }) {
  const colorClasses = {
    blue: {
      border: 'border-blue-300 hover:border-blue-500',
      text: 'text-blue-800 group-hover:text-blue-600'
    },
    red: {
      border: 'border-red-300 hover:border-red-500',
      text: 'text-red-800 group-hover:text-red-600'
    }
  };

  return (
    <Link 
      to={link}
      className={`bg-white rounded-lg shadow flex flex-col items-center px-8 py-4 transition hover:scale-105 group border-t-4 ${colorClasses[color].border}`}
    >
      {icon}
      <span className={`block text-xl font-semibold ${colorClasses[color].text}`}>{value}</span>
      <span className="text-gray-600 text-sm">{label}</span>
    </Link>
  );
}

// Main action card
function InteractiveCard({ icon, title, desc, link, cta, bg }) {
  return (
    <Link 
      to={link} 
      className={`group flex flex-col h-full rounded-xl shadow-md bg-gradient-to-tr ${bg} px-8 py-8 hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer`}
    >
      <div className="mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2 group-hover:text-blue-700">{title}</h3>
      <p className="text-gray-700 mb-4">{desc}</p>
      <span className="mt-auto inline-block px-4 py-2 bg-blue-700 group-hover:bg-blue-800 text-white rounded-lg font-semibold shadow transition">
        {cta}
      </span>
    </Link>
  );
}
