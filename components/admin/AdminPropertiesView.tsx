"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Property } from "@/types/property";
import { togglePropertyActive } from "@/lib/properties";

interface AdminPropertiesViewProps {
  initialProperties: Property[];
}

export function AdminPropertiesView({ initialProperties }: AdminPropertiesViewProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);

  // Status & action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmDeactivateProperty, setConfirmDeactivateProperty] = useState<Property | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Filter properties based on search, category, type, and status
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

      const isPropActive = prop.isActive !== false;
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && isPropActive) ||
        (selectedStatus === "inactive" && !isPropActive);

      return matchesSearch && matchesCategory && matchesType && matchesStatus;
    });
  }, [properties, searchTerm, selectedCategory, selectedType, selectedStatus]);

  // Metric stats
  const totalCount = properties.length;
  const activeCount = properties.filter((p) => p.isActive !== false).length;
  const inactiveCount = properties.filter((p) => p.isActive === false).length;
  const featuredCount = properties.filter((p) => p.isFeatured).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleToggleActive = async (prop: Property) => {
    const newActive = prop.isActive === false ? true : false;
    setActionLoadingId(prop.id);
    try {
      const { success, error } = await togglePropertyActive(prop.id, newActive);
      if (success) {
        setProperties((prev) =>
          prev.map((p) => (p.id === prop.id ? { ...p, isActive: newActive } : p))
        );
        setNotification({
          message: newActive
            ? `Propiedad "${prop.title}" activada con éxito. Ya está visible en el catálogo.`
            : `Propiedad "${prop.title}" desactivada con éxito. Ya no aparecerá en el catálogo ni en búsquedas.`,
          type: "success",
        });
        setTimeout(() => setNotification(null), 4000);
      } else {
        setNotification({
          message: error || "Error al cambiar el estado de la propiedad.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar estado";
      setNotification({
        message: msg,
        type: "error",
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setActionLoadingId(null);
      setConfirmDeactivateProperty(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-20 right-6 z-50 text-white px-5 py-3.5 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 max-w-md ${
            notification.type === "success" ? "bg-mosque" : "bg-red-600"
          }`}
        >
          <span className="material-icons text-xl">
            {notification.type === "success" ? "check_circle" : "error_outline"}
          </span>
          <p className="text-sm font-medium">{notification.message}</p>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="ml-auto text-white/80 hover:text-white"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nordic dark:text-white tracking-tight">
            Propiedades del Portafolio
          </h1>
          <p className="text-nordic/60 dark:text-gray-400 mt-1 text-sm">
            Supervisa el inventario actual de propiedades, disponibilidad, estado y valores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties/new"
            className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span className="material-icons text-base">add_circle_outline</span>
            <span>Nueva Propiedad</span>
          </Link>

          <Link
            href="/#listings"
            className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-nordic dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2"
          >
            <span className="material-icons text-base">explore</span>
            <span>Catálogo</span>
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
              Activas (Catálogo)
            </p>
            <p className="text-2xl font-bold text-nordic dark:text-white mt-1">
              {activeCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-hint-green/50 flex items-center justify-center text-primary">
            <span className="material-icons">check_circle</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-nordic/60 dark:text-gray-400">
              Desactivadas (Ocultas)
            </p>
            <p className="text-2xl font-bold text-nordic dark:text-white mt-1">
              {inactiveCount}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <span className="material-icons">pause_circle_outline</span>
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
          <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
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

        {/* Category, Type & Status Selectors */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-background-light dark:bg-gray-800 text-nordic dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo Activas</option>
            <option value="inactive">Solo Desactivadas</option>
          </select>

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
              Prueba modificando los filtros de búsqueda, estado o categoría.
            </p>
          </div>
        ) : (
          filteredProperties.map((property) => {
            const imageUrl =
              property.imageUrl ||
              property.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80";

            const isPropActive = property.isActive !== false;

            return (
              <div
                key={property.id}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 dark:border-primary/10 hover:bg-background-light/60 dark:hover:bg-primary/5 transition-colors items-center ${
                  !isPropActive ? "bg-amber-50/30 dark:bg-amber-950/10" : ""
                }`}
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
                    {!isPropActive && (
                      <span className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        Oculta
                      </span>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-base font-bold text-nordic dark:text-white group-hover:text-primary transition-colors truncate flex items-center gap-2">
                      <span className="truncate">{property.title}</span>
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
                  {isPropActive ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-hint-green text-primary border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5"></span>
                      Desactivada
                    </span>
                  )}
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
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1.5">
                  {/* Quick Toggle Active / Deactivate */}
                  {isPropActive ? (
                    <button
                      type="button"
                      disabled={actionLoadingId === property.id}
                      onClick={() => setConfirmDeactivateProperty(property)}
                      className="p-2 rounded-lg text-amber-700 dark:text-amber-400 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all disabled:opacity-50"
                      title="Desactivar propiedad (ocultar de la web y búsquedas)"
                    >
                      <span className="material-icons text-lg">pause_circle_outline</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoadingId === property.id}
                      onClick={() => handleToggleActive(property)}
                      className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50"
                      title="Activar propiedad (mostrar en catálogo)"
                    >
                      <span className="material-icons text-lg">play_circle_outline</span>
                    </button>
                  )}

                  <Link
                    href={`/admin/properties/${property.id}/edit`}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-mosque hover:bg-hint-green/30 transition-all"
                    title="Editar Propiedad"
                  >
                    <span className="material-icons text-lg">edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setPreviewProperty(property)}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all"
                    title="Vista Rápida"
                  >
                    <span className="material-icons text-lg">visibility</span>
                  </button>

                  <Link
                    href={`/propiedades/${property.slug || property.id}`}
                    target="_blank"
                    className={`p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all ${
                      !isPropActive ? "opacity-50" : ""
                    }`}
                    title={
                      !isPropActive
                        ? "Ver en Sitio Web (desactivada al público)"
                        : "Ver en Sitio Web"
                    }
                  >
                    <span className="material-icons text-lg">open_in_new</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Deactivation */}
      {confirmDeactivateProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#152e2a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 dark:border-amber-900/50">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center mb-4">
              <span className="material-icons text-2xl">pause_circle_outline</span>
            </div>
            <h3 className="text-lg font-bold text-nordic dark:text-white">
              ¿Desactivar propiedad?
            </h3>
            <p className="text-sm text-nordic/70 dark:text-gray-300 mt-2">
              La propiedad <strong>{confirmDeactivateProperty.title}</strong> dejará de aparecer en el HomeScreen, catálogo público y filtros de búsqueda.
            </p>
            <p className="text-xs text-nordic/50 dark:text-gray-400 mt-2">
              No se eliminará de la base de datos; seguirá visible en este panel de administración para futuras actualizaciones y reactivaciones.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                disabled={actionLoadingId === confirmDeactivateProperty.id}
                onClick={() => setConfirmDeactivateProperty(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-nordic dark:text-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={actionLoadingId === confirmDeactivateProperty.id}
                onClick={() => handleToggleActive(confirmDeactivateProperty)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-sm flex items-center gap-1.5"
              >
                {actionLoadingId === confirmDeactivateProperty.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Desactivando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-sm">pause</span>
                    <span>Desactivar Propiedad</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#152e2a] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-primary/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase text-primary tracking-wider">
                    {previewProperty.category} • {previewProperty.type === "rent" ? "Alquiler" : "Venta"}
                  </span>
                  {previewProperty.isActive !== false ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-hint-green text-primary border border-primary/20">
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Desactivada
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-nordic dark:text-white mt-1">
                  {previewProperty.title}
                </h2>
                <p className="text-xs text-nordic/60 dark:text-gray-400 flex items-center gap-2 flex-wrap mt-0.5">
                  <span>{previewProperty.location?.address}, {previewProperty.location?.city}</span>
                  {previewProperty.location?.lat !== undefined && previewProperty.location?.lng !== undefined && (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      <span className="material-icons text-[10px]">gps_fixed</span>
                      {Number(previewProperty.location.lat).toFixed(4)}, {Number(previewProperty.location.lng).toFixed(4)}
                    </span>
                  )}
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
                href={`/admin/properties/${previewProperty.id}/edit`}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-mosque text-white hover:bg-nordic inline-flex items-center gap-1.5 transition-colors"
              >
                <span className="material-icons text-sm">edit</span>
                <span>Editar Propiedad</span>
              </Link>
              <Link
                href={`/propiedades/${previewProperty.slug || previewProperty.id}`}
                target="_blank"
                className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                <span>Ver en Web</span>
                <span className="material-icons text-sm">open_in_new</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
