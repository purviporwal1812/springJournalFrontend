import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import Input from "../components/Input"

const LoginPage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_BASE_URL = 'https://springjournal.onrender.com';
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!values.username.trim()) newErrors.username = 'Username is required';
    if (!values.password.trim()) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/public/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password
        })
      });

      if (response.ok) {
        const token = await response.text(); // Backend returns JWT as plain text
        
        // Store token with the same key used in Dashboard
        localStorage.setItem('authToken', token); // Changed from 'token' to 'authToken'
        localStorage.setItem('username', values.username);
        
        console.log('Login successful for user:', values.username);
        
        navigate('/dashboard');
      } else if (response.status === 400 || response.status === 401) {
        const errorMessage = await response.text();
        
        // Check if user doesn't exist
        if (errorMessage.toLowerCase().includes('incorrect username') || 
            errorMessage.toLowerCase().includes('user not found') ||
            errorMessage.toLowerCase().includes('bad credentials')) {
          setErrors({ 
            general: 'Account not found. Please sign up first or check your username.' 
          });
        } else {
          setErrors({ 
            general: 'Invalid username or password. Please try again.' 
          });
        }
      } else if (response.status === 403) {
        setErrors({ 
          general: 'Access denied. Please check your credentials.' 
        });
      } else {
        setErrors({ 
          general: 'Login failed. Please try again later.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.name === 'NetworkError' || !navigator.onLine) {
        setErrors({ 
          general: 'Network error. Please check your connection and try again.' 
        });
      } else {
        setErrors({ 
          general: 'Something went wrong. Please try again.' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUri = encodeURIComponent(`https://spring-journal-web-app.vercel.app/auth/google/callback`);
    const scope = encodeURIComponent('openid email profile');
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
    window.location.href = googleAuthUrl;
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen w-full font-['Inter',_sans-serif] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl border-t-4 border-[var(--color-teal-300)]"
        >
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block p-3 bg-teal-100 rounded-full mb-4"
            >
              <User className="w-10 h-10 text-teal-600" />
            </motion.div>
            <h1 className="text-5xl font-['Dancing_Script',_cursive] text-gray-800">
              Welcome Back!
            </h1>
            <p className="text-gray-500 mt-2">
              Sign in to continue your journal journey.
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {errors.general && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            <Input
              id="username"
              name="username"
              type="text"
              label="Username"
              value={values.username}
              onChange={handleChange}
              error={errors.username}
              disabled={isSubmitting}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              disabled={isSubmitting}
            />

            <div className="text-right text-sm">
              <a href="#" className="font-medium text-teal-600 hover:text-teal-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={isSubmitting} className={`
              w-full py-3 px-4 rounded-lg font-semibold text-white
              bg-teal-500 hover:bg-teal-600 focus:outline-none
              focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
              transition-all duration-300 transform hover:scale-105
              ${isSubmitting ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}
            `}>
              {isSubmitting ? 'Signing In...' : 'Login'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <a href="/signup" className="font-semibold text-teal-600 hover:underline">
                Sign up
              </a>
            </p>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;