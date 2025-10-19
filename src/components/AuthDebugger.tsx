import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">🔍 Auth Debug Info</h4>
      <div className="space-y-1">
        <div><strong>Path:</strong> {location.pathname}</div>
        <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
        <div><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
        <div><strong>User ID:</strong> {user?.id || 'None'}</div>
        <div><strong>User UID:</strong> {user?.uid || 'None'}</div>
        <div><strong>User Role:</strong> {user?.role || user?.activeRole?.type || 'None'}</div>
        <div><strong>User Name:</strong> {user?.name || 'None'}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        {user && (
          <details className="mt-2">
            <summary className="cursor-pointer">Full User Object</summary>
            <pre className="mt-1 text-xs overflow-auto max-h-32">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default AuthDebugger;