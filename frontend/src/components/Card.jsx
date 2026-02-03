import React from 'react';
import './Card.css';

/**
 * Card container component
 * @param {boolean} hoverable - Add hover effect
 * @param {boolean} clickable - Make entire card clickable
 * @param {string} variant - 'default', 'elevated', 'outlined'
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

  return (
    <div 
      className={classes} 
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card header section
 */
export function CardHeader({ children, className = '', action }) {
  return (
    <div className={`card-header ${className}`}>
      <div className="card-header-content">{children}</div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

/**
 * Card title
 */
export function CardTitle({ children, className = '' }) {
  return <h3 className={`card-title ${className}`}>{children}</h3>;
}

/**
 * Card description
 */
export function CardDescription({ children, className = '' }) {
  return <p className={`card-description ${className}`}>{children}</p>;
}

/**
 * Card body/content section
 */
export function CardContent({ children, className = '' }) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

/**
 * Card footer section
 */
export function CardFooter({ children, className = '' }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}

export default Card;
