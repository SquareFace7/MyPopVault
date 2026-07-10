import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import toast from 'react-hot-toast';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !user.isLoggedIn) {
      toast.error('⚠️ Please log in or sign up to access this page!', {
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
  }, [user]);

  // If the user is not logged in, redirect them to the Login page, preserving any query parameters
  if (!user || !user.isLoggedIn) {
    const search = window.location.search;
    return <Navigate to={`/Login${search}`} replace />;
  }

  return children;
}
