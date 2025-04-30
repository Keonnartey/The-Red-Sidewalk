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
  const [friends, setFriends] = useState<PublicUser[]>([])
  const [error, setError] = useState<string|null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:8000/friends")
        if (!res.ok) throw new Error("Failed to fetch friends")
        const ids: number[] = await res.json()

        const users = await Promise.all(
          ids.map(async (id) => {
            const r = await fetch(
              `http://localhost:8000/api/users/public/${id}`
            )
            if (!r.ok) throw new Error(`Failed to fetch user ${id}`)
            return await r.json() as PublicUser
          })
        )
        setFriends(users)
      } catch (e: any) {
        setError(e.message)
      }
    }
    load()
  }, [])

  return (
    <div className="flex h-screen bg-[#1e2a44]">
      <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
        <Sidebar />
      </aside>
      <main className="flex-1 ml-[130px] p-6 text-gray-800 overflow-y-auto">
        <h1 className="text-white text-4xl font-bold mb-6 text-center">Socialness</h1>
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
