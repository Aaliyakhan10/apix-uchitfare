/** Same-origin sample APIs keep the submission demo reproducible and offline-capable. */
export async function getActiveBackendUrl(): Promise<string> { return ""; }
export async function fetchFromBackend(endpoint: string, options?: RequestInit): Promise<Response> {
  const path = endpoint === "/api/routes/flagged" ? "/api/routes?flagged=true" : endpoint;
  const response = await fetch(path, { ...options, signal: options?.signal ?? AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${path}`);
  return response;
}
