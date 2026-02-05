/**
 * Healthcare Doctor-Patient Translation App
 * Main Application Component
 * 
 * Trade-off: Simple state management for MVP.
 * For production, consider Redux/Zustand for complex state.
 */

import { useState, useEffect } from 'react';
import SetupFlow from './components/SetupFlow';
import ChatUI from './components/ChatUI';
import SummaryPanel from './components/SummaryPanel';
import SearchPanel from './components/SearchPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

function App() {
  // App state
  const [conversation, setConversation] = useState(null);
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [partnerUser, setPartnerUser] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if there's a conversation ID in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get('conversation');
    
    if (conversationId) {
      // Load existing conversation
      loadExistingConversation(conversationId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadExistingConversation = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/conversation/${conversationId}`);
      if (!response.ok) throw new Error('Conversation not found');
      
      const conv = await response.json();
      setConversation(conv);
      
      // Ask user for their role
      const userRole = prompt('Are you the doctor or patient? (type "doctor" or "patient")');
      if (userRole === 'doctor' || userRole === 'patient') {
        setRole(userRole);
      } else {
        alert('Invalid role. Please start over.');
        window.location.href = window.location.origin;
      }
    } catch (error) {
      alert('Could not load conversation. Starting new conversation.');
      window.history.replaceState({}, '', window.location.origin);
    } finally {
      setLoading(false);
    }
  };

  // Handle setup completion from SetupFlow
  const handleSetupComplete = ({ conversation: conv, role: selectedRole, user, partner }) => {
    setConversation(conv);
    setRole(selectedRole);
    setCurrentUser(user);
    setPartnerUser(partner);
    
    // Update URL with conversation ID
    window.history.replaceState({}, '', `?conversation=${conv.id}`);
  };

  // Handle ending the chat (return to setup)
  const handleEndChat = () => {
    if (window.confirm('Are you sure you want to end this conversation?')) {
      setConversation(null);
      setRole(null);
      setCurrentUser(null);
      setPartnerUser(null);
      window.history.replaceState({}, '', window.location.origin);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neu-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no conversation, show setup flow
  if (!conversation) {
    return <SetupFlow onComplete={handleSetupComplete} />;
  }

  // Show chat UI with optional modals
  return (
    <>
      <ChatUI
        conversation={conversation}
        role={role}
        onShowSummary={() => setShowSummary(true)}
        onShowSearch={() => setShowSearch(true)}
        onEndChat={handleEndChat}
      />

      {/* Summary Modal */}
      {showSummary && (
        <SummaryPanel
          conversationId={conversation.id}
          onClose={() => setShowSummary(false)}
        />
      )}

      {/* Search Modal */}
      {showSearch && (
        <SearchPanel
          conversationId={conversation.id}
          onClose={() => setShowSearch(false)}
        />
      )}
    </>
  );
}

export default App;
