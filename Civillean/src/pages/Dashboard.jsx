import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import EmergencyForm from '../components/dashboard/EmergencyForm';
import ActiveEmergencies from '../components/dashboard/ActiveEmergencies';
import MapView from '../components/dashboard/MapView';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                Emergency Dispatch Center
              </h1>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Online
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                {currentUser?.email || 'Dispatcher'}
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Dashboard */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DashboardStats />
          </motion.section>

          {/* Emergency Form and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EmergencyForm />
            </motion.section>
            
            <motion.section
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MapView />
            </motion.section>
          </div>

          {/* Active Emergencies and Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <ActiveEmergencies />
            </motion.section>
            
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AlertsPanel />
            </motion.section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white border-t border-gray-200 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>© 2025 Emergency Route Clearance System - Final Year Project</p>
            <div className="flex items-center gap-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <span>Last updated: Just now</span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}