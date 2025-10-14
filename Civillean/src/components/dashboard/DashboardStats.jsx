import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { useEmergency } from '../../contexts/EmergencyContext';

export default function DashboardStats() {
  const { activeEmergencies, demoMode } = useEmergency();
  const [stats, setStats] = useState({
    totalDispatches: 0,
    averageResponseTime: '0 min',
    activeVehicles: 0,
    completedToday: 0,
    trafficOptimization: '0%',
    systemUptime: '99.9%'
  });

  useEffect(() => {
    if (demoMode) {
      // Simulate real-time stats updates
      const interval = setInterval(() => {
        setStats(prev => ({
          totalDispatches: prev.totalDispatches + Math.floor(Math.random() * 2),
          averageResponseTime: `${12 + Math.floor(Math.random() * 8)} min`,
          activeVehicles: activeEmergencies.length + Math.floor(Math.random() * 5),
          completedToday: prev.completedToday + (Math.random() > 0.8 ? 1 : 0),
          trafficOptimization: `${85 + Math.floor(Math.random() * 10)}%`,
          systemUptime: '99.9%'
        }));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [demoMode, activeEmergencies.length]);

  const statCards = [
    {
      title: 'Active Emergencies',
      value: activeEmergencies.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      change: demoMode ? '+2 from last hour' : 'Current active'
    },
    {
      title: 'Avg Response Time',
      value: stats.averageResponseTime,
      icon: Timer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: demoMode ? '18% improvement' : 'Target: <15 min'
    },
    {
      title: 'Active Vehicles',
      value: stats.activeVehicles,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: demoMode ? 'Real-time tracking' : 'Fleet status'
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: demoMode ? '+5 since morning' : 'Daily progress'
    },
    {
      title: 'Traffic Optimization',
      value: stats.trafficOptimization,
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      change: demoMode ? 'AI-powered routing' : 'Route efficiency'
    },
    {
      title: 'System Uptime',
      value: stats.systemUptime,
      icon: MapPin,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      change: demoMode ? 'Last 30 days' : 'Service reliability'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${stat.color}`} />
              </div>
              
              {demoMode && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </h3>
              <motion.p 
                key={stat.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-gray-900 mb-2"
              >
                {stat.value}
              </motion.p>
              <p className="text-sm text-gray-500">
                {stat.change}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}