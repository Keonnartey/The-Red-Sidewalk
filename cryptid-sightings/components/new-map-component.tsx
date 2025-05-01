"use client";

import { useEffect, useRef, useState } from "react";
import L, { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";
import SightingDetailsSidebar from "./sighting-details-sidebar";

import { GhostIcon, BigfootIcon, DragonIcon, AlienIcon, VampireIcon} from "./creature-icons";
import { useSightings } from "@/hooks/useSightingsStore";

const getCreatureDivIcon = (
  creatureType: string | number | undefined,
  _color = "#fff",
  size = 30
) => {
  let iconComponent;
  let color = "#fff";

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
    case "vampire":
    case "5":
      color = "#8B0000";
      iconComponent = <VampireIcon color={color} size={size} />;
      break;
    default:
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
  const { sightings, setSightings } = useSightings();
  const [selectedSighting, setSelectedSighting] = useState<any>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  // Initialize map ONCE
  useEffect(() => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer || mapRef.current) return;

    const map = L.map(mapContainer).setView([20, 0], 2);
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors | © OpenStreetMap',
      subdomains: "abcd",
    }).addTo(map);

    // If no filtered sightings yet, fetch all
    if (!sightings) {
      fetch("http://localhost:8000/sightings")
        .then(res => res.json())
        .then(data => {
          const all = data.features.map((f: any) => ({
            ...f.properties,
            coordinates: {
              longitude: f.geometry.coordinates[0],
              latitude: f.geometry.coordinates[1],
            },
          }));
          setSightings(all);
        });
    }
  }, []);

  // Watch for changes in sightings and add markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sightings) return;

    // Clear old markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    sightings.forEach((sighting: any) => {
      const marker = L.marker([sighting.coordinates.latitude, sighting.coordinates.longitude], {
        icon: getCreatureDivIcon(sighting.creature_type),
      }).addTo(map);

      marker.on("click", () => setSelectedSighting(sighting));
      markersRef.current.push(marker);
    });

    console.log("📍 Updated map with sightings:", sightings);
  }, [sightings]);

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
