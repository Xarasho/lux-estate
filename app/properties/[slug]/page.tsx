import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { AboutSection } from "@/components/property/AboutSection";
import { MortgageCalculator } from "@/components/property/MortgageCalculator";
import { ActionButtons } from "@/components/property/ActionButtons";
import { getPropertyBySlug, getAllPropertySlugs } from "@/lib/properties";

import { PropertyMapClient } from "@/components/property/PropertyMapClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Property Not Found | LuxeEstate",
    };
  }

  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const fullLocation = property.location.city
    ? `${property.location.address}, ${property.location.city}`
    : property.location.address;

  const typeLabel = property.type === "rent" ? "For Rent" : "For Sale";

  return {
    title: `${property.title} | ${typeLabel} | LuxeEstate`,
    description: `${property.features.beds} Beds, ${property.features.baths} Baths luxury property in ${fullLocation}. Listed at ${priceFormatted}.`,
    openGraph: {
      title: `${property.title} — ${priceFormatted}`,
      description: property.description,
      images: [
        {
          url: property.images?.[0]?.url || property.imageUrl || "",
          alt: property.images?.[0]?.alt || property.imageAlt || property.title,
        },
      ],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(property.price);

  const fullAddress = property.location.city
    ? `${property.location.address}, ${property.location.city}${
        property.location.state ? `, ${property.location.state}` : ""
      }`
    : property.location.address;

  const agent = property.agent || {
    name: "Sarah Jenkins",
    role: "Top Rated Agent",
    photoUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w",
    phone: "+1 (555) 234-5678",
    email: "sarah.jenkins@luxeestate.com",
  };

  const amenitiesList =
    property.amenities && property.amenities.length > 0
      ? property.amenities
      : [
          "Smart Home System",
          "Swimming Pool",
          "Central Heating & Cooling",
          "Electric Vehicle Charging",
          "Private Gym",
          "Wine Cellar",
        ];

  // Schema.org structured data (RealEstateListing JSON-LD per best-practices.md)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://luxeestate.com/properties/${property.slug || property.id}`,
    image: property.images?.map((img) => img.url) || [],
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location.address,
      addressLocality: property.location.city,
      addressCountry: property.location.country || "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.location.lat || 37.4419,
      longitude: property.location.lng || -122.143,
    },
  };

  return (
    <div className="min-h-screen bg-clear-day text-nordic selection:bg-mosque/20 flex flex-col font-sans">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Navbar with clickable Villa brand logo returning to Home */}
      <Navbar activeNav="buy" />

      {/* Main Content matching code.html exact 12-col layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Top Left: 1 to N Images Showcase & Gallery */}
          <div className="lg:col-span-8 space-y-4">
            <PropertyGallery
              images={property.images}
              title={property.title}
              badge={property.badge}
              type={property.type}
            />
          </div>

          {/* Right Column: Sticky Sidebar with Pricing, Agent, Conversion CTAs, and Leaflet Map */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              {/* Pricing & Agent Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
                <div className="mb-4">
                  <h1 className="text-4xl font-display font-light text-nordic mb-2">
                    {formattedPrice}
                    {property.pricePeriod && (
                      <span className="text-base font-normal text-nordic/60">
                        /{property.pricePeriod === "month" ? "mo" : property.pricePeriod}
                      </span>
                    )}
                  </h1>
                  <p className="text-nordic/60 font-medium flex items-center gap-1">
                    <span className="material-icons text-mosque text-sm">location_on</span>
                    {fullAddress}
                  </p>
                </div>

                <div className="h-px bg-slate-100 my-6" />

                {/* Agent Profile & Direct Chat/Call Actions */}
                <div className="flex items-center gap-4 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={agent.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    src={agent.photoUrl}
                  />
                  <div>
                    <h3 className="font-semibold text-nordic">{agent.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                      <span className="material-icons text-[14px]">star</span>
                      <span>{agent.role}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <a
                      href={`mailto:${agent.email || "contact@luxeestate.com"}?subject=Inquiry: ${property.title}`}
                      aria-label="Email agent"
                      className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-sm">chat</span>
                    </a>
                    <a
                      href={`tel:${agent.phone || "+15552345678"}`}
                      aria-label="Call agent"
                      className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-sm">call</span>
                    </a>
                  </div>
                </div>

                {/* High Conversion CTAs */}
                <ActionButtons
                  propertyTitle={property.title}
                  propertyPrice={formattedPrice}
                  agent={agent}
                />
              </div>

              {/* Interactive Leaflet Map */}
              <PropertyMapClient
                lat={property.location.lat || 37.4419}
                lng={property.location.lng || -122.143}
                title={property.title}
                address={fullAddress}
                priceFormatted={formattedPrice}
              />
            </div>
          </div>

          {/* Bottom Left: Features, Description, Amenities, Mortgage Estimator */}
          <div className="lg:col-span-8 lg:row-start-2 -mt-8 space-y-8">
            {/* Property Features Grid */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic">Property Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
                  <span className="text-xl font-bold text-nordic">{property.features.sqm}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">
                    Square Meters
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">bed</span>
                  <span className="text-xl font-bold text-nordic">{property.features.beds}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">Bedrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">shower</span>
                  <span className="text-xl font-bold text-nordic">{property.features.baths}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">Bathrooms</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
                  <span className="text-xl font-bold text-nordic">
                    {property.features.garage || 2}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-nordic/50">Garage</span>
                </div>
              </div>
            </div>

            {/* About this home */}
            <AboutSection
              description={
                property.description ||
                "Experience modern luxury in this architecturally stunning home located in the heart of Palo Alto. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light.\n\nThe open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony."
              }
            />

            {/* Amenities Grid */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {amenitiesList.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 text-nordic/70">
                    <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mortgage Calculator Banner & Modal */}
            <MortgageCalculator price={property.price} />
          </div>
        </div>
      </main>

      {/* Footer matching code.html */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-nordic/50">
            © 2026 LuxeEstate Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-nordic/40 hover:text-mosque transition-colors"
              aria-label="Facebook"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-nordic/40 hover:text-mosque transition-colors"
              aria-label="Twitter"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
