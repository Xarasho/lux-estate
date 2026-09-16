import { Suspense } from "react";
import { HomeScreen } from "@/components/home/HomeScreen";
import { getProperties, getAvailableLocations, PROPERTIES_PER_PAGE } from "@/lib/properties";
import { getDictionary } from "@/lib/dictionary";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const page = Number(params.page ?? "1");
  const type = (params.type as "all" | "sale" | "rent") ?? "all";
  const category = (params.category as string) || "";
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

  // User requirement:
  // 1. Featured properties must NOT be shown when ANY chip is clicked (house, apartment, villa, all, penthouse).
  // 2. Featured properties must NOT be shown when there is text in the search bar.
  // 3. If NO chip is clicked and NO search text is present, then the 2 featured properties MUST be shown.
  const isAnyChipClicked = Boolean(category && category.trim().length > 0);
  const hasSearchText = Boolean(
    (search && search.trim().length > 0) || (location && location.trim().length > 0)
  );
  const shouldShowFeatured = !isAnyChipClicked && !hasSearchText;

  const [featuredResult, marketResult, availableLocations, dict] = await Promise.all([
    shouldShowFeatured
      ? getProperties({ featuredOnly: true, pageSize: 2 })
      : Promise.resolve({ data: [], count: 0, totalPages: 0 }),
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
    getAvailableLocations(),
    getDictionary(),
  ]);

  return (
    <Suspense>
      {params.error === "unauthorized" && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
          <span className="material-icons text-base text-amber-600">gpp_maybe</span>
          <span>
            Acceso restringido: Se requieren permisos de Administrador para ingresar al panel administrativo.
          </span>
        </div>
      )}
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
        availableLocations={availableLocations}
        dict={dict}
      />
    </Suspense>
  );
}
