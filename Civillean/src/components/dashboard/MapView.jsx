import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Map as MapIcon, Navigation, Zap, AlertTriangle, RefreshCw } from "lucide-react";
import { useEmergency } from "../../contexts/EmergencyContext";
import { SAMPLE_LOCATIONS } from "../../config/mapbox";
import toast from "react-hot-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [trafficLevel, setTrafficLevel] = useState("low");
  const { activeEmergencies, simulateTrafficUpdate, demoMode, dispatch } = useEmergency();

  const routeLayerId = "emergency-route";

  // Initialize map
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.209, 28.6139], // Default Delhi
      zoom: 11,
    });

    mapRef.current.on("load", () => {
      setMapLoaded(true);
    });
  }, []);

  // Demo traffic updates
  useEffect(() => {
    if (demoMode) {
      const interval = setInterval(() => {
        const levels = ["low", "medium", "high"];
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        setTrafficLevel(randomLevel);

        if (randomLevel === "high" && activeEmergencies.length > 0) {
          toast.error("High traffic detected! Consider rerouting.");
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [demoMode, activeEmergencies.length]);

  // Add a route line to the map
  const drawRoute = (start, end) => {
    if (!mapRef.current) return;

    // Remove old route if exists
    if (mapRef.current.getLayer(routeLayerId)) {
      mapRef.current.removeLayer(routeLayerId);
      mapRef.current.removeSource(routeLayerId);
    }

    const routeGeoJSON = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
      },
    };

    mapRef.current.addSource(routeLayerId, {
      type: "geojson",
      data: routeGeoJSON,
    });

    mapRef.current.addLayer({
      id: routeLayerId,
      type: "line",
      source: routeLayerId,
      paint: {
        "line-color": "#007AFF",
        "line-width": 5,
      },
    });

    // Add start marker
    new mapboxgl.Marker({ color: "green" })
      .setLngLat([start.lng, start.lat])
      .addTo(mapRef.current);

    // Add end marker
    new mapboxgl.Marker({ color: "red" })
      .setLngLat([end.lng, end.lat])
      .addTo(mapRef.current);

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([start.lng, start.lat]);
    bounds.extend([end.lng, end.lat]);
    mapRef.current.fitBounds(bounds, { padding: 60 });
  };

  const generateRoute = () => {
    if (activeEmergencies.length === 0) {
      toast.error("No active emergencies to route");
      return;
    }

    const emergency = activeEmergencies[0];
    const start = SAMPLE_LOCATIONS[emergency.startLocation];
    const end = SAMPLE_LOCATIONS[emergency.endLocation];

    if (start && end) {
      setCurrentRoute({
        start,
        end,
        distance: "12.4 km",
        duration: "18 mins",
        trafficLevel: trafficLevel,
      });
      toast.success("Route calculated successfully!");
      drawRoute(start, end);
    }
  };

  const recalculateRoute = () => {
    simulateTrafficUpdate();
    const newDuration =
      trafficLevel === "high"
        ? "25 mins"
        : trafficLevel === "medium"
        ? "22 mins"
        : "18 mins";

    setCurrentRoute((prev) =>
      prev ? { ...prev, duration: newDuration, trafficLevel } : null
    );
    toast("Route recalculated based on current traffic conditions");
  };

  const toggleDemoMode = () => {
    dispatch({ type: "TOGGLE_DEMO_MODE" });
    toast(demoMode ? "Demo mode disabled" : "Demo mode enabled");
  };

  const getTrafficColor = (level) => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-blue-600" />
            Live Route Tracking
          </h2>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm ${getTrafficColor(trafficLevel)}`}>
              <Zap className="w-4 h-4" />
              Traffic: {trafficLevel.toUpperCase()}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDemoMode}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                demoMode
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {demoMode ? "Demo: ON" : "Demo: OFF"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="relative h-96">
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Loading Mapbox integration...</p>
            </div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="absolute inset-0" />
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateRoute}
              disabled={activeEmergencies.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className="w-4 h-4" />
              Generate Route
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={recalculateRoute}
              disabled={!currentRoute}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" />
              Recalculate
            </motion.button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4" />
            Real-time traffic monitoring active
          </div>
        </div>
      </div>
    </div>
  );
}
