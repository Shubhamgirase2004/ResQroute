import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import '../styles/LiveMapView.css';
import {
  Navigation as NavigationIcon,
  Clock,
  MapPin,
  Users,
  Shield,
  Radio,
  Zap,
  AlertCircle,
  Wifi,
  Play,
  X
} from 'lucide-react';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2h1YmgtZ2lyYXNlMjciLCJhIjoiY21iYXd2YzdwMTEyMzJxc2NrYWQ1d3FkcSJ9.Z1yFrzGl6zUwixA3Zr-P4A';

const LiveMapView = () => {
  const location = useLocation();
  const dispatchData = location.state?.dispatchData;

  const [viewState, setViewState] = useState({
    longitude: -74.006,
    latitude: 40.7128,
    zoom: 16,
    pitch: 0,
    bearing: 0
  });
  const [originalViewState, setOriginalViewState] = useState(null);
  const [navigationActive, setNavigationActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [routeProgress, setRouteProgress] = useState(0);
  const [eta, setEta] = useState(8);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [notificationPulse, setNotificationPulse] = useState({});
  const [geofenceRadius] = useState(0.003);
  const [routeData, setRouteData] = useState(null);

  const isNavigatingRef = useRef(false);
  const lastUpdateRef = useRef(Date.now());

  // Fetch route for navigation
  useEffect(() => {
    if (!dispatchData || !dispatchData.source || !dispatchData.destination) {
      setRouteData(null);
      return;
    }
    const fetchRoute = async () => {
      try {
        const { source, destination } = dispatchData;
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          setRouteData(data.routes[0].geometry);
        } else {
          setRouteData(null);
        }
      } catch (error) {
        console.error('Failed to fetch directions:', error);
        setRouteData(null);
      }
    };
    fetchRoute();
  }, [dispatchData]);

  // Get user current location and vehicles
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setUserLocation({ latitude: userLat, longitude: userLng });
          const initialViewState = {
            longitude: userLng,
            latitude: userLat,
            zoom: 16,
            pitch: 0,
            bearing: 0
          };
          setViewState(initialViewState);
          setOriginalViewState(initialViewState);

          const nearbyVehicles = [
            { id: 'EV001', type: 'emergency', latitude: userLat + 0.0005, longitude: userLng + 0.0008, color: '#dc2626', icon: "🚑", baseLatitude: userLat + 0.0005, baseLongitude: userLng + 0.0008, notified: false, distance: "50m" },
            { id: 'CV001', type: 'civilian', latitude: userLat + 0.0012, longitude: userLng + 0.0015, color: '#2563eb', icon: "🚗", baseLatitude: userLat + 0.0012, baseLongitude: userLng + 0.0015, notified: false, distance: "120m" },
            { id: 'CV002', type: 'civilian', latitude: userLat - 0.0008, longitude: userLng + 0.001, color: '#16a34a', icon: "🚗", baseLatitude: userLat - 0.0008, baseLongitude: userLng + 0.001, notified: false, distance: "80m" },
            { id: 'CV003', type: 'civilian', latitude: userLat - 0.001, longitude: userLng - 0.0012, color: '#ca8a04', icon: "🚙", baseLatitude: userLat - 0.001, baseLongitude: userLng - 0.0012, notified: false, distance: "100m" },
            { id: 'CV004', type: 'civilian', latitude: userLat + 0.002, longitude: userLng - 0.0005, color: '#a21caf', icon: "🚕", baseLatitude: userLat + 0.002, baseLongitude: userLng - 0.0005, notified: false, distance: "200m" },
            { id: 'EV002', type: 'emergency', latitude: userLat - 0.0015, longitude: userLng + 0.002, color: '#2563eb', icon: "🚓", baseLatitude: userLat - 0.0015, baseLongitude: userLng + 0.002, notified: false, distance: "150m" },
            { id: 'CV005', type: 'civilian', latitude: userLat + 0.0008, longitude: userLng - 0.002, color: '#e11d48', icon: "🚗", baseLatitude: userLat + 0.0008, baseLongitude: userLng - 0.002, notified: false, distance: "80m" },
            { id: 'EV003', type: 'emergency', latitude: userLat - 0.0005, longitude: userLng - 0.0008, color: '#16a34a', icon: "🚒", baseLatitude: userLat - 0.0005, baseLongitude: userLng - 0.0008, notified: false, distance: "50m" }
          ];
          setVehicles(nearbyVehicles);
          setLocationLoaded(true);
        },
        (error) => {
          console.error("Geolocation error:", error);
          const defaultLat = 40.7128;
          const defaultLng = -74.006;
          setUserLocation({ latitude: defaultLat, longitude: defaultLng });
          const defaultViewState = {
            longitude: defaultLng, latitude: defaultLat, zoom: 16, pitch: 0, bearing: 0
          };
          setViewState(defaultViewState);
          setOriginalViewState(defaultViewState);

          const defaultVehicles = [
            { id: 'EV001', type: 'emergency', latitude: defaultLat + 0.0005, longitude: defaultLng + 0.0008, color: '#dc2626', icon: "🚑", baseLatitude: defaultLat + 0.0005, baseLongitude: defaultLng + 0.0008, notified: false, distance: "50m" },
            { id: 'CV001', type: 'civilian', latitude: defaultLat + 0.0012, longitude: defaultLng + 0.0015, color: '#2563eb', icon: "🚗", baseLatitude: defaultLat + 0.0012, baseLongitude: defaultLng + 0.0015, notified: false, distance: "120m" }
          ];
          setVehicles(defaultVehicles);
          setLocationLoaded(true);
        }
      );
    }
  }, []);

  // Bearing calculation for nav mode
  const calculateBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    return (bearing + 360) % 360;
  };

  // Navigation activation
  const startNavigation = () => {
    if (!userLocation) return;
    isNavigatingRef.current = true;
    let bearing = 0;
    if (dispatchData?.destination) {
      bearing = calculateBearing(
        userLocation.latitude, userLocation.longitude,
        dispatchData.destination.latitude, dispatchData.destination.longitude
      );
    }
    const navViewState = {
      longitude: userLocation.longitude,
      latitude: userLocation.latitude,
      zoom: 19,
      pitch: 85,
      bearing: bearing
    };
    setViewState(navViewState);
    setNavigationActive(true);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1200);
  };

  // Navigation exit/reset
  const exitNavigation = () => {
    isNavigatingRef.current = true;
    setNavigationActive(false);
    if (originalViewState) {
      setViewState({ ...originalViewState, pitch: 0, bearing: 0 });
    }
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 800);
  };

  // Safe move handler: always allow interaction in navigation mode
  const handleMove = useCallback((evt) => {
    const now = Date.now();
    if (isNavigatingRef.current) return;
    if (now - lastUpdateRef.current < 50) return;
    const currentViewState = evt.viewState;
    const threshold = 0.00001;
    if (
      Math.abs(currentViewState.longitude - viewState.longitude) < threshold &&
      Math.abs(currentViewState.latitude - viewState.latitude) < threshold &&
      Math.abs(currentViewState.zoom - viewState.zoom) < 0.01 &&
      Math.abs(currentViewState.pitch - viewState.pitch) < 0.1 &&
      Math.abs(currentViewState.bearing - viewState.bearing) < 0.1
    ) { return; }
    lastUpdateRef.current = now;
    setViewState(currentViewState);
  }, [viewState]);

  const geofenceData = userLocation ? {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [userLocation.longitude, userLocation.latitude] },
      properties: { radius: geofenceRadius * 111000 }
    }]
  } : null;

  // Simulate geofencing notifications
  const triggerGeofenceNotification = useCallback((vehicleId) => {
    setNotificationPulse(prev => ({ ...prev, [vehicleId]: true }));
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, notified: true } : v));
    setTimeout(() => {
      setNotificationPulse(prev => ({ ...prev, [vehicleId]: false }));
    }, 2000);
  }, []);

  useEffect(() => {
    if (!locationLoaded || vehicles.length === 0) return;
    const notificationInterval = setInterval(() => {
      const unnotifiedVehicles = vehicles.filter(v => !v.notified);
      if (unnotifiedVehicles.length > 0) {
        const randomVehicle = unnotifiedVehicles[Math.floor(Math.random() * unnotifiedVehicles.length)];
        triggerGeofenceNotification(randomVehicle.id);
        const alertMessages = [
          `${randomVehicle.type === 'emergency' ? 'Emergency' : 'Civilian'} vehicle ${randomVehicle.id} notified`,
          `Alert sent to ${randomVehicle.id} (${randomVehicle.distance} away)`,
          `Geofence triggered: ${randomVehicle.id} received emergency protocol`,
          `Vehicle ${randomVehicle.id} - Route clearance requested`
        ];
        const newNotification = {
          id: Date.now(),
          type: 'geofence',
          vehicleId: randomVehicle.id,
          message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
          timestamp: new Date().toLocaleTimeString(),
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
      }
    }, 3000);
    return () => clearInterval(notificationInterval);
  }, [locationLoaded, vehicles, triggerGeofenceNotification]);

  // Vehicle movement & route demo animation
  const updateVehiclePositions = useCallback(() => {
    setVehicles(prevVehicles =>
      prevVehicles.map(vehicle => {
        const maxOffset = 0.0003;
        const newLongitude = vehicle.baseLongitude + (Math.random() - 0.5) * maxOffset;
        const newLatitude = vehicle.baseLatitude + (Math.random() - 0.5) * maxOffset;
        const longitude = isNaN(newLongitude) ? vehicle.baseLongitude : newLongitude;
        const latitude = isNaN(newLatitude) ? vehicle.baseLatitude : newLatitude;
        return {
          ...vehicle,
          longitude: Number(longitude.toFixed(7)),
          latitude: Number(latitude.toFixed(7))
        };
      })
    );
  }, []);

  const updateProgress = useCallback(() => {
    setRouteProgress(prev => {
      const newProgress = prev + 1;
      return newProgress >= 100 ? 0 : newProgress;
    });
    setEta(prev => {
      const newEta = prev - 0.05;
      return newEta <= 0 ? 8 : newEta;
    });
  }, []);

  useEffect(() => {
    if (!locationLoaded || vehicles.length === 0) return;
    const interval = setInterval(() => {
      updateVehiclePositions();
      updateProgress();
    }, 2000);
    return () => clearInterval(interval);
  }, [locationLoaded, vehicles.length, updateVehiclePositions, updateProgress]);

  // Layer configs
  const geofenceCircleLayer = {
    id: 'geofence-circle',
    type: 'circle',
    paint: {
      'circle-radius': { stops: [[0, 0], [20, 300]], base: 2 },
      'circle-color': '#ff0000',
      'circle-opacity': navigationActive ? 0.05 : 0.1,
      'circle-stroke-width': navigationActive ? 1 : 2,
      'circle-stroke-color': '#ff0000',
      'circle-stroke-opacity': navigationActive ? 0.2 : 0.4
    }
  };

  const routeLayer = {
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': navigationActive ? '#1E40AF' : '#1978c8',
      'line-width': navigationActive ? 12 : 6,
      'line-opacity': navigationActive ? 0.95 : 0.75,
      'line-blur': navigationActive ? 0.5 : 0
    }
  };

  // Recenter button handler
  const handleRecenter = () => {
    if (userLocation) {
      let bearing = 0;
      if (dispatchData?.destination) {
        bearing = calculateBearing(
          userLocation.latitude, userLocation.longitude,
          dispatchData.destination.latitude, dispatchData.destination.longitude
        );
      }
      setViewState({
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
        zoom: navigationActive ? 19 : 16,
        pitch: navigationActive ? 85 : 0,
        bearing
      });
    }
  };

  // Optionally show big start/destination pins in navigation
  const startPin = dispatchData?.source && {
    longitude: dispatchData.source.longitude,
    latitude: dispatchData.source.latitude
  };
  const destPin = dispatchData?.destination && {
    longitude: dispatchData.destination.longitude,
    latitude: dispatchData.destination.latitude
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-500 rounded-full livemap-pulse" />
              <h1 className="text-xl font-semibold text-gray-900">
                {navigationActive ? 'Navigation Active - Driving Mode' : 'Geofencing Emergency Alert System'}
              </h1>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                Priority: {dispatchData?.priority === '1' ? 'High' : dispatchData?.priority === '2' ? 'Medium' : 'Low'}
              </span>
              {navigationActive && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full livemap-pulse">
                  🧭 Navigation Mode Enabled
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <Wifi className="inline h-4 w-4 mr-1" />
                Active Geofence
              </div>
              <div className="text-sm text-gray-600">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                {vehicles.filter(v => v.notified).length}/{vehicles.length} Notified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map View */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: "700px", position: "relative" }}>
              {!locationLoaded ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing geofencing system...</p>
                    <p className="text-sm text-gray-500 mt-2">Please allow location access</p>
                  </div>
                </div>
              ) : MAPBOX_TOKEN ? (
                <>
                  <Map
                    key={navigationActive ? "navigation" : "normal"}
                    mapboxAccessToken={MAPBOX_TOKEN}
                    initialViewState={viewState}
                    viewState={viewState}
                    mapStyle={navigationActive ? "mapbox://styles/mapbox/navigation-day-v1" : "mapbox://styles/mapbox/streets-v11"}
                    style={{ width: "100%", height: "100%" }}
                    onMove={handleMove}
                    interactive={true}
                    transitionDuration={navigationActive ? 1200 : 0}
                    transitionInterpolator={null}
                    pitchEnabled={true}
                    bearingSnap={true}
                  >
                    <GeolocateControl
                      position="top-left"
                      showUserHeading={true}
                      trackUserLocation={navigationActive}
                      fitBoundsOptions={{ maxZoom: 19 }}
                    />
                    <NavigationControl position="top-right" showCompass={true} visualizePitch={true} />

                    {/* Geofence Circle - hide during navigation */}
                    {geofenceData && !navigationActive && (
                      <Source id="geofence" type="geojson" data={geofenceData}>
                        <Layer {...geofenceCircleLayer} />
                      </Source>
                    )}

                    {/* User location marker */}
                    {userLocation && (
                      <Marker
                        longitude={userLocation.longitude}
                        latitude={userLocation.latitude}
                        anchor="center"
                      >
                        <div
                          style={{
                            width: navigationActive ? '36px' : '24px',
                            height: navigationActive ? '36px' : '24px',
                            borderRadius: '50%',
                            backgroundColor: '#FF0000',
                            border: '4px solid #fff',
                            boxShadow: navigationActive
                              ? '0 0 0 4px #FF0000, 0 0 30px rgba(255,0,0,0.5)'
                              : '0 0 0 3px #FF0000, 0 0 20px rgba(255,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          className="livemap-pulse"
                          title="Emergency Alert Center"
                        >
                          <AlertCircle size={navigationActive ? 20 : 12} color="#fff" />
                        </div>
                      </Marker>
                    )}
                    {/* Start pin (navigation mode) */}
                    {startPin && navigationActive && (
                      <Marker longitude={startPin.longitude} latitude={startPin.latitude} anchor="bottom">
                        <div className="flex flex-col items-center" style={{ zIndex: 20 }}>
                          <span style={{
                            fontSize: 28,
                            background: "#2563eb",
                            color: "#fff",
                            borderRadius: "50%",
                            padding: "2px 8px",
                            fontWeight: "bold",
                            border: "3px solid #fff",
                            boxShadow: '0 0 10px #2563eb99'
                          }}>A</span>
                        </div>
                      </Marker>
                    )}
                    {/* Destination pin */}
                    {destPin && navigationActive && (
                      <Marker longitude={destPin.longitude} latitude={destPin.latitude} anchor="bottom">
                        <div className="flex flex-col items-center" style={{ zIndex: 20 }}>
                          <span style={{
                            fontSize: 32,
                            background: "#22c55e",
                            color: "#fff",
                            borderRadius: "50%",
                            padding: "2px 10px",
                            fontWeight: "bold",
                            border: "3px solid #fff",
                            boxShadow: '0 0 10px #22c55e99'
                          }}>B</span>
                        </div>
                      </Marker>
                    )}

                    {/* Vehicle markers */}
                    {vehicles.map((vehicle) => {
                      if (!vehicle.longitude || !vehicle.latitude || isNaN(vehicle.longitude) || isNaN(vehicle.latitude)) return null;
                      const isPulsing = notificationPulse[vehicle.id];
                      const isNotified = vehicle.notified;
                      const markerSize = navigationActive ? '30px' : '36px';
                      return (
                        <Marker
                          key={vehicle.id}
                          longitude={vehicle.longitude}
                          latitude={vehicle.latitude}
                          anchor="center"
                        >
                          <div
                            style={{
                              width: markerSize,
                              height: markerSize,
                              borderRadius: '50%',
                              backgroundColor: vehicle.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 'bold',
                              fontSize: navigationActive ? '15px' : '16px',
                              boxShadow: isNotified
                                ? '0 0 0 4px rgba(0,255,0,0.4), 0 2px 8px rgba(0,0,0,0.3)'
                                : '0 2px 4px rgba(0,0,0,0.2)',
                              border: isNotified ? '3px solid #00FF00' : '2px solid #fff',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              transform: isPulsing ? 'scale(1.25)' : 'scale(1)',
                              position: 'relative'
                            }}
                          >
                            {vehicle.icon}
                            {isNotified && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '-4px',
                                  right: '-4px',
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: '#00FF00',
                                  border: '2px solid #fff',
                                  boxShadow: '0 0 4px rgba(0,255,0,0.8)',
                                }}
                              />
                            )}
                            {isPulsing && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '-8px',
                                  left: '-8px',
                                  right: '-8px',
                                  bottom: '-8px',
                                  borderRadius: '50%',
                                  border: '3px solid #FFD700'
                                }}
                                className="livemap-ping"
                              />
                            )}
                          </div>
                        </Marker>
                      );
                    })}

                    {/* Route line */}
                    {routeData && (
                      <Source
                        id="route"
                        type="geojson"
                        data={{
                          type: 'Feature',
                          geometry: routeData
                        }}
                        lineMetrics={true}
                      >
                        <Layer {...routeLayer} />
                      </Source>
                    )}
                  </Map>
                  {/* Floating recenter button */}
                  {navigationActive && (
                    <button
                      onClick={handleRecenter}
                      className="livemap-recenter-btn"
                      title="Recenter map"
                    >
                      <NavigationIcon className="w-7 h-7 text-blue-700" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <p className="text-gray-500">Please set your MAPBOX_TOKEN in .env file</p>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="mt-4 flex justify-center space-x-4">
              {!navigationActive ? (
                <button
                  onClick={startNavigation}
                  disabled={!userLocation}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Play className="h-5 w-5" />
                  <span className="font-semibold">Start Navigation</span>
                </button>
              ) : (
                <button
                  onClick={exitNavigation}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                  <span className="font-semibold">Exit Navigation</span>
                </button>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Navigation Status */}
            {navigationActive && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Driving Navigation Active</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Status</span>
                    <span className="text-sm text-blue-900 font-semibold">🧭 NAVIGATING</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Pitch</span>
                    <span className="text-sm text-blue-900 font-semibold">85° (Vertical/Flyover View)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Mode</span>
                    <span className="text-sm text-blue-900">Emergency Route</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">ETA</span>
                    <span className="text-sm text-blue-900 font-semibold">{Math.round(eta)} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Route</span>
                    <span className="text-sm text-green-600 font-semibold">✓ ALIGNED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Geofencing Status */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geofencing Status</h3>
              {userLocation ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Geofence Active</span>
                    <span className="text-sm text-green-600 font-semibold">✓ ONLINE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Radius</span>
                    <span className="text-sm text-gray-900">300m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Vehicles in Range</span>
                    <span className="text-sm text-blue-600 font-semibold">{vehicles.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notifications Sent</span>
                    <span className="text-sm text-green-600 font-semibold">
                      {vehicles.filter(v => v.notified).length}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Setting up geofence...</p>
              )}
            </div>

            {/* Vehicle Status */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`flex items-center justify-between p-2 rounded text-sm ${
                      vehicle.notified ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{vehicle.icon}</span>
                      <span className="font-medium">{vehicle.id}</span>
                      <span className="text-gray-500">({vehicle.distance})</span>
                    </div>
                    <div className="flex items-center">
                      {vehicle.notified ? (
                        <span className="text-green-600 text-xs font-semibold">✓ NOTIFIED</span>
                      ) : (
                        <span className="text-gray-400 text-xs">PENDING</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Geofence Alerts</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 rounded-full mt-2 bg-green-500 livemap-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

export default LiveMapView;
