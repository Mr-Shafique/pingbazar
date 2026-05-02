"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import MapPickerModal from "./MapPickerModal";

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: { types?: string[] },
          ) => {
            addListener: (event: string, handler: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              name?: string;
              geometry?: {
                location?: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
          };
        };
        Map: new (
          element: HTMLElement,
          options?: object,
        ) => {
          addListener: (
            event: string,
            handler: (e: {
              latLng: { lat: () => number; lng: () => number };
            }) => void,
          ) => void;
          panTo: (pos: { lat: number; lng: number }) => void;
          setZoom: (zoom: number) => void;
          ControlPosition: { RIGHT_CENTER: number };
        };
        Marker: new (options?: {
          position?: { lat: number; lng: number };
          map?: unknown;
          draggable?: boolean;
          animation?: number;
          title?: string;
        }) => {
          setPosition: (pos: { lat: number; lng: number }) => void;
          addListener: (
            event: string,
            handler: (e: {
              latLng: { lat: () => number; lng: () => number };
            }) => void,
          ) => void;
        };
        Animation: { DROP: number };
        ControlPosition: { RIGHT_CENTER: number };
        Geocoder: new () => {
          geocode: (
            request: { location: { lat: number; lng: number } },
            callback: (
              results: { formatted_address?: string; name?: string }[] | null,
              status: string,
            ) => void,
          ) => void;
        };
        event: {
          clearInstanceListeners: (instance: unknown) => void;
        };
      };
    };
  }
}

export interface ProductRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  title: string;
  description: string;
  image?: string;
  city: string;
  lat: number;
  lng: number;
  radius: number;
  createdAt: string;
}

export interface SellerResponse {
  id: string;
  requestId: string;
  buyerId: string;
  sellerId: string;
  sellerName: string;
  shopName: string;
  contactNumber: string;
  shopLocation: string;
  response: "yes" | "no";
  createdAt: string;
}

interface AuthenticatedHomeProps {
  user: User;
  onSignOut: () => void;
}

