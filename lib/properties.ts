import { supabase } from "@/lib/supabase";
import { Property } from "@/types/property";

export const PROPERTIES_PER_PAGE = 6;

interface DbProperty {
  id: string;
  title: string;
  price: number;
  price_period: string | null;
  type: "sale" | "rent";
  category: "house" | "apartment" | "villa" | "penthouse";
  location: { address: string; city: string; state?: string; country?: string };
  features: { beds: number; baths: number; sqm: number };
  image_url: string;
  image_alt: string;
  badge: string | null;
  is_featured: boolean;
}

function toProperty(row: DbProperty): Property {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    pricePeriod: (row.price_period as "month" | "year") ?? undefined,
    type: row.type,
    category: row.category,
    location: row.location,
    features: row.features,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
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
    return { data: [], count: 0, totalPages: 0 };
  }

  const properties = (data as DbProperty[]).map(toProperty);
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return { data: properties, count: total, totalPages };
}
