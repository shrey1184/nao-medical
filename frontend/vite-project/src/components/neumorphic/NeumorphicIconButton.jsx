/**
 * Neumorphic Icon Button Component
 * Circular button with icon for actions
 */

export default function NeumorphicIconButton({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'default',
  size = 'md',
  className = '' 
}) {
  const baseClasses = 'rounded-full flex items-center justify-center transition-all duration-200 active:shadow-neu-inset';
  
  const variants = {
    default: 'bg-neu-bg text-gray-700 shadow-neu hover:shadow-neu-hover',
    accent: 'bg-neu-accent text-white shadow-neu hover:shadow-neu-hover',
    success: 'bg-neu-success text-white shadow-neu hover:shadow-neu-hover',
    danger: 'bg-neu-danger text-white shadow-neu hover:shadow-neu-hover',
  };
  
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}
