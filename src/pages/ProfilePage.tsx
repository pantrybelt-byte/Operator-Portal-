import React, { useState, useEffect, useRef } from "react";
import { Save, ShieldCheck, Navigation, Printer } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Operator, PantryInfo } from "../types";
import { can, coversCounty } from "../auth/permissions";

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
  operator: Operator;
  pantry: PantryInfo;
  onUpdatePantry: (updated: PantryInfo) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ pantry, operator, onUpdatePantry }) => {
  const [formData, setFormData] = useState<PantryInfo>(pantry);
  const [isSaved, setIsSaved] = useState(false);

  // Precise Geolocation Coordinates State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(pantry.coordinates);
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string>("");
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
      coordinates: coords,
      accessNotes,
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
    setGeoStatus("Finding your location…");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = Number(position.coords.latitude.toFixed(6));
        const newLng = Number(position.coords.longitude.toFixed(6));
        setCoords({ lat: newLat, lng: newLng });
        setIsLocating(false);
        setGeoStatus(`Centred on your location (accurate to ±${Math.round(position.coords.accuracy)}m)`);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([newLat, newLng], 17);
          markerRef.current.setLatLng([newLat, newLng]);
        }
      },
      () => {
        setIsLocating(false);
        setGeoStatus("Could not find your location. Drag the pin instead.");
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

      marker.bindPopup("Drag this pin to your distribution entrance.");

      marker.on("dragend", () => {
        const latLng = marker.getLatLng();
        setCoords({
          lat: Number(latLng.lat.toFixed(6)),
          lng: Number(latLng.lng.toFixed(6)),
        });
        setGeoStatus("Pin moved — remember to save");
      });

      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setCoords({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
        });
        marker.setLatLng([lat, lng]);
        setGeoStatus("Pin moved — remember to save");
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

  const inputClass = "w-full p-2.5";

  // Surfaced before the write rather than after: `countyOk()` rejects any edit
  // to a pantry outside the operator's county claim, and a bare
  // permission-denied tells them nothing actionable.
  const inCounty = coversCounty(operator.claims.counties, pantry.county, operator.claims.role);
  const canEdit = can(operator.title, "profile:write") && inCounty;
  const editBlockedReason = !inCounty
    ? `Your account does not cover ${pantry.county} County.`
    : "Only a Manager can edit the pantry profile.";

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Pantry profile</h1>
          <p className="page-subtitle">
            How your pantry appears to families in the AccessBelt app
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="btn btn-primary hidden sm:inline-flex"
          disabled={!canEdit}
          title={canEdit ? undefined : editBlockedReason}
        >
          <Save className="h-4 w-4" />
          {isSaved ? "Saved" : "Save changes"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {/* Organization Verification Section */}
          <div className="card p-5 space-y-4">
            <h2 className="card-title border-b border-line pb-4">Verification</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">501(c)(3) tax ID (EIN)</label>
                <input
                  type="text"
                  required
                  value={formData.ein}
                  onChange={(e) => handleChange("ein", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="field-label">Status</label>
                <div className="p-2.5 rounded-xl bg-success-tint border border-success/20 text-success-text text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{formData.verified ? "Verified 501(c)(3)" : "Verification pending"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Geolocation Satellite Pinpoint Component */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="card-title">Map location</h2>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="btn btn-secondary"
              >
                <Navigation className={`h-4 w-4 text-fg-muted ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Finding…" : "Use my location"}</span>
              </button>
            </div>

            <p className="text-sm text-fg-muted">
              Rural addresses often land on a highway midpoint rather than a building. Drag the pin
              onto the door families should walk or drive up to.
            </p>

            {/* Live Interactive Leaflet Map Container */}
            <div className="relative rounded-2xl overflow-hidden border border-line h-72 w-full z-0 shadow-inner">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            <div className="flex flex-col items-start justify-between gap-1 rounded-xl bg-sunken p-3 sm:flex-row sm:items-center">
              <span className="text-sm font-medium tabular text-fg">
                {coords.lat}, {coords.lng}
              </span>
              <span className="meta">{geoStatus}</span>
            </div>

            {/* Landmark Access Notes */}
            <div>
              <label className="field-label">
                Entrance notes
              </label>
              <input
                type="text"
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                placeholder="e.g. Distribution takes place around back at Fellowship Hall door near blue awning."
                className={inputClass}
              />
              <p className="text-xs text-fg-muted mt-1">
                Helps families and delivery drivers find the right door on large church or warehouse sites.
              </p>
            </div>
          </div>

          {/* General Information */}
          <div className="card p-5 space-y-4">
            <h2 className="card-title border-b border-line pb-4">Organization details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Pantry name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="field-label">Organization</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="field-label">Description</label>
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
            <h2 className="card-title border-b border-line pb-4">Address & contact</h2>

            <div>
              <label className="field-label">Street address</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="field-label">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="field-label">State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="field-label">ZIP</label>
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
        <div className="space-y-5 self-start lg:sticky lg:top-24">
          {/* App Listing Preview */}
          <div className="card p-5 space-y-4">
            <h2 className="card-title border-b border-line pb-4">App listing preview</h2>

            <div className="p-4 rounded-xl border border-line space-y-3 bg-surface">
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-success-text">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Verified organization
                </div>
                <h3 className="text-base font-semibold text-fg">{formData.name}</h3>
                <p className="text-xs text-fg-muted">{formData.city}, {formData.state}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.isOpen ? "bg-success" : "bg-danger"}`} />
                <span className="text-xs font-semibold text-fg">
                  {formData.isOpen ? "Open now" : "Closed"}
                </span>
              </div>

              {accessNotes && (
                <p className="rounded-lg bg-sunken p-2.5 text-xs leading-relaxed text-fg">
                  {accessNotes}
                </p>
              )}
            </div>
          </div>

          {/* Printable Entrance Poster & QR Code */}
          <div className="card p-5 space-y-3">
            <h2 className="card-title">Entrance poster</h2>
            <p className="text-sm text-fg-muted">
              Print a sign for your entrance. Families waiting outside can scan it to see current
              stock and hours.
            </p>

            <div className="p-4 rounded-xl bg-sunken border border-line text-center space-y-2">
              <div className="w-24 h-24 bg-surface border border-line rounded-xl mx-auto p-2 flex items-center justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://accessbelt.org/pantry/${formData.id}`}
                  alt="AccessBelt QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="meta font-semibold">Scan for current stock and hours</p>
            </div>

            <button type="button" onClick={() => window.print()} className="btn btn-secondary no-print w-full">
              <Printer className="h-4 w-4 text-fg-muted" />
              Print poster
            </button>
          </div>
        </div>
      </div>

      {/* Save stays reachable on a form this long */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 p-3 backdrop-blur sm:hidden">
        <button onClick={handleSubmit} className="btn btn-primary w-full">
          <Save className="h-4 w-4" />
          {isSaved ? "Saved" : "Save changes"}
        </button>
      </div>
    </div>
  );
};
