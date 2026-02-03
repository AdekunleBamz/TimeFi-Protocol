import React, { useState, useEffect } from 'react';
import './Countdown.css';

/**
 * Countdown timer component
 * @param {number} seconds - Total seconds to count down
 * @param {Function} onComplete - Called when countdown reaches 0
 * @param {string} variant - 'default', 'compact', 'large'
 */
export function Countdown({
  seconds,
  onComplete,
  variant = 'default',
  showLabels = true,
  className = '',
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const { days, hours, minutes, secs } = parseTime(timeLeft);

  if (timeLeft <= 0) {
    return (
      <div className={`countdown countdown-complete ${className}`}>
        <span className="countdown-ready">Ready to withdraw!</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`countdown countdown-compact ${className}`}>
        {days > 0 && <span>{days}d </span>}
        {hours > 0 && <span>{hours}h </span>}
        <span>{minutes}m </span>
        <span>{secs}s</span>
      </div>
    );
  }

  return (
    <div className={`countdown countdown-${variant} ${className}`}>
      {days > 0 && (
        <div className="countdown-unit">
          <span className="countdown-value">{padZero(days)}</span>
          {showLabels && <span className="countdown-label">Days</span>}
        </div>
      )}
      
      <div className="countdown-unit">
        <span className="countdown-value">{padZero(hours)}</span>
        {showLabels && <span className="countdown-label">Hours</span>}
      </div>
      
      <div className="countdown-separator">:</div>
      
      <div className="countdown-unit">
        <span className="countdown-value">{padZero(minutes)}</span>
        {showLabels && <span className="countdown-label">Mins</span>}
      </div>
      
      <div className="countdown-separator">:</div>
      
      <div className="countdown-unit">
        <span className="countdown-value">{padZero(secs)}</span>
        {showLabels && <span className="countdown-label">Secs</span>}
      </div>
    </div>
  );
}

function parseTime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  
  return { days, hours, minutes, secs };
}

function padZero(num) {
  return num.toString().padStart(2, '0');
}

export default Countdown;
