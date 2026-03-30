import { useState, useEffect, Fragment } from 'react';
import './BootSequence.css';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: "Initializing portfolio system...", delay: 200 },
  { text: "Loading design tokens...", delay: 150 },
  { text: "Mounting component library...", delay: 100 },
  { text: "[████████████████████████] done", delay: 300, breakAfter: true },
  { text: "Resolving 12 case studies...", delay: 200 },
  { text: "Connecting to Product Rocket core...", delay: 150 },
  { text: "ok", delay: 150, breakAfter: true },
  { text: "Design systems: operational", delay: 100 },
  { text: "UX research modules: loaded", delay: 100 },
  { text: "Don't search for /secrets here...", delay: 150, color: '#f39c12' },
  { text: "Strategic thinking: engaged", delay: 150, breakAfter: true },
  { text: "✦", delay: 200, color: '#00d2ff' },
  { text: "Portfolio v10.0 — ready.", delay: 300, highlight: true }
];

const TypewriterLine = ({ line, onComplete }: { line: any, onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(line.text.substring(0, index + 1));
      index++;
      if (index >= line.text.length) {
        clearInterval(interval);
        setTimeout(onComplete, line.delay || 100);
      }
    }, 10); // Faster speed: 10ms instead of 20ms
    
    return () => clearInterval(interval);
  }, [line, onComplete]);

  return (
    <div 
      className={`boot-line ${line.highlight ? 'highlight' : ''}`}
      style={{ color: line.color || 'inherit' }}
    >
      {displayedText}
      {displayedText.length < line.text.length && <span className="cursor-blink">|</span>}
    </div>
  );
};

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLinesCount, setVisibleLinesCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleLineComplete = () => {
    if (visibleLinesCount < BOOT_LINES.length - 1) {
      setVisibleLinesCount(prev => prev + 1);
    } else {
      setTimeout(() => setIsFinished(true), 500);
    }
  };

  const handleContinue = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen().catch(() => {});
    }
    onComplete();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished && e.key === 'Enter') {
        handleContinue();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, onComplete]);

  return (
    <div className="boot-sequence" onClick={isFinished ? handleContinue : undefined}>
      {BOOT_LINES.slice(0, visibleLinesCount + 1).map((line, index) => (
        <Fragment key={index}>
          {index < visibleLinesCount ? (
            <div 
              className={`boot-line ${line.highlight ? 'highlight' : ''}`}
              style={{ color: line.color || 'inherit' }}
            >
              {line.text}
            </div>
          ) : (
            <TypewriterLine line={line} onComplete={handleLineComplete} />
          )}
          {line.breakAfter && index < visibleLinesCount && <div className="boot-line-break" />}
        </Fragment>
      ))}
      
      {isFinished && (
        <div className="boot-line blink-text mt-4">
          Press Enter to continue...
        </div>
      )}
    </div>
  );
}
