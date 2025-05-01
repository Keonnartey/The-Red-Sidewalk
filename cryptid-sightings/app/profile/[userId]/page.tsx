"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  MessageCircle as ChatIcon,
  Award as BadgeIcon,
  LogOut as LogOutIcon,
  Star,
  StarHalf,
  StarOff,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  BigfootIcon,
  GhostIcon,
  DragonIcon,
  AlienIcon,
  VampireIcon,
} from "@/components/creature-icons";
import { BadgeGrid } from "@/components/badges/badge-grid";
import { BadgeModal } from "@/components/badges/badge-modal";

const CREATURE_MAP: Record<number, string> = {
  1: "ghost",
  2: "bigfoot",
  3: "dragon",
  4: "alien",
  5: "vampire",
};

const ALL_BADGES = [
  { key: "bigfoot_amateur", label: "Bigfoot Amateur", image: "/badges/bigfoot_amateur.png" },
  { key: "lets_be_friends", label: "Let's Be Friends", image: "/badges/lets_be_friends.png" },
  { key: "elite_hunter", label: "Elite Hunter", image: "/badges/elite_hunter.png" },
  { key: "socialite", label: "Socialite", image: "/badges/socialite.png" },
  { key: "diversify", label: "Diversify", image: "/badges/diversify.png" },
  { key: "well_traveled", label: "Well Traveled", image: "/badges/world_traveler.png" },
  { key: "hallucinator", label: "Hallucinator", image: "/badges/hallucinator.png" },
  { key: "camera_ready", label: "Camera Ready", image: "/badges/camera_ready.png" },
  { key: "dragon_rider", label: "Dragon Rider", image: "/badges/dragon_rider.png" },
];

function getCreatureIcon(name: string, size = 20) {
  switch (name.toLowerCase()) {
    case "bigfoot":
      return <BigfootIcon size={size} />;
    case "ghost":
      return <GhostIcon size={size} />;
    case "dragon":
      return <DragonIcon size={size} />;
    case "alien":
      return <AlienIcon size={size} />;
    case "vampire":
      return <VampireIcon size={size} />;
    default:
      return null;
  }
}

function renderStars(avg: number) {
  const rating = avg != null ? avg : 0;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
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
      <span className="text-gray-500 text-sm">({rating.toFixed(1)})</span>
    </div>
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "Not specified";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}

