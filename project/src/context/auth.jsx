import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { requestNotificationPermission } from '../utils/notifications';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Start with null (not logged in)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token check:', token); // Debug
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded token:', decoded); // Debug
        
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired'); // Debug
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setUser(decoded);
          // Register FCM token on app load if user is logged in
          registerFCMToken(token);
        }
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    
    setLoading(false);
  }, []);

  // ✅ NEW: Function to register FCM token
  const registerFCMToken = async (jwtToken) => {
    try {
      console.log('Requesting notification permission...');
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        console.log('FCM Token obtained:', fcmToken);
        
        // Send token to backend
        const response = await fetch('http://localhost:5000/api/fcm/register', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fcmToken })
        });

        if (response.ok) {
          console.log('✅ FCM token registered successfully');
        } else {
          console.error('❌ Failed to register FCM token:', await response.text());
        }
      } else {
        console.log('⚠️ Notification permission denied or not available');
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  };

  // ✅ UPDATED: login function now registers FCM token
  const login = async (token) => {
    console.log('Login called with token:', token); // Debug
    localStorage.setItem('token', token);
    
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded user:', decoded); // Debug
      setUser(decoded);
      
      // ✅ Register FCM token after successful login
      await registerFCMToken(token);
    } catch (error) {
      console.error('Login decode error:', error);
    }
  };

  const logout = () => {
    console.log('Logout called'); // Debug
    localStorage.removeItem('token');
    setUser(null);
  };

  // Don't render children until we've checked for existing token
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
