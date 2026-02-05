/**
 * SummaryPanel Component
 * Modal for displaying AI-generated conversation summary with neumorphic design
 */

import { useState, useEffect } from 'react';
import { generateSummary } from '../services/api';
import NeumorphicCard from './neumorphic/NeumorphicCard';
import NeumorphicButton from './neumorphic/NeumorphicButton';
import NeumorphicIconButton from './neumorphic/NeumorphicIconButton';

export default function SummaryPanel({ conversationId, onClose }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateSummary(conversationId);
      setSummary(response);
    } catch (err) {
      setError(err.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateSummary();
  }, [conversationId]);

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <NeumorphicCard className="max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-neu-dark/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neu-bg shadow-neu flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Conversation Summary</h2>
              <p className="text-sm text-gray-500">AI-generated consultation overview</p>
            </div>
          </div>
          <NeumorphicIconButton onClick={onClose} variant="default">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </NeumorphicIconButton>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-2">
          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="w-16 h-16 rounded-full bg-neu-bg shadow-neu flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neu-accent"></div>
              </div>
              <p className="text-gray-600 font-medium">Generating summary with AI...</p>
              <p className="text-sm text-gray-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {error && !loading && (
            <div className="bg-neu-danger/10 shadow-neu-inset p-4 rounded-xl">
              <p className="font-semibold text-neu-danger">Error generating summary</p>
              <p className="text-sm text-neu-danger/80 mt-1">{error}</p>
              <NeumorphicButton
                onClick={handleGenerateSummary}
                variant="danger"
                size="sm"
                className="mt-3"
              >
                Try Again
              </NeumorphicButton>
            </div>
          )}

          {summary && !loading && (
            <div className="space-y-3">
              {summary.summary.split('\n').map((line, index) => {
                if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                  return (
                    <li key={index} className="ml-4 text-gray-700 leading-relaxed">
                      {line.replace(/^[-•]\s*/, '')}
                    </li>
                  );
                }
                if (line.trim().endsWith(':') && line.trim().length < 50) {
                  return (
                    <h4 key={index} className="font-bold text-gray-800 mt-4 mb-2 text-lg">
                      {line}
                    </h4>
                  );
                }
                if (line.trim()) {
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {line}
                    </p>
                  );
                }
                return null;
              })}

              <div className="mt-6 pt-4 border-t border-neu-dark/10 text-sm text-gray-500">
                Generated at: {new Date(summary.generatedAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neu-dark/10 flex justify-between">
          <NeumorphicButton
            onClick={handleGenerateSummary}
            disabled={loading}
            variant="secondary"
            size="md"
          >
            🔄 Regenerate
          </NeumorphicButton>
          <NeumorphicButton
            onClick={onClose}
            variant="primary"
            size="md"
          >
            Close
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  );
}
