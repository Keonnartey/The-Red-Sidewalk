"use client";

import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import {
  BigfootIcon,
  GhostIcon,
  DragonIcon,
  AlienIcon,
  VampireIcon,
} from "@/components/creature-icons";
import { Star, StarHalf, StarOff } from "lucide-react";
import { useRouter } from "next/navigation";

const CREATURE_MAP = {
  1: "ghost",
  2: "bigfoot",
  3: "dragon",
  4: "alien",
  5: "vampire",
};

function getCreatureIcon(name, size = 20) {
  switch (name.toLowerCase()) {
    case "bigfoot": return <BigfootIcon size={size} />;
    case "ghost":   return <GhostIcon size={size} />;
    case "dragon":  return <DragonIcon size={size} />;
    case "alien":   return <AlienIcon size={size} />;
    case "vampire": return <VampireIcon size={size} />;
    default:        return null;
  }
}

function renderStars(avg) {
  if (avg === null || avg === undefined) return null;
  
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`full-${i}`} size={16} className="text-yellow-400" />
      ))}
      {half && <StarHalf size={16} className="text-yellow-400" />}
      {Array.from({ length: empty }).map((_, i) => (
        <StarOff key={`empty-${i}`} size={16} className="text-gray-400" />
      ))}
      <span className="text-gray-500 text-sm">({avg.toFixed(1)})</span>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch(e) {
    return dateString;
  }
}

