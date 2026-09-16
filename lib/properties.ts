import { supabase } from "@/lib/supabase";
import { Property, PropertyImage, PropertyAgent } from "@/types/property";
import { FEATURED_PROPERTIES, INITIAL_MARKET_PROPERTIES } from "@/data/mockProperties";

export const PROPERTIES_PER_PAGE = 6;

interface DbProperty {
  id: string;
  slug?: string | null;
  title: string;
  price: number;
  price_period: string | null;
  type: "sale" | "rent";
  category: "house" | "apartment" | "villa" | "penthouse";
  location: {
    address: string;
    city: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  features: {
    beds: number;
    baths: number;
    sqm: number;
    garage?: number;
  };
  image_alt?: string | null;
  images: PropertyImage[];
  description?: string | null;
  amenities?: string[] | null;
  agent?: PropertyAgent | null;
  badge: string | null;
  is_featured: boolean;
}

function toProperty(row: DbProperty): Property {
  const images: PropertyImage[] =
    Array.isArray(row.images) && row.images.length > 0
      ? row.images
      : [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            alt: row.image_alt || row.title,
            label: "Main Exterior",
          },
        ];

  const primaryImage = images[0];

  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    price: row.price,
    pricePeriod: (row.price_period as "month" | "year") ?? undefined,
    type: row.type,
    category: row.category,
    location: row.location,
    features: {
      ...row.features,
      garage: row.features?.garage ?? 2,
    },
    imageUrl: primaryImage?.url || "",
    imageAlt: primaryImage?.alt || row.image_alt || row.title,
    images,
    description:
      row.description ||
      "Discover unparalleled luxury living in this impeccably designed property. Featuring refined finishes, high ceilings, expansive open-concept living spaces, and floor-to-ceiling windows providing abundant natural light. The gourmet kitchen offers bespoke cabinetry and chef-grade appliances, while the primary suite serves as a serene private retreat.",
    amenities:
      Array.isArray(row.amenities) && row.amenities.length > 0
        ? row.amenities
        : [
            "Smart Home System",
            "Swimming Pool",
            "Central Heating & Cooling",
            "Electric Vehicle Charging",
            "Private Gym",
            "Wine Cellar",
          ],
    agent: row.agent ?? {
      name: "Sarah Jenkins",
      role: "Top Rated Agent",
      photoUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w",
      phone: "+1 (555) 234-5678",
      email: "sarah.jenkins@luxeestate.com",
    },
    badge: row.badge ?? undefined,
    isFeatured: row.is_featured,
  };
}

export interface GetPropertiesParams {
  page?: number;
  pageSize?: number;
  type?: "all" | "sale" | "rent";
  category?: string;
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
  featuredOnly?: boolean;
}

export interface GetPropertiesResult {
  data: Property[];
  count: number;
  totalPages: number;
}

