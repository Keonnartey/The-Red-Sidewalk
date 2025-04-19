"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // ✅ import router
import {
  Filter,
  Users,
  BookOpen,
  User,
  MapPinPlus,
  MapPinned,
} from "lucide-react";
import { useSightings } from "@/hooks/useSightingsStore"; // ✅ context with resetSightings

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setShowFilter, resetSightings, setShowReportForm, setLaunchFilterAfterRoute, setLaunchReportAfterRoute } = useSightings(); // ✅ include resetSightings

  const handleMapClick = () => {
    if (pathname === "/map") {
      resetSightings(); // ✅ reset if already on map
    } else {
      router.push("/map"); // ✅ navigate if not on map
    }
  };

  const handleFilterClick = () => {
    if (pathname === "/map") {
      setShowFilter(true);
    } else {
      setLaunchFilterAfterRoute(true);
      router.push("/map");
    }
  };
  
  const handleReportClick = () => {
    if (pathname === "/map") {
      setShowReportForm(true);
    } else {
      setLaunchReportAfterRoute(true);
      router.push("/map");
    }
  };

  return (
    <div className="w-[130px] bg-[#1e1d4a] flex flex-col items-center py-4 gap-8 shrink-0">
      <button
        onClick={() => {
          setShowFilter(false);
          setShowReportForm(false);
          handleMapClick();
        }}
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${
          pathname === "/map" ? "bg-[#dacfff]" : "bg-white"
        }`}
      >
        <MapPinned className="w-10 h-10 text-[#1e1d4a]" />
      </button>

      <button
        onClick={() => {
          console.log("🔍 Opening filter modal from sidebar");
          setShowReportForm(false);
          handleFilterClick();
        }}
        className="w-[80px] h-[80px] rounded-lg flex items-center justify-center bg-white hover:bg-[#dacfff] transition"
      >
        <Filter className="w-10 h-10 text-[#1e1d4a]" />
      </button>

      <button
        onClick={() => {
          console.log("🔍 Opening report modal from sidebar");
          setShowFilter(false);
          handleReportClick();
        }}
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center bg-white hover:bg-[#dacfff] transition`}
      >
        <MapPinPlus className="w-10 h-10 text-[#1e1d4a]" />
      </button>

      <Link
        href="/discuss"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${
          pathname === "/discuss" ? "bg-[#dacfff]" : "bg-white"
        }`}
      >
        <Users className="w-10 h-10 text-[#1e1d4a]" />
      </Link>

      <Link
        href="/creatures"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${
          pathname === "/creatures" ? "bg-[#dacfff]" : "bg-white"
        }`}
      >
        <BookOpen className="w-10 h-10 text-[#1e1d4a]" />
      </Link>

      <Link
        href="/profile"
        className={`w-[80px] h-[80px] rounded-lg flex items-center justify-center ${
          pathname === "/profile" ? "bg-[#dacfff]" : "bg-white"
        }`}
      >
        <User className="w-10 h-10 text-[#1e1d4a]" />
      </Link>
    </div>
  );
}
