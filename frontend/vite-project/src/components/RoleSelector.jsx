/**
 * RoleSelector Component
 * Allows user to select their role (Doctor/Patient) and languages
 * Now with neumorphic design
 */

import { useState, useEffect } from 'react';
import { getLanguages, createConversation } from '../services/api';
import NeumorphicCard from './neumorphic/NeumorphicCard';
import NeumorphicButton from './neumorphic/NeumorphicButton';

export default function RoleSelector({ onConversationStart }) {
  const [languages, setLanguages] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [doctorLanguage, setDoctorLanguage] = useState('en');
  const [patientLanguage, setPatientLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available languages on mount
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await getLanguages();
        setLanguages(response.languages);
      } catch (err) {
        setError('Failed to load languages');
      }
    }
    fetchLanguages();
  }, []);

  const handleStartConversation = async () => {
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const conversation = await createConversation(doctorLanguage, patientLanguage);
      onConversationStart(conversation, selectedRole);
    } catch (err) {
      setError(err.message || 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neu-bg flex items-center justify-center p-6">
      <NeumorphicCard className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neu-bg shadow-neu mb-4">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Healthcare Translation
          </h1>
          <p className="text-gray-600">
            Select your role and languages to begin
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Select Your Role
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole('doctor')}
              className={`p-6 rounded-2xl transition-all duration-300 ${
                selectedRole === 'doctor'
                  ? 'bg-neu-accent text-white shadow-neu'
                  : 'bg-neu-bg text-gray-700 shadow-neu hover:shadow-neu-hover'
              }`}
            >
              <div className="text-4xl mb-3">👨‍⚕️</div>
              <div className="font-semibold text-lg">Doctor</div>
            </button>
            <button
              onClick={() => setSelectedRole('patient')}
              className={`p-6 rounded-2xl transition-all duration-300 ${
                selectedRole === 'patient'
                  ? 'bg-neu-success text-white shadow-neu'
                  : 'bg-neu-bg text-gray-700 shadow-neu hover:shadow-neu-hover'
              }`}
            >
              <div className="text-4xl mb-3">🧑</div>
              <div className="font-semibold text-lg">Patient</div>
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Doctor's Language
            </label>
            <select
              value={doctorLanguage}
              onChange={(e) => setDoctorLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-neu-bg rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-neu-accent/30 text-gray-700"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Patient's Language
            </label>
            <select
              value={patientLanguage}
              onChange={(e) => setPatientLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-neu-bg rounded-xl shadow-neu-inset focus:outline-none focus:ring-2 focus:ring-neu-success/30 text-gray-700"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-neu-danger/10 rounded-xl shadow-neu-inset">
            <p className="text-neu-danger text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Start Button */}
        <NeumorphicButton
          onClick={handleStartConversation}
          disabled={loading || !selectedRole}
          variant="primary"
          size="lg"
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Starting...
            </span>
          ) : (
            'Start Conversation'
          )}
        </NeumorphicButton>

        {/* Footer Note */}
        <p className="mt-6 text-xs text-gray-400 text-center">
          Authentication not required in MVP
        </p>
      </NeumorphicCard>
    </div>
  );
}
