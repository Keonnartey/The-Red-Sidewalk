"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SightingPopupModal from "./sighting-popup-modal";


interface SightingDetailsSidebarProps {
  sighting: {
    sighting_id?: number; // 👈 add this
    creature_name: string;
    creature_type: string;
    description: string;
    location_name: string;
    height_inch: number;
    weight_lb: number;
    sighting_date: string;
    latitude: number;
    longitude: number;
  };
  onClose: () => void;
}

const SightingDetailsSidebar: React.FC<SightingDetailsSidebarProps> = ({ sighting, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [selectedFullSighting, setSelectedFullSighting] = useState<any>(null);


  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const content = (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-[1100] p-4 overflow-y-auto"
    >
      <button onClick={onClose} className="mb-4 text-right w-full">Close</button>
      <h2 className="text-xl font-bold mb-2">{sighting.creature_name}</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Type of Creature</div>
        <div className="font-bold text-right">{sighting.creature_type}</div>

        <div>Short Description</div>
        <div className="font-bold text-right">{sighting.description}</div>

        <div>Height</div>
        <div className="font-bold text-right">{sighting.height_inch} inches</div>

        <div>Weight</div>
        <div className="font-bold text-right">{sighting.weight_lb} lbs</div>

        <div>Location</div>
        <div className="font-bold text-right">{sighting.location_name}</div>

        <div>Date</div>
        <div className="font-bold text-right">{sighting.sighting_date}</div>

        <div>Latitude</div>
        <div className="font-bold text-right">{sighting.latitude}</div>

        <div>Longitude</div>
        <div className="font-bold text-right">{sighting.longitude}</div>
      </div>
      <div className="mt-4">
        <button
          onClick={async () => {
            if (!sighting.sighting_id) return;

            try {
              const res = await fetch(`http://localhost:8000/sightings/${sighting.sighting_id}`);
              const fullData = await res.json();
              console.log("📸 Full sighting detail:", fullData);
              setSelectedFullSighting(fullData);
            } catch (err) {
              console.error("❌ Failed to fetch full sighting:", err);
              alert("Something went wrong.");
            }
          }}
          className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800"
        >
          More Info
        </button>
      </div>

    </motion.div>
  );

  // Prevent rendering until after client mount (avoids hydration mismatch)
  if (!mounted) return null;

  return (
    <>
      {createPortal(content, document.body)}
      {selectedFullSighting && (
        <SightingPopupModal
          data={selectedFullSighting}
          onClose={() => setSelectedFullSighting(null)}
        />
      )}
    </>
  );
};

export default SightingDetailsSidebar;
