import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  PlusCircle, 
  BookOpen, 
  RefreshCw, 
  LogOut, 
  Calendar,
  Clock,
  Edit3,
  TrendingUp,
  Heart,
  Star,
  Zap,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [greetings, setGreetings] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalEntries: 0,
    streak: 0,
    wordsWritten: 0
  });

  const API_BASE_URL = 'https://springjournal.onrender.com';

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  // Calculate stats from journal entries
  const calculateStats = (entries) => {
    const totalEntries = entries.length;
    const wordsWritten = entries.reduce((total, entry) => {
      if (entry.content) {
        return total + entry.content.split(' ').length;
      }
      return total;
    }, 0);
    
    // Calculate streak (simplified - consecutive days)
    let streak = 0;
    if (entries.length > 0) {
      streak = Math.min(entries.length, 7); // Max 7 day display
    }

    return { totalEntries, streak, wordsWritten };
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
        
        const entriesArray = Array.isArray(entries) ? entries : [entries];
        setJournalEntries(entriesArray);
        setStats(calculateStats(entriesArray));
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

  const getTimeBasedGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"
        />
      </div>
    );
  }

  const username = localStorage.getItem('username') || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 font-['Inter',_sans-serif] relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingVariants}
          animate="animate"
          className="absolute top-20 left-10 w-32 h-32 bg-teal-200/20 rounded-full blur-xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute top-40 right-20 w-24 h-24 bg-blue-200/20 rounded-full blur-xl"
        />
        <motion.div
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute bottom-32 left-1/3 w-40 h-40 bg-purple-200/20 rounded-full blur-xl"
        />
      </div>

      <motion.div 
        className="max-w-7xl mx-auto p-6 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden"
        >
          {/* Animated background gradient */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-blue-400/10 to-purple-400/10 bg-[length:200%_200%]"
          />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="p-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg relative"
              >
                <User className="w-8 h-8 text-white" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-['Dancing_Script',_cursive] text-gray-800"
                >
                  {getTimeBasedGreeting()}, {username}!
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 mt-1 text-lg flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • Ready to capture your thoughts today?
                </motion.p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleViewProfile}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all duration-300 shadow-lg flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
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
            exit={{ opacity: 0, scale: 0.9 }}
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

        {/* Stats Cards */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 right-2 text-teal-200"
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  {stats.totalEntries}
                </motion.p>
                <p className="text-gray-600 text-sm">Total Entries</p>
              </div>
            </div>
          </motion.div>

          {/* Inspirational Quote */}
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden flex flex-col justify-center items-center text-center"
          >
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-teal-200/20 to-blue-200/20 rounded-full blur-xl"
            />
            
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mb-3"
            >
              <Heart className="w-6 h-6 text-pink-400" />
            </motion.div>
            <motion.blockquote 
              className="text-sm  text-gray-700 italic leading-relaxed"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              "{greetings || 'Every word you write is a step towards understanding yourself better.'}"
            </motion.blockquote>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden"
          >
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 right-2 text-purple-300"
            >
              <Star className="w-6 h-6" />
            </motion.div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  {stats.wordsWritten}
                </motion.p>
                <p className="text-gray-600 text-sm">Words Written</p>
              </div>
            </div>
          </motion.div>
        </motion.div>


        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.005 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden"
        >
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 bg-gradient-to-r from-teal-400/5 via-blue-400/5 to-purple-400/5 bg-[length:300%_300%]"
          />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Edit3 className="w-6 h-6 text-teal-600" />
              </motion.div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewEntry}
                className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg flex flex-col items-center gap-3 group relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute top-2 right-2 opacity-20"
                >
                  <Heart className="w-4 h-4" />
                </motion.div>
                <PlusCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">New Journal Entry</span>
                <span className="text-sm text-teal-100">Start writing your thoughts</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleViewAllEntries}
                className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg flex flex-col items-center gap-3 group relative overflow-hidden"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-2 right-2 opacity-20"
                >
                  <Target className="w-4 h-4" />
                </motion.div>
                <BookOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-lg">View All Entries</span>
                <span className="text-sm text-blue-100">Browse your journal history</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefreshData}
                disabled={refreshing}
                className={`p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex flex-col items-center gap-3 group relative overflow-hidden ${refreshing ? 'opacity-75' : ''}`}
              >
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-2 right-2 opacity-20"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <RefreshCw className={`w-8 h-8 group-hover:scale-110 transition-transform ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold text-lg">
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </span>
                <span className="text-sm text-purple-100">Update dashboard content</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Journal Entries */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.002 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-r from-teal-200/20 to-blue-200/20 rounded-full blur-xl"
          />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="w-6 h-6 text-teal-600" />
              </motion.div>
              Recent Journal Entries
            </h2>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleViewAllEntries}
              className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
            >
              View All 
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </motion.button>
          </div>
          
          {journalEntries && journalEntries.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {journalEntries.slice(0, 5).map((entry, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="border-l-4 border-teal-400 bg-gradient-to-r from-teal-50 to-transparent pl-6 py-4 rounded-r-xl hover:from-teal-100 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => entry.id && navigate(`/journal/edit/${entry.id}`)}
                >
                  <motion.div
                    className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                  >
                    <Edit3 className="w-4 h-4 text-teal-500" />
                  </motion.div>
                  
                  <div className="flex justify-between items-start mb-2 pr-8">
                    <motion.h3 
                      whileHover={{ color: '#0d9488' }}
                      className="font-semibold text-gray-800 group-hover:text-teal-700 transition-colors"
                    >
                      {entry.title || `Entry ${index + 1}`}
                    </motion.h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(entry.date || entry.createdAt)}</span>
                    </div>
                  </div>
                  <motion.p 
                    className="text-gray-600 text-sm leading-relaxed"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {entry.content 
                      ? entry.content.length > 120 
                        ? entry.content.substring(0, 120) + '...'
                        : entry.content
                      : 'No content available'
                    }
                  </motion.p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <p className="text-gray-500 text-lg mb-4">No journal entries yet</p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}
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
      </motion.div>
    </div>
  );
};

export default Dashboard;