/**
 * Neumorphic Button Component
 * Reusable button with neumorphic styling and variants
 */

export default function NeumorphicButton({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button'
}) {
  const baseClasses = 'rounded-xl font-medium transition-all duration-200 active:shadow-neu-inset';
  
  const variants = {
    primary: 'bg-neu-accent text-white shadow-neu hover:shadow-neu-hover',
    success: 'bg-neu-success text-white shadow-neu hover:shadow-neu-hover',
    danger: 'bg-neu-danger text-white shadow-neu hover:shadow-neu-hover',
    secondary: 'bg-neu-bg text-gray-700 shadow-neu hover:shadow-neu-hover',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed shadow-neu-sm' 
    : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}
