"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  CUSTOMERS,
  DRIVERS,
  FEE_TIERS,
  MERCHANTS,
  ORDERS,
  PRODUCTS,
  PROMOS,
  SUPPORT_TICKETS,
  ZONES,
} from "./seed";
import type {
  CartLine,
  Customer,
  Driver,
  FeeTier,
  Locale,
  Merchant,
  NotificationEvent,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Promo,
  SupportTicket,
  Zone,
} from "./types";
import { ORDER_STATUS_FLOW } from "./types";
import { calcDeliveryFee, distanceBetween } from "./fees";

type ChoufState = {
  // data
  merchants: Merchant[];
  products: Product[];
  customers: Customer[];
  drivers: Driver[];
  zones: Zone[];
  feeTiers: FeeTier[];
  promos: Promo[];
  orders: Order[];
  supportTickets: SupportTicket[];
  notifications: NotificationEvent[];

  // session
  locale: Locale;
  activeCustomerId: string;
  activeDriverId: string;
  activeMerchantId: string;
  activeAddressId: string | null;
  cart: { merchantId: string | null; lines: CartLine[] };
  autoPlay: boolean;
  deviceFrameVariant: "ios" | "android";

  merchantSession: { merchantId: string; staffName: string } | null;
  adminSession: { name: string; email: string; role: string } | null;

  // actions
  setLocale: (l: Locale) => void;
  setActiveCustomer: (id: string) => void;
  setActiveDriver: (id: string) => void;
  setActiveMerchant: (id: string) => void;
  setActiveAddress: (id: string) => void;
  setDeviceFrameVariant: (v: "ios" | "android") => void;
  toggleAutoPlay: () => void;

  merchantLogin: (merchantId: string, staffName?: string) => void;
  merchantLogout: () => void;
  adminLogin: (email: string, name?: string) => void;
  adminLogout: () => void;

  addToCart: (merchantId: string, line: CartLine) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  placeOrder: (input: { addressId: string; promoCode?: string }) => Order | null;
  advanceOrder: (orderId: string, note?: string) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  rateOrder: (orderId: string, stars: number, comment: string, driverStars?: number) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;

  toggleProductAvailability: (productId: string) => void;
  addProduct: (input: {
    merchantId: string;
    name: string;
    nameAr: string;
    description: string;
    price: number;
    category: string;
    categoryAr: string;
  }) => Product;
  removeProduct: (productId: string) => void;
  setMerchantOpen: (merchantId: string, open: boolean) => void;
  updateFeeTier: (tierId: string, fee: number) => void;
  togglePromoActive: (promoId: string) => void;
  addPromo: (input: Pick<Promo, "code" | "type" | "value" | "minOrder" | "usageLimit" | "expiresAt">) => void;
  setDriverStatus: (driverId: string, status: Driver["status"]) => void;
  resolveTicket: (ticketId: string) => void;

  tick: () => void;
  pushNotification: (n: Omit<NotificationEvent, "id" | "createdAt" | "read">) => void;
  markNotificationRead: (id: string) => void;
  resetDemoData: () => void;
};

function statusLabelPair(status: OrderStatus) {
  const map: Record<OrderStatus, [string, string]> = {
    placed: ["Order placed", "تم استلام الطلب"],
    accepted: ["Order accepted", "تم قبول الطلب"],
    preparing: ["Preparing your order", "جاري تحضير طلبك"],
    ready: ["Ready for pickup", "جاهز للاستلام"],
    driver_assigned: ["Driver assigned", "تم تعيين السائق"],
    picked_up: ["Order picked up", "تم استلام الطلب من المطعم"],
    on_the_way: ["On the way", "الطلب في الطريق"],
    delivered: ["Delivered", "تم التوصيل"],
    cancelled: ["Order cancelled", "تم إلغاء الطلب"],
    rejected: ["Order rejected", "تم رفض الطلب"],
  };
  return map[status];
}

