// app/profile/[userId]/page.tsx
import Sidebar from "@/components/sidebar"
import {
  BigfootIcon,
  GhostIcon,
  DragonIcon,
  AlienIcon,
  VampireIcon,
} from "@/components/creature-icons"
import { Star, StarHalf, StarOff } from "lucide-react"

interface PublicProfile {
  user: {
    user_id: number
    full_name: string
    about_me?: string
    profile_pic?: string
  }
  badges: Record<string, boolean>
  stats: {
    total_sightings_count: number
    unique_creature_count: number
    bigfoot_count: number
    dragon_count: number
    ghost_count: number
    alien_count: number
    vampire_count: number
    total_friends: number
    comments_count: number
    like_count: number
    pictures_count: number
    locations_count: number
    user_avg_rating: number
  }
  sightings: Array<{
    sighting_id: number
    creature_id: number
    content: string
    time_posted: string
    location?: string
  }>
}

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

// Map creature_id → creature name
const CREATURE_MAP: Record<number, string> = {
  1: "ghost",
  2: "bigfoot",
  3: "dragon",
  4: "alien",
  5: "vampire",
}

// Pick the right icon for a given creature name
function getCreatureIcon(name: string, size = 20) {
  switch (name.toLowerCase()) {
    case "bigfoot":
      return <BigfootIcon size={size} />
    case "ghost":
      return <GhostIcon size={size} />
    case "dragon":
      return <DragonIcon size={size} />
    case "alien":
      return <AlienIcon size={size} />
    case "vampire":
      return <VampireIcon size={size} />
    default:
      return null
  }
}

// Render ★★★★☆ + (4.3)
function renderStars(avg: number) {
  const full = Math.floor(avg)
  const half = avg - full >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
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
  )
}

export default async function ProfilePage({ params }: PageProps) {
  // Fix #1: Await the params object before destructuring it
  const { userId } = await params
  
  console.log(`Loading profile for userId: ${userId}`)
  
  // Fix #2: Use the environment variable with proper fallback to backend service name
  const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://backend:8000'
  
  console.log(`Using API URL: ${API}`)
  
  try {
    console.log(`Attempting to fetch profile data from ${API}/api/profile/public/${userId}`)
    
    const res = await fetch(`${API}/api/profile/public/${userId}`, {
      cache: "no-store",
    })
    
    if (!res.ok) {
      throw new Error(`Failed to load profile: ${res.status} ${res.statusText}`)
    }

    const data: PublicProfile = await res.json()
    console.log("Successfully fetched profile data:", data)
    
    const { user, badges, stats, sightings } = data

    return (
      <div className="flex h-screen bg-[#1e2a44] text-gray-800">
        <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
          <Sidebar />
        </aside>

        <main className="flex-1 ml-[130px] p-6 overflow-y-auto">
          {/* PROFILE CARD */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
            {/* Header: pic, name + stars, about */}
            <header className="flex items-center space-x-4">
              {user.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded-full" />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold">{user.full_name}</h1>
                  {stats.user_avg_rating && renderStars(stats.user_avg_rating)}
                </div>
                {user.about_me && (
                  <p className="italic text-gray-600 mt-1">{user.about_me}</p>
                )}
              </div>
            </header>

            {/* Badges (filter out any "user_id" key) */}
            <section>
              <h2 className="font-semibold mb-2">Badges</h2>
              <ul className="flex flex-wrap gap-2">
                {badges && Object.entries(badges)
                  .filter(([key, got]) => key !== "user_id" && got)
                  .map(([name]) => (
                    <li
                      key={name}
                      className="px-3 py-1 bg-purple-100 rounded-full text-sm"
                    >
                      {name.replace(/_/g, " ")}
                    </li>
                  ))}
              </ul>
            </section>

            {/* Stats */}
            {stats && (
              <section>
                <h2 className="font-semibold mb-2">Stats</h2>
                <ul className="grid grid-cols-2 gap-4 text-sm">
                  <li>
                    <strong>Total sightings:</strong> {stats.total_sightings_count || 0}
                  </li>
                  <li>
                    <strong>Total friends:</strong> {stats.total_friends || 0}
                  </li>
                  <li>
                    <strong>Unique creatures:</strong> {stats.unique_creature_count || 0}
                  </li>
                  <li>
                    <strong>Comments made:</strong> {stats.comments_count || 0}
                  </li>
                  <li>
                    <strong>Bigfoot count:</strong> {stats.bigfoot_count || 0}
                  </li>
                  <li>
                    <strong>Likes received:</strong> {stats.like_count || 0}
                  </li>
                  <li>
                    <strong>Dragon count:</strong> {stats.dragon_count || 0}
                  </li>
                  <li>
                    <strong>Pictures posted:</strong> {stats.pictures_count || 0}
                  </li>
                  <li>
                    <strong>Ghost count:</strong> {stats.ghost_count || 0}
                  </li>
                  <li>
                    <strong>Locations visited:</strong> {stats.locations_count || 0}
                  </li>
                  <li>
                    <strong>Alien count:</strong> {stats.alien_count || 0}
                  </li>
                  <li>
                    <strong>Vampire count:</strong> {stats.vampire_count || 0}
                  </li>
                </ul>
              </section>
            )}
          </div>

          {/* SIGHTINGS LIST */}
          <section className="max-w-2xl mx-auto mt-8">
            <h2 className="text-white text-xl font-semibold mb-4">Sightings</h2>
            {!sightings || sightings.length === 0 ? (
              <p className="text-gray-400 italic">No sightings yet.</p>
            ) : (
              <ul className="space-y-4">
                {sightings.map((s) => {
                  const name = CREATURE_MAP[s.creature_id] ?? ""
                  return (
                    <li
                      key={s.sighting_id}
                      className="flex items-start bg-white rounded-lg border border-gray-200 p-4 hover:shadow transition-shadow"
                    >
                      <div className="mr-4 pt-1">{getCreatureIcon(name, 24)}</div>
                      <div>
                        <div className="text-sm text-gray-500">
                          {new Date(s.time_posted).toLocaleDateString()}
                          {s.location && ` - ${s.location}`}
                        </div>
                        <p className="mt-1 text-gray-800">{s.content}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error fetching profile:', error)
    return (
      <div className="flex h-screen bg-[#1e2a44] text-white p-6">
        <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
          <Sidebar />
        </aside>
        
        <main className="flex-1 ml-[130px] p-6">
          <div className="max-w-2xl mx-auto bg-[#2d2a44] rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold mb-4">Profile Error</h1>
            <p className="text-red-400">
              Failed to load profile for user {userId}. Please try again later.
            </p>
            <p className="mt-4 text-sm text-gray-400">
              Error details: {(error as Error).message}
            </p>
          </div>
        </main>
      </div>
    )
  }
}