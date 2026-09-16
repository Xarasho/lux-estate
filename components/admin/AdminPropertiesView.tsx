"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Property } from "@/types/property";

interface AdminPropertiesViewProps {
  initialProperties: Property[];
}

export function AdminPropertiesView({ initialProperties }: AdminPropertiesViewProps) {
  const [properties] = useState<Property[]>(initialProperties);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);

  // Filter properties based on search and category
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const matchesSearch =
        !searchTerm.trim() ||
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        prop.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesType =
        selectedType === "all" ||
        prop.type?.toLowerCase() === selectedType.toLowerCase();

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [properties, searchTerm, selectedCategory, selectedType]);

  // Metric stats
  const totalCount = properties.length;
  const featuredCount = properties.filter((p) => p.isFeatured).length;
  const rentCount = properties.filter((p) => p.type === "rent").length;
  const saleCount = properties.filter((p) => p.type === "sale").length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nordic dark:text-white tracking-tight">
            Propiedades del Portafolio
          </h1>
          <p className="text-nordic/60 dark:text-gray-400 mt-1 text-sm">
            Supervisa el inventario actual de propiedades, disponibilidad y valores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#listings"
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-primary/20 transition-all inline-flex items-center gap-2"
          >
            <span className="material-icons text-base">explore</span>
            <span>Explorar en Catálogo</span>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-nordic/60 dark:text-gray-400">
              Total Propiedades
            </p>
            <p className="text-2xl font-bold text-nordic dark:text-white mt-1">
              {totalCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-icons">apartment</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-nordic/60 dark:text-gray-400">
              En Venta
            </p>
            <p className="text-2xl font-bold text-nordic dark:text-white mt-1">
              {saleCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-hint-green/50 flex items-center justify-center text-primary">
            <span className="material-icons">sell</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-nordic/60 dark:text-gray-400">
              En Alquiler
            </p>
            <p className="text-2xl font-bold text-nordic dark:text-white mt-1">
              {rentCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
            <span className="material-icons">key</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-nordic/60 dark:text-gray-400">
              Destacadas
            </p>
            <p className="text-2xl font-bold text-nordic dark:text-white mt-1">
              {featuredCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <span className="material-icons">star</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#152e2a] rounded-xl p-4 border border-nordic/10 dark:border-primary/20 shadow-soft flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nordic/40">
            <span className="material-icons text-lg">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, ciudad o calle..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-nordic dark:text-white placeholder:text-nordic/40 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-nordic"
            >
              <span className="material-icons text-sm">close</span>
            </button>
          )}
        </div>

        {/* Category & Type Selectors */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-nordic dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas las categorías</option>
            <option value="house">Casa (House)</option>
            <option value="apartment">Apartamento (Apartment)</option>
            <option value="villa">Villa</option>
            <option value="penthouse">Penthouse</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-nordic dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todo tipo</option>
            <option value="sale">Venta</option>
            <option value="rent">Alquiler</option>
          </select>

          <span className="text-xs text-nordic/50 whitespace-nowrap pl-2">
            Mostrando {filteredProperties.length} de {totalCount}
          </span>
        </div>
      </div>

      {/* Property List Container */}
      <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-soft border border-gray-200 dark:border-primary/20 overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/70 dark:bg-primary/5 border-b border-gray-100 dark:border-primary/10 text-xs font-semibold text-nordic/60 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-6">Detalles de la Propiedad</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Estado / Categoría</div>
          <div className="col-span-2 text-right">Acciones</div>
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons text-4xl text-nordic/30 mb-2">apartment</span>
            <p className="text-base font-semibold text-nordic dark:text-white">
              No se encontraron propiedades
            </p>
            <p className="text-xs text-nordic/60 dark:text-gray-400 mt-1">
              Prueba modificando los filtros de búsqueda o categoría.
            </p>
          </div>
        ) : (
          filteredProperties.map((property) => {
            const imageUrl =
              property.imageUrl ||
              property.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80";

            return (
              <div
                key={property.id}
                className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 dark:border-primary/10 hover:bg-background-light/60 dark:hover:bg-primary/5 transition-colors items-center"
              >
                {/* Details */}
                <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                  <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-base font-bold text-nordic dark:text-white group-hover:text-primary transition-colors truncate">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {property.location?.address}, {property.location?.city}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[14px]">bed</span>
                        <span>{property.features?.beds || 0} Camas</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[14px]">bathtub</span>
                        <span>{property.features?.baths || 0} Baños</span>
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{property.features?.sqm || 0} m²</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-6 md:col-span-2">
                  <div className="text-base font-semibold text-nordic dark:text-gray-200">
                    {formatPrice(property.price)}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {property.type === "rent"
                      ? `Renta / ${property.pricePeriod || "mes"}`
                      : "Precio de Venta"}
                  </div>
                </div>

                {/* Status / Category */}
                <div className="col-span-6 md:col-span-2 flex flex-wrap gap-1.5 items-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-hint-green text-primary border border-primary/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                    Activa
                  </span>
                  {property.isFeatured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                      Destacada
                    </span>
                  )}
                  <span className="capitalize text-[11px] text-gray-400 block w-full mt-0.5">
                    {property.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewProperty(property)}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all"
                    title="Vista Rápida"
                  >
                    <span className="material-icons text-xl">visibility</span>
                  </button>

                  <Link
                    href={`/propiedades/${property.slug || property.id}`}
                    target="_blank"
                    className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all"
                    title="Ver en Sitio Web"
                  >
                    <span className="material-icons text-xl">open_in_new</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#152e2a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-primary/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-semibold uppercase text-primary tracking-wider">
                  {previewProperty.category} • {previewProperty.type === "rent" ? "Alquiler" : "Venta"}
                </span>
                <h2 className="text-2xl font-bold text-nordic dark:text-white mt-1">
                  {previewProperty.title}
                </h2>
                <p className="text-xs text-nordic/60 dark:text-gray-400">
                  {previewProperty.location?.address}, {previewProperty.location?.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewProperty(null)}
                className="p-2 text-gray-400 hover:text-nordic rounded-lg"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Main Image */}
            <div className="relative h-64 w-full rounded-xl overflow-hidden mb-4 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewProperty.imageUrl || previewProperty.images?.[0]?.url}
                alt={previewProperty.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Price & Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-background-light dark:bg-primary/10 mb-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Precio</span>
                <p className="font-bold text-nordic dark:text-white text-base">
                  {formatPrice(previewProperty.price)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Habitaciones</span>
                <p className="font-semibold text-nordic dark:text-white">
                  {previewProperty.features?.beds} camas
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Baños</span>
                <p className="font-semibold text-nordic dark:text-white">
                  {previewProperty.features?.baths} baños
                </p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase">Área</span>
                <p className="font-semibold text-nordic dark:text-white">
                  {previewProperty.features?.sqm} m²
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-nordic/60 dark:text-gray-400 mb-1">
                Descripción
              </h4>
              <p className="text-xs sm:text-sm text-nordic/80 dark:text-gray-300 leading-relaxed">
                {previewProperty.description}
              </p>
            </div>

            {/* Amenities */}
            {previewProperty.amenities && previewProperty.amenities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-nordic/60 dark:text-gray-400 mb-2">
                  Amenidades
                </h4>
                <div className="flex flex-wrap gap-2">
                  {previewProperty.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs bg-gray-100 dark:bg-white/10 text-nordic dark:text-white"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setPreviewProperty(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-nordic dark:text-gray-300 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <Link
                href={`/propiedades/${previewProperty.slug || previewProperty.id}`}
                target="_blank"
                className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <span>Ver Publicación Completa</span>
                <span className="material-icons text-sm">open_in_new</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
