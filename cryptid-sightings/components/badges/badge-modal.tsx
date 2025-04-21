"use client";

import { motion } from "framer-motion";

interface BadgeModalProps {
  badgeKey: string;     // e.g. "dragon_rider"
  onClose: () => void;
}

const BADGE_REQUIREMENTS: Record<string, string> = {
  bigfoot_amateur: "Report your first Bigfoot sighting to earn this badge!",
  lets_be_friends: "Add a friend to your network to earn this badge!",
  elite_hunter: "Find all 5 creatures to earn this badge!",
  socialite: "Leave a comment on someone else's sighting to earn this badge!",
  diversify: "Report sightings of 2 different creatures to earn this badge!",
  well_traveled: "Find creatures in 5 different locations to earn this badge!",
  hallucinator: "If you earn three or more 1-star ratings, you'll earn this badge!",
  camera_ready: "Report a sighting with a photo to earn this badge!",
  dragon_rider: "Take a selfie with a dragon to earn this badge!",
  // Add more as needed
};

export function BadgeModal({ badgeKey, onClose }: BadgeModalProps) {
  const requirement = BADGE_REQUIREMENTS[badgeKey] || "No info available";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">How to Earn This Badge</h2>
        <p className="mb-6">{requirement}</p>
        <button
          onClick={onClose}
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          Got It
        </button>
      </motion.div>
    </div>
  );
}
