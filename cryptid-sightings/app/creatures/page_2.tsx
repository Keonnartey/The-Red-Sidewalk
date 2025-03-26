"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"

interface Creature {
  id: string
  name: string
  image: string
  traits: string[]
  details: string
}

const creatures: Creature[] = [
  {
    id: "bigfoot",
    name: "BIGFOOT",
    image: "/placeholder.svg?height=200&width=200",
    traits: ["nocturnal", "carnivore", "shy"],
    details: "Bigfoot, also known as Sasquatch, is a mythical creature said to inhabit North American forests."
  },
  {
    id: "vampire",
    name: "VAMPIRE",
    image: "/placeholder.svg?height=200&width=200",
    traits: ["nocturnal", "carnivore"],
    details: "Vampires are mythical beings known for drinking blood and having weaknesses like garlic and sunlight."
  }
]

function CreatureCard({ creature, onSelect }: { creature: Creature; onSelect: (id: string) => void }) {
  return (
    <div
      className="bg-[#d9d9d9] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelect(creature.id)}
    >
      <div className="mb-4">
        <Image src={creature.image} alt={creature.name} width={200} height={200} className="w-full h-auto rounded-md" />
      </div>
      <h2 className="text-xl font-bold text-center mb-4">{creature.name}</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {creature.traits.map((trait) => (
          <span key={trait} className="bg-[#1e2a44] text-white px-3 py-1 rounded-full text-sm">{trait}</span>
        ))}
      </div>
      <div className="text-sm">{creature.details}</div>
    </div>
  )
}

function CreatureList({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
      {creatures.map((creature) => (
        <CreatureCard key={creature.id} creature={creature} onSelect={onSelect} />
      ))}
    </div>
  )
}

function Pagination() {
  return (
    <div className="max-w-5xl mx-auto mt-8 flex justify-center items-center gap-2">
      <Button variant="outline" className="bg-[#d9d9d9] rounded-md">Previous</Button>
      {[1, 2, 3, "...", 67, 68].map((page, index) => (
        <Button key={index} variant="outline" className="bg-[#d9d9d9] rounded-md px-3 py-1 min-w-[40px]">
          {page}
        </Button>
      ))}
      <Button variant="outline" className="bg-[#d9d9d9] rounded-md">Next</Button>
    </div>
  )
}

export default function CreaturesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCreature, setSelectedCreature] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <h1 className="text-white text-4xl font-bold text-center mb-8">CREATURE INDEX AND LORE</h1>
      <div className="max-w-md mx-auto mb-8">
        <Input
          className="bg-[#dacfff] pl-10 pr-4 py-2 rounded-full"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <CreatureList onSelect={setSelectedCreature} />
      <Pagination />
    </div>
  )
}
