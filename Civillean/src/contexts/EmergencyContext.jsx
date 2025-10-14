import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { collection, addDoc, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const EmergencyContext = createContext();

const initialState = {
  activeEmergencies: [],
  currentRoute: null,
  isTracking: false,
  trafficData: {},
  alerts: [],
  demoMode: false
};

function emergencyReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_EMERGENCIES':
      return { ...state, activeEmergencies: action.payload };
    case 'ADD_EMERGENCY':
      return { ...state, activeEmergencies: [...state.activeEmergencies, action.payload] };
    case 'UPDATE_EMERGENCY':
      return {
        ...state,
        activeEmergencies: state.activeEmergencies.map(emergency =>
          emergency.id === action.payload.id ? { ...emergency, ...action.payload } : emergency
        )
      };
    case 'SET_CURRENT_ROUTE':
      return { ...state, currentRoute: action.payload };
    case 'SET_TRACKING':
      return { ...state, isTracking: action.payload };
    case 'UPDATE_TRAFFIC':
      return { ...state, trafficData: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [...state.alerts, action.payload] };
    case 'TOGGLE_DEMO_MODE':
      return { ...state, demoMode: !state.demoMode };
    default:
      return state;
  }
}

export function useEmergency() {
  return useContext(EmergencyContext);
}

export function EmergencyProvider({ children }) {
  const [state, dispatch] = useReducer(emergencyReducer, initialState);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'emergencies'), (snapshot) => {
      const emergencies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: 'SET_ACTIVE_EMERGENCIES', payload: emergencies });
    });

    return unsubscribe;
  }, []);

  const createEmergency = async (emergencyData) => {
    try {
      const docRef = await addDoc(collection(db, 'emergencies'), {
        ...emergencyData,
        createdAt: new Date(),
        status: 'active',
        progress: 0
      });
      
      toast.success('Emergency dispatch created successfully!');
      return docRef.id;
    } catch (error) {
      toast.error('Failed to create emergency dispatch');
      console.error('Error creating emergency:', error);
    }
  };

  const updateEmergencyStatus = async (emergencyId, updates) => {
    try {
      await updateDoc(doc(db, 'emergencies', emergencyId), updates);
      dispatch({ type: 'UPDATE_EMERGENCY', payload: { id: emergencyId, ...updates } });
    } catch (error) {
      console.error('Error updating emergency:', error);
    }
  };

  const simulateTrafficUpdate = () => {
    const trafficLevels = ['low', 'medium', 'high'];
    const randomLevel = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
    
    dispatch({ type: 'UPDATE_TRAFFIC', payload: { level: randomLevel, timestamp: Date.now() } });
    
    if (randomLevel === 'high' && state.currentRoute) {
      toast.error('High traffic detected! Rerouting recommended.');
      dispatch({ 
        type: 'ADD_ALERT', 
        payload: { 
          type: 'traffic', 
          message: 'High traffic detected on current route', 
          timestamp: Date.now() 
        } 
      });
    }
  };

  const value = {
    ...state,
    dispatch,
    createEmergency,
    updateEmergencyStatus,
    simulateTrafficUpdate
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
}