"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, Send } from "lucide-react";
import {
  BigfootIcon,
  GhostIcon,
  DragonIcon,
  AlienIcon,
} from "@/components/creature-icons"; // Example import

interface Comment {
  comment_id: number;
  user_id: number;
  username: string;
  comment: string;
  upvote_count: number;
  downvote_count: number;
}

interface Post {
  post_id: number;
  user_id: number;
  username: string;
  creature_name: string; // e.g. "bigfoot"
  location: string;
  content: string;
  time_posted: string;
  upvotes: number | null;
  downvotes: number | null;
  comments: Comment[];
}

// Function to pick the right creature icon
function getCreatureIcon(creature: string, size = 24) {
  switch (creature.toLowerCase()) {
    case "bigfoot":
      return <BigfootIcon color="#9f512d" size={size} />;
    case "ghost":
      return <GhostIcon color="white" size={size} />;
    case "dragon":
      return <DragonIcon color="#f74301" size={size} />;
    case "alien":
      return <AlienIcon color="#03ff00" size={size} />;
    default:
      return null;
  }
}

interface PostCardProps {
  post: Post;
  onUpvote: (postId: number) => void;
  onDownvote: (postId: number) => void;
}

export default function PostCard({ post, onUpvote, onDownvote }: PostCardProps) {
  const [commentText, setCommentText] = useState("");

  async function handleAddComment() {
    // Implement your comment POST logic here.
    // For example:
    // await fetch(`http://localhost:8000/discuss/posts/${post.post_id}/comment`, { ... });
    // Then re-fetch posts in the parent or pass a callback here too.
    setCommentText("");
  }

  return (
    <div className="bg-[#d9d9d9] rounded-lg overflow-hidden">
      <div className="p-4 flex justify-between items-center">
        <div className="font-bold">
          {post.username || `User_${post.user_id}`}
        </div>
        <div className="flex items-center gap-2">
          {getCreatureIcon(post.creature_name, 24)}
          <span className="text-sm">{post.location}</span>
          <span className="text-sm text-gray-600">{post.time_posted}</span>
        </div>
      </div>

      <div className="p-4 text-sm">{post.content}</div>

      {/* Up/Down Votes */}
      <div className="px-4 mb-2 flex gap-2">
        <Button variant="outline" onClick={() => onUpvote(post.post_id)}>
          <ThumbsUp className="w-4 h-4 mr-1" />
          {post.upvotes || 0}
        </Button>
        <Button variant="outline" onClick={() => onDownvote(post.post_id)}>
          <ThumbsDown className="w-4 h-4 mr-1" />
          {post.downvotes || 0}
        </Button>
      </div>

      {/* Comments */}
      <div className="p-4 bg-white text-sm">
        <div className="mb-2 font-bold">Comments:</div>

        {/* Limit height to allow scrolling if more than ~3 comments */}
        <div className="max-h-24 overflow-y-auto flex flex-col gap-2">
          {post.comments.map((c) => (
            <div key={c.comment_id}>
              <span className="font-bold">{c.username}:</span> {c.comment}{" "}
              <span className="text-xs text-gray-500">
                (+{c.upvote_count}/-{c.downvote_count})
              </span>
            </div>
          ))}
        </div>

        {/* Add comment input */}
        <div className="flex items-center gap-2 mt-2">
          <Input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
          />
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={handleAddComment}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