export default function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  // unwrap the promise
  const { userId } = React.use(params);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"general" | "socialness" | "badges" | "settings">("general");
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [modalBadgeKey, setModalBadgeKey] = useState<string | null>(null);

  // determine if it's your own profile
  useEffect(() => {
    const stored = sessionStorage.getItem("user");
    if (stored) {
      const me = JSON.parse(stored);
      if (me.id?.toString() === userId) {
        setIsCurrentUser(true);
      }
    }
  }, [userId]);

  // fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        if (!userId || isNaN(+userId)) {
          throw new Error("Invalid user ID");
        }
        const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
        const res = await fetch(`${API}/api/profile/public/${userId}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        setProfileData(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    router.push("/");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#1e2a44] flex items-center justify-center">
        <div className="animate-spin h-16 w-16 border-t-2 border-b-2 border-white rounded-full" />
        <p className="text-white mt-4">Loading profile…</p>
      </div>
    );

  if (error || !profileData)
    return (
      <div className="flex h-screen bg-[#1e2a44] p-6">
        <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
          <Sidebar />
        </aside>
        <main className="flex-1 ml-[130px] p-6">
          <div className="bg-[#2d2a44] p-6 rounded-lg text-red-400">
            <h1 className="text-2xl font-bold mb-2">Error</h1>
            <p>{error || "No profile data."}</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Return Home
            </Button>
          </div>
        </main>
      </div>
    );

  const { user, stats, badges, sightings } = profileData;

  // badge arrays
  const earnedBadges = ALL_BADGES.filter((b) => badges[b.key]);
  const toEarnBadges = ALL_BADGES.filter((b) => !badges[b.key]);

  function renderContent() {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-6">
                {user.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt={user.full_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gray-500">
                      {user.full_name?.[0] || "U"}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{user.full_name}</h2>
                    {renderStars(stats.user_avg_rating)}
                  </div>
                  {user.about_me && (
                    <p className="italic text-gray-600 mt-1">{user.about_me}</p>
                  )}
                </div>
              </div>
              {/* Basic Info */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {user.username && (
                  <div>
                    <strong>Username:</strong> {user.username}
                  </div>
                )}
                {user.email && (
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                )}
                {user.birthday && (
                  <div>
                    <strong>Birthday:</strong> {formatDate(user.birthday)}
                  </div>
                )}
                {user.created_at && (
                  <div>
                    <strong>Joined:</strong> {formatDate(user.created_at)}
                  </div>
                )}
              </div>
              {/* Location */}
              {[
                user.hometown_city,
                user.hometown_state,
                user.hometown_country,
              ]
                .filter(Boolean)
                .length > 0 && (
                <div className="mt-4 text-sm">
                  <strong>Location:</strong>{" "}
                  {[
                    user.hometown_city,
                    user.hometown_state,
                    user.hometown_country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>
            {/* Stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Stats</h3>
              <ul className="grid grid-cols-2 gap-4 text-sm">
                <li>
                  <strong>Total sightings:</strong> {stats.total_sightings_count}
                </li>
                <li>
                  <strong>Total friends:</strong> {stats.total_friends}
                </li>
                <li>
                  <strong>Unique creatures:</strong> {stats.unique_creature_count}
                </li>
                <li>
                  <strong>Comments made:</strong> {stats.comments_count}
                </li>
                <li>
                  <strong>Bigfoot count:</strong> {stats.bigfoot_count}
                </li>
                <li>
                  <strong>Likes received:</strong> {stats.like_count}
                </li>
                <li>
                  <strong>Dragon count:</strong> {stats.dragon_count}
                </li>
                <li>
                  <strong>Pictures posted:</strong> {stats.pictures_count}
                </li>
                <li>
                  <strong>Ghost count:</strong> {stats.ghost_count}
                </li>
                <li>
                  <strong>Locations visited:</strong> {stats.locations_count}
                </li>
                <li>
                  <strong>Alien count:</strong> {stats.alien_count}
                </li>
                <li>
                  <strong>Vampire count:</strong> {stats.vampire_count}
                </li>
              </ul>
            </div>
            {/* Recent Sightings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Recent Sightings</h3>
              {sightings.length === 0 ? (
                <p className="italic text-gray-400">No sightings yet.</p>
              ) : (
                <ul className="space-y-4">
                  {sightings.map((s: any) => {
                    const name = CREATURE_MAP[s.creature_id] || "";
                    return (
                      <li
                        key={s.sighting_id}
                        className="flex items-start border-b pb-3"
                      >
                        <div className="mr-4 pt-1">
                          {getCreatureIcon(name, 24)}
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            {new Date(s.time_posted).toLocaleDateString()}
                            {s.location && ` — ${s.location}`}
                          </div>
                          <p className="mt-1">{s.content}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        );

      case "socialness":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Social Activity</h3>
              <ul className="grid grid-cols-2 gap-4 text-sm">
                <li>
                  <strong>Total friends:</strong> {stats.total_friends}
                </li>
                <li>
                  <strong>Comments made:</strong> {stats.comments_count}
                </li>
                <li>
                  <strong>Likes received:</strong> {stats.like_count}
                </li>
                <li>
                  <strong>Your rating:</strong> {renderStars(stats.user_avg_rating)}
                </li>
              </ul>
            </div>
          </div>
        );

      case "badges":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Badges You’ve Earned</h3>
              <BadgeGrid
                badges={earnedBadges}
                onBadgeClick={(key) => setModalBadgeKey(key)}
              />
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Badges to Earn</h3>
              <BadgeGrid
                badges={toEarnBadges}
                onBadgeClick={(key) => setModalBadgeKey(key)}
              />
            </div>
            {modalBadgeKey && (
              <BadgeModal
                badgeKey={modalBadgeKey}
                onClose={() => setModalBadgeKey(null)}
              />
            )}
          </div>
        );

    case "settings":
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold mb-4">Settings</h3>
            {/* Put your settings form/controls here */}
            <p className="text-sm text-gray-600">
              Here you can update your profile, change password, etc.
            </p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#1e2a44] flex">
      <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
        <Sidebar />
      </aside>
      <main className="flex-1 ml-[130px] p-6 overflow-y-auto">
        {/* top‐level name + stars */}
        <header className="mb-6">
          <h1 className="text-white text-4xl font-bold flex items-center gap-3">
            {user.full_name}
            {renderStars(stats.user_avg_rating)}
          </h1>
        </header>

        <div className="grid md:grid-cols-[1fr_200px] gap-6">
          {/* left: content */}
          <div>{renderContent()}</div>

          {/* right: tabs + logout */}
          <nav className="space-y-3">
            <Button
              variant="ghost"
              className={`w-full flex items-center gap-2 px-4 py-4 rounded-full ${
                activeTab === "general"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("general")}
            >
              <UserIcon size={18} /> General
            </Button>

            <Button
              variant="ghost"
              className={`w-full flex items-center gap-2 px-4 py-4 rounded-full ${
                activeTab === "socialness"
                  ? "bg-gradient-to-r from-green-400 to-teal-600 text-white shadow-lg"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("socialness")}
            >
              <ChatIcon size={18} /> Socialness
            </Button>

            <Button
              variant="ghost"
              className={`w-full flex items-center gap-2 px-4 py-4 rounded-full ${
                activeTab === "badges"
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("badges")}
            >
              <BadgeIcon size={18} /> Badges
            </Button>

            {isCurrentUser && (
              <Button
                variant="ghost"
                className={`
                  w-full flex items-center gap-2 px-4 py-4 rounded-full
                  ${
                    activeTab === "settings"
                      ? "bg-gradient-to-r from-blue-400 to-indigo-600 text-white shadow-lg"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }
                `}
                onClick={() => setActiveTab("settings")}
              >
                <LogOutIcon size={18} /> Settings
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full flex items-center gap-2 px-4 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
              onClick={handleLogout}
            >
              <LogOutIcon size={18} /> Logout
            </Button>
          </nav>
        </div>
      </main>
    </div>
  );
}
