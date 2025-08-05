import React, { useEffect, useState } from "react";
import offlineService from "@/services/offlineService";
import productsData from "@/services/mockData/products.json";
import dealsData from "@/services/mockData/deals.json";
import paymentGatewaysData from "@/services/mockData/paymentGateways.json";
import ordersData from "@/services/mockData/orders.json";
import subscriptionsData from "@/services/mockData/subscriptions.json";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
const Layout = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      offlineService.deferredPrompt = e;
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
};
  }, []);

  // Browser-specific feature detection
  const [browserFeatures, setBrowserFeatures] = useState({
    supportsPWA: false,
    supportsWebP: false,
    supportsTouch: false
  });

  useEffect(() => {
    // Feature detection for cross-browser compatibility
    const detectFeatures = async () => {
      const features = {
        supportsPWA: 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window,
        supportsWebP: await new Promise(resolve => {
          const webP = new Image();
          webP.onload = webP.onerror = () => resolve(webP.height === 2);
          webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        }),
        supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        supportsVibration: 'vibrate' in navigator,
        supportsGeolocation: 'geolocation' in navigator
      };
      
      setBrowserFeatures(features);
      
      // Add feature classes to body for CSS targeting
      Object.entries(features).forEach(([feature, supported]) => {
        document.body.classList.toggle(`supports-${feature.replace('supports', '').toLowerCase()}`, supported);
      });
    };
    
    detectFeatures();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col touch-manipulation cross-browser-layout
                     ${browserFeatures.supportsTouch ? 'touch-device' : 'no-touch-device'}
                     ${!isOnline ? 'offline-mode' : 'online-mode'}`}>
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-warning text-white px-4 py-2 text-center text-sm font-medium sticky top-0 z-40
                        transform-gpu will-change-transform">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="font-medium">Working offline - Changes will sync when connection is restored</span>
          </div>
        </div>
      )}
{/* PWA Install Prompt with cross-browser support */}
      {showInstallPrompt && browserFeatures.supportsPWA && (
        <div className="bg-primary-500 text-white px-4 py-3 text-center text-sm sticky top-0 z-40
                        transform-gpu will-change-transform">
          <div className="flex items-center justify-between max-w-md mx-auto gap-3">
            <span className="text-sm sm:text-base font-medium leading-tight">
              Install FreshMart Pro for better mobile experience
            </span>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  // Haptic feedback for supported devices
                  if (browserFeatures.supportsVibration) {
                    navigator.vibrate(50);
                  }
                  offlineService.showInstallPrompt();
                  setShowInstallPrompt(false);
                }}
                className="bg-white text-primary-500 px-3 py-1.5 rounded text-xs font-medium
                          min-h-[32px] touch:min-h-[36px] hover:bg-gray-50 active:bg-gray-100
                          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-white/80 hover:text-white text-lg leading-none w-8 h-8 flex items-center justify-center
                          rounded hover:bg-white/10 active:bg-white/20 transition-colors duration-150
                          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="Dismiss install prompt"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
<Header />
      
      {/* Main content with cross-browser optimized padding */}
      <main className="flex-1 pb-safe min-h-0 flex-grow isolation-isolate">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
      
      {/* Cross-browser optimized footer */}
      <Footer />
      
      {/* Cross-browser compatibility notifications */}
      {typeof window !== 'undefined' && window.navigator?.userAgent?.includes('MSIE') && (
        <div className="fixed bottom-4 left-4 right-4 bg-warning text-white p-3 rounded-lg shadow-lg z-50">
          <p className="text-sm font-medium">
            For the best experience, please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      )}
    </div>
};

export default Layout;