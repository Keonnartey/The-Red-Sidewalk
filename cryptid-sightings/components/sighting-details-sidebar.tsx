// /components/sighting-details-sidebar.tsx
import { motion } from "framer-motion";

interface SightingDetailsSidebarProps {
  sighting: {
    creature_name: string;
    creature_type: string;
    description: string;
    location_name: string;
    height_inch: number;
    sighting_date: string;
    latitude: number;
    longitude: number;
  };
  onClose: () => void;
}

const SightingDetailsSidebar: React.FC<SightingDetailsSidebarProps> = ({ sighting, onClose }) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-[1100] p-4 overflow-y-auto"
    >
      <button onClick={onClose} className="mb-4 text-right w-full">Close</button>
      <h2 className="text-xl font-bold mb-2">{sighting.creature_name}</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Type of Creature</div>
        <div className="font-bold text-right">{sighting.creature_type}</div>

        <div>Short Description</div>
        <div className="font-bold text-right">{sighting.description}</div>

        <div>Height</div>
        <div className="font-bold text-right">{sighting.height_inch} inches</div>

        <div>Location</div>
        <div className="font-bold text-right">{sighting.location_name}</div>

        <div>Date</div>
        <div className="font-bold text-right">{sighting.sighting_date}</div>

        <div>Latitude</div>
        <div className="font-bold text-right">{sighting.latitude}</div>

        <div>Longitude</div>
        <div className="font-bold text-right">{sighting.longitude}</div>
      </div>
    </motion.div>
  );
};

export default SightingDetailsSidebar;
