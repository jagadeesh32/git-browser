import React, { useState, useEffect } from 'react';
import { gitApi } from '../services/api';
import { VscSettingsGear, VscSave } from 'react-icons/vsc';

const SettingsPage = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const nameRes = await gitApi.getConfig('user.name');
      const emailRes = await gitApi.getConfig('user.email');
      setUserName(nameRes.value || '');
      setUserEmail(emailRes.value || '');
    } catch (err) {
      console.error('Failed to load config', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await gitApi.setConfig('user.name', userName);
      await gitApi.setConfig('user.email', userEmail);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading settings...</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] transition-colors duration-200">
      <div className="p-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <VscSettingsGear className="text-2xl text-gray-500 dark:text-gray-400 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Settings</h1>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded border ${message.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'
            }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#252526] p-6 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-300 mb-4">User Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white dark:bg-[#3c3c3c] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                  placeholder="John Doe"
                />
                <p className="mt-1 text-xs text-gray-500">This name will be used for your commits.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-white dark:bg-[#3c3c3c] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                  placeholder="john@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">This email will be used for your commits.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`
                flex items-center px-6 py-2 rounded font-medium text-white transition-colors
                ${saving ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}
              `}
            >
              <VscSave className="mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
