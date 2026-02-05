/**
 * Neumorphic Badge Component
 * Small badge for status indicators
 */

export default function NeumorphicBadge({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) {
  const baseClasses = 'rounded-full font-medium inline-flex items-center justify-center';
  
  const variants = {
    default: 'bg-neu-bg text-gray-700 shadow-neu-sm',
    accent: 'bg-neu-accent text-white shadow-neu-sm',
    success: 'bg-neu-success text-white shadow-neu-sm',
    danger: 'bg-neu-danger text-white shadow-neu-sm',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
