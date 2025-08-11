import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Bell, Shield, Trash2, Save, Eye, EyeOff, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const API_BASE_URL = 'https://springjournal.onrender.com';

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: localStorage.getItem('username') || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailSettings, setEmailSettings] = useState({
    email: '',
    enableWeeklyEmails: false,
    enableSentimentAnalysis: false,
    enableJournalSummarization: false,
    emailFrequency: 'weekly'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Fixed: Use JWT auth with Bearer token (consistent with other components)
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      navigate('/login');
      return null;
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Helper function to handle API responses (same as other components)
  const handleApiResponse = async (response, errorMessage) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      navigate('/login');
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || errorMessage);
    }
    
    return response;
  };

  useEffect(() => {
    // Check authentication on component mount
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load saved email settings from localStorage
    const savedEmailSettings = localStorage.getItem('emailSettings');
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }
  }, [navigate]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.newPassword) {
      showMessage('error', 'Please enter a new password to update your profile');
      return;
    }
    
    if (profileData.newPassword !== profileData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    
    if (profileData.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          username: profileData.username,
          password: profileData.newPassword
        })
      });

      await handleApiResponse(response, 'Failed to update profile');

      // Update stored username
      localStorage.setItem('username', profileData.username);
      
      showMessage('success', 'Profile updated successfully!');
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage('error', `Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSettingsUpdate = (e) => {
    e.preventDefault();
    
    if (emailSettings.enableWeeklyEmails && !emailSettings.email) {
      showMessage('error', 'Please enter an email address to enable weekly emails');
      return;
    }
    
    if (emailSettings.email && !isValidEmail(emailSettings.email)) {
      showMessage('error', 'Please enter a valid email address');
      return;
    }

    // Save to localStorage (in a real app, this would go to backend)
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
    showMessage('success', 'Email settings saved successfully!');
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your journal entries.'
    );
    
    if (!confirmDelete) return;
    
    const finalConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    );
    
    if (finalConfirm !== 'DELETE') {
      showMessage('error', 'Account deletion cancelled');
      return;
    }

    setLoading(true);
    
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'DELETE',
        headers
      });

      await handleApiResponse(response, 'Failed to delete account');

      // Clear all local storage
      localStorage.clear();
      // Redirect to login
      navigate('/login');
      showMessage('success', 'Account deleted successfully');
    } catch (error) {
      console.error('Account deletion error:', error);
      showMessage('error', `Failed to delete account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'email', label: 'Email & Notifications', icon: Mail },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="min-h-screen w-full font-['Inter',_sans-serif] bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center text-gray-500 hover:text-teal-600 transition-colors group mb-2"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-['Dancing_Script',_cursive] text-gray-800">
                  {username}'s Profile
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Message */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`mx-6 mt-6 px-6 py-4 rounded-xl flex items-start shadow-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-l-4 border-green-400 text-green-700'
                    : 'bg-red-50 border-l-4 border-red-400 text-red-700'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-medium">
                    {message.type === 'success' ? 'Success' : 'Error'}
                  </span>
                  <p className="mt-1">{message.text}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="border-b border-gray-200/50">
            <nav className="flex space-x-8 px-8 pt-6">
              {tabs.map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                    activeTab === id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </motion.button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={profileData.newPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="Enter new password"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={profileData.confirmPassword}
                          onChange={(e) => setProfileData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                          placeholder="Confirm new password"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </motion.button>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
                    >
                      <Save size={16} />
                      {loading ? 'Updating...' : 'Update Profile'}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Email & Notifications</h2>
                  <form onSubmit={handleEmailSettingsUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={emailSettings.email}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="your.email@example.com"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Required for email notifications and weekly summaries
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="weeklyEmails"
                          checked={emailSettings.enableWeeklyEmails}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, enableWeeklyEmails: e.target.checked }))}
                          className="mt-1 mr-4 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div>
                          <label htmlFor="weeklyEmails" className="font-medium text-gray-700">
                            Weekly Email Summaries
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Receive a weekly summary of your journal entries and writing progress
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="sentimentAnalysis"
                          checked={emailSettings.enableSentimentAnalysis}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, enableSentimentAnalysis: e.target.checked }))}
                          className="mt-1 mr-4 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div>
                          <label htmlFor="sentimentAnalysis" className="font-medium text-gray-700">
                            Sentiment Analysis
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Include mood analysis and emotional insights in your weekly summaries
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="journalSummarization"
                          checked={emailSettings.enableJournalSummarization}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, enableJournalSummarization: e.target.checked }))}
                          className="mt-1 mr-4 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div>
                          <label htmlFor="journalSummarization" className="font-medium text-gray-700">
                            Journal Summarization
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Get AI-generated summaries of your weekly journal entries
                          </p>
                        </div>
                      </div>
                    </div>

                    {emailSettings.enableWeeklyEmails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Frequency
                        </label>
                        <select
                          value={emailSettings.emailFrequency}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, emailFrequency: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="bi-weekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
                    >
                      <Bell size={16} />
                      Save Email Settings
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal-600" />
                        Data & Privacy
                      </h3>
                      <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                        <p>
                          🔒 Your journal entries are private and securely stored. Only you can access your personal writings.
                        </p>
                        <p>
                          🤖 When you enable sentiment analysis and summarization, your journal content is processed 
                          by AI services to provide insights, but this data is not stored permanently.
                        </p>
                        <p>
                          📧 Email summaries are sent directly to your provided email address and are not stored 
                          on our servers after delivery.
                        </p>
                        <p>
                          🛡️ All data transmission is encrypted and we follow industry-standard security practices.
                        </p>
                      </div>
                    </div>

                    <div className="border-t-2 border-red-200 pt-8">
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-red-800 mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Danger Zone
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
                            <p className="text-sm text-red-600 mb-6 leading-relaxed">
                              Once you delete your account, there is no going back. This will permanently 
                              delete your profile, all journal entries, and remove all associated data from our servers.
                              This action cannot be undone.
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleDeleteAccount}
                              disabled={loading}
                              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
                            >
                              <Trash2 size={16} />
                              {loading ? 'Deleting...' : 'Delete Account'}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;