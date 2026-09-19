import { FEE_TIERS, ZONES } from "./seed";
import { haversineKm } from "./utils";
import type { GeoPoint } from "./types";

export function findZoneForPoint(point: GeoPoint) {
  return (
    ZONES.find((z) => {
      const lats = z.polygon.map((p) => p.lat);
      const lngs = z.polygon.map((p) => p.lng);
      return (
        point.lat <= Math.max(...lats) &&
        point.lat >= Math.min(...lats) &&
        point.lng <= Math.max(...lngs) &&
        point.lng >= Math.min(...lngs)
      );
    }) ?? null
  );
}

export function calcDeliveryFee(zoneId: string | null, distanceKm: number) {
  if (!zoneId) return null; // out of coverage
  const tier = FEE_TIERS.find((t) => t.zoneId === zoneId && distanceKm >= t.minKm && distanceKm < t.maxKm);
  return tier ? tier.fee : FEE_TIERS.filter((t) => t.zoneId === zoneId).at(-1)?.fee ?? 18;
}

export function distanceBetween(a: GeoPoint, b: GeoPoint) {
  return haversineKm(a, b);
}
