/**
 * Centralized API Client & Port Fallback Configuration for APIx Dashboard.
 * Supports automated failover across ports 8000 and 8001 and NEXT_PUBLIC_API_URL.
 */

export const BACKEND_CANDIDATES = [
  process.env.NEXT_PUBLIC_API_URL,
  "http://127.0.0.1:8000",
  "http://127.0.0.1:8001",
  "http://localhost:8000",
  "http://localhost:8001",
].filter(Boolean) as string[];

let resolvedBackendUrl: string | null = null;

export async function getActiveBackendUrl(): Promise<string> {
  if (resolvedBackendUrl) {
    return resolvedBackendUrl;
  }

  for (const base of BACKEND_CANDIDATES) {
    try {
      const res = await fetch(`${base}/api/overview`, {
        method: "GET",
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) {
        resolvedBackendUrl = base;
        return base;
      }
    } catch {
      // try next candidate
    }
  }

  // Default fallback if offline
  return "http://127.0.0.1:8000";
}

export async function fetchFromBackend(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanPath = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  
  // Try previously active backend first
  if (resolvedBackendUrl) {
    try {
      const res = await fetch(`${resolvedBackendUrl}${cleanPath}`, {
        ...options,
        signal: options?.signal || AbortSignal.timeout(3000)
      });
      if (res.ok) return res;
    } catch {
      resolvedBackendUrl = null; // Invalidate and search again
    }
  }

  // Iterate candidates
  for (const base of BACKEND_CANDIDATES) {
    try {
      const res = await fetch(`${base}${cleanPath}`, {
        ...options,
        signal: options?.signal || AbortSignal.timeout(2000)
      });
      if (res.ok) {
        resolvedBackendUrl = base;
        return res;
      }
    } catch {
      // continue to next candidate
    }
  }

  throw new Error(`Failed to fetch ${cleanPath} from all backend candidates`);
}
