"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface MapStateContextType {
  sightings: any[] | null;
  setSightings: (sightings: any[] | null) => void;
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
}

const MapStateContext = createContext<MapStateContextType | undefined>(undefined);

export function useMapState(): MapStateContextType {
  const context = useContext(MapStateContext);
  if (!context) {
    throw new Error("useMapState must be used within a MapStateProvider");
  }
  return context;
}

export function MapStateProvider({ children }: { children: ReactNode }) {
  const [sightings, setSightings] = useState<any[] | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const value: MapStateContextType = {
    sightings,
    setSightings,
    showFilter,
    setShowFilter,
  };

  return (
    <MapStateContext.Provider value={value}>
      {children}
    </MapStateContext.Provider>
  );
}