export async function getProperties({
  page = 1,
  pageSize = PROPERTIES_PER_PAGE,
  type = "all",
  category = "all",
  search = "",
  location = "",
  minPrice,
  maxPrice,
  beds,
  baths,
  amenities,
  featuredOnly = false,
}: GetPropertiesParams = {}): Promise<GetPropertiesResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (featuredOnly) {
    query = query.eq("is_featured", true);
  } else {
    query = query.eq("is_featured", false);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  // Handle category mapping (e.g. condo -> apartment, townhouse -> house)
  if (category && category !== "all" && category.toLowerCase() !== "any type") {
    const normalizedCategory =
      category.toLowerCase() === "condo"
        ? "apartment"
        : category.toLowerCase() === "townhouse"
        ? "house"
        : category.toLowerCase();
    query = query.eq("category", normalizedCategory);
  }

  const effectiveSearch = search || location;
  if (effectiveSearch && effectiveSearch.trim()) {
    const term = effectiveSearch.trim();
    query = query.or(
      `title.ilike.%${term}%,location->>city.ilike.%${term}%,location->>address.ilike.%${term}%,location->>state.ilike.%${term}%,location->>country.ilike.%${term}%`
    );
  }

  if (minPrice !== undefined && minPrice > 0) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined && maxPrice > 0) {
    query = query.lte("price", maxPrice);
  }

  if (beds !== undefined && beds > 0) {
    query = query.filter("features->beds", "gte", beds);
  }

  if (baths !== undefined && baths > 0) {
    query = query.filter("features->baths", "gte", baths);
  }

  if (amenities && amenities.length > 0) {
    query = query.contains("amenities", JSON.stringify(amenities));
  }

  if (!featuredOnly) {
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getProperties] Supabase error:", error.message);
    let mockList = featuredOnly ? FEATURED_PROPERTIES : INITIAL_MARKET_PROPERTIES;
    if (type && type !== "all") {
      mockList = mockList.filter((p) => p.type === type);
    }
    if (category && category !== "all" && category.toLowerCase() !== "any type") {
      const normalizedCategory =
        category.toLowerCase() === "condo"
          ? "apartment"
          : category.toLowerCase() === "townhouse"
          ? "house"
          : category.toLowerCase();
      mockList = mockList.filter((p) => p.category === normalizedCategory);
    }
    if (effectiveSearch && effectiveSearch.trim()) {
      const st = effectiveSearch.trim().toLowerCase();
      mockList = mockList.filter(
        (p) =>
          p.title.toLowerCase().includes(st) ||
          p.location.city.toLowerCase().includes(st) ||
          p.location.address.toLowerCase().includes(st) ||
          (p.location.state && p.location.state.toLowerCase().includes(st)) ||
          (p.location.country && p.location.country.toLowerCase().includes(st))
      );
    }
    if (minPrice !== undefined && minPrice > 0) {
      mockList = mockList.filter((p) => p.price >= minPrice);
    }
    if (maxPrice !== undefined && maxPrice > 0) {
      mockList = mockList.filter((p) => p.price <= maxPrice);
    }
    if (beds !== undefined && beds > 0) {
      mockList = mockList.filter((p) => p.features.beds >= beds);
    }
    if (baths !== undefined && baths > 0) {
      mockList = mockList.filter((p) => p.features.baths >= baths);
    }
    if (amenities && amenities.length > 0) {
      mockList = mockList.filter((p) =>
        amenities.every((a) => p.amenities?.includes(a))
      );
    }

    const total = mockList.length;
    const paginated = featuredOnly
      ? mockList
      : mockList.slice(from, to + 1);
    return {
      data: paginated,
      count: total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  const properties = (data as DbProperty[]).map(toProperty);
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return { data: properties, count: total, totalPages };
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  if (!slug) return null;

  try {
    // Try matching by slug first, fallback to id
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      // Also check if there are relational property_images
      const { data: imgData } = await supabase
        .from("property_images")
        .select("url, alt, label, display_order")
        .eq("property_id", data.id)
        .order("display_order", { ascending: true });

      const prop = toProperty(data as DbProperty);
      if (imgData && imgData.length > 0) {
        prop.images = imgData.map((img) => ({
          url: img.url,
          alt: img.alt || prop.title,
          label: img.label || undefined,
        }));
      }
      return prop;
    }
  } catch (err) {
    console.warn("[getPropertyBySlug] Error fetching from Supabase:", err);
  }

  // Graceful fallback to mock data
  const allMocks = [...FEATURED_PROPERTIES, ...INITIAL_MARKET_PROPERTIES];
  const found = allMocks.find((p) => p.slug === slug || p.id === slug);
  return found || null;
}

export async function getAllPropertySlugs(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("slug, id");

    if (!error && data && data.length > 0) {
      return data
        .map((p) => p.slug || p.id)
        .filter((slug): slug is string => Boolean(slug));
    }
  } catch (err) {
    console.warn("[getAllPropertySlugs] Error fetching slugs:", err);
  }

  const allMocks = [...FEATURED_PROPERTIES, ...INITIAL_MARKET_PROPERTIES];
  return allMocks.map((p) => p.slug || p.id);
}

