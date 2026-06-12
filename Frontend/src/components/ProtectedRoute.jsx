import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from './LoginContext';

const ProtectedRoute = ({ children }) => {
  const { loggedIn, loading } = useLogin();

  if (loading) {
    // You can return a loading spinner here if you want
    return null;
  }

  if (!loggedIn) {
    // If not logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child components
  return children;
};

export default ProtectedRoute;