export default function AuthenticatedHome({
  user,
  onSignOut,
}: AuthenticatedHomeProps) {
  // Core Tab state
  const [activeTab, setActiveTab] = useState<
    "location" | "request" | "feed" | "my-needs" | "seller-profile"
  >("location");

  // Location / Search state
  const [city, setCity] = useState("London");
  const [radius, setRadius] = useState("10");
  const [lat, setLat] = useState("51.5074");
  const [lng, setLng] = useState("-0.1278");

  // Post Request state
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Real-time collections state
  const [allRequests, setAllRequests] = useState<ProductRequest[]>([]);
  const [allResponses, setAllResponses] = useState<SellerResponse[]>([]);
  const [ignoredRequestIds, setIgnoredRequestIds] = useState<string[]>([]);

  // Seller Profile / Responding state
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [respondingToRequest, setRespondingToRequest] =
    useState<ProductRequest | null>(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);

  // In-app Push Notification state
  const [notification, setNotification] = useState<{
    title: string;
    city: string;
    id: string;
  } | null>(null);

  // Map Picker Modal state
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    // Fetch previously saved location criteria
    const storedCity = localStorage.getItem("pingbazar_city");
    const storedRadius = localStorage.getItem("pingbazar_radius");
    const storedLat = localStorage.getItem("pingbazar_lat");
    const storedLng = localStorage.getItem("pingbazar_lng");

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedCity) setCity(storedCity);
    if (storedRadius) setRadius(storedRadius);
    if (storedLat) setLat(storedLat);
    if (storedLng) setLng(storedLng);

    // Fetch previously saved seller details
    const savedShopName = localStorage.getItem("pingbazar_shop_name");
    const savedShopPhone = localStorage.getItem("pingbazar_shop_phone");
    const savedShopAddress = localStorage.getItem("pingbazar_shop_address");

    if (savedShopName) setShopName(savedShopName);
    if (savedShopPhone) setShopPhone(savedShopPhone);
    if (savedShopAddress) setShopAddress(savedShopAddress);
  }, []);

  // Set real-time Firestore listeners
  useEffect(() => {
    if (!user) return;

    // Listen to all requests
    const qRequests = query(collection(db, "requests"));
    const unsubRequests = onSnapshot(qRequests, (snapshot) => {
      const requestsData: ProductRequest[] = [];
      snapshot.docChanges().forEach((change) => {
        // Trigger In-app Notifications for NEW incoming matching requests
        if (change.type === "added") {
          const newReq = {
            id: change.doc.id,
            ...change.doc.data(),
          } as ProductRequest;

          // Conditions:
          // 1. Not current user's request.
          // 2. Fits our radius logic (Haversine formula).
          if (newReq.buyerId !== user.uid) {
            const userLatNum = parseFloat(lat || "0");
            const userLngNum = parseFloat(lng || "0");
            const reqLatNum = parseFloat(newReq.lat?.toString() || "0");
            const reqLngNum = parseFloat(newReq.lng?.toString() || "0");

            const dist = getDistance(
              userLatNum,
              userLngNum,
              reqLatNum,
              reqLngNum,
            );
            const r = parseFloat(radius || "10");

            if (dist <= r) {
              setNotification({
                title: newReq.title,
                city: newReq.city,
                id: newReq.id,
              });
              setTimeout(() => setNotification(null), 10000); // clear after 10s
            }
          }
        }
      });

      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() } as ProductRequest);
      });

      // Sort by descending date string if available
      requestsData.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setAllRequests(requestsData);
    });

    // Listen to responses relevant to the current user (using two targeted queries for security compliance)
    const qBuyer = query(
      collection(db, "responses"),
      where("buyerId", "==", user.uid),
    );
    const qSeller = query(
      collection(db, "responses"),
      where("sellerId", "==", user.uid),
    );

    const responsesMap = new Map<string, SellerResponse>();

    const updateResponsesState = () => {
      setAllResponses(Array.from(responsesMap.values()));
    };

    const unsubBuyer = onSnapshot(qBuyer, (snapshot) => {
      snapshot.forEach((doc) => {
        responsesMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
        } as SellerResponse);
      });
      updateResponsesState();
    });

    const unsubSeller = onSnapshot(qSeller, (snapshot) => {
      snapshot.forEach((doc) => {
        responsesMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
        } as SellerResponse);
      });
      updateResponsesState();
    });

    return () => {
      unsubRequests();
      unsubBuyer();
      unsubSeller();
    };
  }, [user, lat, lng, radius]);

  // Haversine Distance Formula
  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleSaveCriteria = () => {
    if (!city || !lat || !lng) {
      alert("Please fill in a valid city name, latitude and longitude.");
      return;
    }
    localStorage.setItem("pingbazar_city", city);
    localStorage.setItem("pingbazar_radius", radius);
    localStorage.setItem("pingbazar_lat", lat);
    localStorage.setItem("pingbazar_lng", lng);

    alert(
      "Search criteria updated! Nearby requests will now refresh in your feed.",
    );
    setActiveTab("feed");
  };

  // Handler called when user confirms a location in the MapPickerModal
  const handleMapLocationConfirm = (
    newCity: string,
    newLat: string,
    newLng: string,
  ) => {
    setCity(newCity || "Selected Location");
    setLat(newLat);
    setLng(newLng);
    localStorage.setItem("pingbazar_city", newCity || "Selected Location");
    localStorage.setItem("pingbazar_lat", newLat);
    localStorage.setItem("pingbazar_lng", newLng);
    localStorage.setItem("pingbazar_radius", radius);
  };

  // Convert uploaded image to base64 for direct inline display / Firestore storage
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBase64Image(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle || !requestDesc)
      return alert("Please include a title and description.");
    if (!user) return;

    try {
      setSubmitting(true);
      await addDoc(collection(db, "requests"), {
        buyerId: user.uid,
        buyerName: user.displayName || "Local Buyer",
        title: requestTitle,
        description: requestDesc,
        image: base64Image || "",
        city: city || "London",
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: parseFloat(radius),
        createdAt: new Date().toISOString(),
      });

      setRequestTitle("");
      setRequestDesc("");
      setBase64Image("");
      alert("Your product request was posted successfully!");
      setActiveTab("my-needs");
    } catch (err) {
      console.error(err);
      alert("Error posting request: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSellerProfile = () => {
    if (!shopName || !shopPhone || !shopAddress) {
      alert("Please enter all seller information.");
      return;
    }
    localStorage.setItem("pingbazar_shop_name", shopName);
    localStorage.setItem("pingbazar_shop_phone", shopPhone);
    localStorage.setItem("pingbazar_shop_address", shopAddress);
    alert("Seller details updated successfully!");
  };

  const handleConfirmResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !shopPhone || !shopAddress) {
      alert("Please provide your shop information before accepting.");
      return;
    }
    if (!respondingToRequest || !user) return;

    // logic safety check: prevent duplicate responses
    const alreadyResponded = allResponses.some(
      (res) =>
        res.requestId === respondingToRequest.id && res.sellerId === user.uid,
    );
    if (alreadyResponded) {
      alert("You have already responded to this request.");
      setRespondingToRequest(null);
      return;
    }

    try {
      setSubmittingResponse(true);
      await addDoc(collection(db, "responses"), {
        requestId: respondingToRequest.id,
        buyerId: respondingToRequest.buyerId,
        sellerId: user.uid,
        sellerName: user.displayName || "Local Seller",
        shopName,
        contactNumber: shopPhone,
        shopLocation: shopAddress,
        response: "yes",
        createdAt: new Date().toISOString(),
      });

      // Save persistent profile immediately
      localStorage.setItem("pingbazar_shop_name", shopName);
      localStorage.setItem("pingbazar_shop_phone", shopPhone);
      localStorage.setItem("pingbazar_shop_address", shopAddress);

      setRespondingToRequest(null);
      alert(
        "Offer sent! The buyer can now view your shop and contact details.",
      );
    } catch (err) {
      console.error(err);
      alert("Error responding to request: " + err);
    } finally {
      setSubmittingResponse(false);
    }
  };

  // Filter requests for seller's Feed logic based on stored lat/lng & radius
  const currentLatNum = parseFloat(lat || "0");
  const currentLngNum = parseFloat(lng || "0");
  const searchRadNum = parseFloat(radius || "10");

  const feedRequests = allRequests.filter((req) => {
    // Filter ignored locally
    if (ignoredRequestIds.includes(req.id)) return false;

    // A user cannot see/accept/reject their own requests in the Feed
    if (req.buyerId === user.uid) return false;

    // A user can respond only one time to a local feed request
    const userAlreadyResponded = allResponses.some(
      (res) => res.requestId === req.id && res.sellerId === user.uid,
    );
    if (userAlreadyResponded) return false;

    // Haversine match
    const reqLatNum = parseFloat(req.lat?.toString() || "0");
    const reqLngNum = parseFloat(req.lng?.toString() || "0");
    const matchesDistance =
      getDistance(currentLatNum, currentLngNum, reqLatNum, reqLngNum) <=
      searchRadNum;

    // Fallback: Check if city names match exactly (ignoring case/whitespace)
    const matchesCity =
      req.city &&
      city &&
      req.city.toLowerCase().trim() === city.toLowerCase().trim();

    return matchesDistance || matchesCity;
  });

  // Requests that current user created
  const myNeeds = allRequests.filter((req) => req.buyerId === user.uid);

  return (
    <div className="bg-background text-on-background font-body-lg min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-primary-container selection:text-white">
      {/* Decorative Grid Background */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWUyZTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 z-0 pointer-events-none"></div>

      {/* Top Notification Banner */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm bg-tertiary-container border-[3px] border-black p-4 neo-brutal-shadow-lg flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-black font-bold animate-pulse text-[20px]">
              notifications_active
            </span>
            <div>
              <p className="font-meta-mono text-[10px] text-black font-bold uppercase tracking-wider">
                New Local Request
              </p>
              <p className="font-headline-sm text-sm font-black text-black leading-tight truncate">
                {notification.title}
              </p>
              <p className="font-meta-mono text-[10px] text-black italic">
                In {notification.city}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-black font-headline-lg font-black text-xl hover:text-red-500 transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <span className="font-display-lg text-xl sm:text-2xl lg:text-3xl italic tracking-tighter bg-primary-container text-white px-2 py-1 border-2 border-black">
            PINGBAZAR
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right border-r-2 border-black pr-4 mr-1">
            <span className="font-headline-sm text-sm font-bold truncate max-w-37.5">
              {user.displayName || "USER"}
            </span>
            <span className="font-meta-mono text-[10px] text-secondary truncate max-w-37.5">
              {user.email}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-error-container text-on-error-container font-button-text text-[10px] sm:text-xs uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">
              logout
            </span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 z-20 mt-4">
        <div className="grid grid-cols-5 bg-white border-[3px] border-black neo-brutal-shadow overflow-hidden">
          <button
            onClick={() => setActiveTab("location")}
            className={`py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "location"
                ? "bg-primary-container text-white"
                : "bg-white text-black hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              location_on
            </span>
            <span className="hidden md:inline">Location</span>
          </button>
          <button
            onClick={() => setActiveTab("request")}
            className={`py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "request"
                ? "bg-primary-container text-white"
                : "bg-white text-black hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              add_photo_alternate
            </span>
            <span className="hidden md:inline">Post Needs</span>
          </button>
          <button
            onClick={() => setActiveTab("feed")}
            className={`py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "feed"
                ? "bg-primary-container text-white"
                : "bg-white text-black hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              dynamic_feed
            </span>
            <span className="hidden md:inline">Local Feed</span>
          </button>
          <button
            onClick={() => setActiveTab("my-needs")}
            className={`py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "my-needs"
                ? "bg-primary-container text-white"
                : "bg-white text-black hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              shopping_bag
            </span>
            <span className="hidden md:inline">My Needs</span>
          </button>
          <button
            onClick={() => setActiveTab("seller-profile")}
            className={`py-3 px-1 sm:px-3 text-center font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
              activeTab === "seller-profile"
                ? "bg-primary-container text-white"
                : "bg-white text-black hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              storefront
            </span>
            <span className="hidden md:inline">Shop Profile</span>
          </button>
        </div>
      </div>

      <main className="grow flex flex-col items-center max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-20">
        {/* TAB Content Wrapper */}
        <div className="bg-white border-[3px] border-black neo-brutal-shadow-lg p-5 sm:p-8 md:p-10 w-full relative">
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 w-4 h-4 bg-tertiary-container border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>

          {/* TAB 1: LOCATION & SEARCH */}
          {activeTab === "location" && (
            <div className="w-full">
              <h2 className="font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase">
                🎯 Set Your Location
              </h2>
              <p className="font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium">
                Choose your location on the map or use GPS. Nearby product
                requests within your radius will appear in your Local Feed.
              </p>

              {/* Current location card */}
              <div className="mb-5 p-4 bg-surface-container border-2 border-black border-dashed flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 bg-primary-container border-2 border-black flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[24px]">
                    location_on
                  </span>
                </div>
                <div className="grow min-w-0">
                  <p className="font-button-text text-[10px] uppercase font-bold text-secondary mb-0.5">
                    Current Location
                  </p>
                  <p className="font-headline-sm text-sm sm:text-base font-black text-black truncate">
                    {city || "No location set yet"}
                  </p>
                  {lat && lng && (
                    <p className="font-meta-mono text-[11px] text-secondary mt-0.5">
                      {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowMapPicker(true)}
                  className="shrink-0 px-3 py-2 bg-white border-2 border-black font-button-text text-[11px] uppercase font-bold neo-brutal-shadow hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit_location_alt
                  </span>
                  <span className="hidden sm:inline">Change</span>
                </button>
              </div>

              {/* Action buttons row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={() => setShowMapPicker(true)}
                  className="flex-1 px-4 py-3.5 bg-white text-black font-button-text text-xs sm:text-sm uppercase font-bold border-[3px] border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    map
                  </span>
                  Choose on Map
                </button>
              </div>

              {/* Radius Selector — pill button group */}
              <div className="flex flex-col gap-2 mb-6">
                <label className="font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    radar
                  </span>
                  Search Radius
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "1", label: "1 km", sub: "Hyper Local" },
                    { value: "5", label: "5 km", sub: "Neighbourhood" },
                    { value: "10", label: "10 km", sub: "City" },
                    { value: "25", label: "25 km", sub: "Metro" },
                    { value: "50", label: "50 km", sub: "Regional" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRadius(opt.value)}
                      className="flex flex-col items-center px-3 py-2 border-2 border-black font-bold transition-all cursor-pointer min-w-[64px]"
                      style={{
                        background: radius === opt.value ? "#7d12ff" : "#fff",
                        color: radius === opt.value ? "#fff" : "#000",
                        boxShadow:
                          radius === opt.value
                            ? "2px 2px 0 0 #000"
                            : "2px 2px 0 0 #000",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      <span className="text-[14px] font-black leading-tight">
                        {opt.label}
                      </span>
                      <span
                        className="text-[9px] uppercase leading-tight mt-0.5"
                        style={{ opacity: radius === opt.value ? 0.85 : 0.55 }}
                      >
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveCriteria}
                  className="w-full sm:w-auto px-6 py-3 bg-primary-container text-white font-button-text text-sm uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: POST PRODUCT NEEDS */}
          {activeTab === "request" && (
            <div className="w-full">
              <h2 className="font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase">
                📸 Request Needs
              </h2>
              <p className="font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium">
                Describe the product what you want, upload a photo, and let
                nearby sellers view your reverse e-commerce listing.
              </p>

              <form
                onSubmit={handleCreateRequest}
                className="flex flex-col gap-5 sm:gap-6"
              >
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="font-button-text text-[11px] text-black uppercase font-bold">
                    Title of product
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Vintage Leather Jacket, High-End Headphones..."
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className="w-full bg-white border-2 border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="font-button-text text-[11px] text-black uppercase font-bold">
                    Description of product what you want
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe specific features, brand, condition, size, etc."
                    value={requestDesc}
                    onChange={(e) => setRequestDesc(e.target.value)}
                    className="w-full bg-white border-2 border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100"
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 border-2 border-black border-dashed p-4 sm:p-5 bg-surface-container">
                  <div className="flex flex-col grow gap-1">
                    <label className="font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        file_upload
                      </span>
                      Product Image Upload (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-xs font-meta-mono file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:neo-brutal-shadow file:bg-white file:text-black file:uppercase file:font-bold file:text-xs cursor-pointer hover:file:bg-surface-container file:transition-all"
                    />
                  </div>

                  {base64Image && (
                    <div className="relative border-2 border-black w-24 h-24 bg-white p-1 shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={base64Image}
                        alt="Base64 Preview"
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setBase64Image("")}
                        className="absolute top-0 right-0 bg-error-container text-on-error-container font-black border-l-2 border-b-2 border-black px-1.5 text-xs hover:bg-red-500 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-6 py-3.5 bg-primary-container text-white font-button-text text-sm uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      publish
                    </span>
                    {submitting ? "Publishing..." : "Post This Request"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: LOCAL FEED (REAL-TIME NOTIFICATIONS) */}
          {activeTab === "feed" && (
            <div className="w-full">
              <h2 className="font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase">
                📡 Local Feed
              </h2>
              <p className="font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium">
                Location-based requests will appear below. Accept or dismiss
                items based on your current shop availability.
              </p>

              {feedRequests.length === 0 ? (
                <div className="bg-surface-container border-2 border-black border-dashed p-6 sm:p-10 text-center flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-[36px] sm:text-[48px] text-primary-container animate-pulse">
                    local_mall
                  </span>
                  <p className="font-headline-sm text-sm sm:text-base font-black">
                    No requests matched within your specified criteria.
                  </p>
                  <p className="font-meta-mono text-[11px] sm:text-[12px] text-secondary">
                    Try modifying your target radius or latitude and longitude
                    settings under the Location tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {feedRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white border-[3px] border-black p-4 neo-brutal-shadow relative flex flex-col justify-between"
                    >
                      <div>
                        {req.image && (
                          <div className="border-2 border-black w-full h-44 sm:h-48 bg-surface-container mb-4 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={req.image}
                              alt={req.title}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 bg-tertiary-container text-on-tertiary-container text-[9px] font-meta-mono px-2 py-0.5 border-[1.5px] border-black mb-2 uppercase font-bold tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">
                            location_on
                          </span>
                          {req.city} (
                          {getDistance(
                            currentLatNum,
                            currentLngNum,
                            req.lat,
                            req.lng,
                          ).toFixed(1)}{" "}
                          km)
                        </span>
                        <h3 className="font-headline-sm text-[16px] sm:text-[18px] font-black text-black uppercase mb-1 leading-snug">
                          {req.title}
                        </h3>
                        <p className="font-body-sm text-[12px] sm:text-[13px] text-secondary mb-4 line-clamp-3">
                          {req.description}
                        </p>
                        <p className="font-meta-mono text-[10px] text-black font-bold uppercase mb-4">
                          Requested by: {req.buyerName}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setRespondingToRequest(req)}
                          className="grow py-2.5 bg-primary-container text-white font-button-text text-[11px] uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            check
                          </span>
                          Yes, I have it
                        </button>
                        <button
                          onClick={() =>
                            setIgnoredRequestIds((prev) => [...prev, req.id])
                          }
                          className="px-3 py-2.5 bg-white text-black font-button-text text-[11px] uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            close
                          </span>
                          No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY NEEDS & OFFERS/RESPONSES */}
          {activeTab === "my-needs" && (
            <div className="w-full">
              <h2 className="font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase">
                📦 My Needs & Offers
              </h2>
              <p className="font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium">
                Review your posted requests. When nearby local sellers accept,
                their physical shop and phone details immediately appear here.
              </p>

              {myNeeds.length === 0 ? (
                <div className="bg-surface-container border-2 border-black border-dashed p-6 sm:p-10 text-center flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-[36px] sm:text-[48px] text-secondary animate-pulse">
                    receipt_long
                  </span>
                  <p className="font-headline-sm text-sm sm:text-base font-black">
                    You have not posted any reverse e-commerce needs yet.
                  </p>
                  <p className="font-meta-mono text-[11px] sm:text-[12px] text-secondary">
                    Go to the &quot;Post Needs&quot; tab to describe products
                    and begin matching with shops.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {myNeeds.map((req) => {
                    const responsesToRequest = allResponses.filter(
                      (res) => res.requestId === req.id,
                    );

                    return (
                      <div
                        key={req.id}
                        className="bg-white border-[3px] border-black p-4 sm:p-6 neo-brutal-shadow flex flex-col gap-4"
                      >
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b-2 border-black border-dashed pb-4">
                          <div className="flex flex-col gap-1 grow">
                            <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container text-[9px] font-meta-mono px-2 py-0.5 border-[1.5px] border-black w-fit uppercase font-bold tracking-wider mb-1">
                              <span className="material-symbols-outlined text-[12px]">
                                schedule
                              </span>
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                            <h3 className="font-headline-sm text-[16px] sm:text-[18px] font-black text-black uppercase mb-1 leading-snug">
                              {req.title}
                            </h3>
                            <p className="font-body-sm text-[12px] sm:text-[13px] text-secondary">
                              {req.description}
                            </p>
                          </div>

                          {req.image && (
                            <div className="border-2 border-black w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-surface-container flex items-center justify-center overflow-hidden p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={req.image}
                                alt="Request Preview"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                          )}
                        </div>

                        {/* Offers Sub-list for this need */}
                        <div className="flex flex-col gap-3">
                          <h4 className="font-headline-sm text-sm font-black uppercase text-black flex items-center gap-1.5 border-b-[1.5px] border-black pb-1">
                            <span className="material-symbols-outlined text-[18px]">
                              connect_without_contact
                            </span>
                            Seller Responses ({responsesToRequest.length})
                          </h4>

                          {responsesToRequest.length === 0 ? (
                            <p className="font-meta-mono text-[11px] text-secondary italic">
                              No responses have been submitted by local sellers
                              yet. Please check back soon.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                              {responsesToRequest.map((res) => (
                                <div
                                  key={res.id}
                                  className="bg-surface-container border-2 border-black p-3.5 neo-brutal-shadow flex flex-col gap-2 relative"
                                >
                                  <span className="absolute top-3 right-3 material-symbols-outlined text-green-600 font-black text-[22px]">
                                    verified
                                  </span>
                                  <div>
                                    <h5 className="font-headline-sm text-[13px] sm:text-[14px] font-black text-black uppercase">
                                      {res.shopName}
                                    </h5>
                                    <p className="font-meta-mono text-[10px] sm:text-[11px] text-secondary uppercase font-semibold">
                                      Location: {res.shopLocation}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1.5 border-t-[1.5px] border-black border-dashed pt-2 mt-1">
                                    <span className="material-symbols-outlined text-black font-bold text-[16px]">
                                      call
                                    </span>
                                    <span className="font-meta-mono text-[11px] sm:text-[12px] font-bold text-black select-all">
                                      {res.contactNumber}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SELLER PROFILE CONFIGURATION */}
          {activeTab === "seller-profile" && (
            <div className="w-full">
              <h2 className="font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase">
                🏪 Shop Profile
              </h2>
              <p className="font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium">
                Sellers, optimize your profile details. They are immediately
                saved to persistent local storage and are populated for you
                whenever you accept a product request.
              </p>

              <div className="flex flex-col gap-4 sm:gap-5 bg-surface-container border-2 border-black border-dashed p-4 sm:p-6 mb-6">
                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      store
                    </span>
                    Your Shop Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Vintage Apparel & Co."
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full bg-white border-2 border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      call
                    </span>
                    Your Shop Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="E.g. +1234567890"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="w-full bg-white border-2 border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2">
                  <label className="font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      pin_drop
                    </span>
                    Your Shop Physical Address / Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. 123 High Street, London"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="w-full bg-white border-2 border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSellerProfile}
                  className="w-full sm:w-auto px-6 py-3.5 bg-primary-container text-white font-button-text text-sm uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                  Update Seller Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 text-center font-meta-mono text-[10px] sm:text-[12px] text-secondary relative z-20 border-t-[3px] border-black bg-white">
        &copy; {new Date().getFullYear()} PINGBAZAR PROTOCOL. ALL RIGHTS
        RESERVED.
      </footer>

      {/* Responder Details Modal */}
      {respondingToRequest && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop with blur and darken */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setRespondingToRequest(null)}
          ></div>

          {/* Modal Content Box */}
          <div
            className="bg-white border-4 border-black p-6 sm:p-10 relative neo-brutal-shadow-lg flex flex-col gap-6 max-h-[90vh] overflow-y-auto z-10 w-full"
            style={{ maxWidth: "540px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setRespondingToRequest(null)}
              className="absolute top-4 right-4 text-black hover:text-red-500 transition-colors cursor-pointer text-3xl font-black leading-none"
              aria-label="Close modal"
            >
              &times;
            </button>

            <div className="pr-8">
              <h3 className="font-headline-sm text-2xl sm:text-3xl font-black text-black leading-tight uppercase mb-2">
                Offer Fulfillment Details
              </h3>
              <p className="font-body-sm text-sm text-secondary font-medium">
                Confirm your physical shop presence and contact details for the
                buyer to contact you directly.
              </p>
            </div>

            <form
              onSubmit={handleConfirmResponse}
              className="flex flex-col gap-5"
            >
              <div className="flex flex-col gap-2">
                <label className="font-button-text text-[11px] font-bold uppercase text-black">
                  Shop Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Shop Name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-white border-[3px] border-black font-meta-mono text-[14px] px-4 py-3 neo-brutal-shadow focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-button-text text-[11px] font-bold uppercase text-black">
                  Contact Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Your Shop Phone/WhatsApp Number"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full bg-white border-[3px] border-black font-meta-mono text-[14px] px-4 py-3 neo-brutal-shadow focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-button-text text-[11px] font-bold uppercase text-black">
                  Shop Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Shop Address / Location"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full bg-white border-[3px] border-black font-meta-mono text-[14px] px-4 py-3 neo-brutal-shadow focus:outline-none focus:ring-2 focus:ring-primary-container transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setRespondingToRequest(null)}
                  className="px-6 py-3 bg-white text-black font-button-text text-xs uppercase font-bold border-[3px] border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer min-w-30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingResponse}
                  className="px-8 py-3 bg-primary-container text-white font-button-text text-xs uppercase font-bold border-[3px] border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer grow sm:grow-0"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    send
                  </span>
                  {submittingResponse ? "Submitting..." : "Send Shop Info"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={handleMapLocationConfirm}
        initialLat={lat}
        initialLng={lng}
      />
    </div>
  );
}
