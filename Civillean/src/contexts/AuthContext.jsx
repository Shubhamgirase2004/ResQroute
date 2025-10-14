import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    // For demo purposes, simulate successful signup
    if (email.includes('demo') || email.includes('emergency')) {
      return Promise.resolve({ user: { email, uid: 'demo-user-id' } });
    }
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    // For demo purposes, allow demo credentials
    if (email === 'dispatcher@emergency.demo' && password === 'demo123') {
      const mockUser = { email, uid: 'demo-user-id' };
      setCurrentUser(mockUser);
      return Promise.resolve({ user: mockUser });
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}