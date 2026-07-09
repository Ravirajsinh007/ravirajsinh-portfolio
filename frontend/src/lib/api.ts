/**
 * Centralized API helper supporting dynamic external domain configurations
 * during split frontend/backend hosting.
 */
export function getApiUrl(endpoint: string): string {
  const base = (import.meta as any).env?.VITE_API_URL || "";
  // Ensure no trailing/leading double slash collisions
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}
