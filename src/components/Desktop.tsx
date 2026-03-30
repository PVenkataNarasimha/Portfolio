import { useEffect, useRef, useState } from 'react';
import SystemMonitor from './SystemMonitor';
import MatrixClock from './MatrixClock';
import './Desktop.css';
import './MenuBarOverlay.css';

interface DesktopProps {
  onOpenTerminal: (command?: string) => void;
  onOpenBrowser: (url: string, title: string) => void;
  onOpenFiles: () => void;
  onOpenCuriosity: () => void;
  onCloseTopWindow: () => void;
  onMinimizeAll: () => void;
  onHideOthers: () => void;
  onLockScreen: () => void;
  onShutdown: () => void;
  isBlur?: boolean;
}

const Desktop = ({ onOpenTerminal, onOpenBrowser, onOpenFiles, onOpenCuriosity, onCloseTopWindow, onMinimizeAll, onHideOthers, onLockScreen, onShutdown, isBlur }: DesktopProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showHUD, setShowHUD] = useState(true);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
      setShowStatusPopup(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+~`|}{[]:;?><,./-='.split('');
    const fontSize = 14;
    const columns = Math.ceil(width / fontSize);
    const drops: number[] = [];
    const offsets = Array.from({ length: columns }, () => ({ x: 0, y: 0 }));

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const resizeHandler = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      const newCols = Math.ceil(width / fontSize);
      for (let x = drops.length; x < newCols; x++) {
        drops[x] = 1;
        offsets[x] = { x: 0, y: 0 };
      }
    };
    window.addEventListener('resize', resizeHandler);

    let animationFrameId: number;

    const render = () => {
      ctx.fillStyle = 'rgba(3, 5, 4, 0.2)'; // Maintains cleaner trails
      ctx.fillRect(0, 0, width, height);

      ctx.font = fontSize + 'px monospace';

      // Keep shadows off for stability
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      for (let i = 0; i < drops.length; i++) {
        let text = chars[Math.floor(Math.random() * chars.length)];

        const charX = i * fontSize;
        const charY = drops[i] * fontSize;

        const dx = mouseX - charX;
        const dy = mouseY - charY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Target offset if mouse is close
        let targetX = 0;
        let targetY = 0;

        // Increased radius for more impact
        if (dist < 250) {
          const force = (250 - dist) / 250;
          targetX = dx * force * 1.5; // Stronger attraction pull
          targetY = dy * force * 1.5; // Stronger attraction pull

          ctx.fillStyle = '#fff'; // White highlights for focus
        } else {
          ctx.fillStyle = '#00ff41'; // Standard neon green
        }

        // Increased interpolation (0.1) for better responsiveness
        offsets[i].x += (targetX - offsets[i].x) * 0.1;
        offsets[i].y += (targetY - offsets[i].y) * 0.1;

        // Render with persistent offset
        ctx.fillText(text, charX + offsets[i].x, charY + offsets[i].y);

        if (charY > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="desktop">
      <canvas ref={canvasRef} className={`desktop-canvas ${isBlur ? 'blur' : ''}`} />
      
      {showGrid && <div className="desktop-grid" />}

      {/* Desktop Widgets */}
      <div className={`desktop-widgets ${isBlur || !showHUD ? 'widgets-hidden' : ''}`}>
        <div className="widget-wrapper clock-widget">
          <MatrixClock />
        </div>
        <div className="widget-wrapper monitor-widget">
          <SystemMonitor />
        </div>
      </div>

      <div className="macos-menubar glass">
        <div className="menubar-left">
          {/* Apple Menu */}
          <div className="menu-wrapper" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'apple' ? null : 'apple'); }}>
            <span className="apple-logo">:)</span>
            {activeMenu === 'apple' && (
              <div className="menubar-dropdown">
                <div className="menu-dropdown-item" onClick={() => { onOpenCuriosity(); setActiveMenu(null); }}>About This Portfolio</div>
                <div className="menu-divider" />
                <div className="menu-dropdown-item" onClick={() => window.location.reload()}>Restart...</div>
                <div className="menu-dropdown-item" onClick={() => { onShutdown(); setActiveMenu(null); }}>Shutdown...</div>
                <div className="menu-divider" />
                <div className="menu-dropdown-item" onClick={() => { onLockScreen(); setActiveMenu(null); }}>Lock Screen <span className="menu-shortcut">^⌘Q</span></div>
                <div className="menu-dropdown-item" onClick={() => { onShutdown(); setActiveMenu(null); }}>Logout... <span className="menu-shortcut">⇧⌘Q</span></div>
              </div>
            )}
          </div>

          {/* Portfolio Menu */}
          <div className="menu-wrapper" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'portfolio' ? null : 'portfolio'); }}>
            <span className="menu-item bold">Portfolio</span>
            {activeMenu === 'portfolio' && (
              <div className="menubar-dropdown">
                <div className="menu-dropdown-item" onClick={() => { onOpenCuriosity(); setActiveMenu(null); }}>About Portfolio</div>
                <div className="menu-dropdown-item" onClick={() => { onOpenCuriosity(); setActiveMenu(null); }}>Settings... <span className="menu-shortcut">⌘,</span></div>
                <div className="menu-divider" />
                <div className="menu-dropdown-item" onClick={() => { onMinimizeAll(); setActiveMenu(null); }}>Hide Portfolio <span className="menu-shortcut">⌘H</span></div>
                <div className="menu-dropdown-item" onClick={() => { onHideOthers(); setActiveMenu(null); }}>Hide Others <span className="menu-shortcut">⌥⌘H</span></div>
              </div>
            )}
          </div>

          {/* File Menu */}
          <div className="menu-wrapper" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'file' ? null : 'file'); }}>
            <span className="menu-item">File</span>
            {activeMenu === 'file' && (
              <div className="menubar-dropdown">
                <div className="menu-dropdown-item" onClick={() => { onOpenFiles(); setActiveMenu(null); }}>
                  New Explorer Window <span className="menu-shortcut">⌘N</span>
                </div>
                <div className="menu-dropdown-item disabled">Open... <span className="menu-shortcut">⌘O</span></div>
                <div className="menu-divider" />
                <div className="menu-dropdown-item" onClick={() => { onCloseTopWindow(); setActiveMenu(null); }}>
                  Close Window <span className="menu-shortcut">⌘W</span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="menu-wrapper" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'edit' ? null : 'edit'); }}>
            <span className="menu-item">Edit</span>
            {activeMenu === 'edit' && (
              <div className="menubar-dropdown">
                <div className="menu-dropdown-item" onClick={() => setActiveMenu(null)}>Undo <span className="menu-shortcut">⌘Z</span></div>
                <div className="menu-dropdown-item" onClick={() => setActiveMenu(null)}>Redo <span className="menu-shortcut">⇧⌘Z</span></div>
                <div className="menu-divider" />
                <div className="menu-dropdown-item" onClick={() => { navigator.clipboard.readText(); setActiveMenu(null); }}>Cut <span className="menu-shortcut">⌘X</span></div>
                <div className="menu-dropdown-item" onClick={() => { navigator.clipboard.readText(); setActiveMenu(null); }}>Copy <span className="menu-shortcut">⌘C</span></div>
                <div className="menu-dropdown-item" onClick={() => { navigator.clipboard.readText(); setActiveMenu(null); }}>Paste <span className="menu-shortcut">⌘V</span></div>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="menu-wrapper" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'view' ? null : 'view'); }}>
            <span className="menu-item">View</span>
            {activeMenu === 'view' && (
              <div className="menubar-dropdown">
                <div className="menu-dropdown-item" onClick={() => { document.documentElement.requestFullscreen(); setActiveMenu(null); }}>
                  Enter Full Screen <span className="menu-shortcut">^⌘F</span>
                </div>
                <div className="menu-divider" />
                <div className="menu-dropdown-item" onClick={() => { setShowGrid(!showGrid); setActiveMenu(null); }}>
                  {showGrid ? 'Hide Grid' : 'Show Grid'}
                </div>
                <div className="menu-dropdown-item" onClick={() => { setShowHUD(!showHUD); setActiveMenu(null); }}>
                  {showHUD ? 'Hide HUD Widgets' : 'Show HUD Widgets'}
                </div>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="menu-wrapper" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === 'help' ? null : 'help'); }}>
            <span className="menu-item">Help</span>
            {activeMenu === 'help' && (
              <div className="menubar-dropdown">
                <div className="menu-dropdown-item" onClick={() => onOpenTerminal('/help')}>System Documentation</div>
                <div className="menu-dropdown-item">Search...</div>
              </div>
            )}
          </div>
        </div>

        <div className="menubar-right">
          {/* Status Icons */}
          <div className="menubar-icon wifi" title="Network: ONLINE">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" /></svg>
          </div>
          <div className="menubar-icon battery" title="Battery: 100% (Charged)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="16" height="10" x="2" y="7" rx="2" /><path d="M22 11v2" /></svg>
          </div>
          <div className="menubar-icon search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
          </div>
          <div className="menubar-icon control-center" onClick={(e) => { e.stopPropagation(); setShowStatusPopup(!showStatusPopup); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9m3 3h9m-6 3h9M4 7V5c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2M4 11v-2c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2M4 15v-2c0-1.1.9-2 2-2h2a2 2 0 0 1 2 2v2" /></svg>
          </div>

          {showStatusPopup && (
            <div className="system-status-popup glass" onClick={(e) => e.stopPropagation()}>
              <div className="status-header">SYSTEM_HUB_v4.2</div>
              <div className="status-row">
                <span>Kernel Version</span>
                <span className="status-val">6.5.0-STABLE</span>
              </div>
              <div className="status-row">
                <span>Uplink Status</span>
                <span className="status-val" style={{ color: '#00ff41' }}>ENCRYPTED</span>
              </div>
              <div className="status-row">
                <span>Global Threat</span>
                <span className="status-val">0.00%</span>
              </div>
              <div className="menu-divider" />
              <div className="status-row">
                <span>Dark Mode</span>
                <span className="status-val">ENABLED</span>
              </div>
              <div className="status-row">
                <span>Background Logic</span>
                <span className="status-val">MATRIX_RAIN</span>
              </div>
            </div>
          )}

          <span className="menu-item">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          <span className="menu-item">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="dock glass">
        <div className="dock-icon terminal-icon" onClick={() => onOpenTerminal()} title="Open Terminal">
          <div className="terminal-icon-inner">&gt;_</div>
        </div>

        <div className="dock-icon snake-icon" onClick={() => onOpenTerminal('/snake')} title="Play Terminal Snake">
          <div className="social-icon-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 12h4m-2-2v4M15 11h.01M18 13h.01" />
            </svg>
          </div>
        </div>

        <div className="dock-icon files-icon" onClick={onOpenFiles} title="File Explorer">
          <div className="social-icon-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>
          </div>
        </div>

        <div
          className="dock-icon linkedin-icon"
          onClick={() => onOpenBrowser('https://www.linkedin.com/in/narasimha-pulipati/', 'LinkedIn')}
          title="LinkedIn Profile"
        >
          <div className="social-icon-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
          </div>
        </div>
        <div
          className="dock-icon github-icon"
          onClick={() => onOpenBrowser('https://github.com/PVenkataNarasimha', 'GitHub')}
          title="GitHub Profile"
        >
          <div className="social-icon-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
          </div>
        </div>
        <div
          className="dock-icon instagram-icon"
          onClick={() => onOpenBrowser('https://instagram.com/narasimha_pv', 'Instagram')}
          title="Instagram Profile"
        >
          <div className="social-icon-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Desktop;
