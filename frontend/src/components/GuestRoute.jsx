import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

/**
 * GuestRoute prevents authenticated users from reaching guest-only pages
 * like /Login, /forgot-password, /reset-password.
 * If the user is already logged in, they are redirected to /Dashboard.
 */
export default function GuestRoute({ children }) {
  const { user } = useAuth();

  if (user && user.isLoggedIn) {
    return <Navigate to="/Dashboard" replace />;
  }

  return children;
}
