import "@/index.css";
import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import AdminPaymentGateways from "@/components/pages/AdminPaymentGateways";
import Account from "@/components/pages/Account";
import Checkout from "@/components/pages/Checkout";
import Home from "@/components/pages/Home";
import Categories from "@/components/pages/Categories";
import ProductDetail from "@/components/pages/ProductDetail";
import OrderDashboard from "@/components/pages/OrderDashboard";
import MonitoringDashboard from "@/components/pages/MonitoringDashboard";
import Cart from "@/components/pages/Cart";
import AdminDashboard from "@/components/pages/AdminDashboard";

// Browser detection and compatibility utilities
const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const browsers = {
    chrome: /Chrome/i.test(ua) && !/Edg/i.test(ua),
    firefox: /Firefox/i.test(ua),
    safari: /Safari/i.test(ua) && !/Chrome/i.test(ua),
    edge: /Edg/i.test(ua),
    ie: /MSIE|Trident/i.test(ua)
  };
  
  const mobile = /Mobi|Android/i.test(ua);
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return { browsers, mobile, touch, ua };
};

// Feature detection for modern web APIs
const checkBrowserFeatures = () => {
  return {
    webp: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: document.createElement('canvas').toDataURL('image/avif').indexOf('data:image/avif') === 0,
    webGL: !!window.WebGLRenderingContext,
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'PushManager' in window,
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    vibration: 'vibrate' in navigator,
    intersection: 'IntersectionObserver' in window,
    resize: 'ResizeObserver' in window,
    css: {
      grid: CSS.supports('display', 'grid'),
      flexbox: CSS.supports('display', 'flex'),
      customProperties: CSS.supports('color', 'var(--test)')
    }
  };
};

function App() {
  const [browserInfo, setBrowserInfo] = useState(null);
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    // Initialize browser detection
    const info = getBrowserInfo();
    const supportedFeatures = checkBrowserFeatures();
    
    setBrowserInfo(info);
    setFeatures(supportedFeatures);
    
    // Add browser classes to document
    const browserClass = Object.keys(info.browsers).find(key => info.browsers[key]);
    if (browserClass) {
      document.documentElement.classList.add(`browser-${browserClass}`);
    }
    
    if (info.mobile) {
      document.documentElement.classList.add('is-mobile');
    }
    
    if (info.touch) {
      document.documentElement.classList.add('has-touch');
    }
    
    // Legacy browser warning
    if (info.browsers.ie) {
      toast.warning("Your browser may not support all features. Please consider upgrading.", {
        autoClose: 8000,
        position: "top-center"
      });
    }
    
    // Performance monitoring for different browsers
    if ('performance' in window && 'measure' in performance) {
      performance.mark('app-start');
      
      setTimeout(() => {
        performance.mark('app-loaded');
        performance.measure('app-load-time', 'app-start', 'app-loaded');
        
        const loadTime = performance.getEntriesByName('app-load-time')[0];
        if (loadTime && loadTime.duration > 3000) {
          console.warn(`Slow loading detected: ${loadTime.duration}ms on ${browserClass}`);
        }
      }, 100);
    }
    
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background cross-browser-optimized">
        <Routes>
          {/* Admin Routes (without main layout) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/payment-gateways" element={<AdminPaymentGateways />} />
          <Route path="/admin/orders" element={<OrderDashboard />} />
          <Route path="/admin/monitoring" element={<MonitoringDashboard />} />
          
          {/* Main App Routes (with layout) */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/categories/:category" element={<Categories />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/account" element={<Account />} />
              </Routes>
            </Layout>
          } />
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="toast-container"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;