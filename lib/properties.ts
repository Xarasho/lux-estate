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

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,location->>city.ilike.%${search}%,location->>address.ilike.%${search}%`
    );
  }

  if (!featuredOnly) {
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[getProperties] Supabase error:", error.message);
    const mockList = featuredOnly ? FEATURED_PROPERTIES : INITIAL_MARKET_PROPERTIES;
    return { data: mockList, count: mockList.length, totalPages: 1 };
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

