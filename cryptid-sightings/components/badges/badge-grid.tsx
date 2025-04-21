"use client";

import Image from "next/image";

interface BadgeInfo {
  key: string;
  label: string;
  image: string;
}

interface BadgeGridProps {
  badges: BadgeInfo[];
  onBadgeClick?: (badgeKey: string) => void;
}

export function BadgeGrid({ badges, onBadgeClick }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {badges.map((badge) => (
        <div
          key={badge.key}
          className="flex flex-col items-center cursor-pointer"
          onClick={() => onBadgeClick?.(badge.key)}
        >
          <div className="bg-[#1e2a44] p-4 rounded-lg border border-gray-700 mb-2">
            <Image
              src={badge.image}
              alt={badge.label}
              width={64}
              height={64}
              className="w-16 h-16"
            />
          </div>
          <p className="text-white text-center text-sm">{badge.label}</p>
        </div>
      ))}
    </div>
  );
}
