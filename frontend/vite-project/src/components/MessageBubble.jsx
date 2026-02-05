/**
 * MessageBubble Component
 * Displays a single message with neumorphic design
 */

import NeumorphicCard from './neumorphic/NeumorphicCard';
import NeumorphicBadge from './neumorphic/NeumorphicBadge';

export default function MessageBubble({ message, currentRole }) {
  const isOwnMessage = message.role === currentRole;
  const isDoctor = message.role === 'doctor';
  
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Role indicator */}
        <div className={`flex items-center gap-2 mb-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <NeumorphicBadge variant={isDoctor ? 'accent' : 'success'} size="sm">
            {isDoctor ? '👨‍⚕️ Doctor' : '🧑 Patient'}
          </NeumorphicBadge>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        
        {/* Message bubble */}
        <NeumorphicCard 
          className={`${isOwnMessage ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
          flat={isOwnMessage}
        >
          <p className="text-gray-800 leading-relaxed">
            {isOwnMessage ? message.originalText : message.translatedText}
          </p>
        </NeumorphicCard>

        {/* Show original text for translated messages */}
        {!isOwnMessage && message.originalText && (
          <div className="mt-2 p-3 bg-gray-50/50 rounded-xl shadow-neu-inset border border-gray-200/30">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1">
              <span>🌐</span>
              <span>Original</span>
            </div>
            <p className="text-sm text-gray-700">
              {message.originalText}
            </p>
          </div>
        )}

        {/* Show translation preview for own messages */}
        {isOwnMessage && message.translatedText && (
          <div className={`mt-2 text-xs text-gray-400 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            Sent as: "{message.translatedText.substring(0, 50)}..."
          </div>
        )}
      </div>
    </div>
  );
}
