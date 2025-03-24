"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const NewMapComponent = () => {
  useEffect(() => {
    const map = L.map("map").setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    fetch("http://localhost:8000/sightings")
      .then((res) => res.json())
      .then((data) => {
        data.features.forEach((sighting: any) => {
          const coords = sighting.geometry.coordinates;
          const props = sighting.properties;

          const marker = L.marker([coords[1], coords[0]]).addTo(map);

          marker.bindPopup(`
            <strong>${props.creature_name}</strong><br/>
            ${props.description}<br/>
            Rating: ${props.rating}/5<br/>
            Seen on: ${props.sighting_date}
          `);
        });
      });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      id="map"
      style={{
        height: "90vh",
        width: "100%",
      }}
    />
  );
};

export default NewMapComponent;
