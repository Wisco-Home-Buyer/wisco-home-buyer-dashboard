import { isUsStateCode } from "../lib/us-states";

export interface ZipLookupResult {
  city: string;
  state: string;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  "ISO3166-2-lvl4"?: string;
}

interface NominatimHit {
  address?: NominatimAddress;
}

/**
 * Resolves a 5-digit US ZIP to its city and state using OpenStreetMap
 * Nominatim (the same free service the map features already use).
 * Returns null when the ZIP is unknown or the lookup fails.
 */
export async function lookupZip(
  zip: string,
  signal?: AbortSignal,
): Promise<ZipLookupResult | null> {
  const query = new URLSearchParams({
    postalcode: zip,
    countrycodes: "us",
    format: "json",
    addressdetails: "1",
    limit: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${query.toString()}`,
    { signal, headers: { Accept: "application/json" } },
  );
  if (!response.ok) return null;

  const hits = (await response.json()) as NominatimHit[];
  const address = hits[0]?.address;
  if (!address) return null;

  const city =
    address.city ?? address.town ?? address.village ?? address.hamlet;
  const state = address["ISO3166-2-lvl4"]?.replace(/^US-/, "");

  if (!city || !state || !isUsStateCode(state)) return null;
  return { city, state };
}
