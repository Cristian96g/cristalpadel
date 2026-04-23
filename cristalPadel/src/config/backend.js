function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function resolveDefaultApiBaseUrl() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:4000";
  }

  return "https://cristalpadel.onrender.com";
}

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || resolveDefaultApiBaseUrl()
);
