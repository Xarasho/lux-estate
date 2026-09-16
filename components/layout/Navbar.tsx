"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface NavbarProps {
  activeNav?: "buy" | "rent" | "sell" | "saved";
  onNavSelect?: (tab: "buy" | "rent" | "sell" | "saved") => void;
}

export function Navbar({ activeNav = "buy", onNavSelect }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(activeNav);

  const handleTabClick = (tab: "buy" | "rent" | "sell" | "saved") => {
    setCurrentTab(tab);
    if (onNavSelect) {
      onNavSelect(tab);
    }
    setMobileMenuOpen(false);
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
              Buy
            </button>
            <button
              onClick={() => handleTabClick("rent")}
              className={`font-medium text-sm px-1 py-1 transition-all ${
                currentTab === "rent"
                  ? "text-mosque border-b-2 border-mosque"
                  : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
              }`}
            >
              Rent
            </button>
            <button
              onClick={() => handleTabClick("sell")}
              className={`font-medium text-sm px-1 py-1 transition-all ${
                currentTab === "sell"
                  ? "text-mosque border-b-2 border-mosque"
                  : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => handleTabClick("saved")}
              className={`font-medium text-sm px-1 py-1 transition-all ${
                currentTab === "saved"
                  ? "text-mosque border-b-2 border-mosque"
                  : "text-nordic-dark/70 hover:text-nordic-dark hover:border-b-2 hover:border-nordic-dark/20"
              }`}
            >
              Saved Homes
            </button>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-4 sm:space-x-6">
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
            <div className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all cursor-pointer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Profile"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAWhQZ663Bd08kmzjbOPmUk4UIxYooNONShMEFXLR-DtmVi6Oz-TiaY77SPwFk7g0OobkeZEOMvt6v29mSOD0Xm2g95WbBG3ZjWXmiABOUwGU0LOySRfVDo-JTXQ0-gtwjWxbmue0qDm91m-zEOEZwAW6iRFB1qC1bAU-wkjxm67Sbztq8w7srHkFT9bVEC86qG-FzhOBTomhAurNRmx9l8Yfqabk328NfdKuVLckgCdaPsNFE3yN65MeoRi05GA_gXIMwG4YDIeA"
                />
              </div>
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
          mobileMenuOpen ? "max-h-60 py-2" : "max-h-0"
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
            Buy
          </button>
          <button
            onClick={() => handleTabClick("rent")}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              currentTab === "rent"
                ? "text-mosque bg-mosque/10"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => handleTabClick("sell")}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              currentTab === "sell"
                ? "text-mosque bg-mosque/10"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            Sell
          </button>
          <button
            onClick={() => handleTabClick("saved")}
            className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
              currentTab === "saved"
                ? "text-mosque bg-mosque/10"
                : "text-nordic-dark hover:bg-black/5"
            }`}
          >
            Saved Homes
          </button>
        </div>
      </div>
    </nav>
  );
}
