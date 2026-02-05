/**
 * Custom hook for polling messages
 * Trade-off: Simple polling interval. For production, consider:
 * - Exponential backoff
 * - WebSocket upgrade when available
 * - Server-Sent Events
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMessages } from '../services/api';

const POLL_INTERVAL = 2000; // Poll every 2 seconds

export function useMessagePolling(conversationId, enabled = true) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastMessageIdRef = useRef(null);
  const pollTimeoutRef = useRef(null);

  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!conversationId) return;

    try {
      if (isInitial) setLoading(true);
      
      // For initial load, get all messages. For polling, get only new ones.
      const afterId = isInitial ? null : lastMessageIdRef.current;
      const response = await getMessages(conversationId, afterId);
      
      if (isInitial) {
        // Replace all messages on initial load
        setMessages(response.messages);
      } else if (response.messages.length > 0) {
        // Append new messages during polling
        setMessages(prev => [...prev, ...response.messages]);
      }
      
      // Update last message ID for next poll
      if (response.lastMessageId) {
        lastMessageIdRef.current = response.lastMessageId;
      }
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Initial fetch when conversation changes
  useEffect(() => {
    if (conversationId) {
      lastMessageIdRef.current = null;
      setMessages([]);
      fetchMessages(true);
    }
  }, [conversationId, fetchMessages]);

  // Polling effect
  useEffect(() => {
    if (!conversationId || !enabled) return;

    const poll = () => {
      pollTimeoutRef.current = setTimeout(async () => {
        await fetchMessages(false);
        poll(); // Schedule next poll
      }, POLL_INTERVAL);
    };

    poll();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [conversationId, enabled, fetchMessages]);

  // Manual refresh function
  const refresh = useCallback(() => {
    lastMessageIdRef.current = null;
    fetchMessages(true);
  }, [fetchMessages]);

  return { messages, loading, error, refresh };
}
