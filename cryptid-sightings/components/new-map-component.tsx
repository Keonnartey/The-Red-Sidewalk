"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";
import SightingDetailsSidebar from "./sighting-details-sidebar";
import { GhostIcon, BigfootIcon, DragonIcon, AlienIcon } from "./creature-icons";

const NewMapComponent = () => {
  const [selectedSighting, setSelectedSighting] = useState<any>(null);
  const [creatureFilter, setCreatureFilter] = useState<string[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<string[]>([]);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  useEffect(() => {
    if (!L) return; // Don't proceed if Leaflet isn't loaded yet

    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([20, 0], 2);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors | © OpenStreetMap',
        subdomains: "abcd",
      }).addTo(mapRef.current);
    }

    const fetchSightings = async () => {
      const params = new URLSearchParams();
      creatureFilter.forEach((type) => params.append("creature_types", type));
      seasonFilter.forEach((season) => params.append("seasons", season));

      try {
        const response = await fetch(`http://localhost:8000/sightings?\${params.toString()}`);
        const data = await response.json();

        if (!data || !data.features) {
          console.error("Invalid API response:", data);
          return;
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => mapRef.current.removeLayer(marker));
        markersRef.current = [];

        // Add new markers
        data.features.forEach((sighting: any) => {
          const coords = sighting.geometry.coordinates;
          const props = sighting.properties;
          const icon = getCreatureDivIcon(L, props.creature_type);

          const marker = L.marker([coords[1], coords[0]], { icon }).addTo(mapRef.current);
          marker.on("click", () => {
            setSelectedSighting({ ...props, latitude: coords[1], longitude: coords[0] });
          });
          markersRef.current.push(marker);
        });
      } catch (error) {
        console.error("Error fetching sightings:", error);
      }
    };

    fetchSightings();
  }, [L, creatureFilter, seasonFilter]);

  const getCreatureDivIcon = (L: any, creatureType: string | number | undefined, size = 30) => {
    let iconComponent;
    let color = "#fff"; // Default color
  
    switch (creatureType?.toString().toLowerCase()) {
      case "ghost":
      case "1":
        color = "#ffffff";
        iconComponent = <GhostIcon color={color} size={size} />;
        break;
      case "bigfoot":
      case "2":
        color = "#A0522D";
        iconComponent = <BigfootIcon color={color} size={size} />;
        break;
      case "dragon":
      case "3":
        color = "#FF4500";
        iconComponent = <DragonIcon color={color} size={size} />;
        break;
      case "alien":
      case "4":
        color = "#00FF00";
        iconComponent = <AlienIcon color={color} size={size} />;
        break;
      default:
        color = "#ffffff";
        iconComponent = <GhostIcon color={color} size={size} />;
    }
  
    return L.divIcon({
      html: ReactDOMServer.renderToStaticMarkup(iconComponent),
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
    });
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {selectedSighting && (
        <div
          style={{
            width: "300px",
            backgroundColor: "#fff",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
            padding: "20px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
          <SightingDetailsSidebar sighting={selectedSighting} onClose={() => setSelectedSighting(null)} />
        </div>
      )}

      <div style={{ flex: 1, position: "relative" }}>
        <div>
          <h3>Filter by Creature Type:</h3>
          {["ghost", "bigfoot", "dragon", "alien"].map((type) => (
            <label key={type} style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                checked={creatureFilter.includes(type)}
                onChange={() =>
                  setCreatureFilter((prev) =>
                    prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                  )
                }
              />
              {type}
            </label>
          ))}
        </div>
        <div>
          <h3>Filter by Season:</h3>
          {["spring", "summer", "fall", "winter"].map((season) => (
            <label key={season} style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                checked={seasonFilter.includes(season)}
                onChange={() =>
                  setSeasonFilter((prev) =>
                    prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
                  )
                }
              />
              {season}
            </label>
          ))}
        </div>
        <div id="map" style={{ height: "100%", width: "100%" }} />
      </div>
    </div>
  );
};

export default NewMapComponent;