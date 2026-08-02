const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem("gg-token");
}

function clearStaleSession() {
  localStorage.removeItem("gg-token");
  localStorage.removeItem("gg-user");
  // Only redirect if we're actually somewhere in the admin area — avoids
  // yanking someone away from the public storefront over an unrelated call.
  if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
    window.location.href = "/admin/login";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // No-content responses (rare, but keep this safe)
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // A stale, expired, or role-mismatched token looks the same from here:
    // the backend rejects it. Rather than leave the UI half-rendered (like
    // an admin panel with no sidebar because no nav item matches an invalid
    // role), clear it out and send the person back to a clean login.
    if (res.status === 401 || res.status === 403) {
      clearStaleSession();
    }

    const message = data?.error ?? `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};