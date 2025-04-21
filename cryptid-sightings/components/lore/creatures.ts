export interface Creature {
    id: string
    name: string
    image: string
    tags: string[]
    otherNames?: string
    weaknesses?: string
    likes?: string
  }
  
  export const creatures: Creature[] = [
    {
      id: "bigfoot",
      name: "BIGFOOT",
      image: "/Bigfoot.jpg",
      tags: ["nocturnal", "carnivore", "shy"],
      otherNames: "Sasquatch, Yeti (Himalayas)",
    },
    {
      id: "vampire",
      name: "VAMPIRE",
      image: "/Vampire.jpg",
      tags: ["nocturnal", "carnivore"],
      weaknesses: "Garlic, sunlight, holy water",
    },
    {
      id: "ghost",
      name: "GHOST",
      image: "/Ghost.jpg",
      tags: ["nocturnal", "paranormal"],
      weaknesses: "Salt, iron, strong will",
    },
    {
      id: "dragon",
      name: "DRAGON",
      image: "/Dragon.jpg",
      tags: ["carnivore", "territorial", "flight"],
      likes: "Gold, gems, rare artifacts",
    },
    {
      id: "alien",
      name: "ALIEN",
      image: "/Alien.jpg",
      tags: ["unknown"],
      weaknesses: "Unknown",
    },
  ]
  
  export const getCreatureDetails = (id: string) => {
    return (
      {
        bigfoot: {
          height: "8 feet",
          weight: "600 pounds",
          locations: "North America",
          lore: `Bigfoot (/ˈbɪɡfʊt/), also commonly referred to as Sasquatch (/ˈsæskwætʃ/, /ˈsæskwɒtʃ/), is a large, hairy mythical creature said to inhabit forests in North America, particularly in the Pacific Northwest[2][3][4]. Bigfoot is featured in both American and Canadian folklore, and since the mid-20th century has grown into a cultural icon, permeating popular culture and becoming the subject of its own distinct subculture[5][6].
  
        Enthusiasts of Bigfoot, such as those within the pseudoscience of cryptozoology, have offered various forms of dubious evidence to prove Bigfoot's existence, including anecdotal claims of sightings as well as alleged photographs...`,
        },
        vampire: {
          height: "6 feet",
          weight: "140 pounds",
          locations: "Eastern Europe",
          lore: `Vampires are legendary creatures of the night, often depicted as immortal beings that drink the blood of the living to sustain themselves. Originating in European folklore, vampires are associated with darkness, mystery, and supernatural abilities.
  
        They are often seen as aristocratic, cunning, and seductive, using their charm to lure victims. Common weaknesses include sunlight, holy relics, and wooden stakes. Legends of vampires have inspired countless books, movies, and pop culture figures.`,
        },
        ghost: {
          height: "Variable",
          weight: "None",
          locations: "Everywhere",
          lore: `Ghosts are spirits of the dead that linger in the physical world, often due to unfinished business or tragic deaths. They are commonly associated with hauntings and eerie supernatural phenomena.`,
        },
        dragon: {
          height: "30 feet",
          weight: "10,000 pounds",
          locations: "The sky",
          lore: `Dragons are legendary creatures appearing in myths and folklore across cultures worldwide. Often depicted as large, reptilian beasts, they are known for their immense power, wisdom, and magical abilities.
  
        In Western mythology, dragons are fire-breathing monsters, often guarding treasure and challenging heroes in epic battles. Meanwhile, in Eastern traditions, dragons are seen as benevolent beings that symbolize wisdom, power, and the elements, particularly water and air.
  
        Dragons are known to be highly intelligent, sometimes capable of speech, magic, or shapeshifting. Their strengths vary—some can breathe fire, others control lightning or ice, and some even possess immortality.`,
        },
        alien: {
          height: "4 feet",
          weight: "180 pounds",
          locations: "New Mexico",
          lore: `Aliens are extraterrestrial beings often depicted as visitors from other planets with advanced intelligence and technology.`,
        },
      }[id] || {}
    )
  }
  
  