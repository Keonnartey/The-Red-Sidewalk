"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"

interface CreatureData {
  height: string;
}

export default function CreaturesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCreature, setSelectedCreature] = useState<string | null>(null);
  const [creatureData, setCreatureData] = useState<CreatureData | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2); // Example total pages, this should come from the backend

  useEffect(() => {
    const fetchCreatureData = async () => {
      if (!selectedCreature) return; // Only fetch if a creature is selected

      try {
        const response = await fetch(`http://localhost:8000/lore/${selectedCreature.toLowerCase()}`); // Adjust API route as needed
        const data = await response.json();
        setCreatureData({
          height: data.height || "Unknown",
        });
      } catch (error) {
        console.error("Error fetching creature data:", error);
      }
    };

    fetchCreatureData();
  }, [selectedCreature]); // Re-fetch when selectedCreature changes


  // Handle pagination button clicks
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };


  const closeCreatureDetails = () => {
    setSelectedCreature(null);
    setCreatureData(null);
  };



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
              src="/Bigfoot.jpg"
              alt="Bigfoot"
              width={200}
              height={200}
              className="w-[300px] h-[300px] object-cover rounded-md"
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
              src="/Vampire.jpg"
              alt="Vampire"
              width={200}
              height={200}
              className="w-[300px] h-[300px] object-cover rounded-md"
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


        {/* Ghost Card */}
        <div
          className="bg-[#d9d9d9] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCreature("ghost")}
        >
          <div className="mb-4">
            <Image
              src="/Ghost.jpg"
              alt="Ghost"
              width={200}
              height={200}
              className="w-[300px] h-[300px] object-cover rounded-md"
            />
          </div>

          <h2 className="text-xl font-bold text-center mb-4">GHOST</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-[#1e2a44] text-white px-3 py-1 rounded-full text-sm">nocturnal</span>
            <span className="bg-[#ECE6F0] text-white px-3 py-1 rounded-full text-sm">paranormal</span>
          </div>

          <div className="text-sm">
            <strong>WEAKNESSES:</strong> Salt, iron, strong will
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


        {/* Dragon Card */}
        <div
          className="bg-[#d9d9d9] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCreature("dragon")}
        >
          <div className="mb-4">
            <Image
              src="/Dragon.jpg"
              alt="Dragon"
              width={200}
              height={200}
              className="w-[300px] h-[300px] object-cover rounded-md"
            />
          </div>

          <h2 className="text-xl font-bold text-center mb-4">DRAGON</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-[#a52a2a] text-white px-3 py-1 rounded-full text-sm">carnivore</span>
            <span className="bg-[#DACFFF] text-white px-3 py-1 rounded-full text-sm">territorial</span>
            <span className="bg-[#5EC04B] text-white px-3 py-1 rounded-full text-sm">flight</span>
          </div>

          <div className="text-sm">
            <strong>LIKES:</strong> Gold, gems, rare artifacts
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

        {/* Alien Card */}
        <div
          className="bg-[#d9d9d9] rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCreature("alien")}
        >
          <div className="mb-4">
            <Image
              src="/Alien.jpg"
              alt="Alien"
              width={200}
              height={200}
              className="w-[300px] h-[300px] object-cover rounded-md"
            />
          </div>

          <h2 className="text-xl font-bold text-center mb-4">ALIEN</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-[#898888] text-white px-3 py-1 rounded-full text-sm">unknown</span>

          </div>

          <div className="text-sm">
            <strong>WEAKNESSES:</strong> Unknown
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
                    src="/Bigfoot.jpg?height=300&width=300"
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
                      <p className="text-xl">{creatureData ? creatureData.height : "Loading..."}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">AVERAGE WEIGHT</h3>
                      <p className="text-xl"> 600 pounds</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">LOCATIONS FOUND:</h3>
                    <p className="text-xl"> North America </p>
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

{selectedCreature === "vampire" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeCreatureDetails}></div>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative z-10">
            <Button size="icon" variant="ghost" className="absolute right-2 top-2 z-20" onClick={closeCreatureDetails}>
              <X className="w-5 h-5" />
            </Button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6">VAMPIRE</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Image
                    src="/Vampire.jpg?height=300&width=300"
                    alt="Vampire"
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
                      <p className="text-xl"> 140 pounds</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">LOCATIONS FOUND:</h3>
                    <p className="text-xl"> Eastern Europe </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">LORE</h3>
                <div className="prose max-w-none">
                  <p>
                Vampires are legendary creatures of the night, often depicted as immortal beings that drink the blood
                of the living to sustain themselves. Originating in European folklore, vampires are associated with
                darkness, mystery, and supernatural abilities.
              </p>
              <p>
                They are often seen as aristocratic, cunning, and seductive, using their charm to lure victims. Common
                weaknesses include sunlight, holy relics, and wooden stakes. Legends of vampires have inspired
                countless books, movies, and pop culture figures.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{selectedCreature === "ghost" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeCreatureDetails}></div>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative z-10">
            <Button size="icon" variant="ghost" className="absolute right-2 top-2 z-20" onClick={closeCreatureDetails}>
              <X className="w-5 h-5" />
            </Button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6">GHOST</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Image
                    src="/Ghost.jpg?height=300&width=300"
                    alt="Ghost"
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
                      <p className="text-xl"> None </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">LOCATIONS FOUND:</h3>
                    <p className="text-xl"> Everywhere </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">LORE</h3>
                <div className="prose max-w-none">
                  <p>
                  Ghosts are spirits of the dead that linger in the physical world, often due to unfinished business
                  or tragic deaths. They are commonly associated with hauntings and eerie supernatural phenomena.
                    </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{selectedCreature === "dragon" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeCreatureDetails}></div>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative z-10">
            <Button size="icon" variant="ghost" className="absolute right-2 top-2 z-20" onClick={closeCreatureDetails}>
              <X className="w-5 h-5" />
            </Button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6">DRAGON</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Image
                    src="Dragon.jpg?height=300&width=300"
                    alt="Dragon"
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
                      <p className="text-xl"> 10,000 pounds </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">LOCATIONS FOUND:</h3>
                    <p className="text-xl"> The sky </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">LORE</h3>
                <div className="prose max-w-none">
                <p>
              Dragons are legendary creatures appearing in myths and folklore across cultures worldwide. Often depicted
              as large, reptilian beasts, they are known for their immense power, wisdom, and magical abilities.
                </p>
                <p>
              In Western mythology, dragons are fire-breathing monsters, often guarding treasure and challenging
              heroes in epic battles. Meanwhile, in Eastern traditions, dragons are seen as benevolent beings
              that symbolize wisdom, power, and the elements, particularly water and air.
                </p>
               <p>
              Dragons are known to be highly intelligent, sometimes capable of speech, magic, or shapeshifting.
              Their strengths vary—some can breathe fire, others control lightning or ice, and some even possess
              immortality.
              </p>
                </div>
              </div>
            </div>
          </div>
        </div>
)}

{selectedCreature === "alien" && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeCreatureDetails}></div>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto relative z-10">
            <Button size="icon" variant="ghost" className="absolute right-2 top-2 z-20" onClick={closeCreatureDetails}>
              <X className="w-5 h-5" />
            </Button>

            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6">ALIEN</h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Image
                    src="/Alien.jpg?height=300&width=300"
                    alt="Alien"
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
                      <p className="text-xl"> 180 pounds </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">LOCATIONS FOUND:</h3>
                    <p className="text-xl"> New Mexico </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">LORE</h3>
                <div className="prose max-w-none">
                  <p>
                Aliens are extraterrestrial beings often depicted as visitors from other planets with
              advanced intelligence and technology.
              </p>
                </div>
              </div>
            </div>
          </div>
        </div>
)}


      

            {/* Pagination */}
            <div className="max-w-5xl mx-auto mt-8 flex justify-center items-center gap-2">
        <Button
          variant="outline"
          className="bg-[#d9d9d9] rounded-md"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
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

        {/* Page Numbers */}
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index}
            variant="outline"
            className={`rounded-md px-3 py-1 min-w-[40px] ${currentPage === index + 1 ? 'bg-[#d9d9d9]' : ''}`}
            onClick={() => goToPage(index + 1)}
          >
            {index + 1}
          </Button>
        ))}

        <Button
          variant="outline"
          className="bg-[#d9d9d9] rounded-md"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
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

 