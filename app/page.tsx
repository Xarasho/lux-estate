import { Suspense } from "react";
import { HomeScreen } from "@/components/home/HomeScreen";
import { getProperties, PROPERTIES_PER_PAGE } from "@/lib/properties";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = Number(params.page ?? "1");
  const type = (params.type as "all" | "sale" | "rent") ?? "all";
  const category = (params.category as string) ?? "all";
  const search = (params.search as string) ?? "";
  const location = (params.location as string) ?? "";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const beds = params.beds ? Number(params.beds) : undefined;
  const baths = params.baths ? Number(params.baths) : undefined;

  const amenitiesParam = params.amenities as string | string[] | undefined;
  const amenities = amenitiesParam
    ? Array.isArray(amenitiesParam)
      ? amenitiesParam
      : amenitiesParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const [featuredResult, marketResult] = await Promise.all([
    getProperties({ featuredOnly: true }),
    getProperties({
      page,
      pageSize: PROPERTIES_PER_PAGE,
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
    }),
  ]);

  return (
    <Suspense>
      <HomeScreen
        featuredProperties={featuredResult.data}
        marketProperties={marketResult.data}
        totalPages={marketResult.totalPages}
        currentPage={page}
        totalCount={marketResult.count}
        activeType={type}
        activeCategory={category}
        activeSearch={search || location}
        activeMinPrice={minPrice}
        activeMaxPrice={maxPrice}
        activeBeds={beds}
        activeBaths={baths}
        activeAmenities={amenities}
      />
    </Suspense>
  );
}
