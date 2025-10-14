import React, { useState, useEffect, useCallback } from "react";
import Map, { Marker, NavigationControl, GeolocateControl, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic2h1YmgtZ2lyYXNlMjciLCJhIjoiY21iYXd2YzdwMTEyMzJxc2NrYWQ1d3FkcSJ9.Z1yFrzGl6zUwixA3Zr-P4A";

export default function MapView() {
  const [viewState, setViewState] = useState({
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 12,
    pitch: 0,
    bearing: 0
  });
  const [originalViewState, setOriginalViewState] = useState(null);
  const [userLocation, setUserLocation] = useState({ longitude: 77.5946, latitude: 12.9716 });
  const [vehicles, setVehicles] = useState([]);
  const [navigationActive, setNavigationActive] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [geofenceRadius] = useState(0.003);

  // Example destination
  const destination = { longitude: 77.6046, latitude: 12.9816 };

  useEffect(() => {
    const nearbyVehicles = [
      {
        id: 'V001',
        type: 'civilian',
        latitude: 12.9716 + 0.001,
        longitude: 77.5946 + 0.001,
        color: '#2563eb',
        icon: "🚗",
        notified: false,
        distance: "100m"
      },
      {
        id: 'V002',
        type: 'emergency',
        latitude: 12.9716 - 0.0008,
        longitude: 77.5946 + 0.0005,
        color: '#dc2626',
        icon: "🚑",
        notified: false,
        distance: "80m"
      },
      {
        id: 'V003',
        type: 'civilian',
        latitude: 12.9716 + 0.0015,
        longitude: 77.5946 + 0.0012,
        color: '#16a34a',
        icon: "🚗",
        notified: false,
        distance: "150m"
      },
      {
        id: 'V004',
        type: 'civilian',
        latitude: 12.9716 - 0.005,
        longitude: 77.5946 - 0.004,
        color: '#ca8a04',
        icon: "🚙",
        notified: false,
        distance: "500m"
      }
    ];
    setVehicles(nearbyVehicles);
  }, []);

  // ENHANCED: Proper route fetching with better geometry handling
  const fetchRoute = useCallback(async () => {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&overview=full&steps=true&access_token=${MAPBOX_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setRouteData(data.routes[0].geometry);
      }
    } catch (error) {
      console.error('Route fetch error:', error);
    }
  }, [userLocation, destination]);

  // ENHANCED: 90-degree navigation with proper bearing calculation
  const startNavigation = async () => {
    setOriginalViewState(viewState);
    await fetchRoute();
    
    // Calculate bearing from user to destination for proper alignment
    const bearing = calculateBearing(
      userLocation.latitude, userLocation.longitude,
      destination.latitude, destination.longitude
    );
    
    setViewState({
      longitude: userLocation.longitude,
      latitude: userLocation.latitude,
      zoom: 19, // Higher zoom for street-level detail
      pitch: 85, // FIXED: Near 90-degree pitch (85° is optimal for Mapbox)
      bearing: bearing // FIXED: Align with route direction
    });
    setNavigationActive(true);
  };

  const exitNavigation = () => {
    setViewState({ ...originalViewState, pitch: 0, bearing: 0 });
    setRouteData(null);
    setNavigationActive(false);
  };

  // ADDED: Calculate bearing between two points for proper route alignment
  const calculateBearing = (lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let bearing = Math.atan2(y, x) * (180 / Math.PI);
    return (bearing + 360) % 360;
  };

  // Safe move handler
  const handleMove = useCallback(
    (evt) => {
      if (!navigationActive) setViewState(evt.viewState);
    },
    [navigationActive]
  );

  // Geofence data
  const geofenceData = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [userLocation.longitude, userLocation.latitude]
        },
        properties: {
          radius: geofenceRadius * 111000
        }
      }
    ]
  };

  const geofenceCircleLayer = {
    id: 'geofence-circle',
    type: 'circle',
    paint: {
      'circle-radius': { stops: [[0, 0], [20, 300]], base: 2 },
      'circle-color': '#ff0000',
      'circle-opacity': !navigationActive ? 0.1 : 0.04,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ff0000',
      'circle-stroke-opacity': 0.4
    }
  };

  // ENHANCED: Better route line styling for navigation
  const routeLayer = {
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': navigationActive ? '#1E40AF' : '#1978c8',
      'line-width': navigationActive ? 10 : 4, // Much thicker for navigation
      'line-opacity': 0.95,
      'line-blur': 0.5 // Slight blur for better visibility
    }
  };

  return (
    <div style={{ width: "100%", height: "500px", position: "relative" }}>
      <Map
        key={navigationActive ? "navigation" : "normal"}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={viewState}
        viewState={viewState}
        mapStyle={navigationActive ? "mapbox://styles/mapbox/navigation-day-v1" : "mapbox://styles/mapbox/streets-v11"}
        style={{ width: "100%", height: "100%" }}
        onMove={handleMove}
        interactive={!navigationActive}
        // ADDED: Smooth transitions
        transitionDuration={1000}
        transitionInterpolator={null}
      >
        <Source id="geofence" type="geojson" data={geofenceData}>
          <Layer {...geofenceCircleLayer} />
        </Source>
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-right" />

        <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
          <div
            style={{
              width: navigationActive ? '32px' : '28px',
              height: navigationActive ? '32px' : '28px',
              borderRadius: '50%',
              backgroundColor: '#FF0000',
              border: '4px solid #fff',
              boxShadow: '0 0 0 3px #FF0000, 0 0 20px rgba(255,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Emergency Alert Center"
          >
            📍
          </div>
        </Marker>

        {vehicles.map(vehicle => (
          <Marker key={vehicle.id} longitude={vehicle.longitude} latitude={vehicle.latitude} anchor="center">
            <div
              style={{
                width: navigationActive ? '32px' : '36px',
                height: navigationActive ? '32px' : '36px',
                borderRadius: '50%',
                backgroundColor: vehicle.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '16px',
                border: vehicle.notified ? '3px solid #00FF00' : '2px solid #fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              title={`${vehicle.type} - ${vehicle.id} (${vehicle.distance})`}
            >
              {vehicle.icon}
              {vehicle.notified && (
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
                    boxShadow: '0 0 4px rgba(0,255,0,0.8)'
                  }}
                />
              )}
            </div>
          </Marker>
        ))}

        {/* ENHANCED: Better route rendering */}
        {navigationActive && routeData && (
          <Source 
            id="route" 
            type="geojson" 
            data={{ type: "Feature", geometry: routeData }}
            lineMetrics={true} // ADDED: Enable line metrics for better rendering
          >
            <Layer {...routeLayer} />
          </Source>
        )}

        {navigationActive && (
          <Marker longitude={destination.longitude} latitude={destination.latitude} anchor="center">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1978c8',
                border: '3px solid #fff',
                color: 'white',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              title="Destination"
            >
              🎯
            </div>
          </Marker>
        )}
      </Map>

      <div style={{
        position: 'absolute', left: '50%', bottom: 15, transform: 'translateX(-50%)',
        display: 'flex', gap: 16, zIndex: 2000
      }}>
        {!navigationActive ? (
          <button
            style={{
              background: "#2563eb", color: "white", border: "none", borderRadius: 8,
              fontWeight: "bold", padding: "12px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
              fontSize: 16, cursor: "pointer"
            }}
            onClick={startNavigation}
          >
            Start Navigation
          </button>
        ) : (
          <button
            style={{
              background: "#dc2626", color: "white", border: "none", borderRadius: 8,
              fontWeight: "bold", padding: "12px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
              fontSize: 16, cursor: "pointer"
            }}
            onClick={exitNavigation}
          >
            Exit Navigation
          </button>
        )}
      </div>

      <div style={{
        position: 'absolute', top: '10px', right: '10px', backgroundColor: 'white',
        padding: '15px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '200px', zIndex: 1000
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
          {navigationActive ? 'Navigation Active' : 'Geofencing Status'}
        </h4>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {navigationActive ? (
            <>
              <div style={{ marginBottom: '5px', color: '#1E40AF', fontWeight: 'bold' }}>
                🧭 90° Navigation Mode
              </div>
              <div style={{ marginBottom: '5px' }}>
                Pitch: 85° (Near Vertical)
              </div>
              <div style={{ color: '#16a34a', fontWeight: 'bold' }}>
                Route Aligned
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '5px' }}>Radius: 300m</div>
              <div style={{ marginBottom: '5px' }}>Total Vehicles: {vehicles.length}</div>
              <div style={{ color: '#00aa00', fontWeight: 'bold' }}>
                Notified: {vehicles.filter(v => v.notified).length}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
