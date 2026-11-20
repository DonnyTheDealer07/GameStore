
import { Link } from 'react-router-dom'
import './button.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'medium',
  to,
  href,
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  const classes = [
    'neon-button',
    `neon-button--${variant}`,
    `neon-button--${size}`,
    className,
  ].filter(Boolean).join(' ')

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...props}>
        {children}
      </Link>
    )
  }

  if (href && !disabled) {
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
