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

  const [featuredResult, marketResult] = await Promise.all([
    getProperties({ featuredOnly: true }),
    getProperties({
      page,
      pageSize: PROPERTIES_PER_PAGE,
      type,
      category,
      search,
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
        activeSearch={search}
      />
    </Suspense>
  );
}
