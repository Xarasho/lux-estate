"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface AdminPropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
  address?: string;
  onLocationChange?: (lat: number, lng: number) => void;
}

export function AdminPropertyMap({
  lat,
  lng,
  title = "Propiedad",
  address = "",
  onLocationChange,
}: AdminPropertyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);

  // Keep latest callback ref to avoid re-triggering map initialization
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // If map already exists, just update position and return
    if (mapInstanceRef.current && markerRef.current) {
      const currentPos = markerRef.current.getLatLng();
      const diffLat = Math.abs(currentPos.lat - lat);
      const diffLng = Math.abs(currentPos.lng - lng);

      if (diffLat > 0.00001 || diffLng > 0.00001) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng], { animate: true });
      }

      markerRef.current.setPopupContent(`
        <div style="font-family: inherit; padding: 4px 2px; min-width: 140px;">
          <div style="font-size: 10px; font-weight: 700; color: #006655; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Ubicación Seleccionada</div>
          <h4 style="margin: 0 0 2px 0; font-weight: 600; font-size: 13px; color: #19322F;">${title}</h4>
          ${address ? `<div style="color: #5C706D; font-size: 11px; margin-bottom: 4px;">${address}</div>` : ""}
          <div style="font-size: 10px; font-family: monospace; color: #006655; background: #EEF6F6; padding: 2px 6px; border-radius: 4px; display: inline-block;">
            ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
        </div>
      `);
      return;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: false,
    });

    mapInstanceRef.current = map;

    // Zoom control in top right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Luxury CartoDB Voyager tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Custom LuxeEstate Pin marker
    const customIcon = L.divIcon({
      className: "custom-admin-marker",
      html: `
        <div style="
          width: 36px; 
          height: 36px; 
          background: linear-gradient(135deg, #006655 0%, #19322F 100%); 
          border: 3px solid #ffffff; 
          border-radius: 9999px; 
          box-shadow: 0 4px 14px rgba(0, 102, 85, 0.45); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: grab;
          transition: transform 0.15s ease;
        ">
          <span class="material-icons" style="color: #ffffff; font-size: 18px; line-height: 1;">place</span>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    const marker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: true,
      title: "Arrastra el marcador para cambiar las coordenadas",
    }).addTo(map);

    markerRef.current = marker;

    marker.bindPopup(
      `
      <div style="font-family: inherit; padding: 4px 2px; min-width: 140px;">
        <div style="font-size: 10px; font-weight: 700; color: #006655; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Ubicación Seleccionada</div>
        <h4 style="margin: 0 0 2px 0; font-weight: 600; font-size: 13px; color: #19322F;">${title}</h4>
        ${address ? `<div style="color: #5C706D; font-size: 11px; margin-bottom: 4px;">${address}</div>` : ""}
        <div style="font-size: 10px; font-family: monospace; color: #006655; background: #EEF6F6; padding: 2px 6px; border-radius: 4px; display: inline-block;">
          ${lat.toFixed(5)}, ${lng.toFixed(5)}
        </div>
      </div>
    `,
      { closeButton: false }
    );

    // Draggable marker handler
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      const newLat = parseFloat(position.lat.toFixed(6));
      const newLng = parseFloat(position.lng.toFixed(6));
      if (onLocationChangeRef.current) {
        onLocationChangeRef.current(newLat, newLng);
      }
    });

    // Map click handler to set marker location
    map.on("click", (e: L.LeafletMouseEvent) => {
      const newLat = parseFloat(e.latlng.lat.toFixed(6));
      const newLng = parseFloat(e.latlng.lng.toFixed(6));
      marker.setLatLng([newLat, newLng]);
      if (onLocationChangeRef.current) {
        onLocationChangeRef.current(newLat, newLng);
      }
    });

    // Ensure tiles load completely in containers
    const resizeTimeout = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimeout);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [lat, lng, title, address]);

  const handleCenterMarker = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
      markerRef.current.openPopup();
    }
  };

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="space-y-2">
      <div className="relative w-full h-56 rounded-lg overflow-hidden bg-slate-100 border border-gray-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Quick controls top-left */}
        <div className="absolute top-2 left-2 z-[400] flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCenterMarker}
            className="bg-white/95 hover:bg-white text-nordic text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm border border-gray-200/80 hover:border-mosque transition-all flex items-center gap-1 cursor-pointer"
            title="Centrar mapa en el marcador"
          >
            <span className="material-icons text-[13px] text-mosque">my_location</span>
            <span>Centrar</span>
          </button>
        </div>

        {/* Google Maps External link bottom-right */}
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 bg-white/95 hover:bg-white text-[11px] font-medium px-2.5 py-1 rounded shadow-sm text-nordic hover:text-mosque transition-colors z-[400] flex items-center gap-1 border border-gray-200/70"
          title="Ver en Google Maps en una pestaña nueva"
        >
          <span>Google Maps</span>
          <span className="material-icons text-[12px]">open_in_new</span>
        </a>
      </div>

      {/* Helper text explaining drag & click */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 font-sf-pro px-1">
        <div className="flex items-center gap-1 text-nordic/80">
          <span className="material-icons text-xs text-mosque">touch_app</span>
          <span>Haz clic o arrastra el marcador para ajustar la posición</span>
        </div>
        <span className="font-mono text-[10px] bg-hint-green/30 text-nordic px-1.5 py-0.5 rounded">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}

export default AdminPropertyMap;
