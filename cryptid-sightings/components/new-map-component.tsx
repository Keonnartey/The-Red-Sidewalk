"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";
import SightingDetailsSidebar from "./sighting-details-sidebar";
import { GhostIcon, BigfootIcon, DragonIcon, AlienIcon } from "./creature-icons";

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
  const [selectedSighting, setSelectedSighting] = useState<any>(null);
  const [sightingsData, setSightingsData] = useState<any[]>([]);

  useEffect(() => {
    // Get filtered sightings from localStorage
    const filteredSightings = localStorage.getItem("filteredSightings");
    if (filteredSightings) {
      const sightings = JSON.parse(filteredSightings);
      setSightingsData(sightings);
    }
  }, []);

  useEffect(() => {
    if (sightingsData.length === 0) return; // Don't proceed if there's no data

    requestAnimationFrame(() => {
      const mapContainer = document.getElementById("map");

      if (!mapContainer) {
        console.warn("🚨 Map container not found.");
        return;
      }

      // 👇 Prevent re-initializing the map if it's already there
      if ((mapContainer as any)._leaflet_id != null) {
        console.warn("🛑 Map is already initialized, skipping.");
        return;
      }

      const map = L.map(mapContainer).setView([20, 0], 2);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> contributors | © OpenStreetMap',
        subdomains: "abcd",
      }).addTo(map);

      // Use the sightings data that is filtered based on creature type
      sightingsData.forEach((sighting: any) => {
        const { coordinates } = sighting;
        const { creature_type, location_name, description } = sighting;

        const marker = L.marker([coordinates.latitude, coordinates.longitude], {
          icon: getCreatureDivIcon(creature_type, "#00FFC2"),
        }).addTo(map);

        marker.on("click", () => {
          setSelectedSighting({
            creature_type,
            location_name,
            description,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
          });
        });
      });

      return () => {
        map.remove();
      };
    });
  }, [sightingsData]);

  return (
    <>
      <div id="map" style={{ height: "90vh", width: "100%" }} />
      {selectedSighting && (
        <SightingDetailsSidebar
          sighting={selectedSighting}
          onClose={() => setSelectedSighting(null)}
        />
      )}
    </>
  );
};

export default NewMapComponent;
