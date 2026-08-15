import type {
  JobMatchResponse,
  JobMatch,
} from "@/types/match";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";


async function getAuthHeaders(): Promise<HeadersInit> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

/*
|--------------------------------------------------------------------------
| HANDLE API RESPONSE
|--------------------------------------------------------------------------
*/

async function parseResponse<T>(
  response: Response
): Promise<T> {
  let result: any = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
        result?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return result as T;
}

/*
|--------------------------------------------------------------------------
| GET JOB MATCHES
|--------------------------------------------------------------------------
*/

export async function getJobMatches(
  jobId: string
): Promise<JobMatch[]> {
  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(
    `${API_URL}/matches/job/${jobId}`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
      credentials: "include",
      cache: "no-store",
    }
  );

  const result =
    await parseResponse<JobMatchResponse>(
      response
    );

  return Array.isArray(result.data)
    ? result.data
    : [];
}

/*
|--------------------------------------------------------------------------
| GET SINGLE MATCH
|--------------------------------------------------------------------------
*/

export async function getMatchById(
  matchId: string
): Promise<JobMatch> {
  if (!matchId) {
    throw new Error("Match ID is required.");
  }

  const response = await fetch(
    `${API_URL}/matches/${matchId}`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
      credentials: "include",
      cache: "no-store",
    }
  );

  const result =
    await parseResponse<{
      success: boolean;
      message?: string;
      data: JobMatch;
    }>(response);

  return result.data;
}

/*
|--------------------------------------------------------------------------
| CREATE MATCH
|--------------------------------------------------------------------------
*/

export async function createMatch(
  jobId: string,
  resumeId: string
): Promise<JobMatch> {
  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  if (!resumeId) {
    throw new Error("Resume ID is required.");
  }

  const response = await fetch(
    `${API_URL}/matches`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        jobId,
        resumeId,
      }),
    }
  );

  const result =
    await parseResponse<{
      success: boolean;
      message?: string;
      data: JobMatch;
    }>(response);

  return result.data;
}

/*
|--------------------------------------------------------------------------
| DELETE MATCH
|--------------------------------------------------------------------------
*/

export async function deleteMatch(
  matchId: string
): Promise<void> {
  if (!matchId) {
    throw new Error("Match ID is required.");
  }

  const response = await fetch(
    `${API_URL}/matches/${matchId}`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
      credentials: "include",
    }
  );

  await parseResponse<{
    success: boolean;
    message?: string;
  }>(response);
}

/*
|--------------------------------------------------------------------------
| GET ALL MATCHES
|--------------------------------------------------------------------------
*/

export async function getMatches(): Promise<
  JobMatch[]
> {
  const response = await fetch(
    `${API_URL}/matches`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
      credentials: "include",
      cache: "no-store",
    }
  );

  const result =
    await parseResponse<{
      success: boolean;
      message?: string;
      data: JobMatch[];
    }>(response);

  return Array.isArray(result.data)
    ? result.data
    : [];
}

/*
|--------------------------------------------------------------------------
| GENERATE MATCHES FOR JOB
|--------------------------------------------------------------------------
*/

export async function generateJobMatches(
  jobId: string
): Promise<JobMatch[]> {
  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(
    `${API_URL}/matches/job/${jobId}/generate`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        jobId,
      }),
    }
  );

  const result =
    await parseResponse<{
      success: boolean;
      message?: string;
      data: JobMatch[];
    }>(response);

  return Array.isArray(result.data)
    ? result.data
    : [];
}

/*
|--------------------------------------------------------------------------
| REFRESH JOB MATCHES
|--------------------------------------------------------------------------
*/

export async function refreshJobMatches(
  jobId: string
): Promise<JobMatch[]> {
  if (!jobId) {
    throw new Error("Job ID is required.");
  }

  const response = await fetch(
    `${API_URL}/matches/job/${jobId}/refresh`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({
        jobId,
      }),
      cache: "no-store",
    }
  );

  const result =
    await parseResponse<{
      success: boolean;
      message?: string;
      data: JobMatch[];
    }>(response);

  return Array.isArray(result.data)
    ? result.data
    : [];
}

