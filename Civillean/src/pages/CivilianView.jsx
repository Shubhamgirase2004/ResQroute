import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Volume2, X, Play } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Distance in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function CivilianView() {
  const { logout } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [distance, setDistance] = useState(null);
  const [direction, setDirection] = useState("behind");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [simulationActive, setSimulationActive] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const vehicleMarkerRef = useRef(null);
  const routeCoordsRef = useRef([]);
  const animRef = useRef(null);
  const lastNotifRef = useRef(""); // track last notification type

  // Setup Mapbox
  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.209, 28.6139],
      zoom: 14,
      pitch: 45,
    });
    mapRef.current.on("load", () => setMapLoaded(true));
    mapRef.current.addControl(new mapboxgl.NavigationControl());
  }, []);

  // Set user location (mock)
  useEffect(() => {
    const mockLocation = { lat: 28.6139, lng: 77.209 }; // Delhi
    setUserLocation(mockLocation);

    if (mapLoaded && mapRef.current && mockLocation) {
      userMarkerRef.current = new mapboxgl.Marker({ color: "blue" })
        .setLngLat([mockLocation.lng, mockLocation.lat])
        .addTo(mapRef.current);
    }
  }, [mapLoaded]);

  // Fetch route
  const fetchRoute = async (start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes || !data.routes[0]) return null;
    return data.routes[0].geometry.coordinates;
  };

  // Controlled notification
  const notify = (type, message) => {
    if (lastNotifRef.current === type) return; // avoid repeats
    lastNotifRef.current = type;
    toast(message);
  };

  // Animate ambulance smoothly
  const startSimulation = async () => {
    if (!userLocation || !mapLoaded) return;

    // Cancel existing simulation if running
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }

    // Reset states
    setAlertDismissed(false);
    setAlertVisible(false);
    setDistance(null);
    setVehicle(null);

    // Clear old route if exists
    if (mapRef.current.getSource("route")) {
      mapRef.current.removeLayer("route");
      mapRef.current.removeSource("route");
    }

    // Clear old vehicle marker
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.remove();
      vehicleMarkerRef.current = null;
    }

    const vehicleStart = [77.205, 28.600]; // behind user
    const userEnd = [userLocation.lng, userLocation.lat];
    const routeCoords = await fetchRoute(vehicleStart, userEnd);
    if (!routeCoords) return;
    routeCoordsRef.current = routeCoords;

    // Add route line
    mapRef.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: { type: "LineString", coordinates: routeCoords },
      },
    });
    mapRef.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      paint: { "line-color": "#ff0000", "line-width": 5 },
    });

    // Place ambulance marker
    vehicleMarkerRef.current = new mapboxgl.Marker({ color: "red" })
      .setLngLat(routeCoords[0])
      .addTo(mapRef.current);

    let progress = 0;
    const step = 0.005; // smaller = slower
    function animate() {
      if (progress >= routeCoords.length - 1) {
        toast.success("Emergency vehicle has passed safely!");
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
        setSimulationActive(false); // allow restart
        return;
      }

      const i = Math.floor(progress);
      const t = progress - i;
      const [lng1, lat1] = routeCoords[i];
      const [lng2, lat2] = routeCoords[i + 1];
      const lng = lng1 + (lng2 - lng1) * t;
      const lat = lat1 + (lat2 - lat1) * t;

      vehicleMarkerRef.current.setLngLat([lng, lat]);

      const dist = getDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
      );
      setDistance(Math.round(dist));
      setVehicle({ id: "AMB-34", type: "Ambulance", lat, lng });

      if (!alertDismissed && dist <= 800) setAlertVisible(true);
      if (dist < 70) setDirection("passing");
      else setDirection("behind");

      if (soundEnabled && !alertDismissed) {
        if (dist < 50) notify("veryclose", "🚨 Emergency vehicle passing!");
        else if (dist <= 200) notify("close", "🚨 Vehicle very close!");
        else if (dist <= 500)
          notify("approaching", "Emergency vehicle approaching fast!");
      }

      progress += step;
      animRef.current = requestAnimationFrame(animate);
    }

    setSimulationActive(true);
    animRef.current = requestAnimationFrame(animate);
  };

  const dismissAlert = () => {
    setAlertVisible(false);
    setAlertDismissed(true);
    toast("Alert dismissed. Vehicle still visible on map.");
  };
  const toggleSound = () => setSoundEnabled((s) => !s);
  const getDistanceText = (m) =>
    m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
  const getDirectionText = (dir, dist) =>
    dir === "passing"
      ? "passing you now"
      : `${getDistanceText(dist)} behind you`;

  return (
    <div className="h-screen bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-50 bg-gray-900/95"
      >
        <div className="px-4 py-2 flex justify-between items-center">
          <h1 className="text-lg font-bold text-white">ResQRoute</h1>
          <div className="flex gap-2">
            <button onClick={toggleSound}>
              <Volume2
                className={`w-5 h-5 ${
                  soundEnabled ? "text-green-400" : "text-gray-500"
                }`}
              />
            </button>
            <button onClick={logout}>
              <LogOut className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Alert */}
      <AnimatePresence>
        {alertVisible && !alertDismissed && vehicle && distance !== null && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute top-16 left-4 right-4 z-40"
          >
            <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">
                  🚨 Emergency Vehicle MH3024 is Approaching From Lane x12{" "}
                </h3>
                <button onClick={dismissAlert}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p>
                {vehicle.type} ({vehicle.id}) •{" "}
                {getDirectionText(direction, distance)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapbox */}
      <div ref={mapContainerRef} className="absolute inset-0 pt-16" />

      {/* Bottom Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-4 left-4 right-4 z-30"
      >
        <div className="bg-white/95 rounded-2xl p-4 shadow-lg flex justify-between items-center">
          <p className="font-medium text-gray-900">
            GPS Active • Emergency Vehicle:{" "}
            {distance !== null
              ? getDirectionText(direction, distance)
              : "N/A"}
          </p>
          <button
            onClick={startSimulation}
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-xl shadow"
          >
            <Play className="w-4 h-4" />{" "}
            {simulationActive ? "Restart Simulation" : "Start Simulation"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
