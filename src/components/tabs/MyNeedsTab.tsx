"use client";

import { ProductRequest, SellerResponse } from "../AuthenticatedHome";

interface MyNeedsTabProps {
  myNeeds: ProductRequest[];
  allResponses: SellerResponse[];
}

export default function MyNeedsTab({ myNeeds, allResponses }: MyNeedsTabProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase tracking-widest">
            MY_HISTORY
          </span>
          <div className="h-0.5 w-8 bg-black"></div>
        </div>
        <h2 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">
          My <span className="text-[#7D12FF]">Requests</span>
        </h2>
        <p className="text-zinc-500 font-medium mt-2 ">
          Track your requests and see responses from nearby shops.
        </p>
      </div>

      {myNeeds.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center bg-[#fdfdfd] border-4 border-black border-dashed shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)]">
          <div className="w-20 h-20 bg-zinc-50 border-2 border-black flex items-center justify-center -rotate-3 mb-6">
            <span className="material-symbols-outlined text-4xl text-zinc-300">shopping_bag</span>
          </div>
          <h3 className="font-['Space_Grotesk'] text-xl font-black text-black uppercase mb-2">No Requests Yet</h3>
          <p className="text-zinc-400 text-sm font-medium">You haven&apos;t posted any requests yet. Go to the Post tab to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10">
          {myNeeds.map((need) => {
            const responses = allResponses.filter((res) => res.requestId === need.id);
            return (
              <div key={need.id} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_black] overflow-hidden group">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left: Request Data */}
                  <div className="lg:col-span-4 bg-zinc-50 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8">
                    <div className="aspect-square bg-white border-2 border-black mb-6 relative overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
                      {need.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={need.image} alt={need.title} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="material-symbols-outlined text-6xl text-zinc-200">image_not_supported</span>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-[9px] font-mono font-black uppercase tracking-tighter">
                        PHOTO
                      </div>
                    </div>
                    <h3 className="font-['Space_Grotesk'] text-2xl font-black text-black uppercase leading-tight mb-2">{need.title}</h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-6">{need.description}</p>
                    <div className="flex flex-wrap gap-2">
                       <span className="px-3 py-1 bg-white border-2 border-black text-[10px] font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_black]">City: {need.city}</span>
                       <span className="px-3 py-1 bg-white border-2 border-black text-[10px] font-black uppercase tracking-tighter shadow-[2px_2px_0px_0px_black]">Radius: {need.radius}KM</span>
                    </div>
                  </div>

                  {/* Right: Responses */}
                  <div className="lg:col-span-8 p-8 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#7D12FF] font-black text-[32px]">storefront</span>
                        <h4 className="font-['Space_Grotesk'] text-2xl font-black uppercase tracking-tighter">Offers Received</h4>
                      </div>
                      <span className={`px-4 py-2 border-2 border-black font-mono text-xs font-black uppercase self-start sm:self-auto ${responses.length > 0 ? 'bg-[#00C853] text-white shadow-[4px_4px_0px_0px_black]' : 'bg-zinc-100 text-zinc-400'}`}>
                        Offers: {responses.length}
                      </span>
                    </div>

                    {responses.length === 0 ? (
                      <div className="py-16 border-2 border-black border-dashed bg-zinc-50/50 flex flex-col items-center justify-center text-center px-10 rounded-xl">
                        <span className="material-symbols-outlined text-zinc-300 text-4xl mb-4">hourglass_empty</span>
                        <p className="font-mono text-xs font-black text-zinc-400 uppercase tracking-widest leading-relaxed max-w-sm">
                          Waiting for local shops to respond to your request...
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {responses.map((res) => (
                          <div key={res.id} className="p-6 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_black] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_#7D12FF] transition-all">
                            <div className="flex items-center gap-3 mb-5">
                              <div className="w-10 h-10 bg-black flex items-center justify-center text-white shrink-0">
                                <span className="material-symbols-outlined text-lg">store</span>
                              </div>
                              <div className="min-w-0 grow">
                                <p className="font-['Space_Grotesk'] font-black uppercase text-sm truncate">{res.shopName}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 bg-[#00C853] rounded-full"></span>
                                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">VERIFIED SHOP</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-8">
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[18px] text-[#7D12FF]">call</span>
                                <p className="font-mono text-xs font-black">{res.contactNumber}</p>
                              </div>
                              <div className="flex items-start gap-3">
                                <span className="material-symbols-outlined text-[18px] text-[#7D12FF] shrink-0">pin_drop</span>
                                <p className="font-mono text-[10px] font-bold text-zinc-500 uppercase leading-tight">{res.shopLocation}</p>
                              </div>
                            </div>

                            <a
                              href={`tel:${res.contactNumber}`}
                              className="w-full py-4 bg-black text-white border-2 border-black font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-[#7D12FF] transition-colors shadow-[4px_4px_0px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1"
                            >
                              Call Shop
                              <span className="material-symbols-outlined text-[16px]">call</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
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
