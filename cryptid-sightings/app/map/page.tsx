import NewMapComponent from "@/components/filter-map-components";

export default function MapPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-center my-4">Cryptid Sightings Map</h1>
      <NewMapComponent />
    </div>
  );
}