const initialState = {
  merchants: MERCHANTS,
  products: PRODUCTS,
  customers: CUSTOMERS,
  drivers: DRIVERS,
  zones: ZONES,
  feeTiers: FEE_TIERS,
  promos: PROMOS,
  orders: ORDERS,
  supportTickets: SUPPORT_TICKETS,
  notifications: [] as NotificationEvent[],
  locale: "en" as Locale,
  activeCustomerId: CUSTOMERS[0].id,
  activeDriverId: DRIVERS[0].id,
  activeMerchantId: MERCHANTS[0].id,
  activeAddressId: CUSTOMERS[0].addresses[0]?.id ?? null,
  cart: { merchantId: null, lines: [] } as { merchantId: string | null; lines: CartLine[] },
  autoPlay: false,
  deviceFrameVariant: "ios" as "ios" | "android",
  merchantSession: null as { merchantId: string; staffName: string } | null,
  adminSession: null as { name: string; email: string; role: string } | null,
};

export const useChoufStore = create<ChoufState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocale: (l) => set({ locale: l }),
      setActiveCustomer: (id) => {
        const c = get().customers.find((x) => x.id === id);
        set({ activeCustomerId: id, activeAddressId: c?.addresses[0]?.id ?? null });
      },
      setActiveDriver: (id) => set({ activeDriverId: id }),
      setActiveMerchant: (id) => set({ activeMerchantId: id }),
      setActiveAddress: (id) => set({ activeAddressId: id }),
      setDeviceFrameVariant: (v) => set({ deviceFrameVariant: v }),
      toggleAutoPlay: () => set((s) => ({ autoPlay: !s.autoPlay })),

      merchantLogin: (merchantId, staffName = "Store Manager") => {
        set({ merchantSession: { merchantId, staffName }, activeMerchantId: merchantId });
      },
      merchantLogout: () => set({ merchantSession: null }),
      adminLogin: (email, name = "Admin") => {
        set({ adminSession: { email, name, role: "super_admin" } });
      },
      adminLogout: () => set({ adminSession: null }),

      addToCart: (merchantId, line) =>
        set((s) => {
          if (s.cart.merchantId && s.cart.merchantId !== merchantId) {
            return { cart: { merchantId, lines: [line] } };
          }
          const existing = s.cart.lines.find(
            (l) => l.productId === line.productId && JSON.stringify(l.addOnIds) === JSON.stringify(line.addOnIds)
          );
          if (existing) {
            return {
              cart: {
                merchantId,
                lines: s.cart.lines.map((l) => (l === existing ? { ...l, quantity: l.quantity + line.quantity } : l)),
              },
            };
          }
          return { cart: { merchantId, lines: [...s.cart.lines, line] } };
        }),
      updateCartQty: (productId, quantity) =>
        set((s) => ({
          cart: {
            ...s.cart,
            lines:
              quantity <= 0
                ? s.cart.lines.filter((l) => l.productId !== productId)
                : s.cart.lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
          },
        })),
      removeFromCart: (productId) =>
        set((s) => ({ cart: { ...s.cart, lines: s.cart.lines.filter((l) => l.productId !== productId) } })),
      clearCart: () => set({ cart: { merchantId: null, lines: [] } }),

      placeOrder: ({ addressId, promoCode }) => {
        const s = get();
        const merchant = s.merchants.find((m) => m.id === s.cart.merchantId);
        const customer = s.customers.find((c) => c.id === s.activeCustomerId);
        const address = customer?.addresses.find((a) => a.id === addressId);
        if (!merchant || !customer || !address || !address.zoneId || s.cart.lines.length === 0) return null;

        const items: OrderItem[] = s.cart.lines.map((line) => {
          const p = s.products.find((pr) => pr.id === line.productId)!;
          return {
            productId: p.id,
            name: p.name,
            nameAr: p.nameAr,
            price: p.price,
            quantity: line.quantity,
            addOns: p.addOns.filter((a) => line.addOnIds.includes(a.id)),
          };
        });
        const subtotal = Math.round(
          items.reduce((sum, it) => sum + (it.price + it.addOns.reduce((a, b) => a + b.price, 0)) * it.quantity, 0) * 100
        ) / 100;
        const distanceKm = Math.max(0.4, Math.round(distanceBetween(merchant.location, address.location) * 10) / 10);
        const deliveryFee = calcDeliveryFee(address.zoneId, distanceKm) ?? 15;
        const promo = promoCode ? s.promos.find((p) => p.code.toLowerCase() === promoCode.toLowerCase() && p.active) : undefined;
        const discount = promo
          ? Math.round((promo.type === "percent" ? subtotal * (promo.value / 100) : promo.type === "fixed" ? promo.value : 0) * 100) / 100
          : 0;
        const finalFee = promo?.type === "free_delivery" ? 0 : deliveryFee;
        const total = Math.round((subtotal + finalFee - discount) * 100) / 100;
        const now = new Date().toISOString();

        const order: Order = {
          id: `order-${nanoid(8)}`,
          code: `CHF-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: customer.id,
          merchantId: merchant.id,
          driverId: null,
          addressId: address.id,
          items,
          subtotal,
          deliveryFee: finalFee,
          discount,
          total,
          promoCode: promo?.code,
          paymentMethod: "cod",
          status: "placed",
          statusHistory: [{ status: "placed", at: now }],
          distanceKm,
          createdAt: now,
          updatedAt: now,
          estimatedDeliveryAt: new Date(Date.now() + 35 * 60000).toISOString(),
          driverRouteProgress: 0,
          driverLocation: null,
        };

        set((st) => ({ orders: [order, ...st.orders], cart: { merchantId: null, lines: [] } }));
        get().pushNotification({
          audience: "merchant",
          audienceId: merchant.id,
          title: "New order received",
          titleAr: "تم استلام طلب جديد",
          body: `${order.code} · ${items.length} item(s)`,
          bodyAr: `${order.code} · ${items.length} عنصر`,
          orderId: order.id,
        });
        get().pushNotification({
          audience: "customer",
          audienceId: customer.id,
          title: "Order placed!",
          titleAr: "تم إرسال طلبك!",
          body: `${merchant.name} is preparing to accept your order.`,
          bodyAr: `${merchant.nameAr} سيقوم بمراجعة طلبك قريباً.`,
          orderId: order.id,
        });
        return order;
      },

      advanceOrder: (orderId, note) => {
        const s = get();
        const order = s.orders.find((o) => o.id === orderId);
        if (!order) return;
        const idx = ORDER_STATUS_FLOW.indexOf(order.status);
        if (idx === -1 || idx === ORDER_STATUS_FLOW.length - 1) return;
        const next = ORDER_STATUS_FLOW[idx + 1];
        get().setOrderStatus(orderId, next);
        if (note) {
          set((st) => ({
            orders: st.orders.map((o) =>
              o.id === orderId
                ? { ...o, statusHistory: o.statusHistory.map((h, i) => (i === o.statusHistory.length - 1 ? { ...h, note } : h)) }
                : o
            ),
          }));
        }
      },

      setOrderStatus: (orderId, status) => {
        const now = new Date().toISOString();
        set((s) => {
          const order = s.orders.find((o) => o.id === orderId);
          if (!order) return s;
          let driverId = order.driverId;
          let drivers = s.drivers;
          const merchant = s.merchants.find((m) => m.id === order.merchantId);

          if (status === "driver_assigned" && !driverId) {
            const available = s.drivers.find((d) => d.status === "active" && d.zoneId === merchant?.zoneId) ?? s.drivers.find((d) => d.status === "active");
            if (available) {
              driverId = available.id;
              drivers = s.drivers.map((d) => (d.id === available.id ? { ...d, status: "on_delivery" } : d));
            }
          }
          if (status === "delivered" && driverId) {
            drivers = drivers.map((d) => (d.id === driverId ? { ...d, status: "active", totalDeliveries: d.totalDeliveries + 1, todayEarnings: Math.round((d.todayEarnings + order.deliveryFee * 0.7) * 100) / 100 } : d));
          }

          const driverLocation =
            status === "on_the_way"
              ? merchant?.location ?? order.driverLocation
              : status === "delivered"
              ? s.customers.find((c) => c.id === order.customerId)?.addresses.find((a) => a.id === order.addressId)?.location ?? order.driverLocation
              : order.driverLocation;

          const orders = s.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status,
                  driverId,
                  driverLocation,
                  driverRouteProgress: status === "on_the_way" ? 0 : status === "delivered" ? 1 : o.driverRouteProgress,
                  updatedAt: now,
                  statusHistory: [...o.statusHistory, { status, at: now }],
                }
              : o
          );
          return { orders, drivers };
        });

        const order = get().orders.find((o) => o.id === orderId);
        if (order) {
          const [en, ar] = statusLabelPair(status);
          get().pushNotification({
            audience: "customer",
            audienceId: order.customerId,
            title: en,
            titleAr: ar,
            body: `Order ${order.code}`,
            bodyAr: `الطلب ${order.code}`,
            orderId: order.id,
          });
          if (status === "driver_assigned" && order.driverId) {
            get().pushNotification({
              audience: "driver",
              audienceId: order.driverId,
              title: "New delivery assigned",
              titleAr: "تم تعيين توصيلة جديدة",
              body: `Order ${order.code} is ready for pickup`,
              bodyAr: `الطلب ${order.code} جاهز للاستلام`,
              orderId: order.id,
            });
          }
        }
      },

      assignDriver: (orderId, driverId) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, driverId, status: o.status === "ready" ? "driver_assigned" : o.status } : o)),
          drivers: s.drivers.map((d) => (d.id === driverId ? { ...d, status: "on_delivery" } : d)),
        })),

      rateOrder: (orderId, stars, comment, driverStars) =>
        set((s) => ({
          orders: s.orders.map((o) => (o.id === orderId ? { ...o, rating: { stars, comment, driverStars } } : o)),
        })),

      cancelOrder: (orderId, reason) => {
        const now = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: "cancelled", cancelReason: reason, updatedAt: now, statusHistory: [...o.statusHistory, { status: "cancelled", at: now, note: reason }] }
              : o
          ),
        }));
      },

      rejectOrder: (orderId, reason) => {
        const now = new Date().toISOString();
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: "rejected", cancelReason: reason, updatedAt: now, statusHistory: [...o.statusHistory, { status: "rejected", at: now, note: reason }] }
              : o
          ),
        }));
      },

      toggleProductAvailability: (productId) =>
        set((s) => ({ products: s.products.map((p) => (p.id === productId ? { ...p, available: !p.available } : p)) })),
      addProduct: (input) => {
        const product: Product = {
          id: `product-${nanoid(8)}`,
          merchantId: input.merchantId,
          name: input.name,
          nameAr: input.nameAr || input.name,
          description: input.description,
          descriptionAr: input.description,
          price: input.price,
          category: input.category,
          categoryAr: input.categoryAr || input.category,
          image: "dish-1",
          available: true,
          addOns: [],
          popular: false,
        };
        set((s) => ({ products: [product, ...s.products] }));
        return product;
      },
      removeProduct: (productId) => set((s) => ({ products: s.products.filter((p) => p.id !== productId) })),
      setMerchantOpen: (merchantId, open) =>
        set((s) => ({ merchants: s.merchants.map((m) => (m.id === merchantId ? { ...m, isOpen: open } : m)) })),
      updateFeeTier: (tierId, fee) =>
        set((s) => ({ feeTiers: s.feeTiers.map((t) => (t.id === tierId ? { ...t, fee } : t)) })),
      togglePromoActive: (promoId) =>
        set((s) => ({ promos: s.promos.map((p) => (p.id === promoId ? { ...p, active: !p.active } : p)) })),
      addPromo: (input) =>
        set((s) => ({
          promos: [{ ...input, id: `promo-${Date.now()}`, usageCount: 0, active: true }, ...s.promos],
        })),
      setDriverStatus: (driverId, status) =>
        set((s) => ({ drivers: s.drivers.map((d) => (d.id === driverId ? { ...d, status } : d)) })),
      resolveTicket: (ticketId) =>
        set((s) => ({ supportTickets: s.supportTickets.map((t) => (t.id === ticketId ? { ...t, status: "resolved" } : t)) })),

      tick: () => {
        const s = get();
        const now = Date.now();
        let changed = false;
        const orders = s.orders.map((o) => {
          if (o.status !== "on_the_way") return o;
          const merchant = s.merchants.find((m) => m.id === o.merchantId);
          const address = s.customers.find((c) => c.id === o.customerId)?.addresses.find((a) => a.id === o.addressId);
          if (!merchant || !address) return o;
          const nextProgress = Math.min(1, o.driverRouteProgress + 0.045);
          const lat = merchant.location.lat + (address.location.lat - merchant.location.lat) * nextProgress;
          const lng = merchant.location.lng + (address.location.lng - merchant.location.lng) * nextProgress;
          changed = true;
          return { ...o, driverRouteProgress: nextProgress, driverLocation: { lat, lng } };
        });

        if (s.autoPlay) {
          const autoAdvanceCandidate = orders.find((o) => {
            const updatedMs = new Date(o.updatedAt).getTime();
            return (
              !["delivered", "cancelled", "rejected"].includes(o.status) &&
              o.status !== "on_the_way" &&
              now - updatedMs > 6000
            );
          });
          if (autoAdvanceCandidate) {
            set({ orders });
            get().advanceOrder(autoAdvanceCandidate.id);
            return;
          }
          const onTheWayDone = orders.find((o) => o.status === "on_the_way" && o.driverRouteProgress >= 1);
          if (onTheWayDone) {
            set({ orders });
            get().setOrderStatus(onTheWayDone.id, "delivered");
            return;
          }
        } else {
          const onTheWayDone = orders.find((o) => o.status === "on_the_way" && o.driverRouteProgress >= 1);
          if (onTheWayDone) {
            set({ orders });
            get().setOrderStatus(onTheWayDone.id, "delivered");
            return;
          }
        }

        if (changed) set({ orders });
      },

      pushNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: `notif-${nanoid(8)}`, createdAt: new Date().toISOString(), read: false },
            ...s.notifications,
          ].slice(0, 60),
        })),
      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      resetDemoData: () => set({ ...initialState, orders: ORDERS.map((o) => ({ ...o })), notifications: [] }),
    }),
    {
      name: "chouf-demo-store",
      partialize: (s) => ({
        merchants: s.merchants,
        products: s.products,
        customers: s.customers,
        drivers: s.drivers,
        promos: s.promos,
        feeTiers: s.feeTiers,
        orders: s.orders,
        supportTickets: s.supportTickets,
        notifications: s.notifications,
        locale: s.locale,
        activeCustomerId: s.activeCustomerId,
        activeDriverId: s.activeDriverId,
        activeMerchantId: s.activeMerchantId,
        activeAddressId: s.activeAddressId,
        cart: s.cart,
        autoPlay: s.autoPlay,
        deviceFrameVariant: s.deviceFrameVariant,
        merchantSession: s.merchantSession,
        adminSession: s.adminSession,
      }),
    }
  )
);

export function selectMerchant(id: string) {
  return useChoufStore.getState().merchants.find((m) => m.id === id);
}
export function selectCustomer(id: string) {
  return useChoufStore.getState().customers.find((c) => c.id === id);
}
