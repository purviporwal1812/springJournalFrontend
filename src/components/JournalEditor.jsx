import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ArrowLeft, BookOpen, Calendar, X, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://springjournal.onrender.com';

const JournalEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [journalData, setJournalData] = useState({
        title: '',
        content: '',
        date: new Date().toISOString().slice(0, 16)
    });
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fixed: Use 'authToken' key and Bearer format (consistent with Dashboard)
    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No auth token found');
            navigate('/login');
            return null;
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Fixed: Use Bearer instead of Basic
        };
    };

    // Helper function to handle API responses (same as Dashboard)
    const handleApiResponse = async (response, errorMessage) => {
        if (response.status === 401 || response.status === 403) {
            // Token might be expired or invalid
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
        const fetchJournalById = async () => {
            if (!isEditing || !id) return;

            setLoading(true);
            setError('');
            const headers = getAuthHeaders();
            if (!headers) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/journal/id/${id}`, { 
                    method: 'GET',
                    headers 
                });
                
                await handleApiResponse(response, `Failed to load journal with ID ${id}`);
                
                const journal = await response.json();
                setJournalData({
                    title: journal.title || '',
                    content: journal.content || '',
                    date: journal.date ? new Date(journal.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
                });
                console.log('Journal loaded successfully:', journal);
            } catch (err) {
                console.error('Failed to load journal:', err);
                setError(`Failed to load journal entry: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchJournalById();
    }, [id, isEditing, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setJournalData(prev => ({ ...prev, [name]: value }));
        // Clear any existing errors when user starts typing
        if (error) setError('');
    };

    const handleSave = async () => {
        if (!journalData.title.trim() || !journalData.content.trim()) {
            setError('Please provide a title and some content for your entry.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        const headers = getAuthHeaders();
        if (!headers) {
            setSaving(false);
            return;
        }

        const body = JSON.stringify({
            title: journalData.title.trim(),
            content: journalData.content.trim(),
            date: new Date(journalData.date).toISOString()
        });

        const url = isEditing ? `${API_BASE_URL}/journal/id/${id}` : `${API_BASE_URL}/journal`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            console.log(`${isEditing ? 'Updating' : 'Creating'} journal entry...`);
            const response = await fetch(url, { method, headers, body });
            
            await handleApiResponse(response, `Failed to ${isEditing ? 'update' : 'save'} journal entry`);
            
            setSuccess(`Journal ${isEditing ? 'updated' : 'saved'} successfully!`);
            console.log(`Journal ${isEditing ? 'updated' : 'saved'} successfully`);
            
            // Navigate back to journal list after a short delay
            setTimeout(() => navigate('/journal'), 1500);
        } catch (err) {
            console.error('Save operation failed:', err);
            setError(`Failed to save journal: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const getWordCount = () => {
        if (!journalData.content) return 0;
        return journalData.content.trim().split(/\s+/).filter(Boolean).length;
    };

    // Check authentication on component mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full font-['Inter',_sans-serif] bg-gradient-to-br from-teal-50 via-white to-blue-50">
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-center text-gray-500"
                >
                    <BookOpen className="w-12 h-12 text-teal-500 mx-auto mb-4" />
                    <p className="text-lg">Loading editor...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full font-['Inter',_sans-serif] bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"
            >
                {/* Header */}
                <header className="p-6 border-b border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <Link 
                            to="/journal" 
                            className="flex items-center text-sm text-gray-500 hover:text-teal-600 transition-colors mb-2 group"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Journal List
                        </Link>
                        <h1 className="text-4xl sm:text-5xl font-['Dancing_Script',_cursive] text-gray-800">
                            {isEditing ? 'Edit Your Story' : 'A New Chapter'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEditing ? 'Refine your thoughts and memories' : 'Capture this moment in time'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/journal')}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold shadow-sm"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center px-6 py-2 text-sm bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-pulse' : ''}`} />
                            {saving ? 'Saving...' : 'Save Entry'}
                        </motion.button>
                    </div>
                </header>

                {/* Editor Body */}
                <div className="p-6">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-xl mb-6 text-sm flex items-start shadow-sm"
                            >
                                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium">Error</span>
                                    <p className="mt-1">{error}</p>
                                </div>
                            </motion.div>
                        )}
                        {success && (
                             <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded-xl mb-6 text-sm flex items-start shadow-sm"
                            >
                                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium">Success</span>
                                    <p className="mt-1">{success}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6">
                        <motion.input
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            type="text"
                            name="title"
                            value={journalData.title}
                            onChange={handleInputChange}
                            placeholder="Give your entry a title..."
                            className="w-full text-2xl font-bold p-4 border-2 border-gray-200/50 focus:border-teal-400 rounded-xl outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                        />
                        <motion.textarea
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            name="content"
                            value={journalData.content}
                            onChange={handleInputChange}
                            rows={18}
                            placeholder="Let your thoughts flow... What's on your mind today?"
                            className="w-full p-4 text-base leading-relaxed text-gray-700 bg-white/50 backdrop-blur-sm rounded-xl border-2 border-gray-200/50 focus:ring-2 focus:ring-teal-400 focus:border-teal-400 outline-none transition-all duration-300 resize-none"
                            style={{ minHeight: '400px' }}
                        />
                    </div>
                </div>
                
                {/* Footer */}
                <footer className="p-6 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm rounded-b-2xl border-t border-gray-200/50 text-sm text-gray-600 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                            <input
                                type="datetime-local"
                                name="date"
                                value={journalData.date}
                                onChange={handleInputChange}
                                className="bg-transparent outline-none text-gray-600 font-medium"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                            {getWordCount()} words
                        </span>
                        <span className="text-gray-400">
                            {journalData.content.length} characters
                        </span>
                    </div>
                </footer>
            </motion.div>
        </div>
    );
};

export default JournalEditor;