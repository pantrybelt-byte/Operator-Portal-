import React, { useState, useEffect, useRef } from "react";
import { Building2, MapPin, Save, ShieldCheck, Navigation } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PantryInfo } from "../types";

// Custom Leaflet Pin Icon
const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ProfilePageProps {
  pantry: PantryInfo;
  onUpdatePantry: (updated: PantryInfo) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ pantry, onUpdatePantry }) => {
  const [formData, setFormData] = useState<PantryInfo>(pantry);
  const [isSaved, setIsSaved] = useState(false);

  // Precise Geolocation Coordinates State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: pantry.latitude || 32.3792,
    lng: pantry.longitude || -86.3077,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string>("Default Montgomery Coordinates");
  const [accessNotes, setAccessNotes] = useState(
    pantry.accessNotes || "Distribution takes place around back at the Fellowship Hall door near the blue awning."
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleChange = (field: keyof PantryInfo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePantry({
      ...formData,
      latitude: coords.lat,
      longitude: coords.lng,
      accessNotes: accessNotes,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Browser Geolocation Detector
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    setGeoStatus("Detecting your physical GPS location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLng = Number(position.coords.longitude.toFixed(6));
        setCoords({ lat: newLat, lng: newLng });
        setIsLocating(false);
        setGeoStatus(`🟢 Centered on GPS Location (Accuracy ±${Math.round(position.coords.accuracy)}m)`);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17);
          markerRef.current.setLatLng([newLat, newLng]);
        }
      },
      (error) => {
        setIsLocating(false);
        setGeoStatus(`Unable to retrieve location (${error.message}). Using manual drag pin.`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Initialize Interactive Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([coords.lat, coords.lng], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: pinIcon,
      }).addTo(map);

      marker.bindPopup("<b>Exact Pantry Door Pin</b><br>Drag marker to exact distribution entrance.").openPopup();

      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        setCoords({
          lat: Number(latLng.lat.toFixed(6)),
          lng: Number(latLng.lng.toFixed(6)),
        });
        setGeoStatus("🟡 Operator Satellited Pin Positioned");
      });

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setCoords({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        });
        marker.setLatLng([lat, lng]);
        setGeoStatus("🟡 Operator Satellited Pin Positioned");
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Auto detect user location on initial load if default
      handleDetectLocation();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const inputClass = "w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]";

  return (
    <div className="space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">Pantry profile</h1>
          <p className="text-[14px] text-[#86868b] mt-0.5">
            Manage your location pinpoint, verification status, and public listing details
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? "Saved!" : "Save changes"}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {/* Organization Verification Section */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
              <ShieldCheck className="w-[18px] h-[18px] text-[#34c759]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Verification & Non-Profit Status</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">501(c)(3) Tax ID / EIN</label>
                <input
                  type="text"
                  required
                  value={formData.ein}
                  onChange={(e) => handleChange("ein", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Verification Status</label>
                <div className="p-2.5 rounded-xl bg-[#34c759]/10 border border-[#34c759]/20 text-[#34c759] text-[13px] font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{formData.verificationStatus} ($0 Free Community Access)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Geolocation Satellite Pinpoint Component */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5ea]">
              <div className="flex items-center gap-2">
                <MapPin className="w-[18px] h-[18px] text-[#0071e3]" />
                <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Interactive Location Pinpoint</h2>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="px-3 py-1 bg-[#0071e3]/10 hover:bg-[#0071e3]/20 text-[#0071e3] text-[12px] font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-[#0071e3]/20"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Locating..." : "📍 Center on My Location"}</span>
              </button>
            </div>

            <p className="text-[12px] text-[#86868b] leading-relaxed">
              Rural addresses often geocode to highway midpoints or fields. Click or drag the marker directly onto your actual building structure or distribution door on the live map below.
            </p>

            {/* Live Interactive Leaflet Map Container */}
            <div className="relative rounded-2xl overflow-hidden border border-[#e5e5ea] h-72 w-full z-0 shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] text-[12px]">
              <span className="font-mono text-[#0071e3] font-bold">
                Lat: {coords.lat} | Lng: {coords.lng}
              </span>
              <span className="text-[#86868b] font-medium">{geoStatus}</span>
            </div>

            {/* Landmark Access Notes */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                Landmark & Physical Entrance Notes
              </label>
              <input
                type="text"
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="e.g. Distribution takes place around back at Fellowship Hall door near blue awning."
                className={inputClass}
              />
              <p className="text-[11px] text-[#86868b] mt-1">
                Helps citizens and delivery drivers find the exact door on large church or warehouse campuses.
              </p>
            </div>
          </div>

          {/* General Information */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
              <Building2 className="w-[18px] h-[18px] text-[#0071e3]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Organization details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Pantry name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Address & Contact */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#e5e5ea]">
              <MapPin className="w-[18px] h-[18px] text-[#0071e3]" />
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Address & contact</h2>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Street address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">ZIP</label>
                <input
                  type="text"
                  required
                  value={formData.zip}
                  onChange={(e) => handleChange("zip", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </form>

        {/* Right: Preview & QR Code Poster */}
        <div className="space-y-5 self-start">
          {/* App Listing Preview */}
          <div className="card p-5 space-y-4">
            <h2 className="text-[14px] font-semibold text-[#1d1d1f] pb-3 border-b border-[#e5e5ea]">
              App listing preview
            </h2>

            <div className="p-4 rounded-xl border border-[#e5e5ea] space-y-3 bg-white">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#34c759] mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Organization ($0 Free)
                </div>
                <h3 className="text-[14px] font-semibold text-[#1d1d1f]">{formData.name}</h3>
                <p className="text-[12px] text-[#86868b]">{formData.city}, {formData.state}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.isOpen ? "bg-[#34c759]" : "bg-[#ff3b30]"}`} />
                <span className="text-[12px] font-semibold text-[#1d1d1f]">
                  {formData.isOpen ? "Open now" : "Closed"}
                </span>
              </div>

              <p className="text-[11px] text-[#0071e3] font-mono">
                📍 Coordinates: {coords.lat}, {coords.lng}
              </p>

              {accessNotes && (
                <p className="text-[12px] text-[#1d1d1f] bg-[#f5f5f7] p-2.5 rounded-xl border border-[#e5e5ea] leading-relaxed">
                  "{accessNotes}"
                </p>
              )}
            </div>
          </div>

          {/* Printable Entrance Poster & QR Code */}
          <div className="card p-5 space-y-3">
            <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Pantry Entrance Poster</h2>
            <p className="text-[12px] text-[#86868b]">
              Print a flyer with your AccessBelt QR Code for your entrance so waiting families can scan for live stock.
            </p>

            <div className="p-4 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] text-center space-y-2">
              <div className="w-24 h-24 bg-white border border-[#e5e5ea] rounded-xl mx-auto p-2 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://accessbelt.org/pantry/${formData.id}`}
                  alt="AccessBelt QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] font-semibold text-[#1d1d1f]">Scan for Live Stock & Updates</p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2 bg-white border border-[#e5e5ea] hover:border-[#d2d2d7] text-[#1d1d1f] text-[12px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
              🖨️ Print Entrance Poster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
