import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SellerRoute({ children }) {
  const { isAuthenticated, isSeller, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !isSeller) {
    return <Navigate to="/unauthorized" state={{ from: location }} />;
  }

  return children;
}
