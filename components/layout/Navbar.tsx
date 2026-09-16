"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "@/components/auth/AuthProvider";

export interface NavbarProps {
  activeNav?: "buy" | "rent" | "sell" | "saved";
  onNavSelect?: (tab: "buy" | "rent" | "sell" | "saved") => void;
  dict?: Record<string, string>;
}

export function Navbar({ activeNav = "buy", onNavSelect, dict }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeNav);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user, loading, avatarUrl, userName, userEmail, provider, signOut } = useAuth();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab: "buy" | "rent" | "sell" | "saved") => {
    setCurrentTab(tab);
    if (onNavSelect) {
      onNavSelect(tab);
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 cursor-pointer group">
            <Image
              src="/favicon.ico"
              alt="LuxeEstate Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain transition-transform duration-300 group-hover:scale-110"
              priority
            />
            <span className="font-bold text-xl tracking-tight text-nordic-dark">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleTabClick("buy")}
              className={`font-medium text-sm px-1 py-1 transition-all ${
                currentTab === "buy"
                  ? "text-mosque border-b-2 border-mosque"
                  : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
              }`}
            >
              {dict?.buy || "Buy"}
            </button>
            <button
              onClick={() => handleTabClick("rent")}
              className={`font-medium text-sm px-1 py-1 transition-all ${
                currentTab === "rent"
                  ? "text-mosque border-b-2 border-mosque"
                  : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
              }`}
            >
              {dict?.rent || "Rent"}
            </button>
            <button
              onClick={() => handleTabClick("sell")}
              className={`font-medium text-sm px-1 py-1 transition-all ${
                currentTab === "sell"
                  ? "text-mosque border-b-2 border-mosque"
                  : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
              }`}
            >
              {dict?.sell || "Sell"}
            </button>
            <button
              onClick={() => handleTabClick("saved")}
              className={`font-medium text-sm px-1 py-1 transition-all ${
                currentTab === "saved"
                  ? "text-mosque border-b-2 border-mosque"
                  : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
              }`}
            >
              {dict?.saved || "Saved Homes"}
            </button>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            <LanguageSwitcher />
            <button
              aria-label="Search"
              className="text-nordic-dark hover:text-mosque transition-colors p-1"
            >
              <span className="material-icons">search</span>
            </button>
            <button
              aria-label="Notifications"
              className="text-nordic-dark hover:text-mosque transition-colors relative p-1"
            >
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>

            {/* Profile / Auth Area */}
            <div className="relative pl-2 border-l border-nordic-dark/10 ml-1" ref={profileRef}>
              {loading ? (
                <div className="w-9 h-9 rounded-full bg-nordic-dark/10 animate-pulse" />
              ) : user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque focus:ring-mosque transition-all cursor-pointer flex items-center justify-center"
                    aria-label="User profile menu"
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={userName || "User Avatar"}
                        className="w-full h-full object-cover"
                        src={avatarUrl}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-mosque text-white font-semibold text-xs flex items-center justify-center">
                        {(userName || userEmail || "U").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-surface rounded-xl shadow-soft-hover border border-nordic-dark/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-nordic-dark/10">
                        <p className="text-sm font-semibold text-nordic-dark truncate">
                          {userName || "Luxe User"}
                        </p>
                        <p className="text-xs text-nordic-dark/60 truncate mt-0.5">
                          {userEmail}
                        </p>
                        {provider && (
                          <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-hint-of-green/40 text-mosque capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-mosque"></span>
                            Signed in via {provider}
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          href="/login"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-nordic-dark/80 hover:bg-nordic-dark/5 transition-colors"
                        >
                          <span className="material-icons text-base text-nordic-dark/60">
                            switch_account
                          </span>
                          <span>Switch Account</span>
                        </Link>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <span className="material-icons text-base">logout</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 bg-mosque hover:bg-primary-dark text-white text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition-all shadow-sm hover:shadow-soft-hover"
                >
                  <span className="material-icons text-base">login</span>
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-nordic-dark p-1 focus:outline-none"
            >
              <span className="material-icons">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-96 py-3" : "max-h-0"
        }`}
      >
        <div className="px-4 py-2 space-y-1">
          <button
            onClick={() => handleTabClick("buy")}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              currentTab === "buy"
                ? "text-mosque bg-mosque/10"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            {dict?.buy || "Buy"}
          </button>
          <button
            onClick={() => handleTabClick("rent")}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              currentTab === "rent"
                ? "text-mosque bg-mosque/10"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            {dict?.rent || "Rent"}
          </button>
          <button
            onClick={() => handleTabClick("sell")}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              currentTab === "sell"
                ? "text-mosque bg-mosque/10"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            {dict?.sell || "Sell"}
          </button>
          <button
            onClick={() => handleTabClick("saved")}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              currentTab === "saved"
                ? "text-mosque bg-mosque/10"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            {dict?.saved || "Saved Homes"}
          </button>
        </div>

        {/* Mobile Auth Area */}
        <div className="px-4 pt-3 mt-2 border-t border-nordic-dark/10">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={userName || "User Avatar"}
                      className="w-full h-full object-cover"
                      src={avatarUrl}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-mosque text-white font-semibold text-sm flex items-center justify-center">
                      {(userName || userEmail || "U").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-nordic-dark truncate">
                    {userName || "Luxe User"}
                  </p>
                  <p className="text-xs text-nordic-dark/60 truncate">
                    {userEmail}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 bg-red-50 font-medium hover:bg-red-100 transition-colors"
              >
                <span className="material-icons text-base">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-mosque text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <span className="material-icons text-base">login</span>
              <span>Sign In with Google / GitHub</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
