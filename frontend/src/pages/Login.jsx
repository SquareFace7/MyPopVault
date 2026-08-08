import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Package, Sparkles, LogIn, UserPlus, Zap, Check, X } from 'lucide-react';
import PopArtBackground from '@/components/PopArtBackground';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const lastToastTimeRef = useRef(0);

  const handleEnglishOnlyInput = (value, setter) => {
    // Regex for non-printable ASCII or non-English characters (anything outside ASCII 32-126)
    const nonEnglishRegex = /[^\x20-\x7E]/g;

    if (nonEnglishRegex.test(value)) {
      const cleanValue = value.replace(nonEnglishRegex, '');
      setter(cleanValue);

      const now = Date.now();
      if (now - lastToastTimeRef.current > 2500) {
        lastToastTimeRef.current = now;
        toast.error('🌍 Please use English keyboard only. Foreign characters are not allowed.', {
          id: 'english-only-toast',
          duration: 4000,
          style: {
            border: '4px solid #1f2937',
            padding: '16px',
            color: '#1f2937',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
          }
        });
      }
    } else {
      setter(value);
    }
  };

  const passwordRules = [
    { id: 'length', label: '8+ characters', met: password.length >= 8 },
    { id: 'uppercase', label: '1 uppercase (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: '1 lowercase (a-z)', met: /[a-z]/.test(password) },
    { id: 'number', label: '1 number (0-9)', met: /\d/.test(password) },
    { id: 'special', label: '1 special (!@#$...)', met: /[^A-Za-z0-9]/.test(password) }
  ];

  useEffect(() => {
    if (location.state?.activeTab === 'signup') {
      setMode('signup');
    } else if (location.state?.activeTab === 'login') {
      setMode('login');
    }
  }, [location.state]);

  useEffect(() => {
    const verified = searchParams.get('verified');
    const errorParam = searchParams.get('error');

    if (verified === 'true') {
      toast.success('✉️ Email verified successfully! You can now log in.', {
        duration: 6000,
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      setSearchParams({});
    } else if (verified === 'false') {
      let message = 'Verification failed. The link might be invalid or expired.';
      if (errorParam === 'invalid_token') {
        message = 'Verification failed: Invalid or expired verification token.';
      }
      toast.error(`⚠️ ${message}`, {
        duration: 6000,
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('at least one uppercase letter (A-Z)');
    if (!/[a-z]/.test(pwd)) errors.push('at least one lowercase letter (a-z)');
    if (!/\d/.test(pwd)) errors.push('at least one number (0-9)');
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('at least one special character (e.g. !@#$%^&*)');

    if (errors.length > 0) {
      return `Password must contain ${errors.join(', ')}.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      // Validate matching passwords
      if (password !== confirmPassword) {
        const matchMsg = '🔒 Passwords do not match. Please check and try again.';
        setError(matchMsg);
        toast.error(matchMsg, {
          style: {
            border: '4px solid #1f2937',
            padding: '16px',
            color: '#1f2937',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
          }
        });
        return;
      }

      // Validate password policy strength
      const pwdErr = validatePassword(password);
      if (pwdErr) {
        const strengthMsg = `🛡️ ${pwdErr}`;
        setError(strengthMsg);
        toast.error(strengthMsg, {
          duration: 6000,
          style: {
            border: '4px solid #1f2937',
            padding: '16px',
            color: '#1f2937',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
          }
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('👋 Welcome back to the vault!', {
          duration: 4000,
          style: {
            border: '4px solid #1f2937',
            padding: '16px',
            color: '#1f2937',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
          }
        });
      } else {
        await register(username, email, password);
        toast.success('🎉 Vault created successfully!', {
          duration: 4000,
          style: {
            border: '4px solid #1f2937',
            padding: '16px',
            color: '#1f2937',
            fontWeight: 'bold',
            borderRadius: '16px',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
          }
        });
      }
      navigate('/Dashboard');
    } catch (err) {
      console.error('Auth Error:', err);
      let userFriendlyMessage = err.message || 'Authentication failed. Please check your credentials.';
      
      if (err.message && err.message.toLowerCase().includes('email is already in use')) {
        userFriendlyMessage = '✉️ That email address is already in use. Please try another email or log in.';
      } else if (err.message && err.message.toLowerCase().includes('username is already in use')) {
        userFriendlyMessage = '👤 That username is already in use. Please select a different username.';
      } else if (err.message && err.message.toLowerCase().includes('username contains reserved or restricted words')) {
        userFriendlyMessage = '🛡️ This username contains reserved words. Please choose a different name.';
      }
      
      setError(userFriendlyMessage);
      toast.error(userFriendlyMessage, {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <PopArtBackground className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-6 bg-slate-50 dark:bg-gray-950 font-sans">
      {/* Card */}
      <motion.div
        className="w-full max-w-md h-auto bg-white border-4 border-gray-805 rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,0.85)] overflow-hidden"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
            {/* Header gradient bar */}
            <div className={`h-2.5 w-full transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500' : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500'}`} />

            {/* Top section */}
            <div className={`px-5 sm:px-6 transition-all ${isLogin ? 'pt-5 pb-5' : 'pt-3.5 pb-4'}`}>
              {/* Logo */}
              <div className="flex justify-center mb-3">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-xl border-4 border-gray-800 flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,0.8)]"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <Package className="w-6 h-6 text-white" />
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center mb-1">
                <h1 className="text-2xl font-black text-gray-800">
                  <span className="text-cyan-500">MyPop</span>
                  <span>Vault</span>
                </h1>
                <motion.h2
                  key={mode}
                  className="text-lg font-black text-gray-700 mt-0.5 flex items-center justify-center gap-1.5"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isLogin ? (
                    <><LogIn className="w-4.5 h-4.5 text-pink-500" /> Login to Vault</>
                  ) : (
                    <><UserPlus className="w-4.5 h-4.5 text-cyan-500" /> Create a New Vault</>
                  )}
                </motion.h2>
                <p className="text-xs text-gray-500 font-bold mt-0.5">
                  {isLogin ? 'Welcome back, collector!' : 'Join thousands of Pop enthusiasts!'}
                </p>
              </div>

              {/* Toggle tabs */}
              <div className="flex my-2.5 border-4 border-gray-800 rounded-xl overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.8)] bg-white">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setConfirmPassword('');
                  }}
                  className={`flex-1 py-1.5 font-black text-xs transition-all ${isLogin ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Login
                </button>
                <div className="w-1 bg-gray-800" />
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setConfirmPassword('');
                  }}
                  className={`flex-1 py-1.5 font-black text-xs transition-all ${!isLogin ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Box */}
              {error && (
                <div className="mb-3.5 p-3 bg-red-50 border-4 border-red-800 text-red-800 font-bold rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs">
                  ⚠️ {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className={isLogin ? "space-y-3" : "space-y-2"}>
                {!isLogin && (
                  <div>
                    <label className="block text-[11px] font-black text-gray-700 mb-0.5" htmlFor="username">Username</label>
                    <input
                      id="username"
                      type="text"
                      placeholder="collector_jack"
                      value={username}
                      onChange={e => handleEnglishOnlyInput(e.target.value, setUsername)}
                      className="w-full h-9 px-3 border-4 border-gray-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:border-yellow-500 focus:shadow-[3px_3px_0px_rgba(255,215,0,0.5)] transition-all bg-white"
                      required
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-[11px] font-black text-gray-700 mb-0.5" htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="collector@example.com"
                    value={email}
                    onChange={e => handleEnglishOnlyInput(e.target.value, setEmail)}
                    className="w-full h-9 px-3 border-4 border-gray-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:border-pink-500 focus:shadow-[3px_3px_0px_rgba(236,0,140,0.5)] transition-all bg-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-gray-700 mb-0.5" htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => handleEnglishOnlyInput(e.target.value, setPassword)}
                    className="w-full h-9 px-3 border-4 border-gray-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:border-cyan-500 focus:shadow-[3px_3px_0px_rgba(0,174,239,0.5)] transition-all bg-white"
                    required
                  />
                  {isLogin && (
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="text-xs font-black text-pink-500 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="mt-1.5 p-1.5 px-2.5 bg-gray-50 border-2 border-gray-800 rounded-xl shadow-[2px_2px_0px_rgba(0,0,0,0.8)] text-[10.5px]">
                      <div className="text-[9.5px] font-black text-gray-500 uppercase tracking-wider mb-0.5">
                        Password Requirements:
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        {passwordRules.map(rule => (
                          <div key={rule.id} className="flex items-center gap-1">
                            {rule.met ? (
                              <Check className="w-3 h-3 text-emerald-600 shrink-0 stroke-[3]" />
                            ) : (
                              <X className="w-3 h-3 text-gray-400 shrink-0 stroke-[2.5]" />
                            )}
                            <span className={rule.met ? 'text-emerald-700 font-extrabold line-through decoration-emerald-500/40 text-[10px]' : 'text-gray-500 font-bold text-[10px]'}>
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-[11px] font-black text-gray-700 mb-0.5" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => handleEnglishOnlyInput(e.target.value, setConfirmPassword)}
                      className="w-full h-9 px-3 border-4 border-gray-800 rounded-xl font-bold text-xs shadow-[3px_3px_0px_rgba(0,0,0,0.8)] focus:outline-none focus:border-cyan-500 focus:shadow-[3px_3px_0px_rgba(0,174,239,0.5)] transition-all bg-white"
                      required
                    />
                  </div>
                )}

                {/* Notice */}
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl px-3 py-1.5 flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                  <p className="text-[10px] font-bold text-yellow-700">
                    ✨ Your data is securely locked in the vault. We use industry-standard encryption to keep your account safe.
                  </p>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 rounded-xl border-4 border-gray-800 font-black text-white text-base shadow-[3px_3px_0px_rgba(0,0,0,0.85)] flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    ${isLogin
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                    }`}
                  whileHover={loading ? {} : { y: -1.5, boxShadow: '3px 4.5px 0px rgba(0,0,0,0.85)' }}
                  whileTap={loading ? {} : { y: 0, boxShadow: '2px 2px 0px rgba(0,0,0,0.85)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  <Zap className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Processing...' : (isLogin ? 'Login to Vault' : 'Create My Vault')}
                </motion.button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t-4 border-gray-800 px-6 py-2.5 text-center">
              <p className="text-xs text-gray-500 font-bold">
                {isLogin ? "Don't have a vault? " : 'Already have a vault? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(isLogin ? 'signup' : 'login');
                    setError(null);
                    setConfirmPassword('');
                  }}
                  className={`font-black underline ${isLogin ? 'text-pink-500' : 'text-cyan-500'}`}
                >
                  {isLogin ? 'Create one free!' : 'Login here!'}
                </button>
              </p>
            </div>
      </motion.div>
    </PopArtBackground>
  );
}