import React, { useState, useEffect, useRef } from 'react';
import './Countdown.css';

/**
 * Countdown - Timer component that displays remaining time.
 *
 * Supports multiple display variants and calls a callback when
 * the countdown reaches zero. Useful for lock period displays.
 *
 * @param {Object} props - Component props
 * @param {number} [props.seconds=0] - Total seconds to count down from
 * @param {Function} [props.onComplete] - Callback when countdown reaches 0
 * @param {string} [props.variant='default'] - Display style: 'default', 'compact', 'large'
 * @param {boolean} [props.showLabels=true] - Show time unit labels (Days, Hours, etc.)
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Countdown timer element
 * @example
 * <Countdown seconds={86400} onComplete={() => console.log('Unlocked!')} variant="large" />
 */
export function Countdown({
  seconds,
  onComplete,
  variant = 'default',
  showLabels = true,
  className = '',
}) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor(seconds || 0)));
  const completedRef = useRef(false);

  useEffect(() => {
    setTimeLeft(Math.max(0, Math.floor(seconds || 0)));
    completedRef.current = false;
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
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
      <div className={`countdown countdown-complete ${className}`} role="status" aria-label="Vault unlocked and ready to withdraw" aria-live="polite">
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

/**
 * parseTime - Convert total seconds into days, hours, minutes, and seconds.
 * @param {number} totalSeconds - Total seconds to parse
 * @returns {{ days: number, hours: number, minutes: number, secs: number }} Time components
 */
function parseTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  
  return { days, hours, minutes, secs };
}

/**
 * padZero - Format a number with leading zero if less than 10.
 * @param {number} num - Number to format
 * @returns {string} Two-digit string representation
 */
function padZero(num) {
  return num.toString().padStart(2, '0');
}

export default Countdown;
