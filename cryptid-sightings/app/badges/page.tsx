"use client";

import { useEffect, useState } from "react";
import { BadgeModal } from "@/components/badges/badge-modal";
import { BadgeGrid } from "@/components/badges/badge-grid";
import { Button } from "@/components/ui/button";

interface UserProfile {
  user_id: number;
  username: string;
}

interface UserBadges {
  bigfoot_amateur: boolean;
  lets_be_friends: boolean;
  elite_hunter: boolean;
  socialite: boolean;
  diversify: boolean;
  well_traveled: boolean;
  hallucinator: boolean;
  camera_ready: boolean;
  dragon_rider: boolean;
}

interface UserStats {
  unique_creature_count: number;
  total_sightings_count: number;
  bigfoot_count: number;
  dragon_count: number;
  ghost_count: number;
  alien_count: number;
  vampire_count: number;
  total_friends: number;
  comments_count: number;
  like_count: number;
  pictures_count: number;
  locations_count: number;
  user_avg_rating: number;
}

// All possible badges.
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

export default function BadgesPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadges | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [modalBadge, setModalBadge] = useState<string | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  // For demonstration purposes, using a hardcoded user id.
  const userId = 1;

  useEffect(() => {
    fetchProfile();
    fetchBadges();
    fetchStats();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`http://localhost:8000/badges/profile?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data: UserProfile = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchBadges() {
    try {
      const res = await fetch(`http://localhost:8000/badges/badges?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch badges");
      const data: UserBadges = await res.json();
      setBadges(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`http://localhost:8000/badges/stats?user_id=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data: UserStats = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Earned badges come from user_badges booleans.
  const earnedBadges = ALL_BADGES.filter(
    (b) => badges && badges[b.key as keyof UserBadges] === true
  );

  // Unearned badges are those not yet earned.
  const unearnedBadges = ALL_BADGES.filter(
    (b) => !badges || badges[b.key as keyof UserBadges] === false
  );

  // Filter unearned badges based on user_stats.
  const filteredUnearnedBadges = unearnedBadges.filter((b) => {
    if (!stats) return true; // If stats are not loaded, show badge.
    switch (b.key) {
      case "bigfoot_amateur":
        // Earned if at least one Bigfoot sighting reported.
        return stats.bigfoot_count === 0;
      case "lets_be_friends":
        return stats.total_friends === 0;
      case "elite_hunter":
        // Earned if the user has reported 5 or more unique creatures.
        return stats.unique_creature_count < 5;
      case "socialite":
        return stats.comments_count === 0;
      case "diversify":
        // Earned if the user has reported sightings of at least 2 different creatures.
        return stats.unique_creature_count < 2;
      case "well_traveled":
        // Earned if the user has found creatures in 5 or more different locations.
        return stats.locations_count < 5;
      case "hallucinator":
        // For now, always show this badge if not earned.
        return true;
      case "camera_ready":
        return stats.pictures_count === 0;
      case "dragon_rider":
        return stats.dragon_count === 0;
      default:
        return true;
    }
  });

    return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <div className="ml-[130px]">
        {/* 1. Welcome Back Title */}
        <h1 className="text-white text-4xl font-bold mb-8">
          Welcome Back {profile?.username ?? `User ${profile?.user_id ?? ""}`}
        </h1>

        {/* 2. Badges Earned Section */}
        <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700 mb-6">
          <h2 className="text-white text-2xl font-bold mb-6">Badges Earned</h2>
          <BadgeGrid
            badges={earnedBadges}
            onBadgeClick={(badgeKey) => setModalBadge(badgeKey)}
          />
        </div>

        {/* 3. Badges to Earn Section */}
        <div className="bg-[#1e2a44] p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-2xl font-bold mb-6">You're so close...</h2>
            <Button variant="outline" onClick={() => setShowAllBadges(!showAllBadges)}>
              {showAllBadges ? "Hide All Badges" : "See All Badges"}
            </Button>
          </div>

          {!showAllBadges ? (
            <BadgeGrid
              badges={filteredUnearnedBadges}
              onBadgeClick={(badgeKey) => setModalBadge(badgeKey)}
            />
          ) : (
            // 5. Show full list of all possible badges.
            <BadgeGrid
              badges={ALL_BADGES}
              onBadgeClick={(badgeKey) => setModalBadge(badgeKey)}
            />
          )}
        </div>

        {/* 4. Badge Modal Popup */}
        {modalBadge && (
          <BadgeModal badgeKey={modalBadge} onClose={() => setModalBadge(null)} />
        )}
      </div>
    </div>
  );

}
