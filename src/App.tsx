import { useState, useEffect, useRef } from 'react';
import Desktop from './components/Desktop';
import AppWindow from './components/AppWindow';
import BootSequence from './components/BootSequence';
import TerminalShell from './components/TerminalShell';
import BrowserWindow from './components/BrowserWindow';
import CuriosityCard from './components/CuriosityCard';
import FileExplorer from './components/FileExplorer';
import './App.css';

interface WindowInstance {
  id: string;
  type: 'terminal' | 'browser' | 'curiosity' | 'file-explorer';
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  url?: string;
  initialCommand?: string;
}

function App() {
  const [booted, setBooted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [windows, setWindows] = useState<WindowInstance[]>([
    { id: 'terminal', type: 'terminal', title: 'narasimha@pulipati ~ /portfolio', isOpen: true, isMinimized: false, zIndex: 20 },
    { id: 'curiosity', type: 'curiosity', title: 'Desktop Profile', isOpen: false, isMinimized: false, zIndex: 10 }
  ]);
  const [maxZIndex, setMaxZIndex] = useState(20);
  const prevOthersHidden = useRef<boolean>(false);

  const handleBootComplete = () => {
    setBooted(true);
  };

  const focusWindow = (id: string) => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w));
  };

  const toggleWindow = (id: string, type: 'terminal' | 'browser' | 'curiosity' | 'file-explorer', title: string, url?: string, initialCommand?: string) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      const newZ = maxZIndex + 1;
      setMaxZIndex(newZ);

      if (existing) {
        // If an initial command is passed (like launching the game), 
        // we want to ensure the window opens, unminimizes, and comes to front.
        if (initialCommand) {
          return prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: newZ, initialCommand } : w);
        }

        // Standard toggle behavior
        if (!existing.isOpen) {
          return prev.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: newZ } : w);
        } else {
          return prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized, zIndex: newZ } : w);
        }
      }

      return [...prev, { id, type, title, isOpen: true, isMinimized: false, zIndex: newZ, url, initialCommand }];
    });
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const closeTopWindow = () => {
    const topWindow = windows.filter(w => w.isOpen).sort((a, b) => b.zIndex - a.zIndex)[0];
    if (topWindow) closeWindow(topWindow.id);
  };

  const minimizeAll = () => {
    setWindows(prev => prev.map(w => w.isOpen ? { ...w, isMinimized: true } : w));
  };

  const hideOthers = () => {
    const topWindow = windows.filter(w => w.isOpen).sort((a, b) => b.zIndex - a.zIndex)[0];
    if (topWindow) {
      setWindows(prev => prev.map(w => w.id !== topWindow.id && w.isOpen ? { ...w, isMinimized: true } : w));
    }
  };

  useEffect(() => {
    if (!booted) return;

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, [booted]);

  useEffect(() => {
    if (!booted) return;

    const othersHidden = windows.filter(w => w.id !== 'curiosity').every(w => !w.isOpen || w.isMinimized);
    const curiosity = windows.find(w => w.id === 'curiosity');

    // ONLY auto-open if others JUST became hidden (transition from false to true)
    // or if it's the very first render after boot and others are hidden.
    const justBecameHidden = othersHidden && !prevOthersHidden.current;

    if (justBecameHidden && curiosity && !curiosity.isOpen) {
      setWindows(prev => {
        const cur = prev.find(p => p.id === 'curiosity');
        if (cur && !cur.isOpen) {
          return prev.map(w => w.id === 'curiosity' ? { ...w, isOpen: true, isMinimized: false, zIndex: 10 } : w);
        }
        return prev;
      });
    }

    prevOthersHidden.current = othersHidden;
  }, [windows.map(w => w.isOpen || w.isMinimized).join(','), booted]);

  return (
    <div className="app-container">
      {!booted ? (
        <BootSequence onComplete={handleBootComplete} />
      ) : (
        <>
          <Desktop
            onOpenTerminal={(cmd?: string) => toggleWindow('terminal', 'terminal', 'narasimha@pulipati ~ /portfolio', undefined, cmd)}
            onOpenBrowser={(url: string, title: string) => toggleWindow(title, 'browser', title, url)}
            onOpenFiles={() => toggleWindow('files', 'file-explorer', 'File System')}
            onOpenCuriosity={() => toggleWindow('curiosity', 'curiosity', 'Desktop Profile')}
            onCloseTopWindow={closeTopWindow}
            onMinimizeAll={minimizeAll}
            onHideOthers={hideOthers}
            onLockScreen={() => setIsLocked(true)}
            onShutdown={() => setBooted(false)}
            isBlur={isLocked || windows.some(w => w.isOpen && !w.isMinimized && w.type !== 'curiosity')}
          />

          {windows.map(win => (
            <AppWindow
              key={win.id}
              id={win.id}
              title={win.title}
              isOpen={win.isOpen}
              isMinimized={win.isMinimized}
              isActive={win.zIndex === maxZIndex}
              zIndex={win.zIndex}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
              initialSize={
                win.type === 'terminal' ? { width: 1020, height: 800 } :
                  win.type === 'curiosity' ? { width: 350, height: 450 } :
                    win.type === 'file-explorer' ? { width: 800, height: 500 } :
                      { width: 1000, height: 750 }
              }
            >
              {win.type === 'terminal' ? <TerminalShell initialCommand={win.initialCommand} /> :
               win.type === 'browser' ? <BrowserWindow initialUrl={win.url} /> :
               win.type === 'file-explorer' ? <FileExplorer /> :
               <CuriosityCard 
                 onReopenSystem={() => {
                   toggleWindow('terminal', 'terminal', 'narasimha@pulipati ~ /portfolio');
                   closeWindow('curiosity');
                 }} 
                 onOpenProjects={() => {
                   toggleWindow('projects', 'file-explorer', 'Projects');
                   closeWindow('curiosity');
                 }} 
               />}
            </AppWindow>
          ))}

          {isLocked && (
            <div className="system-lock-overlay" onClick={() => setIsLocked(false)}>
              <div className="lock-content">
                <div className="lock-avatar">:)</div>
                <div className="lock-user">NARASIMHA_PULIPATI</div>
                <div className="lock-sub">Session Locked</div>
                <div className="lock-hint">Click to resume your session</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
