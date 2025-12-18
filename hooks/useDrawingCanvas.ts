
import { useState, useRef, useEffect, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
}

export const useDrawingCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(5);
  const lastPosition = useRef<Point | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        contextRef.current = ctx;
        
        // Set canvas dimensions based on container size
        const resizeCanvas = () => {
          const container = canvas.parentElement;
          if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            // Redraw background
            ctx.fillStyle = '#1E1E3F';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, [canvasRef]);

  const getCoordinates = useCallback((event: MouseEvent | TouchEvent): Point | null => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    if (event.touches.length > 0) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return null;
  }, [canvasRef]);

  const startDrawing = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(event.nativeEvent);
    if (coords) {
      setIsDrawing(true);
      lastPosition.current = coords;
    }
  }, [getCoordinates]);

  const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !lastPosition.current) return;

    const coords = getCoordinates(event.nativeEvent);
    if (coords) {
      const ctx = contextRef.current;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(lastPosition.current.x, lastPosition.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      lastPosition.current = coords;
    }
  }, [isDrawing, color, lineWidth, getCoordinates]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPosition.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    if (canvasRef.current && contextRef.current) {
      const canvas = canvasRef.current;
      const ctx = contextRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#1E1E3F'; // Background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasRef]);
  
  const getCanvasData = useCallback((): { base64: string; mimeType: string } | null => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      return {
        base64: dataUrl.split(',')[1],
        mimeType: 'image/png'
      };
    }
    return null;
  }, [canvasRef]);

  return { color, setColor, lineWidth, setLineWidth, startDrawing, draw, stopDrawing, clearCanvas, getCanvasData };
};
