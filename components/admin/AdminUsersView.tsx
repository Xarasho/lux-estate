"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { UserRoleProfile, UserRole, UserStatus } from "@/types/user";
import { useAuth } from "@/components/auth/AuthProvider";

interface AdminUsersViewProps {
  initialUsers: UserRoleProfile[];
}

export function AdminUsersView({ initialUsers }: AdminUsersViewProps) {
  const { user: currentUser, refreshRole } = useAuth();
  const [users, setUsers] = useState<UserRoleProfile[]>(initialUsers);
  const [activeFilter, setActiveFilter] = useState<"all" | UserRole>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesFilter = activeFilter === "all" || u.role === activeFilter;
      const matchesSearch =
        !searchTerm.trim() ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        u.user_id.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [users, activeFilter, searchTerm]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleRoleChange = async (targetUser: UserRoleProfile, newRole: UserRole) => {
    if (targetUser.role === newRole) {
      setOpenDropdownId(null);
      return;
    }

    setUpdatingId(targetUser.id);
    setOpenDropdownId(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetUser.id,
          user_id: targetUser.user_id,
          role: newRole,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );
        showToast(`Rol actualizado a "${newRole.toUpperCase()}" para ${targetUser.full_name || targetUser.email}`);

        // If modified user is current user, trigger refresh
        if (currentUser && targetUser.user_id === currentUser.id) {
          await refreshRole();
        }
      } else {
        showToast(`Error: ${data.error || "No se pudo actualizar el rol"}`);
      }
    } catch (err: any) {
      showToast(`Error de conexión: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (targetUser: UserRoleProfile) => {
    const newStatus: UserStatus = targetUser.status === "suspended" ? "active" : "suspended";

    setUpdatingId(targetUser.id);
    setOpenDropdownId(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: targetUser.id,
          user_id: targetUser.user_id,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
        );
        showToast(
          `Estado cambiado a "${newStatus === "suspended" ? "Suspendido" : "Activo"}" para ${
            targetUser.full_name || targetUser.email
          }`
        );
      } else {
        showToast(`Error: ${data.error || "No se pudo actualizar el estado"}`);
      }
    } catch (err: any) {
      showToast(`Error de conexión: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "admin":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-nordic text-white shadow-xs">
            Administrator
          </span>
        );
      case "broker":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            Senior Broker
          </span>
        );
      case "agent":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Agent
          </span>
        );
      case "viewer":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            Viewer
          </span>
        );
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return (
          <div className="flex items-center text-xs text-nordic/60 dark:text-gray-400">
            <span className="material-icons text-[14px] mr-1 text-primary">check_circle</span>
            <span>Activo</span>
          </div>
        );
      case "away":
        return (
          <div className="flex items-center text-xs text-nordic/60 dark:text-gray-400">
            <span className="material-icons text-[14px] mr-1 text-yellow-500">schedule</span>
            <span>Ausente</span>
          </div>
        );
      case "suspended":
        return (
          <div className="flex items-center text-xs text-red-600 font-medium">
            <span className="material-icons text-[14px] mr-1 text-red-500">block</span>
            <span>Suspendido</span>
          </div>
        );
      case "inactive":
      default:
        return (
          <div className="flex items-center text-xs text-gray-400">
            <span className="material-icons text-[14px] mr-1">remove_circle_outline</span>
            <span>Inactivo</span>
          </div>
        );
    }
  };

  const roleCounts = useMemo(() => {
    return {
      all: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      broker: users.filter((u) => u.role === "broker").length,
      agent: users.filter((u) => u.role === "agent").length,
      viewer: users.filter((u) => u.role === "viewer").length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-nordic text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-primary/30 animate-in slide-in-from-bottom-4 duration-200">
          <span className="material-icons text-emerald-400 text-xl">info</span>
          <p className="text-xs sm:text-sm font-medium">{toastMessage}</p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2"
          >
            <span className="material-icons text-sm">close</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic dark:text-white">
            Directorio de Usuarios
          </h1>
          <p className="text-nordic/60 dark:text-gray-400 mt-1 text-sm">
            Administra el acceso y los roles de los usuarios autenticados en el sistema.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-nordic/40">
            <span className="material-icons text-lg">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o ID..."
            className="block w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-nordic dark:text-white shadow-soft placeholder:text-nordic/40 focus:ring-2 focus:ring-primary focus:border-transparent text-xs sm:text-sm transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-nordic"
            >
              <span className="material-icons text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs matching design */}
      <div className="flex gap-6 border-b border-nordic/10 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === "all"
              ? "text-primary border-b-2 border-primary"
              : "text-nordic/60 hover:text-nordic"
          }`}
        >
          Todos los Usuarios ({roleCounts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("admin")}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === "admin"
              ? "text-primary border-b-2 border-primary"
              : "text-nordic/60 hover:text-nordic"
          }`}
        >
          Admins ({roleCounts.admin})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("broker")}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === "broker"
              ? "text-primary border-b-2 border-primary"
              : "text-nordic/60 hover:text-nordic"
          }`}
        >
          Brokers ({roleCounts.broker})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("agent")}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === "agent"
              ? "text-primary border-b-2 border-primary"
              : "text-nordic/60 hover:text-nordic"
          }`}
        >
          Agents ({roleCounts.agent})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("viewer")}
          className={`pb-3 text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeFilter === "viewer"
              ? "text-primary border-b-2 border-primary"
              : "text-nordic/60 hover:text-nordic"
          }`}
        >
          Viewers ({roleCounts.viewer})
        </button>
      </div>

      {/* Column Headers on Desktop */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic/50 mb-2">
        <div className="col-span-4">Detalles del Usuario</div>
        <div className="col-span-3">Rol & Estado</div>
        <div className="col-span-3">Rendimiento / Nivel</div>
        <div className="col-span-2 text-right">Acciones</div>
      </div>

      {/* User Directory Cards */}
      <div className="space-y-3" ref={dropdownRef}>
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-[#152e2a] rounded-xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
            <span className="material-icons text-4xl text-nordic/30 mb-2">person_off</span>
            <p className="text-base font-semibold text-nordic dark:text-white">
              No se encontraron usuarios
            </p>
            <p className="text-xs text-nordic/60 dark:text-gray-400 mt-1">
              Intenta con otro término de búsqueda o cambia de filtro.
            </p>
          </div>
        ) : (
          filteredUsers.map((userItem) => {
            const shortId = `#USR-${userItem.id.slice(0, 4).toUpperCase()}`;
            const isSelf = currentUser?.id === userItem.user_id;
            const isDropdownOpen = openDropdownId === userItem.id;
            const isUpdating = updatingId === userItem.id;

            return (
              <div
                key={userItem.id}
                className={`user-card group relative bg-white dark:bg-[#152e2a] rounded-xl p-5 shadow-soft border ${
                  userItem.role === "admin"
                    ? "border-primary/20 bg-active-green/10"
                    : "border-gray-100 dark:border-gray-800"
                } hover:border-primary/30 transition-all flex flex-col md:grid md:grid-cols-12 gap-4 items-center`}
              >
                {/* 1. User Details */}
                <div className="col-span-12 md:col-span-4 flex items-center w-full">
                  <div className="relative flex-shrink-0">
                    {userItem.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={userItem.avatar_url}
                        alt={userItem.full_name || "User"}
                        className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-primary/40 shadow-xs"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border-2 border-white shadow-xs">
                        {(userItem.full_name || userItem.email || "US")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-[#152e2a] ${
                        userItem.status === "active"
                          ? "bg-green-500"
                          : userItem.status === "away"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    ></span>
                  </div>

                  <div className="ml-4 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-nordic dark:text-white truncate">
                        {userItem.full_name || "Usuario Luxe"}
                      </span>
                      {isSelf && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                          Tú
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-nordic/70 dark:text-gray-300 truncate mt-0.5">
                      {userItem.email || "Sin correo"}
                    </div>
                    <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-background-light dark:bg-white/10 rounded text-nordic/60 font-mono">
                      {shortId}
                    </div>
                  </div>
                </div>

                {/* 2. Role & Status */}
                <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
                  {getRoleBadge(userItem.role)}
                  {getStatusBadge(userItem.status)}
                </div>

                {/* 3. Performance / Access Level */}
                <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-nordic/50">
                      Propiedades
                    </div>
                    <div className="text-sm font-semibold text-nordic dark:text-white">
                      {userItem.role === "admin"
                        ? "Todas (40)"
                        : userItem.role === "broker"
                        ? "16"
                        : userItem.role === "agent"
                        ? "8"
                        : "0"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-nordic/50">
                      Nivel de Acceso
                    </div>
                    <div className="text-sm font-semibold text-nordic dark:text-white">
                      {userItem.role === "admin"
                        ? "Nivel 5 (Total)"
                        : userItem.role === "broker"
                        ? "Nivel 3 (Broker)"
                        : userItem.role === "agent"
                        ? "Nivel 2 (Agente)"
                        : "Nivel 1 (Lectura)"}
                    </div>
                  </div>
                </div>

                {/* 4. Action Dropdown: Change Role */}
                <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(isDropdownOpen ? null : userItem.id);
                    }}
                    className={`inline-flex items-center px-3.5 py-2 border shadow-xs text-xs font-medium rounded-lg transition-all w-full md:w-auto justify-center cursor-pointer ${
                      isDropdownOpen
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-nordic dark:text-gray-200 hover:bg-nordic hover:text-white"
                    }`}
                  >
                    {isUpdating ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        <span>Guardando...</span>
                      </span>
                    ) : (
                      <>
                        <span>Cambiar Rol</span>
                        <span className="material-icons text-[16px] ml-1.5">
                          {isDropdownOpen ? "expand_less" : "expand_more"}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Dropdown Menu matching code.html */}
                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 rounded-xl shadow-dropdown bg-primary text-white ring-1 ring-black/10 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="py-1" role="menu">
                        <div className="px-4 py-2 border-b border-white/10 text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                          Asignar Permisos
                        </div>

                        {/* Administrator */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(userItem, "admin")}
                          className={`w-full group flex items-center px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                            userItem.role === "admin"
                              ? "bg-white/20 font-semibold text-white"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            shield
                          </span>
                          <span>Administrator</span>
                          {userItem.role === "admin" && (
                            <span className="material-icons text-xs ml-auto text-emerald-300">
                              check
                            </span>
                          )}
                        </button>

                        {/* Broker */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(userItem, "broker")}
                          className={`w-full group flex items-center px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                            userItem.role === "broker"
                              ? "bg-white/20 font-semibold text-white"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            business_center
                          </span>
                          <span>Broker</span>
                          {userItem.role === "broker" && (
                            <span className="material-icons text-xs ml-auto text-emerald-300">
                              check
                            </span>
                          )}
                        </button>

                        {/* Agent */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(userItem, "agent")}
                          className={`w-full group flex items-center px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                            userItem.role === "agent"
                              ? "bg-white/20 font-semibold text-white"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            support_agent
                          </span>
                          <span>Agent</span>
                          {userItem.role === "agent" && (
                            <span className="material-icons text-xs ml-auto text-emerald-300">
                              check
                            </span>
                          )}
                        </button>

                        {/* Viewer */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(userItem, "viewer")}
                          className={`w-full group flex items-center px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                            userItem.role === "viewer"
                              ? "bg-white/20 font-semibold text-white"
                              : "text-white/80 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <span className="material-icons text-sm mr-3 text-white/60 group-hover:text-white">
                            visibility
                          </span>
                          <span>Viewer</span>
                          {userItem.role === "viewer" && (
                            <span className="material-icons text-xs ml-auto text-emerald-300">
                              check
                            </span>
                          )}
                        </button>

                        <div className="border-t border-white/10 my-1"></div>

                        {/* Suspend / Activate */}
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(userItem)}
                          className={`w-full group flex items-center px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                            userItem.status === "suspended"
                              ? "text-emerald-200 hover:bg-emerald-500/20"
                              : "text-red-200 hover:bg-red-500/20 hover:text-red-100"
                          }`}
                        >
                          <span className="material-icons text-sm mr-3">
                            {userItem.status === "suspended" ? "check_circle" : "block"}
                          </span>
                          <span>
                            {userItem.status === "suspended"
                              ? "Reactivar Usuario"
                              : "Suspender Usuario"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
