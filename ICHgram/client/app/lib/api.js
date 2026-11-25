const TOKEN_KEY = "ichgram.token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest(path, { method = "GET", json, formData } = {}) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let body;
  if (formData) {
    body = formData;
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const response = await fetch(`/api${path}`, { method, headers, body });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith("/auth/")) {
      clearToken();
      window.location.assign("/login");
    }
    throw new ApiError(data?.message ?? "Request failed", response.status);
  }

  return data;
}
