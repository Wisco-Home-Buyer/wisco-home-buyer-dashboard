import { axiosInstance } from "../lib/axios";

export type ApiRole = "SUPER_ADMIN" | "ADMIN" | "ANALYST" | "VIEWER";
export type ApiUserStatus = "ACTIVE" | "INVITED" | "DISABLED";

export interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: ApiRole;
  status: ApiUserStatus;
  avatarUrl: string | null;
  createdAt: string;
}

export interface InviteUserPayload {
  email: string;
  name: string;
  role: ApiRole;
}

export interface InviteUserResult {
  user: TeamUser;
  /** False when SMTP isn't configured — `inviteUrl` is then present. */
  emailSent: boolean;
  inviteUrl?: string;
}

async function unwrap<T>(promise: Promise<{ data: unknown }>): Promise<T> {
  const { data } = await promise;
  const body = data as { data?: T } | T;
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data !== undefined
  ) {
    return body.data as T;
  }
  return body as T;
}

export const usersService = {
  listUsers() {
    return unwrap<TeamUser[]>(axiosInstance.get("/api/users"));
  },

  inviteUser(payload: InviteUserPayload) {
    return unwrap<InviteUserResult>(
      axiosInstance.post("/api/users/invite", payload),
    );
  },

  updateRole(id: string, role: ApiRole) {
    return unwrap<TeamUser>(
      axiosInstance.patch(`/api/users/${id}/role`, { role }),
    );
  },

  removeUser(id: string) {
    return unwrap<void>(axiosInstance.delete(`/api/users/${id}`));
  },
};

export const ROLE_LABELS: Record<ApiRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  ANALYST: "Analyst",
  VIEWER: "Viewer",
};

export const INVITE_ROLE_OPTIONS: ApiRole[] = ["VIEWER", "ANALYST", "ADMIN"];

export function roleFromLabel(label: string): ApiRole {
  const entry = Object.entries(ROLE_LABELS).find(([, v]) => v === label);
  return (entry?.[0] as ApiRole) ?? "VIEWER";
}

export function statusLabel(status: ApiUserStatus): "Active" | "Pending" | "Disabled" {
  if (status === "ACTIVE") return "Active";
  if (status === "INVITED") return "Pending";
  return "Disabled";
}

export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}
