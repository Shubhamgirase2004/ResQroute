import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import SignupForm from './pages/SignupForm';
import UserLogin from './pages/UserLogin';
import AdminLogin from './pages/AdminLogin';
import DispatcherDashboard from './pages/DispatcherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LiveMapView from './pages/LiveMapView';
import Analytics from './pages/Analytics';
import { AuthProvider } from './context/auth';
import { ProtectedUser, ProtectedAdmin } from './ProtectedRoutes';
import Users from './pages/Users';
import Alerts from './pages/Alerts';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import ManageAccounts from './pages/ManageAccounts';
import ProfilePage from './pages/ProfilePage';
import ScheduleDispatch from './pages/ScheduleDispatch';
import RouteHistory from './pages/RouteHistory';
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><LandingPage /></Layout>} />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/login/user" element={<UserLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />

          {/* Protected User Routes */}
          <Route path="/dispatcher" element={<ProtectedUser><DispatcherDashboard /></ProtectedUser>} />
          <Route path="/live-map" element={<ProtectedUser><LiveMapView /></ProtectedUser>} />
          <Route path="/analytics" element={<ProtectedUser><Analytics /></ProtectedUser>} />
          <Route path="/profile" element={<ProtectedUser><ProfilePage /></ProtectedUser>} />

          {/* Protected Admin Routes */}
          <Route path="/admin-dashboard" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
          <Route path="/dashboard" element={<ProtectedAdmin><Dashboard /></ProtectedAdmin>} />
          <Route path="/reports" element={<ProtectedAdmin><Reports /></ProtectedAdmin>} />
          <Route path="/reports/:id" element={<ProtectedAdmin><ReportDetail /></ProtectedAdmin>} />
          <Route path="/accounts" element={<ProtectedAdmin><ManageAccounts /></ProtectedAdmin>} />
          <Route path="/users" element={<ProtectedAdmin><Users /></ProtectedAdmin>} />
          <Route path="/alerts" element={<ProtectedAdmin><Alerts /></ProtectedAdmin>} />
          <Route path="/schedule-dispatch" element={<ScheduleDispatch />} />
          <Route path="/route-history" element={<RouteHistory />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
