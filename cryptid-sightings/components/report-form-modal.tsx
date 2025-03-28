"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

interface ReportFormModalProps {
  onClose: () => void;
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
    creature_name: "",
    description: "",
    location_name: "",
    height_inch: "",
    sighting_date: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const creatureTypeKey = formData.creature_type.toLowerCase();
    const creature_id = creatureTypeMap[creatureTypeKey];
  
    if (!creature_id) {
      alert("Please select a valid creature type.");
      return;
    }
  
    // Build payload
    const payload = {
      user_id: 1, // mock
      creature_id: creature_id,
      location_name: formData.location_name,
      description_short: formData.description,
      height_inch: Number(formData.height_inch),
      sighting_date: formData.sighting_date,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    };
  
    try {
      const res = await fetch("http://localhost:8000/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        throw new Error("Failed to submit sighting.");
      }
  
      const data = await res.json();
      console.log("✅ Submitted:", data);
      
      onClose();            // Close the modal

      router.push("/");              // Navigate to home
      setTimeout(() => {
        window.location.reload();    // Then refresh the home page
      }, 100); // slight delay to ensure navigation completes

    } catch (err) {
      console.error("❌ Submission error:", err);
      alert("Something went wrong submitting your sighting.");
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

        <h2 className="text-2xl font-bold mb-4 text-center">Report a New Sighting</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div>
              <label className="block text-sm font-medium">Creature Type</label>
              <select
                name="creature_type"
                value={formData.creature_type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, creature_type: e.target.value }))
                }
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
          </div>

          <div>
            <label className="block text-sm font-medium">Creature Name</label>
            <input
              type="text"
              name="creature_name"
              value={formData.creature_name}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Give it a name!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
              rows={3}
              placeholder="What did you see?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Location Name</label>
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
              placeholder="e.g. Bluff Creek, CA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Height (inches)</label>
              <input
                type="number"
                name="height_inch"
                value={formData.height_inch}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input
                type="date"
                name="sighting_date"
                value={formData.sighting_date}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
          >
            Submit Sighting
          </button>
        </form>
      </motion.div>
    </div>
  );
}
