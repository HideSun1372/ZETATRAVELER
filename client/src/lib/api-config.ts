function getApiBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env && typeof env === "string") return env.replace(/\/$/, "");
  return "";
}

export const API_BASE_URL = getApiBaseUrl();

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
