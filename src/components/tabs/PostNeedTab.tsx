/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

interface PostNeedTabProps {
  requestTitle: string;
  setRequestTitle: (val: string) => void;
  requestDesc: string;
  setRequestDesc: (val: string) => void;
  base64Image: string;
  setBase64Image: (val: string) => void;
  submitting: boolean;
  onCreateRequest: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PostNeedTab({
  requestTitle,
  setRequestTitle,
  requestDesc,
  setRequestDesc,
  base64Image,
  submitting,
  onCreateRequest,
  handleImageUpload,
}: PostNeedTabProps) {
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-black uppercase tracking-widest">
            STEP_02
          </span>
          <div className="h-0.5 w-8 bg-black"></div>
        </div>
        <h2 className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">
          Broadcast <span className="text-[#FF4545]">Need</span>
        </h2>
        <p className="text-zinc-500 font-medium mt-2 max-w-md">
          Distribute your product requirements to all verified nodes in the local grid.
        </p>
      </div>

      <form onSubmit={onCreateRequest} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Detail Input Area */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] space-y-6">
            <div className="space-y-2">
              <label className="font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest text-zinc-400 ml-1">
                Requirement Headline
              </label>
              <input
                type="text"
                required
                placeholder="E.G. VINTAGE TURNTABLE, DESK LAMP..."
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                className="w-full bg-zinc-50 border-2 border-black p-5 font-['Space_Grotesk'] font-bold text-xl text-black focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#FF4545] transition-all placeholder:opacity-20"
              />
            </div>

            <div className="space-y-2">
              <label className="font-['Space_Grotesk'] font-black uppercase text-xs tracking-widest text-zinc-400 ml-1">
                Data Specifications
              </label>
              <textarea
                required
                placeholder="LIST CONDITION, MODEL, COLOR, OR BUDGETARY CONSTRAINTS..."
                value={requestDesc}
                onChange={(e) => setRequestDesc(e.target.value)}
                rows={6}
                className="w-full bg-zinc-50 border-2 border-black p-5 font-['Space_Grotesk'] font-bold text-lg text-black focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#FF4545] transition-all placeholder:opacity-20 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Visual Capture Area */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="grow bg-white border-4 border-black shadow-[8px_8px_0px_0px_black] relative group overflow-hidden flex flex-col">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-30"
            />
            
            <div className={`relative h-75 lg:h-full flex flex-col items-center justify-center transition-all ${base64Image ? 'bg-black' : 'bg-zinc-50'}`}>
              {base64Image ? (
                // eslint-disable-next-line react/jsx-no-comment-textnodes
                <div className="w-full h-full p-4 relative">
                  // eslint-disable-next-line @next/next/no-img-element, @next/next/no-img-element, @next/next/no-img-element
                  <img
                    src={base64Image}
                    alt="Payload Evidence"
                    className="w-full h-full object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="bg-white border-2 border-black px-4 py-2 font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_black]">Replace Image</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                    <span className="material-symbols-outlined text-zinc-300 text-[32px]">photo_camera</span>
                  </div>
                  <div>
                    <p className="font-['Space_Grotesk'] text-lg font-black text-black uppercase tracking-tighter">Capture Visual</p>
                    <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mt-1">Upload reference data</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-6 bg-[#FF4545] text-white border-4 border-black font-['Space_Grotesk'] font-black uppercase tracking-tighter text-xl hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_0px_black] transition-all active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-4"
          >
            {submitting ? "Processing..." : (
              <>
                Initialize Broadcast
                <span className="material-symbols-outlined text-[24px]">sensors</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
