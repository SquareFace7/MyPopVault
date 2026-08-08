import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getApiUrl } from '@/lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage to persist sessions
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        return {
          id: parsedUser.id || parsedUser._id,
          _id: parsedUser._id || parsedUser.id,
          isLoggedIn: true,
          role: parsedUser.role || 'user',
          isVIP: parsedUser.isVIP || false,
          username: parsedUser.username,
          email: parsedUser.email,
          token: savedToken,
          isVerified: parsedUser.isVerified || false
        };
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return {
      isLoggedIn: false,
      role: 'guest',
      isVIP: false,
      username: 'Guest Collector',
      email: 'guest@mypopvault.com',
      isVerified: false
    };
  });

  // POST /api/auth/register
  const register = async (username, email, password) => {
    const response = await fetch(getApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    // Persist session
    localStorage.setItem('token', data.token);
    const userProfile = {
      id: data.user.id || data.user._id,
      _id: data.user._id || data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role || 'user',
      isVIP: data.user.isVip || data.user.role === 'vip' || data.user.role === 'admin',
      isVerified: data.user.isVerified || false
    };
    localStorage.setItem('user', JSON.stringify(userProfile));

    setUser({
      id: data.user.id || data.user._id,
      _id: data.user._id || data.user.id,
      isLoggedIn: true,
      role: data.user.role || 'user',
      isVIP: data.user.isVip || data.user.role === 'vip' || data.user.role === 'admin',
      username: data.user.username,
      email: data.user.email,
      token: data.token,
      isVerified: data.user.isVerified || false
    });

    return data;
  };

  // POST /api/auth/login
  const login = async (email, password) => {
    const response = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    // Persist session
    localStorage.setItem('token', data.token);
    const userProfile = {
      id: data.user.id || data.user._id,
      _id: data.user._id || data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role || 'user',
      isVIP: data.user.isVip || data.user.role === 'vip' || data.user.role === 'admin',
      isVerified: data.user.isVerified || false
    };
    localStorage.setItem('user', JSON.stringify(userProfile));

    setUser({
      id: data.user.id || data.user._id,
      _id: data.user._id || data.user.id,
      isLoggedIn: true,
      role: data.user.role || 'user',
      isVIP: data.user.isVip || data.user.role === 'vip' || data.user.role === 'admin',
      username: data.user.username,
      email: data.user.email,
      token: data.token,
      isVerified: data.user.isVerified || false
    });

    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser({
      isLoggedIn: false,
      role: 'guest',
      isVIP: false,
      username: 'Guest Collector',
      email: 'guest@mypopvault.com',
      isVerified: false
    });
  };

  // Helper for quick sandbox simulation
  const loginAs = (role, isVIP = false) => {
    const mockUser = {
      id: role === 'admin' ? '6a47984602b42968fb84dd95' : '6a47984602b42968fb84dd97',
      _id: role === 'admin' ? '6a47984602b42968fb84dd95' : '6a47984602b42968fb84dd97',
      username: `${role.charAt(0).toUpperCase() + role.slice(1)} Collector`,
      email: `${role}@mypopvault.com`,
      role,
      isVIP,
      isVerified: role !== 'guest'
    };
    localStorage.setItem('token', 'mock_token_sandbox');
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser({
      isLoggedIn: true,
      ...mockUser,
      token: 'mock_token_sandbox'
    });
  };

  // Direct state updaters for easy control panel integration
  const setRole = (role) => {
    setUser(prev => {
      const nextUser = {
        ...prev,
        role,
        isLoggedIn: role !== 'guest'
      };
      if (role === 'guest') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        localStorage.setItem('user', JSON.stringify(nextUser));
      }
      return nextUser;
    });
  };

  const setVIP = (isVIP) => {
    setUser(prev => {
      const nextUser = { ...prev, isVIP };
      if (prev.isLoggedIn) {
        localStorage.setItem('user', JSON.stringify(nextUser));
      }
      return nextUser;
    });
  };

  const setIsLoggedIn = (isLoggedIn) => {
    setUser(prev => {
      const nextUser = {
        ...prev,
        isLoggedIn,
        role: isLoggedIn ? (prev.role === 'guest' ? 'user' : prev.role) : 'guest'
      };
      if (!isLoggedIn) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        localStorage.setItem('user', JSON.stringify(nextUser));
      }
      return nextUser;
    });
  };

  const checkUserAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'mock_token_sandbox') return null;
    try {
      const response = await fetch(getApiUrl('/api/auth/me'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const userProfile = {
          id: data.user.id || data.user._id,
          _id: data.user._id || data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role || 'user',
          isVIP: data.user.isVip || data.user.role === 'vip' || data.user.role === 'admin',
          isVerified: data.user.isVerified || false
        };
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser({
          id: data.user.id || data.user._id,
          _id: data.user._id || data.user.id,
          isLoggedIn: true,
          role: data.user.role || 'user',
          isVIP: data.user.isVip || data.user.role === 'vip' || data.user.role === 'admin',
          username: data.user.username,
          email: data.user.email,
          token,
          isVerified: data.user.isVerified || false
        });
        return userProfile;
      }
    } catch (e) {
      console.error('Error checking user auth:', e);
    }
    return null;
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  // Auto-logout feature for inactive users (10 minutes / 600,000 ms)
  useEffect(() => {
    if (!user.isLoggedIn) return;

    let timeoutId;

    const handleInactivity = () => {
      logout();
      toast('⚠️ נותקת מהמערכת עקב חוסר פעילות', {
        style: {
          border: '4px solid #1f2937',
          padding: '16px',
          color: '#1f2937',
          fontWeight: 'bold',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px rgba(0,0,0,0.85)'
        }
      });
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleInactivity, 10 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll'];

    resetTimer();

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user.isLoggedIn]);

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated: user.isLoggedIn,
      isLoadingAuth: false,
      isLoadingPublicSettings: false,
      authChecked: true,
      authError: null,
      appPublicSettings: null,
      logout,
      navigateToLogin: () => loginAs('user', false),
      checkAppState: () => {},
      checkUserAuth,
      login,
      register,
      loginAs,
      setRole,
      setVIP,
      setIsLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
