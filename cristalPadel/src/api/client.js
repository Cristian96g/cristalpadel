const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // La respuesta puede no traer JSON.
  }

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    const err = new Error(data?.message || "No autorizado");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
