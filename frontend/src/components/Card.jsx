/**
 * Card Component - Reusable card container with optional header and footer.
 *
 * @module components/Card
 * @author adekunlebamz
 */

import React from 'react';
import './Card.css';

/**
 * Card container component for grouping related content.
 *
 * Supports multiple variants and interactive states for flexible layouts.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {boolean} [props.hoverable=false] - Adds hover elevation effect
 * @param {boolean} [props.clickable=false] - Makes card interactive with button behavior
 * @param {string} [props.variant='default'] - Card style: 'default', 'elevated', 'outlined'
 * @param {Function} [props.onClick] - Click handler (activates when clickable=true)
 * @param {string} [props.className=''] - Additional CSS class names
 * @returns {JSX.Element} Card container element
 */
export function Card({
  children,
  hoverable = false,
  clickable = false,
  variant = 'default',
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'card',
    `card-${variant}`,
    hoverable && 'card-hoverable',
    clickable && 'card-clickable',
    className,
  ].filter(Boolean).join(' ');

  const handleKeyDown = (event) => {
    if (!clickable || !onClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      className={classes}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-disabled={props.disabled ? true : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card header section
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Header content
 * @param {React.ReactNode} props.action - Optional action button/link
 */
export function CardHeader({ children, className = '', action, ...props }) {

  return (
    <div className={`card-header ${className}`} {...props}>
      <div className="card-header-content">{children}</div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

/**
 * Card title
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Title text
 */
export function CardTitle({ children, className = '', as: Tag = 'h3' }) {

  return <Tag className={`card-title ${className}`}>{children}</Tag>;
}

/**
 * Card description
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Description text
 */
export function CardDescription({ children, className = '' }) {

  return <p className={`card-description ${className}`}>{children}</p>;
}

/**
 * Card body/content section
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Main content
 */
export function CardContent({ children, className = '' }) {

  return <div className={`card-content ${className}`}>{children}</div>;
}

/**
 * Card footer section
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Footer content
 */
export function CardFooter({ children, className = '' }) {

  return <div className={`card-footer ${className}`}>{children}</div>;
}

export default Card;
