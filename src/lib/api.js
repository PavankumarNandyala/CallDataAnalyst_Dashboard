// Single place that knows where the data lives.
// You can override it with a VITE_API_URL environment variable (.env file or Vercel settings).
export const API_URL =
  import.meta.env.VITE_API_URL ?? "https://69b30b45e224ec066bdb55a0.mockapi.io/api/v1/cdr";

/**
 * Fetch all call data records from the CDR API.
 * Returns a cleaned array where numbers are numbers, booleans are booleans
 * and timestamps are Date objects.
 */
export async function fetchCalls(signal) {
  const res = await fetch(API_URL, { signal });
  if (!res.ok) throw new Error(`API request failed (${res.status} ${res.statusText})`);
  const raw = await res.json();
  return raw.map(normalizeCall);
}

// The API sends callCost as a string ("140.38") and booleans may arrive as strings,
// so we convert everything once here and the rest of the app can trust the types.
const toBool = (v) => v === true || v === "true";

export function normalizeCall(c) {
  return {
    id: String(c.id),
    callerName: c.callerName ?? "Unknown",
    callerNumber: c.callerNumber ?? "",
    receiverNumber: c.receiverNumber ?? "",
    city: c.city ?? "Unknown",
    isInbound: toBool(c.callDirection), // true = inbound, false = outbound
    isSuccessful: toBool(c.callStatus), // true = successful, false = failed
    duration: Number(c.callDuration) || 0, // seconds
    cost: Number.parseFloat(c.callCost) || 0,
    startTime: new Date(c.callStartTime),
    endTime: new Date(c.callEndTime),
  };
}
