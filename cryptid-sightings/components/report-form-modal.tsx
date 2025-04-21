"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useEffect } from "react";

interface ReportFormModalProps {
  onClose: () => void;
}

export default function ReportFormModal({ onClose }: ReportFormModalProps) {

  const [selectedPhotos, setSelectedPhotos] = useState<FileList | null>(null);

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showStatusPopup, setShowStatusPopup] = useState(false);

  const [submissionComplete, setSubmissionComplete] = useState(false);

  const router = useRouter();

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleLocationInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, location_name: value }));
  
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
  
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        value
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    );
    const data = await res.json();
    setSuggestions(data.features || []);
  };
  
  const handleSelectSuggestion = (place: any) => {
    setFormData((prev) => ({
      ...prev,
      location_name: place.place_name,
      latitude: place.center[1], // [lng, lat]
      longitude: place.center[0],
    }));
    setSuggestions([]);
  };
  

  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const creatureTypeMap: Record<string, number> = {
    ghost: 1,
    bigfoot: 2,
    dragon: 3,
    alien: 4,
    vampire: 5,
  };

  const [formData, setFormData] = useState({
    creature_type: "",
    creature_name: "",
    description: "",
    location_name: "",
    height_inch: "",
    weight_lb: "",
    sighting_date: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double-submission

    setIsSubmitting(true);
    setShowStatusPopup(true);
    setSubmissionComplete(false);
  
    const creatureTypeKey = formData.creature_type.toLowerCase();
    const creature_id = creatureTypeMap[creatureTypeKey];
  
    if (!creature_id) {
      alert("Please select a valid creature type.");
      return;
    }
  
    let photoKeys: string[] = [];
  
    try {
      if (selectedPhotos && selectedPhotos.length > 0) {
        // Step 1: Request pre-signed URLs
        const res = await fetch("https://uvug5nut6k.execute-api.us-east-1.amazonaws.com/default/cryptids_lambda_presignedkey", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            num_photos: selectedPhotos.length,
            content_types: Array.from(selectedPhotos).map((file) => file.type)
          })
        });
  
        const { photos } = await res.json(); // { key, upload_url }[]
  
        // Step 2: Upload photos to S3 using pre-signed URLs
        await Promise.all(
          photos.map((photo: any, i: number) =>
            fetch(photo.upload_url, {
              method: "PUT",
              headers: {
                "Content-Type": selectedPhotos[i].type
              },
              body: selectedPhotos[i]
            })
          )
        );
  
        // Step 3: Collect keys for backend payload
        photoKeys = photos.map((p: any) => p.key);
      }
  
      // Final payload
      const payload = {
        user_id: 1, // mock
        creature_id,
        location_name: formData.location_name,
        description_short: formData.description,
        height_inch: Number(formData.height_inch),
        weight_lb: Number(formData.weight_lb),
        sighting_date: formData.sighting_date,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        photo_s3_keys: photoKeys
      };
  
      const submitRes = await fetch("http://localhost:8000/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      if (!submitRes.ok) throw new Error("Failed to submit sighting.");
  
      console.log("✅ Submitted:", await submitRes.json());
      setSubmissionComplete(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error("❌ Error submitting:", err);
      alert("Something went wrong submitting your sighting.");
      setIsSubmitting(false);
      setSubmissionComplete(true);
    }
  };
  
  

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className={`absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl ${
            isSubmitting ? "cursor-not-allowed opacity-50" : ""
          }`}
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Report a New Sighting</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div>
              <label className="block text-sm font-medium">Creature Type</label>
              <select
                name="creature_type"
                value={formData.creature_type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, creature_type: e.target.value }))
                }
                required
                className="w-full border rounded p-2"
              >
                <option value="">Select one...</option>
                <option value="ghost">Ghost</option>
                <option value="bigfoot">Bigfoot</option>
                <option value="dragon">Dragon</option>
                <option value="alien">Alien</option>
                <option value="vampire">Vampire</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Creature Name</label>
            <input
              type="text"
              name="creature_name"
              value={formData.creature_name}
              onChange={handleChange}
              className="w-full border rounded p-2"
              placeholder="Give it a name!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
              rows={3}
              placeholder="What did you see?"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium">Location Name</label>
            <input
              type="text"
              name="location_name"
              value={formData.location_name}
              onChange={handleLocationInputChange}
              required
              className="w-full border rounded p-2"
              placeholder="Start typing a city..."
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border border-gray-300 mt-1 rounded w-full max-h-48 overflow-y-auto z-[1200]">
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectSuggestion(place)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {place.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Height (inches)</label>
              <input
                type="number"
                name="height_inch"
                value={formData.height_inch}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Weight (lbs)</label>
              <input
                type="number"
                name="weight_lb"
                value={formData.weight_lb}
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              name="sighting_date"
              value={formData.sighting_date}
              onChange={handleChange}
              required
              className="w-full border rounded p-2"
            />
          </div>


          <div>
            <label className="block text-sm font-medium">Upload Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isSubmitting}
              onChange={(e) => {
                const files = e.target.files;
                setSelectedPhotos(files);
                if (files) {
                  const urls = Array.from(files).map((file) => URL.createObjectURL(file));
                  setPreviewUrls(urls);
                }
              }}
              className="w-full border rounded p-2"
            />
          </div>

          {previewUrls.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {previewUrls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preview ${i}`}
                  className="w-full h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white py-2 px-4 rounded ${
              isSubmitting ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Sighting"}
          </button>

        </form>
      </motion.div>
      {showStatusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[1200] flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80 text-center">
            {!submissionComplete ? (
              <>
                <div className="w-10 h-10 mx-auto border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium">Processing New Sighting...</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">✅ Sighting Recorded!</h3>
                <button
                  onClick={() => {
                    setShowStatusPopup(false);
                    onClose();
                    router.push("/");
                    setTimeout(() => window.location.reload(), 100);
                  }}
                  className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                >
                  Return to Map
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
