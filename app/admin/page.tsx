import { Suspense } from "react";
import { getAdminProperties } from "@/lib/properties";
import { supabase } from "@/lib/supabase";
import { UserRoleProfile } from "@/types/user";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard • LuxeEstate",
  description: "Portal administrativo para gestión de portafolio y roles de usuario.",
};

export default async function AdminPage() {
  const { properties } = await getAdminProperties();

  let initialUsers: UserRoleProfile[] = [];
  try {
    const { data } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      initialUsers = data as UserRoleProfile[];
    }
  } catch (err) {
    console.error("Error fetching users for admin:", err);
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background-light text-nordic">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-nordic/70 font-medium text-sm mt-4 animate-pulse">
            Cargando portal administrativo...
          </p>
        </div>
      }
    >
      <AdminDashboardClient
        initialProperties={properties}
        initialUsers={initialUsers}
      />
    </Suspense>
  );
}
