"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";

interface AdminNavbarProps {
  activeTab: "properties" | "users";
  onTabChange: (tab: "properties" | "users") => void;
}

export function AdminNavbar({ activeTab, onTabChange }: AdminNavbarProps) {
  const { user, userName, userEmail, avatarUrl, role, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#152e2a]/95 border-b border-nordic/10 dark:border-primary/20 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/favicon.ico"
                alt="LuxeEstate"
                width={28}
                height={28}
                className="w-7 h-7 rounded-lg object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-nordic dark:text-white tracking-tight">
                  LuxeEstate
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary text-white tracking-wide uppercase">
                  Admin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Tabs */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                type="button"
                onClick={() => onTabChange("properties")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === "properties"
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-300 font-semibold"
                    : "text-nordic/70 hover:text-nordic hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                <span className="material-icons text-lg">apartment</span>
                <span>Propiedades</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange("users")}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-emerald-300 font-semibold"
                    : "text-nordic/70 hover:text-nordic hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/5"
                }`}
              >
                <span className="material-icons text-lg">group</span>
                <span>Usuarios & Roles</span>
              </button>
            </div>
          </div>

          {/* Right Side: Back to site & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-nordic/70 dark:text-gray-300 hover:text-primary px-3 py-1.5 rounded-lg border border-nordic/10 dark:border-gray-700 hover:border-primary/40 transition-colors"
            >
              <span className="material-icons text-base">arrow_back</span>
              <span>Ir a la Web</span>
            </Link>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-semibold text-nordic dark:text-white truncate max-w-[140px]">
                  {userName || "Admin User"}
                </span>
                <span className="text-[10px] text-primary dark:text-emerald-400 font-medium capitalize">
                  {role || "Administrator"}
                </span>
              </div>

              <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-primary/20 flex-shrink-0 flex items-center justify-center">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={userName || "Profile"}
                    src={avatarUrl}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-primary text-white font-semibold text-xs flex items-center justify-center">
                    {(userName || userEmail || "AD").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Cerrar sesión"
              >
                <span className="material-icons text-lg">logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="sm:hidden flex items-center gap-2 py-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => onTabChange("properties")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md ${
              activeTab === "properties"
                ? "bg-primary text-white"
                : "text-nordic/70 bg-black/5 dark:bg-white/5"
            }`}
          >
            <span className="material-icons text-base">apartment</span>
            <span>Propiedades</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("users")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md ${
              activeTab === "users"
                ? "bg-primary text-white"
                : "text-nordic/70 bg-black/5 dark:bg-white/5"
            }`}
          >
            <span className="material-icons text-base">group</span>
            <span>Usuarios</span>
          </button>
          <Link
            href="/"
            className="px-2.5 py-1.5 text-xs font-medium text-nordic/70 bg-black/5 rounded-md flex items-center justify-center"
          >
            <span className="material-icons text-base">home</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
