import React, { useState, useRef, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ImageAnnotation = ({ imageUrl, onSave, onClose }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#ff0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [annotations, setAnnotations] = useState([]);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    initializeCanvas();
  }, [imageUrl]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      
      // Save initial state
      saveState();
    };
    
    img.src = imageUrl;
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    const state = canvas.toDataURL();
    setAnnotations(prev => [...prev, state]);
    setCanUndo(true);
  };

  const startDrawing = (e) => {
    if (currentTool === 'pen' || currentTool === 'highlighter') {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      
      // Handle both mouse and touch events
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      // Configure drawing style
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentTool === 'highlighter') {
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = lineWidth * 3;
      } else {
        ctx.globalAlpha = 1;
      }
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current.getContext('2d');
      ctx.globalAlpha = 1;
      saveState();
    }
  };

  const addTextAnnotation = (e) => {
    if (currentTool !== 'text') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const text = prompt('Enter text annotation:');
    if (text) {
      ctx.fillStyle = currentColor;
      ctx.font = `${lineWidth * 8}px Arial`;
      ctx.fillText(text, x, y);
      saveState();
    }
  };

  const addArrow = (e) => {
    if (currentTool !== 'arrow') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Draw arrow (simple implementation)
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 20);
    ctx.lineTo(x, y);
    ctx.lineTo(x - 10, y - 10);
    ctx.moveTo(x, y);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
    
    saveState();
  };

  const undo = () => {
    if (annotations.length > 1) {
      const newAnnotations = annotations.slice(0, -1);
      setAnnotations(newAnnotations);
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      img.src = newAnnotations[newAnnotations.length - 1];
      setCanUndo(newAnnotations.length > 1);
    }
  };

  const clearAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      setAnnotations([canvas.toDataURL()]);
      setCanUndo(false);
    };
    
    img.src = imageUrl;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/jpeg', 0.9);
  };

  const handleCanvasEvent = (e) => {
    switch (currentTool) {
      case 'pen':
      case 'highlighter':
        if (e.type === 'mousedown' || e.type === 'touchstart') {
          startDrawing(e);
        } else if (e.type === 'mousemove' || e.type === 'touchmove') {
          draw(e);
        } else if (e.type === 'mouseup' || e.type === 'touchend') {
          stopDrawing();
        }
        break;
      case 'text':
        if (e.type === 'click') {
          addTextAnnotation(e);
        }
        break;
      case 'arrow':
        if (e.type === 'click') {
          addArrow(e);
        }
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold">Annotate Image</h2>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20"
        >
          <ApperIcon name="X" className="w-5 h-5" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-4 bg-gray-800 text-white overflow-x-auto">
        {/* Tools */}
        <div className="flex gap-2">
          {[
            { id: 'pen', icon: 'Edit3', label: 'Pen' },
            { id: 'highlighter', icon: 'Highlighter', label: 'Highlight' },
            { id: 'text', icon: 'Type', label: 'Text' },
            { id: 'arrow', icon: 'ArrowUpRight', label: 'Arrow' }
          ].map((tool) => (
            <Button
              key={tool.id}
              onClick={() => setCurrentTool(tool.id)}
              variant={currentTool === tool.id ? 'primary' : 'ghost'}
              size="sm"
              className="flex-shrink-0"
            >
              <ApperIcon name={tool.icon} className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{tool.label}</span>
            </Button>
          ))}
        </div>

        {/* Colors */}
        <div className="flex gap-1 ml-4">
          {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#000000'].map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              className={`w-8 h-8 rounded border-2 ${
                currentColor === color ? 'border-white' : 'border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Line width */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm">Width:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-sm w-6">{lineWidth}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={undo}
            disabled={!canUndo}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ApperIcon name="Undo" className="w-4 h-4" />
          </Button>
          <Button
            onClick={clearAnnotations}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <ApperIcon name="Trash2" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="max-w-full max-h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full border border-gray-300 touch-none"
            onMouseDown={handleCanvasEvent}
            onMouseMove={handleCanvasEvent}
            onMouseUp={handleCanvasEvent}
            onTouchStart={handleCanvasEvent}
            onTouchMove={handleCanvasEvent}
            onTouchEnd={handleCanvasEvent}
            onClick={handleCanvasEvent}
            style={{ cursor: currentTool === 'pen' || currentTool === 'highlighter' ? 'crosshair' : 'default' }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900 flex justify-between">
        <Button
          onClick={onClose}
          variant="outline"
          className="text-white border-white hover:bg-white/20"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="primary"
        >
          <ApperIcon name="Save" className="w-4 h-4 mr-2" />
          Save Annotated Image
        </Button>
      </div>
    </div>
  );
};

export default ImageAnnotation;