/**
 * Neumorphic Input Component
 * Text input with inset neumorphic styling
 */

export default function NeumorphicInput({ 
  value, 
  onChange, 
  placeholder = '', 
  disabled = false,
  className = '',
  type = 'text'
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-neu-bg rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-neu-accent/30 text-gray-700 placeholder-gray-400 transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    />
  );
}
