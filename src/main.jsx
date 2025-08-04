import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";

// Only register service worker in production builds
async function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              console.log('New content available! Please refresh.');
            }
          });
        }
      });
      
    } catch (error) {
      console.warn('Service Worker registration failed:', error.message);
      // Continue without service worker - app should still function
      if (error.message.includes('MIME type')) {
        console.info('Service Worker file not found or incorrect MIME type. App will continue without offline support.');
      } else if (error.message.includes('SecurityError')) {
        console.info('Service Worker registration blocked by security policy. Running without PWA features.');
      }
    }
  } else {
    console.info('Service Worker not supported in this browser.');
  }
}

// Register service worker after DOM is loaded
window.addEventListener('load', registerServiceWorker);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);