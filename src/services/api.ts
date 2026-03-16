import type { ApiResponse } from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

type ApiError = Error & {
  code?: string;
  status?: number;
};

function buildUrl(path: string, params?: Record<string, unknown>) {
  const base = `${API_BASE_URL}${path}`;

  if (!params) return base;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `${base}?${query}` : base;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  const payload = isJson ? ((await response.json()) as ApiResponse<T> | T) : null;

  if (!response.ok) {
    let message = "Erro ao processar a requisição.";
    let code: string | undefined;

    if (payload && typeof payload === "object") {
      const maybePayload = payload as {
        message?: string;
        code?: string;
        error?: string;
      };

      message =
        maybePayload.message ||
        maybePayload.error ||
        message;

      code = maybePayload.code;
    }

    const error = new Error(message) as ApiError;
    error.code = code;
    error.status = response.status;
    throw error;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    "data" in payload
  ) {
    return payload.data as T;
  }

  return payload as T;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  return handleResponse<T>(response);
}

export const api = {
  get<T>(path: string, params?: Record<string, unknown>) {
    return request<T>(path, { method: "GET" }, params);
  },

  post<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
};