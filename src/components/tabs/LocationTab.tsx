"use client";

interface LocationTabProps {
  city: string;
  lat: string;
  lng: string;
  radius: string;
  setRadius: (val: string) => void;
  onShowMap: () => void;
  onSave: () => void;
}

export default function LocationTab({
  city,
  lat,
  lng,
  radius,
  setRadius,
  onShowMap,
  onSave,
}: LocationTabProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase tracking-widest">
              STEP_01
            </span>
            <div className="h-0.5 w-8 bg-black"></div>
          </div>
          <h2 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">
            Establish <span className="text-[#7D12FF]">Zone</span>
          </h2>
          <p className="text-zinc-500 font-medium mt-2">
            Define your operational perimeter to filter local demand signals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Location Card */}
        <div className="lg:col-span-7">
          <div className="p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] group transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#7D12FF]">
                <span className="material-symbols-outlined text-white text-[28px]">explore</span>
              </div>
              <div>
                <p className="font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest text-zinc-400">
                  Current Anchor Point
                </p>
                <h3 className="font-['Space_Grotesk'] text-2xl font-black text-black  max-w-75">
                  {city || "Locating..."}
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-zinc-50 border-2 border-black">
                <p className="font-mono text-[9px] font-black text-zinc-400 uppercase mb-1">LATITUDE</p>
                <p className="font-mono text-sm font-black">{parseFloat(lat).toFixed(6)}</p>
              </div>
              <div className="p-4 bg-zinc-50 border-2 border-black">
                <p className="font-mono text-[9px] font-black text-zinc-400 uppercase mb-1">LONGITUDE</p>
                <p className="font-mono text-sm font-black">{parseFloat(lng).toFixed(6)}</p>
              </div>
            </div>

            <button
              onClick={onShowMap}
              className="w-full py-4 bg-white border-2 border-black font-black uppercase text-sm tracking-tighter flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all cursor-pointer shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <span className="material-symbols-outlined text-[20px]">map</span>
              Open Deployment Map
            </button>
          </div>
        </div>

        {/* Radius Selection Card */}
        <div className="lg:col-span-5">
          <div className="p-8 bg-[#fdfdfd] border-4 border-black shadow-[8px_8px_0px_0px_black] h-full">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-[#7D12FF] font-black">radar</span>
              <label className="font-['Space_Grotesk'] font-black uppercase text-lg tracking-tight">
                Detection Perimeter
              </label>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { value: "1", label: "1 KM", desc: "Hyper Local" },
                { value: "5", label: "5 KM", desc: "Neighborhood" },
                { value: "10", label: "10 KM", desc: "City Wide" },
                { value: "25", label: "25 KM", desc: "Metropolitan" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRadius(opt.value)}
                  className={`w-full p-4 border-2 border-black flex items-center justify-between transition-all cursor-pointer ${
                    radius === opt.value 
                      ? "bg-[#7D12FF] text-white shadow-[4px_4px_0px_0px_black]" 
                      : "bg-white text-black hover:bg-zinc-50"
                  }`}
                >
                  <span className="font-['Space_Grotesk'] font-black text-xl">{opt.label}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${radius === opt.value ? 'text-white/80' : 'text-zinc-400'}`}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          onClick={onSave}
          className="group relative px-12 py-5 bg-black text-white border-4 border-black font-['Space_Grotesk'] font-black uppercase tracking-tighter hover:bg-[#7D12FF] transition-all cursor-pointer shadow-[8px_8px_0px_0px_rgba(125,18,255,0.3)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <span className="relative z-10 flex items-center gap-3 text-xl">
            Save Criteria
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </span>
        </button>
      </div>
    </div>
  );
}
