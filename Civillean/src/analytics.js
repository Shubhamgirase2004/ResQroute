// Google Analytics 4 Configuration
// This is a minimal setup for the demo

export const GA_TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 measurement ID

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined') {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
      page_title: 'Emergency Route Clearance System',
      page_location: window.location.href,
    });
  }
};

// Track events
export const trackEvent = (action, category, label = null, value = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track emergency dispatches
export const trackEmergencyDispatch = (priority, vehicleType, location) => {
  trackEvent('emergency_dispatch_created', 'Emergency', `${priority}-${vehicleType}-${location}`);
};

// Track route calculations
export const trackRouteCalculation = (distance, duration, trafficLevel) => {
  trackEvent('route_calculated', 'Navigation', `${distance}-${duration}-${trafficLevel}`);
};

// Track user interactions
export const trackUserInteraction = (action, element) => {
  trackEvent('user_interaction', 'UI', `${action}-${element}`);
};