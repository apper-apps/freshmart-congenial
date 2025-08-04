import { toast } from 'react-hot-toast';
// Offline service for mobile PWA functionality
const CACHE_NAME = 'freshmart-pro-v1';
const OFFLINE_QUEUE_KEY = 'offline-queue';
const SYNC_QUEUE_KEY = 'sync-queue';

class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.initializeCache();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      this.showConnectivityToast('Connected', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showConnectivityToast('Working offline', 'info');
    });
  }

  showConnectivityToast(message, type) {
    if (typeof toast !== 'undefined') {
      toast[type](message, {
        position: 'bottom-center',
        autoClose: 3000,
        hideProgressBar: true
      });
    }
  }

  async initializeCache() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Cache essential data for offline access
  async cacheData(key, data) {
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
}

const offlineService = new OfflineService();

export { offlineService };