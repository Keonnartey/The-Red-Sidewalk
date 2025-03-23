"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Heart, Send, X } from "lucide-react"
import Image from "next/image"
import { BigfootIcon } from "@/components/creature-icons"

export default function DiscussPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<string[]>(["tall", "most recent"])

  const removeFilter = (filter: string) => {
    setFilters(filters.filter((f) => f !== filter))
  }

  return (
    <div className="min-h-screen bg-[#1e2a44] p-6">
      <h1 className="text-white text-4xl font-bold text-center mb-8">DISCUSS SIGHTINGS WITH OTHERS</h1>

      {/* Search and Filters */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-auto md:flex-1">
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

        <div className="flex gap-2">
          {filters.map((filter) => (
            <div key={filter} className="bg-[#dacfff] px-3 py-1 rounded-full flex items-center gap-1">
              <span>{filter}</span>
              <button onClick={() => removeFilter(filter)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Post 1 */}
        <div className="bg-[#d9d9d9] rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <div className="font-bold">USER_1</div>
            <div className="flex items-center gap-2">
              <BigfootIcon size={20} />
              <span className="text-sm">Texas, USA</span>
              <span className="text-sm text-gray-600">5h ago</span>
            </div>
          </div>

          <div className="px-4">
            <Image
              src="/placeholder.svg?height=300&width=400"
              alt="Bigfoot sighting"
              width={400}
              height={300}
              className="w-full h-auto rounded-md"
            />
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">Your Rating:</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= 2 ? "text-green-500 fill-green-500" : "text-gray-300 fill-gray-300"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="text-sm mb-4">
              I was walking in the woods when I hear foot steps. I turned around and saw what look to be a bear. As I
              watched it stood up. It looked to be 9.2 feet high. Then it backed up in to the thick brush
            </div>

            <div className="flex justify-between items-center">
              <Input className="bg-white rounded-full flex-1 mr-2" placeholder="Comment" />
              <Button size="icon" variant="ghost" className="rounded-full">
                <Send className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 ml-2">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Heart className="w-4 h-4" />
                </Button>
                <span className="text-sm">5,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post 2 */}
        <div className="bg-[#d9d9d9] rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <div className="font-bold">USER_2</div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M16 4L15 6L16 8L13 9L12 12L11 9L8 8L9 6L8 4L10 5L12 3L14 5L16 4Z" fill="black" />
              </svg>
              <span className="text-sm">Romania</span>
              <span className="text-sm text-gray-600">10h ago</span>
            </div>
          </div>

          <div className="px-4">
            <Image
              src="/placeholder.svg?height=300&width=400"
              alt="Vampire sighting"
              width={400}
              height={300}
              className="w-full h-auto rounded-md"
            />
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">Your Rating:</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= 4 ? "text-green-500 fill-green-500" : "text-gray-300 fill-gray-300"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="text-sm mb-4">
              <div className="font-bold">USER_2</div>
              Sparkly, pale, tall
              <div className="font-bold mt-2">USER_1</div>
              Wow so sick
            </div>

            <div className="flex justify-between items-center">
              <Input className="bg-white rounded-full flex-1 mr-2" placeholder="Comment" />
              <Button size="icon" variant="ghost" className="rounded-full">
                <Send className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 ml-2">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Heart className="w-4 h-4" />
                </Button>
                <span className="text-sm">2,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post 3 */}
        <div className="bg-[#d9d9d9] rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <div className="font-bold">USER_1</div>
            <div className="flex items-center gap-2">
              <BigfootIcon size={20} />
              <span className="text-sm">Texas, USA</span>
              <span className="text-sm text-gray-600">1d ago</span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">Your Rating:</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= 1 ? "text-green-500 fill-green-500" : "text-gray-300 fill-gray-300"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="text-sm mb-4">
              It was summer and I was walking in the woods surrounding doris mountain. I was coming home when I started
              hearing strange chattering sounds. I was getting really creeped out and then heard this really loud shriek
              ... <span className="text-blue-600">more</span>
            </div>

            <div className="flex justify-between items-center">
              <Input className="bg-white rounded-full flex-1 mr-2" placeholder="Comment" />
              <Button size="icon" variant="ghost" className="rounded-full">
                <Send className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 ml-2">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Heart className="w-4 h-4" />
                </Button>
                <span className="text-sm">2,300</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post 4 */}
        <div className="bg-[#d9d9d9] rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center">
            <div className="font-bold">USER_1</div>
            <div className="flex items-center gap-2">
              <BigfootIcon size={20} />
              <span className="text-sm">Texas, USA</span>
              <span className="text-sm text-gray-600">1d ago</span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm">Your Rating:</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= 1 ? "text-green-500 fill-green-500" : "text-gray-300 fill-gray-300"}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                  </svg>
                ))}
              </div>
            </div>

            <div className="text-sm mb-4">
              It was summer and I was walking in the woods surrounding doris mountain. I was coming home when I started
              hearing strange chattering sounds. I was getting really creeped out and then heard this really loud shriek
              ... <span className="text-blue-600">more</span>
            </div>

            <div className="flex justify-between items-center">
              <Input className="bg-white rounded-full flex-1 mr-2" placeholder="Comment" />
              <Button size="icon" variant="ghost" className="rounded-full">
                <Send className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1 ml-2">
                <Button size="icon" variant="ghost" className="rounded-full">
                  <Heart className="w-4 h-4" />
                </Button>
                <span className="text-sm">2,300</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

