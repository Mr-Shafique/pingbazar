"use client";

interface ShopProfileTabProps {
  shopName: string;
  setShopName: (val: string) => void;
  shopPhone: string;
  setShopPhone: (val: string) => void;
  shopAddress: string;
  setShopAddress: (val: string) => void;
  onSave: () => void;
  onShowMap: () => void;
}

export default function ShopProfileTab({
  shopName,
  setShopName,
  shopPhone,
  setShopPhone,
  shopAddress,
  setShopAddress,
  onSave,
  onShowMap,
}: ShopProfileTabProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Refined Wide Header */}
      <div className="w-full border-b-[4px] border-black pb-10 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-3 py-1 bg-black text-white text-[10px] font-mono font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_#7D12FF]">
            MERCHANT_PROTOCOL_V1
          </span>
          <div className="h-[2px] grow bg-zinc-100"></div>
          {/* <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_black] font-mono text-[10px] font-black uppercase">
            <div className="w-2 h-2 bg-[#7D12FF] rounded-full animate-pulse"></div>
            Node Status: Active
          </div> */}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-20">
          <h2 className="font-['Space_Grotesk'] text-5xl sm:text-7xl font-black uppercase tracking-tighter text-black shrink-0">
            MERCHANT <span className="text-[#7D12FF]">Id</span>
          </h2>
          <div className="max-w-2xl">
             <p className="text-zinc-500 font-medium text-lg leading-relaxed">
              Configure your merchant credentials and extraction coordinates. 
              This identity is broadcasted to buyers when synchronization occurs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Configuration */}
        <div className="lg:col-span-7">
          <div className="p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] space-y-8">
            <div className="space-y-2">
              <label className="font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest text-zinc-400 ml-1">
                Official Shop Identifier
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-300">store</span>
                <input
                  type="text"
                  required
                  placeholder="E.G. APEX ELECTRONICS"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-black p-5 pl-14 font-['Space_Grotesk'] font-bold text-xl text-black focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#7D12FF] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest text-zinc-400 ml-1">
                Secure Comms Link
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-300">call</span>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 000-0000"
                  value={shopPhone}
                  onChange={(e) => setShopPhone(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-black p-5 pl-14 font-mono font-bold text-lg text-black focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#7D12FF] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest text-zinc-400 ml-1">
                Physical Extraction Point
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-300">pin_drop</span>
                <input
                  type="text"
                  required
                  placeholder="STREET, BUILDING, CITY..."
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  className="w-full bg-zinc-50 border-2 border-black p-5 pl-14 pr-32 font-['Space_Grotesk'] font-bold text-lg text-black focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#7D12FF] transition-all"
                />
                <button
                  type="button"
                  onClick={onShowMap}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#7D12FF] transition-all shadow-[4px_4px_0px_0px_#7D12FF] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  Locate
                </button>
              </div>
            </div>

            <button
              onClick={onSave}
              className="w-full py-5 bg-black text-white border-2 border-black font-['Space_Grotesk'] font-black uppercase tracking-tighter text-lg hover:bg-[#7D12FF] transition-all cursor-pointer shadow-[6px_6px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center gap-3"
            >
              Synchronize Node Data
              <span className="material-symbols-outlined">sync</span>
            </button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-5">
           <div className="p-8 bg-zinc-50 border-4 border-black shadow-[8px_8px_0px_0px_black] sticky top-32">
             <div className="flex items-center justify-between mb-8">
               <h4 className="font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest text-zinc-400">Live Card Preview</h4>
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
               </div>
             </div>
             
             <div className="p-6 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#7D12FF]/5 rounded-full -mr-12 -mt-12"></div>
                
                <div className="relative z-10">
                  <p className="font-['Space_Grotesk'] font-black text-2xl uppercase mb-1 truncate">{shopName || "NEW_NODE"}</p>
                  <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-6 truncate">{shopAddress || "UNDEFINED_LOCATION"}</p>
                  
                  <div className="flex items-center gap-3 py-3 border-y-2 border-black border-dotted mb-6">
                    <span className="material-symbols-outlined text-[#7D12FF]">call</span>
                    <span className="font-mono text-xs font-black text-black">{shopPhone || "000-000-0000"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-green-600 font-mono text-[9px] font-black uppercase tracking-widest">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    Ready for fulfillment
                  </div>
                </div>
             </div>

             <div className="mt-10 p-4 bg-black/5 border-l-4 border-black">
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide leading-relaxed">
                 NOTICE: This identity is broadcasted to buyers when you accept a fulfillment signal. Ensure coordinates and contact links are verified.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
