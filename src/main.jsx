import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Service Worker Registration with Error Handling
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update notification
              console.log('New content available, please refresh.');
            }
          });
        }
      });
      
    } catch (error) {
      console.warn('Service Worker registration failed:', error.message);
      // Continue without service worker - app should still function
      if (error.message.includes('MIME type')) {
        console.info('Service Worker file not found or incorrect MIME type. App will continue without offline support.');
      }
    }
  } else {
    console.info('Service Worker not supported in this browser.');
  }
};

// Register service worker after DOM is loaded
window.addEventListener('load', registerServiceWorker);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);