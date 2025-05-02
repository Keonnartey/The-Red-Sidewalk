"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation" // Add these imports
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, RefreshCw } from "lucide-react"
import PostCard from "@/components/discuss/PostCard"
import Sidebar from "@/components/sidebar"

// Add this utility function for auth-checking fetch requests
const authFetch = async (url, options = {}) => {
  // Check if user is logged in
  const token = sessionStorage.getItem('token');
  const tokenType = sessionStorage.getItem('token_type');
  const isGuestMode = sessionStorage.getItem('guestMode') === 'true';
  
  // For guest users or logged out users, redirect to login
  if (!token && !tokenType && !isGuestMode) {
    window.location.href = '/';
    throw new Error('Not authenticated');
  }
  
  // Add authorization header if not already present and if we have a token
  if (token && tokenType) {
    const headers = options.headers || {};
    if (!headers['Authorization']) {
      headers['Authorization'] = `${tokenType} ${token}`;
    }
    
    // Return the fetch with auth headers
    return fetch(url, {
      ...options,
      headers,
    });
  }
  
  // Regular fetch for guest users
  return fetch(url, options);
};

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
  const router = useRouter() // Define router
  const pathname = usePathname() // Define pathname
  
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
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

  // 0️⃣ grab the logged-in user from sessionStorage
  useEffect(() => {
    const raw = sessionStorage.getItem("user")
    if (raw) {
      try {
        const u = JSON.parse(raw)
        // ← EDITED: try several fields until we find a numeric ID
        const id =
          (typeof u.id === "number" && u.id) ||
          (typeof u.user_id === "number" && u.user_id) ||
          (u.user && typeof u.user.id === "number" && u.user.id) ||
          null
        setCurrentUserId(id)
      } catch {
        // ignore
      }
    }
  }, [])

  // Update the useEffect in your DiscussPage component
  useEffect(() => {
    // Check auth status on page load
    const checkAuth = () => {
      const token = sessionStorage.getItem('token');
      const user = sessionStorage.getItem('user');
      const isGuestMode = sessionStorage.getItem('guestMode') === 'true';
      
      if (!token && !user && !isGuestMode) {
        // Not authenticated, redirect to login
        router.push('/');
      }
    };
    
    checkAuth();
    
    // Add a storage event listener to detect changes
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]); // Only include router since pathname isn't used in the effect

  // 1️⃣ Fetch posts with auth checking
  async function fetchPosts() {
    try {
      const res = await authFetch("http://localhost:8000/discuss/posts");
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data: Post[] = await res.json();
      setPosts(data);
      
      // build datalist
      const parts = new Set<string>();
      data.forEach(p =>
        p.location.split(",").forEach(chunk => parts.add(chunk.trim()))
      );
      setLocationParts([...parts]);
    } catch (err) {
      console.error(err);
      // If the error is auth-related, the authFetch will already redirect
    }
  }

  // 2️⃣ Fetch your friends with auth checking
  async function fetchFriends() {
    try {
      const res = await authFetch("http://localhost:8000/friends");
      if (!res.ok) throw new Error("Failed to fetch friends");
      const fids: number[] = await res.json();
      setFriends(new Set(fids));
    } catch (err) {
      console.error(err);
    }
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
    // ← EDITED: don't even try to friend yourself
    if (currentUserId !== null && userId === currentUserId) return

    try {
      const res = await authFetch(`http://localhost:8000/friends/${userId}`, {
        method: "POST",
      });
      if (!res.ok) return;
      const { action, friend_id } = await res.json();
      setFriends(prev => {
        const next = new Set(prev);
        if (action === "added") next.add(friend_id);
        else next.delete(friend_id);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  }

  // 👍 Upvote once
  async function handleUpvotePost(postId: number) {
    if (!currentUserId) return
    if (upvotedPosts.has(postId)) return

    try {
      const res = await authFetch(
        `http://localhost:8000/discuss/posts/${postId}/upvote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 1,
            user_id: currentUserId,
          }),
        }
      );
      const json = await res.json();
      if (json.status === "success" || json.status === "already upvoted") {
        setUpvotedPosts(p => new Set(p).add(postId));
        if (json.status === "success") {
          setPosts(ps =>
            ps.map(p =>
              p.post_id === postId
                ? { ...p, upvotes: (p.upvotes ?? 0) + 1 }
                : p
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 👎 Downvote once
  async function handleDownvotePost(postId: number) {
    if (!currentUserId) return
    if (downvotedPosts.has(postId)) return

    try {
      const res = await authFetch(
        `http://localhost:8000/discuss/posts/${postId}/downvote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 1,
            user_id: currentUserId,
          }),
        }
      );
      const json = await res.json();
      if (json.status === "success" || json.status === "already downvoted") {
        setDownvotedPosts(p => new Set(p).add(postId));
        if (json.status === "success") {
          setPosts(ps =>
            ps.map(p =>
              p.post_id === postId
                ? { ...p, downvotes: (p.downvotes ?? 0) + 1 }
                : p
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 💬 Comment
  async function handleAddComment(postId: number, text: string) {
    if (!currentUserId) return

    try {
      const res = await authFetch(
        `http://localhost:8000/discuss/posts/${postId}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            comment: text,
            user_id: currentUserId,
          }),
        }
      );
      if (res.ok) {
        const newC: Comment = {
          comment_id: Date.now(),
          user_id: currentUserId,
          username: "You",
          comment: text,
          upvote_count: 0,
          downvote_count: 0,
        };
        setPosts(ps =>
          ps.map(p =>
            p.post_id === postId
              ? { ...p, comments: [...p.comments, newC] }
              : p
          )
        );
      }
    } catch (err) {
      console.error(err);
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
                canToggleFriend={currentUserId !== null && p.user_id !== currentUserId}
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