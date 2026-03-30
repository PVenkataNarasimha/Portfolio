import { useState, useEffect } from 'react';
import './MatrixClock.css';

export default function MatrixClock() {
  const [time, setTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const [scrambledTime, setScrambledTime] = useState('');

  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isHovered) {
      setScrambledTime('');
      return;
    }

    const scrambleInterval = setInterval(() => {
      const timeStr = time.toLocaleTimeString([], { hour12: false });
      const scrambled = timeStr
        .split('')
        .map(char => (char === ':' ? ':' : characters[Math.floor(Math.random() * characters.length)]))
        .join('');
      setScrambledTime(scrambled);
    }, 80);

    return () => clearInterval(scrambleInterval);
  }, [isHovered, time]);

  return (
    <div 
      className="matrix-clock-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="clock-overlay">
        <div className={`time-display ${isHovered ? 'scrambled' : ''}`}>
          {isHovered ? scrambledTime : time.toLocaleTimeString([], { hour12: false })}
        </div>
        <div className="date-display">
          {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
