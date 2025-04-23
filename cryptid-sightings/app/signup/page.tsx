'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamic import to prevent server-side rendering issues with authentication
const SignUpPage = dynamic(() => import('../../components/SignUpPage'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function SignUp() {
  return <SignUpPage />;
}