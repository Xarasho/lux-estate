import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/lib/properties";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const type = (searchParams.get("type") as "all" | "sale" | "rent") ?? "all";
  const category = searchParams.get("category") ?? "all";
  const search = searchParams.get("search") ?? "";
  const location = searchParams.get("location") ?? "";
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const beds = searchParams.get("beds")
    ? Number(searchParams.get("beds"))
    : undefined;
  const baths = searchParams.get("baths")
    ? Number(searchParams.get("baths"))
    : undefined;

  const amenitiesParam = searchParams.get("amenities");
  const amenities = amenitiesParam
    ? amenitiesParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  try {
    const result = await getProperties({
      pageSize: 1, // Only need count
      type,
      category,
      search,
      location,
      minPrice,
      maxPrice,
      beds,
      baths,
      amenities,
      featuredOnly: false,
    });

    return NextResponse.json({ count: result.count });
  } catch (err) {
    console.error("[api/properties/count] Error:", err);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
