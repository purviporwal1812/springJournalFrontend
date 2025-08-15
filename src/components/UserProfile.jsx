import React, { useState, useEffect } from 'react';
import { User, Mail, Bell, Shield, Trash2, Save, Eye, EyeOff, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

const API_BASE_URL = 'https://springjournal.onrender.com';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: localStorage.getItem('username') || '',
    password: '',
    confirmPassword: ''
  });
  const [emailSettings, setEmailSettings] = useState({
    email: '',
    sentimentAnalysis: false,
    journalSummarization: false
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  // Get auth headers with JWT token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return null;
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Handle API responses with proper error handling
  const handleApiResponse = async (response, errorMessage) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      throw new Error('Authentication failed - please login again');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || errorMessage);
    }
    
    return response;
  };

  // Load current user data from backend
  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
        headers
      });

      await handleApiResponse(response, 'Failed to load user data');
      const userData = await response.json();
      
      setProfileData(prev => ({
        ...prev,
        username: userData.username || ''
      }));
      
      setEmailSettings({
        email: userData.email || '',
        sentimentAnalysis: userData.sentimentAnalysis || false,
        journalSummarization: userData.journalSummarization || false
      });
      
      // Update localStorage with current username
      localStorage.setItem('username', userData.username || '');
      
    } catch (error) {
      console.error('Load user data error:', error);
      showMessage('error', `Failed to load user data: ${error.message}`);
    } finally {
      setLoadingUserData(false);
    }
  };

  useEffect(() => {
    // Check authentication on component mount
    const token = localStorage.getItem('authToken');
    if (!token) {
      // In a real app, this would navigate to login
      showMessage('error', 'Please login to access your profile');
      return;
    }

    // Load user data from backend
    loadUserData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.password) {
      showMessage('error', 'Please enter a new password to update your profile');
      return;
    }
    
    if (profileData.password !== profileData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }
    
    if (profileData.password.length < 6) {
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
          password: profileData.password
        })
      });

      await handleApiResponse(response, 'Failed to update profile');

      // Update stored username
      localStorage.setItem('username', profileData.username);
      
      showMessage('success', 'Profile updated successfully!');
      setProfileData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage('error', `Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSettingsUpdate = async (e) => {
    e.preventDefault();
    
    if ((emailSettings.sentimentAnalysis || emailSettings.journalSummarization) && !emailSettings.email) {
      showMessage('error', 'Please enter an email address to enable notifications');
      return;
    }
    
    if (emailSettings.email && !isValidEmail(emailSettings.email)) {
      showMessage('error', 'Please enter a valid email address');
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
          email: emailSettings.email,
          sentimentAnalysis: emailSettings.sentimentAnalysis,
          journalSummarization: emailSettings.journalSummarization
        })
      });

      await handleApiResponse(response, 'Failed to update email settings');
      
      showMessage('success', 'Email settings updated successfully!');
    } catch (error) {
      console.error('Email settings update error:', error);
      showMessage('error', `Failed to update email settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
      showMessage('success', 'Account deleted successfully');
      // In a real app, this would navigate to login
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

  const navigateToDashboard = () => {
    // In a real app with router, this would navigate
    showMessage('info', 'Navigation to dashboard...');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'email', label: 'Email & Notifications', icon: Mail },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ];

  const username = profileData.username || 'User';

  if (loadingUserData) {
    return (
      <div className="min-h-screen w-full font-['Inter',_sans-serif] bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="text-gray-600">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-['Inter',_sans-serif] bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={navigateToDashboard}
                  className="flex items-center text-gray-500 hover:text-teal-600 transition-colors group mb-2"
                >
                  <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Dashboard
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="p-4 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
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
        </header>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {/* Message */}
          {message.text && (
            <div className={`mx-6 mt-6 px-6 py-4 rounded-xl flex items-start shadow-sm ${
              message.type === 'success' 
                ? 'bg-green-50 border-l-4 border-green-400 text-green-700'
                : message.type === 'info'
                ? 'bg-blue-50 border-l-4 border-blue-400 text-blue-700'
                : 'bg-red-50 border-l-4 border-red-400 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-medium">
                  {message.type === 'success' ? 'Success' : message.type === 'info' ? 'Info' : 'Error'}
                </span>
                <p className="mt-1">{message.text}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200/50">
            <nav className="flex space-x-8 px-8 pt-6">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-300 ${
                    activeTab === id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Profile Information</h2>
                <div className="space-y-6">
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
                        value={profileData.password}
                        onChange={(e) => setProfileData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
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
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
                  >
                    <Save size={16} />
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Email & Notifications</h2>
                
                <div className="space-y-6">
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
                      Required for email notifications and automated insights
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      🤖 AI-Powered Email Features
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Enable automated analysis of your journal entries. The system checks your entries every 10 minutes 
                      and sends insights based on your recent writing.
                    </p>

                    <div className="space-y-6">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="sentimentAnalysis"
                          checked={emailSettings.sentimentAnalysis}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, sentimentAnalysis: e.target.checked }))}
                          className="mt-1 mr-4 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div>
                          <label htmlFor="sentimentAnalysis" className="font-medium text-gray-700">
                            📊 Real-time Sentiment Analysis
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Receive email notifications about your dominant mood patterns when the system detects 
                            emotional trends in your recent journal entries (checked every 10 minutes).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="journalSummarization"
                          checked={emailSettings.journalSummarization}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, journalSummarization: e.target.checked }))}
                          className="mt-1 mr-4 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                        />
                        <div>
                          <label htmlFor="journalSummarization" className="font-medium text-gray-700">
                            📝 Automated Journal Summaries
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            Get AI-generated summaries of your recent journal entries delivered to your email. 
                            Summaries are created from entries written in the last 10 minutes and sent automatically.
                          </p>
                        </div>
                      </div>
                    </div>

                    {(emailSettings.sentimentAnalysis || emailSettings.journalSummarization) && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>Note:</strong> These features are currently running in test mode with 10-minute intervals. 
                          You'll receive notifications shortly after writing entries when these features are enabled.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEmailSettingsUpdate}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
                  >
                    <Bell size={16} />
                    {loading ? 'Saving...' : 'Save Email Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
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
                        🔒 <strong>Secure Storage:</strong> Your journal entries are privately stored and encrypted in MongoDB. 
                        Only you can access your personal writings through authenticated sessions.
                      </p>
                      <p>
                        🤖 <strong>AI Processing:</strong> When you enable sentiment analysis and summarization, 
                        your recent journal content (last 10 minutes) is processed by AI services to provide insights. 
                        Processed data is not permanently stored by the AI services.
                      </p>
                      <p>
                        📧 <strong>Email Delivery:</strong> Email notifications and summaries are sent directly 
                        to your provided email address using JavaMailSender and are not stored on our servers after delivery.
                      </p>
                      <p>
                        🛡️ <strong>Security:</strong> All data transmission is encrypted using HTTPS and we follow 
                        industry-standard security practices. Your authentication is handled via secure JWT tokens.
                      </p>
                      <p>
                        ⏰ <strong>Processing Schedule:</strong> The system currently checks for new entries every 
                        10 minutes to provide timely insights and summaries when enabled.
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
                            delete your profile, all journal entries, email preferences, and remove all associated 
                            data from our servers. This action cannot be undone.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all duration-300"
                          >
                            <Trash2 size={16} />
                            {loading ? 'Deleting...' : 'Delete Account'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;