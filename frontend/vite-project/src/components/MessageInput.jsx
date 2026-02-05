/**
 * MessageInput Component
 * Text input for sending messages with neumorphic design
 */

import { useState } from 'react';
import { sendMessage } from '../services/api';
import NeumorphicInput from './neumorphic/NeumorphicInput';
import NeumorphicIconButton from './neumorphic/NeumorphicIconButton';

export default function MessageInput({ conversationId, role, onMessageSent }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedText = text.trim();
    if (!trimmedText || sending) return;

    setSending(true);
    setError(null);

    try {
      const message = await sendMessage(conversationId, role, trimmedText);
      setText('');
      if (onMessageSent) onMessageSent(message);
    } catch (err) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isDoctor = role === 'doctor';

  return (
    <div className="bg-neu-bg border-t border-neu-dark/10 p-4">
      {error && (
        <div className="mb-3 p-3 bg-neu-danger/10 rounded-xl shadow-neu-inset text-sm text-neu-danger">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        <div className="flex-1">
          <NeumorphicInput
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Type your message as ${role}...`}
            disabled={sending}
          />
        </div>
        
        <NeumorphicIconButton
          type="submit"
          disabled={!text.trim() || sending}
          variant={isDoctor ? 'accent' : 'success'}
          size="lg"
        >
          {sending ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </NeumorphicIconButton>
      </form>
      
      <div className="mt-2 text-xs text-gray-400 text-center">
        Voice input coming soon • MVP: text only
      </div>
    </div>
  );
}
