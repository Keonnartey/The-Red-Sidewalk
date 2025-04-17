"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThumbsDown, ThumbsUp, Send } from "lucide-react"
import { BigfootIcon, GhostIcon, DragonIcon, AlienIcon } from "@/components/creature-icons"

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
}

// Function to pick the right creature icon
function getCreatureIcon(creature: string, size = 24) {
  switch (creature.toLowerCase()) {
    case "bigfoot":
      return <BigfootIcon color="#9f512d" size={size} />
    case "ghost":
      return <GhostIcon color="white" size={size} />
    case "dragon":
      return <DragonIcon color="#f74301" size={size} />
    case "alien":
      return <AlienIcon color="#03ff00" size={size} />
    default:
      return null
  }
}

interface PostCardProps {
  post: Post
  onUpvote: (postId: number) => void
  onDownvote: (postId: number) => void
  onAddComment: (postId: number, commentText: string) => void
}

export default function PostCard({ post, onUpvote, onDownvote, onAddComment }: PostCardProps) {
  const [commentText, setCommentText] = useState("")

  async function handleAddComment() {
    if (!commentText.trim()) return
    try {
      // Call the parent component's onAddComment with the post ID and comment text
      // Let the parent component handle the API call
      onAddComment(post.post_id, commentText)
      setCommentText("")
    } catch (error) {
      console.error("Failed to post comment", error)
    }
  }

  return (
    <div className="bg-[#d9d9d9] rounded-lg overflow-hidden shadow-md">
      {/* Top user/creature info */}
      <div className="p-4 flex justify-between items-center">
        <div className="font-bold">{post.username || `User_${post.user_id}`}</div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          {getCreatureIcon(post.creature_name, 24)}
          <span>{post.location}</span>
          <span className="text-gray-500">{post.time_posted}</span>
        </div>
      </div>

      {/* Post content */}
      <div className="p-4 text-sm">{post.content}</div>

      {/* Vote buttons */}
      <div className="px-4 mb-2 flex gap-2">
        <Button variant="outline" onClick={() => onUpvote(post.post_id)}>
          <ThumbsUp className="w-4 h-4 mr-1" />
          {post.upvotes ?? 0}
        </Button>
        <Button variant="outline" onClick={() => onDownvote(post.post_id)}>
          <ThumbsDown className="w-4 h-4 mr-1" />
          {post.downvotes ?? 0}
        </Button>
      </div>

      {/* Comments */}
      <div className="p-4 bg-white text-sm flex flex-col gap-2">
        <div className="font-bold">Comments:</div>

        {/* List of comments */}
        <div className="max-h-32 overflow-y-auto flex flex-col gap-2 pr-2">
          {post.comments.length > 0 ? (
            post.comments.map((c) => (
              <div key={c.comment_id}>
                <span className="font-bold">{c.username}:</span> {c.comment}{" "}
                <span className="text-xs text-gray-500">
                  (+{c.upvote_count}/-{c.downvote_count})
                </span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic">No comments yet.</div>
          )}
        </div>

        {/* Comment input */}
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="text-sm"
          />
          <Button size="icon" onClick={handleAddComment}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
