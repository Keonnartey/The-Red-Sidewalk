"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function BadgesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("general");

  // Navigation handler
  const navigateTo = (tab: string, route: string) => {
    setActiveTab(tab);
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-[#1e2a44] p-6 flex flex-col md:flex-row">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8 md:mb-0">
        {/* Replace the src with your gif/image file */}
        <Image
          src="/badges/badges.mp4"
          alt="Badges Animation"
          width={500}
          height={300}
          className="rounded-lg shadow-lg"
        />
        <h2 className="text-white text-2xl font-bold mt-4">
          Welcome Back User 1
        </h2>
      </div>

      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 md:ml-8 flex flex-col space-y-4">
        <Button
          variant="outline"
          className={`w-full text-lg py-4 ${
            activeTab === "general"
              ? "bg-[#d9d9d9]"
              : "bg-[#d9d9d9] bg-opacity-70"
          }`}
          onClick={() => navigateTo("general", "/profile/general")}
        >
          General
        </Button>

        <Button
          variant="outline"
          className={`w-full text-lg py-4 ${
            activeTab === "socialness"
              ? "bg-[#d9d9d9]"
              : "bg-[#d9d9d9] bg-opacity-70"
          }`}
          onClick={() => navigateTo("socialness", "/profile/socialness")}
        >
          Socialness
        </Button>

        <Button
          variant="outline"
          className={`w-full text-lg py-4 ${
            activeTab === "badges"
              ? "bg-[#dacfff]"
              : "bg-[#d9d9d9] bg-opacity-70"
          }`}
          onClick={() => navigateTo("badges", "/badges")}
        >
          Badges
        </Button>

        <Button
          variant="outline"
          className={`w-full text-lg py-4 ${
            activeTab === "settings"
              ? "bg-[#d9d9d9]"
              : "bg-[#d9d9d9] bg-opacity-70"
          }`}
          onClick={() => navigateTo("settings", "/profile/settings")}
        >
          Settings
        </Button>
      </div>
    </div>
  );
}