"use client";

import React, { useState, useEffect } from "react";
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

export default function UserProfilePage({ params }) {
  const { userId } = params;
  const [activeTab, setActiveTab] = useState("badges");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUserData = sessionStorage.getItem('user');
    
    if (token && storedUserData) {
      try {
        setIsAuthenticated(true);
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const res = await fetch(`${API}/api/profile/public/${userId}`, {
          cache: "no-store",
        });
        
        if (!res.ok) throw new Error(`Status ${res.status}`);
        
        const data = await res.json();
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
  }, [userId]);

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
        <p className="text-white mt-4">Loading profile...</p>
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
            <p>No profile data available for this user.</p>
          </div>
        </main>
      </div>
    );
  }

  const { user, badges, stats, sightings } = profileData;

  // Render profile with the original styling from the first file
  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
        <Sidebar />
      </aside>
      
      <main className="flex-1 ml-[130px]">
        <h1 className="text-white text-4xl font-bold mb-8">
          {user.full_name ? user.full_name.toUpperCase() : `USER ${userId}`}
        </h1>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center space-x-4">
                {user.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt={user.full_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xl">
                      {user.full_name ? user.full_name.charAt(0) : "U"}
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
            </div>

            {/* Achievements Section */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Display Badges - show first two as featured */}
              {Object.entries(badges)
                .filter(([key, got]) => key !== "user_id" && got)
                .slice(0, 2)
                .map(([name, _], index) => (
                  <div key={name} className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
                    <h2 className="text-white text-2xl font-bold mb-4">
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
                    <p className="text-white text-center">
                      {index === 0 
                        ? "Congrats on earning this badge!" 
                        : `Earned on ${new Date().toLocaleDateString()}`}
                    </p>
                  </div>
                ))}
            </div>

            {/* Stats Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-semibold mb-4 text-xl">Stats</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Total sightings:</strong> {stats.total_sightings_count}</div>
                <div><strong>Total friends:</strong> {stats.total_friends}</div>
                <div><strong>Unique creatures:</strong> {stats.unique_creature_count}</div>
                <div><strong>Comments made:</strong> {stats.comments_count}</div>
                <div><strong>Bigfoot count:</strong> {stats.bigfoot_count}</div>
                <div><strong>Likes received:</strong> {stats.like_count}</div>
                <div><strong>Dragon count:</strong> {stats.dragon_count}</div>
                <div><strong>Pictures posted:</strong> {stats.pictures_count}</div>
                <div><strong>Ghost count:</strong> {stats.ghost_count}</div>
                <div><strong>Locations visited:</strong> {stats.locations_count}</div>
                <div><strong>Alien count:</strong> {stats.alien_count}</div>
                <div><strong>Vampire count:</strong> {stats.vampire_count}</div>
              </div>
            </div>

            {/* Sightings Section */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Sightings</h2>
              {sightings.length === 0 ? (
                <p className="text-gray-400 italic">No sightings yet.</p>
              ) : (
                <ul className="space-y-4">
                  {sightings.map((s) => {
                    const name = CREATURE_MAP[s.creature_id] ?? "";
                    return (
                      <li key={s.sighting_id} className="flex items-start border-b border-gray-100 pb-4">
                        <div className="mr-4 pt-1">{getCreatureIcon(name, 24)}</div>
                        <div>
                          <div className="text-sm text-gray-500">
                            {new Date(s.time_posted).toLocaleDateString()}
                            {s.location && ` - ${s.location}`}
                          </div>
                          <p className="mt-1 text-gray-800">{s.content}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
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