import { useState, useEffect } from 'react';
import NeumorphicCard from './neumorphic/NeumorphicCard';
import NeumorphicButton from './neumorphic/NeumorphicButton';
import NeumorphicInput from './neumorphic/NeumorphicInput';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export default function UserSelection({ role, onUserSelect, onCreateNew }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    language: 'en'
  });
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    loadUsers();
    loadLanguages();
  }, [role]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users?role=${role}`);
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
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

  const createUser = async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUserData,
          role: role
        })
      });
      if (!response.ok) throw new Error('Failed to create user');
      const newUser = await response.json();
      setUsers([newUser, ...users]);
      setShowCreateForm(false);
      setNewUserData({ name: '', language: 'en' });
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const handleSelectUser = () => {
    const user = users.find(u => u.id === selectedUserId);
    if (user) {
      onUserSelect(user);
    }
  };

  const handleCreateAndSelect = async () => {
    const newUser = await createUser();
    if (newUser) {
      onUserSelect(newUser);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <NeumorphicCard className="p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Select {role === 'doctor' ? 'Doctor' : 'Patient'}
        </h2>

        {!showCreateForm ? (
          <>
            <NeumorphicInput
              placeholder={`Search by name or ID...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-6"
            />

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No {role}s found
                  </div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedUserId === user.id
                          ? 'bg-blue-50 border-2 border-blue-400'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {user.uniqueId} • Language: {user.language.toUpperCase()}
                          </div>
                        </div>
                        {selectedUserId === user.id && (
                          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="flex gap-3">
              <NeumorphicButton
                onClick={handleSelectUser}
                disabled={!selectedUserId}
                className="flex-1"
              >
                Continue with Selected
              </NeumorphicButton>
              <NeumorphicButton
                onClick={() => setShowCreateForm(true)}
                variant="secondary"
              >
                Create New {role === 'doctor' ? 'Doctor' : 'Patient'}
              </NeumorphicButton>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <NeumorphicInput
                placeholder="Enter full name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language
              </label>
              <select
                value={newUserData.language}
                onChange={(e) => setNewUserData({ ...newUserData, language: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-200 focus:border-blue-400 focus:outline-none"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <NeumorphicButton
                onClick={handleCreateAndSelect}
                disabled={!newUserData.name.trim()}
                className="flex-1"
              >
                Create & Continue
              </NeumorphicButton>
              <NeumorphicButton
                onClick={() => {
                  setShowCreateForm(false);
                  setNewUserData({ name: '', language: 'en' });
                }}
                variant="secondary"
              >
                Cancel
              </NeumorphicButton>
            </div>
          </div>
        )}
      </NeumorphicCard>
    </div>
  );
}
