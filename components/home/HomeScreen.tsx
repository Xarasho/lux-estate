"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSearch } from "@/components/home/HeroSearch";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { MarketSection } from "@/components/home/MarketSection";
import {
  FEATURED_PROPERTIES,
  INITIAL_MARKET_PROPERTIES,
  ADDITIONAL_MARKET_PROPERTIES,
} from "@/data/mockProperties";
import { Property } from "@/types/property";

export function HomeScreen() {
  const [activeNav, setActiveNav] = useState<"buy" | "rent" | "sell" | "saved">("buy");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [marketFilter, setMarketFilter] = useState<"all" | "sale" | "rent">("all");
  const [marketList, setMarketList] = useState<Property[]>(INITIAL_MARKET_PROPERTIES);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync nav bar Buy / Rent selection with market filter
  const handleNavSelect = (tab: "buy" | "rent" | "sell" | "saved") => {
    setActiveNav(tab);
    if (tab === "buy") {
      setMarketFilter("sale");
    } else if (tab === "rent") {
      setMarketFilter("rent");
    } else {
      setMarketFilter("all");
    }
  };

  // Filtered Featured Properties
  const filteredFeatured = useMemo(() => {
    return FEATURED_PROPERTIES.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Filtered Market Properties
  const filteredMarket = useMemo(() => {
    return marketList.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      const matchesType =
        marketFilter === "all" || item.type === marketFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [marketList, searchQuery, selectedCategory, marketFilter]);

  // Handle Load More
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setMarketList((prev) => [...prev, ...ADDITIONAL_MARKET_PROPERTIES]);
      setHasLoadedMore(true);
      setIsLoadingMore(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background-light text-nordic-dark flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar activeNav={activeNav} onNavSelect={handleNavSelect} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full flex-grow">
        {/* Hero & Search Section */}
        <HeroSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Featured Collections Section */}
        <FeaturedSection properties={filteredFeatured} />

        {/* New in Market Section */}
        <MarketSection
          properties={filteredMarket}
          selectedFilter={marketFilter}
          onFilterChange={setMarketFilter}
          onLoadMore={handleLoadMore}
          hasMore={!hasLoadedMore}
          isLoadingMore={isLoadingMore}
        />
      </main>
    </div>
  );
}
