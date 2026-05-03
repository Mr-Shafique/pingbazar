/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, sendEmailVerification, User } from "firebase/auth";
import AuthenticatedHome from "@/components/AuthenticatedHome";

const FLOATING_ICONS = [
  { src: "/assets/3dicons/bag-front-color.svg", alt: "Bag", top: "15%", left: "10%", size: "w-16 sm:w-20 md:w-28", delay: "0s", duration: "6s", tilt: "rotate-12" },
  { src: "/assets/3dicons/camera-front-color.svg", alt: "Camera", top: "25%", right: "8%", size: "w-24 sm:w-28 md:w-36", delay: "1s", duration: "7s", tilt: "-rotate-12" },
  { src: "/assets/3dicons/computer-front-color.svg", alt: "Computer", top: "65%", left: "5%", size: "w-32 sm:w-36 md:w-48", delay: "2s", duration: "8s", tilt: "rotate-6" },
  { src: "/assets/3dicons/headphone-front-color.svg", alt: "Headphone", top: "72%", right: "10%", size: "w-20 sm:w-24 md:w-32", delay: "0.5s", duration: "6.5s", tilt: "-rotate-45" },
  { src: "/assets/3dicons/map-pin-front-color.svg", alt: "Location", top: "45%", left: "85%", size: "w-14 sm:w-16 md:w-20", delay: "1.5s", duration: "7.5s", tilt: "rotate-12" },
  { src: "/assets/3dicons/money-bag-front-color.svg", alt: "Money", top: "10%", right: "20%", size: "w-28 sm:w-32 md:w-40", delay: "3s", duration: "9s", tilt: "-rotate-12" },
  { src: "/assets/3dicons/bulb-front-color.svg", alt: "Bulb", top: "55%", left: "15%", size: "w-12 sm:w-14 md:w-16", delay: "2.5s", duration: "5.5s", tilt: "rotate-45" },
  { src: "/assets/3dicons/target-front-color.svg", alt: "Target", top: "82%", left: "35%", size: "w-22 sm:w-26 md:w-32", delay: "4s", duration: "8.5s", tilt: "-rotate-6" },
];

function FloatingIcon({ icon }: { icon: typeof FLOATING_ICONS[0] }) {
  return (
    <div
      className={`fixed ${icon.size} pointer-events-none z-10 animate-float transition-all select-none`}
      style={{
        top: icon.top,
        left: icon.left,
        right: icon.right,
        animationDelay: icon.delay,
        animationDuration: icon.duration,
      }}
    >
      <img
        src={icon.src}
        alt={icon.alt}
        className={`w-full h-auto drop-shadow-2xl ${icon.tilt}`}
      />
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Force reload user to get latest emailVerified status
        await currentUser.reload();
        setUser(auth.currentUser);
      } else {
        setUser(null);
      }
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

  const handleResendEmail = async () => {
    if (!user) return;
    setResending(true);
    setMessage("");
    try {
      const actionCodeSettings = {
        url: "https://pingbazar-331301713284.us-central1.run.app/login",
        handleCodeInApp: true,
      };
      await sendEmailVerification(user, actionCodeSettings);
      setMessage("Verification email sent! Please check your inbox or spam folder.");
    } catch (error) {
      console.error("Error resending email:", error);
      setMessage("Failed to send email. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background text-on-background font-body-lg min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-white p-6 border-[3px] border-black neo-brutal-shadow-lg">
          <svg className="animate-spin-fast h-10 w-10 text-primary-container" viewBox="0 0 24 24">
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
    if (!user.emailVerified) {
      return (
        <div className="bg-background text-on-background font-body-lg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          {/* Decorative Grid Background */}
          <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWUyZTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 z-0 pointer-events-none"></div>

          <div className="w-full max-w-md bg-white border-4 border-black p-8 neo-brutal-shadow-lg z-10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 bg-primary-container text-white border-2 border-black flex items-center justify-center neo-brutal-shadow-sm">
                <span className="material-symbols-outlined">mark_email_unread</span>
              </span>
              <h2 className="font-display-lg text-2xl uppercase tracking-tighter italic">Verify Your Email</h2>
            </div>

            <p className="font-body-md text-secondary leading-relaxed">
              We&apos;ve sent a verification link to <span className="font-bold text-black">{user.email}</span>. Please confirm your email inbox or spam folder to access the PingBazar protocol.
            </p>

            {message && (
              <div className={`p-3 border-2 border-black text-xs font-meta-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${message.includes('sent') ? 'bg-green-100 text-green-800' : 'bg-error-container text-on-error-container'}`}>
                {message}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="w-full py-4 bg-primary-container text-white font-button-text text-sm uppercase font-bold border-2 border-black neo-brutal-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
                {!resending && <span className="material-symbols-outlined text-[18px]">send</span>}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-white text-black font-button-text text-xs uppercase font-bold border-2 border-black hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                I&apos;ve Verified My Email
                <span className="material-symbols-outlined text-[16px]">refresh</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full py-3 text-red-600 font-button-text text-xs uppercase font-bold border-b-2 border-transparent hover:border-red-600 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <AuthenticatedHome user={user} onSignOut={handleSignOut} />;
  }

  // Not Authenticated View (Landing/Guest View)
  return (
    <div className="bg-background text-on-background font-body-lg min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-primary-container selection:text-white">
      {/* Floating 3D Icons */}
      <div className="hidden sm:block">
        {FLOATING_ICONS.map((icon, index) => (
          <FloatingIcon key={index} icon={icon} />
        ))}
      </div>

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
        &copy; {new Date().getFullYear()} PINGBAZAR. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
