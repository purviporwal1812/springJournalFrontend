import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  PlusCircle, 
  BookOpen, 
  RefreshCw, 
  LogOut, 
  Cloud, 
  Sun, 
  CloudRain,
  Calendar,
  Clock,
  Edit3
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [greetings, setGreetings] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = 'https://springjournal.onrender.com';

  // Helper function to get auth headers
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

  // Helper function to handle API responses
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

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) return;

      // Fetch weather data
      try {
        const weatherResponse = await fetch(`${API_BASE_URL}/user/weather`, {
          method: 'GET',
          headers: headers,
        });
        
        await handleApiResponse(weatherResponse, 'Failed to fetch weather data');
        
        const contentType = weatherResponse.headers.get('content-type');
        let weather;
        
        if (contentType && contentType.includes('application/json')) {
          weather = await weatherResponse.json();
        } else {
          weather = await weatherResponse.text();
        }
        
        setWeatherData(weather);
      } catch (error) {
        console.error('Weather fetch error:', error);
      }

      // Fetch greetings
      try {
        const greetingsResponse = await fetch(`${API_BASE_URL}/user/greetings`, {
          method: 'GET',
          headers: headers,
        });
        
        await handleApiResponse(greetingsResponse, 'Failed to fetch greetings');
        const greetingsText = await greetingsResponse.text();
        setGreetings(greetingsText);
      } catch (error) {
        console.error('Greetings fetch error:', error);
      }

      // Fetch journal entries
      try {
        const journalResponse = await fetch(`${API_BASE_URL}/journal`, {
          method: 'GET',
          headers: headers,
        });
        
        await handleApiResponse(journalResponse, 'Failed to fetch journal entries');
        
        const contentType = journalResponse.headers.get('content-type');
        let entries;
        
        if (contentType && contentType.includes('application/json')) {
          entries = await journalResponse.json();
        } else {
          const textResponse = await journalResponse.text();
          entries = [{ content: textResponse, title: 'Response', date: new Date().toISOString() }];
        }
        
        setJournalEntries(Array.isArray(entries) ? entries : [entries]);
      } catch (error) {
        console.error('Journal fetch error:', error);
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleNewEntry = () => {
    navigate('/journal/new');
  };

  const handleViewAllEntries = () => {
    navigate('/journal');
  };

  const handleRefreshData = () => {
    fetchDashboardData(true);
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getWeatherIcon = () => {
    if (!weatherData || typeof weatherData !== 'string') return <Cloud className="w-8 h-8 text-gray-400" />;
    
    const weather = weatherData.toLowerCase();
    if (weather.includes('sunny') || weather.includes('clear')) {
      return <Sun className="w-8 h-8 text-yellow-500" />;
    } else if (weather.includes('rain') || weather.includes('shower')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    } else {
      return <Cloud className="w-8 h-8 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"
        />
      </div>
    );
  }

  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 font-['Inter',_sans-serif]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="p-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-['Dancing_Script',_cursive] text-gray-800">
                  Welcome back, {username}!
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  {greetings || 'Ready to capture your thoughts today?'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewProfile}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl mb-8 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">Something went wrong</p>
                <p className="mt-1">{error}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchDashboardData()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
              >
                Retry
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-teal-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewEntry}
              className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg flex flex-col items-center gap-3 group"
            >
              <PlusCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-lg">New Journal Entry</span>
              <span className="text-sm text-teal-100">Start writing your thoughts</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAllEntries}
              className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg flex flex-col items-center gap-3 group"
            >
              <BookOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-lg">View All Entries</span>
              <span className="text-sm text-blue-100">Browse your journal history</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefreshData}
              disabled={refreshing}
              className={`p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex flex-col items-center gap-3 group ${refreshing ? 'opacity-75' : ''}`}
            >
              <RefreshCw className={`w-8 h-8 group-hover:scale-110 transition-transform ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-semibold text-lg">
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </span>
              <span className="text-sm text-purple-100">Update dashboard content</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weather Widget */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              {getWeatherIcon()}
              Today's Weather
            </h2>
            {weatherData ? (
              <div className="space-y-3">
                {typeof weatherData === 'string' ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                    {weatherData}
                  </p>
                ) : (
                  <pre className="text-sm text-gray-600 overflow-auto bg-gray-50 p-4 rounded-xl">
                    {JSON.stringify(weatherData, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Cloud className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Weather data unavailable</p>
              </div>
            )}
          </motion.div>

          {/* Journal Entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-teal-600" />
                Recent Journal Entries
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewAllEntries}
                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                View All →
              </motion.button>
            </div>
            
            {journalEntries && journalEntries.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {journalEntries.slice(0, 5).map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-4 border-teal-400 bg-gradient-to-r from-teal-50 to-transparent pl-6 py-4 rounded-r-xl hover:from-teal-100 transition-colors cursor-pointer group"
                    onClick={() => entry.id && navigate(`/journal/edit/${entry.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 transition-colors">
                        {entry.title || `Entry ${index + 1}`}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(entry.date || entry.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {entry.content 
                        ? entry.content.length > 120 
                          ? entry.content.substring(0, 120) + '...'
                          : entry.content
                        : 'No content available'
                      }
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No journal entries yet</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewEntry}
                  className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
                >
                  <PlusCircle className="w-5 h-5" />
                  Start Writing
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;