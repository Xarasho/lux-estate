import { Metadata } from "next";
import { PropertyForm } from "@/components/admin/PropertyForm";

export const metadata: Metadata = {
  title: "Añadir Nueva Propiedad • LuxeEstate",
  description: "Crea una nueva propiedad en el catálogo de LuxeEstate.",
};

export default function NewPropertyPage() {
  return <PropertyForm mode="create" />;
}
