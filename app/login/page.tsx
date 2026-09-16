"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

function LoginContent() {
  const { user, loading, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [authLoading, setAuthLoading] = useState<"google" | "github" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If user is already logged in, redirect to next/home
  useEffect(() => {
    if (!loading && user) {
      router.replace(next);
    }
  }, [user, loading, router, next]);

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      setAuthLoading("google");
      const { error } = await signInWithGoogle(next);
      if (error) {
        setErrorMessage(error.message);
        setAuthLoading(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate Google sign in");
      setAuthLoading(null);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setErrorMessage(null);
      setAuthLoading("github");
      const { error } = await signInWithGithub(next);
      if (error) {
        setErrorMessage(error.message);
        setAuthLoading(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate GitHub sign in");
      setAuthLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 antialiased relative overflow-hidden bg-[#EEF6F6] text-[#19322F]">
      {/* Ambient background glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D9ECC8]/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#006655]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D9ECC8]/15 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <main className="w-full max-w-[440px] z-10 mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-14 h-14 bg-[#006655] rounded-2xl mb-6 shadow-[0_4px_20px_-2px_rgba(25,50,47,0.12)] text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Return to LuxeEstate Home"
          >
            <span className="material-symbols-rounded text-3xl select-none">real_estate_agent</span>
          </Link>
          <h1 className="text-[32px] font-bold tracking-tight text-[#19322F] mb-2 leading-tight">
            Welcome to LuxeEstate
          </h1>
          <p className="text-[#19322F]/60 text-[15px]">
            Unlock exclusive properties worldwide.
          </p>
        </div>

        {/* Card Container matching image exactly */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_28px_-2px_rgba(25,50,47,0.06)] p-8 sm:p-10 border border-white/80">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 text-red-600 text-xs flex items-center gap-2">
              <span className="material-symbols-rounded text-base">info</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3.5">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading !== null}
              type="button"
              className="group w-full flex items-center justify-center gap-3 bg-white border border-[#E5E7EB] rounded-xl p-3.5 text-[#19322F] font-medium transition-all duration-300 hover:shadow-[0_8px_20px_-4px_rgba(25,50,47,0.1)] hover:-translate-y-0.5 relative overflow-hidden cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-[#D9ECC8]/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none"></div>
              {authLoading === "google" ? (
                <div className="w-5 h-5 border-2 border-[#006655] border-t-transparent rounded-full animate-spin relative z-10" />
              ) : (
                <svg className="w-5 h-5 relative z-10 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
              )}
              <span className="relative z-10 text-[15px]">
                {authLoading === "google" ? "Connecting to Google..." : "Continue with Google"}
              </span>
            </button>

            {/* GitHub Sign In Button */}
            <button
              onClick={handleGithubSignIn}
              disabled={authLoading !== null}
              type="button"
              className="group w-full flex items-center justify-center gap-3 bg-white border border-[#E5E7EB] rounded-xl p-3.5 text-[#19322F] font-medium transition-all duration-300 hover:shadow-[0_8px_20px_-4px_rgba(25,50,47,0.1)] hover:-translate-y-0.5 relative overflow-hidden cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-[#D9ECC8]/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out pointer-events-none"></div>
              {authLoading === "github" ? (
                <div className="w-5 h-5 border-2 border-[#006655] border-t-transparent rounded-full animate-spin relative z-10" />
              ) : (
                <svg className="w-5 h-5 relative z-10 fill-current text-[#19322F] flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                </svg>
              )}
              <span className="relative z-10 text-[15px]">
                {authLoading === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}
              </span>
            </button>
          </div>

          <p className="mt-8 text-center text-[14px] text-[#19322F]/70">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => handleGoogleSignIn()}
              className="font-semibold text-[#006655] hover:text-[#004d40] hover:underline transition-colors cursor-pointer inline"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* Footer Navigation Links */}
        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs text-[#19322F]/50">
            <Link className="hover:text-[#19322F] transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="hover:text-[#19322F] transition-colors" href="#">
              Terms of Service
            </Link>
            <Link className="hover:text-[#19322F] transition-colors" href="#">
              Help Center
            </Link>
          </nav>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EEF6F6] flex items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-[#006655]/20 border-t-[#006655] rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
