"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";
import { GhostIcon, BigfootIcon, DragonIcon, AlienIcon } from "./creature-icons";

// Function to create creature icons
const getCreatureDivIcon = (
  creatureType: string | number | undefined,
  _color = "#fff", // optional override
  size = 30
) => {
  let iconComponent;
  let color = "#fff"; // default color

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

  const html = ReactDOMServer.renderToStaticMarkup(iconComponent);

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

const NewMapComponent = () => {
  const [map, setMap] = useState<L.Map | null>(null); // Store the map instance
  const [markers, setMarkers] = useState<L.Marker[]>([]); // Store the markers for cleanup

  // Initialize the map only once
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mapContainer = document.getElementById("map");

      if (!mapContainer) {
        console.warn("🚨 Map container not found.");
        return;
      }

      // If map is already initialized, skip initialization
      if ((mapContainer as any)._leaflet_id != null) {
        console.warn("🛑 Map is already initialized, skipping.");
        return;
      }

      const newMap = L.map(mapContainer).setView([20, 0], 2);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors | © OpenStreetMap',
        subdomains: "abcd",
      }).addTo(newMap);

      setMap(newMap);

      return () => {
        newMap.remove();
      };
    }
  }, []);

  // Update the map with filtered sightings from localStorage
  useEffect(() => {
    if (map) {
      // Get filtered sightings from localStorage
      const filteredSightings = JSON.parse(localStorage.getItem("filteredSightings") || "[]");

      // Cleanup existing markers
      markers.forEach((marker) => {
        marker.remove();
      });

      // Add new markers for filtered sightings
      const newMarkers = filteredSightings.map((sighting: any) => {
        const { longitude, latitude, creature_type } = sighting;
        const marker = L.marker([latitude, longitude], {
          icon: getCreatureDivIcon(creature_type),
        }).addTo(map);

        return marker;
      });

      // Update state with the new markers
      setMarkers(newMarkers);
    }
  }, [map]); // Re-run when map is initialized

  return (
    <div>
      <div id="map" style={{ height: "90vh", width: "100%" }} />
    </div>
  );
};

export default NewMapComponent;
