"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSearch } from "@/components/home/HeroSearch";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { MarketSection } from "@/components/home/MarketSection";
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
        />

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
    </div>
  );
}
