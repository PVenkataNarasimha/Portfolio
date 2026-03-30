import { useState } from 'react';
import './BrowserWindow.css';

interface BrowserWindowProps {
  initialUrl?: string;
}

export default function BrowserWindow({ initialUrl = 'https://google.com' }: BrowserWindowProps) {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [iframeKey, setIframeKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetUrl = inputUrl;
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    setUrl(targetUrl);
    setInputUrl(targetUrl);
  };

  const reload = () => setIframeKey(prev => prev + 1);

  return (
    <div className="browser-container">
      <div className="browser-toolbar">
        <div className="browser-nav-btns">
          <button className="nav-btn" onClick={() => window.history.back()}>←</button>
          <button className="nav-btn" onClick={() => window.history.forward()}>→</button>
          <button className="nav-btn" onClick={reload}>↻</button>
        </div>
        <form className="browser-address-bar" onSubmit={handleSubmit}>
          <div className="address-icon">🔒</div>
          <input 
            type="text" 
            value={inputUrl} 
            onChange={(e) => setInputUrl(e.target.value)}
            className="address-input"
          />
        </form>
      </div>
      <div className="browser-content">
        <iframe 
          key={iframeKey}
          src={url} 
          className="browser-iframe" 
          title="Browser Content"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
        
        {/* Connection Warning Overlay (Simplified detection is hard, so we just add a hint) */}
        <div className="browser-info-hint">
          Note: Some sites (LinkedIn, IG, GitHub) prevent being embedded for security. 
          <button className="open-external-btn" onClick={() => window.open(url, '_blank')}>
            Open in New Tab ↗
          </button>
        </div>
      </div>
    </div>
  );
}
