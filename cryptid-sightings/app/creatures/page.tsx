"use client"

import { SearchBar } from "@/components/lore/search-bar"
import { CreatureCard } from "@/components/lore/creature-card"
import { Pagination } from "@/components/lore/pagination"
import { CreatureDetails } from "@/components/lore/creature-details"
import { useCreatureSearch } from "@/hooks/use-creature-search"

export default function CreaturesPage() {
  const {
    searchTerm,
    currentPage,
    totalPages,
    paginatedCreatures,
    selectedCreature,
    creatureData,
    handlePageChange,
    handleSearchChange,
    setSelectedCreature,
  } = useCreatureSearch()

  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <h1 className="text-white text-4xl font-bold text-center mb-8">CREATURE INDEX AND LORE</h1>

      {/* Search */}
      <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />

      {/* Creature Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {paginatedCreatures.map((creature) => (
          <CreatureCard key={creature.id} creature={creature} onSelect={(id) => setSelectedCreature(id)} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {/* Creature Details Modal */}
      <CreatureDetails
        creatureId={selectedCreature}
        creatureData={creatureData}
        onClose={() => setSelectedCreature(null)}
      />
    </div>
  )
}

