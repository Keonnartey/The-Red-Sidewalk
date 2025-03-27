"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

interface FilterProps {
  onClose: () => void;
}

interface Coordinates {
  longitude: number;
  latitude: number;
}

interface SightingProperties {
  sighting_id: number;
  user_id: number;
  creature_id: number;
  creature_type: string;
  location_name: string;
  description: string;
  height_inch: number;
  sighting_date: string;
  created_at: string;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: SightingProperties;
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export default function Filter({ onClose }: FilterProps) {
  const router = useRouter();
  const creatureTypeMap: Record<string, number> = {
    ghost: 1,
    bigfoot: 2,
    dragon: 3,
    alien: 4,
  };

  const [formData, setFormData] = useState({
    creature_type: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatureTypeKey = formData.creature_type.toLowerCase();
    const creature_id = Number(creatureTypeMap[creatureTypeKey]);

    // Log the creature_id to see the exact value
    console.log('Creature ID:', creature_id);

    if (isNaN(creature_id)) {
      alert("Please select a valid creature type.");
      return;
    }

    try {
      // Ensure the URL is properly formed with creature_id as an integer
      const url = `http://localhost:8000/filters/filter_creature?creature_id=${creature_id}`;
      
      console.log('Fetching URL:', url);  // Log the full URL to verify it

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`HTTP error! status: ${res.status}, body: ${errorBody}`);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: GeoJSONFeatureCollection = await res.json();

      // Transform the GeoJSON to a more frontend-friendly format
      const transformedSightings = data.features.map(feature => ({
        ...feature.properties,
        coordinates: {
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1]
        }
      }));

      // Store the transformed sightings in localStorage
      localStorage.setItem('filteredSightings', JSON.stringify(transformedSightings));
      localStorage.setItem('currentCreatureType', formData.creature_type);

      onClose();
      router.push("/map"); // Navigate to map page to display filtered sightings
    } catch (err) {
      console.error("Filtering error:", err);
      alert("Something went wrong filtering the sightings. Please check the console for more details.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Choose Creature to See</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Creature Type</label>
            <select
              name="creature_type"
              value={formData.creature_type}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            >
              <option value="">Select one...</option>
              <option value="ghost">Ghost</option>
              <option value="bigfoot">Bigfoot</option>
              <option value="dragon">Dragon</option>
              <option value="alien">Alien</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          >
            Filter
          </button>
        </form>
      </motion.div>
    </div>
  );
}
