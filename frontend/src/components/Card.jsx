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
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Title text
 */
export function CardTitle({ children, className = '' }) {

  return <h3 className={`card-title ${className}`}>{children}</h3>;
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
