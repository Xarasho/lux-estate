"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleAuthCallback() {
      try {
        const code = searchParams.get("code");
        const next = searchParams.get("next") || "/";

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("Error exchanging code for session:", error);
            if (active) setErrorMsg(error.message);
            return;
          }
        }

        // Verify session is established
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace(next);
        } else {
          // Listen once for auth state update (in case implicit hash tokens are processing)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (session && active) {
                subscription.unsubscribe();
                router.replace(next);
              }
            }
          );

          // Fallback timeout
          setTimeout(() => {
            if (active) {
              router.replace(next);
            }
          }, 2500);
        }
      } catch (err: any) {
        console.error("Auth callback exception:", err);
        if (active) setErrorMsg(err.message || "Failed to complete authentication");
      }
    }

    handleAuthCallback();

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background-light text-nordic">
        <div className="bg-surface rounded-2xl shadow-soft p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-rounded text-2xl">error</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Authentication Failed</h2>
          <p className="text-sm text-nordic/70 mb-6">{errorMsg}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light text-nordic">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-nordic/70 font-medium text-sm animate-pulse">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-background-light">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
