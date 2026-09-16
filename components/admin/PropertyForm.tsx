"use client";

import React, { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Property, PropertyImage } from "@/types/property";
import { createProperty, updateProperty, uploadPropertyImage } from "@/lib/properties";
import { useAuth } from "@/components/auth/AuthProvider";
import { AdminPropertyMapClient } from "./AdminPropertyMapClient";

interface PropertyFormProps {
  initialProperty?: Property | null;
  mode: "create" | "edit";
}

const DEFAULT_AMENITIES = [
  "Swimming Pool",
  "Garden",
  "Air Conditioning",
  "Smart Home",
  "Private Gym",
  "Wine Cellar",
  "Electric Vehicle Charging",
  "Balcony / Terrace",
  "Security System",
  "Ocean View",
];

export function PropertyForm({ initialProperty, mode }: PropertyFormProps) {
  const router = useRouter();
  const { user, userName, userEmail, avatarUrl, role, isAdmin } = useAuth();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialProperty?.title || "");
  const [slug, setSlug] = useState(initialProperty?.slug || "");
  const [price, setPrice] = useState<number | string>(initialProperty?.price ?? "");
  const [pricePeriod, setPricePeriod] = useState<"month" | "year">(
    initialProperty?.pricePeriod || "month"
  );
  const [type, setType] = useState<"sale" | "rent">(initialProperty?.type || "sale");
  const [category, setCategory] = useState<"house" | "apartment" | "villa" | "penthouse">(
    initialProperty?.category || "house"
  );
  const [badge, setBadge] = useState(initialProperty?.badge || "");
  const [isFeatured, setIsFeatured] = useState<boolean>(initialProperty?.isFeatured || false);
  const [isActive, setIsActive] = useState<boolean>(
    initialProperty?.isActive !== undefined ? initialProperty.isActive : true
  );

  // Location
  const [address, setAddress] = useState(initialProperty?.location?.address || "");
  const [city, setCity] = useState(initialProperty?.location?.city || "");
  const [state, setState] = useState(initialProperty?.location?.state || "");
  const [country, setCountry] = useState(initialProperty?.location?.country || "");
  const [lat, setLat] = useState<number | string>(
    initialProperty?.location?.lat !== undefined ? initialProperty.location.lat : ""
  );
  const [lng, setLng] = useState<number | string>(
    initialProperty?.location?.lng !== undefined ? initialProperty.location.lng : ""
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geoFeedback, setGeoFeedback] = useState<string | null>(null);

  const handleDetectCoordinates = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoFeedback("La geolocalización no está soportada en tu navegador.");
      setTimeout(() => setGeoFeedback(null), 4000);
      return;
    }

    setIsLocating(true);
    setGeoFeedback("Obteniendo coordenadas GPS...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = parseFloat(pos.coords.latitude.toFixed(6));
        const detectedLng = parseFloat(pos.coords.longitude.toFixed(6));
        setLat(detectedLat);
        setLng(detectedLng);
        setIsLocating(false);
        setGeoFeedback(`GPS detectado: ${detectedLat}, ${detectedLng}`);
        setTimeout(() => setGeoFeedback(null), 4000);
      },
      (err) => {
        setIsLocating(false);
        setGeoFeedback(`Error GPS: ${err.message}`);
        setTimeout(() => setGeoFeedback(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Features
  const [beds, setBeds] = useState(initialProperty?.features?.beds ?? 3);
  const [baths, setBaths] = useState(initialProperty?.features?.baths ?? 2);
  const [garage, setGarage] = useState(initialProperty?.features?.garage ?? 1);
  const [sqm, setSqm] = useState<number | string>(initialProperty?.features?.sqm ?? "");
  const [yearBuilt, setYearBuilt] = useState<number | string>(
    initialProperty?.features?.yearBuilt ?? 2024
  );

  // Description
  const [description, setDescription] = useState(
    initialProperty?.description ||
      "Discover unparalleled luxury living in this impeccably designed property. Featuring refined finishes, high ceilings, expansive open-concept living spaces, and floor-to-ceiling windows providing abundant natural light."
  );

  // Amenities
  const [amenities, setAmenities] = useState<string[]>(
    initialProperty?.amenities && initialProperty.amenities.length > 0
      ? initialProperty.amenities
      : ["Swimming Pool", "Garden", "Smart Home", "Air Conditioning"]
  );
  const [newAmenity, setNewAmenity] = useState("");

  // Gallery / Images
  const [images, setImages] = useState<PropertyImage[]>(
    initialProperty?.images && initialProperty.images.length > 0
      ? initialProperty.images
      : initialProperty?.imageUrl
      ? [{ url: initialProperty.imageUrl, alt: initialProperty.title, label: "Main Exterior" }]
      : [
          {
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZW0qbk7lfvNbdW7E2-JlNvoGiYxd_IFtXs-LfvSnOmMtH8ioaZBs2p82ENkCdRf_ix_zKpdGhOcuHfniuiBJrRDyErAFReMdAHvRnerfSzOyzSUbKvgYTybWysd6hjrQ4ZHMu3lMROjFcEx5IowvtKFZJy7Wv_AnfQ-q-B48VHLKzKhOvavGIGfN-psB9c2CO70k5peXj1HbAL-Lg-aGaK3jNgUS3Dh3V_zz6GKj4inq3dsGTc_tJsANMwh0G0YovWbq0luzYzNo",
            alt: "Modern living room",
            label: "Main",
          },
          {
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGnTeJvEimHK72pGc1MuGPaIvONj8Rdm3QLjRyBJgP3oiCgMMyc8qfV8wMi19p5gKNkEq-62kf2aYJoYi_G7F4TGlrq49yUgN9czogSRoLrh6JmJLc7Bms2IH1Fbz2miESgV2YQYYq3h99qitC6R9aznMO8RkZOBiooVJlolpHYeDoTvmSKiWvD_JOjJIY5llWA9pDPV_ofQeOff7P_7PSTxwZ7qYKxWhsBnZpaxloAO2cpv3GVrZR65iTrzpDLSgzORU6dyCDScc",
            alt: "Kitchen with marble island",
            label: "Kitchen",
          },
        ]
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Drag & Drop States
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
  const [dragOverImageIndex, setDragOverImageIndex] = useState<number | null>(null);

  // Agent
  const [agentName, setAgentName] = useState(initialProperty?.agent?.name || "Elena Fisher");
  const [agentRole, setAgentRole] = useState(initialProperty?.agent?.role || "Senior Agent");
  const [agentEmail, setAgentEmail] = useState(
    initialProperty?.agent?.email || "elena.fisher@luxeestate.com"
  );
  const [agentPhone, setAgentPhone] = useState(
    initialProperty?.agent?.phone || "+1 (555) 019-2834"
  );

  // Status & Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Image Upload to Supabase Storage
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(`Subiendo 1 de ${files.length}...`);

    try {
      const uploadedImages: PropertyImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Subiendo ${i + 1} de ${files.length} (${file.name})...`);

        const { url, error } = await uploadPropertyImage(file);
        if (error) {
          console.error("Upload error:", error);
          setErrorMessage(`Error al subir ${file.name}: ${error}`);
        } else if (url) {
          uploadedImages.push({
            url,
            alt: title || file.name.replace(/\.[^/.]+$/, ""),
            label: images.length === 0 && uploadedImages.length === 1 ? "Main" : "Gallery",
          });
        }
      }

      if (uploadedImages.length > 0) {
        setImages((prev) => [...prev, ...uploadedImages]);
        setSuccessMessage(`${uploadedImages.length} imagen(es) subidas a Supabase Storage con éxito.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al subir imágenes";
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: urlInput.trim(),
        alt: title || "Property Image",
        label: prev.length === 0 ? "Main" : "Gallery",
      },
    ]);
    setUrlInput("");
    setShowUrlInput(false);
  };

  const handleDeleteImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetMainImage = (indexToMain: number) => {
    setImages((prev) => {
      const target = prev[indexToMain];
      const others = prev.filter((_, idx) => idx !== indexToMain);
      return [
        { ...target, label: "Main" },
        ...others.map((img) => ({ ...img, label: img.label === "Main" ? "Gallery" : img.label })),
      ];
    });
  };

  // Drag & Drop Handlers for File Upload Dropzone
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Drag & Drop Handlers for Reordering Gallery Images
  const handleImageDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverImageIndex !== index) {
      setDragOverImageIndex(index);
    }
  };

  const handleImageDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedImageIndex === null || draggedImageIndex === targetIndex) {
      setDraggedImageIndex(null);
      setDragOverImageIndex(null);
      return;
    }

    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(draggedImageIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((img, idx) => ({
        ...img,
        label: idx === 0 ? "Main" : img.label === "Main" ? "Gallery" : img.label,
      }));
    });

    setDraggedImageIndex(null);
    setDragOverImageIndex(null);
  };

  // Toggle Amenity
  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddCustomAmenity = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (!newAmenity.trim()) return;
    if (!amenities.includes(newAmenity.trim())) {
      setAmenities((prev) => [...prev, newAmenity.trim()]);
    }
    setNewAmenity("");
  };

  // Text formatting helpers for Description
  const applyTextFormat = (wrapper: string) => {
    const textarea = document.getElementById("description") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = description.substring(start, end);

    if (wrapper === "- ") {
      const lines = selected.split("\n").map((line) => `- ${line}`).join("\n");
      const newText = description.substring(0, start) + lines + description.substring(end);
      setDescription(newText);
    } else {
      const newText =
        description.substring(0, start) +
        `${wrapper}${selected || "texto"}${wrapper}` +
        description.substring(end);
      setDescription(newText);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate mandatory fields
    if (!title.trim()) {
      setErrorMessage("El título de la propiedad es obligatorio.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Por favor ingresa un precio válido mayor a 0.");
      return;
    }
    if (!address.trim() || !city.trim()) {
      setErrorMessage("La dirección y la ciudad son obligatorias.");
      return;
    }

    const payload: Partial<Property> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      price: Number(price),
      type,
      pricePeriod: type === "rent" ? pricePeriod : undefined,
      category,
      badge: badge.trim() || (type === "rent" ? "FOR RENT" : "FOR SALE"),
      isFeatured,
      isActive,
      location: {
        address: address.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        lat: lat !== "" && !isNaN(Number(lat)) ? Number(lat) : undefined,
        lng: lng !== "" && !isNaN(Number(lng)) ? Number(lng) : undefined,
      },
      features: {
        beds: Number(beds) || 0,
        baths: Number(baths) || 0,
        garage: Number(garage) || 0,
        sqm: Number(sqm) || 120,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      },
      description: description.trim(),
      amenities,
      images,
      imageUrl: images[0]?.url || "",
      imageAlt: images[0]?.alt || title.trim(),
      agent: {
        name: agentName.trim(),
        role: agentRole.trim(),
        email: agentEmail.trim(),
        phone: agentPhone.trim(),
        photoUrl:
          initialProperty?.agent?.photoUrl ||
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzE14jvdSQ44MQaP8gzILgyZCMmx-euPq-VqTsyA6CaXAiSOXG6q5U6y8ZB2r9FD-8KZcIWy26I3fZ7nhTYrhuOyFQ0ZWUqK11Rr-TPcz9YafIvjcmFEKASnb_RHxJUhsLRjIPf5y9DGE5jLDQf7z_fgAmKilyPC4KxIW4Umx3OKqqVfhNd3L-qEW3wTsiG_DaiWsTsLoiRwtAU_32ZuWR0hx4yZNjYP4AnMsAt0SVdFRnFhIfItaKCukJUh6_Qf4KV1-dN6oKmU",
      },
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          const result = await createProperty(payload);
          if (result.error) {
            const isRls =
              result.error.toLowerCase().includes("row-level security") ||
              result.error.toLowerCase().includes("policy") ||
              result.error.toLowerCase().includes("permission denied");
            if (isRls) {
              setErrorMessage(
                "Error RLS de Supabase: Solo los usuarios con rol 'admin' autenticados tienen permisos para crear o modificar propiedades."
              );
            } else {
              setErrorMessage(result.error);
            }
            return;
          }
          setSuccessMessage("¡Propiedad creada exitosamente en Supabase!");
          setTimeout(() => {
            router.push("/admin?tab=properties");
            router.refresh();
          }, 1200);
        } else if (mode === "edit" && initialProperty?.id) {
          const result = await updateProperty(initialProperty.id, payload);
          if (result.error) {
            const isRls =
              result.error.toLowerCase().includes("row-level security") ||
              result.error.toLowerCase().includes("policy") ||
              result.error.toLowerCase().includes("permission denied");
            if (isRls) {
              setErrorMessage(
                "Error RLS de Supabase: Solo los usuarios con rol 'admin' autenticados tienen permisos para crear o modificar propiedades."
              );
            } else {
              setErrorMessage(result.error);
            }
            return;
          }
          setSuccessMessage("¡Propiedad actualizada exitosamente en Supabase!");
          setTimeout(() => {
            router.push("/admin?tab=properties");
            router.refresh();
          }, 1200);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error durante el guardado";
        setErrorMessage(msg);
      }
    });
  };

  return (
    <div className="min-h-screen bg-clear-day text-nordic selection:bg-hint-green selection:text-nordic pb-24">
      {/* Toast Notifications */}
      {errorMessage && (
        <div className="fixed top-20 right-6 z-50 bg-red-600 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 max-w-md">
          <span className="material-icons text-xl">error_outline</span>
          <p className="text-sm font-medium">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-white/80 hover:text-white"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-20 right-6 z-50 bg-mosque text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 max-w-md">
          <span className="material-icons text-xl">check_circle</span>
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Top Navigation matching code.html */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-12">
              <Link className="flex items-center gap-2 group" href="/admin">
                <div className="w-8 h-8 bg-nordic text-white flex items-center justify-center rounded-lg shadow-sm group-hover:bg-mosque transition-colors">
                  <span className="material-icons text-xl">villa</span>
                </div>
                <span className="text-2xl font-bold tracking-tight text-nordic font-sf-pro">Estates.</span>
              </Link>
              <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-gray-500 font-sf-pro">
                <Link className="hover:text-mosque transition-colors" href="/admin">
                  Dashboard
                </Link>
                <Link className="text-nordic border-b-2 border-mosque pb-1 font-semibold" href="/admin?tab=properties">
                  Listings
                </Link>
                <Link className="hover:text-mosque transition-colors" href="/admin?tab=users">
                  Usuarios
                </Link>
                <Link className="hover:text-mosque transition-colors" href="/#listings">
                  Catálogo
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 text-gray-400 hover:text-nordic transition-colors relative"
                title="Notificaciones"
              >
                <span className="material-icons">notifications_none</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full"></span>
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-nordic leading-tight font-sf-pro">
                    {userName || "Elena Fisher"}
                  </p>
                  <p className="text-xs text-gray-500 font-sf-pro">Senior Agent</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={userName || "Agent"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  src={
                    avatarUrl ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzE14jvdSQ44MQaP8gzILgyZCMmx-euPq-VqTsyA6CaXAiSOXG6q5U6y8ZB2r9FD-8KZcIWy26I3fZ7nhTYrhuOyFQ0ZWUqK11Rr-TPcz9YafIvjcmFEKASnb_RHxJUhsLRjIPf5y9DGE5jLDQf7z_fgAmKilyPC4KxIW4Umx3OKqqVfhNd3L-qEW3wTsiG_DaiWsTsLoiRwtAU_32ZuWR0hx4yZNjYP4AnMsAt0SVdFRnFhIfItaKCukJUh6_Qf4KV1-dN6oKmU"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Supabase RLS Admin Authorization Status Banner */}
        {user && isAdmin ? (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">
                Sesión de Administrador activa ({userEmail || userName})
              </span>
              <span className="text-emerald-600 hidden sm:inline">• Permisos de RLS concedidos para modificar propiedades</span>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
              RLS Admin
            </span>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="material-icons text-amber-600 text-lg flex-shrink-0">security</span>
              <div>
                <p className="font-semibold">Atención con la seguridad RLS</p>
                <p className="text-amber-800/90 text-[11px]">
                  Para guardar o modificar propiedades en Supabase, debes tener una sesión activa con una cuenta con rol <strong>admin</strong>.
                </p>
              </div>
            </div>
            <Link
              href={`/login?next=/admin/properties/${mode === "create" ? "new" : initialProperty?.id || ""}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-colors shadow-xs whitespace-nowrap"
            >
              <span className="material-icons text-xs">login</span>
              <span>Iniciar Sesión Admin</span>
            </Link>
          </div>
        )}

        {/* Header with Breadcrumb */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
          <div className="space-y-3">
            <nav aria-label="Breadcrumb" className="flex">
              <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium font-sf-pro">
                <li>
                  <Link href="/admin?tab=properties" className="hover:text-mosque transition-colors">
                    Properties
                  </Link>
                </li>
                <li>
                  <span className="material-icons text-xs text-gray-400">chevron_right</span>
                </li>
                <li aria-current="page" className="text-nordic font-semibold">
                  {mode === "create" ? "Add New" : `Edit: ${initialProperty?.title || "Property"}`}
                </li>
              </ol>
            </nav>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-nordic tracking-tight mb-2">
                {mode === "create" ? "Add New Property" : "Edit Property"}
              </h1>
              <p className="text-base text-gray-500 max-w-2xl font-normal font-sf-pro">
                Fill in the details below to {mode === "create" ? "create a new listing" : "update this listing"}. Fields marked with * are mandatory.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin?tab=properties"
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-nordic hover:bg-gray-50 transition-colors font-medium font-sf-pro text-sm flex items-center gap-1.5"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-sf-pro text-sm disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-icons text-sm">save</span>
                  <span>{mode === "create" ? "Save Property" : "Update Property"}</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* 12-Column Grid Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols) */}
          <div className="xl:col-span-8 space-y-8">
            {/* 1. Basic Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">info</span>
                </div>
                <h2 className="text-xl font-bold text-nordic">Basic Information</h2>
              </div>
              <div className="p-8 space-y-6">
                {/* Property Title */}
                <div className="group">
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="title">
                    Property Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Modern Penthouse with Ocean View"
                    required
                    className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro"
                  />
                </div>

                {/* Price, Status & Property Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="price">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sf-pro text-sm">$</span>
                      <input
                        id="price"
                        type="number"
                        min="0"
                        step="1000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        required
                        className="w-full pl-7 pr-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-medium font-sf-pro"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="status">
                      Status / Transaction
                    </label>
                    <select
                      id="status"
                      value={type}
                      onChange={(e) => setType(e.target.value as "sale" | "rent")}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer"
                    >
                      <option value="sale">For Sale (En Venta)</option>
                      <option value="rent">For Rent (En Alquiler)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="type">
                      Property Category
                    </label>
                    <select
                      id="type"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as "house" | "apartment" | "villa" | "penthouse")}
                      className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer"
                    >
                      <option value="house">House (Casa)</option>
                      <option value="apartment">Apartment (Departamento)</option>
                      <option value="villa">Villa</option>
                      <option value="penthouse">Penthouse</option>
                    </select>
                  </div>
                </div>

                {/* Optional Period (if Rent), Badge & Featured Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  {type === "rent" ? (
                    <div>
                      <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="pricePeriod">
                        Rent Period
                      </label>
                      <select
                        id="pricePeriod"
                        value={pricePeriod}
                        onChange={(e) => setPricePeriod(e.target.value as "month" | "year")}
                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro cursor-pointer"
                      >
                        <option value="month">Per Month (mes)</option>
                        <option value="year">Per Year (año)</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="badge">
                        Badge / Label
                      </label>
                      <input
                        id="badge"
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="e.g. FOR SALE, NEW, REDUCED"
                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="slug">
                      Custom URL Slug (optional)
                    </label>
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="auto-generated from title"
                      className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 cursor-pointer py-2.5">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-5 h-5 text-mosque border-gray-300 rounded focus:ring-mosque"
                      />
                      <span className="text-sm font-semibold text-nordic font-sf-pro">
                        Destacar Propiedad (Featured)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Publication Status (Active / Inactive) */}
                <div className="pt-4 border-t border-gray-100 mt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/60 dark:bg-gray-800/30 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                        <h4 className="text-sm font-bold text-nordic dark:text-white font-sf-pro">
                          Estado de Publicación: {isActive ? "Activa (Visible)" : "Desactivada (Oculta)"}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-sf-pro">
                        {isActive
                          ? "La propiedad aparece en el catálogo público, HomeScreen y en los filtros de búsqueda."
                          : "La propiedad está desactivada. No aparecerá en HomeScreen ni en búsquedas públicas, pero permanecerá en el panel administrativo."}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mosque"></div>
                      <span className="ml-3 text-xs font-semibold text-nordic dark:text-gray-200 font-sf-pro">
                        {isActive ? "Activa" : "Desactivada"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Description Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">description</span>
                </div>
                <h2 className="text-xl font-bold text-nordic">Description</h2>
              </div>
              <div className="p-8">
                <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
                  <button
                    type="button"
                    onClick={() => applyTextFormat("**")}
                    title="Negrita"
                    className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="material-icons text-lg">format_bold</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormat("*")}
                    title="Cursiva"
                    className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="material-icons text-lg">format_italic</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTextFormat("- ")}
                    title="Lista de viñetas"
                    className="p-1.5 text-gray-400 hover:text-nordic hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="material-icons text-lg">format_list_bulleted</span>
                  </button>
                </div>
                <textarea
                  id="description"
                  rows={7}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  placeholder="Describe the property features, neighborhood, and unique selling points..."
                  className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-sf-pro leading-relaxed resize-y min-h-[200px]"
                ></textarea>
                <div className="mt-2 text-right text-xs text-gray-400 font-sf-pro">
                  {description.length} / 2000 characters
                </div>
              </div>
            </div>

            {/* 3. Gallery Card (Supabase Storage Bucket Upload) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-hint-green/30 flex justify-between items-center bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                    <span className="material-icons text-lg">image</span>
                  </div>
                  <h2 className="text-xl font-bold text-nordic">Gallery</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded font-sf-pro">
                    Supabase Storage: property-images
                  </span>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded font-sf-pro">
                    JPG, PNG, WEBP
                  </span>
                </div>
              </div>
              <div className="p-8">
                {/* Upload Dropzone with Drag & Drop */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer select-none group ${
                    isDraggingOver
                      ? "border-mosque bg-hint-green/30 ring-4 ring-hint-green/60 scale-[1.01]"
                      : isUploading
                      ? "bg-hint-green/20 border-mosque"
                      : "border-gray-300 bg-gray-50/50 hover:bg-hint-green/10 hover:border-mosque/40"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                    <div
                      className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque transition-transform duration-300 ${
                        isDraggingOver ? "scale-125 bg-hint-green" : "group-hover:scale-110"
                      }`}
                    >
                      {isUploading ? (
                        <div className="w-6 h-6 border-2 border-mosque border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="material-icons text-2xl">
                          {isDraggingOver ? "file_download" : "cloud_upload"}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-medium text-nordic font-sf-pro">
                        {isDraggingOver
                          ? "¡Suelta las imágenes aquí para subirlas a Supabase!"
                          : isUploading
                          ? uploadProgress || "Subiendo imágenes a Supabase..."
                          : "Haz clic o arrastra imágenes aquí (Drag & Drop)"}
                      </p>
                      <p className="text-xs text-gray-400 font-sf-pro">
                        {isDraggingOver
                          ? "Soporta JPG, PNG, WEBP, GIF hasta 10MB"
                          : "Sube imágenes directamente a Supabase Storage (Max 10MB)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option to Add by URL */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs font-medium text-mosque hover:underline flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">link</span>
                    <span>{showUrlInput ? "Ocultar opción de URL" : "O agregar imagen mediante URL externa"}</span>
                  </button>
                  <span className="text-xs text-gray-400">
                    {images.length} {images.length === 1 ? "imagen" : "imágenes"} seleccionada(s)
                  </span>
                </div>

                {showUrlInput && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-md focus:ring-1 focus:ring-mosque"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-mosque text-white text-xs font-medium rounded-md hover:bg-nordic transition-colors"
                    >
                      Añadir
                    </button>
                  </div>
                )}

                {/* Thumbnail Grid with Drag and Drop Reordering */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {images.map((img, index) => {
                    const isDragged = draggedImageIndex === index;
                    const isDragOver = dragOverImageIndex === index;

                    return (
                      <div
                        key={index}
                        draggable
                        onDragStart={(e) => handleImageDragStart(e, index)}
                        onDragOver={(e) => handleImageDragOver(e, index)}
                        onDragLeave={() => setDragOverImageIndex(null)}
                        onDrop={(e) => handleImageDrop(e, index)}
                        onDragEnd={() => {
                          setDraggedImageIndex(null);
                          setDragOverImageIndex(null);
                        }}
                        className={`aspect-square rounded-lg overflow-hidden relative group shadow-sm bg-gray-100 cursor-grab active:cursor-grabbing transition-all duration-200 ${
                          isDragged
                            ? "opacity-30 border-2 border-dashed border-mosque scale-95"
                            : isDragOver
                            ? "ring-4 ring-mosque scale-105"
                            : "hover:shadow-md"
                        }`}
                        title="Arrastra para reordenar o cambiar la imagen principal"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.alt || `Property image ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />

                        {/* Drag Indicator on Hover */}
                        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-xs text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="material-icons text-xs block">drag_indicator</span>
                        </div>

                        {/* Hover Action Buttons */}
                        <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(index);
                            }}
                            className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm"
                            title="Eliminar imagen"
                          >
                            <span className="material-icons text-sm">delete</span>
                          </button>
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainImage(index);
                              }}
                              className="w-8 h-8 rounded-full bg-white text-nordic hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
                              title="Hacer Principal"
                            >
                              <span className="material-icons text-sm">star</span>
                            </button>
                          )}
                        </div>

                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm font-sf-pro uppercase tracking-wider pointer-events-none">
                            Main
                          </span>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-mosque hover:border-mosque hover:bg-hint-green/20 transition-all group cursor-pointer"
                  >
                    <span className="material-icons group-hover:scale-110 transition-transform">add</span>
                    <span className="text-xs mt-1 font-medium font-sf-pro">Add More</span>
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5 font-sf-pro">
                  <span className="material-icons text-sm text-mosque">swap_horiz</span>
                  <span>
                    <strong>Drag & Drop:</strong> Puedes arrastrar y soltar las miniaturas para reordenar la galería. La primera foto será la imagen principal.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols) */}
          <div className="xl:col-span-4 space-y-8">
            {/* 4. Location Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">place</span>
                </div>
                <h2 className="text-lg font-bold text-nordic">Location</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="address">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 850 Bellagio Rd"
                    required
                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="city">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Los Angeles"
                      required
                      className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-nordic mb-1.5 font-sf-pro" htmlFor="state">
                      State / Country
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. California, USA"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro"
                    />
                  </div>
                </div>

                {/* Latitude & Longitude Coordinates */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-nordic/80 font-sf-pro flex items-center gap-1.5">
                      <span className="material-icons text-sm text-mosque">explore</span>
                      <span>Coordenadas GPS</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectCoordinates}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-mosque hover:text-nordic transition-colors px-2.5 py-1 rounded-md bg-hint-green/40 hover:bg-hint-green/70 cursor-pointer disabled:opacity-50"
                      title="Obtener coordenadas de tu ubicación actual mediante el GPS del dispositivo"
                    >
                      <span className={`material-icons text-xs ${isLocating ? "animate-spin" : ""}`}>
                        {isLocating ? "refresh" : "my_location"}
                      </span>
                      <span>{isLocating ? "Detectando..." : "Detectar GPS"}</span>
                    </button>
                  </div>

                  {geoFeedback && (
                    <div className="text-xs text-mosque bg-hint-green/25 px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                      <span className="material-icons text-xs">info</span>
                      <span>{geoFeedback}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-nordic mb-1 font-sf-pro" htmlFor="lat">
                        Latitud
                      </label>
                      <div className="relative">
                        <input
                          id="lat"
                          type="number"
                          step="any"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          placeholder="e.g. 37.4419"
                          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-nordic mb-1 font-sf-pro" htmlFor="lng">
                        Longitud
                      </label>
                      <div className="relative">
                        <input
                          id="lng"
                          type="number"
                          step="any"
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          placeholder="e.g. -122.1430"
                          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm font-sf-pro font-mono"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 font-sf-pro">
                    Posiciona con precisión el marcador en el mapa interactivo de la página pública.
                  </p>
                </div>

                {/* Leaflet Map Preview when coordinates are available */}
                {(() => {
                  const numLat = typeof lat === "number" ? lat : parseFloat(String(lat));
                  const numLng = typeof lng === "number" ? lng : parseFloat(String(lng));
                  const hasCoordinates =
                    lat !== "" &&
                    lng !== "" &&
                    !isNaN(numLat) &&
                    !isNaN(numLng) &&
                    numLat >= -90 &&
                    numLat <= 90 &&
                    numLng >= -180 &&
                    numLng <= 180;

                  if (hasCoordinates) {
                    return (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-nordic/80 font-sf-pro flex items-center gap-1.5">
                            <span className="material-icons text-sm text-mosque">map</span>
                            <span>Mapa Interactivo (Leaflet)</span>
                          </label>
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-mosque bg-hint-green/30 px-2 py-0.5 rounded font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>GPS Activo</span>
                          </span>
                        </div>

                        <AdminPropertyMapClient
                          lat={numLat}
                          lng={numLng}
                          title={title || "Nueva Propiedad"}
                          address={address ? `${address}${city ? `, ${city}` : ""}` : city}
                          onLocationChange={(newLat, newLng) => {
                            setLat(newLat);
                            setLng(newLng);
                          }}
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="relative rounded-xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-gray-50/80 to-hint-green/10 p-5 text-center transition-all hover:border-mosque/40">
                      <div className="w-12 h-12 mx-auto rounded-full bg-hint-green/50 text-mosque flex items-center justify-center mb-2.5 shadow-xs">
                        <span className="material-icons text-2xl">pin_drop</span>
                      </div>
                      <h3 className="text-sm font-bold text-nordic font-sf-pro mb-1">
                        Mapa Leaflet Pendiente
                      </h3>
                      <p className="text-xs text-gray-500 font-sf-pro max-w-xs mx-auto mb-3.5 leading-relaxed">
                        Ingresa la latitud y longitud en los campos superiores o pulsa &quot;Detectar GPS&quot; para visualizar la propiedad en el mapa interactivo.
                      </p>
                      <button
                        type="button"
                        onClick={handleDetectCoordinates}
                        disabled={isLocating}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-mosque hover:bg-nordic px-3.5 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <span className={`material-icons text-sm ${isLocating ? "animate-spin" : ""}`}>
                          {isLocating ? "refresh" : "my_location"}
                        </span>
                        <span>{isLocating ? "Detectando GPS..." : "Detectar Coordenadas GPS"}</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 5. Details Card (Sticky) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
                <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                  <span className="material-icons text-lg">straighten</span>
                </div>
                <h2 className="text-lg font-bold text-nordic">Details</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block" htmlFor="area">
                      Area (m²)
                    </label>
                    <input
                      id="area"
                      type="number"
                      min="0"
                      value={sqm}
                      onChange={(e) => setSqm(e.target.value)}
                      placeholder="0"
                      className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro text-sm"
                    />
                  </div>
                  <div className="group">
                    <label className="text-xs text-gray-500 font-medium font-sf-pro mb-1 block" htmlFor="year">
                      Year Built
                    </label>
                    <input
                      id="year"
                      type="number"
                      min="1800"
                      max="2030"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      placeholder="YYYY"
                      className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 text-nordic focus:bg-white focus:ring-1 focus:ring-mosque focus:border-mosque transition-all font-sf-pro text-sm"
                    />
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Counters for Bedrooms, Bathrooms, Garage */}
                <div className="space-y-4">
                  {/* Bedrooms */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-nordic font-sf-pro flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-sm">bed</span> Bedrooms
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setBeds((b) => Math.max(0, b - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={beds}
                        className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium font-sf-pro"
                      />
                      <button
                        type="button"
                        onClick={() => setBeds((b) => b + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Bathrooms */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-nordic font-sf-pro flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-sm">shower</span> Bathrooms
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setBaths((b) => Math.max(0, b - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={baths}
                        className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium font-sf-pro"
                      />
                      <button
                        type="button"
                        onClick={() => setBaths((b) => b + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Parking / Garage */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-nordic font-sf-pro flex items-center gap-2">
                      <span className="material-icons text-gray-400 text-sm">directions_car</span> Parking
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                      <button
                        type="button"
                        onClick={() => setGarage((g) => Math.max(0, g - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        readOnly
                        value={garage}
                        className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:ring-0 text-sm font-medium font-sf-pro"
                      />
                      <button
                        type="button"
                        onClick={() => setGarage((g) => g + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Amenities */}
                <div>
                  <h3 className="font-bold text-nordic mb-3 font-sf-pro uppercase tracking-wider text-xs text-gray-500">
                    Amenities
                  </h3>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {DEFAULT_AMENITIES.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={amenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque"
                        />
                        <span className="text-sm text-gray-700 font-sf-pro group-hover:text-nordic transition-colors">
                          {amenity}
                        </span>
                      </label>
                    ))}
                    {amenities
                      .filter((a) => !DEFAULT_AMENITIES.includes(a))
                      .map((custom) => (
                        <label key={custom} className="flex items-center justify-between gap-2.5 cursor-pointer group">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => toggleAmenity(custom)}
                              className="w-4 h-4 text-mosque border-gray-300 rounded focus:ring-mosque"
                            />
                            <span className="text-sm text-gray-700 font-sf-pro group-hover:text-nordic transition-colors">
                              {custom}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleAmenity(custom)}
                            className="text-gray-400 hover:text-red-500 text-xs"
                          >
                            <span className="material-icons text-xs">close</span>
                          </button>
                        </label>
                      ))}
                  </div>

                  {/* Add Custom Amenity Tag */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-1.5">
                    <input
                      type="text"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyDown={handleAddCustomAmenity}
                      placeholder="Add custom amenity..."
                      className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded focus:ring-1 focus:ring-mosque"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomAmenity}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-hint-green text-nordic text-xs font-medium rounded transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Agent Card */}
                <div>
                  <h3 className="font-bold text-nordic mb-3 font-sf-pro uppercase tracking-wider text-xs text-gray-500">
                    Assigned Agent
                  </h3>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        initialProperty?.agent?.photoUrl ||
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzE14jvdSQ44MQaP8gzILgyZCMmx-euPq-VqTsyA6CaXAiSOXG6q5U6y8ZB2r9FD-8KZcIWy26I3fZ7nhTYrhuOyFQ0ZWUqK11Rr-TPcz9YafIvjcmFEKASnb_RHxJUhsLRjIPf5y9DGE5jLDQf7z_fgAmKilyPC4KxIW4Umx3OKqqVfhNd3L-qEW3wTsiG_DaiWsTsLoiRwtAU_32ZuWR0hx4yZNjYP4AnMsAt0SVdFRnFhIfItaKCukJUh6_Qf4KV1-dN6oKmU"
                      }
                      alt="Agent photo"
                      className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                    />
                    <div className="overflow-hidden">
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="Agent Name"
                        className="text-xs font-bold text-nordic bg-transparent border-none p-0 focus:ring-0 w-full"
                      />
                      <input
                        type="text"
                        value={agentRole}
                        onChange={(e) => setAgentRole(e.target.value)}
                        placeholder="Agent Role"
                        className="text-[11px] text-gray-500 bg-transparent border-none p-0 focus:ring-0 w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Fixed Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
            <Link
              href="/admin?tab=properties"
              className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-nordic font-medium font-sf-pro text-center text-sm"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-3 rounded-lg bg-mosque text-white font-medium font-sf-pro flex justify-center items-center gap-2 text-sm disabled:opacity-50"
            >
              {isPending ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span className="material-icons text-sm">save</span>
                  <span>{mode === "create" ? "Save" : "Update"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-12 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-400 font-sf-pro">
          © {new Date().getFullYear()} Estates Real Estate Inc. All rights reserved. <br />
          <span className="mt-2 block text-gray-300">Designed for modern agencies.</span>
        </div>
      </footer>
    </div>
  );
}
