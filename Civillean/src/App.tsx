import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { EmergencyProvider } from './contexts/EmergencyContext';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import CivilianView from './pages/CivilianView';

function AppContent() {
  const { currentUser } = useAuth();
  
  return currentUser ? <CivilianView /> : <AuthPage />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <EmergencyProvider>
          <div className="App">
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '16px',
                },
                success: {
                  style: {
                    background: '#059669',
                  },
                },
                error: {
                  style: {
                    background: '#DC2626',
                  },
                },
              }}
            />
          </div>
        </EmergencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;