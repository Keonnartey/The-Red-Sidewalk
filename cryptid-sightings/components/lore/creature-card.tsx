"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { Creature } from "@/components/lore/creatures"

interface CreatureCardProps {
  creature: Creature
  onSelect: (id: string) => void
}

export function CreatureCard({ creature, onSelect }: CreatureCardProps) {
  return (
    <div
      className="bg-[#d9d9d9] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelect(creature.id)}
    >
      <div className="mb-4">
        <Image
          src={creature.image || "/placeholder.svg"}
          alt={creature.name}
          width={200}
          height={200}
          className="w-[300px] h-[300px] object-cover rounded-md"
        />
      </div>

      <h2 className="text-xl font-bold text-center mb-4">{creature.name}</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        {creature.tags.map((tag) => (
          <span key={tag} className={`${getTagColor(tag)} text-white px-3 py-1 rounded-full text-sm`}>
            {tag}
          </span>
        ))}
      </div>

      <div className="text-sm">
        {creature.otherNames && <strong>OTHER NAMES:</strong>} {creature.otherNames}
        {creature.weaknesses && <strong>WEAKNESSES:</strong>} {creature.weaknesses}
        {creature.likes && <strong>LIKES:</strong>} {creature.likes}
      </div>

      <Button className="mt-4 w-full bg-[#1e2a44] text-white hover:bg-[#2a3a5a]">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V19M5 12H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  )
}

function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    nocturnal: "bg-[#1e2a44]",
    carnivore: "bg-[#a52a2a]",
    shy: "bg-[#6495ed]",
    paranormal: "bg-[#ECE6F0]",
    territorial: "bg-[#DACFFF]",
    flight: "bg-[#5EC04B]",
    unknown: "bg-[#898888]",
  }

  return colors[tag] || "bg-gray-500"
}

