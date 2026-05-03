"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GMPPlaceAutocomplete = "gmp-place-autocomplete" as any;

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (city: string, lat: string, lng: string) => void;
  initialLat?: string;
  initialLng?: string;
}

export default function MapPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLat = "51.5074",
  initialLng = "-0.1278",
}: MapPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const searchInputRef = useRef<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // Prevent double-init
  const mapInitializedRef = useRef(false);

  const [selectedLat, setSelectedLat] = useState(initialLat);
  const [selectedLng, setSelectedLng] = useState(initialLng);
  const [selectedCity, setSelectedCity] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ─── Reverse geocode ──────────────────────────────────────────────────────
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (typeof window === "undefined" || !window.google?.maps) return;
    if (typeof window.google.maps.Geocoder !== "function") return;

    setGeocoding(true);
    setErrorMsg("");

    // Set a safety timeout for geocoding
    const geocodeTimeout = setTimeout(() => {
      setGeocoding(false);
    }, 5000);

    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (
          results: { formatted_address?: string; name?: string }[] | null,
          status: string
        ) => {
          clearTimeout(geocodeTimeout);
          setGeocoding(false);
          if (status === "OK" && results && results[0]) {
            const addr = results[0].formatted_address || results[0].name || "";
            setSelectedCity(addr);
            if (searchInputRef.current) {
              searchInputRef.current.value = addr;
            }
          } else {
            console.warn("Geocoding failed with status:", status);
            const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setSelectedCity((prev) => prev || fallback);
          }
        }
      );
    } catch (err) {
      clearTimeout(geocodeTimeout);
      setGeocoding(false);
      console.error("Geocoder error:", err);
      setSelectedCity((prev) => prev || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
  }, []);

  // ─── Place marker + pan map ───────────────────────────────────────────────
  const placeMarker = useCallback(
    (lat: number, lng: number) => {
      setSelectedLat(lat.toFixed(6));
      setSelectedLng(lng.toFixed(6));
      if (markerRef.current) {
        markerRef.current.position = { lat, lng };
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng });
      }
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  // ─── Initialize Google Map ────────────────────────────────────────────────
  const initMap = useCallback(function doInit() {
    if (mapInitializedRef.current) return;
    if (!mapContainerRef.current) return;
    if (!window.google?.maps) return;

    try {
      const latNum = parseFloat(initialLat) || 51.5074;
      const lngNum = parseFloat(initialLng) || -0.1278;

      // Ensure the container is ready and has dimensions
      if (mapContainerRef.current.offsetHeight === 0) {
        // Retry shortly if the layout hasn't settled
        setTimeout(doInit, 100);
        return;
      }

      mapInitializedRef.current = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = new (window.google.maps as any).Map(mapContainerRef.current, {
        center: { lat: latNum, lng: lngNum },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        // Add safety for IntersectionObserver
        gestureHandling: "greedy",
        mapId: "DEMO_MAP_ID",
      });

      mapInstanceRef.current = map;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const marker = new (window.google.maps as any).marker.AdvancedMarkerElement({
        position: { lat: latNum, lng: lngNum },
        map,
        gmpDraggable: true,
        title: "Drag to pick location",
      });
      markerRef.current = marker;

      // Click on map → move pin
      map.addListener(
        "click",
        (e: { latLng: { lat: () => number; lng: () => number } }) => {
          if (e.latLng) {
            placeMarker(e.latLng.lat(), e.latLng.lng());
          }
        }
      );

      // Drag end → move pin
      marker.addListener(
        "dragend",
        () => {
          const pos = marker.position;
          if (pos) {
            const lat = typeof pos.lat === "function" ? pos.lat() : pos.lat;
            const lng = typeof pos.lng === "function" ? pos.lng() : pos.lng;
            placeMarker(lat, lng);
          }
        }
      );

      // Reverse-geocode initial position
      reverseGeocode(latNum, lngNum);

      // Attach Places Autocomplete to search bar (New API)
      if (searchInputRef.current) {
        const acElement = searchInputRef.current;

        // Listen for the select event from the web component
        acElement.addEventListener("gmp-select", async (e: { placePrediction: { toPlace: () => google.maps.places.Place } }) => {
          try {
            const placePrediction = e.placePrediction;
            if (!placePrediction) return;

            const place = placePrediction.toPlace();
            // New Places API requires explicit field fetching
            await place.fetchFields({
              fields: ["location", "formattedAddress", "displayName"],
            });

            if (place.location) {
              const pLat: number = place.location.lat();
              const pLng: number = place.location.lng();
              const name: string = place.formattedAddress || place.displayName || "";

              setSelectedCity(name);
              setSelectedLat(pLat.toFixed(6));
              setSelectedLng(pLng.toFixed(6));

              if (markerRef.current) {
                markerRef.current.position = { lat: pLat, lng: pLng };
              }
              if (mapInstanceRef.current) {
                mapInstanceRef.current.panTo({ lat: pLat, lng: pLng });
                mapInstanceRef.current.setZoom(14);
              }
            }
          } catch (err) {
            console.error("Place selection error:", err);
          }
        });
      }

      setMapReady(true);
    } catch (err) {
      console.error("Map initialization failed:", err);
      setErrorMsg("Failed to initialize the map. Please try again.");
      mapInitializedRef.current = false;
    }
  }, [initialLat, initialLng, placeMarker, reverseGeocode]);

  // ─── Load Maps SDK + init when modal opens ────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Reset state each time modal opens
    setSelectedLat(initialLat);
    setSelectedLng(initialLng);
    setSelectedCity("");
    setMapReady(false);
    setErrorMsg("");
    mapInitializedRef.current = false;
    mapInstanceRef.current = null;
    markerRef.current = null;

    const tryInit = () => {
      if (window.google?.maps) {
        // Slight delay so modal DOM mounts and layout settles
        setTimeout(initMap, 100);
        return;
      }

      const existing = document.getElementById("google-maps-script");
      if (!existing) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}&libraries=places,marker&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => setTimeout(initMap, 100);
        script.onerror = () =>
          setErrorMsg(
            "Failed to load Google Maps. Check your API key or network."
          );
        document.head.appendChild(script);
      } else {
        // Script exists but google may not be ready yet — poll
        let attempts = 0;
        const poll = setInterval(() => {
          attempts++;
          if (window.google?.maps) {
            clearInterval(poll);
            setTimeout(initMap, 100);
          } else if (attempts > 60) {
            clearInterval(poll);
            setErrorMsg("Google Maps took too long to load. Please retry.");
          }
        }, 100);
      }
    };

    tryInit();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ─── GPS handler ──────────────────────────────────────────────────────────
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setErrorMsg("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        placeMarker(lat, lng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(15);
        }
      },
      (err) => {
        setGpsLoading(false);
        setErrorMsg("GPS error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // ─── Confirm ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedLat || !selectedLng) {
      setErrorMsg("Please select a location on the map first.");
      return;
    }
    // Pass at least coordinates if city is still empty
    onConfirm(selectedCity || `${parseFloat(selectedLat).toFixed(4)}, ${parseFloat(selectedLng).toFixed(4)}`, selectedLat, selectedLng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card */}
      <div
        className="relative bg-white border-t-[3px] sm:border-[3px] border-black w-full sm:max-w-2xl flex flex-col overflow-hidden"
        style={{
          boxShadow: "0 -4px 0 0 #000, 6px 6px 0px 0px rgba(0,0,0,1)",
          height: "90vh",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b-[3px] border-black bg-primary-container shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-[20px]">
              map
            </span>
            <h3 className="font-space-grotesk text-[15px] sm:text-[17px] font-black text-white uppercase tracking-wider">
              Pick Your Location
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors cursor-pointer text-xl font-black leading-none"
          >
            ✕
          </button>
        </div>

        {/* ── Search + GPS row ── */}
        <div className="flex gap-2 px-3 py-2.5 border-b-2 border-black bg-surface-container shrink-0">
          <div className="relative grow">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-black text-[18px] pointer-events-none select-none z-10">
              search
            </span>
            <GMPPlaceAutocomplete
              ref={searchInputRef}
              placeholder="Search city, area, address…"
              className="w-full border-2 border-black text-[13px] bg-white focus-within:ring-2 focus-within:ring-primary-container transition-all font-mono"
              style={{ fontFamily: "Space Grotesk, monospace" }}
            />
          </div>
          <button
            onClick={handleGPS}
            disabled={gpsLoading}
            title="Use my GPS location"
            className="flex items-center gap-1.5 px-3 py-2 border-2 border-black font-bold text-[11px] uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0"
            style={{
              background: gpsLoading ? "#e2e2e2" : "#e2e2e2",
              boxShadow: gpsLoading ? "none" : "2px 2px 0 0 #000",
              fontFamily: "Space Grotesk, sans-serif",
            }}
          >
            <span
              className="material-symbols-outlined text-[17px]"
              style={{ animation: gpsLoading ? "spin 1s linear infinite" : "none" }}
            >
              {gpsLoading ? "sync" : "my_location"}
            </span>
            <span className="hidden sm:inline">
              {gpsLoading ? "Locating…" : "GPS"}
            </span>
          </button>
        </div>

        {/* ── Error Banner ── */}
        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b-2 border-red-400 text-red-700 text-[12px] font-bold shrink-0">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMsg}
            <button
              onClick={() => setErrorMsg("")}
              className="ml-auto text-red-400 hover:text-red-600 font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Map Container ── */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <div ref={mapContainerRef} className="absolute inset-0" />

          {/* Loading overlay */}
          {!mapReady && !errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container gap-4 z-10">
              <div className="w-14 h-14 border-[3px] border-black border-t-primary-container rounded-full animate-spin" />
              <p
                className="text-[13px] font-bold uppercase tracking-wide"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Loading Map…
              </p>
            </div>
          )}

          {/* Geocoding pill */}
          {geocoding && mapReady && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white border-2 border-black px-3 py-1.5 flex items-center gap-2 text-[12px] font-bold"
              style={{ fontFamily: "Space Grotesk, monospace", boxShadow: "2px 2px 0 #000" }}
            >
              <span className="material-symbols-outlined text-[14px] animate-spin">
                sync
              </span>
              Finding address…
            </div>
          )}

          {/* Tap hint pill */}
          {mapReady && (
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/80 text-white text-[11px] px-3 py-1.5 flex items-center gap-1.5 pointer-events-none rounded-full"
              style={{ fontFamily: "Space Grotesk, monospace" }}
            >
              <span className="material-symbols-outlined text-[13px]">touch_app</span>
              Tap map or drag pin
            </div>
          )}
        </div>

        {/* ── Footer: selected location + actions ── */}
        <div
          className="shrink-0 border-t-[3px] border-black bg-white"
          style={{ boxShadow: "0 -2px 0 0 #000" }}
        >
          {/* Selected location bar */}
          <div className="px-4 pt-3 pb-2">
            <p
              className="text-[10px] uppercase font-bold text-secondary mb-1"
              style={{ fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.08em" }}
            >
              Selected Location
            </p>
            {selectedCity ? (
              <p
                className="text-[13px] font-bold text-black truncate flex items-center gap-1.5"
                style={{ fontFamily: "Space Grotesk, monospace" }}
              >
                <span className="text-primary-container">📍</span>
                {selectedCity}
              </p>
            ) : (
              <p
                className="text-[12px] text-secondary italic"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                {mapReady
                  ? "Tap the map to select a location"
                  : "Map is loading…"}
              </p>
            )}
            {selectedLat && selectedLng && (
              <p
                className="text-[10px] text-outline mt-0.5"
                style={{ fontFamily: "Space Grotesk, monospace" }}
              >
                {parseFloat(selectedLat).toFixed(4)},{" "}
                {parseFloat(selectedLng).toFixed(4)}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white text-black border-2 border-black text-[12px] uppercase font-bold hover:bg-surface-container transition-all cursor-pointer"
              style={{ fontFamily: "Space Grotesk, sans-serif", boxShadow: "2px 2px 0 0 #000" }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!mapReady}
              className="flex-1 px-5 py-2.5 text-white border-2 border-black text-[12px] uppercase font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: "#7d12ff",
                fontFamily: "Space Grotesk, sans-serif",
                boxShadow: mapReady ? "2px 2px 0 0 #000" : "none",
              }}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Confirm Location
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        gmp-place-autocomplete::part(input) {
          padding-left: 36px !important;
          padding-right: 12px !important;
          padding-top: 10px !important;
          padding-bottom: 10px !important;
          border: none !important;
          font-size: 13px !important;
          background: transparent !important;
          font-family: inherit !important;
          outline: none !important;
        }
      `}</style>
    </div>
  );
}

