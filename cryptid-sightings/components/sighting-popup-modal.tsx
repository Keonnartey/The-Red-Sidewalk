"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SightingPopupModalProps {
  data: {
    sighting_id: number;
    preview: {
      creature_id: number;
      location_name: string;
      description_short: string;
      height_inch: number;
      weight_lb: number;
      sighting_date: string;
      latitude: number;
      longitude: number;
      user_id: number;
    };
    images: string[];
  };
  onClose: () => void;
}

const SightingPopupModal: React.FC<SightingPopupModalProps> = ({ data, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const { preview, images } = data;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[1200] bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sighting Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Location: <span className="font-semibold">{preview.location_name}</span></p>
          <p className="text-sm text-gray-600">Date: <span className="font-semibold">{preview.sighting_date}</span></p>
          <p className="text-sm text-gray-600">Height: <span className="font-semibold">{preview.height_inch} inches</span></p>
          <p className="text-sm text-gray-600">Weight: <span className="font-semibold">{preview.weight_lb} lbs</span></p>
          <p className="text-sm text-gray-600">Coordinates: <span className="font-semibold">({preview.latitude}, {preview.longitude})</span></p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Description</h3>
          <p className="text-gray-700 text-sm bg-gray-100 rounded p-3">
            {preview.description_short}
          </p>
        </div>

        {images.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-2 gap-3">
              {images.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Sighting image ${idx + 1}`}
                  className="w-full h-48 object-cover rounded shadow"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
};

export default SightingPopupModal;
