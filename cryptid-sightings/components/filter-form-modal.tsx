"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
interface ReportFormModalProps {
  onClose: () => void;
}
interface Sighting {
  id: number;
  creature_id: number;
  // Add other sighting properties as needed
}
export default function ReportFormModal({ onClose }: ReportFormModalProps) {
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
  const [allSightings, setAllSightings] = useState<Sighting[]>([]);
  const [filteredSightings, setFilteredSightings] = useState<Sighting[]>([]);
  // Fetch all sightings on component mount
  useEffect(() => {
    async function fetchAllSightings() {
      try {
        const res = await fetch("http://localhost:8000/sightings/all");
        if (!res.ok) throw new Error("Failed to fetch sightings");
        const data: Sighting[] = await res.json();
        setAllSightings(data);
      } catch (err) {
        console.error("Error fetching sightings:", err);
      }
    }
    fetchAllSightings();
  }, []);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatureTypeKey = formData.creature_type.toLowerCase();
    const creature_id = creatureTypeMap[creatureTypeKey];
    if (!creature_id) {
      alert("Please select a valid creature type.");
      return;
    }
    try {
      // Use the same approach as the successful filtering implementation
      const res = await fetch(`http://localhost:8000/filters/filter_creature?creature_id=${creature_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to retrieve sightings.");
      }
      const data = await res.json();
      console.log(":white_check_mark: Filtered sightings:", data);
      // Store the filtered sightings in state or context for use in the destination page
      // You could use localStorage, context API, or state management like Redux
      localStorage.setItem('filteredSightings', JSON.stringify(data));
      onClose(); // Close the modal
      router.push("/"); // Navigate to home
      // No need to refresh the page, instead the destination page should load the filtered data
      // The refresh is causing state to be lost
    } catch (err) {
      console.error(":x: Filtering error:", err);
      alert("Something went wrong filtering the sightings.");
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
        {/* Close Button */}
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