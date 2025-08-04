import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { offlineService } from '@/services/offlineService';

const CameraCapture = ({ onCapture, onClose, title = "Capture Payment Proof" }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // Back camera by default
  const [capturedImages, setCapturedImages] = useState([]);
  const [flashEnabled, setFlashEnabled] = useState(false);

  useEffect(() => {
    initializeCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const initializeCamera = async () => {
    try {
      const mediaStream = await offlineService.captureFromCamera({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        }
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleFlash = async () => {
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled }]
          });
          setFlashEnabled(!flashEnabled);
        } catch (error) {
          toast.error('Flash not available on this device');
        }
      } else {
        toast.error('Flash not supported on this device');
      }
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Add timestamp overlay
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(20, 20, 300, 60);
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText(`Captured: ${new Date().toLocaleString()}`, 30, 50);

    try {
      // Convert to blob with compression
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      const processedImage = await offlineService.processImageForMobile(blob, 1200, 0.8);
      
      const capturedImage = {
        id: Date.now(),
        blob: processedImage,
        timestamp: new Date().toISOString(),
        size: processedImage.size,
        preview: URL.createObjectURL(processedImage)
      };

      setCapturedImages(prev => [...prev, capturedImage]);
      toast.success('Photo captured successfully');
      
    } catch (error) {
      console.error('Photo capture failed:', error);
      toast.error('Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  };

  const deleteImage = (imageId) => {
    setCapturedImages(prev => {
      const updated = prev.filter(img => img.id !== imageId);
      // Clean up object URLs
      const deleted = prev.find(img => img.id === imageId);
      if (deleted) {
        URL.revokeObjectURL(deleted.preview);
      }
      return updated;
    });
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleSave = () => {
    if (capturedImages.length === 0) {
      toast.error('Please capture at least one photo');
      return;
    }

    onCapture(capturedImages);
    
    // Clean up object URLs
    capturedImages.forEach(img => {
      URL.revokeObjectURL(img.preview);
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-green-500 px-2 py-1 rounded">
            {capturedImages.length} captured
          </span>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Viewfinder overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="camera-viewfinder"></div>
        </div>

        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <Button
            onClick={switchCamera}
            variant="ghost"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <ApperIcon name="RotateCcw" className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleFlash}
              variant="ghost"
              size="sm"
              className={`bg-black/50 text-white hover:bg-black/70 ${
                flashEnabled ? 'bg-yellow-500/50' : ''
              }`}
            >
              <ApperIcon name={flashEnabled ? "Zap" : "ZapOff"} className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-center gap-4">
            {/* Captured images preview */}
            <div className="flex-1 flex gap-2 overflow-x-auto max-w-[200px]">
              {capturedImages.map((image) => (
                <div key={image.id} className="relative flex-shrink-0">
                  <img
                    src={image.preview}
                    alt="Captured"
                    className="w-12 h-12 object-cover rounded border-2 border-white"
                  />
                  <button
                    onClick={() => deleteImage(image.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Capture button */}
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all ${
                isCapturing 
                  ? 'bg-red-500 scale-95' 
                  : 'bg-white/20 hover:bg-white/30 active:scale-95'
              }`}
              style={{ minWidth: '64px', minHeight: '64px' }}
            >
              {isCapturing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ApperIcon name="Camera" className="w-8 h-8 text-white" />
              )}
            </button>

            {/* Save button */}
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={capturedImages.length === 0}
                variant="primary"
                size="sm"
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
              >
                <ApperIcon name="Check" className="w-4 h-4 mr-2" />
                Save ({capturedImages.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Focus indicator */}
        <div 
          id="focus-indicator"
          className="absolute w-20 h-20 border-2 border-white rounded-full opacity-0 pointer-events-none transition-opacity"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;