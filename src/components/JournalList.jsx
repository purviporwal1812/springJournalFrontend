import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, Calendar, Edit3, Trash2, ArrowLeft, SortAsc, SortDesc, AlertTriangle, User } from 'lucide-react';

const API_BASE_URL = 'https://springjournal.onrender.com';

const JournalList = () => {
    const [journals, setJournals] = useState([]);
    const [filteredJournals, setFilteredJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    const getJournalId = (journal, index) => {
        if (journal && journal.id) {
            if (typeof journal.id === 'object' && journal.id.$oid) return journal.id.$oid;
            return String(journal.id);
        }
        if (journal && journal._id) {
            if (typeof journal._id === 'object' && journal._id.$oid) return journal._id.$oid;
            return String(journal._id);
        }
        console.error('Journal is missing a valid ID:', journal);
        return `journal-${index}`;
    };

    // Fixed: Use JWT auth with Bearer token (consistent with Dashboard)
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

    // Helper function to handle API responses (same as Dashboard)
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

    const fetchJournals = async () => {
        setLoading(true);
        setError('');
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_BASE_URL}/journal`, { 
                method: 'GET',
                headers 
            });
            
            await handleApiResponse(response, 'Failed to fetch journals');
            
            const data = await response.json();
            setJournals(Array.isArray(data) ? data : []);
            console.log('Journals fetched successfully:', data);
        } catch (err) {
            console.error('Failed to fetch journals:', err);
            setError(`Failed to load journal entries: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteJournal = async (journalId) => {
        const headers = getAuthHeaders();
        if (!headers) return;

        try {
            const response = await fetch(`${API_BASE_URL}/journal/id/${journalId}`, {
                method: 'DELETE',
                headers
            });
            
            await handleApiResponse(response, 'Failed to delete journal');
            
            setJournals(prev => prev.filter((j, i) => getJournalId(j, i) !== journalId));
            setDeleteConfirm(null);
            console.log('Journal deleted successfully');
        } catch (err) {
            console.error('Failed to delete journal:', err);
            setError(`Failed to delete the journal entry: ${err.message}`);
        }
    };

    useEffect(() => {
        // Check authentication on component mount
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
            return;
        }
        
        fetchJournals();
    }, [navigate]);

    useEffect(() => {
        let processedJournals = [...journals];
        if (searchTerm) {
            processedJournals = processedJournals.filter(j =>
                (j.title && j.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (j.content && j.content.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        processedJournals.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        setFilteredJournals(processedJournals);
    }, [journals, searchTerm, sortOrder]);

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const truncateContent = (content, maxLength = 120) => {
        if (!content) return 'No content available...';
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full font-['Inter',_sans-serif] bg-gradient-to-br from-teal-50 via-white to-blue-50">
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
        <div className="min-h-screen w-full font-['Inter',_sans-serif] bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
            >
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link 
                                    to="/dashboard" 
                                    className="flex items-center text-gray-500 hover:text-teal-600 transition-colors group"
                                >
                                    <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                                    Back to Dashboard
                                </Link>
                                <div className="hidden lg:block">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="p-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg"
                                    >
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </motion.div>
                                </div>
                                <div>
                                    <h1 className="text-4xl lg:text-5xl font-['Dancing_Script',_cursive] text-gray-800">
                                        {username}'s Journal
                                    </h1>
                                    <p className="text-gray-600 mt-1">Your personal collection of thoughts and memories</p>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link to="/journal/new">
                                    <button className="flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg group">
                                        <Plus className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                        New Entry
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Search and Sort Controls */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search by title or content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200/50 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                className="flex items-center justify-center w-full lg:w-auto px-6 py-3 border-2 border-gray-200/50 rounded-xl hover:bg-white/80 transition-all duration-300 text-gray-700 font-medium shadow-sm"
                            >
                                {sortOrder === 'desc' ? <SortDesc className="h-5 w-5 mr-2" /> : <SortAsc className="h-5 w-5 mr-2" />}
                                <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.header>

                {/* Main Content */}
                <main>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border-l-4 border-red-400 text-red-700 p-6 rounded-xl mb-8 shadow-lg"
                        >
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Error</p>
                                    <p className="mt-1">{error}</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={fetchJournals}
                                        className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                                    >
                                        Try Again
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence>
                        {filteredJournals.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20 px-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20"
                            >
                                <BookOpen className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                                <h3 className="text-2xl font-['Dancing_Script',_cursive] text-gray-800 mb-3">
                                    {searchTerm ? 'No Entries Found' : 'Your Journal Awaits'}
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                                    {searchTerm ? 'Try adjusting your search terms or clear the search to see all entries.' : 'Every great story starts with a single word. Begin your journaling journey today and capture the moments that matter.'}
                                </p>
                                {!searchTerm && (
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link to="/journal/new">
                                            <button className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg font-medium">
                                                Create Your First Entry
                                            </button>
                                        </Link>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredJournals.map((journal, index) => {
                                    const journalId = getJournalId(journal, index);
                                    return (
                                        <motion.div
                                            key={journalId}
                                            layout
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
                                            whileHover={{ y: -5, scale: 1.02 }}
                                            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col border border-white/20 overflow-hidden group"
                                        >
                                            <div className="p-6 flex-grow">
                                                <div className="flex items-center text-sm text-gray-500 mb-3">
                                                    <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                                                    <span>{formatDate(journal.date)}</span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2 group-hover:text-teal-700 transition-colors">
                                                    {journal.title || 'Untitled Entry'}
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed text-sm h-20 overflow-hidden">
                                                    {truncateContent(journal.content)}
                                                </p>
                                            </div>
                                            <div className="border-t border-gray-100/50 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm flex justify-between items-center">
                                                <Link 
                                                    to={`/journal/view/${journalId}`} 
                                                    className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                                                >
                                                    Read More →
                                                </Link>
                                                <div className="flex items-center space-x-2">
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                        <Link 
                                                            to={`/journal/edit/${journalId}`} 
                                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-100/80 transition-all duration-300"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Link>
                                                    </motion.div>
                                                    <motion.button 
                                                        whileHover={{ scale: 1.1 }} 
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setDeleteConfirm(journalId)} 
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100/80 transition-all duration-300"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </motion.div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border border-white/20"
                        >
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                               <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-['Dancing_Script',_cursive] text-gray-900 mb-2">Delete Entry?</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Are you sure you want to delete this journal entry? This action cannot be undone and your memories will be lost forever.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <motion.button 
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDeleteConfirm(null)} 
                                    className="px-6 py-3 text-gray-800 bg-gray-200 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold shadow-sm"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => deleteJournal(deleteConfirm)} 
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 font-semibold shadow-lg"
                                >
                                    Delete Forever
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JournalList;