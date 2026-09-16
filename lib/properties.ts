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
    yearBuilt?: number;
  };
  image_alt?: string | null;
  images: PropertyImage[];
  description?: string | null;
  amenities?: string[] | null;
  agent?: PropertyAgent | null;
  badge: string | null;
  is_featured: boolean;
  is_active?: boolean;
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
      yearBuilt: row.features?.yearBuilt,
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
    isActive: row.is_active ?? true,
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

export interface LocationSuggestion {
  city: string;
  state?: string;
  country?: string;
  address?: string;
  label: string;
  sublabel?: string;
  count: number;
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

  const isFiltered = Boolean(
    (type && type !== "all") ||
    (category && category.trim() !== "" && category.toLowerCase() !== "any type") ||
    (search && search.trim()) ||
    (location && location.trim()) ||
    (minPrice !== undefined && minPrice > 0) ||
    (maxPrice !== undefined && maxPrice > 0 && maxPrice < 15000000) ||
    (beds !== undefined && beds > 0) ||
    (baths !== undefined && baths > 0) ||
    (amenities && amenities.length > 0)
  );

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (featuredOnly) {
    query = query.eq("is_featured", true).limit(pageSize ?? 2);
  } else if (!isFiltered) {
    // Only exclude featured properties on default unfiltered homepage to avoid visual duplication
    query = query.eq("is_featured", false);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  // Handle category mapping (e.g. condo -> apartment, townhouse -> house)
  if (category && category !== "all" && category.trim() !== "" && category.toLowerCase() !== "any type") {
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
    // Search strictly by property location (city, address, state, country)
    query = query.or(
      `location->>city.ilike.%${term}%,location->>address.ilike.%${term}%,location->>state.ilike.%${term}%,location->>country.ilike.%${term}%`
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
    let mockList = featuredOnly
      ? FEATURED_PROPERTIES
      : isFiltered
      ? [...FEATURED_PROPERTIES, ...INITIAL_MARKET_PROPERTIES]
      : INITIAL_MARKET_PROPERTIES;

    mockList = mockList.filter((p) => p.isActive !== false);

    if (type && type !== "all") {
      mockList = mockList.filter((p) => p.type === type);
    }
    if (category && category !== "all" && category.trim() !== "" && category.toLowerCase() !== "any type") {
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
          (p.location.city && p.location.city.toLowerCase().includes(st)) ||
          (p.location.address && p.location.address.toLowerCase().includes(st)) ||
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
      ? mockList.slice(0, pageSize ?? 2)
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
      .select("slug, id")
      .eq("is_active", true);

    if (!error && data && data.length > 0) {
      return data
        .map((p) => p.slug || p.id)
        .filter((slug): slug is string => Boolean(slug));
    }
  } catch (err) {
    console.warn("[getAllPropertySlugs] Error fetching slugs:", err);
  }

  const allMocks = [...FEATURED_PROPERTIES, ...INITIAL_MARKET_PROPERTIES].filter(
    (p) => p.isActive !== false
  );
  return allMocks.map((p) => p.slug || p.id);
}

export async function getAvailableLocations(): Promise<LocationSuggestion[]> {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("location")
      .eq("is_active", true);

    if (!error && data && data.length > 0) {
      const cityMap = new Map<string, LocationSuggestion>();

      for (const row of data) {
        const loc = row.location as {
          city?: string;
          state?: string;
          country?: string;
          address?: string;
        };
        if (!loc || !loc.city) continue;
        const cityKey = loc.city.trim().toLowerCase();

        if (!cityMap.has(cityKey)) {
          const subParts = [loc.state, loc.country].filter(Boolean);
          cityMap.set(cityKey, {
            city: loc.city.trim(),
            state: loc.state?.trim() || undefined,
            country: loc.country?.trim() || undefined,
            address: loc.address?.trim() || undefined,
            label: loc.city.trim(),
            sublabel: subParts.length > 0 ? subParts.join(", ") : undefined,
            count: 1,
          });
        } else {
          const item = cityMap.get(cityKey)!;
          item.count += 1;
          if (!item.state && loc.state) item.state = loc.state.trim();
          if (!item.country && loc.country) item.country = loc.country.trim();
          const subParts = [item.state, item.country].filter(Boolean);
          if (subParts.length > 0) {
            item.sublabel = subParts.join(", ");
          }
        }
      }

      return Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
    }
  } catch (err) {
    console.warn("[getAvailableLocations] Error fetching locations:", err);
  }

  // Graceful fallback to mock data
  const allMocks = [...FEATURED_PROPERTIES, ...INITIAL_MARKET_PROPERTIES].filter(
    (p) => p.isActive !== false
  );
  const cityMap = new Map<string, LocationSuggestion>();
  for (const p of allMocks) {
    if (!p.location || !p.location.city) continue;
    const cityKey = p.location.city.trim().toLowerCase();
    if (!cityMap.has(cityKey)) {
      const subParts = [p.location.state, p.location.country].filter(Boolean);
      cityMap.set(cityKey, {
        city: p.location.city.trim(),
        state: p.location.state?.trim() || undefined,
        country: p.location.country?.trim() || undefined,
        address: p.location.address?.trim() || undefined,
        label: p.location.city.trim(),
        sublabel: subParts.length > 0 ? subParts.join(", ") : undefined,
        count: 1,
      });
    } else {
      cityMap.get(cityKey)!.count += 1;
    }
  }

  return Array.from(cityMap.values()).sort((a, b) => b.count - a.count);
}

export async function getAdminProperties({
  search = "",
  category = "all",
  type = "all",
  status = "all",
}: {
  search?: string;
  category?: string;
  type?: string;
  status?: "all" | "active" | "inactive";
} = {}): Promise<{ properties: Property[]; total: number }> {
  try {
    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (status === "active") {
      query = query.eq("is_active", true);
    } else if (status === "inactive") {
      query = query.eq("is_active", false);
    }

    if (search && search.trim()) {
      const term = search.trim();
      query = query.or(
        `title.ilike.%${term}%,location->>city.ilike.%${term}%,location->>address.ilike.%${term}%`
      );
    }

    const { data, error, count } = await query;

    if (!error && data) {
      return {
        properties: data.map((row: DbProperty) => toProperty(row)),
        total: count || data.length,
      };
    }
  } catch (err) {
    console.error("[getAdminProperties] Exception:", err);
  }

  // Fallback to mock properties if database query fails
  const allMocks = [...FEATURED_PROPERTIES, ...INITIAL_MARKET_PROPERTIES];
  return {
    properties: allMocks,
    total: allMocks.length,
  };
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!id) return null;

  try {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .or(`id.eq.${id},slug.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
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
    console.warn("[getPropertyById] Error fetching from Supabase:", err);
  }

  const allMocks = [...FEATURED_PROPERTIES, ...INITIAL_MARKET_PROPERTIES];
  return allMocks.find((p) => p.id === id || p.slug === id) || null;
}

export async function uploadPropertyImage(file: File): Promise<{ url: string; error?: string }> {
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const cleanFileName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const uniquePath = `properties/${Date.now()}-${cleanFileName}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(uniquePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[uploadPropertyImage] Supabase Storage upload error:", uploadError);
      return { url: "", error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("property-images")
      .getPublicUrl(uniquePath);

    return { url: publicUrlData.publicUrl };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al subir la imagen";
    console.error("[uploadPropertyImage] Exception:", err);
    return { url: "", error: message };
  }
}

export async function deletePropertyImage(url: string): Promise<void> {
  try {
    const bucketPrefix = "/storage/v1/object/public/property-images/";
    const index = url.indexOf(bucketPrefix);
    if (index !== -1) {
      const filePath = decodeURIComponent(url.substring(index + bucketPrefix.length));
      if (filePath) {
        await supabase.storage.from("property-images").remove([filePath]);
      }
    }
  } catch (err) {
    console.warn("[deletePropertyImage] Failed to delete image:", err);
  }
}

export async function createProperty(
  data: Partial<Property>
): Promise<{ data?: Property; error?: string }> {
  try {
    const baseSlug = (data.title || "property")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    const uniqueSuffix = Math.random().toString(36).substring(2, 7);
    const slug = data.slug || `${baseSlug}-${uniqueSuffix}`;
    const id = data.id || slug;

    const images: PropertyImage[] =
      data.images && data.images.length > 0
        ? data.images
        : [
            {
              url: data.imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
              alt: data.title || "Property",
              label: "Main Exterior",
            },
          ];

    const dbRow: DbProperty = {
      id,
      slug,
      title: data.title || "Untitled Property",
      price: Number(data.price) || 0,
      price_period: data.type === "rent" ? data.pricePeriod || "month" : null,
      type: data.type === "rent" ? "rent" : "sale",
      category: data.category || "house",
      location: {
        address: data.location?.address || "",
        city: data.location?.city || "",
        state: data.location?.state || undefined,
        country: data.location?.country || undefined,
        lat:
          data.location?.lat !== undefined && !isNaN(Number(data.location.lat))
            ? Number(data.location.lat)
            : undefined,
        lng:
          data.location?.lng !== undefined && !isNaN(Number(data.location.lng))
            ? Number(data.location.lng)
            : undefined,
      },
      features: {
        beds: Number(data.features?.beds) || 0,
        baths: Number(data.features?.baths) || 0,
        sqm: Number(data.features?.sqm) || 0,
        garage: Number(data.features?.garage) || 0,
        yearBuilt: data.features?.yearBuilt ? Number(data.features.yearBuilt) : undefined,
      },
      images,
      image_alt: images[0]?.alt || data.title || null,
      badge: data.badge || (data.type === "rent" ? "FOR RENT" : "FOR SALE"),
      is_featured: Boolean(data.isFeatured),
      is_active: data.isActive !== undefined ? Boolean(data.isActive) : true,
      description: data.description || "",
      amenities: data.amenities || [],
      agent: data.agent || {
        name: "Elena Fisher",
        role: "Senior Agent",
        photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzE14jvdSQ44MQaP8gzILgyZCMmx-euPq-VqTsyA6CaXAiSOXG6q5U6y8ZB2r9FD-8KZcIWy26I3fZ7nhTYrhuOyFQ0ZWUqK11Rr-TPcz9YafIvjcmFEKASnb_RHxJUhsLRjIPf5y9DGE5jLDQf7z_fgAmKilyPC4KxIW4Umx3OKqqVfhNd3L-qEW3wTsiG_DaiWsTsLoiRwtAU_32ZuWR0hx4yZNjYP4AnMsAt0SVdFRnFhIfItaKCukJUh6_Qf4KV1-dN6oKmU",
        email: "elena.fisher@luxeestate.com",
        phone: "+1 (555) 019-2834",
      },
    };

    const { data: inserted, error } = await supabase
      .from("properties")
      .insert(dbRow)
      .select()
      .single();

    if (error) {
      console.error("[createProperty] Supabase insert error:", error);
      return { error: error.message };
    }

    return { data: toProperty(inserted as DbProperty) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al crear la propiedad";
    console.error("[createProperty] Exception:", err);
    return { error: message };
  }
}

export async function updateProperty(
  id: string,
  data: Partial<Property>
): Promise<{ data?: Property; error?: string }> {
  try {
    const images: PropertyImage[] | undefined = data.images;

    const updatePayload: Partial<DbProperty> = {};

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.slug !== undefined) updatePayload.slug = data.slug;
    if (data.price !== undefined) updatePayload.price = Number(data.price);
    if (data.type !== undefined) {
      updatePayload.type = data.type === "rent" ? "rent" : "sale";
      updatePayload.price_period = data.type === "rent" ? data.pricePeriod || "month" : null;
    } else if (data.pricePeriod !== undefined) {
      updatePayload.price_period = data.pricePeriod;
    }
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.location !== undefined) {
      updatePayload.location = {
        address: data.location.address || "",
        city: data.location.city || "",
        state: data.location.state || undefined,
        country: data.location.country || undefined,
        lat:
          data.location.lat !== undefined && !isNaN(Number(data.location.lat))
            ? Number(data.location.lat)
            : undefined,
        lng:
          data.location.lng !== undefined && !isNaN(Number(data.location.lng))
            ? Number(data.location.lng)
            : undefined,
      };
    }
    if (data.features !== undefined) {
      updatePayload.features = {
        beds: Number(data.features.beds) || 0,
        baths: Number(data.features.baths) || 0,
        sqm: Number(data.features.sqm) || 0,
        garage: Number(data.features.garage) || 0,
        yearBuilt: data.features.yearBuilt ? Number(data.features.yearBuilt) : undefined,
      };
    }
    if (images !== undefined) {
      updatePayload.images = images;
      if (images.length > 0) {
        updatePayload.image_alt = images[0].alt || data.title || null;
      }
    }
    if (data.badge !== undefined) updatePayload.badge = data.badge;
    if (data.isFeatured !== undefined) updatePayload.is_featured = data.isFeatured;
    if (data.isActive !== undefined) updatePayload.is_active = data.isActive;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.amenities !== undefined) updatePayload.amenities = data.amenities;
    if (data.agent !== undefined) updatePayload.agent = data.agent;

    const { data: updated, error } = await supabase
      .from("properties")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // Also try matching by slug if id was slug
      const { data: updatedBySlug, error: slugErr } = await supabase
        .from("properties")
        .update(updatePayload)
        .eq("slug", id)
        .select()
        .single();

      if (slugErr) {
        console.error("[updateProperty] Supabase update error:", error);
        return { error: error.message };
      }
      return { data: toProperty(updatedBySlug as DbProperty) };
    }

    return { data: toProperty(updated as DbProperty) };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado al actualizar la propiedad";
    console.error("[updateProperty] Exception:", err);
    return { error: message };
  }
}

export async function deactivateProperty(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("properties")
      .update({ is_active: false })
      .or(`id.eq.${id},slug.eq.${id}`);

    if (error) {
      console.error("[deactivateProperty] Supabase update error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al desactivar la propiedad";
    return { success: false, error: message };
  }
}

export async function reactivateProperty(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("properties")
      .update({ is_active: true })
      .or(`id.eq.${id},slug.eq.${id}`);

    if (error) {
      console.error("[reactivateProperty] Supabase update error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error al activar la propiedad";
    return { success: false, error: message };
  }
}

export async function togglePropertyActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  return isActive ? reactivateProperty(id) : deactivateProperty(id);
}

// Instead of physical delete, deactivate property to preserve history in DB
export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  return deactivateProperty(id);
}

