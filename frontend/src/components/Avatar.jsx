/**
 * Avatar Component - User profile image display.
 *
 * @module components/Avatar
 * @author adekunlebamz
 */
import React from 'react';
import './Avatar.css';

/**
 * Avatar - User/wallet profile image component.
 *
 * Displays an image with fallback to initials or gradient background.
 * Supports status indicators and multiple sizes.
 *
 * @param {Object} props - Component props
 * @param {string} [props.src] - Image source URL
 * @param {string} [props.alt] - Alt text for accessibility
 * @param {string} [props.address] - Stacks address for gradient generation
 * @param {string} [props.size='md'] - Avatar size: 'xs', 'sm', 'md', 'lg', 'xl'
 * @param {string} [props.status] - Status indicator: 'online', 'offline', 'away'
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Avatar element with image or fallback
 * @example
 * <Avatar address="SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N" status="online" />
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
  const avatarLabel = alt || address || 'Wallet avatar';

  return (
    <div className={`avatar avatar-${size} ${className}`} title={avatarLabel}>
      {hasImage ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="avatar-image"
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        className="avatar-fallback"
        aria-label={avatarLabel}
        style={{ background: gradient, display: hasImage ? 'none' : 'flex' }}
      >
        {initials}
      </div>

      {status && (
        <span className={`avatar-status avatar-status-${status}`} title={status} aria-label={`Status: ${status}`} />
      )}
    </div>
  );
}

/**
 * AvatarGroup - Display multiple avatars with overflow indicator.
 *
 * Shows a limited number of avatars with a "+N" indicator for remaining.
 * Useful for displaying group members or multiple participants.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - List of Avatar components
 * @param {number} [props.max=4] - Maximum avatars to display
 * @param {string} [props.size='md'] - Size for all avatars
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Avatar group with overflow indicator
 * @example
 * <AvatarGroup max={3} size="sm">
 *   <Avatar address="SP3F...G6N" />
 *   <Avatar address="ST1K...2P" />
 *   <Avatar address="SP9M...4R" />
 *   <Avatar address="ST7L...8Q" />
 * </AvatarGroup>
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
        <div className={`avatar avatar-${size} avatar-overflow`} title={`${remaining} more participant${remaining > 1 ? 's' : ''}`}>
          <div className="avatar-fallback">+{remaining}</div>
        </div>
      )}
    </div>
  );
}

/**
 * getInitials - Extract first two initials from a name string.
 * @param {string} name - Full name or display name
 * @returns {string} Up to 2 uppercase initials
 */
function getInitials(name) {

  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * generateGradient - Create a deterministic gradient from an address hash.
 *
 * Uses a simple hash function to generate consistent HSL colors
 * from any Stacks address string.
 *
 * @param {string} address - Stacks address string
 * @returns {string} CSS linear-gradient value
 */
function generateGradient(address) {

  const hash = address.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;

  return `linear-gradient(135deg, hsl(${h1}, 70%, 50%), hsl(${h2}, 70%, 60%))`;
}

export default Avatar;
