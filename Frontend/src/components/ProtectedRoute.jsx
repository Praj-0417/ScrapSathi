import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from './LoginContext';

const ProtectedRoute = ({ children, allowedUserTypes, allowedRoles }) => {
  const { loggedIn, user, loading } = useLogin();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-xl animate-pulse">
            ♻️
          </div>
          <div className="flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs text-slate-500 font-semibold">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check userType authorization (Caveat #5: prevent users loading dashboards of other roles)
  if (allowedUserTypes && allowedUserTypes.length > 0 && user?.userType) {
    if (!allowedUserTypes.includes(user.userType)) {
      const fallbackDashboard =
        user.userType === 'waste-collector'
          ? '/collector-dashboard'
          : user.userType === 'organization'
          ? '/organization-dashboard'
          : user.userType === 'recycle-company'
          ? '/recycle-company-dashboard'
          : '/individual-dashboard';
      return <Navigate to={fallbackDashboard} replace />;
    }
  }

  // Check role authorization (e.g. admin)
  if (allowedRoles && allowedRoles.length > 0 && user?.role) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/individual-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
