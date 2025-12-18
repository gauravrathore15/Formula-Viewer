import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { useDrawingCanvas } from '../hooks/useDrawingCanvas';
import type { ImageData } from '../types';

export interface DrawInputHandles {
  getCanvasData: () => ImageData | null;
}

const DrawInput = forwardRef<DrawInputHandles, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { color, setColor, lineWidth, setLineWidth, startDrawing, draw, stopDrawing, clearCanvas, getCanvasData } = useDrawingCanvas(canvasRef);
  
  useImperativeHandle(ref, () => ({
    getCanvasData,
  }));
  
  const colors = ['#FFFFFF', '#FF3B30', '#4A90E2', '#34C759', '#FFCC00'];

  return (
    <div className="w-full flex flex-col items-center space-y-4">
        <div className="w-full h-72 bg-brand-secondary rounded-lg overflow-hidden border-2 border-brand-accent/30">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
            />
        </div>
      <div className="flex items-center justify-between w-full p-2 bg-brand-secondary rounded-lg">
        <div className="flex items-center space-x-2">
            <label htmlFor="brush-size" className="text-sm font-medium text-brand-muted">Size:</label>
            <input
                id="brush-size"
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-24 h-2 bg-brand-primary rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
        </div>
        <div className="flex items-center space-x-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-transform transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-brand-secondary ring-white' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button onClick={clearCanvas} className="px-3 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-md hover:bg-red-600 transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
        </button>
      </div>
    </div>
  );
});

export default DrawInput;
