"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams ? searchParams.get("mode") : null;

  const [isSignUp, setIsSignUp] = useState(() => modeParam === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check or create firestore user doc
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || fullName || "Anonymous",
        photoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
      }, { merge: true });

      // Redirect on success
      router.push("/");
    } catch (err: unknown) {
      console.error("Google sign in error:", err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (firebaseError.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else if (firebaseError.message) {
        setError(firebaseError.message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim() || "Failed to sign in with Google.");
      } else {
        setError("Failed to sign in with Google.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check form fields before submitting
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: fullName });

        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: fullName,
          createdAt: new Date().toISOString(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (firebaseError.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (firebaseError.code === "auth/user-not-found" || firebaseError.code === "auth/wrong-password" || firebaseError.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (firebaseError.code === "auth/weak-password") {
        setError("Your password is too weak. Please use a stronger password.");
      } else if (firebaseError.message) {
        setError(firebaseError.message.replace("Firebase: ", "").replace(/\(auth\/.*\)\.?/, "").trim() || "Authentication failed.");
      } else {
        setError("Authentication failed. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-lg min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-primary-container selection:text-white">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-primary-container opacity-10 rounded-full mix-blend-multiply blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-tertiary-container opacity-5 rounded-full mix-blend-multiply blur-3xl"></div>
        {/* Grid overlay for technical feel */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWUyZTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-212.5 flex flex-col lg:flex-row bg-white border-2 md:border-[3px] border-black neo-brutal-shadow md:neo-brutal-shadow-lg z-10 relative">
        {/* Branding / Visual Side (Hidden on very small screens) */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary-container border-r-[3px] border-black p-6 lg:p-8 flex-col justify-between relative overflow-hidden">
          {/* Inner decorative borders */}
          <div className="absolute inset-sm border-2 border-black border-dashed opacity-30 pointer-events-none"></div>

          <div className="z-10">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="font-display-xl text-[40px] lg:text-[56px] leading-none text-white italic tracking-tighter mb-sm">
                PING<br />BAZAR
              </h1>
            </Link>
            <p className="font-headline-md text-[18px] lg:text-[24px] text-white/90">
              Join the protocol.<br />Access the market.
            </p>
          </div>

          <div className="z-10 mt-xl">
            <div className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 border-2 border-black font-meta-mono text-[14px]">
              <span className="material-symbols-outlined">terminal</span>
              <span>SYS.INIT_USER()</span>
            </div>
          </div>

          {/* Abstract geometric shapes */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white border-[3px] border-black rounded-full mix-blend-overlay opacity-20"></div>
          <div className="absolute top-20 -right-10 w-32 h-32 bg-black border-[3px] border-white transform rotate-45 mix-blend-overlay opacity-10"></div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 bg-white p-5 sm:p-8 flex flex-col justify-center relative">

          {/* Mobile Branding */}
          <div className="lg:hidden mb-5 flex justify-between items-center border-b-2 border-black pb-3">
            <Link href="/" className="font-headline-md text-[20px] sm:text-[28px] text-black italic tracking-tighter hover:cursor-pointer">
              PINGBAZAR
            </Link>
          </div>

          <div className="mb-5 sm:mb-6">
            <h2 className="font-headline-lg text-[24px] sm:text-[28px] lg:text-[32px] text-on-surface mb-1 leading-tight">
              {isSignUp ? "Sign Up" : "Log In"}
            </h2>
            <p className="font-body-md text-[13px] sm:text-[14px] text-secondary">
              {isSignUp ? "Create your account to start browsing and posting needs." : "Access your account to continue trading."}
            </p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-5 p-3 sm:p-3 border-2 border-black bg-error-container text-on-error-container text-xs font-meta-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ERROR: {error}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3 sm:gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label className="font-button-text text-[11px] sm:text-[12px] text-on-surface uppercase font-bold" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="JANE DOE"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="w-full bg-surface-container border-2 border-black text-on-surface font-meta-mono text-[13px] sm:text-[14px] px-3 py-2 sm:px-3 sm:py-2.5 neo-brutal-shadow transition-all duration-100 neo-brutal-input"
                />
              </div>
            )}

            <div className="flex flex-col gap-1 sm:gap-1.5">
              <label className="font-button-text text-[11px] sm:text-[12px] text-on-surface uppercase font-bold" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="SYS@PINGBAZAR.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container border-2 border-black text-on-surface font-meta-mono text-[13px] sm:text-[14px] px-3 py-2 sm:px-3 sm:py-2.5 neo-brutal-shadow transition-all duration-100 neo-brutal-input"
              />
            </div>

            <div className="flex flex-col gap-1 sm:gap-1.5 mb-1 sm:mb-2">
              <label className="font-button-text text-[11px] sm:text-[12px] text-on-surface uppercase font-bold" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-surface-container border-2 border-black text-on-surface font-meta-mono text-[13px] sm:text-[14px] px-3 py-2 sm:px-3 sm:py-2.5 neo-brutal-shadow transition-all duration-100 neo-brutal-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container text-white border-2 border-black font-button-text text-[13px] sm:text-[14px] uppercase py-2.5 px-4 flex items-center justify-between neo-brutal-shadow transition-all duration-100 neo-brutal-hover neo-brutal-active mt-1 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              <span>{loading ? "PROCESSING..." : isSignUp ? "Create Account" : "Access System"}</span>
              {!loading && <span className="font-bold text-lg">&gt;</span>}
              {loading && (
                <svg className="animate-spin-fast h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-5 my-1">
            <div className="grow border-t-2 border-black"></div>
            <span className="shrink-0 mx-3 sm:mx-4 font-meta-mono text-[11px] sm:text-[12px] font-bold text-secondary uppercase bg-white px-2 border-2 border-black">
              OR
            </span>
            <div className="grow border-t-2 border-black"></div>
          </div>

          {/* Google Auth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-black border-2 border-black font-button-text text-[13px] sm:text-[14px] font-bold uppercase py-2.5 px-4 flex items-center justify-center gap-2 neo-brutal-shadow transition-all duration-100 neo-brutal-hover neo-brutal-active disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span>Sign in with Google</span>
          </button>

          <div className="mt-5 sm:mt-6 text-center font-meta-mono text-[11px] sm:text-[12px] text-secondary">
            {isSignUp ? "ALREADY HAVE AN ACCOUNT?" : "NEED AN ACCOUNT?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-container font-bold border-b-2 border-primary-container hover:text-black hover:border-black transition-colors uppercase hover:cursor-pointer"
            >
              {isSignUp ? "LOGIN" : "SIGN UP"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-5 sm:mt-6 w-full max-w-212.5 text-center font-meta-mono text-[10px] sm:text-[11px] md:text-[12px] text-secondary px-4">
        © {new Date().getFullYear()} PINGBAZAR PROTOCOL. ALL RIGHTS RESERVED.
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans text-white">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin-fast h-10 w-10 text-blue-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p className="text-zinc-400 font-medium tracking-wide">Loading PingBazar authentication...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
