"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, RefreshCw } from "lucide-react"
import PostCard from "@/components/discuss/PostCard"
import Sidebar from "@/components/Sidebar"

interface Comment {
  comment_id: number
  user_id: number
  username: string
  comment: string
  upvote_count: number
  downvote_count: number
}

interface Post {
  post_id: number
  user_id: number
  username: string
  creature_name: string
  location: string
  content: string
  time_posted: string
  upvotes: number | null
  downvotes: number | null
  comments: Comment[]
  images: string[]
}

export default function DiscussPage() {
  const CURRENT_USER_ID = 1

  const [posts, setPosts] = useState<Post[]>([])
  const [friends, setFriends] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  // Filters
  const [creatureFilter, setCreatureFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [showImagesOnly, setShowImagesOnly] = useState(false)

  // Prevent repeat up/down
  const [upvotedPosts, setUpvotedPosts] = useState<Set<number>>(new Set())
  const [downvotedPosts, setDownvotedPosts] = useState<Set<number>>(new Set())

  // For our <datalist>
  const [locationParts, setLocationParts] = useState<string[]>([])

  // 1️⃣ Fetch posts
  async function fetchPosts() {
    const res = await fetch("http://localhost:8000/discuss/posts")
    if (!res.ok) throw new Error("Failed to fetch posts")
    const data: Post[] = await res.json()
    setPosts(data)

    // build datalist
    const parts = new Set<string>()
    data.forEach(p =>
      p.location.split(",").forEach(chunk => parts.add(chunk.trim()))
    )
    setLocationParts([...parts])
  }

  // 2️⃣ Fetch your friends
  async function fetchFriends() {
    const res = await fetch("http://localhost:8000/friends")
    if (!res.ok) throw new Error("Failed to fetch friends")
    const fids: number[] = await res.json()
    setFriends(new Set(fids))
  }

  // Combined
  async function fetchAll() {
    setLoading(true)
    try {
      await Promise.all([fetchPosts(), fetchFriends()])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  // 🔃 Toggle friend / unfriend
  async function handleToggleFriend(userId: number) {
    const res = await fetch(`http://localhost:8000/friends/${userId}`, {
      method: "POST",
    })
    if (!res.ok) return
    const { action, friend_id } = await res.json()
    setFriends(prev => {
      const next = new Set(prev)
      if (action === "added") next.add(friend_id)
      else next.delete(friend_id)
      return next
    })
  }

  // 👍 Upvote once
  async function handleUpvotePost(postId: number) {
    if (upvotedPosts.has(postId)) return
    const res = await fetch(
      `http://localhost:8000/discuss/posts/${postId}/upvote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      }
    )
    const json = await res.json()
    if (json.status === "success" || json.status === "already upvoted") {
      setUpvotedPosts(p => new Set(p).add(postId))
      if (json.status === "success") {
        setPosts(ps =>
          ps.map(p =>
            p.post_id === postId
              ? { ...p, upvotes: (p.upvotes ?? 0) + 1 }
              : p
          )
        )
      }
    }
  }

  // 👎 Downvote once
  async function handleDownvotePost(postId: number) {
    if (downvotedPosts.has(postId)) return
    const res = await fetch(
      `http://localhost:8000/discuss/posts/${postId}/downvote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      }
    )
    const json = await res.json()
    if (json.status === "success" || json.status === "already downvoted") {
      setDownvotedPosts(p => new Set(p).add(postId))
      if (json.status === "success") {
        setPosts(ps =>
          ps.map(p =>
            p.post_id === postId
              ? { ...p, downvotes: (p.downvotes ?? 0) + 1 }
              : p
          )
        )
      }
    }
  }

  // 💬 Comment
  async function handleAddComment(postId: number, text: string) {
    const res = await fetch(
      `http://localhost:8000/discuss/posts/${postId}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: text }),
      }
    )
    if (res.ok) {
      const newC: Comment = {
        comment_id: Date.now(),
        user_id: CURRENT_USER_ID,
        username: "You",
        comment: text,
        upvote_count: 0,
        downvote_count: 0,
      }
      setPosts(ps =>
        ps.map(p =>
          p.post_id === postId
            ? { ...p, comments: [...p.comments, newC] }
            : p
        )
      )
    }
  }

  // apply filters in‐memory
  const visiblePosts = posts
    .filter(p =>
      creatureFilter
        ? p.creature_name.toLowerCase().includes(creatureFilter.toLowerCase())
        : true
    )
    .filter(p =>
      locationFilter
        ? p.location.toLowerCase().includes(locationFilter.toLowerCase())
        : true
    )
    .filter(p => (showImagesOnly ? p.images.length > 0 : true))

  return (
    <div className="flex h-screen bg-[#1e2a44] text-gray-800">
      <aside className="fixed top-0 left-0 h-full w-[130px] bg-[#2d2a44]">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col ml-[130px]">
        <header className="p-6">
          <h1 className="text-white text-4xl font-bold text-center mb-6">
            DISCUSS SIGHTINGS
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="relative w-48">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <Input
                placeholder="Creature…"
                value={creatureFilter}
                onChange={e => setCreatureFilter(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-full bg-[#dacfff] placeholder-gray-600 focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="relative w-48">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={16}
              />
              <input
                list="locParts"
                placeholder="Location…"
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-full bg-[#dacfff] placeholder-gray-600 focus:ring-2 focus:ring-purple-400 outline-none w-full"
              />
              <datalist id="locParts">
                {locationParts.map(chunk => (
                  <option key={chunk} value={chunk} />
                ))}
              </datalist>
            </div>

            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={showImagesOnly}
                onChange={() => setShowImagesOnly(s => !s)}
                className="h-5 w-5 rounded border-gray-300 bg-white focus:ring-2 focus:ring-purple-400"
              />
              <span>Images only</span>
            </label>

            <Button
              onClick={fetchAll}
              className="flex items-center space-x-2 h-10 bg-purple-800 hover:bg-purple-700 px-4 rounded-full"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {loading && (
              <p className="text-center text-white">Loading posts…</p>
            )}
            {!loading && visiblePosts.length === 0 && (
              <p className="text-center text-gray-400">
                No sightings match those filters.
              </p>
            )}
            {visiblePosts.map(p => (
              <PostCard
                key={p.post_id}
                post={p}
                onUpvote={handleUpvotePost}
                onDownvote={handleDownvotePost}
                onAddComment={handleAddComment}
                onFlagContent={() => {}}
                disableUpvote={upvotedPosts.has(p.post_id)}
                disableDownvote={downvotedPosts.has(p.post_id)}
                isFriend={friends.has(p.user_id)}
                canToggleFriend={p.user_id !== CURRENT_USER_ID}
                onToggleFriend={() => handleToggleFriend(p.user_id)}
                imageClassName="max-w-sm w-full h-auto object-cover rounded-lg shadow-lg mx-auto"
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
