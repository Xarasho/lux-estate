"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { AdminPropertyMapProps } from "./AdminPropertyMap";

const LeafletAdminMap = dynamic(() => import("./AdminPropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-56 rounded-lg bg-slate-100 animate-pulse border border-gray-200 flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 rounded-full bg-hint-green/50 flex items-center justify-center text-mosque mb-2">
        <span className="material-icons text-xl animate-bounce">location_on</span>
      </div>
      <p className="text-xs text-nordic/70 font-medium font-sf-pro">
        Cargando mapa interactivo...
      </p>
      <span className="text-[10px] text-gray-400 font-mono mt-0.5">Leaflet Engine</span>
    </div>
  ),
});

export function AdminPropertyMapClient(props: AdminPropertyMapProps) {
  return <LeafletAdminMap {...props} />;
}

export default AdminPropertyMapClient;
