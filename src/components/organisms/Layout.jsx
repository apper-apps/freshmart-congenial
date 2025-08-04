import React, { useEffect, useState } from "react";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import offlineService from "@/services/offlineService";

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

  return (
    <div className="min-h-screen flex flex-col touch-manipulation">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-warning text-white px-4 py-2 text-center text-sm font-medium sticky top-0 z-40">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Working offline - Changes will sync when connection is restored
          </div>
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="bg-primary-500 text-white px-4 py-3 text-center text-sm sticky top-0 z-40">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <span>Install FreshMart Pro for better mobile experience</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  offlineService.showInstallPrompt();
                  setShowInstallPrompt(false);
                }}
                className="bg-white text-primary-500 px-3 py-1 rounded text-xs font-medium"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-white/80 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />
      
      {/* Main content with mobile-optimized padding */}
      <main className="flex-1 pb-safe">
        {children}
      </main>
      
      {/* Mobile-optimized footer */}
      <Footer />
    </div>
  );
};

export default Layout;