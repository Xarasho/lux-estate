"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSearch } from "@/components/home/HeroSearch";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { MarketSection } from "@/components/home/MarketSection";
import { SearchFiltersModal, FilterValues } from "@/components/home/SearchFiltersModal";
import { Property } from "@/types/property";

export interface HomeScreenProps {
  featuredProperties: Property[];
  marketProperties: Property[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  activeType: "all" | "sale" | "rent";
  activeCategory: string;
  activeSearch: string;
  activeMinPrice?: number;
  activeMaxPrice?: number;
  activeBeds?: number;
  activeBaths?: number;
  activeAmenities?: string[];
}

export function HomeScreen({
  featuredProperties,
  marketProperties,
  totalPages,
  currentPage,
  totalCount,
  activeType,
  activeCategory,
  activeSearch,
  activeMinPrice,
  activeMaxPrice,
  activeBeds,
  activeBaths,
  activeAmenities = [],
}: HomeScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Local UI state
  const [activeNav, setActiveNav] = useState<"buy" | "rent" | "sell" | "saved">(
    activeType === "sale" ? "buy" : activeType === "rent" ? "rent" : "buy"
  );
  const [searchQuery, setSearchQuery] = useState(activeSearch);
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync external search change
  useEffect(() => {
    setSearchQuery(activeSearch);
  }, [activeSearch]);

  useEffect(() => {
    setSelectedCategory(activeCategory);
  }, [activeCategory]);

  // Count how many filters are currently active
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (activeMinPrice && activeMinPrice > 0) count++;
    if (activeMaxPrice && activeMaxPrice > 0 && activeMaxPrice < 15000000) count++;
    if (activeCategory && activeCategory !== "all") count++;
    if (activeBeds && activeBeds > 0) count++;
    if (activeBaths && activeBaths > 0) count++;
    if (activeAmenities && activeAmenities.length > 0) count += activeAmenities.length;
    return count;
  }, [activeMinPrice, activeMaxPrice, activeCategory, activeBeds, activeBaths, activeAmenities]);

  // Helper to build URL with updated params
  const buildUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset page when filters change
    if (!("page" in overrides)) {
      params.set("page", "1");
    }
    return `${pathname}?${params.toString()}`;
  };

  // Navigation (Buy/Rent) → updates type filter in URL
  const handleNavSelect = (tab: "buy" | "rent" | "sell" | "saved") => {
    setActiveNav(tab);
    const typeMap: Record<string, string> = {
      buy: "sale",
      rent: "rent",
      sell: "all",
      saved: "all",
    };
    startTransition(() => {
      router.push(buildUrl({ type: typeMap[tab] }), { scroll: false });
    });
  };

  // Market filter tabs (All / Buy / Rent)
  const handleFilterChange = (filter: "all" | "sale" | "rent") => {
    startTransition(() => {
      router.push(buildUrl({ type: filter }), { scroll: false });
    });
  };

  // Search — debounced via local state, push to URL on Enter / icon click
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = () => {
    startTransition(() => {
      router.push(buildUrl({ search: searchQuery }), { scroll: false });
    });
  };

  // Category filter
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    startTransition(() => {
      router.push(buildUrl({ category }), { scroll: false });
    });
  };

  // Handle applied filters from modal
  const handleApplyFilters = (values: FilterValues) => {
    setSearchQuery(values.location);
    setSelectedCategory(values.category);
    startTransition(() => {
      const overrides: Record<string, string> = {
        search: values.location || "",
        category: values.category || "all",
        minPrice: values.minPrice ? String(values.minPrice) : "",
        maxPrice: values.maxPrice ? String(values.maxPrice) : "",
        beds: values.beds ? String(values.beds) : "",
        baths: values.baths ? String(values.baths) : "",
        amenities: values.amenities.length > 0 ? values.amenities.join(",") : "",
        page: "1",
      };
      router.push(buildUrl(overrides), { scroll: false });
    });
  };

  // Clear all filters action
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    startTransition(() => {
      router.push(
        buildUrl({
          search: "",
          category: "all",
          minPrice: "",
          maxPrice: "",
          beds: "",
          baths: "",
          amenities: "",
          page: "1",
        }),
        { scroll: false }
      );
    });
  };

  // Filtered featured: still done client-side since all featured are loaded at once
  const filteredFeatured = useMemo(() => {
    return featuredProperties.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [featuredProperties, searchQuery, selectedCategory]);

  const modalInitialValues: FilterValues = useMemo(
    () => ({
      location: searchQuery || activeSearch || "",
      minPrice: activeMinPrice,
      maxPrice: activeMaxPrice,
      category: selectedCategory || "all",
      beds: activeBeds,
      baths: activeBaths,
      amenities: activeAmenities || [],
    }),
    [
      searchQuery,
      activeSearch,
      activeMinPrice,
      activeMaxPrice,
      selectedCategory,
      activeBeds,
      activeBaths,
      activeAmenities,
    ]
  );

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar activeNav={activeNav} onNavSelect={handleNavSelect} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-grow">
        {/* Hero & Search Section */}
        <HeroSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          onToggleFilters={() => setIsFilterModalOpen(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Active Filters Summary Bar (if any filters applied) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 -mt-2 animate-fade-in">
            <span className="text-xs font-semibold uppercase tracking-wider text-nordic-muted mr-1">
              Active Filters:
            </span>
            {activeMinPrice && activeMinPrice > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-nordic-dark/10 rounded-full text-xs font-medium text-nordic-dark shadow-xs">
                Min ${(activeMinPrice / 1000000).toFixed(1)}M
              </span>
            )}
            {activeMaxPrice && activeMaxPrice > 0 && activeMaxPrice < 15000000 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-nordic-dark/10 rounded-full text-xs font-medium text-nordic-dark shadow-xs">
                Max ${(activeMaxPrice / 1000000).toFixed(1)}M
              </span>
            )}
            {activeBeds && activeBeds > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-nordic-dark/10 rounded-full text-xs font-medium text-nordic-dark shadow-xs">
                {activeBeds}+ Beds
              </span>
            )}
            {activeBaths && activeBaths > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-nordic-dark/10 rounded-full text-xs font-medium text-nordic-dark shadow-xs">
                {activeBaths}+ Baths
              </span>
            )}
            {activeAmenities &&
              activeAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#006611]/10 text-[#006611] border border-[#006611]/20 rounded-full text-xs font-medium shadow-xs"
                >
                  {amenity}
                </span>
              ))}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs font-medium text-red-600 hover:text-red-700 underline underline-offset-2 ml-2 cursor-pointer transition-colors"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Featured Collections Section */}
        <FeaturedSection properties={filteredFeatured} />

        {/* New in Market Section */}
        <MarketSection
          properties={marketProperties}
          selectedFilter={activeType}
          onFilterChange={handleFilterChange}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </main>

      {/* Search Filters Modal matching code.html */}
      <SearchFiltersModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        initialValues={modalInitialValues}
        totalHomesCount={totalCount}
        onApply={handleApplyFilters}
      />
    </div>
  );
}
