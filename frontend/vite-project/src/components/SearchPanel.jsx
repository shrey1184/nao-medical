/**
 * SearchPanel Component
 * Modal for searching conversation messages with neumorphic design
 */

import { useState } from 'react';
import { searchMessages } from '../services/api';
import NeumorphicCard from './neumorphic/NeumorphicCard';
import NeumorphicButton from './neumorphic/NeumorphicButton';
import NeumorphicIconButton from './neumorphic/NeumorphicIconButton';
import NeumorphicInput from './neumorphic/NeumorphicInput';
import NeumorphicBadge from './neumorphic/NeumorphicBadge';

export default function SearchPanel({ conversationId, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchMessages(query, conversationId);
      setResults(response.results);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <NeumorphicCard className="max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neu-dark/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neu-bg shadow-neu flex items-center justify-center">
              <span className="text-xl">🔍</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Search Messages</h2>
              <p className="text-sm text-gray-500">Find messages by keyword</p>
            </div>
          </div>
          <NeumorphicIconButton onClick={onClose} variant="default">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </NeumorphicIconButton>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1">
            <NeumorphicInput
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for symptoms, medications, etc..."
            />
          </div>
          <NeumorphicButton
            type="submit"
            disabled={loading || !query.trim()}
            variant="accent"
            size="md"
          >
            {loading ? '...' : 'Search'}
          </NeumorphicButton>
        </form>

        {/* Results */}
        <div className="overflow-y-auto flex-1 pr-2">
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neu-accent"></div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-neu-danger/10 shadow-neu-inset p-4 rounded-xl text-neu-danger">
              {error}
            </div>
          )}

          {hasSearched && !loading && results.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neu-bg shadow-neu mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-gray-600">No messages found matching "{query}"</p>
            </div>
          )}

          {results.length > 0 && !loading && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-3">
                {results.map((result) => (
                  <NeumorphicCard key={result.messageId} flat>
                    <div className="flex items-center gap-2 mb-2">
                      <NeumorphicBadge
                        variant={result.role === 'doctor' ? 'accent' : 'success'}
                        size="sm"
                      >
                        {result.role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'}
                      </NeumorphicBadge>
                      <span className="text-xs text-gray-400">
                        {new Date(result.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 mb-1">
                      {highlightQuery(result.originalText, query)}
                    </p>
                    
                    {result.translatedText !== result.originalText && (
                      <p className="text-sm text-gray-500 italic mt-2">
                        → {highlightQuery(result.translatedText, query)}
                      </p>
                    )}
                  </NeumorphicCard>
                ))}
              </div>
            </div>
          )}

          {!hasSearched && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neu-bg shadow-neu mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <p className="text-gray-600 font-medium">Enter a keyword to search</p>
              <p className="text-sm text-gray-400 mt-1">Searches both original and translated text</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neu-dark/10 flex justify-end">
          <NeumorphicButton
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            Close
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  );
}

function highlightQuery(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-amber-200 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
