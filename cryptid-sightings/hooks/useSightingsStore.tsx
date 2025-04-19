// components/hooks/useSightingsStore.ts
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Sighting {
  sighting_id?: number;
  creature_name: string;
  creature_type: string;
  location_name: string;
  description: string;
  height_inch: number;
  weight_lb: number;
  sighting_date: string;
  latitude: number;
  longitude: number;
  coordinates?: Coordinates;
}

interface SightingsContextType {
  sightings: Sighting[] | null;
  setSightings: (sightings: Sighting[] | null) => void;
  showFilter: boolean;
  setShowFilter: (show: boolean) => void;
  resetSightings: () => void;
  filtered: boolean;
  setFiltered: (value: boolean) => void;
  showReportForm: boolean;
  setShowReportForm: (v: boolean) => void;
  launchFilterAfterRoute: boolean;
  setLaunchFilterAfterRoute: (v: boolean) => void;
  launchReportAfterRoute: boolean;
  setLaunchReportAfterRoute: (v: boolean) => void;
}

const SightingsContext = createContext<SightingsContextType | undefined>(undefined);

export function useSightings(): SightingsContextType {
  const context = useContext(SightingsContext);
  if (!context) {
    throw new Error("useSightings must be used within a SightingsProvider");
  }
  return context;
}

export function SightingsProvider({ children }: { children: ReactNode }) {
  const [sightings, setSightings] = useState<Sighting[] | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filtered, setFiltered] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [launchFilterAfterRoute, setLaunchFilterAfterRoute] = useState(false);
  const [launchReportAfterRoute, setLaunchReportAfterRoute] = useState(false);

  const resetSightings = async () => {
    try {
      const res = await fetch("http://localhost:8000/sightings");
      const data = await res.json();
  
      const all = data.features.map((f: any) => ({
        ...f.properties,
        coordinates: {
          longitude: f.geometry.coordinates[0],
          latitude: f.geometry.coordinates[1],
        },
      }));
  
      setSightings(all);
      setFiltered(false);
      console.log("🔄 Reset to full sightings.");
    } catch (err) {
      console.error("❌ Failed to reset sightings:", err);
    }
  };  

  const value: SightingsContextType = {
    sightings,
    setSightings,
    showFilter,
    setShowFilter,
    resetSightings,
    filtered,
    setFiltered,
    showReportForm,
    setShowReportForm,
    launchFilterAfterRoute,
    setLaunchFilterAfterRoute,
    launchReportAfterRoute,
    setLaunchReportAfterRoute
  };

  return (
    <SightingsContext.Provider value={value}>
      {children}
    </SightingsContext.Provider>
  );
}
