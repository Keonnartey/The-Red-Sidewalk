// app/map/page.tsx
"use client";

import dynamic from "next/dynamic";
import Filter from "@/components/filter-form-modal";
import { useSightings } from "@/hooks/useSightingsStore";
import ReportFormModal from "@/components/report-form-modal";

// Dynamic import for Leaflet map wrapper
const MapWrapper = dynamic(() => import("@/components/map-wrapper"), { ssr: false });

export default function MapPage() {
  const {
    showReportForm,
    setShowReportForm,
    showFilter,
    setShowFilter,
    filtered,
    resetSightings,
  } = useSightings();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Leaflet Map */}
      <MapWrapper />

      {/* Title */}
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

      {/* ✅ Clear Filters button appears only when filtered */}
      {filtered && (
        <button
          onClick={resetSightings}
          className="absolute top-6 left-[150px] z-[950] bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-200"
        >
          Clear Filters
        </button>
      )}

      {/* Filter modal triggered via context */}
      {showFilter && <Filter onClose={() => setShowFilter(false)} />}

      {showReportForm && (
        <ReportFormModal
          onClose={() => {
            setShowReportForm(false);
            resetSightings(); // ensures new sighting shows up
          }}
        />
      )}
    </div>
  );
}
