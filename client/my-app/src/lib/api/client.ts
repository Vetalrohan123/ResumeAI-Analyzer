"use client";

/* ============================================================
   API CLIENT
   Cookie-Based Authentication
============================================================ */

/* ============================================================
   API CONFIG
============================================================ */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

/* ============================================================
   API ERROR
============================================================ */

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/* ============================================================
   API RESPONSE
============================================================ */

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/* ============================================================
   AUTH
============================================================ */

/**
 * Authentication is now cookie-based.
 *
 * The accessToken is stored in an HTTP-only cookie
 * by the backend.
 *
 * JavaScript cannot access HTTP-only cookies, which
 * is intentional for security.
 *
 * The browser automatically sends the cookie because
 * every request uses:
 *
 * credentials: "include"
 */

/**
 * Kept for backward compatibility with existing
 * frontend imports.
 *
 * Do NOT use this to authenticate requests.
 */
export function getAccessToken(): null {
  return null;
}

/**
 * Authentication cookies cannot be removed from
 * JavaScript because they are HTTP-only.
 *
 * Logout must be handled by the backend:
 *
 * POST /auth/logout
 */
export function clearAuthToken(): void {
  console.info(
    "[API] Authentication is cookie-based. " +
      "The backend must clear the HTTP-only cookie."
  );
}

/* ============================================================
   AUTH REDIRECT
============================================================ */

function redirectToLogin(): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const currentPath =
    window.location.pathname;

  /* ----------------------------------------------------------
     Do not redirect if already on auth pages
  ---------------------------------------------------------- */

  if (
    currentPath === "/login" ||
    currentPath === "/signup"
  ) {
    return;
  }

  /* ----------------------------------------------------------
     Avoid redirect loops
  ---------------------------------------------------------- */

  if (
    currentPath.startsWith(
      "/login"
    )
  ) {
    return;
  }

  /* ----------------------------------------------------------
     Preserve current path
  ---------------------------------------------------------- */

  const redirect =
    `${window.location.pathname}` +
    `${window.location.search}`;

  const loginUrl =
    `/login?redirect=${encodeURIComponent(
      redirect
    )}`;

  window.location.replace(
    loginUrl
  );
}

/* ============================================================
   ERROR MESSAGE
============================================================ */

function getErrorMessage(
  data: unknown,
  status: number
): string {
  /* ----------------------------------------------------------
     Backend error response
  ---------------------------------------------------------- */

  if (
    data &&
    typeof data === "object"
  ) {
    const response =
      data as ApiResponse<unknown>;

    if (
      typeof response.message ===
      "string" &&
      response.message.trim()
    ) {
      return response.message;
    }

    if (
      typeof response.error ===
      "string" &&
      response.error.trim()
    ) {
      return response.error;
    }
  }

  /* ----------------------------------------------------------
     HTTP status messages
  ---------------------------------------------------------- */

  switch (status) {
    case 400:
      return "Invalid request.";

    case 401:
      return (
        "Your session has expired. " +
        "Please log in again."
      );

    case 403:
      return (
        "You do not have permission " +
        "to perform this action."
      );

    case 404:
      return (
        "The requested resource " +
        "was not found."
      );

    case 409:
      return (
        "This request conflicts " +
        "with existing data."
      );

    case 422:
      return (
        "Please check the submitted information."
      );

    case 429:
      return (
        "Too many requests. " +
        "Please try again later."
      );

    case 500:
      return (
        "Something went wrong on the server."
      );

    case 502:
      return (
        "The server is temporarily unavailable."
      );

    case 503:
      return (
        "The service is temporarily unavailable."
      );

    case 504:
      return (
        "The server took too long to respond."
      );

    default:
      return (
        `Request failed with status ${status}.`
      );
  }
}

/* ============================================================
   PARSE RESPONSE
============================================================ */

async function parseResponse(
  response: Response
): Promise<unknown> {
  const text =
    await response.text();

  /* ----------------------------------------------------------
     Empty response
  ---------------------------------------------------------- */

  if (!text) {
    return null;
  }

  /* ----------------------------------------------------------
     JSON response
  ---------------------------------------------------------- */

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "[API] Invalid JSON response:",
      error
    );

    throw new ApiError(
      `Invalid server response. Status: ${response.status}`,
      response.status
    );
  }
}

