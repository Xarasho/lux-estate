"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { PropertyMapProps } from "./PropertyMap";

const LeafletMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
      <div className="relative w-full aspect-[4/3] rounded-lg bg-slate-100 animate-pulse flex items-center justify-center">
        <div className="text-center space-y-2">
          <span className="material-icons text-mosque/40 text-3xl animate-bounce">
            location_on
          </span>
          <p className="text-xs text-nordic/50 font-medium">Loading map...</p>
        </div>
      </div>
    </div>
  ),
});

export function PropertyMapClient(props: PropertyMapProps) {
  return <LeafletMap {...props} />;
}

export default PropertyMapClient;
