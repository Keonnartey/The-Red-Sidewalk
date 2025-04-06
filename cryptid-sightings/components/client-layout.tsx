"use client";

import { usePathname } from "next/navigation";
import MapWrapper from "@/components/map-wrapper";
import Sidebar from "@/components/sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showMapOnRoutes = ["/", "/filter", "/report"];
  const shouldShowMap = showMapOnRoutes.includes(pathname);

  return (
    <>
      {/* Render the background map only on selected routes */}
      {shouldShowMap && <MapWrapper />}

      {/* Title shown only when map is visible */}
      {shouldShowMap && (
        <div className="absolute top-6 right-6 z-[900] text-right max-w-[90vw] pointer-events-none">
          <h1
            className="text-white text-3xl sm:text-5xl font-bold leading-tight tracking-wide"
            style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}
          >
            REAL THINGS
            <br />
            SIGHTINGS
          </h1>
        </div>
      )}

      {/* Sidebar is always visible and interactive */}
      <div className="absolute top-0 left-0 z-20 pointer-events-auto">
        <Sidebar />
      </div>

      {/* Main page content */}
      <div
        className={`relative z-10 w-full ${
          shouldShowMap
            ? "h-screen overflow-hidden pointer-events-none"
            : "min-h-screen overflow-auto pointer-events-auto"
        }`}
      >
        <main className="flex-1 relative overflow-auto pointer-events-auto">
          {children}
        </main>
      </div>
    </>
  );
}
