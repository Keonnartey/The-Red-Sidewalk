"use client"

import { useState, useMemo, useEffect } from "react"
import { creatures } from "@/components/lore/creatures"

interface CreatureData {
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
  newestSightings?: Array<{
    id: string
    description: string
    location: string
    date: string
  }>
}

export function useCreatureSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCreature, setSelectedCreature] = useState<string | null>(null)
  const [creatureData, setCreatureData] = useState<CreatureData | null>(null)

  // Filter creatures based on search term
  const filteredCreatures = useMemo(() => {
    if (!searchTerm.trim()) return creatures

    const term = searchTerm.toLowerCase()
    return creatures.filter(
      (creature) =>
        creature.name.toLowerCase().includes(term) ||
        creature.tags.some((tag) => tag.toLowerCase().includes(term)) ||
        (creature.otherNames && creature.otherNames.toLowerCase().includes(term)),
    )
  }, [searchTerm])

  // Paginate creatures - 3 on first page, 2 on second page
  const paginatedCreatures = useMemo(() => {
    if (currentPage === 1) {
      return filteredCreatures.slice(0, 3)
    } else {
      return filteredCreatures.slice(3, 5)
    }
  }, [filteredCreatures, currentPage])

  // Calculate total pages
  const totalPages = useMemo(() => {
    return filteredCreatures.length > 3 ? 2 : 1
  }, [filteredCreatures])

  // Fetch creature data from backend
  useEffect(() => {
    const fetchCreatureData = async () => {
      if (!selectedCreature) {
        setCreatureData(null)
        return
      }

      try {
        const response = await fetch(`http://localhost:8000/lore/${selectedCreature.toLowerCase()}`)
        const data = await response.json()
        console.log("API Response:", data) // Add this to debug
        setCreatureData({
          height: data.height || "Unknown",
          weight: data.weight || "Unknown",
          locations: data.locations || "Unknown",
          popularSightings: data.popularSightings || [],
          newestSightings: data.newestSightings || [],
        })
      } catch (error) {
        console.error("Error fetching creature data:", error)
        setCreatureData({
          height: "Unknown",
          weight: "Unknown",
          locations: "Unknown",
          popularSightings: [],
          newestSightings: [],
        })
      }
    }

    fetchCreatureData()
  }, [selectedCreature])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when search changes
  }

  return {
    searchTerm,
    currentPage,
    totalPages,
    paginatedCreatures,
    selectedCreature,
    creatureData,
    handlePageChange,
    handleSearchChange,
    setSelectedCreature,
  }
}
