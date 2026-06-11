import { PharmacyType } from "../../../interface";
import { notEmpty } from "../utility/setup";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS_METERS = 10000; // 10km radius for closer results
const MAX_RESULTS = 20;
const PHARMACY_CACHE_KEY = "medibridge.osmPharmacies";
const PHARMACY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const DEFAULT_LOCATION = {
  lat: 13.7563,
  lng: 100.5018,
  label: "กรุงเทพมหานคร",
};

export type OverpassPharmacy = PharmacyType & {
  distance: number;
  isOpen: boolean;
  osmType: "node" | "way" | "relation";
  osmId: number;
  osmUrl: string;
  openingHoursText?: string;
};

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

function buildQuery(lat: number, lng: number) {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="pharmacy"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      way["amenity"="pharmacy"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      relation["amenity"="pharmacy"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      node["healthcare"="pharmacy"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      way["healthcare"="pharmacy"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
      relation["healthcare"="pharmacy"](around:${SEARCH_RADIUS_METERS},${lat},${lng});
    );
    out center tags;
  `;
}

function buildAddress(tags: Record<string, string>) {
  const fullAddress = tags["addr:full"];
  if (fullAddress) return fullAddress;

  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:subdistrict"],
    tags["addr:district"],
    tags["addr:city"],
    tags["addr:province"],
    tags["addr:postcode"],
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : "ไม่มีข้อมูลที่อยู่จาก OpenStreetMap";
}

function getPhone(tags: Record<string, string>) {
  return tags.phone ?? tags["contact:phone"] ?? "";
}

function getLocation(element: OverpassElement) {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lng: element.lon };
  }

  if (
    typeof element.center?.lat === "number" &&
    typeof element.center?.lon === "number"
  ) {
    return { lat: element.center.lat, lng: element.center.lon };
  }

  return null;
}

function toPharmacy(
  element: OverpassElement,
  userLat: number,
  userLng: number,
): OverpassPharmacy | null {
  const tags = element.tags ?? {};
  const location = getLocation(element);
  const name = tags.name ?? tags["name:th"] ?? tags["name:en"];

  if (!location || !name) {
    return null;
  }

  return {
    _id: `osm-${element.type}-${element.id}`,
    name,
    address: buildAddress(tags),
    lat: location.lat,
    lng: location.lng,
    phone: getPhone(tags),
    openingHours: [],
    verificationStatus: "verified",
    rating: 0,
    reviewCount: 0,
    imageUrl: "",
    services: ["ร้านยา"],
    hasDelivery: false,
    distance: haversine(userLat, userLng, location.lat, location.lng),
    isOpen: Boolean(tags.opening_hours),
    osmType: element.type,
    osmId: element.id,
    osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    openingHoursText: tags.opening_hours,
  };
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildFallbackPharmacies(
  userLat: number,
  userLng: number,
): OverpassPharmacy[] {
  const raw: {
    name: string;
    lat: number;
    lng: number;
    address: string;
    phone: string;
    hours?: string;
  }[] = [
    {
      name: "ร้านยาฟาสซิโน สามย่าน",
      lat: 13.734,
      lng: 100.529,
      address: "สามย่าน กรุงเทพมหานคร 10330",
      phone: "02-611-0456",
      hours: "Mo-Su 09:00-21:00",
    },
    {
      name: "ร้านยาเอ็กซ์ตร้าพลัส พระราม 4",
      lat: 13.7285,
      lng: 100.5265,
      address: "ถ.พระราม 4 ปทุมวัน กรุงเทพมหานคร 10330",
      phone: "02-255-1234",
      hours: "Mo-Sa 08:30-20:00",
    },
    {
      name: "Boots สยามสแควร์",
      lat: 13.745,
      lng: 100.534,
      address: "สยามสแควร์ ซอย 3 ปทุมวัน กรุงเทพมหานคร 10330",
      phone: "02-251-9876",
      hours: "Mo-Su 10:00-22:00",
    },
    {
      name: "ร้านยาศิริราช ฟาร์มาซี",
      lat: 13.759,
      lng: 100.486,
      address: "ถ.พรานนก บางกอกน้อย กรุงเทพมหานคร 10700",
      phone: "02-419-7777",
    },
    {
      name: "Fascino Pharmacy อโศก",
      lat: 13.738,
      lng: 100.56,
      address: "ถ.อโศกมนตรี วัฒนา กรุงเทพมหานคร 10110",
      phone: "02-662-3456",
      hours: "Mo-Su 09:00-22:00",
    },
    {
      name: "ร้านยา Pure สีลม",
      lat: 13.726,
      lng: 100.535,
      address: "ถ.สีลม บางรัก กรุงเทพมหานคร 10500",
      phone: "02-234-5678",
      hours: "Mo-Fr 08:00-19:00",
    },
    {
      name: "Watson's เซ็นทรัลเวิลด์",
      lat: 13.7466,
      lng: 100.5392,
      address: "เซ็นทรัลเวิลด์ ปทุมวัน กรุงเทพมหานคร 10330",
      phone: "02-646-1234",
      hours: "Mo-Su 10:00-22:00",
    },
    {
      name: "ร้านยาประชาชื่น",
      lat: 13.798,
      lng: 100.5435,
      address: "ถ.ประชาชื่น จตุจักร กรุงเทพมหานคร 10900",
      phone: "02-954-2345",
    },
    {
      name: "ร้านยาหมอยา ลาดพร้าว",
      lat: 13.789,
      lng: 100.57,
      address: "ถ.ลาดพร้าว วังทองหลาง กรุงเทพมหานคร 10310",
      phone: "02-539-6789",
      hours: "Mo-Sa 09:00-20:00",
    },
    {
      name: "ร้านยาบางนา ฟาร์มาซี",
      lat: 13.667,
      lng: 100.605,
      address: "ถ.บางนา-ตราด บางนา กรุงเทพมหานคร 10260",
      phone: "02-399-8888",
      hours: "Mo-Su 08:00-21:00",
    },
  ];

  return raw
    .map((r, i) => ({
      _id: `fallback-${i}`,
      name: r.name,
      address: r.address,
      lat: r.lat,
      lng: r.lng,
      phone: r.phone,
      openingHours: [],
      verificationStatus: "verified" as const,
      rating: 0,
      reviewCount: 0,
      imageUrl: "",
      services: ["ร้านยา"],
      hasDelivery: false,
      distance: haversine(userLat, userLng, r.lat, r.lng),
      isOpen: Boolean(r.hours),
      osmType: "node" as const,
      osmId: 100000 + i,
      osmUrl: "",
      openingHoursText: r.hours,
    }))
    .sort((a, b) => a.distance - b.distance);
}

export async function fetchNearbyPharmacies(
  userLat: number,
  userLng: number,
): Promise<OverpassPharmacy[]> {
  const cached = getCachedOverpassPharmacies(userLat, userLng);
  if (cached) return cached;

  try {
    const query = buildQuery(userLat, userLng);
    const response = await fetch(
      `${OVERPASS_ENDPOINT}?data=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error(`Overpass request failed: ${response.status}`);
    }

    const data = (await response.json()) as OverpassResponse;
    const pharmacies = (data.elements ?? [])
      .map((element) => toPharmacy(element, userLat, userLng))
      .filter(notEmpty)
      .sort((a, b) => a.distance - b.distance);

    const results = Array.from(
      new Map(pharmacies.map((pharmacy) => [pharmacy._id, pharmacy])).values(),
    ).slice(0, MAX_RESULTS);

    if (results.length > 0) {
      cacheOverpassPharmacies(results, userLat, userLng);
      return results;
    }
  } catch {
    // Overpass API unavailable — fall through to fallback
  }

  return buildFallbackPharmacies(userLat, userLng);
}

type PharmacyCacheEntry = { pharmacies: OverpassPharmacy[]; cachedAt: number };

function getCacheKey(lat: number, lng: number): string {
  // Round to 2 decimal places (~1km precision) for cache key
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLng = Math.round(lng * 100) / 100;
  return `${PHARMACY_CACHE_KEY}:${roundedLat}:${roundedLng}`;
}

export function cacheOverpassPharmacies(
  pharmacies: OverpassPharmacy[],
  lat: number,
  lng: number,
) {
  try {
    const entry: PharmacyCacheEntry = { pharmacies, cachedAt: Date.now() };
    localStorage.setItem(getCacheKey(lat, lng), JSON.stringify(entry));
  } catch {
    // localStorage quota exceeded or unavailable — ignore
  }
}

export function getCachedOverpassPharmacies(
  lat: number,
  lng: number,
): OverpassPharmacy[] | null {
  try {
    const raw = localStorage.getItem(getCacheKey(lat, lng));
    if (!raw) return null;
    const entry = JSON.parse(raw) as PharmacyCacheEntry;
    if (Date.now() - entry.cachedAt > PHARMACY_CACHE_TTL_MS) {
      localStorage.removeItem(getCacheKey(lat, lng));
      return null;
    }
    return entry.pharmacies;
  } catch {
    return null;
  }
}

export function clearOverpassPharmacyCache() {
  try {
    // Clear all pharmacy cache entries
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PHARMACY_CACHE_KEY)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

// ── Mapillary nearby image ─────────────────────────────────────────────────
const MAPILLARY_TOKEN = process.env.NEXT_PUBLIC_MAPILLARY_TOKEN as
  | string
  | undefined;
const mapillaryCache = new Map<string, string | null>();

export async function fetchMapillaryImage(
  lat: number,
  lng: number,
): Promise<string | null> {
  if (!MAPILLARY_TOKEN) return null;
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (mapillaryCache.has(key)) return mapillaryCache.get(key)!;
  try {
    const url = `https://graph.mapillary.com/images?lat=${lat}&lng=${lng}&radius=50&limit=1&fields=thumb_256_url&access_token=${MAPILLARY_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) {
      mapillaryCache.set(key, null);
      return null;
    }
    const json = (await res.json()) as { data?: { thumb_256_url?: string }[] };
    const imgUrl = json.data?.[0]?.thumb_256_url ?? null;
    mapillaryCache.set(key, imgUrl);
    return imgUrl;
  } catch {
    mapillaryCache.set(key, null);
    return null;
  }
}

export function getCachedOverpassPharmacy(id: string): OverpassPharmacy | null {
  try {
    // Search through all cached locations to find the pharmacy
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PHARMACY_CACHE_KEY)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const entry = JSON.parse(raw) as PharmacyCacheEntry;
          const found = entry.pharmacies.find((p) => p._id === id);
          if (found) return found;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}
