"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/LoginModal"

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [userData, setUserData] = useState(null)
  const [profileData, setProfileData] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const router = useRouter()

  // Function to fetch profile data
  const fetchProfileData = async (userId) => {
    try {
      const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      console.log(`Fetching profile data for user ID: ${userId}`);
      
      const response = await fetch(`${API}/api/profile/public/${userId}`, {
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error(`Error status: ${response.status}`);
        throw new Error(`Status ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched profile data:", data);
      return data;
    } catch (err) {
      console.error("Error fetching profile:", err);
      throw err;
    }
  };

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      console.log("=== AUTH CHECK STARTED ===");
      
      const token = sessionStorage.getItem('token');
      const guestMode = sessionStorage.getItem('guestMode') === 'true';
      const storedUserData = sessionStorage.getItem('user');
      
      console.log("Token:", token ? "exists" : "none");
      console.log("Guest mode:", guestMode);
      console.log("User data:", storedUserData ? "exists" : "none");
      
      // Check for guest mode first
      if (guestMode) {
        console.log("User is in guest mode, showing login modal");
        setIsGuest(true);
        setShowLoginModal(true);
        setIsLoading(false);
        return;
      }
      
      if (token && storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Parsed user data:", parsedUserData);
          
          setIsAuthenticated(true);
          setUserData(parsedUserData);
          
          // Get the user ID from the id property
          const userId = parsedUserData.id?.toString();
          
          console.log(`Using user ID: ${userId}`);
          
          // If no ID is found, redirect to the default profile
          if (!userId) {
            console.log("No user ID found, redirecting to default profile");
            setTimeout(() => {
              router.push('/profile/1');
            }, 2000);
            return;
          }
          
          // Fetch profile data before redirecting
          try {
            const profileData = await fetchProfileData(userId);
            setProfileData(profileData);
            
            // Now redirect to the profile page with complete data
            setTimeout(() => {
              console.log(`Redirecting to /profile/${userId}`);
              router.push(`/profile/${userId}`);
            }, 2000);
          } catch (fetchError) {
            setFetchError(fetchError.message);
            console.error("Failed to fetch profile data:", fetchError);
            
            // Even if fetch fails, still redirect to profile page
            // The profile page component will handle the error state
            setTimeout(() => {
              console.log(`Redirecting to /profile/${userId} despite fetch error`);
              router.push(`/profile/${userId}`);
            }, 2000);
          }
          
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear potentially corrupted data
          sessionStorage.removeItem('user');
          setIsLoading(false);
          router.push('/'); // Redirect on error
        }
      } else if (!guestMode) {
        // If not authenticated and not in guest mode, redirect to home/login page
        console.log("User not authenticated, redirecting to home");
        setIsLoading(false);
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router]);

  // Helper function to get display name
  const getDisplayName = () => {
    // First try to get name from profile data if available
    if (profileData && profileData.user) {
      if (profileData.user.full_name) return profileData.user.full_name;
      if (profileData.user.username) return profileData.user.username;
    }
    
    // Fall back to auth data
    if (!userData) return "User";
    
    if (userData.username) return userData.username;
    if (userData.first_name && userData.last_name) 
      return `${userData.first_name} ${userData.last_name}`;
    if (userData.email) return userData.email.split('@')[0];
    
    return "User";
  };

  // If showing login modal, return just the modal
  if (isGuest && showLoginModal) {
    return <LoginModal onClose={() => setShowLoginModal(false)} />;
  }

  // If authenticated, show loading screen with GIF
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1e2a44] flex flex-col items-center justify-center">
        <Image
          src="/badges/badges.gif"
          alt="Loading..."
          width={500}
          height={300}
          className="rounded-lg shadow-lg"
        />
        
        <h2 className="text-white text-2xl font-bold mt-6">
          Welcome Back {getDisplayName()}
        </h2>
        
        {fetchError ? (
          <p className="text-red-300 mt-2">
            Note: Could not fetch complete profile data. Redirecting anyway...
          </p>
        ) : (
          <p className="text-white mt-2">
            Redirecting to your profile...
          </p>
        )}
        
        {profileData && (
          <div className="text-white mt-4 text-center">
            <p>Found {profileData.sightings?.length || 0} sightings</p>
            <p>Unique creatures: {profileData.stats?.unique_creature_count || 0}</p>
          </div>
        )}
      </div>
    );
  }

  // Still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1e2a44] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        <p className="text-white mt-4">Loading...</p>
      </div>
    );
  }

  // Fallback - shouldn't reach here due to redirects, but just in case
  return (
    <div className="min-h-screen bg-[#1e2a44] p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">Please log in to view this page.</p>
        <Button 
          onClick={() => router.push('/')}
          className="w-full"
        >
          Go to Login
        </Button>
      </div>
    </div>
  );
}