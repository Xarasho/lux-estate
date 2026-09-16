import { redirect } from "next/navigation";

export default async function PropiedadesRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/properties/${slug}`);
}
