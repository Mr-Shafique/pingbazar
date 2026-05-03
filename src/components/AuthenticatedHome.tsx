/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
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

// Tab Components
import LocationTab from "./tabs/LocationTab";
import PostNeedTab from "./tabs/PostNeedTab";
import LocalFeedTab from "./tabs/LocalFeedTab";
import MyNeedsTab from "./tabs/MyNeedsTab";
import ShopProfileTab from "./tabs/ShopProfileTab";

// Navigation
import Link from "next/link";

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
        marker: {
          AdvancedMarkerElement: new (options?: {
            position?: { lat: number; lng: number };
            map?: unknown;
            gmpDraggable?: boolean;
            title?: string;
          }) => {
            position: { lat: number; lng: number } | (() => { lat: () => number; lng: () => number });
            addListener: (event: string, handler: (e?: unknown) => void) => void;
          };
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

  // Location / Search state - Use lazy initializers to avoid cascading renders
  const [city, setCity] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pingbazar_city") || "London";
    }
    return "London";
  });

  const [radius, setRadius] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pingbazar_radius") || "10";
    }
    return "10";
  });

  const [lat, setLat] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pingbazar_lat") || "51.5074";
    }
    return "51.5074";
  });

  const [lng, setLng] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pingbazar_lng") || "-0.1278";
    }
    return "-0.1278";
  });

  // Post Request state
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Real-time collections state
  const [allRequests, setAllRequests] = useState<ProductRequest[]>([]);
  const [allResponses, setAllResponses] = useState<SellerResponse[]>([]);
  const [ignoredRequestIds, setIgnoredRequestIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pingbazar_ignored_ids");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse ignored IDs", e);
        }
      }
    }
    return [];
  });
  const [mountTime] = useState(Date.now());

  // Seller Profile / Responding state
  const [shopName, setShopName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pingbazar_shop_name") || "";
    }
    return "";
  });

  const [shopPhone, setShopPhone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pingbazar_shop_phone") || "";
    }
    return "";
  });

  const [shopAddress, setShopAddress] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pingbazar_shop_address") || "";
    }
    return "";
  });

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
  const [mapPickerTarget, setMapPickerTarget] = useState<"search" | "shop">(
    "search",
  );

  // Custom Alert state
  const [customAlert, setCustomAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "error";
  }>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const triggerAlert = (
    message: string,
    title: string = "System Message",
    type: "info" | "success" | "error" = "info",
  ) => {
    setCustomAlert({ show: true, message, title, type });
  };

  // Auto-close map picker if fulfillment modal opens
  // useEffect(() => {
  //   if (respondingToRequest) {
  //     setShowMapPicker(false);
  //   }
  // }, [respondingToRequest]);

  // Persistence of simple non-cascading state
  useEffect(() => {
    localStorage.setItem("pingbazar_ignored_ids", JSON.stringify(ignoredRequestIds));
  }, [ignoredRequestIds]);

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

          // Check if this is truly a NEW request (created after app mount)
          const reqTime = new Date(newReq.createdAt).getTime();
          const isTrulyNew = reqTime > mountTime;

          // Conditions:
          // 1. Not current user's request.
          // 2. Fits our radius logic (Haversine formula).
          // 3. Request was created after component mounted.
          if (newReq.buyerId !== user.uid && isTrulyNew) {
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
              setTimeout(() => setNotification(null), 5000); // clear after 5s
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
  }, [user, lat, lng, radius, mountTime]);

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
      triggerAlert(
        "Please fill in a valid city name, latitude and longitude.",
        "Input Required",
        "error",
      );
      return;
    }
    localStorage.setItem("pingbazar_city", city);
    localStorage.setItem("pingbazar_radius", radius);
    localStorage.setItem("pingbazar_lat", lat);
    localStorage.setItem("pingbazar_lng", lng);

    triggerAlert(
      "Search criteria updated! Nearby requests will now refresh in your feed.",
      "Settings Saved",
      "success",
    );
    setActiveTab("feed");
  };

  const handleMapLocationConfirm = (
    newCity: string,
    newLat: string,
    newLng: string,
  ) => {
    if (mapPickerTarget === "shop") {
      setShopAddress(newCity || "Selected Location");
    } else {
      setCity(newCity || "Selected Location");
      setLat(newLat);
      setLng(newLng);
      localStorage.setItem("pingbazar_city", newCity || "Selected Location");
      localStorage.setItem("pingbazar_lat", newLat);
      localStorage.setItem("pingbazar_lng", newLng);
      localStorage.setItem("pingbazar_radius", radius);
    }
  };

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
    if (!requestTitle || !requestDesc) {
      triggerAlert(
        "Please include a title and description.",
        "Incomplete Data",
        "error",
      );
      return;
    }
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
      triggerAlert(
        "Your product request was posted successfully!",
        "Request Posted",
        "success",
      );
      setActiveTab("my-needs");
    } catch (err) {
      console.error(err);
      triggerAlert("Error posting request: " + err, "Post Failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSellerProfile = () => {
    if (!shopName || !shopPhone || !shopAddress) {
      triggerAlert("Please enter all seller information.", "Profile Incomplete", "error");
      return;
    }
    localStorage.setItem("pingbazar_shop_name", shopName);
    localStorage.setItem("pingbazar_shop_phone", shopPhone);
    localStorage.setItem("pingbazar_shop_address", shopAddress);
    triggerAlert("Seller details updated successfully!", "Profile Saved", "success");
  };

  const handleConfirmResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !shopPhone || !shopAddress) {
      triggerAlert(
        "Please provide your shop information before accepting.",
        "Missing Credentials",
        "error",
      );
      return;
    }
    if (!respondingToRequest || !user) return;

    const alreadyResponded = allResponses.some(
      (res) =>
        res.requestId === respondingToRequest.id && res.sellerId === user.uid,
    );
    if (alreadyResponded) {
      triggerAlert(
        "You have already responded to this request.",
        "Already Sent",
        "info",
      );
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

      localStorage.setItem("pingbazar_shop_name", shopName);
      localStorage.setItem("pingbazar_shop_phone", shopPhone);
      localStorage.setItem("pingbazar_shop_address", shopAddress);

      setRespondingToRequest(null);
      triggerAlert(
        "Offer sent! The buyer can now view your shop and contact details.",
        "Offer Sent",
        "success",
      );
    } catch (err) {
      console.error(err);
      triggerAlert("Error responding to request: " + err, "Error Sending", "error");
    } finally {
      setSubmittingResponse(false);
    }
  };

  const feedRequests = allRequests.filter((req) => {
    if (ignoredRequestIds.includes(req.id)) return false;
    if (req.buyerId === user.uid) return false;
    const userAlreadyResponded = allResponses.some(
      (res) => res.requestId === req.id && res.sellerId === user.uid,
    );
    if (userAlreadyResponded) return false;
    const matchesDistance = getDistance(parseFloat(lat), parseFloat(lng), req.lat, req.lng) <= parseFloat(radius);
    const matchesCity = req.city && city && req.city.toLowerCase().trim() === city.toLowerCase().trim();
    return matchesDistance || matchesCity;
  });

  const myNeeds = allRequests.filter((req) => req.buyerId === user.uid);

  return (
    <div className="bg-[#FCF9F8] text-black font-body-lg min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#7D12FF] selection:text-white">
      {/* Decorative Grid Background */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWUyZTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 z-0 pointer-events-none"></div>

      {/* Top Notification Banner */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 z-10000 w-auto min-w-70 sm:w-95 bg-[#7D12FF] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-smooth-notification overflow-hidden pointer-events-auto">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shrink-0"></div>
                <span className="font-['Space_Grotesk'] text-[11px] text-white font-black uppercase tracking-[0.2em] whitespace-nowrap">
                  Request Alert
                </span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-white hover:bg-black/20 p-1 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px] font-bold">close</span>
              </button>
            </div>

            <div className="flex items-center gap-4 py-1">
              <div className="bg-white w-14 h-14 flex items-center justify-center shrink-0 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="material-symbols-outlined text-[#7D12FF] font-black text-[32px]">
                  notifications_active
                </span>
              </div>
              <div className="min-w-0 grow">
                <h4 className="font-['Space_Grotesk'] text-[16px] sm:text-[18px] font-black text-white leading-tight truncate uppercase">
                  {notification.title}
                </h4>
                <p className="font-mono text-[11px] text-white/90 font-bold uppercase tracking-tight truncate mt-0.5">
                  <span className="opacity-60 mr-1">CITY:</span> {notification.city}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveTab("feed");
                setNotification(null);
              }}
              className="w-full py-3 bg-white text-black font-['Space_Grotesk'] text-xs uppercase font-black border-2 border-black hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_black] active:shadow-none"
            >
              View Request
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
          <div className="h-2 w-full bg-black/20">
            <div className="h-full bg-white origin-left animate-progress-bar"></div>
          </div>
        </div>
      )}

      {/* Top Sticky Navigation */}
      <nav className="bg-white border-b-4 border-black sticky top-0 w-full z-999 flex justify-between items-center px-4 sm:px-12 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-4 lg:gap-16">
          <Link href="/" className="text-2xl sm:text-4xl font-black text-[#7D12FF] italic tracking-tighter hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
            PingBazar
          </Link>
          
          <div className="hidden lg:flex items-center gap-1 font-['Space_Grotesk'] font-black uppercase">
            {[
              { id: "location", label: "Location", icon: "location_on" },
              { id: "request", label: "Post", icon: "add_circle" },
              { id: "feed", label: "Nearby", icon: "explore" },
              { id: "my-needs", label: "Requests", icon: "shopping_bag" },
              { id: "seller-profile", label: "Profile", icon: "account_circle" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 border-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-[#7D12FF] text-white border-black shadow-[2px_2px_0px_0px_black]" 
                    : "text-black border-transparent hover:bg-zinc-100"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-['Space_Grotesk'] font-black text-sm uppercase leading-none">
              {user.displayName || "User"}
            </span>
            <span className="font-mono text-[9px] text-zinc-400 font-bold">
              LOGGED IN
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="bg-[#FF4545] text-white border-2 border-black p-2 sm:px-4 sm:py-2 font-black uppercase text-xs hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_black] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden w-full bg-white border-b-2 border-black z-40 overflow-x-auto no-scrollbar flex sticky top-18 sm:top-22">
        {[
          { id: "location", label: "Location", icon: "location_on" },
          { id: "request", label: "Post", icon: "add_circle" },
          { id: "feed", label: "Nearby", icon: "explore" },
          { id: "my-needs", label: "Requests", icon: "shopping_bag" },
          { id: "seller-profile", label: "Profile", icon: "account_circle" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-17.5 py-3 flex flex-col items-center gap-0.5 border-r border-black last:border-r-0 transition-colors ${
              activeTab === tab.id ? "bg-[#7D12FF] text-white" : "text-black"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span className="text-[10px] font-bold uppercase">{tab.label}</span>
          </button>
        ))}
      </div>

      <main className="grow flex flex-col items-center w-full max-w-7xl mx-auto px-4 sm:px-12 py-8 sm:py-12 relative z-20">
        <div className="w-full">
          {activeTab === "location" && (
            <LocationTab 
              city={city} 
              lat={lat} 
              lng={lng} 
              radius={radius} 
              setRadius={setRadius} 
              onShowMap={() => {
                setMapPickerTarget("search");
                setShowMapPicker(true);
              }} 
              onSave={handleSaveCriteria}
            />
          )}
          {activeTab === "request" && (
            <PostNeedTab 
              requestTitle={requestTitle}
              setRequestTitle={setRequestTitle}
              requestDesc={requestDesc}
              setRequestDesc={setRequestDesc}
              base64Image={base64Image}
              setBase64Image={setBase64Image}
              submitting={submitting}
              onCreateRequest={handleCreateRequest}
              handleImageUpload={handleImageUpload}
            />
          )}
          {activeTab === "feed" && (
            <LocalFeedTab 
              feedRequests={feedRequests}
              onAccept={(req) => setRespondingToRequest(req)}
              onIgnore={(id) => setIgnoredRequestIds(prev => [...prev, id])}
              getDistance={getDistance}
              currentLat={parseFloat(lat)}
              currentLng={parseFloat(lng)}
            />
          )}
          {activeTab === "my-needs" && (
            <MyNeedsTab 
              myNeeds={myNeeds} 
              allResponses={allResponses} 
            />
          )}
          {activeTab === "seller-profile" && (
            <ShopProfileTab 
              shopName={shopName}
              setShopName={setShopName}
              shopPhone={shopPhone}
              setShopPhone={setShopPhone}
              shopAddress={shopAddress}
              setShopAddress={setShopAddress}
              onSave={handleSaveSellerProfile}
              onShowMap={() => {
                setMapPickerTarget("shop");
                setShowMapPicker(true);
              }}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t-4 border-black w-full px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-8 mt-auto z-10 relative">
        <div className="text-2xl font-black text-black font-['Space_Grotesk'] italic tracking-widest">PingBazar</div>
        <div className="flex flex-wrap justify-center gap-6 font-mono uppercase text-[10px] font-bold text-zinc-400">
          <span>&copy; {new Date().getFullYear()} PINGBAZAR. OPEN ACCESS.</span>
        </div>
        <div className="flex gap-4 font-mono uppercase text-[10px] font-black text-[#7D12FF]">
          <span>VER_1.0.8</span>
        </div>
      </footer>

      {/* Responder Details Modal */}
      {respondingToRequest && (
        <div className="fixed inset-0 z-20000 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRespondingToRequest(null)}></div>
          <div 
            className="bg-white border-[6px] border-black p-6 sm:p-10 relative shadow-[16px_16px_0px_0px_black] z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Protocol Style */}
            <div className="w-full border-b-4 border-black pb-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-mono font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_#7D12FF]">
                  SEND_OFFER_V1
                </span>
                <div className="h-0.5 grow bg-zinc-100"></div>
                <button 
                  onClick={() => setRespondingToRequest(null)} 
                  className="w-10 h-10 border-2 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-[2px_2px_0px_0px_black] active:shadow-none"
                >
                  <span className="material-symbols-outlined font-black text-[20px]">close</span>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="font-['Space_Grotesk'] text-4xl font-black text-black uppercase tracking-tighter shrink-0">
                  I Have This <span className="text-[#7D12FF]">Item</span>
                </h3>
                <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest bg-zinc-50 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_black]">
                  REQ_ID: {respondingToRequest.id.slice(0,8)}
                </p>
              </div>
            </div>

            <p className="text-zinc-500 font-medium mb-10 leading-relaxed ">
              Send your shop details to the buyer. This will let them contact you directly to discuss the item.
            </p>

            <form onSubmit={handleConfirmResponse} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Info Card: Merchant */}
                <div className="md:col-span-2 p-5 bg-zinc-50 border-2 border-black shadow-[4px_4px_0px_0px_black] flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-[#7D12FF]">store</span>
                    <label className="font-['Space_Grotesk'] font-black uppercase text-[10px] tracking-widest text-zinc-400">Shop Name</label>
                  </div>
                  <p className="font-['Space_Grotesk'] font-black text-xl text-black uppercase truncate">
                    {shopName || "SHOP_NOT_SET"}
                  </p>
                </div>

                {/* Info Card: Comms */}
                <div className="p-5 bg-zinc-50 border-2 border-black shadow-[4px_4px_0px_0px_black] flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-[#7D12FF]">call</span>
                    <label className="font-['Space_Grotesk'] font-black uppercase text-[10px] tracking-widest text-zinc-400">Phone Number</label>
                  </div>
                  <p className="font-mono font-black text-lg text-black">
                    {shopPhone || "000-000-0000"}
                  </p>
                </div>

                {/* Info Card: Extraction */}
                <div className="p-5 bg-zinc-50 border-2 border-black shadow-[4px_4px_0px_0px_black] flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-[#7D12FF]">pin_drop</span>
                    <label className="font-['Space_Grotesk'] font-black uppercase text-[10px] tracking-widest text-zinc-400">Shop Location</label>
                  </div>
                  <p className="font-['Space_Grotesk'] font-bold text-sm text-black truncate">
                    {shopAddress || "LOCATION_NOT_SET"}
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <div className="p-4 bg-[#7D12FF]/5 border-l-4 border-[#7D12FF] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#7D12FF] text-[20px]">info</span>
                  <p className="text-[11px] text-[#7D12FF] font-bold uppercase leading-tight tracking-wide">
                    The details above will be sent to the buyer so they can call or visit your shop.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={submittingResponse || !shopName || !shopAddress} 
                  className="w-full py-5 bg-black text-white border-4 border-black font-['Space_Grotesk'] font-black uppercase tracking-tighter text-xl hover:bg-[#7D12FF] transition-all cursor-pointer shadow-[8px_8px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-4 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
                >
                  {submittingResponse ? "SENDING..." : (
                    <>
                      Send My Details
                      <span className="material-symbols-outlined text-[24px]">send</span>
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setActiveTab("seller-profile")}
                  className="w-full py-3 border-2 border-black font-['Space_Grotesk'] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  Edit Shop Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MapPickerModal isOpen={showMapPicker} onClose={() => setShowMapPicker(false)} onConfirm={handleMapLocationConfirm} initialLat={lat} initialLng={lng} />

      {/* Custom Alert Modal */}
      {customAlert.show && (
        <div className="fixed inset-0 z-30000 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))}></div>
          <div className="bg-white border-4 border-black p-6 sm:p-8 relative shadow-[12px_12px_0px_0px_black] z-10 w-[min(440px,95%)] min-w-75 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6 border-b-2 border-black pb-4 shrink-0">
              <div className={`w-12 h-12 flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_black] shrink-0 ${
                customAlert.type === "success" ? "bg-[#00C853] text-white" : 
                customAlert.type === "error" ? "bg-[#FF4545] text-white" : "bg-[#7D12FF] text-white"
              }`}>
                <span className="material-symbols-outlined text-2xl font-black">
                  {customAlert.type === "success" ? "check_circle" : 
                   customAlert.type === "error" ? "error" : "info"}
                </span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h4 className="font-['Space_Grotesk'] font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 leading-none mb-1">
                  System Notification
                </h4>
                <p className="font-['Space_Grotesk'] font-black text-xl text-black truncate uppercase tracking-tighter">
                  {customAlert.title}
                </p>
              </div>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto no-scrollbar mb-8">
              <p className="font-['Space_Grotesk'] font-bold text-lg text-black leading-tight wrap-break-word">
                {customAlert.message}
              </p>
            </div>

            <button 
              onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))}
              className="w-full py-4 bg-black text-white border-2 border-black font-['Space_Grotesk'] font-black uppercase tracking-widest text-[10px] hover:bg-[#7D12FF] transition-all cursor-pointer shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 mt-auto flex items-center justify-center gap-2 shrink-0"
            >
              Close Notification
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
