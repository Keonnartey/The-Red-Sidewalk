'use client';

import React, { useEffect, useState } from 'react';
import LoginPage from '@/components/LoginPage';
import { useAuth } from '@/components/auth-provider';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  
  // Add a safety timeout to show login form even if isLoading gets stuck
  useEffect(() => {
    if (!isLoading) {
      setShowLogin(true);
    } else {
      // Safety timeout to prevent infinite loading
      const timer = setTimeout(() => {
        console.log("Safety timeout on homepage - showing login form");
        setShowLogin(true);
      }, 3000); // Show login after 3 seconds even if still loading
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show a loading spinner only briefly
  if (isLoading && !showLogin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  // Show login form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <LoginPage />
    </div>
  );
}