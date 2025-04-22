"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import { getCreatureDetails } from "@/components/lore/creatures"

interface CreatureDetailsProps {
  creatureId: string | null
  creatureData: {
    height: string
    weight: string
    locations?: string
    lore?: string
    popularSightings?: Array<{
      id: string
      description: string
      location: string
      date: string
    }>
  } | null
  onClose: () => void
}

export function CreatureDetails({ creatureId, creatureData, onClose }: CreatureDetailsProps) {
  if (!creatureId) return null

  // Fallback to static data if API data is not available
  const staticDetails = getCreatureDetails(creatureId)

  // Debug
  console.log("CreatureData:", creatureData)

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative z-10">
        <Button size="icon" variant="ghost" className="absolute right-2 top-2 z-20" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center mb-6">{creatureId.toUpperCase()}</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Image
                src={`/${creatureId.charAt(0).toUpperCase() + creatureId.slice(1)}.jpg`}
                alt={creatureId}
                width={300}
                height={300}
                className="w-full h-auto rounded-md"
              />
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">AVERAGE HEIGHT</h3>
                  <p className="text-xl">{creatureData ? creatureData.height : "Loading..."}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2">AVERAGE WEIGHT</h3>
                  <p className="text-xl">{creatureData ? creatureData.weight : "Loading..."}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">LOCATIONS FOUND:</h3>
                <p className="text-xl">
                  {creatureData && creatureData.locations !== "Unknown"
                    ? creatureData.locations
                    : staticDetails.locations || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">LORE</h3>
            <div className="prose max-w-none">
              <p>{staticDetails.lore || "No information available."}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">POPULAR SIGHTINGS</h3>
            {creatureData?.popularSightings && creatureData.popularSightings.length > 0 ? (
              <div className="grid gap-4">
                {creatureData.popularSightings.map((sighting) => (
                  <div key={sighting.id} className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold">{sighting.location}</h4>
                      <span className="text-sm text-gray-500">{sighting.date}</span>
                    </div>
                    <p className="text-sm">{sighting.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No popular sightings recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
