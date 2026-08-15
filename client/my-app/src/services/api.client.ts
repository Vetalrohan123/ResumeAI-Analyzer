/* ============================================================
   CENTRAL API CLIENT
   Resume AI
============================================================ */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "resumeai_access_token";

/* ============================================================
   API ERROR
============================================================ */

export class ApiError extends Error {
  status: number;

  code?: string;

  details?: unknown;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message);

    this.name = "ApiError";

    this.status = status;

    this.code = code;

    this.details = details;
  }
}

/* ============================================================
   TOKEN
============================================================ */

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage
      .getItem(TOKEN_KEY)
      ?.trim() || null
  );
}

/* ============================================================
   CLEAR AUTH
============================================================ */

function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    TOKEN_KEY
  );
}

/* ============================================================
   RESPONSE TYPE
============================================================ */

interface ErrorResponse {
  message?: string;

  error?: string;

  code?: string;

  details?: unknown;

  success?: boolean;
}

/* ============================================================
   API REQUEST
============================================================ */

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers = new Headers(
    options.headers
  );

  /*
   * Only add JSON content type when a body
   * is actually being sent.
   */
  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  headers.set(
    "Accept",
    "application/json"
  );

  /*
   * Add JWT authorization.
   */
  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers,

        credentials: "include",

        cache: "no-store",
      }
    );
  } catch (error) {
    console.error(
      "[API] Network error:",
      error
    );

    throw new ApiError(
      "Unable to connect to the server. Please check your internet connection or try again.",
      0,
      "NETWORK_ERROR"
    );
  }

  /* ==========================================================
     READ RESPONSE
  ========================================================== */

  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  let data: unknown = null;

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data = await response.json();
    } else {
      const text =
        await response.text();

      data = text || null;
    }
  } catch (error) {
    console.error(
      "[API] Response parsing error:",
      error
    );

    throw new ApiError(
      "The server returned an invalid response.",
      response.status,
      "INVALID_RESPONSE"
    );
  }

  /* ==========================================================
     SUCCESS
  ========================================================== */

  if (response.ok) {
    return data as T;
  }

  /* ==========================================================
     NORMALIZE ERROR
  ========================================================== */

  const errorData =
    typeof data === "object" &&
    data !== null
      ? (data as ErrorResponse)
      : {};

  let message =
    errorData.message ||
    errorData.error ||
    "";

  /* ==========================================================
     STATUS SPECIFIC ERRORS
  ========================================================== */

  switch (response.status) {
    case 400:
      message =
        message ||
        "Invalid request. Please check your input.";
      break;

    case 401:
      message =
        message ||
        "Your session has expired. Please log in again.";

      /*
       * Remove invalid token.
       */
      clearAuthToken();

      break;

    case 403:
      message =
        message ||
        "You do not have permission to perform this action.";
      break;

    case 404:
      message =
        message ||
        "The requested resource was not found.";
      break;

    case 409:
      message =
        message ||
        "This request conflicts with existing data.";
      break;

    case 422:
      message =
        message ||
        "Some of the information provided is invalid.";
      break;

    case 429:
      message =
        message ||
        "Too many requests. Please try again later.";
      break;

    case 500:
      message =
        message ||
        "Something went wrong on the server.";
      break;

    case 502:
      message =
        message ||
        "The server is temporarily unavailable.";
      break;

    case 503:
      message =
        message ||
        "The service is temporarily unavailable.";
      break;

    default:
      message =
        message ||
        `Request failed with status ${response.status}.`;
  }

  console.error(
    `[API] ${response.status} ${endpoint}:`,
    data
  );

  throw new ApiError(
    message,
    response.status,
    errorData.code,
    errorData.details
  );
}

/* ============================================================
   GET
============================================================ */

export async function apiGet<T>(
  endpoint: string
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "GET",
    }
  );
}

/* ============================================================
   POST
============================================================ */

export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "POST",

      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );
}

/* ============================================================
   PUT
============================================================ */

export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "PUT",

      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );
}

/* ============================================================
   PATCH
============================================================ */

export async function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "PATCH",

      body:
        body !== undefined
          ? JSON.stringify(body)
          : undefined,
    }
  );
}

/* ============================================================
   DELETE
============================================================ */

export async function apiDelete<T = void>(
  endpoint: string
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "DELETE",
    }
  );
}