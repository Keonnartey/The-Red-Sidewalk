"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SightingPopupModalProps {
  data: {
    sighting_id: number;
    preview: {
      creature_id: number;
      location_name: string;
      description_short: string;
      height_inch: number;
      sighting_date: string;
      latitude: number;
      longitude: number;
      user_id: number;
      avg_rating?: number;
      rating_count?: number;
    };
    images: string[];
  };
  onClose: () => void;
}

const SightingPopupModal: React.FC<SightingPopupModalProps> = ({ data, onClose }) => {
  const [mounted, setMounted] = useState(false);

  // 👤 Dummy user for dev/testing
  // Set this to null to simulate guest
  const userId: number | null = 1; // or null for guest mode

  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const { preview, images } = data;
  const [averageRating, setAverageRating] = useState(preview.avg_rating ?? 0);
  const [ratingCount, setRatingCount] = useState(preview.rating_count ?? 0);

  const [uploaderName, setUploaderName] = useState<string | null>(null);
  

  useEffect(() => {
    setMounted(true);

    fetch(`http://localhost:8000/api/users/public/${preview.user_id}`)
      .then((res) => res.json())
      .then((user) => {
        setUploaderName(user.full_name || `User ${preview.user_id}`);
      })
      .catch((err) => {
        console.error("Failed to load uploader name", err);
        setUploaderName(`User ${preview.user_id}`);
      });

    // Fetch user rating if logged in
    if (userId) {
      fetch(`http://localhost:8000/ratings/${userId}/${data.sighting_id}`)
        .then((res) => res.json())
        .then((json) => {
          setUserRating(json.rating ?? null);
        })
        .catch((err) => console.error("Failed to load user rating", err));
    }

    return () => setMounted(false);
  }, [data.sighting_id]);

  const submitRating = async (rating: number) => {
    if (!userId) return;
    try {
      await fetch("http://localhost:8000/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sighting_id: data.sighting_id, user_id: userId, rating }),
      });
      setUserRating(rating);
  
      // 🔄 Re-fetch updated sighting preview
      const res = await fetch(`http://localhost:8000/sightings/${data.sighting_id}`);
      const updated = await res.json();
  
      // Optional: only update avg/rating count, not the whole modal
      if (updated?.preview) {
        setAverageRating(updated.preview.avg_rating);
        setRatingCount(updated.preview.rating_count);
      }
  
    } catch (err) {
      console.error("Error submitting rating", err);
    }
  };

  const renderStars = (value: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < value;
      const hovered = hoverRating !== null && i < hoverRating;

      const isFilled = interactive && hoverRating !== null ? hovered : filled;
      const color = isFilled ? "text-yellow-400" : "text-gray-300";

      return (
        <span
          key={i}
          className={`cursor-${interactive ? "pointer" : "default"} text-2xl ${color}`}
          onMouseEnter={() => interactive && setHoverRating(i + 1)}
          onMouseLeave={() => interactive && setHoverRating(null)}
          onClick={() => interactive && submitRating(i + 1)}
        >
          ★
        </span>
      );
    });
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[1200] bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sighting Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Location: <span className="font-semibold">{preview.location_name}</span>
          </p>
          <p className="text-sm text-gray-600">
            Date: <span className="font-semibold">{preview.sighting_date}</span>
          </p>
          <p className="text-sm text-gray-600">
            Height: <span className="font-semibold">{preview.height_inch} inches</span>
          </p>
          <p className="text-sm text-gray-600">
            Coordinates:{" "}
            <span className="font-semibold">
              ({preview.latitude}, {preview.longitude})
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Uploaded by:{" "}
            <a
              href={`/profile/${preview.user_id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {uploaderName || `User ${preview.user_id}`}
            </a>
          </p>

        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Description</h3>
          <p className="text-gray-700 text-sm bg-gray-100 rounded p-3">
            {preview.description_short}
          </p>
        </div>

        {/* Average Rating */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Average Rating</h3>
          <div className="flex items-center gap-2">
            {renderStars(Math.round(averageRating))}
            <span className="text-sm text-gray-600">({ratingCount})</span>
          </div>
        </div>

        {/* User Rating */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1">Your Rating</h3>
          <div className="flex items-center gap-2">
            {userId
              ? renderStars(userRating ?? 0, true)
              : <span className="text-gray-400">Login to rate</span>
            }
          </div>
        </div>

        {images.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-2 gap-3">
              {images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Sighting image ${idx + 1}`}
                  className="w-full h-48 object-cover rounded shadow"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
};

export default SightingPopupModal;