// app/profile/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  
  // Use the same hardcoded user ID as in your backend router
  const CURRENT_USER_ID = 1;
  
  // Redirect as soon as possible
  useEffect(() => {
    if (!router) return; // Safety check
    
    // Small timeout to ensure the GIF is visible briefly
    const redirectTimeout = setTimeout(() => {
      console.log("Redirecting to user profile...");
      router.push(`/profile/${CURRENT_USER_ID}`);
    }, 2000); // Just 2 seconds to show the GIF
    
    // Cleanup timeout if component unmounts
    return () => {
      clearTimeout(redirectTimeout);
    };
  }, [router]);
  
  // Simple loading screen with GIF
  return (
    <div className="min-h-screen bg-[#1e2a44] flex flex-col items-center justify-center">
      {/* Show the GIF as loading animation */}
      <Image
        src="/badges/badges.gif"
        alt="Loading..."
        width={500}
        height={300}
        className="rounded-lg shadow-lg"
      />
      
      <h2 className="text-white text-2xl font-bold mt-6">
        Welcome Back User 1
      </h2>
    </div>
  );
}