"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"

export default function CreaturesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCreature, setSelectedCreature] = useState<string | null>("bigfoot")

  const closeCreatureDetails = () => {
    setSelectedCreature(null)
  }

  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <h1 className="text-white text-4xl font-bold text-center mb-8">CREATURE INDEX AND LORE</h1>

      {/* Search */}
      <div className="max-w-md mx-auto mb-8">
        <div className="relative">
          <Input
            className="bg-[#dacfff] pl-10 pr-4 py-2 rounded-full"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
              stroke="#1e1d4a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Creature Cards */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
        {/* Bigfoot Card */}
        <div
          className="bg-[#d9d9d9] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCreature("bigfoot")}
        >
          <div className="mb-4">
            <Image
              src="/placeholder.svg?height=200&width=200"
              alt="Bigfoot"
              width={200}
              height={200}
              className="w-full h-auto rounded-md"
            />
          </div>

          <h2 className="text-xl font-bold text-center mb-4">BIGFOOT</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-[#1e2a44] text-white px-3 py-1 rounded-full text-sm">nocturnal</span>
            <span className="bg-[#a52a2a] text-white px-3 py-1 rounded-full text-sm">carnivore</span>
            <span className="bg-[#6495ed] text-white px-3 py-1 rounded-full text-sm">shy</span>
          </div>

          <div className="text-sm">
            <strong>OTHER NAMES:</strong> Sasquatch, Yeti (Himalayas)
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

        {/* Vampire Card */}
        <div
          className="bg-[#d9d9d9] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCreature("vampire")}
        >
          <div className="mb-4">
            <Image
              src="/placeholder.svg?height=200&width=200"
              alt="Vampire"
              width={200}
              height={200}
              className="w-full h-auto rounded-md"
            />
          </div>

          <h2 className="text-xl font-bold text-center mb-4">VAMPIRE</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-[#1e2a44] text-white px-3 py-1 rounded-full text-sm">nocturnal</span>
            <span className="bg-[#a52a2a] text-white px-3 py-1 rounded-full text-sm">carnivore</span>
          </div>

          <div className="text-sm">
            <strong>WEAKNESSES:</strong> Garlic, sunlight, holy water
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
      </div>

      {/* Creature Details Popup */}
      {selectedCreature === "bigfoot" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeCreatureDetails}></div>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative z-10">
            <Button size="icon" variant="ghost" className="absolute right-2 top-2 z-20" onClick={closeCreatureDetails}>
              <X className="w-5 h-5" />
            </Button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6">BIGFOOT</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Image
                    src="/placeholder.svg?height=300&width=300"
                    alt="Bigfoot"
                    width={300}
                    height={300}
                    className="w-full h-auto rounded-md"
                  />
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-lg font-bold mb-2">AVERAGE HEIGHT</h3>
                      <p className="text-xl">6 - 15 feet</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">AVERAGE WEIGHT</h3>
                      <p className="text-xl">600 pounds</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">LOCATIONS FOUND:</h3>
                    <p className="text-xl">North America</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">LORE</h3>
                <div className="prose max-w-none">
                  <p>
                    Bigfoot (<em>/ˈbɪɡfʊt/</em>), also commonly referred to as Sasquatch (<em>/ˈsæskwætʃ/</em>,{" "}
                    <em>/ˈsæskwɒtʃ/</em>), is a large, hairy <strong>mythical creature</strong> said to inhabit forests
                    in North America, particularly in the <strong>Pacific Northwest</strong>[2][3][4]. Bigfoot is
                    featured in both <strong>American</strong> and <strong>Canadian folklore</strong>, and since the
                    mid-20th century has grown into a <strong>cultural icon</strong>, permeating{" "}
                    <strong>popular culture</strong> and becoming the subject of its own distinct{" "}
                    <strong>subculture</strong>[5][6].
                  </p>
                  <p>
                    Enthusiasts of Bigfoot, such as those within the <strong>pseudoscience</strong> of{" "}
                    <strong>cryptozoology</strong>, have offered various forms of dubious evidence to prove Bigfoot's
                    existence, including <strong>anecdotal claims</strong> of sightings as well as alleged
                    photographs...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="max-w-5xl mx-auto mt-8 flex justify-center items-center gap-2">
        <Button variant="outline" className="bg-[#d9d9d9] rounded-md">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Previous
        </Button>

        <Button variant="outline" className="bg-white rounded-md px-3 py-1 min-w-[40px]">
          1
        </Button>
        <Button variant="outline" className="bg-[#d9d9d9] rounded-md px-3 py-1 min-w-[40px]">
          2
        </Button>
        <Button variant="outline" className="bg-[#d9d9d9] rounded-md px-3 py-1 min-w-[40px]">
          3
        </Button>
        <div className="px-2">...</div>
        <Button variant="outline" className="bg-[#d9d9d9] rounded-md px-3 py-1 min-w-[40px]">
          67
        </Button>
        <Button variant="outline" className="bg-[#d9d9d9] rounded-md px-3 py-1 min-w-[40px]">
          68
        </Button>

        <Button variant="outline" className="bg-[#d9d9d9] rounded-md">
          Next
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>
  )
}

