/**
 * Neumorphic Card Component
 * Reusable card with soft shadows for neumorphic design
 */

export default function NeumorphicCard({ children, className = '', flat = false, inset = false }) {
  const shadowClass = inset 
    ? 'shadow-neu-inset' 
    : flat 
    ? '' 
    : 'shadow-neu hover:shadow-neu-hover transition-all duration-300';
  
  return (
    <div className={`bg-neu-bg rounded-2xl p-6 ${shadowClass} ${className}`}>
      {children}
    </div>
  );
}
