"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Camera, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/LoginModal" // Make sure this path is correct

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("badges")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGuest, setIsGuest] = useState(false)
  const [userData, setUserData] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()

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

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token')
    localStorage.removeItem('token_type')
    localStorage.removeItem('user')
    
    // Clear authentication data from sessionStorage as well
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('token_type')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('guestMode')
    
    setIsAuthenticated(false)
    setUserData(null)
    
    // Redirect to home page
    window.location.href = '/'
  }

  // If showing login modal, return just the modal
  if (isGuest && showLoginModal) {
    return <LoginModal onClose={() => setShowLoginModal(false)} />
  }

  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <h1 className="text-white text-4xl font-bold mb-8">
        {isAuthenticated && userData ? 
          `WELCOME BACK ${userData.username || (userData.first_name ? userData.first_name.toUpperCase() : 'USER')}` : 
          "WELCOME BACK USER_ALPHA"}
      </h1>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-8">
          {/* Achievements Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
              <h2 className="text-white text-2xl font-bold mb-4">THE SOCIALITE</h2>
              <div className="flex justify-center mb-4">
                <Image
                  src="/placeholder.svg?height=150&width=150"
                  alt="Scroll"
                  width={150}
                  height={150}
                  className="w-32 h-32"
                />
              </div>
              <p className="text-white text-center">Congrats, you left a comment on someone's post</p>
            </div>

            <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
              <h2 className="text-white text-2xl font-bold mb-4">THE HALLUCINATOR</h2>
              <div className="flex justify-center mb-4">
                <Image
                  src="/placeholder.svg?height=150&width=150"
                  alt="Mushroom"
                  width={150}
                  height={150}
                  className="w-32 h-32"
                />
              </div>
              <p className="text-white text-center">NOT congrats. You had 3 1-star rated sightings.</p>
            </div>
          </div>

          {/* Badges to Earn */}
          <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
            <h2 className="text-white text-2xl font-bold mb-6">SOME OTHER BADGES TO EARN:</h2>

            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="bg-[#1e2a44] p-4 rounded-lg border border-gray-700 mb-2">
                  <Camera className="w-16 h-16 text-gray-300" />
                </div>
                <p className="text-white text-center text-sm">CAMERA READY</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-[#1e2a44] p-4 rounded-lg border border-gray-700 mb-2">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Dragon"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
                <p className="text-white text-center text-sm">DRAGON RIDER</p>
              </div>

              <div className="flex flex-col items-center relative">
                <div className="bg-[#1e2a44] p-4 rounded-lg border border-gray-700 mb-2">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    alt="Bow"
                    width={64}
                    height={64}
                    className="w-16 h-16"
                  />
                </div>
                <p className="text-white text-center text-sm">THE HUNTER</p>

                <div className="absolute right-0 top-0 bg-[#d9d9d9] rounded-lg p-2 text-xs w-48 transform translate-x-1/2 -translate-y-1/2">
                  Find all 5 creatures to earn this badge.
                  <div className="absolute w-3 h-3 bg-[#d9d9d9] transform rotate-45 -left-1 top-1/2 -translate-y-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="space-y-4">
          <Button
            variant="outline"
            className={`w-full justify-start text-lg py-6 ${activeTab === "general" ? "bg-[#d9d9d9]" : "bg-[#d9d9d9] bg-opacity-70"}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </Button>

          <Button
            variant="outline"
            className={`w-full justify-start text-lg py-6 ${activeTab === "socialness" ? "bg-[#d9d9d9]" : "bg-[#d9d9d9] bg-opacity-70"}`}
            onClick={() => setActiveTab("socialness")}
          >
            Socialness
          </Button>

          <Button
            variant="outline"
            className={`w-full justify-start text-lg py-6 ${activeTab === "badges" ? "bg-[#dacfff]" : "bg-[#d9d9d9] bg-opacity-70"}`}
            onClick={() => setActiveTab("badges")}
          >
            Badges
          </Button>

          <Button
            variant="outline"
            className={`w-full justify-start text-lg py-6 ${activeTab === "settings" ? "bg-[#d9d9d9]" : "bg-[#d9d9d9] bg-opacity-70"}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </Button>

          {isAuthenticated && (
            <Button
              variant="outline"
              className="w-full justify-start text-lg py-6 bg-red-100 hover:bg-red-200 text-red-600 flex items-center"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
          )}
        </div>
      </div>

      {/* Show login modal if in guest mode */}
      {isGuest && showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  )
}