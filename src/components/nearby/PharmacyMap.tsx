"use client";
import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { DEFAULT_LOCATION, OverpassPharmacy } from "./overpassPharmacies";
import React from "react";

// ─── MapTiler API key ────────────────────────────────────────────────────────
// Get a free key at https://cloud.maptiler.com/account/keys (free tier: 100k views/mo)
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "YOUR_MAPTILER_KEY";
const TILE_STYLE = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

function formatDistance(distance: number) {
  return distance < 1
    ? `${(distance * 1000).toFixed(0)} ม.`
    : `${distance.toFixed(1)} กม.`;
}

const SEARCH_RADIUS_METERS = 10000; // 10km radius

// Great-circle point at bearing/distance from a lat/lng
function destinationPoint(
  lat: number,
  lng: number,
  bearing: number,
  distanceM: number,
): [number, number] {
  const R = 6371000;
  const d = distanceM / R;
  const brng = (bearing * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lng1 = (lng * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
    );
  return [(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

function buildRadiusGeoJSON(lat: number, lng: number, radiusM: number) {
  const steps = 64;
  const coords = Array.from({ length: steps + 1 }, (_, i) => {
    const bearing = (i / steps) * 360;
    return destinationPoint(lat, lng, bearing, radiusM);
  });
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: { type: "Polygon" as const, coordinates: [coords] },
        properties: {},
      },
    ],
  };
}

interface Location {
  lat: number;
  lng: number;
  label: string;
}

interface Props {
  pharmacies: OverpassPharmacy[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  count: number;
  userLocation?: Location;
  recenterKey?: number; // Increment to force recenter
  onMapClick?: (lat: number, lng: number) => void; // Click on map to set location
  allowMapSelection?: boolean; // Enable clicking on map to select location
}

export default function PharmacyMap({
  pharmacies,
  selectedId,
  onSelect,
  count,
  userLocation,
  recenterKey,
  onMapClick,
  allowMapSelection,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const clickMarkerRef = useRef<maplibregl.Marker | null>(null);
  const fittedRef = useRef(false);
  const locationFlyDoneRef = useRef(false);
  const userLocationRef = useRef<Location | undefined>(userLocation);
  const selectedIdRef = useRef<string | null>(selectedId);
  // Keep latest pharmacies accessible inside initMap() without stale closure
  const pharmaciesRef = useRef<OverpassPharmacy[]>(pharmacies);
  const syncMarkersRef = useRef<((map: maplibregl.Map) => void) | null>(null);

  // ── Create map once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Defer one rAF so the browser has painted the container with real dimensions
    // before WebGL tries to acquire a context (prevents "WebGL context was lost")
    const rafId = requestAnimationFrame(() => {
      if (!containerRef.current || mapRef.current) return;

      // Use userLocation if available, otherwise default to Bangkok
      const initialCenter = userLocationRef.current ?? DEFAULT_LOCATION;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: TILE_STYLE,
        center: [initialCenter.lng, initialCenter.lat],
        zoom: initialCenter.lat !== DEFAULT_LOCATION.lat ? 15 : 13, // Higher zoom for real position
        attributionControl: false,
      });

      // Suppress noisy "styleimagemissing" warnings from MapTiler sprite sheet
      map.on("styleimagemissing", () => {});

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right",
      );
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );

      // User location dot
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="position:relative;width:20px;height:20px">
          <div style="
            position:absolute;inset:0;
            border-radius:50%;
            background:rgba(59,130,246,0.25);
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:absolute;inset:3px;
            border-radius:50%;
            background:#3b82f6;
            border:2px solid white;
            box-shadow:0 2px 8px rgba(59,130,246,0.5);
          "></div>
        </div>
        <style>
          @keyframes ping {
            75%,100%{transform:scale(2);opacity:0}
          }
        </style>
      `;

      // Use current userLocation if available, otherwise default
      const initialLoc = userLocationRef.current ?? DEFAULT_LOCATION;
      userMarkerRef.current = new maplibregl.Marker({
        element: userEl,
        anchor: "center",
      })
        .setLngLat([initialLoc.lng, initialLoc.lat])
        .addTo(map);

      map.on("load", () => {
        map.resize();

        const loc = userLocationRef.current ?? DEFAULT_LOCATION;
        const geojson = buildRadiusGeoJSON(
          loc.lat,
          loc.lng,
          SEARCH_RADIUS_METERS,
        );
        map.addSource("radius", { type: "geojson", data: geojson });
        map.addLayer({
          id: "radius-fill",
          type: "fill",
          source: "radius",
          paint: { "fill-color": "#6366f1", "fill-opacity": 0.04 },
        });
        map.addLayer({
          id: "radius-border",
          type: "line",
          source: "radius",
          paint: {
            "line-color": "#6366f1",
            "line-opacity": 0.25,
            "line-width": 1.5,
            "line-dasharray": [4, 3],
          },
        });
      });

      mapRef.current = map;

      // After the map renders its first frame, flush any pharmacies that
      // arrived before the map was ready (resolves the rAF race condition)
      map.once("idle", () => {
        syncMarkersRef.current?.(map);
      });
    });

    return () => {
      cancelAnimationFrame(rafId);
      mapRef.current?.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  // ── Sync user location dot + radius circle when GPS coords arrive ─────────────
  useEffect(() => {
    userLocationRef.current = userLocation;
    const map = mapRef.current;
    if (!userLocation || !map) return;

    const { lat, lng } = userLocation;

    // Create or move the blue dot
    if (!userMarkerRef.current) {
      // Marker doesn't exist yet (location arrived before map init) - create it now
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="position:relative;width:20px;height:20px">
          <div style="
            position:absolute;inset:0;
            border-radius:50%;
            background:rgba(59,130,246,0.25);
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:absolute;inset:3px;
            border-radius:50%;
            background:#3b82f6;
            border:2px solid white;
            box-shadow:0 2px 8px rgba(59,130,246,0.5);
          "></div>
        </div>
        <style>
          @keyframes ping {
            75%,100%{transform:scale(2);opacity:0}
          }
        </style>
      `;
      userMarkerRef.current = new maplibregl.Marker({
        element: userEl,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(map);
    } else {
      // Marker exists - just move it
      userMarkerRef.current.setLngLat([lng, lat]);
    }

    // Update radius circle GeoJSON
    if (map.getSource("radius")) {
      (map.getSource("radius") as maplibregl.GeoJSONSource).setData(
        buildRadiusGeoJSON(lat, lng, SEARCH_RADIUS_METERS),
      );
    }

    // Fly to real position once (first GPS fix) — but only if no pharmacy is selected yet
    if (!locationFlyDoneRef.current) {
      locationFlyDoneRef.current = true;
      // Only fly if it's a real position (not the Bangkok default) AND user hasn't
      // already selected a pharmacy (which has its own flyTo that would be overridden)
      const alreadySelected = !!selectedIdRef.current;
      if (
        !alreadySelected &&
        (lat !== DEFAULT_LOCATION.lat || lng !== DEFAULT_LOCATION.lng)
      ) {
        map.flyTo({
          center: [lng, lat],
          zoom: 13,
          duration: 1200,
          essential: true,
        });
      }
    }
  }, [userLocation]);

  // ── Force recenter when recenterKey changes ───────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    // Reset fittedRef so next pharmacy load won't override user view
    fittedRef.current = true;
    // Force fly to user location with higher zoom to prioritize user position
    // Small timeout to ensure any pending operations complete first
    setTimeout(() => {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15, // Higher zoom to focus on user area, not all pharmacies
        duration: 1200,
        essential: true,
      });
    }, 50);
  }, [recenterKey, userLocation]);

  // ── Handle map clicks for location selection ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !allowMapSelection) {
      // Remove click marker when not in selection mode
      clickMarkerRef.current?.remove();
      clickMarkerRef.current = null;
      return;
    }

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;

      // Show temporary click marker
      const clickEl = document.createElement("div");
      clickEl.innerHTML = `
        <div style="position:relative;width:24px;height:24px">
          <div style="
            position:absolute;inset:0;
            border-radius:50%;
            background:rgba(99,102,241,0.3);
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:absolute;inset:4px;
            border-radius:50%;
            background:#6366f1;
            border:2px solid white;
            box-shadow:0 2px 8px rgba(99,102,241,0.5);
          "></div>
          <div style="
            position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);
            background:#6366f1;color:white;
            padding:2px 6px;border-radius:4px;
            font-size:10px;font-weight:600;white-space:nowrap;
          ">เลือกตำแหน่งนี้</div>
        </div>
        <style>
          @keyframes ping {
            75%,100%{transform:scale(2);opacity:0}
          }
        </style>
      `;

      clickMarkerRef.current?.remove();
      clickMarkerRef.current = new maplibregl.Marker({
        element: clickEl,
        anchor: "center",
      })
        .setLngLat([lng, lat])
        .addTo(map);

      onMapClick?.(lat, lng);
    };

    map.on("click", handleClick);
    // Change cursor to indicate clickable
    map.getCanvas().style.cursor = "crosshair";

    return () => {
      map.off("click", handleClick);
      map.getCanvas().style.cursor = "";
    };
  }, [allowMapSelection, onMapClick]);

  // ── Build popup HTML ───────────────────────────────────────────────────────
  const buildPopupHTML = useCallback((p: OverpassPharmacy) => {
    const isOpen = p.isOpen;
    const statusBg = isOpen ? "#dcfce7" : "#f1f5f9";
    const statusFg = isOpen ? "#16a34a" : "#64748b";
    const statusDot = isOpen ? "#22c55e" : "#94a3b8";
    const statusText = isOpen ? "เปิดอยู่" : "ไม่ทราบเวลา";

    const hoursRow = p.openingHoursText
      ? `
      <div style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:11px">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.openingHoursText}</span>
      </div>`
      : "";

    const phoneRow = p.phone
      ? `
      <a href="tel:${p.phone}" style="display:flex;align-items:center;gap:6px;color:#64748b;font-size:11px;text-decoration:none">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.28 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.61a16 16 0 0 0 6.06 6.06l.89-.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span style="color:#6366f1;font-weight:600">${p.phone}</span>
      </a>`
      : "";

    const osmLink = p.osmUrl
      ? `
      <a href="${p.osmUrl}" target="_blank" rel="noreferrer"
        style="display:inline-flex;align-items:center;gap:3px;font-size:10px;color:#94a3b8;text-decoration:none;padding:2px 0">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        OpenStreetMap
      </a>`
      : "";

    return `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;width:248px">

        <!-- Header strip -->
        <div style="
          display:flex;align-items:center;gap:10px;
          padding:12px 14px 10px;
          border-bottom:1px solid #f1f5f9;
        ">
          <!-- Pill cross icon -->
          <div style="
            width:34px;height:34px;border-radius:10px;
            background:linear-gradient(135deg,#6366f1,#818cf8);
            display:flex;align-items:center;justify-content:center;
            flex-shrink:0;box-shadow:0 2px 8px rgba(99,102,241,0.35);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14a1 1 0 0 1-1-1v-3H8a1 1 0 0 1 0-2h3V8a1 1 0 0 1 2 0v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-1 1z"/>
            </svg>
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:13px;line-height:1.3;color:#0f172a;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.name}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:1px">MediBridge • ร้านยา</div>
          </div>
        </div>

        <!-- Badges row -->
        <div style="display:flex;align-items:center;gap:6px;padding:8px 14px 6px;flex-wrap:wrap">
          <span style="
            display:inline-flex;align-items:center;gap:4px;
            background:${statusBg};color:${statusFg};
            font-size:10px;font-weight:600;
            padding:3px 8px;border-radius:999px;
          ">
            <span style="width:5px;height:5px;border-radius:50%;background:${statusDot};display:inline-block"></span>
            ${statusText}
          </span>
          <span style="
            display:inline-flex;align-items:center;gap:3px;
            background:#eef2ff;color:#4f46e5;
            font-size:10px;font-weight:700;
            padding:3px 8px;border-radius:999px;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            ${formatDistance(p.distance)}
          </span>
        </div>

        <!-- Info rows -->
        <div style="padding:4px 14px 8px;display:flex;flex-direction:column;gap:5px">
          <div style="display:flex;align-items:flex-start;gap:6px;color:#64748b;font-size:11px">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style="line-height:1.5">${p.address}</span>
          </div>
          ${hoursRow}
          ${phoneRow}
        </div>

        <!-- Divider + footer -->
        <div style="
          border-top:1px solid #f1f5f9;
          padding:8px 14px;
          display:flex;align-items:center;justify-content:space-between;
        ">
          <span style="
            display:inline-flex;align-items:center;gap:4px;
            font-size:10px;font-weight:600;color:#6366f1;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            คลิกหมุดเพื่อดูรายละเอียด
          </span>
          ${osmLink}
        </div>

      </div>
    `;
  }, []);

  // ── Keep pharmaciesRef current; selectedIdRef is updated in the marker click handler ─
  useEffect(() => {
    pharmaciesRef.current = pharmacies;
  }, [pharmacies]);
  // Also keep selectedIdRef in sync for external selectedId changes (e.g. list card click)
  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // ── addMarker helper ──────────────────────────────────────────────────────
  const addMarker = useCallback(
    (map: maplibregl.Map, p: OverpassPharmacy) => {
      if (markersRef.current.has(p._id)) return;

      const el = document.createElement("div");
      el.dataset.id = p._id;
      el.style.cssText = `width:36px;height:44px;cursor:pointer;`;
      el.innerHTML = `
      <svg
        viewBox="0 0 36 44"
        xmlns="http://www.w3.org/2000/svg"
        style="width:100%;height:100%;display:block;transition:transform 0.2s,filter 0.2s;transform-origin:50% 100%;filter:drop-shadow(0 4px 12px rgba(15,23,42,0.22));"
      >
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#6366f1"/>
        <circle cx="18" cy="18" r="12" fill="white"/>
        <text x="18" y="22" text-anchor="middle" font-size="14" font-weight="900" fill="#6366f1" font-family="Arial,sans-serif">+</text>
      </svg>
    `;

      const svg = el.querySelector("svg") as SVGElement;
      el.addEventListener("mouseenter", () => {
        svg.style.transform = "scale(1.18)";
        svg.style.filter = "drop-shadow(0 8px 20px rgba(99,102,241,0.45))";
      });
      el.addEventListener("mouseleave", () => {
        svg.style.transform = "";
        svg.style.filter = "drop-shadow(0 4px 12px rgba(15,23,42,0.22))";
      });

      const popup = new maplibregl.Popup({
        offset: [0, -44],
        closeButton: true,
        closeOnClick: false,
        maxWidth: "260px",
        className: "medibridge-popup",
      }).setHTML(buildPopupHTML(p));

      // Don't use setPopup() — it makes MapLibre intercept clicks on the wrapper
      // and conflict with our custom element's click handler
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([p.lng, p.lat])
        .addTo(map);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        selectedIdRef.current = p._id; // sync immediately before React re-render
        onSelect(p._id);
        // Toggle: close if this popup is already open
        if (popupRef.current === popup && popup.isOpen()) {
          popup.remove();
          popupRef.current = null;
          return;
        }
        popupRef.current?.remove();
        popup.setLngLat([p.lng, p.lat]).addTo(map);
        popupRef.current = popup;
      });

      markersRef.current.set(p._id, marker);
    },
    [buildPopupHTML, onSelect],
  );

  // ── Sync markers + fit-bounds (called by both effect and initMap) ─────────
  const syncMarkers = useCallback(
    (map: maplibregl.Map, list: OverpassPharmacy[]) => {
      const existingIds = new Set(markersRef.current.keys());
      const newIds = new Set(list.map((p) => p._id));
      for (const id of existingIds) {
        if (!newIds.has(id)) {
          markersRef.current.get(id)?.remove();
          markersRef.current.delete(id);
        }
      }
      for (const p of list) addMarker(map, p);

      if (!fittedRef.current && list.length > 0 && !selectedIdRef.current) {
        fittedRef.current = true;
        const userLoc = userLocationRef.current;

        // If we have a real user location (not Bangkok default), fly to user position
        // Don't zoom out to fit all pharmacies - prioritize showing user's area
        if (
          userLoc &&
          (userLoc.lat !== DEFAULT_LOCATION.lat ||
            userLoc.lng !== DEFAULT_LOCATION.lng)
        ) {
          map.flyTo({
            center: [userLoc.lng, userLoc.lat],
            zoom: 15, // Keep zoomed in on user area
            duration: 800,
            essential: true,
          });
        } else {
          // No real location - fit bounds to show all pharmacies
          const bounds = new maplibregl.LngLatBounds();
          bounds.extend([
            userLoc?.lng ?? DEFAULT_LOCATION.lng,
            userLoc?.lat ?? DEFAULT_LOCATION.lat,
          ]);
          for (const p of list) bounds.extend([p.lng, p.lat]);
          map.fitBounds(bounds, {
            padding: { top: 60, bottom: 60, left: 60, right: 60 },
            maxZoom: 14,
            duration: 800,
          });
        }
      }
    },
    [addMarker],
  );

  // Keep syncMarkersRef up-to-date so initMap() always uses latest version
  useEffect(() => {
    syncMarkersRef.current = (map: maplibregl.Map) =>
      syncMarkers(map, pharmaciesRef.current);
  }, [syncMarkers]);

  // Track the last set of pharmacy IDs to detect real content changes
  const prevPharmacyIdsRef = useRef<string>("");

  // ── Sync markers when pharmacies change ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return; // map not ready yet — initMap() will call syncMarkersRef when it's done
    // Only reset fittedRef when the actual pharmacy set changes (new location fetch),
    // not on every re-render — prevents racing with the selectedId flyTo on first click
    const newIds = pharmacies.map((p) => p._id).join(",");
    if (newIds !== prevPharmacyIdsRef.current) {
      prevPharmacyIdsRef.current = newIds;
      fittedRef.current = false;
    }
    syncMarkers(map, pharmacies);
  }, [pharmacies, syncMarkers]);

  // ── React to selectedId change — flyTo + highlight marker ─────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const p = pharmacies.find((x) => x._id === selectedId);
    if (!p) return;

    // Update marker visual states
    for (const [id, marker] of markersRef.current) {
      const el = marker.getElement();
      const svg = el.querySelector("svg") as SVGElement | null;
      const path = el.querySelector("path");
      const circle = el.querySelector("circle");
      const text = el.querySelector("text");
      if (!svg || !path || !circle || !text) continue;
      if (id === selectedId) {
        path.setAttribute("fill", "#4f46e5");
        circle.setAttribute("fill", "#eef2ff");
        text.setAttribute("fill", "#4f46e5");
        svg.style.transform = "scale(1.25)";
        svg.style.filter = "drop-shadow(0 8px 20px rgba(99,102,241,0.5))";
        el.style.zIndex = "10";
      } else {
        path.setAttribute("fill", "#6366f1");
        circle.setAttribute("fill", "white");
        text.setAttribute("fill", "#6366f1");
        svg.style.transform = "";
        svg.style.filter = "drop-shadow(0 4px 12px rgba(15,23,42,0.22))";
        el.style.zIndex = "";
      }
    }

    // Smooth fly to selected pharmacy
    map.flyTo({
      center: [p.lng, p.lat],
      zoom: Math.max(map.getZoom(), 15),
      duration: 600,
      essential: true,
    });
  }, [selectedId, pharmacies]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Count badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm border border-border/40 shadow-sm text-xs font-semibold pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-success" />
        {count} ร้านยาในรัศมี
      </div>

      {/* MapTiler key missing warning */}
      {MAPTILER_KEY === "YOUR_MAPTILER_KEY" && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 bg-warning/90 text-warning-foreground text-xs font-semibold px-3 py-2 rounded-xl shadow-md backdrop-blur-sm whitespace-nowrap">
          ⚠ ตั้งค่า VITE_MAPTILER_KEY ใน .env เพื่อใช้แผนที่ MapLibre GL
        </div>
      )}

      <style>{`
        .medibridge-popup .maplibregl-popup-content {
          border-radius: 16px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(15,23,42,0.16), 0 0 0 1px rgba(226,232,240,0.9);
          border: none;
        }
        .medibridge-popup .maplibregl-popup-tip {
          border-top-color: white;
        }
        .medibridge-popup .maplibregl-popup-close-button {
          font-size: 16px;
          color: #94a3b8;
          padding: 4px 8px;
          line-height: 1;
          top: 4px;
          right: 4px;
          border-radius: 8px;
        }
        .medibridge-popup .maplibregl-popup-close-button:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
}
