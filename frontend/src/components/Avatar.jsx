import React from 'react';
import './Avatar.css';

/**
 * Avatar component for user/wallet display
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} address - Stacks address (for gradient generation)
 * @param {string} size - 'xs', 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} status - 'online', 'offline', 'away' (optional)
 */
export function Avatar({
  src,
  alt,
  address,
  size = 'md',
  status,
  className = '',
}) {
  const hasImage = src && !src.includes('undefined');
  const initials = alt ? getInitials(alt) : address ? address.slice(0, 2).toUpperCase() : '?';
  const gradient = address ? generateGradient(address) : 'linear-gradient(135deg, #6366f1, #8b5cf6)';

  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {hasImage ? (
        <img 
          src={src} 
          alt={alt || 'Avatar'} 
          className="avatar-image"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      <div 
        className="avatar-fallback" 
        style={{ background: gradient, display: hasImage ? 'none' : 'flex' }}
      >
        {initials}
      </div>
      
      {status && (
        <span className={`avatar-status avatar-status-${status}`} />
      )}
    </div>
  );
}

/**
 * Avatar group for multiple avatars
 */
export function AvatarGroup({ children, max = 4, size = 'md', className = '' }) {
  const avatars = React.Children.toArray(children);
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`avatar-group ${className}`}>
      {visible.map((avatar, index) => (
        <div key={index} className="avatar-group-item">
          {React.cloneElement(avatar, { size })}
        </div>
      ))}
      
      {remaining > 0 && (
        <div className={`avatar avatar-${size} avatar-overflow`}>
          <div className="avatar-fallback">+{remaining}</div>
        </div>
      )}
    </div>
  );
}

// Generate initials from name
function getInitials(name) {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Generate gradient from address
function generateGradient(address) {
  const hash = address.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  
  return `linear-gradient(135deg, hsl(${h1}, 70%, 50%), hsl(${h2}, 70%, 60%))`;
}

export default Avatar;
