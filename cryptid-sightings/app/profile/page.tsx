"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Camera, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/LoginModal" // Make sure this path is correct

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [userData, setUserData] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  
  // Use the same hardcoded user ID as in your backend router or get from userData
  const getUserId = () => {
    if (userData && userData.user_id) {
      return userData.user_id;
    }
    return 1; // Fallback ID if not available
  }

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const guestMode = sessionStorage.getItem('guestMode') === 'true'
    const storedUserData = sessionStorage.getItem('user')
    
    // Check for guest mode first
    if (guestMode) {
      setIsGuest(true)
      setShowLoginModal(true) // Show login modal for guests
      return
    }
    
    if (token && storedUserData) {
      try {
        setIsAuthenticated(true)
        setUserData(JSON.parse(storedUserData))
        
        // Show loading screen briefly, then redirect to user profile
        const redirectTimeout = setTimeout(() => {
          const userId = getUserId();
          router.push(`/profile/${userId}`);
        }, 2000);
        
        return () => {
          clearTimeout(redirectTimeout);
        };
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear potentially corrupted data
        sessionStorage.removeItem('user')
        router.push('/') // Redirect on error
      }
    } else if (!guestMode) {
      // If not authenticated and not in guest mode, redirect to home/login page
      router.push('/')
    }
  }, [router])


  // If showing login modal, return just the modal
  if (isGuest && showLoginModal) {
    return <LoginModal onClose={() => setShowLoginModal(false)} />
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
          Welcome Back {userData ? (userData.username || userData.full_name || `User ${getUserId()}`) : `User ${getUserId()}`}
        </h2>
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
  )
}