// app/socialness/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/sidebar"
import { User as UserIcon } from "lucide-react"

interface PublicUser {
  user_id: number
  full_name: string
  profile_pic?: string
}

export default function SocialnessPage() {
  // ① fallback to your backend container name + port
  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://backend:8000"
  console.log("🤖 SocialnessPage using API =", API)

  const [friends, setFriends] = useState<PublicUser[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        // ② get just the friend‐IDs
        const res = await fetch(`${API}/friends`)
        if (!res.ok) throw new Error(`Friends fetch failed: ${res.status}`)
        const ids: number[] = await res.json()

        // ③ for each ID, hit the lightweight users lookup
        const users = await Promise.all(
          ids.map(async (id) => {
            const r = await fetch(`${API}/api/users/public/${id}`)
            if (!r.ok) throw new Error(`User ${id} lookup failed: ${r.status}`)
            return (await r.json()) as PublicUser
          })
        )

        setFriends(users)
      } catch (e: any) {
        console.error("SocialnessPage load error:", e)
        setError(e.message)
      }
    }
    load()
  }, [API])

  return (
    <div className="flex h-screen bg-[#1e2a44]">
      <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
        <Sidebar />
      </aside>
      <main className="flex-1 ml-[130px] p-6 text-gray-800 overflow-y-auto">
        <h1 className="text-white text-4xl font-bold mb-6 text-center">
          Socialness
        </h1>
        {error && <p className="text-red-500">Error: {error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {friends.map((u) => (
            <Link
              key={u.user_id}
              href={`/profile/${u.user_id}`}
              className="flex items-center bg-white rounded-xl shadow p-4 space-x-4 hover:shadow-lg transition"
            >
              <img
                src={u.profile_pic || "/default-avatar.png"}
                alt={u.full_name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#1e1d4a]">
                  {u.full_name}
                </h2>
                <p className="text-sm text-gray-500">User ID: {u.user_id}</p>
              </div>
              <UserIcon className="w-6 h-6 text-purple-600" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
