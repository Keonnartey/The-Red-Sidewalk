import TestMapWrapper from "@/components/test-map-wrapper";

export default function TestMapPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Title */}
      <div className="absolute top-6 sm:top-10 right-4 sm:right-40 text-right z-[1000] max-w-[90vw]">
        <h1
          className="text-white text-3xl sm:text-5xl font-bold leading-tight tracking-wide"
          style={{ textShadow: "2px 2px 6px rgba(0,0,0,0.6)" }}
        >
          REAL THINGS
          <br />
          SIGHTINGS
        </h1>
      </div>

      {/* Map */}
      <TestMapWrapper />
    </main>

  );
}
