import { useState, useEffect } from 'react';
import UserSelection from './UserSelection';
import NeumorphicCard from './neumorphic/NeumorphicCard';
import NeumorphicButton from './neumorphic/NeumorphicButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export default function SetupFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [partnerUser, setPartnerUser] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState({
    doctor: 'en',
    patient: 'es'
  });

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setStep(3);
  };

  const handlePartnerSelect = (user) => {
    setPartnerUser(user);
    setStep(4);
  };

  const loadLanguages = async () => {
    try {
      const response = await fetch(`${API_URL}/languages`);
      if (!response.ok) throw new Error('Failed to load languages');
      const data = await response.json();
      setLanguages(data.languages);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const createConversation = async () => {
    try {
      const conversationData = {
        doctorId: role === 'doctor' ? selectedUser.id : partnerUser.id,
        patientId: role === 'patient' ? selectedUser.id : partnerUser.id,
        doctorLanguage: selectedLanguages.doctor,
        patientLanguage: selectedLanguages.patient
      };

      const response = await fetch(`${API_URL}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversationData)
      });

      if (!response.ok) throw new Error('Failed to create conversation');
      const conversation = await response.json();
      
      onComplete({
        conversation,
        role,
        user: selectedUser,
        partner: partnerUser
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation');
    }
  };

  // Step 1: Role Selection
  if (step === 1) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <NeumorphicCard className="p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Healthcare Translation
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Select your role to get started
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleRoleSelect('doctor')}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all group"
            >
              <div className="text-5xl mb-4">👨‍⚕️</div>
              <div className="text-xl font-bold text-gray-800 mb-2">Doctor</div>
              <div className="text-sm text-gray-600">
                I am a healthcare provider
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('patient')}
              className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all group"
            >
              <div className="text-5xl mb-4">🧑‍🦱</div>
              <div className="text-xl font-bold text-gray-800 mb-2">Patient</div>
              <div className="text-sm text-gray-600">
                I am seeking medical care
              </div>
            </button>
          </div>
        </NeumorphicCard>
      </div>
    );
  }

  // Step 2: User Selection
  if (step === 2) {
    return (
      <UserSelection
        role={role}
        onUserSelect={handleUserSelect}
      />
    );
  }

  // Step 3: Partner Selection
  if (step === 3) {
    return (
      <UserSelection
        role={role === 'doctor' ? 'patient' : 'doctor'}
        onUserSelect={handlePartnerSelect}
      />
    );
  }

  // Step 4: Language Selection
  if (step === 4) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <NeumorphicCard className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Select Languages
          </h2>

          <div className="space-y-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">👨‍⚕️</div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {role === 'doctor' ? selectedUser.name : partnerUser.name}
                  </div>
                  <div className="text-sm text-gray-600">Doctor</div>
                </div>
              </div>
              <select
                value={selectedLanguages.doctor}
                onChange={(e) => setSelectedLanguages({ ...selectedLanguages, doctor: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-blue-400 focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">🧑‍🦱</div>
                <div>
                  <div className="font-semibold text-gray-800">
                    {role === 'patient' ? selectedUser.name : partnerUser.name}
                  </div>
                  <div className="text-sm text-gray-600">Patient</div>
                </div>
              </div>
              <select
                value={selectedLanguages.patient}
                onChange={(e) => setSelectedLanguages({ ...selectedLanguages, patient: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-green-400 focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <NeumorphicButton
              onClick={() => setStep(3)}
              variant="secondary"
              className="w-32"
            >
              Back
            </NeumorphicButton>
            <NeumorphicButton
              onClick={createConversation}
              className="flex-1"
            >
              Start Conversation
            </NeumorphicButton>
          </div>
        </NeumorphicCard>
      </div>
    );
  }

  return null;
}
