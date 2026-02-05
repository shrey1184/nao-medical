/**
 * API Service - Handles all backend communication
 * Trade-off: Simple fetch wrapper for MVP. Could use axios or react-query for production.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============ Language API ============

export async function getLanguages() {
  return apiRequest('/languages');
}

// ============ Conversation API ============

export async function createConversation(doctorLanguage, patientLanguage) {
  return apiRequest('/conversation', {
    method: 'POST',
    body: JSON.stringify({ doctorLanguage, patientLanguage }),
  });
}

export async function getConversation(conversationId) {
  return apiRequest(`/conversation/${conversationId}`);
}

// ============ Message API ============

export async function sendMessage(conversationId, role, text) {
  return apiRequest('/message', {
    method: 'POST',
    body: JSON.stringify({ conversationId, role, text }),
  });
}

/**
 * Get messages with polling support
 * @param {string} conversationId - Conversation ID
 * @param {string|null} afterMessageId - Get messages after this ID (for polling)
 */
export async function getMessages(conversationId, afterMessageId = null) {
  let endpoint = `/messages/${conversationId}`;
  if (afterMessageId) {
    endpoint += `?after=${afterMessageId}`;
  }
  return apiRequest(endpoint);
}

// ============ Search API ============

export async function searchMessages(query, conversationId = null) {
  let endpoint = `/search?q=${encodeURIComponent(query)}`;
  if (conversationId) {
    endpoint += `&conversation_id=${conversationId}`;
  }
  return apiRequest(endpoint);
}

// ============ Summary API ============

export async function generateSummary(conversationId) {
  return apiRequest('/summary', {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
  });
}

// ============ Audio API (Stub) ============

export async function uploadAudio(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${API_BASE_URL}/audio/upload`;
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}
