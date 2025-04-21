"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import PostCard from "@/components/discuss/PostCard"

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
  creature_name: string // e.g. "bigfoot"
  location: string
  content: string
  time_posted: string
  upvotes: number | null
  downvotes: number | null
  comments: Comment[]
}

export default function DiscussPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [creatureFilter, setCreatureFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [loading, setLoading] = useState(false)

  // -------------------------------------------
  // Fetch posts from your backend
  // -------------------------------------------
  async function fetchPosts() {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (creatureFilter) queryParams.append("creature", creatureFilter)
      if (locationFilter) queryParams.append("location", locationFilter)

      const res = await fetch(`http://localhost:8000/discuss/posts?${queryParams.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch posts")
      const data: Post[] = await res.json()
      setPosts(data)
    } catch (err) {
      console.error("Error fetching posts:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  // -------------------------------------------
  // Filter Handlers
  // -------------------------------------------
  function applyFilters() {
    fetchPosts()
  }

  function clearFilters() {
    setCreatureFilter("")
    setLocationFilter("")
    // Re-fetch with empty filters
    fetchPosts()
  }

  // -------------------------------------------
  // Upvote / Downvote
  // -------------------------------------------
  async function handleUpvotePost(postId: number) {
    try {
      const res = await fetch(`http://localhost:8000/discuss/posts/${postId}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      })
      if (!res.ok) throw new Error("Failed to upvote post")
      // Re-fetch posts to see updated votes
      fetchPosts()
    } catch (err) {
      console.error("Error upvoting post:", err)
    }
  }

  async function handleDownvotePost(postId: number) {
    try {
      const res = await fetch(`http://localhost:8000/discuss/posts/${postId}/downvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      })
      if (!res.ok) throw new Error("Failed to downvote post")
      // Re-fetch posts to see updated votes
      fetchPosts()
    } catch (err) {
      console.error("Error downvoting post:", err)
    }
  }

  // -------------------------------------------
  // Add Comment
  // -------------------------------------------
  async function handleAddComment(postId: number, commentText: string) {
    try {
      const payload = {
        user_id: 1, // or 100, or whichever user you want
        comment: commentText,
        upvote_count: 0,
        downvote_count: 0,
      }
      const res = await fetch(`http://localhost:8000/discuss/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to add comment")
      // Re-fetch posts to display the new comment
      fetchPosts()
    } catch (err) {
      console.error("Error adding comment:", err)
    }
  }

  // -------------------------------------------
  // Add Flag
  // -------------------------------------------

  async function handleFlagContent(postId: number, reason: string, customReason: string) {
    const payload = {
      content_id: postId,
      content_type: "post",
      user_id: 1, // Replace with the actual user ID dynamically if you have auth
      reason,
      custom_reason: customReason,
    }

    try {
      const res = await fetch("http://localhost:8000/content_flags/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert("✅ Post reported successfully!")
      } else {
        alert("❌ Failed to report post.")
      }
    } catch (err) {
      console.error("Error reporting post:", err)
    }
  }

  // -------------------------------------------
  // Render
  // -------------------------------------------
  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <h1 className="text-white text-4xl font-bold text-center mb-8">DISCUSS SIGHTINGS WITH OTHERS</h1>

      {/* 130px offset for sidebar + center content */}
      <div className="pl-[130px]">
        <div className="max-w-5xl mx-auto">
          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-2">
              <Input
                className="bg-[#dacfff] py-2 rounded-full"
                placeholder="Filter by Creature"
                value={creatureFilter}
                onChange={(e) => setCreatureFilter(e.target.value)}
              />
              <Input
                className="bg-[#dacfff] py-2 rounded-full"
                placeholder="Filter by Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <Button onClick={applyFilters}>Apply</Button>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>

          {loading && <p className="text-white text-center mb-4">Loading posts...</p>}

          {/* Posts */}
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.post_id}
                post={post}
                onUpvote={handleUpvotePost}
                onDownvote={handleDownvotePost}
                onAddComment={(postId, commentText) => handleAddComment(postId, commentText)}
                onFlagContent={handleFlagContent}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
