import { useState, useRef, useEffect } from 'react';
import type { ReactNode, CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import './AppWindow.css';

interface WindowProps {
  id: string;
  title: string;
  children: ReactNode;
  isMinimized: boolean;
  isOpen: boolean;
  isActive: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  initialSize?: { width: number; height: number };
  initialPosition?: { x: number; y: number };
  zIndex: number;
}

export default function AppWindow({ 
  title, 
  children, 
  isMinimized, 
  isOpen, 
  isActive,
  onClose, 
  onMinimize, 
  onFocus,
  initialSize = { width: 1100, height: 750 },
  initialPosition,
  zIndex 
}: WindowProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState(initialSize);
  
  const defaultPos = { 
    x: Math.max(0, window.innerWidth / 2 - initialSize.width / 2), 
    y: Math.max(28, window.innerHeight / 2 - initialSize.height / 2) 
  };
  
  const [position, setPosition] = useState(initialPosition || defaultPos);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startPos: {x: number, y: number}; startSize: {w: number, h: number}; direction: string } | null>(null);

  // --- Dragging Logic ---
  const handleMouseDown = (e: ReactMouseEvent) => {
    onFocus();
    if (isMaximized) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    if (isDragging && dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, dragRef.current.initialX + dx)),
        y: Math.max(28, Math.min(window.innerHeight - size.height, dragRef.current.initialY + dy)),
      });
    } else if (isResizing && resizeRef.current) {
      const { startX, startY, startPos, startSize, direction } = resizeRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let newX = startPos.x;
      let newY = startPos.y;
      let newW = startSize.w;
      let newH = startSize.h;

      if (direction.includes('e')) newW += dx;
      if (direction.includes('w')) {
        newW -= dx;
        newX += dx;
      }
      if (direction.includes('s')) newH += dy;
      if (direction.includes('n')) {
        newH -= dy;
        newY += dy;
      }

      const MIN_W = 400;
      const MIN_H = 300;
      
      if (newW < MIN_W) {
        if (direction.includes('w')) newX -= (MIN_W - newW);
        newW = MIN_W;
      }
      if (newH < MIN_H) {
        if (direction.includes('n')) newY -= (MIN_H - newH);
        newH = MIN_H;
      }

      setSize({ width: newW, height: newH });
      setPosition({ x: newX, y: Math.max(28, newY) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    dragRef.current = null;
    resizeRef.current = null;
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, size.width, size.height, position.x, position.y]);

  const handleResizeDown = (e: ReactMouseEvent, dir: string) => {
    onFocus();
    if (isMaximized) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...position },
      startSize: { w: size.width, h: size.height },
      direction: dir
    };
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    onFocus();
  };
  
  const windowStyle: CSSProperties = isMaximized ? {
    top: 28, left: 0, width: '100%', height: 'calc(100vh - 28px)', borderRadius: 0, zIndex
  } : {
    top: position.y, left: position.x, width: size.width, height: size.height, zIndex
  };

  return (
    <div 
      className={`window-container ${isMinimized ? 'minimized' : ''} ${!isOpen ? 'closed' : ''} ${isMaximized ? 'maximized' : ''} ${isResizing ? 'is-resizing' : ''} ${isDragging ? 'is-dragging' : ''} ${isActive ? 'is-active' : ''}`}
      style={windowStyle}
      onMouseDown={onFocus}
    >
      <div className="window-titlebar" onMouseDown={handleMouseDown} onDoubleClick={toggleMaximize}>
        <div className="window-traffic-lights">
          <button className="traffic-btn close" onClick={(e) => { e.stopPropagation(); onClose(); }}></button>
          <button className="traffic-btn minimize" onClick={(e) => { e.stopPropagation(); onMinimize(); }}></button>
          <button className="traffic-btn maximize" onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}></button>
        </div>
        <div className="window-title">{title}</div>
      </div>

      <div className="window-content">
        {children}
      </div>

      {!isMaximized && (
        <>
          <div className="resizer n" onMouseDown={(e) => handleResizeDown(e, 'n')}></div>
          <div className="resizer s" onMouseDown={(e) => handleResizeDown(e, 's')}></div>
          <div className="resizer e" onMouseDown={(e) => handleResizeDown(e, 'e')}></div>
          <div className="resizer w" onMouseDown={(e) => handleResizeDown(e, 'w')}></div>
          <div className="resizer ne" onMouseDown={(e) => handleResizeDown(e, 'ne')}></div>
          <div className="resizer nw" onMouseDown={(e) => handleResizeDown(e, 'nw')}></div>
          <div className="resizer se" onMouseDown={(e) => handleResizeDown(e, 'se')}></div>
          <div className="resizer sw" onMouseDown={(e) => handleResizeDown(e, 'sw')}></div>
        </>
      )}
    </div>
  );
}
