"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./new-map-component"), {
  ssr: false,
});

export default function TestMapWrapper() {
  return <MapComponent />;
}
