"use client";

import { useEffect, useState } from "react";
import { BadgeModal }            from "@/components/badges/badge-modal";
import { BadgeGrid, BadgeInfo }  from "@/components/badges/badge-grid";
import { Button }                from "@/components/ui/button";
import Sidebar                    from "@/components/sidebar";
import { useRouter }             from "next/navigation";

interface UserProfile {
  user_id: number;
  username: string;
}

interface UserBadges {
  [key: string]: boolean;
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

// All possible badges
const ALL_BADGES: BadgeInfo[] = [
  { key: "bigfoot_amateur",  label: "Bigfoot Amateur",    image: "/badges/bigfoot_amateur.png" },
  { key: "lets_be_friends",  label: "Let's Be Friends",    image: "/badges/lets_be_friends.png" },
  { key: "elite_hunter",     label: "Elite Hunter",        image: "/badges/elite_hunter.png" },
  { key: "socialite",        label: "Socialite",           image: "/badges/socialite.png" },
  { key: "diversify",        label: "Diversify",           image: "/badges/diversify.png" },
  { key: "well_traveled",    label: "Well Traveled",       image: "/badges/world_traveler.png" },
  { key: "hallucinator",     label: "Hallucinator",        image: "/badges/hallucinator.png" },
  { key: "camera_ready",     label: "Camera Ready",        image: "/badges/camera_ready.png" },
  { key: "dragon_rider",     label: "Dragon Rider",        image: "/badges/dragon_rider.png" },
];

export default function BadgesPage() {
  const [userId,     setUserId]     = useState<number|null>(null);
  const [profile,    setProfile]    = useState<UserProfile|null>(null);
  const [badges,     setBadges]     = useState<UserBadges|null>(null);
  const [stats,      setStats]      = useState<UserStats|null>(null);
  const [modalBadge, setModalBadge] = useState<string|null>(null);
  const [showAll,    setShowAll]    = useState(false);
  const [activeTab,  setActiveTab]  = useState("badges");
  const router = useRouter();

  // 1️⃣ figure out who’s logged in
  useEffect(() => {
    const raw = sessionStorage.getItem("user");
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.id) setUserId(u.id);
      } catch {}
    }
  }, []);

  // 2️⃣ once we have an ID, fetch everything
  useEffect(() => {
    if (!userId) return;
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    fetch(`${API}/badges/profile?user_id=${userId}`)
      .then(r => r.json()).then(setProfile).catch(console.error);
    fetch(`${API}/badges/badges?user_id=${userId}`)
      .then(r => r.json()).then(setBadges).catch(console.error);
    fetch(`${API}/badges/stats?user_id=${userId}`)
      .then(r => r.json()).then(setStats).catch(console.error);
  }, [userId]);

  // 3️⃣ earned / unearned
  const earned = ALL_BADGES.filter(b => badges?.[b.key]);
  const unearned = ALL_BADGES.filter(b => !badges?.[b.key]);

  // 4️⃣ apply “so close” filters
  const toShow = unearned.filter(b => {
    if (!stats) return true;
    switch (b.key) {
      case "bigfoot_amateur":  return stats.bigfoot_count    === 0;
      case "lets_be_friends":  return stats.total_friends    === 0;
      case "elite_hunter":     return stats.unique_creature_count < 5;
      case "socialite":        return stats.comments_count   === 0;
      case "diversify":        return stats.unique_creature_count < 2;
      case "well_traveled":    return stats.locations_count  < 5;
      case "camera_ready":     return stats.pictures_count   === 0;
      case "dragon_rider":     return stats.dragon_count     === 0;
      default:                 return true;
    }
  });

  return (
    <div className="flex h-screen bg-[#1e2a44] text-gray-800">
      <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
        <Sidebar />
      </aside>

      <main className="flex-1 ml-[130px] p-6 overflow-y-auto">
        <h1 className="text-white text-4xl font-bold mb-8">
          Welcome Back {profile?.username ?? `User ${userId}`}
        </h1>

        <section className="mb-8">
          <h2 className="text-white text-2xl font-bold mb-4">Badges Earned</h2>
          <BadgeGrid badges={earned} onBadgeClick={setModalBadge} />
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-2xl font-bold">You’re so close…</h2>
            <Button variant="outline" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Hide All" : "See All Badges"}
            </Button>
          </div>
          {showAll
            ? <BadgeGrid badges={ALL_BADGES} onBadgeClick={setModalBadge} />
            : <BadgeGrid badges={toShow}       onBadgeClick={setModalBadge} />
          }
        </section>

        {modalBadge && (
          <BadgeModal badgeKey={modalBadge!} onClose={() => setModalBadge(null)} />
        )}
      </main>
    </div>
  );
}
