import { request } from "@/lib/api/platform";

export type CurrentSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isSuperAdmin: boolean;
  };
  organization: { id: string; name: string; slug: string };
};

export function fetchCurrentSession() {
  return request<CurrentSession>("/auth/me");
}
