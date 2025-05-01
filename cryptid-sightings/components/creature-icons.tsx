"use client"

import { useState } from "react"
import { motion } from "framer-motion"
// new imports
import { GiFootprint, GiVampireCape } from "react-icons/gi"
import { RiAliensFill } from "react-icons/ri";


interface CreatureIconProps {
  type: "ghost" | "bigfoot" | "dragon" | "alien" | "vampire"
  position: { x: number; y: number }
  color?: string
  size?: number
  details?: {
    type: string
    height: string
    color: string
    location: string
    season: string
    timeOfDay: string
  }
}

export default function CreatureIcon({ type, position, color = "#dacfff", size = 30, details }: CreatureIconProps) {
  const [showDetails, setShowDetails] = useState(false)

  const handleClick = () => {
    setShowDetails(!showDetails)
  }

  return (
    <div className="absolute" style={{ left: `${position.x}px`, top: `${position.y}px` }}>
      <motion.div
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className="cursor-pointer"
      >
        {type === "ghost" && <GhostIcon color={color} size={size} />}
        {type === "bigfoot" && <BigfootIcon color={color} size={size} />}
        {type === "dragon" && <DragonIcon color={color} size={size} />}
        {type === "alien" && <AlienIcon color={color} size={size} />}
        {type === "vampire" && <VampireIcon color={color} size={size} />}
      </motion.div>

      {showDetails && details && (
        <div className="absolute z-50 bg-[#d9d9d9] rounded-lg p-4 w-[200px] -translate-x-1/2 -translate-y-full mb-2 shadow-lg">
          <div className="text-center font-bold mb-2">NEW SIGHTING</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Type of Creature</div>
            <div className="font-bold text-right">{details.type}</div>

            <div>Height</div>
            <div className="font-bold text-right">{details.height}</div>

            <div>Color</div>
            <div className="font-bold text-right">{details.color}</div>

            <div>Location</div>
            <div className="font-bold text-right">{details.location}</div>

            <div>Season</div>
            <div className="font-bold text-right">{details.season}</div>

            <div>Time of Day</div>
            <div className="font-bold text-right">{details.timeOfDay}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Custom Icons
export function GhostIcon({ color = "Blue-ish", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C7.58 2 4 5.58 4 10V20L6.5 17.5L9 20L11.5 17.5L14 20L16.5 17.5L19 20V10C19 5.58 15.42 2 12 2ZM12 4C14.21 4 16 5.79 16 8C16 10.21 14.21 12 12 12C9.79 12 8 10.21 8 8C8 5.79 9.79 4 12 4ZM10 8C10 7.45 10.45 7 11 7C11.55 7 12 7.45 12 8C12 8.55 11.55 9 11 9C10.45 9 10 8.55 10 8ZM14 8C14 7.45 14.45 7 15 7C15.55 7 16 7.45 16 8C16 8.55 15.55 9 15 9C14.45 9 14 8.55 14 8Z"
        fill={color}
      />
    </svg>
  )
}


export function BigfootIcon({ color = "#dacfff", size = 24 }) {
  return <GiFootprint color={color} size={size} />
}

export function VampireIcon({ color = "#dacfff", size = 24 }) {
  return <GiVampireCape color={color} size={size} />
}


export function DragonIcon({ color = "Blue-ish", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 4L15 6L16 8L13 9L12 12L11 9L8 8L9 6L8 4L10 5L12 3L14 5L16 4ZM4 8L2 9L4 10L5 12L6 10L8 9L6 8L4 8ZM20 8L18 9L20 10L21 12L22 10L24 9L22 8L20 8ZM12 12L9 19H15L12 12Z"
        fill={color}
      />
    </svg>
  )
}

export function AlienIcon({ color = "#03ff00", size = 24 }) {
  return <RiAliensFill color={color} size={size} />
}

export function SunIcon({ color = "black", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 2L14.39 5.42C13.65 5.15 12.84 5 12 5C11.16 5 10.35 5.15 9.61 5.42L12 2ZM2 12L5.42 9.61C5.15 10.35 5 11.16 5 12C5 12.84 5.15 13.65 5.42 14.39L2 12ZM12 22L9.61 18.58C10.35 18.85 11.16 19 12 19C12.84 19 13.65 18.85 14.39 18.58L12 22ZM22 12L18.58 14.39C18.85 13.65 19 12.84 19 12C19 11.16 18.85 10.35 18.58 9.61L22 12Z"
        fill={color}
      />
    </svg>
  )
}

export function CloudIcon({ color = "black", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04Z"
        fill={color}
      />
    </svg>
  )
}

export function SnowflakeIcon({ color = "black", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14 7L12 9L10 7L12 2ZM12 22L10 17L12 15L14 17L12 22ZM2 12L7 10L9 12L7 14L2 12ZM22 12L17 14L15 12L17 10L22 12ZM5.5 5.5L10 7L10.5 9.5L8 10L5.5 5.5ZM18.5 18.5L14 17L13.5 14.5L16 14L18.5 18.5ZM18.5 5.5L14 7L13.5 9.5L16 10L18.5 5.5ZM5.5 18.5L10 17L10.5 14.5L8 14L5.5 18.5Z"
        fill={color}
      />
    </svg>
  )
}

export function LeafIcon({ color = "black", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.75 3.59L15.41 6L18 8.59L17.75 3.59ZM6 15.41L3.59 17.75L8.59 18L6 15.41ZM22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12ZM15 12C15 10.34 13.66 9 12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12Z"
        fill={color}
      />
    </svg>
  )
}

export function DayIcon({ color = "black", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 12H3V15H6V12ZM6 8H3V11H6V8ZM6 16H3V19H6V16ZM10 12H7V15H10V12ZM10 8H7V11H10V8ZM10 16H7V19H10V16ZM21 8H12V19H21V8ZM18 12H15V10H18V12ZM18 14H15V12H18V14ZM18 16H15V14H18V16Z"
        fill={color}
      />
    </svg>
  )
}

export function NightIcon({ color = "white", size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 11.54 20.96 11.08 20.9 10.64C19.92 12.01 18.32 12.9 16.5 12.9C13.52 12.9 11.1 10.48 11.1 7.5C11.1 5.69 11.99 4.08 13.36 3.1C12.92 3.04 12.46 3 12 3Z"
        fill={color}
      />
    </svg>
  )
}

