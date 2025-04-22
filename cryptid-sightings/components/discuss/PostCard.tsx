// components/PostCard.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ThumbsDown, ThumbsUp, Send, Flag } from "lucide-react"
import { BigfootIcon, GhostIcon, DragonIcon, AlienIcon } from "@/components/creature-icons"
import FlagModal from "@/components/flag-modal"

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

function getCreatureIcon(creature: string, size = 20) {
  switch (creature.toLowerCase()) {
    case "bigfoot":
      return <BigfootIcon color="#9f512d" size={size} />
    case "ghost":
      return <GhostIcon color="#6b7280" size={size} />
    case "dragon":
      return <DragonIcon color="#f74301" size={size} />
    case "alien":
      return <AlienIcon color="#03ff00" size={size} />
    default:
      return null
  }
}

interface Props {
  post: Post
  onUpvote: (id: number) => void
  onDownvote: (id: number) => void
  onAddComment: (id: number, text: string) => void
  onFlagContent: (id: number, reason: string, custom: string) => void
  disableUpvote?: boolean
  disableDownvote?: boolean
  imageClassName?: string
}

export default function PostCard({
  post,
  onUpvote,
  onDownvote,
  onAddComment,
  onFlagContent,
  disableUpvote = false,
  disableDownvote = false,
  imageClassName = "max-w-lg w-full h-auto object-cover rounded-lg shadow-lg",
}: Props) {
  const [commentText, setCommentText] = useState("")
  const [showFlagModal, setShowFlagModal] = useState(false)

  const handleFlagSubmit = (code: string, custom: string) => {
    onFlagContent(post.post_id, code, custom)
    setShowFlagModal(false)
  }

  const handleAdd = () => {
    if (!commentText.trim()) return
    onAddComment(post.post_id, commentText)
    setCommentText("")
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg max-w-2xl mx-auto overflow-hidden hover:shadow-2xl transition-shadow">
      {/* HEADER */}
      <div className="px-6 py-4 flex justify-between items-center border-b">
        <h2 className="font-semibold text-lg">{post.username}</h2>
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center space-x-1">
            {getCreatureIcon(post.creature_name)}
            <span>{post.location}</span>
          </div>
          <time dateTime={post.time_posted}>
            {new Date(post.time_posted).toLocaleDateString()}
          </time>
        </div>
      </div>

      {/* IMAGE */}
      {post.images.length > 0 && (
        <div className="bg-gray-100 flex justify-center p-4">
          <img
            src={post.images[0]}
            alt="Post image"
            className={imageClassName}
          />
        </div>
      )}

      {/* CONTENT */}
      <div className="px-6 py-4">
        <p className="text-gray-800">{post.content}</p>
      </div>

      {/* ACTIONS */}
      <div className="px-6 py-2 flex items-center space-x-4 border-t">
        <Button
          variant="outline"
          onClick={() => onUpvote(post.post_id)}
          disabled={disableUpvote}
        >
          <ThumbsUp className="w-5 h-5 mr-1" />
          {post.upvotes ?? 0}
        </Button>
        <Button
          variant="outline"
          onClick={() => onDownvote(post.post_id)}
          disabled={disableDownvote}
        >
          <ThumbsDown className="w-5 h-5 mr-1" />
          {post.downvotes ?? 0}
        </Button>
        <div className="ml-auto">
          <Button
            variant="ghost"
            className="text-red-500 hover:bg-red-50"
            size="sm"
            onClick={() => setShowFlagModal(true)}
          >
            <Flag className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* COMMENTS */}
      <div className="bg-gray-50 px-6 py-4 space-y-3">
        {post.comments.length > 0 ? (
          post.comments.map((c) => (
            <div key={c.comment_id} className="flex justify-between">
              <span>
                <strong>{c.username}</strong> {c.comment}
              </span>
              <span className="text-xs text-gray-400">
                (+{c.upvote_count}/-{c.downvote_count})
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic">No comments yet.</p>
        )}
        <div className="flex items-center space-x-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 text-sm"
          />
          <Button onClick={handleAdd} size="icon">
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <FlagModal
        open={showFlagModal}
        title="Flag Post"
        onClose={() => setShowFlagModal(false)}
        onSubmit={handleFlagSubmit}
      />
    </div>
  )
}
