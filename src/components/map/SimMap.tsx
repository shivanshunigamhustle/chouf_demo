"use client";

import { useMemo } from "react";
import type { Driver, GeoPoint, Merchant, Order, Zone } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bike, Car, Store, MapPin } from "lucide-react";

const BOUNDS = { minLat: 25.155, maxLat: 25.245, minLng: 55.215, maxLng: 55.325 };
const VB = { w: 1000, h: 760 };

function project(p: GeoPoint) {
  const x = ((p.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * VB.w;
  const y = (1 - (p.lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * VB.h;
  return { x, y };
}

function polygonPoints(polygon: GeoPoint[]) {
  return polygon.map((p) => {
    const { x, y } = project(p);
    return `${x},${y}`;
  }).join(" ");
}

export function SimMap({
  zones,
  drivers = [],
  merchants = [],
  trackingOrder,
  height = 420,
  className,
  showZoneLabels = true,
}: {
  zones: Zone[];
  drivers?: Driver[];
  merchants?: Merchant[];
  trackingOrder?: { order: Order; merchant: Merchant; destination: GeoPoint } | null;
  height?: number;
  className?: string;
  showZoneLabels?: boolean;
}) {
  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 1; i < 8; i++) lines.push((VB.w / 8) * i);
    return lines;
  }, []);

  const route = trackingOrder
    ? { from: project(trackingOrder.merchant.location), to: project(trackingOrder.destination) }
    : null;
  const driverPos = trackingOrder?.order.driverLocation ? project(trackingOrder.order.driverLocation) : null;

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl border border-black/[0.05] bg-[#eef1f4] shadow-card", className)} style={{ height }}>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3f5f7" />
            <stop offset="100%" stopColor="#e7ebef" />
          </linearGradient>
          <pattern id="mapDots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.3" fill="#c4ccd4" opacity="0.6" />
          </pattern>
          <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f1729" floodOpacity="0.18" />
          </filter>
          <filter id="markerShadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0f1729" floodOpacity="0.28" />
          </filter>
        </defs>
        <rect width={VB.w} height={VB.h} fill="url(#mapBg)" />
        <rect width={VB.w} height={VB.h} fill="url(#mapDots)" />
        {gridLines.map((x, i) => (
          <line key={`v${i}`} x1={x} y1={0} x2={x} y2={VB.h} stroke="#ffffff" strokeWidth={i % 2 === 0 ? 10 : 6} opacity={0.5} strokeLinecap="round" />
        ))}

        {/* zones */}
        {zones.map((z) => (
          <g key={z.id} filter="url(#softShadow)">
            <polygon
              points={polygonPoints(z.polygon)}
              fill={z.color}
              fillOpacity={0.1}
              stroke={z.color}
              strokeOpacity={0.65}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeDasharray="1 9"
              strokeLinecap="round"
            />
            {showZoneLabels && (
              <text
                x={project(z.center).x}
                y={project(z.center).y}
                textAnchor="middle"
                fontSize={14}
                fontWeight={800}
                letterSpacing="0.5"
                fill={z.color}
                opacity={0.7}
              >
                {z.name.toUpperCase()}
              </text>
            )}
          </g>
        ))}

        {/* route */}
        {route && (
          <line
            x1={route.from.x}
            y1={route.from.y}
            x2={route.to.x}
            y2={route.to.y}
            stroke="#ff5a1f"
            strokeWidth={3}
            strokeDasharray="1 10"
            strokeLinecap="round"
            opacity={0.85}
          />
        )}

        {/* merchants (dim, all) */}
        {merchants.map((m) => {
          const { x, y } = project(m.location);
          const isTrackingMerchant = trackingOrder?.merchant.id === m.id;
          return (
            <g key={m.id} opacity={isTrackingMerchant ? 1 : 0.4} filter={isTrackingMerchant ? "url(#markerShadow)" : undefined}>
              <circle cx={x} cy={y} r={isTrackingMerchant ? 11 : 6.5} fill="white" stroke={m.logoColor} strokeWidth={2.5} />
            </g>
          );
        })}

        {/* idle drivers */}
        {drivers.map((d) => {
          if (trackingOrder && d.id === trackingOrder.order.driverId) return null;
          const { x, y } = project(d.location);
          return (
            <g key={d.id} opacity={d.status === "active" ? 0.95 : 0.3} filter="url(#markerShadow)">
              <circle cx={x} cy={y} r={8} fill={d.status === "on_delivery" ? "#0ea5a4" : "#525c73"} stroke="white" strokeWidth={2} />
            </g>
          );
        })}

        {/* route endpoints */}
        {route && (
          <g filter="url(#markerShadow)">
            <circle cx={route.from.x} cy={route.from.y} r={9} fill="white" stroke="#ff5a1f" strokeWidth={3} />
            <circle cx={route.to.x} cy={route.to.y} r={9} fill="#171b26" />
            <circle cx={route.to.x} cy={route.to.y} r={4} fill="white" />
          </g>
        )}

        {/* moving driver marker */}
        {driverPos && (
          <g style={{ transition: "transform 1.4s linear" }} transform={`translate(${driverPos.x} ${driverPos.y})`}>
            <circle r={16} fill="#0ea5a4" opacity={0.25} className="animate-pulse-ring" />
            <circle r={11} fill="#0ea5a4" stroke="white" strokeWidth={3} filter="url(#markerShadow)" />
          </g>
        )}
      </svg>

      {/* HTML overlay icons for crispness */}
      {trackingOrder?.merchant && (
        <MapIconOverlay point={project(trackingOrder.merchant.location)} vbW={VB.w} vbH={VB.h}>
          <div className="flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-brand-500 text-white shadow-pop">
            <Store className="h-3.5 w-3.5" />
          </div>
        </MapIconOverlay>
      )}
      {trackingOrder?.destination && (
        <MapIconOverlay point={project(trackingOrder.destination)} vbW={VB.w} vbH={VB.h}>
          <div className="flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-ink-900 text-white shadow-pop">
            <MapPin className="h-3.5 w-3.5" />
          </div>
        </MapIconOverlay>
      )}
      {driverPos && (
        <MapIconOverlay point={driverPos} vbW={VB.w} vbH={VB.h} smooth>
          <div className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-teal-500 text-white shadow-pop animate-marker-bob">
            {trackingOrder && trackingOrder.order.status === "on_the_way" ? <Bike className="h-4 w-4" /> : <Car className="h-4 w-4" />}
          </div>
        </MapIconOverlay>
      )}
    </div>
  );
}

function MapIconOverlay({
  point,
  vbW,
  vbH,
  children,
  smooth,
}: {
  point: { x: number; y: number };
  vbW: number;
  vbH: number;
  children: React.ReactNode;
  smooth?: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${(point.x / vbW) * 100}%`,
        top: `${(point.y / vbH) * 100}%`,
        transition: smooth ? "left 1.4s linear, top 1.4s linear" : undefined,
      }}
    >
      {children}
    </div>
  );
}
