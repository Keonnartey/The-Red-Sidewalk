'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface GuestReportRestrictionModalProps {
  onClose: () => void;
}

export default function GuestReportRestrictionModal({ onClose }: GuestReportRestrictionModalProps) {
  const router = useRouter();
  
  const handleGoToLogin = () => {
    router.push('/');
    onClose();
  };
  
  const handleBackToMap = () => {
    onClose(); // Just close the modal, we're already on the map
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Guests Cannot Report Sightings</h2>
          <p className="mb-6">
            Please login to report a sighting. Guest users can only access the map page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBackToMap}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
            >
              Back to Map
            </button>
            <button
              onClick={handleGoToLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}