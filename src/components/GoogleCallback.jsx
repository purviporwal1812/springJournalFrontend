import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const hasProcessed = useRef(false);
    const redirectTimeout = useRef(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://springjournal.onrender.com';

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (redirectTimeout.current) {
                clearTimeout(redirectTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleCallback = async () => {
            // Prevent duplicate requests in React StrictMode
            if (hasProcessed.current) {
                return;
            }
            hasProcessed.current = true;

            const code = searchParams.get('code');
            const error = searchParams.get('error');

            if (error) {
                console.error('OAuth error from Google:', error);
                setStatus('error');
                setErrorMessage('Google authentication was cancelled or failed.');
                redirectTimeout.current = setTimeout(() => navigate('/login', { replace: true }), 3000);
                return;
            }

            if (!code) {
                console.error('No authorization code received');
                setStatus('error');
                setErrorMessage('No authorization code received from Google.');
                redirectTimeout.current = setTimeout(() => navigate('/login', { replace: true }), 3000);
                return;
            }

            try {                
                // Send the authorization code to your backend
                const response = await fetch(`${API_BASE_URL}/auth/google/callback?code=${encodeURIComponent(code)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                console.log('Backend response status:', response.status);

                if (response.ok) {
                    const data = await response.json();
                    
                    const token = data.token;
                    
                    if (token) {
                        // FIX: Store token with the correct key that Dashboard expects
                        localStorage.setItem('authToken', token); // Changed from 'token' to 'authToken'
                        
                        // Store user info if available
                        if (data.user) {
                            localStorage.setItem('user', JSON.stringify(data.user));
                            // Extract username from user data if available
                            if (data.user.username || data.user.name || data.user.email) {
                                localStorage.setItem('username', data.user.username || data.user.name || data.user.email);
                            }
                        }
                        
                        // Set authentication flags
                        localStorage.setItem('isAuthenticated', 'true');
                        localStorage.setItem('authMethod', 'oauth');
                        
                        // Dispatch a custom event to notify auth context of login
                        window.dispatchEvent(new CustomEvent('authStateChange', {
                            detail: { 
                                isAuthenticated: true, 
                                token: token,
                                user: data.user || null
                            }
                        }));
                        
                        setStatus('success');
                        
                        // Redirect to dashboard after a short delay
                        redirectTimeout.current = setTimeout(() => {
                            navigate('/dashboard', { replace: true });
                        }, 1500);
                        
                    } else {
                        console.error('No token in response:', data);
                        throw new Error('No token received from backend');
                    }
                } else {
                    // Log the full response for debugging
                    const responseText = await response.text();
                    console.error('Backend error response:', {
                        status: response.status,
                        statusText: response.statusText,
                        body: responseText
                    });

                    // Try to parse error response as JSON first, then fall back to text
                    let errorMessage = 'Authentication failed';
                    try {
                        const errorData = JSON.parse(responseText);
                        errorMessage = errorData.error || errorData.message || errorMessage;
                    } catch {
                        errorMessage = responseText || errorMessage;
                    }
                    
                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error('Google OAuth callback error:', error);
                setStatus('error');
                setErrorMessage(error.message || 'Failed to authenticate with Google. Please try again.');
                redirectTimeout.current = setTimeout(() => navigate('/login', { replace: true }), 5000);
            }
        };

        handleCallback();
    }, [searchParams, navigate, API_BASE_URL]);


    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <>
                        <div className="text-teal-500">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-16 h-16 mx-auto border-4 border-t-4 border-gray-200 border-t-teal-500 rounded-full"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Signing you in...</h1>
                        <p className="text-gray-600">
                            Please wait while we complete your Google authentication.
                        </p>
                    </>
                );
            
            case 'success':
                return (
                    <>
                        <div className="text-green-500">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.5, type: "spring" }}
                            >
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </motion.div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Success!</h1>
                        <p className="text-gray-600">
                            Authentication successful! Redirecting to dashboard...
                        </p>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div 
                                    className="bg-teal-500 h-2 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5 }}
                                />
                            </div>
                        </div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="mt-4"
                        >
                           
                        </motion.div>
                    </>
                );
            
            case 'error':
                return (
                    <>
                        <div className="text-red-500">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Authentication Failed</h1>
                        <p className="text-gray-600">
                            {errorMessage}
                        </p>
                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={() => navigate('/login', { replace: true })}
                                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                            >
                                Back to Login
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Redirecting to login page in 5 seconds...
                        </p>
                        {/* Debug info in development */}
                        {import.meta.env.DEV && (
                            <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs">
                                <p><strong>Debug Info:</strong></p>
                                <p>API URL: {API_BASE_URL}</p>
                                <p>Code present: {searchParams.get('code') ? 'Yes' : 'No'}</p>
                                <p>Error param: {searchParams.get('error') || 'None'}</p>
                                <p>Processed: {hasProcessed.current ? 'Yes' : 'No'}</p>
                                <p>Current location: {location.pathname}</p>
                                <p>Token in localStorage: {localStorage.getItem('authToken') ? 'Yes' : 'No'}</p>
                                <p>Username in localStorage: {localStorage.getItem('username') ? 'Yes' : 'No'}</p>
                            </div>
                        )}
                    </>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-full font-['Inter',_sans-serif] p-4 bg-gray-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-2xl shadow-2xl"
            >
                {renderContent()}
            </motion.div>
        </div>
    );
};

export default GoogleCallback;