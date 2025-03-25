"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import MapBackground from "@/components/map-background"
import CreatureIcon from "@/components/creature-icons"
import {
  GhostIcon,
  BigfootIcon,
  DragonIcon,
  AlienIcon,
  SunIcon,
  CloudIcon,
  SnowflakeIcon,
  LeafIcon,
  DayIcon,
  NightIcon,
} from "@/components/creature-icons"

export default function ReportPage() {
  const [selectedCreature, setSelectedCreature] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [height, setHeight] = useState("8")
  const [color, setColor] = useState("Dark Brown")
  const [location, setLocation] = useState("Texas, USA")

  const handleCreatureSelect = (creature: string) => {
    setSelectedCreature(creature)
  }

  const handleSeasonSelect = (season: string) => {
    setSelectedSeason(season)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  return (
    <div className="w-full h-full relative">
      <MapBackground>
        {/* Title */}
        <div className="absolute top-10 right-10 text-right z-10">
          <h1
            className="text-white text-5xl font-bold tracking-wider"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
          >
            REAL THINGS
            <br />
            SIGHTINGS
          </h1>
        </div>

        {/* Map Markers */}
        <CreatureIcon
          type="ghost"
          position={{ x: 550, y: 260 }}
          details={{
            type: "Ghost",
            height: "6 ft",
            color: "Translucent",
            location: "NY, USA",
            season: "Fall",
            timeOfDay: "Night",
          }}
        />
        <CreatureIcon
          type="bigfoot"
          position={{ x: 850, y: 350 }}
          color="white"
          size={40}
          details={{
            type: "Bigfoot",
            height: "8 ft",
            color: "Dark Brown",
            location: "WA, USA",
            season: "Summer",
            timeOfDay: "Morning",
          }}
        />
        <CreatureIcon
          type="ghost"
          position={{ x: 430, y: 600 }}
          details={{
            type: "Ghost",
            height: "4 ft",
            color: "Blue-ish",
            location: "TX, USA",
            season: "Spring",
            timeOfDay: "Night",
          }}
        />

        {/* Active Sighting Popup */}
        <div className="absolute left-[670px] top-[590px] z-20">
          <div className="bg-[#d9d9d9] rounded-lg p-4 w-[200px] shadow-lg">
            <div className="text-center font-bold mb-2">NEW SIGHTING</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Type of Creature</div>
              <div className="font-bold text-right">BIGFOOT</div>

              <div>Height</div>
              <div className="font-bold text-right">8 FT</div>

              <div>Color</div>
              <div className="font-bold text-right">DARK BROWN</div>

              <div>Location</div>
              <div className="font-bold text-right">TX, USA</div>

              <div>Season</div>
              <div className="font-bold text-right">WINTER</div>

              <div>Time of Day</div>
              <div className="font-bold text-right">MORNING</div>
            </div>
          </div>
          <div className="w-4 h-4 bg-[#d9d9d9] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
          <CreatureIcon type="bigfoot" position={{ x: 0, y: 30 }} color="#4CAF50" size={40} />
        </div>
      </MapBackground>

      {/* Report Form */}
      <div className="absolute top-10 left-10 bg-[#d9d9d9] rounded-lg p-6 w-[350px] z-20">
        <h2 className="text-center text-2xl font-bold mb-6">REPORT NEW SIGHTING</h2>

        <div className="mb-6">
          <p className="mb-3 font-medium">What did you see?</p>
          <div className="flex justify-between px-4">
            <button
              className={`p-2 rounded-full transition-colors ${selectedCreature === "ghost" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleCreatureSelect("ghost")}
            >
              <GhostIcon />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${selectedCreature === "bigfoot" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleCreatureSelect("bigfoot")}
            >
              <BigfootIcon />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${selectedCreature === "dragon" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleCreatureSelect("dragon")}
            >
              <DragonIcon />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${selectedCreature === "alien" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleCreatureSelect("alien")}
            >
              <AlienIcon />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 font-medium">What did it look like?</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1">Height</p>
              <Input
                className="bg-white border-none"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                suffix="ft"
              />
            </div>
            <div>
              <p className="mb-1">Color</p>
              <Input className="bg-white border-none" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-3 font-medium">Where was this?</p>
          <Input className="bg-white border-none" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="mb-6">
          <p className="mb-3 font-medium">What season is it?</p>
          <div className="flex justify-between px-4">
            <button
              className={`p-2 rounded-full transition-colors ${selectedSeason === "summer" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleSeasonSelect("summer")}
            >
              <SunIcon />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${selectedSeason === "fall" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleSeasonSelect("fall")}
            >
              <LeafIcon />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${selectedSeason === "winter" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleSeasonSelect("winter")}
            >
              <SnowflakeIcon />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${selectedSeason === "spring" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleSeasonSelect("spring")}
            >
              <CloudIcon />
            </button>
          </div>
        </div>

        <div className="mb-2">
          <p className="mb-3 font-medium">What time of day was it?</p>
          <div className="flex justify-center gap-16">
            <button
              className={`p-2 rounded-full transition-colors ${selectedTime === "day" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleTimeSelect("day")}
            >
              <DayIcon />
            </button>
            <button
              className={`p-2 rounded-full transition-colors ${selectedTime === "night" ? "bg-gray-300" : "hover:bg-gray-200"}`}
              onClick={() => handleTimeSelect("night")}
            >
              <NightIcon color="black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

