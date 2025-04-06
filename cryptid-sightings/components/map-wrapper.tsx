// /components/map-wrapper.tsx
"use client";

import dynamic from "next/dynamic";

const NewMapComponent = dynamic(() => import("./new-map-component"), { ssr: false });

export default function MapWrapper() {
  return (
    <div className="absolute inset-0 z-0">
      <NewMapComponent />
    </div>
  );
}