/* ============================================================
   API REQUEST
============================================================ */

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  /* ----------------------------------------------------------
     Validate endpoint
  ---------------------------------------------------------- */

  if (
    !endpoint ||
    !endpoint.trim()
  ) {
    throw new ApiError(
      "API endpoint is required.",
      400
    );
  }

  /* ----------------------------------------------------------
     Build headers
  ---------------------------------------------------------- */

  const headers =
    new Headers(
      options.headers
    );

  headers.set(
    "Accept",
    "application/json"
  );

  /* ----------------------------------------------------------
     Content-Type
     
     Only set it when there is a body.
  ---------------------------------------------------------- */

  if (
    options.body !== undefined &&
    options.body !== null
  ) {
    /*
     * Do not override multipart/form-data.
     * The browser must set its own boundary.
     */
    if (
      !(options.body instanceof FormData)
    ) {
      headers.set(
        "Content-Type",
        "application/json"
      );
    }
  }

  /* ----------------------------------------------------------
     Request URL
  ---------------------------------------------------------- */

  const url =
    `${API_URL}${endpoint}`;

  console.log(
    "[API]",
    options.method || "GET",
    url
  );

  /* ----------------------------------------------------------
     Network request
     
     IMPORTANT:
     
     credentials: "include"
     
     tells the browser to send HTTP-only
     authentication cookies.
  ---------------------------------------------------------- */

  let response: Response;

  try {
    response =
      await fetch(
        url,
        {
          ...options,

          headers,

          /*
           * Required for cookie-based authentication.
           */
          credentials: "include",

          /*
           * Prevent stale authenticated
           * responses.
           */
          cache: "no-store",
        }
      );
  } catch (error) {
    console.error(
      "[API] Network error:",
      error
    );

    throw new ApiError(
      "Unable to connect to the server. " +
        "Please make sure the backend server is running.",
      0,
      error
    );
  }

  /* ==========================================================
     PARSE RESPONSE
  ========================================================== */

  let data: unknown = null;

  try {
    data =
      await parseResponse(
        response
      );
  } catch (error) {
    /*
     * If the response was already an ApiError,
     * rethrow it.
     */

    if (
      error instanceof ApiError
    ) {
      throw error;
    }

    throw new ApiError(
      "Unable to read the server response.",
      response.status,
      error
    );
  }

  /* ==========================================================
     401 UNAUTHORIZED
  ========================================================== */

  if (
    response.status === 401
  ) {
    console.warn(
      "[API] Unauthorized request:",
      endpoint
    );

    /*
     * We cannot remove an HTTP-only cookie
     * from JavaScript.
     *
     * The backend should clear it during
     * logout or token refresh failure.
     */

    redirectToLogin();

    throw new ApiError(
      getErrorMessage(
        data,
        401
      ),
      401,
      data
    );
  }

  /* ==========================================================
     403 FORBIDDEN
  ========================================================== */

  if (
    response.status === 403
  ) {
    throw new ApiError(
      getErrorMessage(
        data,
        403
      ),
      403,
      data
    );
  }

  /* ==========================================================
     404 NOT FOUND
  ========================================================== */

  if (
    response.status === 404
  ) {
    throw new ApiError(
      getErrorMessage(
        data,
        404
      ),
      404,
      data
    );
  }

  /* ==========================================================
     400 BAD REQUEST
  ========================================================== */

  if (
    response.status === 400
  ) {
    throw new ApiError(
      getErrorMessage(
        data,
        400
      ),
      400,
      data
    );
  }

  /* ==========================================================
     409 CONFLICT
  ========================================================== */

  if (
    response.status === 409
  ) {
    throw new ApiError(
      getErrorMessage(
        data,
        409
      ),
      409,
      data
    );
  }

  /* ==========================================================
     422 VALIDATION ERROR
  ========================================================== */

  if (
    response.status === 422
  ) {
    throw new ApiError(
      getErrorMessage(
        data,
        422
      ),
      422,
      data
    );
  }

  /* ==========================================================
     429 RATE LIMIT
  ========================================================== */

  if (
    response.status === 429
  ) {
    throw new ApiError(
      getErrorMessage(
        data,
        429
      ),
      429,
      data
    );
  }

  /* ==========================================================
     SERVER ERRORS
  ========================================================== */

  if (
    response.status >= 500
  ) {
    throw new ApiError(
      getErrorMessage(
        data,
        response.status
      ),
      response.status,
      data
    );
  }

  /* ==========================================================
     OTHER HTTP ERRORS
  ========================================================== */

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        data,
        response.status
      ),
      response.status,
      data
    );
  }

  /* ==========================================================
     SUCCESS
  ========================================================== */

  return data as T;
}

/* ============================================================
   GET
============================================================ */

export function apiGet<T>(
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

export function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "POST",

      body:
        body !== undefined
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
    }
  );
}

/* ============================================================
   PUT
============================================================ */

export function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "PUT",

      body:
        body !== undefined
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
    }
  );
}

/* ============================================================
   PATCH
============================================================ */

export function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "PATCH",

      body:
        body !== undefined
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
    }
  );
}

/* ============================================================
   DELETE
============================================================ */

export function apiDelete<T = unknown>(
  endpoint: string
): Promise<T> {
  return apiRequest<T>(
    endpoint,
    {
      method: "DELETE",
    }
  );
}