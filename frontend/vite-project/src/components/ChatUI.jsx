/**
 * ChatUI Component
 * Main chat interface with neumorphic design
 */

import { useEffect, useRef } from 'react';
import { useMessagePolling } from '../hooks/useMessagePolling';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import NeumorphicIconButton from './neumorphic/NeumorphicIconButton';
import NeumorphicBadge from './neumorphic/NeumorphicBadge';

export default function ChatUI({ conversation, role, onShowSummary, onShowSearch, onEndChat }) {
  const { messages, loading, error, refresh } = useMessagePolling(conversation?.id);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isDoctor = role === 'doctor';

  return (
    <div className="flex flex-col h-screen bg-neu-bg">
      {/* Header */}
      <header className="bg-neu-bg shadow-neu px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neu-bg shadow-neu flex items-center justify-center text-2xl">
              {isDoctor ? '👨‍⚕️' : '🧑'}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {isDoctor ? 'Doctor View' : 'Patient View'}
              </h1>
              <p className="text-sm text-gray-600">
                {isDoctor ? conversation?.doctorLanguage?.toUpperCase() : conversation?.patientLanguage?.toUpperCase()} 
                <span className="mx-2">→</span>
                {isDoctor ? conversation?.patientLanguage?.toUpperCase() : conversation?.doctorLanguage?.toUpperCase()}
              </p>
              <button
                onClick={() => {
                  const url = `${window.location.origin}?conversation=${conversation.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Conversation link copied! Open in new tab to switch views.');
                }}
                className="text-xs text-blue-500 hover:underline mt-1"
              >
                📋 Copy conversation link
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <NeumorphicIconButton
              onClick={onShowSearch}
              variant="default"
              size="md"
            >
              🔍
            </NeumorphicIconButton>
            <NeumorphicIconButton
              onClick={onShowSummary}
              variant="default"
              size="md"
            >
              📋
            </NeumorphicIconButton>
            <NeumorphicIconButton
              onClick={onEndChat}
              variant="danger"
              size="md"
            >
              ✕
            </NeumorphicIconButton>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {loading && messages.length === 0 && (
            <div className="flex justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neu-accent"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-neu-danger/10 shadow-neu-inset p-4 rounded-xl mb-4 flex justify-between items-center">
              <span className="text-neu-danger">Error: {error}</span>
              <button onClick={refresh} className="text-sm underline text-neu-danger">
                Retry
              </button>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neu-bg shadow-neu mb-4">
                <span className="text-4xl">💬</span>
              </div>
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start the conversation! Messages will be automatically translated.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentRole={role}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-4xl mx-auto w-full">
        <MessageInput
          conversationId={conversation?.id}
          role={role}
          onMessageSent={refresh}
        />
      </div>

      {/* Status Bar */}
      <div className="text-center py-2 text-xs text-gray-400 bg-neu-bg border-t border-neu-dark/10">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 bg-neu-success rounded-full animate-pulse"></span>
          Auto-refreshing every 2 seconds
        </span>
      </div>
    </div>
  );
}
