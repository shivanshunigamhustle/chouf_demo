"use client";

import { useMemo, useState } from "react";
import type { Driver, GeoPoint, Merchant, Order, Zone } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bike, Car, Store, MapPin, Plus, Minus, Navigation2, Users } from "lucide-react";

const BOUNDS = { minLat: 25.155, maxLat: 25.245, minLng: 55.215, maxLng: 55.325 };
const VB = { w: 1000, h: 760 };

const ROADS: { d: string; major?: boolean }[] = [
  { d: "M -20,400 C 260,340 560,440 1020,370", major: true },
  { d: "M 520,-20 C 470,240 560,500 500,780", major: true },
  { d: "M -20,190 L 1020,225" },
  { d: "M -20,565 L 1020,520" },
  { d: "M 210,-20 L 250,780" },
  { d: "M 790,-20 L 830,780" },
];

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

function curvedPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const bow = Math.min(60, len * 0.18);
  const cx = mx - (dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`;
}

type HoverInfo = { x: number; y: number; title: string; subtitle: string; tone: string } | null;

export function SimMap({
  zones,
  drivers = [],
  merchants = [],
  trackingOrder,
  height = 420,
  className,
  showZoneLabels = true,
  showControls = !trackingOrder,
  showLegend = !trackingOrder,
  highlightMerchantId,
}: {
  zones: Zone[];
  drivers?: Driver[];
  merchants?: Merchant[];
  trackingOrder?: { order: Order; merchant: Merchant; destination: GeoPoint } | null;
  height?: number;
  className?: string;
  showZoneLabels?: boolean;
  showControls?: boolean;
  showLegend?: boolean;
  highlightMerchantId?: string;
}) {
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<HoverInfo>(null);

  const viewBox = useMemo(() => {
    const w = VB.w / zoom;
    const h = VB.h / zoom;
    const x = (VB.w - w) / 2;
    const y = (VB.h - h) / 2;
    return `${x} ${y} ${w} ${h}`;
  }, [zoom]);

  const route = trackingOrder
    ? { from: project(trackingOrder.merchant.location), to: project(trackingOrder.destination) }
    : null;
  const routePath = route ? curvedPath(route.from, route.to) : null;
  const driverPos = trackingOrder?.order.driverLocation ? project(trackingOrder.order.driverLocation) : null;

  const activeCount = drivers.filter((d) => d.status === "active").length;
  const onDeliveryCount = drivers.filter((d) => d.status === "on_delivery").length;

  function showTooltip(e: React.MouseEvent, title: string, subtitle: string, tone: string) {
    const rect = e.currentTarget.getBoundingClientRect();
    const parent = (e.currentTarget as HTMLElement).closest(".sim-map-root")?.getBoundingClientRect();
    if (!parent) return;
    setHover({ x: rect.left - parent.left + rect.width / 2, y: rect.top - parent.top, title, subtitle, tone });
  }

  return (
    <div className={cn("sim-map-root relative w-full overflow-hidden rounded-2xl border border-black/[0.05] bg-[#eef1f4] shadow-card", className)} style={{ height }}>
      <svg viewBox={viewBox} className="h-full w-full transition-[view-box] duration-300" preserveAspectRatio="xMidYMid slice">
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
        <rect x={-100} y={-100} width={VB.w + 200} height={VB.h + 200} fill="url(#mapBg)" />
        <rect x={-100} y={-100} width={VB.w + 200} height={VB.h + 200} fill="url(#mapDots)" />

        {/* roads */}
        {ROADS.map((r, i) => (
          <g key={i}>
            <path d={r.d} fill="none" stroke="#dde3e8" strokeWidth={r.major ? 22 : 13} strokeLinecap="round" />
            <path d={r.d} fill="none" stroke="#ffffff" strokeWidth={r.major ? 2.5 : 1.5} strokeDasharray="14 12" strokeLinecap="round" opacity={0.9} />
          </g>
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
                opacity={0.75}
              >
                {z.name.toUpperCase()}
              </text>
            )}
          </g>
        ))}

        {/* route */}
        {routePath && (
          <>
            <path d={routePath} fill="none" stroke="#171b26" strokeWidth={5} strokeLinecap="round" opacity={0.06} />
            <path d={routePath} fill="none" stroke="#ff5a1f" strokeWidth={3} strokeLinecap="round" opacity={0.9} strokeDasharray="1 11" className="animate-route-flow" />
          </>
        )}
      </svg>

      {/* markers (HTML overlay for crisp rendering + hover interactivity) */}
      <div className="pointer-events-none absolute inset-0">
        {merchants.map((m) => {
          const { x, y } = project(m.location);
          const isTrackingMerchant = trackingOrder?.merchant.id === m.id || highlightMerchantId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onMouseEnter={(e) => showTooltip(e, m.name, m.isOpen ? "Open" : "Closed", m.logoColor)}
              onMouseLeave={() => setHover(null)}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:z-10 hover:scale-125"
              style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%`, opacity: isTrackingMerchant ? 1 : 0.45 }}
            >
              <span
                className="block rounded-full border-2 bg-white shadow-sm"
                style={{ width: isTrackingMerchant ? 16 : 11, height: isTrackingMerchant ? 16 : 11, borderColor: m.logoColor }}
              />
              {highlightMerchantId === m.id && (
                <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full" style={{ backgroundColor: m.logoColor, opacity: 0.35 }} />
              )}
            </button>
          );
        })}

        {drivers.map((d) => {
          if (trackingOrder && d.id === trackingOrder.order.driverId) return null;
          const { x, y } = project(d.location);
          const color = d.status === "on_delivery" ? "#0ea5a4" : d.status === "active" ? "#16a34a" : "#94a0b3";
          return (
            <button
              key={d.id}
              type="button"
              onMouseEnter={(e) => showTooltip(e, d.name, `${d.status.replace("_", " ")} · ${d.vehicle}`, color)}
              onMouseLeave={() => setHover(null)}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:z-10 hover:scale-125"
              style={{ left: `${(x / VB.w) * 100}%`, top: `${(y / VB.h) * 100}%`, opacity: d.status === "inactive" ? 0.35 : 0.95 }}
            >
              <span className="block h-3.5 w-3.5 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: color }} />
              {d.status === "active" && <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full" style={{ backgroundColor: color, opacity: 0.35 }} />}
            </button>
          );
        })}
      </div>

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

      {/* hover tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-white shadow-pop"
          style={{ left: hover.x, top: hover.y }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hover.tone }} />
            <span className="text-[11px] font-bold">{hover.title}</span>
          </div>
          <p className="text-[10px] capitalize text-white/60">{hover.subtitle}</p>
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-ink-900" />
        </div>
      )}

      {/* legend */}
      {showLegend && drivers.length > 0 && (
        <div className="absolute left-3 top-3 flex items-center gap-3 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold text-ink-600 shadow-card backdrop-blur">
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-ink-400" />{drivers.length}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success-500" />{activeCount}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-teal-500" />{onDeliveryCount}</span>
        </div>
      )}

      {/* zoom controls */}
      {showControls && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-card">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.5).toFixed(2)))}
            className="flex h-8 w-8 items-center justify-center text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="h-px bg-ink-100" />
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(2)))}
            className="flex h-8 w-8 items-center justify-center text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* compass */}
      {showControls && (
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-black/5 bg-white/90 text-ink-400 shadow-card backdrop-blur">
          <Navigation2 className="h-3.5 w-3.5" strokeWidth={2.5} />
        </div>
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
