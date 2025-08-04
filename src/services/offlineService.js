import { toast } from "react-toastify";

// Constants
const OFFLINE_QUEUE_KEY = 'freshmart-offline-queue';

// Offline Service - Handles PWA functionality and service worker management
class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.serviceWorkerRegistration = null;
    this.pendingRequests = [];
    this.syncQueue = [];
    this.deferredPrompt = null;
    
    this.init();
  }

  async init() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listen for PWA install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;
    });
    
    // Initialize service worker
    await this.registerServiceWorker();
    
    // Setup background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      this.setupBackgroundSync();
    }
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      console.log('Registering Service Worker...');
      
      // Register with explicit scope and proper error handling
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        type: 'classic' // Explicitly set type to avoid MIME issues
      });

      this.serviceWorkerRegistration = registration;
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      
      // Check for specific MIME type error
      if (error.message.includes('MIME type') || error.message.includes('text/html')) {
        console.error('Service Worker file not found or served with wrong MIME type');
        toast.error('App offline features unavailable. Please check your connection.');
      } else if (error.name === 'SecurityError') {
        console.error('Service Worker blocked by security policy');
        toast.warning('Offline features disabled due to security settings');
      } else {
        toast.error('Failed to enable offline features');
      }
      
      return false;
    }
  }

  handleServiceWorkerMessage(event) {
    const { data } = event;
    
    if (data && data.type) {
      switch (data.type) {
        case 'CACHE_UPDATED':
          console.log('Cache updated:', data.url);
          break;
        case 'OFFLINE_FALLBACK':
          toast.info('Loading from offline cache');
          break;
        case 'SYNC_COMPLETE':
          toast.success('Data synced successfully');
          break;
      }
    }
  }

  showUpdateNotification() {
    toast.info(
      'New version available! Refresh to update.',
      {
        autoClose: false,
        onClick: () => {
          if (this.serviceWorkerRegistration?.waiting) {
            this.serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      }
    );
  }

  handleOnline() {
    this.isOnline = true;
    console.log('App is online');
    toast.success('Connection restored!', { autoClose: 3000 });
    
    // Process pending requests
    this.processPendingRequests();
    
    // Sync offline data
    this.syncOfflineData();
    
    // Trigger background sync
    this.requestBackgroundSync('order-sync');
    
    // Update UI
    document.body.classList.remove('offline-mode');
    this.removeOfflineBadge();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('App is offline');
    toast.warning('You are offline. Some features may be limited.', { autoClose: 5000 });
    
    // Update UI
    document.body.classList.add('offline-mode');
    this.showOfflineBadge();
  }

  showOfflineBadge() {
    const existingBadge = document.querySelector('.offline-badge');
    if (existingBadge) return;
    
    const badge = document.createElement('div');
    badge.className = 'offline-badge';
    badge.textContent = 'Offline Mode';
    badge.style.cssText = `
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      background: #f59e0b;
      color: white;
      padding: 8px 16px;
      border-radius: 0 0 8px 8px;
      font-size: 14px;
      z-index: 9999;
    `;
    document.body.appendChild(badge);
  }

  removeOfflineBadge() {
    const badge = document.querySelector('.offline-badge');
    if (badge) {
      badge.remove();
    }
  }

  showConnectivityToast(message, type = 'info') {
    toast[type](message, { autoClose: 3000 });
  }

  // Queue requests when offline
  async queueRequest(request, options = {}) {
    if (this.isOnline) {
      try {
        return await fetch(request, options);
      } catch (error) {
        if (!navigator.onLine) {
          this.handleOffline();
        }
        throw error;
      }
    }
    
    // Store for later processing
    this.pendingRequests.push({ request, options, timestamp: Date.now() });
    
    // Store in localStorage for persistence
    await this.storePendingRequest({ request, options });
    
    toast.info('Request queued for when connection is restored');
    
    return new Response(
      JSON.stringify({ 
        queued: true, 
        message: 'Request will be processed when online' 
      }),
      { 
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  async processPendingRequests() {
    if (this.pendingRequests.length === 0) return;
    
    console.log(`Processing ${this.pendingRequests.length} pending requests`);
    
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];
    
    for (const { request, options } of requests) {
      try {
        await fetch(request, options);
        console.log('Processed pending request:', request.url || request);
      } catch (error) {
        console.error('Failed to process pending request:', error);
        // Re-queue if still failing
        this.pendingRequests.push({ request, options, timestamp: Date.now() });
      }
    }
  }

  async storePendingRequest(requestData) {
    try {
      // Simple localStorage fallback for demo
      const stored = localStorage.getItem('freshmart-pending-requests') || '[]';
      const requests = JSON.parse(stored);
      requests.push(requestData);
      localStorage.setItem('freshmart-pending-requests', JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to store pending request:', error);
    }
  }

  setupBackgroundSync() {
    if (!this.serviceWorkerRegistration) return;
    
    console.log('Background sync available');
  }

  async requestBackgroundSync(tag) {
    if (!this.serviceWorkerRegistration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return false;
    }
    
    try {
      await this.serviceWorkerRegistration.sync.register(tag);
      console.log('Background sync registered:', tag);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  // Cache data locally
  cacheData(key, data) {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl: 24 * 60 * 60 * 1000 // 24 hours
      }));
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }

  // Retrieve cached data
  getCachedData(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
      return null;
    }
  }

  // Queue operations for when back online
  async queueOperation(operation) {
    try {
      const queue = this.getOfflineQueue();
      queue.push({
        ...operation,
        timestamp: Date.now(),
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to queue operation:', error);
    }
  }

  getOfflineQueue() {
    try {
      const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  }

  // Sync queued operations when back online
  async syncOfflineData() {
    if (!this.isOnline) return;

    const queue = this.getOfflineQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} offline operations...`);

    const syncPromises = queue.map(async (operation) => {
      try {
        await this.executeOperation(operation);
        return { success: true, id: operation.id };
      } catch (error) {
        console.error('Failed to sync operation:', operation, error);
        return { success: false, id: operation.id, error: error.message };
      }
    });

    const results = await Promise.allSettled(syncPromises);
    const successful = results.filter(r => r.value?.success).length;
    
    // Remove successful operations from queue
    const remainingQueue = queue.filter(op => 
      !results.some(r => r.value?.success && r.value.id === op.id)
    );
    
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
    
    if (successful > 0) {
      this.showConnectivityToast(`Synced ${successful} operations`, 'success');
    }
  }

  async executeOperation(operation) {
    const { type, endpoint, data } = operation;
    
    switch (type) {
      case 'POST':
        return await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'PUT':
        return await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      case 'DELETE':
        return await fetch(endpoint, { method: 'DELETE' });
      default:
        throw new Error(`Unsupported operation type: ${type}`);
    }
  }

  // Image processing for mobile optimization
  async processImageForMobile(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Camera capture with mobile optimization
  async captureFromCamera(constraints = {}) {
    try {
      const defaultConstraints = {
        video: {
          facingMode: 'environment', // Back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        ...defaultConstraints,
        ...constraints
      });

      return stream;
    } catch (error) {
      console.error('Camera access failed:', error);
      throw new Error('Camera access denied or not available');
    }
  }

  // Check if running on mobile device
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  // Enable haptic feedback on supported devices
  vibrate(pattern = [100]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  // Install PWA prompt
  async showInstallPrompt() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`PWA install prompt outcome: ${outcome}`);
      this.deferredPrompt = null;
    }
  }

  // Cache management
  async clearCache(cacheName) {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.active?.postMessage({
        type: 'CLEAR_CACHE',
        cacheName
      });
    }
  }

  async cacheUrls(urls) {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.active?.postMessage({
        type: 'CACHE_URLS',
        urls
      });
    }
  }

  // Utility methods
  isOffline() {
    return !this.isOnline;
  }

  getConnectionStatus() {
    return {
      online: this.isOnline,
      serviceWorkerActive: !!this.serviceWorkerRegistration?.active,
      pendingRequests: this.pendingRequests.length
    };
  }
}

// Create singleton instance
const offlineService = new OfflineService();

export default offlineService;

// Export utility functions
export const {
  queueRequest,
  isOffline,
  getConnectionStatus,
  clearCache,
  cacheUrls
} = offlineService;

const offlineService = new OfflineService();

export { offlineService };