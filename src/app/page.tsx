"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import AuthenticatedHome from "@/components/AuthenticatedHome";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="bg-background text-on-background font-body-lg min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-white p-6 border-[3px] border-black neo-brutal-shadow-lg">
          <svg className="animate-spin h-10 w-10 text-primary-container" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p className="font-meta-mono text-sm uppercase font-bold">Connecting to PingBazar...</p>
        </div>
      </div>
    );
  }

  // If Authenticated View
  if (user) {
    return <AuthenticatedHome user={user} onSignOut={handleSignOut} />;
  }

  // Not Authenticated View (Landing/Guest View)
  return (
    <div className="bg-background text-on-background font-body-lg min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-primary-container selection:text-white">
      {/* Decorative Grid Background */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWUyZTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 z-0 pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display-lg text-2xl sm:text-3xl lg:text-4xl italic tracking-tighter bg-primary-container text-white px-2 py-1 border-2 border-black">
            PINGBAZAR
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block px-4 py-2 bg-white text-black font-button-text text-sm uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-tertiary-container text-on-tertiary-container font-button-text text-xs sm:text-sm uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
          >
            Sign Up
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="grow flex flex-col justify-center items-center max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-20 py-10">
        <div className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container border-2 border-black px-3 py-1 mb-6 sm:mb-8 font-meta-mono text-[10px] sm:text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-[14px]">radar</span>
          <span>Reverse E-Commerce Redefined</span>
        </div>

        <h1 className="font-display-xl text-[32px] sm:text-[44px] md:text-[56px] lg:text-[72px] leading-[1.1] text-black tracking-tight mb-6 max-w-4xl mx-auto wrap-break-word hyphens-auto">
          Find Products Through <br className="hidden sm:block" />
          <span className="inline-block bg-primary-container text-white px-3 py-1 mt-2 border-[3px] border-black transform -rotate-2">
            Local Sellers Near You
          </span>
        </h1>

        <p className="font-body-lg text-[15px] sm:text-[18px] lg:text-[20px] text-secondary max-w-2xl mb-10 leading-relaxed mx-auto px-2">
          Describe what you need, upload a photo, and get instant responses from nearby sellers with correct shop details and locations.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-4 bg-primary-container text-white font-button-text text-sm sm:text-base uppercase font-bold border-[3px] border-black neo-brutal-shadow-lg hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <span className="material-symbols-outlined">rocket_launch</span>
            Create My Account
          </Link>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 text-center font-meta-mono text-[10px] sm:text-[12px] text-secondary relative z-20 border-t-[3px] border-black bg-white">
        &copy; {new Date().getFullYear()} PINGBAZAR PROTOCOL. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
