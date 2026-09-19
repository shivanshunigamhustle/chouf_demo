export type Locale = "en" | "ar";

export type GeoPoint = { lat: number; lng: number };

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "ready"
  | "driver_assigned"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled"
  | "rejected";

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "driver_assigned",
  "picked_up",
  "on_the_way",
  "delivered",
];

export type MerchantCategory =
  | "restaurant"
  | "supermarket"
  | "pharmacy"
  | "bakery"
  | "store";

export type Address = {
  id: string;
  label: string; // Home, Office, Custom
  line1: string;
  city: string;
  zoneId: string | null; // null = outside coverage
  location: GeoPoint;
  isDefault?: boolean;
};

export type Customer = {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  email: string;
  avatarColor: string;
  addresses: Address[];
  createdAt: string;
  totalOrders: number;
  rating: number;
};

export type ProductOption = {
  id: string;
  name: string;
  nameAr: string;
  price: number;
};

export type Product = {
  id: string;
  merchantId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  category: string;
  categoryAr: string;
  image: string;
  available: boolean;
  addOns: ProductOption[];
  popular?: boolean;
};

export type Merchant = {
  id: string;
  name: string;
  nameAr: string;
  category: MerchantCategory;
  logoColor: string;
  logoInitial: string;
  coverImage: string;
  rating: number;
  ratingCount: number;
  etaMinutes: [number, number];
  minOrder: number;
  location: GeoPoint;
  zoneId: string;
  address: string;
  addressAr: string;
  isOpen: boolean;
  hasPromo: boolean;
  promoLabel?: string;
  tags: string[];
  branches: number;
};

export type Zone = {
  id: string;
  name: string;
  nameAr: string;
  color: string;
  polygon: GeoPoint[];
  center: GeoPoint;
};

export type FeeTier = {
  id: string;
  zoneId: string;
  minKm: number;
  maxKm: number;
  fee: number;
};

export type Promo = {
  id: string;
  code: string;
  type: "percent" | "fixed" | "free_delivery";
  value: number;
  minOrder: number;
  usageCount: number;
  usageLimit: number;
  active: boolean;
  expiresAt: string;
};

export type Driver = {
  id: string;
  name: string;
  nameAr: string;
  phone: string;
  avatarColor: string;
  vehicle: "bike" | "scooter" | "car";
  plate: string;
  rating: number;
  status: "active" | "inactive" | "on_delivery";
  location: GeoPoint;
  zoneId: string;
  totalDeliveries: number;
  todayEarnings: number;
};

export type CartLine = {
  productId: string;
  quantity: number;
  addOnIds: string[];
  note?: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
  addOns: ProductOption[];
};

export type StatusEvent = {
  status: OrderStatus;
  at: string;
  note?: string;
};

export type Order = {
  id: string;
  code: string;
  customerId: string;
  merchantId: string;
  driverId: string | null;
  addressId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  paymentMethod: "cod";
  status: OrderStatus;
  statusHistory: StatusEvent[];
  distanceKm: number;
  createdAt: string;
  updatedAt: string;
  estimatedDeliveryAt: string;
  driverRouteProgress: number; // 0..1 while on_the_way
  driverLocation: GeoPoint | null;
  rating?: {
    stars: number;
    comment: string;
    driverStars?: number;
  };
  cancelReason?: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  customerId: string;
  orderId?: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastMessage: string;
};

export type NotificationEvent = {
  id: string;
  audience: "customer" | "merchant" | "driver" | "admin";
  audienceId?: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  createdAt: string;
  read: boolean;
  orderId?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "ops" | "support" | "finance";
  active: boolean;
};
