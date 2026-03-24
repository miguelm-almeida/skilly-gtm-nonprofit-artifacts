import type { LocationFilter, SearchOrg, SSEProgress } from "./types";

const DEFAULT_RADIUS_MILES = 100;
const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const locationCache = new Map<string, { latitude: number; longitude: number; stateCode: string | null } | null>();

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineMiles(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const lat1 = toRadians(aLat);
  const lat2 = toRadians(bLat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
}

function extractStateCode(
  components: Array<{ long_name: string; short_name: string; types: string[] }>,
): string | null {
  const state = components.find((c) => c.types.includes("administrative_area_level_1"));
  if (!state) return null;
  const code = state.short_name;
  return /^[A-Z]{2}$/.test(code) ? code : null;
}

async function reverseGeocodeState(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: apiKey,
    result_type: "administrative_area_level_1",
  });

  try {
    const response = await fetch(`${GOOGLE_GEOCODE_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as {
      status: string;
      results: Array<{
        address_components: Array<{ long_name: string; short_name: string; types: string[] }>;
      }>;
    };

    if (payload.status !== "OK" || !payload.results[0]) return null;
    return extractStateCode(payload.results[0].address_components);
  } catch {
    return null;
  }
}

async function geocodeLabel(
  label: string,
): Promise<{ latitude: number; longitude: number; stateCode: string | null } | null> {
  const key = normalize(label);
  if (locationCache.has(key)) {
    return locationCache.get(key) ?? null;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
  }

  const params = new URLSearchParams({
    address: label,
    key: apiKey,
    components: "country:US",
  });

  const response = await fetch(`${GOOGLE_GEOCODE_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Google Geocoding failed for "${label}"`);
  }

  const payload = (await response.json()) as {
    status: string;
    results: Array<{
      geometry: { location: { lat: number; lng: number } };
      address_components: Array<{ long_name: string; short_name: string; types: string[] }>;
    }>;
  };

  if (payload.status !== "OK" || !payload.results[0]) {
    locationCache.set(key, null);
    return null;
  }

  const first = payload.results[0];
  const latitude = first.geometry.location.lat;
  const longitude = first.geometry.location.lng;
  const stateCode = extractStateCode(first.address_components);

  const result =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude, stateCode }
      : null;

  locationCache.set(key, result);
  return result;
}

export async function resolveLocationFilter(input: {
  label?: string;
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
}): Promise<LocationFilter | null> {
  const radiusMiles = input.radiusMiles ?? DEFAULT_RADIUS_MILES;

  if (
    typeof input.latitude === "number" &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.longitude)
  ) {
    const stateCode = await reverseGeocodeState(input.latitude, input.longitude);
    return {
      label: input.label?.trim() || `${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`,
      latitude: input.latitude,
      longitude: input.longitude,
      radiusMiles,
      stateCode,
    };
  }

  const label = input.label?.trim();
  if (!label) return null;

  const resolved = await geocodeLabel(label);
  if (!resolved) {
    throw new Error(`Could not resolve location "${label}"`);
  }

  return {
    label,
    latitude: resolved.latitude,
    longitude: resolved.longitude,
    radiusMiles,
    stateCode: resolved.stateCode,
  };
}

export async function filterOrgsByRadius(
  orgs: SearchOrg[],
  locationFilter: LocationFilter,
  onProgress?: (event: SSEProgress) => void,
): Promise<{ orgs: SearchOrg[]; distancesByEin: Record<number, number> }> {
  const distancesByEin: Record<number, number> = {};
  const matches: Array<{ org: SearchOrg; distanceMiles: number }> = [];
  const uniqueLabels = [...new Set(orgs.map((org) => `${org.city}, ${org.state}`))];
  const coordsByLabel = new Map<string, { latitude: number; longitude: number } | null>();

  for (let i = 0; i < uniqueLabels.length; i++) {
    const label = uniqueLabels[i];
    onProgress?.({
      phase: "filter",
      current: i + 1,
      total: uniqueLabels.length,
      message: `Geocoding ${i + 1} of ${uniqueLabels.length} nonprofit locations...`,
    });
    coordsByLabel.set(label, await geocodeLabel(label));
  }

  for (const org of orgs) {
    const label = `${org.city}, ${org.state}`;
    const coords = coordsByLabel.get(label);
    if (!coords) continue;

    const distanceMiles = haversineMiles(
      locationFilter.latitude,
      locationFilter.longitude,
      coords.latitude,
      coords.longitude,
    );

    if (distanceMiles <= locationFilter.radiusMiles) {
      distancesByEin[org.ein] = distanceMiles;
      matches.push({ org, distanceMiles });
    }
  }

  matches.sort((a, b) => a.distanceMiles - b.distanceMiles);

  return {
    orgs: matches.map((entry) => entry.org),
    distancesByEin,
  };
}
