export type UserRole = "admin" | "broker" | "agent" | "viewer";
export type UserStatus = "active" | "away" | "inactive" | "suspended";

export interface UserRoleProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  properties_count?: number;
}
