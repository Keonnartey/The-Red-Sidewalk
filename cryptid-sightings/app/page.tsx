'use client';

import React, { useEffect, useState } from 'react';
import LoginPage from '@/components/LoginPage';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('token');
      const isGuest = sessionStorage.getItem('guestMode') === 'true';
      
      if (token && !isGuest) {
        // If authenticated (not guest), redirect to map
        router.push('/map');
      } else {
        // Show login form
        setShowLogin(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
      console.log("Safety timeout on homepage - showing login form");
      setShowLogin(true);
      setIsLoading(false);
    }, 2000); // Show login after 2 seconds even if still loading
    
    return () => clearTimeout(timer);
  }, [router]);

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