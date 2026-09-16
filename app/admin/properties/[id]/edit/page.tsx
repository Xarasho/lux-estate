import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPropertyById } from "@/lib/properties";
import { PropertyForm } from "@/components/admin/PropertyForm";

export const dynamic = "force-dynamic";

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditPropertyPageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);

  return {
    title: property
      ? `Editar: ${property.title} • LuxeEstate`
      : "Editar Propiedad • LuxeEstate",
    description: "Modifica los detalles de la propiedad en el panel administrativo.",
  };
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return <PropertyForm initialProperty={property} mode="edit" />;
}
