"use client";

import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import SightingPopupModal from "./sighting-popup-modal";

interface SightingDetailsSidebarProps {
  sighting: {
    sighting_id?: number;
    creature_name: string;
    creature_type: string;
    description: string;
    location_name: string;
    height_inch: number;
    weight_lb: number;
    sighting_date: string;
  };
  onClose: () => void;
}

const SightingDetailsSidebar: React.FC<SightingDetailsSidebarProps> = ({
  sighting,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedFullSighting, setSelectedFullSighting] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [customReason, setCustomReason] = useState("");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  
  const submitFlag = async () => {
    if (!sighting.sighting_id) return;

    // const userId = JSON.parse(localStorage.getItem('user'))?.id;
    // if (!userId) {
    //   alert("You must be logged in to report a sighting.");
    //   return;
    // }

    const payload = {
      content_id: sighting.sighting_id,
      content_type: "sighting",
      user_id: 2,
      // user_id: userId, // 👈 Update with actual user ID dynamically if you have auth
      reason,
      custom_reason: customReason,
    };

    try {
      const res = await fetch("http://localhost:8000/content_flags/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to report content.");
      alert("✅ Report submitted!");
      setIsReportModalOpen(false);
      setReason("spam");
      setCustomReason("");
    } catch (err) {
      console.error("❌ Report submission failed:", err);
      alert("Something went wrong.");
    }
  };

  const content = (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-[1100] p-4 overflow-y-auto"
    >
      <button onClick={onClose} className="mb-4 text-right w-full">
        Close
      </button>
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

      <div className="mt-4 flex flex-col gap-2">
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

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 mt-2"
        >
          🚩 Report
        </button>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[1200] flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4">Report Sighting</h3>

            <label className="block mb-2 text-sm font-medium">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            >
              <option value="spam">Spam</option>
              <option value="misleading">Misleading</option>
              <option value="inappropriate">Inappropriate</option>
              <option value="offensive">Offensive</option>
            </select>

            <label className="block mb-2 text-sm font-medium">Custom Reason (Optional)</label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Add more details..."
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={submitFlag}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

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
