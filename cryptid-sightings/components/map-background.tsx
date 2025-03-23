"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"

interface MapBackgroundProps {
  children: React.ReactNode
}

export default function MapBackground({ children }: MapBackgroundProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })
  const constraintsRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    if ("touches" in e) {
      setStartPosition({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y })
    } else {
      setStartPosition({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    if ("touches" in e) {
      setPosition({
        x: e.touches[0].clientX - startPosition.x,
        y: e.touches[0].clientY - startPosition.y,
      })
    } else {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      })
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    window.addEventListener("mousemove", handleDragMove)
    window.addEventListener("mouseup", handleDragEnd)
    window.addEventListener("touchmove", handleDragMove)
    window.addEventListener("touchend", handleDragEnd)

    return () => {
      window.removeEventListener("mousemove", handleDragMove)
      window.removeEventListener("mouseup", handleDragEnd)
      window.removeEventListener("touchmove", handleDragMove)
      window.removeEventListener("touchend", handleDragEnd)
    }
  }, [isDragging, startPosition])

  return (
    <div className="absolute inset-0 overflow-hidden" ref={constraintsRef}>
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          touchAction: "none",
        }}
      >
        <Image
          src="/placeholder.svg?height=1500&width=2000"
          alt="US Map Background"
          width={2000}
          height={1500}
          className="object-cover min-w-[120%] min-h-[120%]"
          style={{ filter: "brightness(0.4) sepia(0.3)" }}
        />
        {children}
      </div>
    </div>
  )
}

