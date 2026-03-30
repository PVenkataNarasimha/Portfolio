import { useState, useEffect } from 'react';
import './SystemMonitor.css';

export default function SystemMonitor() {
  const [metrics, setMetrics] = useState({
    cpu: [45, 52, 48, 62, 55, 42, 38, 45, 60, 58],
    ram: [70, 71, 72, 72, 73, 72, 74, 75, 74, 73],
    net: [12, 105, 85, 42, 18, 92, 110, 8, 45, 60]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: [...prev.cpu.slice(1), Math.floor(Math.random() * 40) + 30],
        ram: [...prev.ram.slice(1), Math.floor(Math.random() * 5) + 70],
        net: [...prev.net.slice(1), Math.floor(Math.random() * 150)]
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderGraph = (data: number[], color: string, max: number) => {
    return (
      <svg className="monitor-graph" viewBox="0 0 100 40" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={data.map((val, i) => `${i * 10},${40 - (val / max) * 40}`).join(' ')}
        />
        <path
          fill={`url(#grad-${color.replace('#', '')})`}
          opacity="0.2"
          d={`M0,40 ${data.map((val, i) => `${i * 10},${40 - (val / max) * 40}`).join(' ')} L90,40 Z`}
        />
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div className="system-monitor-container">
      <div className="monitor-section">
        <div className="monitor-header">
          <span className="monitor-label">CPU USAGE</span>
          <span className="monitor-value">{metrics.cpu[metrics.cpu.length - 1]}%</span>
        </div>
        {renderGraph(metrics.cpu, '#00ff41', 100)}
      </div>

      <div className="monitor-section">
        <div className="monitor-header">
          <span className="monitor-label">RAM USAGE</span>
          <span className="monitor-value">{metrics.ram[metrics.ram.length - 1]}%</span>
        </div>
        {renderGraph(metrics.ram, '#00d2ff', 100)}
      </div>

      <div className="monitor-section">
        <div className="monitor-header">
          <span className="monitor-label">NETWORK</span>
          <span className="monitor-value">{metrics.net[metrics.net.length - 1]} Mbps</span>
        </div>
        {renderGraph(metrics.net, '#f39c12', 150)}
      </div>

      <div className="monitor-footer">
        <div className="footer-item">CORE: V-4.1.2-STABLE</div>
        <div className="footer-item">UPLINK: ACTIVE</div>
      </div>
    </div>
  );
}
