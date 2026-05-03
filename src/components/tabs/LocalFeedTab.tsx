"use client";

import Image from "next/image";
import { ProductRequest } from "../AuthenticatedHome";

interface LocalFeedTabProps {
  feedRequests: ProductRequest[];
  onAccept: (req: ProductRequest) => void;
  onIgnore: (id: string) => void;
  getDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  currentLat: number;
  currentLng: number;
}

export default function LocalFeedTab({
  feedRequests,
  onAccept,
  onIgnore,
  getDistance,
  currentLat,
  currentLng,
}: LocalFeedTabProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase tracking-widest">
              LIVE_FEED
            </span>
            <div className="h-0.5 w-8 bg-black"></div>
          </div>
          <h2 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">
            Nearby <span className="text-[#00C853]">Requests</span>
          </h2>
          <p className="text-zinc-500 font-medium mt-2 ">
            See what people in your area are looking for right now.
          </p>
        </div>
      </div>

      {feedRequests.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center bg-[#fdfdfd] border-4 border-black border-dashed shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="w-20 h-20 bg-zinc-50 border-2 border-black flex items-center justify-center rotate-3 mb-6">
            <span className="material-symbols-outlined text-4xl text-zinc-300">radar</span>
          </div>
          <h3 className="font-['Space_Grotesk'] text-xl font-black text-black uppercase mb-2">No Requests Found</h3>
          <p className="text-zinc-400 text-sm  font-medium">Try increasing your search distance or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {feedRequests.map((req) => {
            const distance = getDistance(currentLat, currentLng, req.lat, req.lng);
            
            return (
              <div
                key={req.id}
                className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] flex flex-col group hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_#7D12FF] transition-all overflow-hidden"
              >
                {/* Visual Module */}
                <div className="h-56 bg-zinc-50 border-b-4 border-black relative overflow-hidden flex items-center justify-center p-6">
                  {req.image ? (
                    <div className="w-full h-full relative">
                      <Image
                        src={req.image as string}
                        alt={req.title}
                        fill
                        className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <span className="material-symbols-outlined text-7xl text-zinc-200">package_2</span>
                  )}
                  <div className="absolute top-4 left-4 bg-black text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_0px_#00C853]">
                    <span className="material-symbols-outlined text-[14px]">distance</span>
                    {distance.toFixed(1)} KM AWAY
                  </div>
                </div>

                {/* Content Module */}
                <div className="p-6 flex flex-col grow">
                  <div className="mb-4">
                    <h3 className="font-['Space_Grotesk'] text-xl font-black text-black leading-tight uppercase line-clamp-2 min-h-14">
                      {req.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="font-mono text-[9px] font-black text-zinc-400 uppercase tracking-tighter">CITY: {req.city}</span>
                    </div>
                  </div>
                  
                  <p className="text-zinc-500 text-sm font-medium line-clamp-3 grow mb-8 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="flex gap-3 pt-6 border-t-2 border-black border-dotted">
                    <button
                      onClick={() => onAccept(req)}
                      className="grow py-4 bg-black text-white border-2 border-black font-['Space_Grotesk'] font-black uppercase text-[11px] tracking-widest hover:bg-[#7D12FF] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      I have this item
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                    <button
                      onClick={() => onIgnore(req.id)}
                      className="w-14 h-14 bg-white text-black border-2 border-black font-black hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                      title="Ignore"
                    >
                      <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
