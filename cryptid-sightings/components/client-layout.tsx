"use client";

import { usePathname } from "next/navigation";
import { SightingsProvider } from "@/hooks/useSightingsStore";
import Sidebar from "@/components/sidebar"; // 👈 Add this back

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showMapOnRoutes = ["/", "/filter", "/report"];
  const shouldShowMap = showMapOnRoutes.includes(pathname);

  return (
    <SightingsProvider>
      {/* ✅ Global Sidebar is always rendered again */}
      <div className="absolute top-0 left-0 z-20 pointer-events-auto">
        <Sidebar />
      </div>

      {/* Main layout container */}
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
    </SightingsProvider>
  );
}
