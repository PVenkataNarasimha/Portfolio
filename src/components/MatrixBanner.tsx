import { useState, useEffect } from 'react';
import './MatrixBanner.css';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+~`|}{[]:;?><,./-='.split('');

export default function MatrixBanner({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iterations = 0;
    
    // Initial state: fully randomized
    setDisplayText(text.split('').map(char => char === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]).join(''));

    const interval = setInterval(() => {
      setDisplayText(prev => 
        prev.split('').map((_, index) => {
          if (index < Math.floor(iterations)) {
            return text[index];
          }
          if (text[index] === ' ') return ' ';
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
      
      if (iterations >= text.length) {
        clearInterval(interval);
      }
      
      iterations += 1 / 3;
    }, 40);
    
    return () => clearInterval(interval);
  }, [text]);

  return <div className="matrix-banner-text">{displayText}</div>;
}
