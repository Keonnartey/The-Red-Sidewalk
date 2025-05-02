"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Filter,
  Users,
  BookOpen,
  User,
  UserPlus,
  MapPinPlus,
  MapPinned,
} from "lucide-react";
import { useSightings } from "@/hooks/useSightingsStore";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setShowFilter, resetSightings, setShowReportForm, setLaunchFilterAfterRoute, setLaunchReportAfterRoute } = useSightings();
  const { isAuthenticated, isGuest } = useAuth();
  const [showGuestModal, setShowGuestModal] = useState(false);
  
  // Don't render the sidebar on login page
  // The root path '/' is typically the login page at localhost:3000
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/signup' || pathname === '/forgot-password') {
    return null; // Return nothing, effectively hiding the sidebar
  }

  // Check authentication status directly from sessionStorage
  const checkAuthStatus = () => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    const isGuestMode = sessionStorage.getItem('guestMode') === 'true';
    
    // Return the current auth state
    return {
      isLoggedIn: !!(token && user),
      isGuestMode: isGuestMode
    };
  };

  const handleMapClick = () => {
    if (pathname === "/map") {
      resetSightings();
    } else {
      router.push("/map");
    }
  };

  const handleFilterClick = () => {
    if (pathname === "/map") {
      setShowFilter(true);
    } else {
      setLaunchFilterAfterRoute(true);
      router.push("/map");
    }
  };
  
  const handleReportClick = () => {
    // Always check the current status directly from sessionStorage
    const { isLoggedIn, isGuestMode } = checkAuthStatus();
    
    // If guest mode, show the restriction modal
    if (isGuestMode || (!isLoggedIn && !isGuestMode)) {
      console.log("Guest trying to report - showing restriction modal");
      setShowGuestModal(true);
      return; // Exit early - don't continue to the report form
    }
    
    // Only logged in users get here
    if (pathname === "/map") {
      setShowReportForm(true);
    } else {
      setLaunchReportAfterRoute(true);
      router.push("/map");
    }
  };

  // Handler for pages that guests shouldn't access
  const handleProtectedPageClick = (path) => {
    // Get current auth status
    const { isLoggedIn, isGuestMode } = checkAuthStatus();
    
    if (!isLoggedIn) {
      if (isGuestMode) {
        // Guest users can only access map
        setShowGuestModal(true);
      } else {
        // Not logged in at all, redirect to login
        router.push('/');
      }
    } else {
      // User is logged in, proceed
      router.push(path);
    }
  };

  // Modified to handle explicit login redirect
  const handleGoToLogin = () => {
    // Force clear any auth data
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_type');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('guestMode');
    
    // Use window.location for a full page reload
    window.location.href = '/';
  };
  
  const linkClass = (path) =>
    `w-[80px] h-[80px] rounded-lg flex items-center justify-center
     ${pathname === path ? "bg-[#dacfff]" : "bg-white"}`

  return (
    <>
      <div className="w-[130px] bg-[#1e1d4a] flex flex-col items-center py-4 gap-8 shrink-0">
        {/* Map button - accessible to everyone */}
        <button
          onClick={() => {
            setShowFilter(false);
            setShowReportForm(false);
            handleMapClick();
          }}
          className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${
            pathname === "/map" ? "bg-[#dacfff]" : "bg-white"
          }`}
        >
          <MapPinned className="w-10 h-10 text-[#1e1d4a]" />
        </button>

        {/* Filter button - accessible to everyone */}
        <button
          onClick={() => {
            console.log("🔍 Opening filter modal from sidebar");
            setShowReportForm(false);
            handleFilterClick();
          }}
          className="w-[80px] h-[80px] rounded-lg flex items-center justify-center bg-white hover:bg-[#dacfff] transition"
        >
          <Filter className="w-10 h-10 text-[#1e1d4a]" />
        </button>

        {/* Report button - shows modal for guests */}
        <button
          onClick={() => {
            console.log("🔍 Opening report modal from sidebar");
            setShowFilter(false);
            handleReportClick();
          }}
          className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center bg-white hover:bg-[#dacfff] transition`}
        >
          <MapPinPlus className="w-10 h-10 text-[#1e1d4a]" />
        </button>

        {/* Discuss - protected */}
        <div 
          onClick={() => handleProtectedPageClick("/discuss")}
          className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center cursor-pointer ${
            pathname === "/discuss" ? "bg-[#dacfff]" : "bg-white"
          }`}
        >
          <Users className="w-10 h-10 text-[#1e1d4a]" />
        </div>

        {/* Socialness - protected */}
        <div
          onClick={() => handleProtectedPageClick("/socialness")}
          className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center cursor-pointer ${
            pathname === "/socialness" ? "bg-[#dacfff]" : "bg-white"
          }`}
        >
          <UserPlus className="w-10 h-10 text-[#1e1d4a]" />
        </div>

        {/* Creatures - protected */}
        <div
          onClick={() => handleProtectedPageClick("/creatures")}
          className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center cursor-pointer ${
            pathname === "/creatures" ? "bg-[#dacfff]" : "bg-white"
          }`}
        >
          <BookOpen className="w-10 h-10 text-[#1e1d4a]" />
        </div>

        {/* Profile - protected */}
        <div
          onClick={() => handleProtectedPageClick("/profile")}
          className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center cursor-pointer ${
            pathname === "/profile" ? "bg-[#dacfff]" : "bg-white"
          }`}
        >
          <User className="w-10 h-10 text-[#1e1d4a]" />
        </div>
      </div>

      {/* Guest Restriction Modal - UPDATED with modified handlers */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <p className="mb-4">Please login to use this feature. Guest users can only view the map.</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setShowGuestModal(false);
                  router.push('/map');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Back to Map
              </button>
              <button 
                onClick={() => {
                  setShowGuestModal(false);
                  handleGoToLogin(); // Use the special login handler
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}