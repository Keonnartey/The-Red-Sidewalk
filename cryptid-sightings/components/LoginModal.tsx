
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const router = useRouter();
  
  const handleGoToLogin = () => {
    router.push('/');
    onClose();
  };
  
  const handleBackToMap = () => {
    router.push('/map');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="mb-4">Please login to view this page. Guest users can only access the map page.</p>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={handleBackToMap}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Back to Map
          </button>
          <button 
            onClick={handleGoToLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;