"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Property } from "@/types/property";
import { UserRoleProfile } from "@/types/user";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { AdminPropertiesView } from "@/components/admin/AdminPropertiesView";
import { AdminUsersView } from "@/components/admin/AdminUsersView";

interface AdminDashboardClientProps {
  initialProperties: Property[];
  initialUsers: UserRoleProfile[];
}

export default function AdminDashboardClient({
  initialProperties,
  initialUsers,
}: AdminDashboardClientProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"properties" | "users">(
    tabParam === "users" ? "users" : "properties"
  );

  useEffect(() => {
    if (tabParam === "users" || tabParam === "properties") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-nordic dark:text-gray-100 flex flex-col antialiased">
      {/* Admin Navbar */}
      <AdminNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content View */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === "properties" ? (
          <AdminPropertiesView initialProperties={initialProperties} />
        ) : (
          <AdminUsersView initialUsers={initialUsers} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-nordic/10 dark:border-primary/20 py-6 text-center text-xs text-nordic/50 dark:text-gray-500">
        <p>LuxeEstate • Portal de Administración y Control de Roles</p>
      </footer>
    </div>
  );
}