export default function UserProfilePage({ params }) {
  // Use React.use() to unwrap the params Promise
  const unwrappedParams = React.use(params);
  const userId = unwrappedParams.userId;
  
  const [activeTab, setActiveTab] = useState("general");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  // State for settings tab
  const [aboutMe, setAboutMe] = useState("");
  const [hometownCity, setHometownCity] = useState("");
  const [hometownState, setHometownState] = useState("");
  const [hometownCountry, setHometownCountry] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  // API Base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  // Debug logging for profile data
  useEffect(() => {
    if (profileData) {
      console.log("Profile Data:", profileData);
      console.log("User Data:", profileData.user);
      console.log("Sightings:", profileData.sightings);
    }
  }, [profileData]);

  // Check authentication
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUserData = sessionStorage.getItem('user');
    
    if (token && storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setIsAuthenticated(true);
        setUserData(parsedUserData);
        
        // Check if viewing user's own profile
        if (parsedUserData.id && parsedUserData.id.toString() === userId) {
          setIsCurrentUser(true);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('user');
      }
    }
  }, [userId]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Make sure userId is a valid number
        if (!userId || isNaN(parseInt(userId))) {
          throw new Error("Invalid user ID");
        }

        console.log(`Fetching profile for user ID: ${userId}`);
        
        const res = await fetch(`${API_BASE_URL}/api/profile/public/${userId}`, {
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          console.error(`Error status: ${res.status}`);
          throw new Error(`Status ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Fetched profile data:", data);
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, API_BASE_URL]);

  // Populate form fields when profileData changes
  useEffect(() => {
    if (profileData && profileData.user) {
      setAboutMe(profileData.user.about_me || "");
      setHometownCity(profileData.user.hometown_city || "");
      setHometownState(profileData.user.hometown_state || "");
      setHometownCountry(profileData.user.hometown_country || "");
    }
  }, [profileData]);

  // Handle profile information update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!isCurrentUser || !userData) {
      setUpdateStatus({
        type: 'error',
        message: 'You can only update your own profile.'
      });
      return;
    }
    
    setIsUpdating(true);
    setUpdateStatus({
      type: 'info',
      message: 'Saving your changes...'
    });
    
    try {
      const token = sessionStorage.getItem('token');
      const tokenType = sessionStorage.getItem('token_type');
      
      if (!token || !tokenType) {
        throw new Error("Authentication required");
      }
      
      // Create form data for profile info
      const formData = new FormData();
      formData.append('user_id', userData.id);
      formData.append('first_name', userData.first_name || "");
      formData.append('last_name', userData.last_name || "");
      formData.append('about_me', aboutMe);
      formData.append('hometown_city', hometownCity);
      formData.append('hometown_state', hometownState);
      formData.append('hometown_country', hometownCountry);
      
      console.log("Updating profile with form data:", {
        about_me: aboutMe,
        hometown_city: hometownCity,
        hometown_state: hometownState,
        hometown_country: hometownCountry
      });
      
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `${tokenType} ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }
      
      const updatedProfile = await response.json();
      console.log("Profile updated:", updatedProfile);
      
      // Update local state with new data
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          about_me: aboutMe,
          hometown_city: hometownCity,
          hometown_state: hometownState,
          hometown_country: hometownCountry
        }
      });
      
      setUpdateStatus({
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      // Clear status after a few seconds
      setTimeout(() => {
        setUpdateStatus(null);
      }, 5000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateStatus({
        type: 'error',
        message: error.message || "Failed to update profile. Please try again."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle profile picture change - Similar to account creation
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error', 
        message: 'Please select a valid image file (JPEG, PNG, or GIF)'
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        type: 'error',
        message: 'File size must be less than 5MB'
      });
      return;
    }
    
    setProfilePicFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    setUploadStatus(null);
  };

  // Handle cancel upload
  const handleCancelUpload = () => {
    setProfilePicFile(null);
    setProfilePicPreview(null);
    setUploadStatus(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle profile picture upload
  const handleUploadProfilePic = async () => {
    if (!profilePicFile || !isCurrentUser || !userData) {
      return;
    }
    
    setIsUploading(true);
    setUploadStatus({
      type: 'info',
      message: 'Uploading your new profile picture...'
    });
    
    try {
      const token = sessionStorage.getItem('token');
      const tokenType = sessionStorage.getItem('token_type');
      
      if (!token || !tokenType) {
        throw new Error("Authentication required");
      }
      
      // Create form data for profile pic - EXACTLY like account creation
      const formData = new FormData();
      formData.append('user_id', userData.id);
      formData.append('first_name', userData.first_name || "");
      formData.append('last_name', userData.last_name || "");
      
      // Include all other fields with their current values to avoid clearing them
      formData.append('about_me', aboutMe || "");
      if (hometownCity) formData.append('hometown_city', hometownCity);
      if (hometownState) formData.append('hometown_state', hometownState);
      if (hometownCountry) formData.append('hometown_country', hometownCountry);
      
      // Include the profile picture
      formData.append('profile_pic', profilePicFile);
      
      console.log("Uploading profile picture:", profilePicFile.name);
      
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `${tokenType} ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to upload profile picture");
      }
      
      const updatedProfile = await response.json();
      console.log("Profile updated with new picture:", updatedProfile);
      
      // Update local state with new data
      setProfileData({
        ...profileData,
        user: {
          ...profileData.user,
          profile_pic: updatedProfile.profile_pic
        }
      });
      
      setUploadStatus({
        type: 'success',
        message: 'Profile picture updated successfully!'
      });
      
      // Clear file state after successful upload
      setProfilePicFile(null);
      setProfilePicPreview(null);
      
      // Optionally refresh to ensure latest image is displayed
      // window.location.reload();
      
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setUploadStatus({
        type: 'error',
        message: error.message || "Failed to upload profile picture. Please try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
    
    // Clear authentication data from sessionStorage as well
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('token_type');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('guestMode');
    
    setIsAuthenticated(false);
    setUserData(null);
    
    // Redirect to home page
    window.location.href = '/';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e2a44] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
        <p className="text-white mt-4">Loading profile for User {userId}...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-[#1e2a44] text-white p-6">
        <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
          <Sidebar />
        </aside>
        <main className="flex-1 ml-[130px] p-6">
          <div className="max-w-2xl mx-auto bg-[#2d2a44] rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Profile Error</h1>
            <p className="text-red-400">
              Failed to load profile for user {userId}.<br/>
              Details: {error}
            </p>
            <Button 
              variant="outline"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/')}
            >
              Return Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // No data state
  if (!profileData) {
    return (
      <div className="flex h-screen bg-[#1e2a44] text-white p-6">
        <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
          <Sidebar />
        </aside>
        <main className="flex-1 ml-[130px] p-6">
          <div className="max-w-2xl mx-auto bg-[#2d2a44] rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">No Profile Data</h1>
            <p>No profile data available for User {userId}.</p>
            <Button 
              variant="outline"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push('/')}
            >
              Return Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const { user, badges, stats, sightings } = profileData;

  // Determine what to display based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case "general":
        return (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center space-x-4">
                {user.profile_pic ? (
                    <img 
                      src={`http://localhost:8000/api/static${user.profile_pic}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover" 
                      onError={(e) => {
                        console.error("Image failed to load:", user.profile_pic);
                        e.currentTarget.src = "https://via.placeholder.com/150";
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-xl">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  )}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    {stats.user_avg_rating != null
                      ? renderStars(stats.user_avg_rating)
                      : renderStars(0)
                    }
                  </div>
                  {user.about_me && (
                    <p className="italic text-gray-600 mt-1">{user.about_me}</p>
                  )}
                </div>
              </div>
              
              {/* Additional user info */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {user.username && (
                  <div><strong>Username:</strong> {user.username}</div>
                )}
                {user.email && (
                  <div><strong>Email:</strong> {user.email}</div>
                )}
                {user.birthday && (
                  <div><strong>Birthday:</strong> {formatDate(user.birthday)}</div>
                )}
                {user.created_at && (
                  <div><strong>Member since:</strong> {formatDate(user.created_at)}</div>
                )}
              </div>
              
              {/* Location info */}
              {(user.hometown_city || user.hometown_state || user.hometown_country) && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p>
                    {[
                      user.hometown_city,
                      user.hometown_state,
                      user.hometown_country
                    ].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </div>
            
            {/* Stats Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-xl">Stats</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Total sightings:</strong> {stats.total_sightings_count || 0}</div>
                <div><strong>Total friends:</strong> {stats.total_friends || 0}</div>
                <div><strong>Unique creatures:</strong> {stats.unique_creature_count || 0}</div>
                <div><strong>Comments made:</strong> {stats.comments_count || 0}</div>
                <div><strong>Bigfoot count:</strong> {stats.bigfoot_count || 0}</div>
                <div><strong>Likes received:</strong> {stats.like_count || 0}</div>
                <div><strong>Dragon count:</strong> {stats.dragon_count || 0}</div>
                <div><strong>Pictures posted:</strong> {stats.pictures_count || 0}</div>
                <div><strong>Ghost count:</strong> {stats.ghost_count || 0}</div>
                <div><strong>Locations visited:</strong> {stats.locations_count || 0}</div>
                <div><strong>Alien count:</strong> {stats.alien_count || 0}</div>
                <div><strong>Vampire count:</strong> {stats.vampire_count || 0}</div>
              </div>
            </div>
            
            {/* Sightings Section - Now added to the General tab */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Sightings</h2>
              {!sightings || sightings.length === 0 ? (
                <p className="text-gray-400 italic">No sightings yet.</p>
              ) : (
                <ul className="space-y-4">
                  {sightings.map((s, index) => {
                    const name = CREATURE_MAP[s.creature_id] ?? "";
                    return (
                      <li key={s.sighting_id || `sighting-${index}`} className="flex items-start border-b border-gray-100 pb-4">
                        <div className="mr-4 pt-1">{getCreatureIcon(name, 24)}</div>
                        <div>
                          <div className="text-sm text-gray-500">
                            {s.time_posted ? new Date(s.time_posted).toLocaleDateString() : "No date"}
                            {s.location && ` - ${s.location}`}
                          </div>
                          <p className="mt-1 text-gray-800">{s.content || "No content"}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        );
      
      case "badges":
        return (
          <div className="space-y-8">
            {/* Achievements Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Display all badges */}
              {Object.entries(badges)
                .filter(([key, got]) => key !== "user_id")
                .map(([name, got], index) => (
                  <div 
                    key={name} 
                    className={`p-6 rounded-lg border ${got 
                      ? "bg-[#1e2a44] border-gray-700" 
                      : "bg-gray-200 border-gray-300 opacity-60"}`}
                  >
                    <h2 className={`text-2xl font-bold mb-4 ${got ? "text-white" : "text-gray-500"}`}>
                      {name.replace(/_/g, " ").toUpperCase()}
                    </h2>
                    <div className="flex justify-center mb-4">
                      <Image
                        src="/placeholder.svg?height=150&width=150"
                        alt={name}
                        width={150}
                        height={150}
                        className="w-32 h-32"
                      />
                    </div>
                    <p className={got ? "text-white text-center" : "text-gray-500 text-center"}>
                      {got 
                        ? "Badge earned!" 
                        : "Not yet earned"}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        );
      
      case "socialness":
        return (
          <div className="space-y-8">
            {/* Friends stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-xl">Social Activity</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Total friends:</strong> {stats.total_friends || 0}</div>
                <div><strong>Comments made:</strong> {stats.comments_count || 0}</div>
                <div><strong>Likes received:</strong> {stats.like_count || 0}</div>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-8">
            {/* Password Reset Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-xl">Password Settings</h2>
              <p className="mb-4 text-sm text-gray-600">
                Need to change your password? You can reset it securely here.
              </p>
              <Button 
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.push('/forgot-password')}
              >
                Reset Password
              </Button>
            </div>

            {/* Profile Information Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-xl">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {/* About Me */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Me
                  </label>
                  <textarea
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Tell others about yourself..."
                  />
                </div>

                {/* Location Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={hometownCity}
                      onChange={(e) => setHometownCity(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={hometownState}
                      onChange={(e) => setHometownState(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={hometownCountry}
                      onChange={(e) => setHometownCountry(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your country"
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                
                {updateStatus && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    updateStatus.type === 'success' ? 'bg-green-100 text-green-700' : 
                    updateStatus.type === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {updateStatus.message}
                  </div>
                )}
              </form>
            </div>

            {/* Profile Picture Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-xl">Profile Picture</h2>
              <div className="flex flex-col md:flex-row items-center mb-4">
                {/* Current profile picture display - Using the proven approach */}
                <div className="flex-shrink-0 h-24 w-24 border border-gray-300 rounded-full overflow-hidden bg-gray-100 mb-4 md:mb-0 md:mr-4">
                  {profilePicPreview ? (
                    <img 
                      src={profilePicPreview} 
                      alt="Profile preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : user.profile_pic ? (
                    <img 
                      src={`http://localhost:8000/api/static${user.profile_pic}`}
                      alt="Current Profile" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        console.error("Image failed to load:", user.profile_pic);
                        e.currentTarget.src = "https://via.placeholder.com/150";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="text-gray-500 text-xl">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload controls */}
                <div>
                  <div className="relative">
                    <input
                      id="profilePic"
                      name="profilePic"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      ref={fileInputRef}
                    />
                    <label
                      htmlFor="profilePic"
                      className="bg-blue-600 text-white py-2 px-3 border border-transparent rounded-md shadow-sm text-sm leading-4 font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer inline-block"
                    >
                      Choose New Image
                    </label>
                  </div>
                  {profilePicFile && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={handleCancelUpload}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    JPG, PNG, GIF up to 5MB
                  </p>
                </div>
              </div>

              {/* Upload button only shown when a file is selected */}
              {profilePicFile && (
                <button
                  type="button"
                  onClick={handleUploadProfilePic}
                  disabled={isUploading}
                  className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : 'Upload New Picture'}
                </button>
              )}
              
              {uploadStatus && (
                <div className={`mt-2 p-2 rounded text-sm ${
                  uploadStatus.type === 'success' ? 'bg-green-100 text-green-700' : 
                  uploadStatus.type === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {uploadStatus.message}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render profile with the original styling from the first file
  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
        <Sidebar />
      </aside>
      
      <main className="flex-1 ml-[130px]">
        <h1 className="text-white text-4xl font-bold mb-8">
          {user.full_name ? user.full_name.toUpperCase() : `USER ${userId}`}
          {isCurrentUser && <span className="ml-2 text-lg text-green-400">(You)</span>}
        </h1>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-8">
            {renderContent()}
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

            {isCurrentUser && (
              <Button
                variant="outline"
                className={`w-full justify-start text-lg py-6 ${activeTab === "settings" ? "bg-[#d9d9d9]" : "bg-[#d9d9d9] bg-opacity-70"}`}
                onClick={() => setActiveTab("settings")}
              >
                Settings
              </Button>
            )}

            {isAuthenticated && (
              <Button
                variant="outline"
                className="w-full justify-start text-lg py-6 bg-red-600 hover:bg-red-700 text-white flex items-center"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" /> Logout
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}