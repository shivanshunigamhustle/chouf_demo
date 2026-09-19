import type {
  Address,
  Customer,
  Driver,
  FeeTier,
  Merchant,
  MerchantCategory,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Promo,
  SupportTicket,
  Zone,
} from "./types";

// Deterministic PRNG so server/client render the same seed (avoids hydration mismatch)
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const int = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;
const num = (min: number, max: number, dp = 1) => {
  const v = rnd() * (max - min) + min;
  return Math.round(v * 10 ** dp) / 10 ** dp;
};
const isoDaysAgo = (days: number, hourOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hourOffset, int(0, 59), 0, 0);
  return d.toISOString();
};
const isoMinutesAgo = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();
const isoMinutesFromNow = (mins: number) => new Date(Date.now() + mins * 60000).toISOString();

export const CITY = { name: "Al Marsa", nameAr: "المرسى" };

// ---------------- Zones ----------------
export const ZONES: Zone[] = [
  {
    id: "zone-downtown",
    name: "Downtown",
    nameAr: "وسط المدينة",
    color: "#ff5a1f",
    center: { lat: 25.2048, lng: 55.2708 },
    polygon: [
      { lat: 25.215, lng: 55.258 },
      { lat: 25.215, lng: 55.284 },
      { lat: 25.195, lng: 55.284 },
      { lat: 25.195, lng: 55.258 },
    ],
  },
  {
    id: "zone-marina",
    name: "Marina Bay",
    nameAr: "خليج المارينا",
    color: "#0ea5a4",
    center: { lat: 25.228, lng: 55.238 },
    polygon: [
      { lat: 25.238, lng: 55.222 },
      { lat: 25.238, lng: 55.252 },
      { lat: 25.218, lng: 55.252 },
      { lat: 25.218, lng: 55.222 },
    ],
  },
  {
    id: "zone-noor",
    name: "Al Noor Hills",
    nameAr: "تلال النور",
    color: "#2563eb",
    center: { lat: 25.178, lng: 55.298 },
    polygon: [
      { lat: 25.19, lng: 55.284 },
      { lat: 25.19, lng: 55.312 },
      { lat: 25.166, lng: 55.312 },
      { lat: 25.166, lng: 55.284 },
    ],
  },
];

export const FEE_TIERS: FeeTier[] = ZONES.flatMap((z) => [
  { id: `${z.id}-t1`, zoneId: z.id, minKm: 0, maxKm: 2, fee: 5 },
  { id: `${z.id}-t2`, zoneId: z.id, minKm: 2, maxKm: 5, fee: 8 },
  { id: `${z.id}-t3`, zoneId: z.id, minKm: 5, maxKm: 9, fee: 12 },
  { id: `${z.id}-t4`, zoneId: z.id, minKm: 9, maxKm: 999, fee: 18 },
]);

function randomPointInZone(zone: Zone): { lat: number; lng: number } {
  const lats = zone.polygon.map((p) => p.lat);
  const lngs = zone.polygon.map((p) => p.lng);
  return {
    lat: num(Math.min(...lats), Math.max(...lats), 5),
    lng: num(Math.min(...lngs), Math.max(...lngs), 5),
  };
}

// ---------------- Merchants ----------------
const MERCHANT_SEED: { name: string; nameAr: string; category: MerchantCategory; color: string; tags: string[] }[] = [
  { name: "Baytna Kitchen", nameAr: "مطبخ بيتنا", category: "restaurant", color: "#ff5a1f", tags: ["Levantine", "Grills"] },
  { name: "Sakura Sushi House", nameAr: "بيت سوشي ساكورا", category: "restaurant", color: "#0ea5a4", tags: ["Japanese", "Sushi"] },
  { name: "Al Marsa Fresh Mart", nameAr: "المرسى فريش مارت", category: "supermarket", color: "#2563eb", tags: ["Groceries", "24/7"] },
  { name: "Nour Pharmacy", nameAr: "صيدلية النور", category: "pharmacy", color: "#16a34a", tags: ["Health", "Wellness"] },
  { name: "Golden Crust Bakery", nameAr: "مخبز القشرة الذهبية", category: "bakery", color: "#d97706", tags: ["Fresh Bread", "Pastries"] },
  { name: "Pasta Bella", nameAr: "باستا بيلا", category: "restaurant", color: "#b91c1c", tags: ["Italian", "Pasta"] },
  { name: "Green Basket Organics", nameAr: "سلة الخضراء العضوية", category: "supermarket", color: "#15803d", tags: ["Organic", "Produce"] },
  { name: "Burger Junction", nameAr: "محطة البرغر", category: "restaurant", color: "#c7330a", tags: ["Burgers", "Fast Food"] },
  { name: "City Care Pharmacy", nameAr: "صيدلية سيتي كير", category: "pharmacy", color: "#0a8483", tags: ["24/7", "Delivery"] },
  { name: "Spice Route India", nameAr: "طريق التوابل الهندي", category: "restaurant", color: "#f59e0b", tags: ["Indian", "Curry"] },
  { name: "Mama's Sweets", nameAr: "حلويات ماما", category: "bakery", color: "#9d174d", tags: ["Desserts", "Cakes"] },
  { name: "Corner Mart Express", nameAr: "كورنر مارت اكسبرس", category: "store", color: "#525c73", tags: ["Convenience", "Essentials"] },
];

export const MERCHANTS: Merchant[] = MERCHANT_SEED.map((m, i) => {
  const zone = ZONES[i % ZONES.length];
  const loc = randomPointInZone(zone);
  return {
    id: `merchant-${i + 1}`,
    name: m.name,
    nameAr: m.nameAr,
    category: m.category,
    logoColor: m.color,
    logoInitial: m.name[0],
    coverImage: `cover-${(i % 6) + 1}`,
    rating: num(3.8, 4.9, 1),
    ratingCount: int(80, 2400),
    etaMinutes: [int(15, 25), int(28, 45)],
    minOrder: pick([0, 10, 15, 20]),
    location: loc,
    zoneId: zone.id,
    address: `${int(1, 40)} ${pick(["Palm", "Corniche", "Al Wasl", "Marina", "Hill"])} St, ${CITY.name}`,
    addressAr: `${CITY.nameAr}`,
    isOpen: rnd() > 0.12,
    hasPromo: rnd() > 0.55,
    promoLabel: rnd() > 0.55 ? pick(["20% OFF", "Free Delivery", "Buy 1 Get 1"]) : undefined,
    tags: m.tags,
    branches: int(1, 4),
  };
});

const DISH_LIB: Record<MerchantCategory, { name: string; nameAr: string; price: [number, number]; cat: string; catAr: string }[]> = {
  restaurant: [
    { name: "Grilled Chicken Platter", nameAr: "طبق دجاج مشوي", price: [28, 42], cat: "Mains", catAr: "أطباق رئيسية" },
    { name: "Beef Shawarma Wrap", nameAr: "لفافة شاورما لحم", price: [14, 20], cat: "Wraps", catAr: "لفائف" },
    { name: "Mixed Grill Feast", nameAr: "مشاوي مشكلة", price: [45, 65], cat: "Mains", catAr: "أطباق رئيسية" },
    { name: "Classic Cheeseburger", nameAr: "برغر جبن كلاسيك", price: [22, 30], cat: "Burgers", catAr: "برغر" },
    { name: "Margherita Pizza", nameAr: "بيتزا مارغريتا", price: [26, 38], cat: "Pizza", catAr: "بيتزا" },
    { name: "Salmon Nigiri Set", nameAr: "طقم نيجيري سلمون", price: [32, 48], cat: "Sushi", catAr: "سوشي" },
    { name: "Chicken Tikka Masala", nameAr: "دجاج تكا مسالا", price: [24, 34], cat: "Curry", catAr: "كاري" },
    { name: "Fettuccine Alfredo", nameAr: "فيتوتشيني ألفريدو", price: [24, 32], cat: "Pasta", catAr: "باستا" },
    { name: "Caesar Salad", nameAr: "سلطة سيزر", price: [16, 22], cat: "Salads", catAr: "سلطات" },
    { name: "Lentil Soup", nameAr: "شوربة عدس", price: [8, 12], cat: "Starters", catAr: "مقبلات" },
  ],
  supermarket: [
    { name: "Fresh Milk 1L", nameAr: "حليب طازج ١ لتر", price: [4, 7], cat: "Dairy", catAr: "ألبان" },
    { name: "Organic Eggs (12)", nameAr: "بيض عضوي (١٢)", price: [10, 16], cat: "Dairy", catAr: "ألبان" },
    { name: "Basmati Rice 5kg", nameAr: "أرز بسمتي ٥ كغ", price: [22, 34], cat: "Pantry", catAr: "مؤن" },
    { name: "Avocado (each)", nameAr: "أفوكادو (حبة)", price: [3, 5], cat: "Produce", catAr: "خضار وفواكه" },
    { name: "Chicken Breast 1kg", nameAr: "صدر دجاج ١ كغ", price: [18, 26], cat: "Meat", catAr: "لحوم" },
    { name: "Sparkling Water (6)", nameAr: "مياه فوارة (٦)", price: [9, 14], cat: "Beverages", catAr: "مشروبات" },
  ],
  pharmacy: [
    { name: "Vitamin C 1000mg", nameAr: "فيتامين سي ١٠٠٠", price: [24, 38], cat: "Vitamins", catAr: "فيتامينات" },
    { name: "Digital Thermometer", nameAr: "ميزان حرارة رقمي", price: [30, 45], cat: "Devices", catAr: "أجهزة" },
    { name: "Hand Sanitizer 500ml", nameAr: "معقم يدين ٥٠٠مل", price: [12, 18], cat: "Hygiene", catAr: "نظافة" },
    { name: "Pain Relief Tablets", nameAr: "أقراص مسكنة", price: [8, 14], cat: "Medicine", catAr: "أدوية" },
    { name: "Baby Diapers (44)", nameAr: "حفاضات أطفال (٤٤)", price: [45, 65], cat: "Baby Care", catAr: "رعاية الطفل" },
  ],
  bakery: [
    { name: "Sourdough Loaf", nameAr: "رغيف عجين مخمر", price: [10, 16], cat: "Bread", catAr: "خبز" },
    { name: "Chocolate Croissant", nameAr: "كرواسون شوكولاتة", price: [7, 11], cat: "Pastries", catAr: "معجنات" },
    { name: "Red Velvet Slice", nameAr: "قطعة ريد فيلفيت", price: [14, 20], cat: "Cakes", catAr: "كيك" },
    { name: "Cheese Manakish", nameAr: "مناقيش جبنة", price: [9, 13], cat: "Savory", catAr: "مالح" },
    { name: "Baklava Box (12)", nameAr: "علبة بقلاوة (١٢)", price: [28, 40], cat: "Desserts", catAr: "حلويات" },
  ],
  store: [
    { name: "Phone Charging Cable", nameAr: "كابل شحن هاتف", price: [15, 25], cat: "Electronics", catAr: "إلكترونيات" },
    { name: "AA Batteries (8)", nameAr: "بطاريات AA (٨)", price: [10, 16], cat: "Essentials", catAr: "أساسيات" },
    { name: "Notebook A5", nameAr: "دفتر A5", price: [6, 10], cat: "Stationery", catAr: "قرطاسية" },
    { name: "Reusable Bottle 750ml", nameAr: "زجاجة قابلة لإعادة الاستخدام", price: [18, 28], cat: "Lifestyle", catAr: "نمط حياة" },
  ],
};

export const PRODUCTS: Product[] = MERCHANTS.flatMap((m, mi) => {
  const lib = DISH_LIB[m.category];
  const count = int(10, 16);
  return Array.from({ length: count }).map((_, i) => {
    const base = lib[i % lib.length];
    const price = num(base.price[0], base.price[1], 2);
    return {
      id: `product-${mi + 1}-${i + 1}`,
      merchantId: m.id,
      name: base.name,
      nameAr: base.nameAr,
      description: `Freshly prepared ${base.name.toLowerCase()}, a customer favorite at ${m.name}.`,
      descriptionAr: `${base.nameAr} طازج ومحضر بعناية من ${m.nameAr}.`,
      price,
      category: base.cat,
      categoryAr: base.catAr,
      image: `dish-${((mi + i) % 8) + 1}`,
      available: rnd() > 0.08,
      addOns:
        m.category === "restaurant"
          ? [
              { id: `${mi}-${i}-addon-1`, name: "Extra Cheese", nameAr: "جبنة إضافية", price: 3 },
              { id: `${mi}-${i}-addon-2`, name: "Spicy Sauce", nameAr: "صلصة حارة", price: 1.5 },
            ]
          : [],
      popular: rnd() > 0.75,
    };
  });
});

// ---------------- Customers ----------------
const CUSTOMER_NAMES: [string, string][] = [
  ["Layla Haddad", "ليلى حداد"],
  ["Omar Faris", "عمر فارس"],
  ["Sara Khalil", "سارة خليل"],
  ["Yousef Mansour", "يوسف منصور"],
  ["Mona Zayed", "منى زايد"],
  ["Karim Aziz", "كريم عزيز"],
  ["Rania Saleh", "رانيا صالح"],
  ["Tariq Nasser", "طارق ناصر"],
];
const AVATAR_COLORS = ["#ff5a1f", "#0ea5a4", "#2563eb", "#16a34a", "#d97706", "#9d174d", "#525c73", "#c7330a"];
const ADDR_LABELS = ["Home", "Office", "Custom"];

export const CUSTOMERS: Customer[] = CUSTOMER_NAMES.map(([name, nameAr], i) => {
  const addressCount = int(1, 3);
  const addresses: Address[] = Array.from({ length: addressCount }).map((_, ai) => {
    // last customer, last address intentionally outside coverage to demo zone validation
    const outside = i === CUSTOMER_NAMES.length - 1 && ai === addressCount - 1;
    const zone = outside ? null : pick(ZONES);
    return {
      id: `addr-${i + 1}-${ai + 1}`,
      label: ADDR_LABELS[ai] ?? "Custom",
      line1: `${int(1, 99)} ${pick(["Sunset", "Palm", "Garden", "River", "Hill"])} ${pick(["St", "Ave", "Rd"])}, Building ${int(1, 20)}`,
      city: CITY.name,
      zoneId: zone ? zone.id : null,
      location: zone ? randomPointInZone(zone) : { lat: 25.05, lng: 55.4 },
      isDefault: ai === 0,
    };
  });
  return {
    id: `customer-${i + 1}`,
    name,
    nameAr,
    phone: `+971 5${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
    email: `${name.split(" ")[0].toLowerCase()}@example.com`,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    addresses,
    createdAt: isoDaysAgo(int(30, 400)),
    totalOrders: int(2, 60),
    rating: num(4.2, 5.0, 1),
  };
});

// ---------------- Drivers ----------------
const DRIVER_NAMES: [string, string][] = [
  ["Hassan Idris", "حسن إدريس"],
  ["Fadi Rahman", "فادي رحمن"],
  ["Nadia Osman", "نادية عثمان"],
  ["Ali Mourad", "علي مراد"],
  ["Samir Qasim", "سمير قاسم"],
  ["Dina Farouk", "دينا فاروق"],
  ["Bilal Amin", "بلال أمين"],
  ["Huda Salman", "هدى سلمان"],
];
export const DRIVERS: Driver[] = DRIVER_NAMES.map(([name, nameAr], i) => {
  const zone = ZONES[i % ZONES.length];
  return {
    id: `driver-${i + 1}`,
    name,
    nameAr,
    phone: `+971 5${int(0, 9)} ${int(100, 999)} ${int(1000, 9999)}`,
    avatarColor: AVATAR_COLORS[(i + 3) % AVATAR_COLORS.length],
    vehicle: pick(["bike", "scooter", "car"]),
    plate: `${pick(["A", "B", "D", "F"])}-${int(10000, 99999)}`,
    rating: num(4.3, 5.0, 1),
    status: i < 5 ? "active" : "inactive",
    location: randomPointInZone(zone),
    zoneId: zone.id,
    totalDeliveries: int(50, 1200),
    todayEarnings: num(0, 320, 2),
  };
});

// ---------------- Promos ----------------
export const PROMOS: Promo[] = [
  { id: "promo-1", code: "WELCOME20", type: "percent", value: 20, minOrder: 30, usageCount: 214, usageLimit: 1000, active: true, expiresAt: isoDaysAgo(-30) },
  { id: "promo-2", code: "FREESHIP", type: "free_delivery", value: 0, minOrder: 40, usageCount: 522, usageLimit: 800, active: true, expiresAt: isoDaysAgo(-14) },
  { id: "promo-3", code: "SAVE10", type: "fixed", value: 10, minOrder: 50, usageCount: 88, usageLimit: 300, active: true, expiresAt: isoDaysAgo(-7) },
  { id: "promo-4", code: "RAMADAN25", type: "percent", value: 25, minOrder: 60, usageCount: 640, usageLimit: 640, active: false, expiresAt: isoDaysAgo(20) },
  { id: "promo-5", code: "WEEKEND15", type: "percent", value: 15, minOrder: 25, usageCount: 301, usageLimit: 500, active: true, expiresAt: isoDaysAgo(-3) },
];

// ---------------- Orders ----------------
function buildItems(merchantId: string): OrderItem[] {
  const products = PRODUCTS.filter((p) => p.merchantId === merchantId && p.available);
  const lineCount = int(1, 4);
  const lines: OrderItem[] = [];
  for (let i = 0; i < lineCount; i++) {
    const p = pick(products.length ? products : PRODUCTS);
    lines.push({
      productId: p.id,
      name: p.name,
      nameAr: p.nameAr,
      price: p.price,
      quantity: int(1, 3),
      addOns: rnd() > 0.6 ? p.addOns.slice(0, 1) : [],
    });
  }
  return lines;
}

function computeFee(distanceKm: number, zoneId: string) {
  const tier = FEE_TIERS.find((t) => t.zoneId === zoneId && distanceKm >= t.minKm && distanceKm < t.maxKm);
  return tier ? tier.fee : 15;
}

function buildOrder(
  index: number,
  status: OrderStatus,
  opts: { minsAgo: number; withDriver?: boolean }
): Order {
  const customer = pick(CUSTOMERS);
  const merchant = pick(MERCHANTS);
  const address = customer.addresses.find((a) => a.zoneId) ?? customer.addresses[0];
  const items = buildItems(merchant.id);
  const subtotal = Math.round(items.reduce((s, it) => s + it.price * it.quantity, 0) * 100) / 100;
  const distanceKm = num(0.8, 11, 1);
  const deliveryFee = computeFee(distanceKm, merchant.zoneId);
  const usesPromo = rnd() > 0.7;
  const promo = usesPromo ? pick(PROMOS.filter((p) => p.active)) : undefined;
  const discount = promo ? Math.round((promo.type === "percent" ? subtotal * (promo.value / 100) : promo.type === "fixed" ? promo.value : 0) * 100) / 100 : 0;
  const total = Math.round((subtotal + deliveryFee - discount) * 100) / 100;

  const history: OrderStatus[] = ORDER_STATUS_SLICE(status);
  const createdAt = isoMinutesAgo(opts.minsAgo);
  const statusHistory = history.map((s, i) => ({
    status: s,
    at: isoMinutesAgo(opts.minsAgo - i * Math.max(1, Math.floor(opts.minsAgo / (history.length + 1)))),
  }));

  const driver =
    opts.withDriver || ["driver_assigned", "picked_up", "on_the_way", "delivered"].includes(status)
      ? pick(DRIVERS)
      : null;

  const order: Order = {
    id: `order-${index}`,
    code: `CHF-${String(1000 + index)}`,
    customerId: customer.id,
    merchantId: merchant.id,
    driverId: driver?.id ?? null,
    addressId: address.id,
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
    promoCode: promo?.code,
    paymentMethod: "cod",
    status,
    statusHistory,
    distanceKm,
    createdAt,
    updatedAt: statusHistory[statusHistory.length - 1]?.at ?? createdAt,
    estimatedDeliveryAt: isoMinutesFromNow(int(10, 35)),
    driverRouteProgress: status === "on_the_way" ? num(0.15, 0.85, 2) : status === "delivered" ? 1 : 0,
    driverLocation: driver ? randomPointInZone(ZONES.find((z) => z.id === merchant.zoneId)!) : null,
    rating:
      status === "delivered" && rnd() > 0.35
        ? { stars: int(3, 5), comment: pick(["Great service!", "Fast delivery, food was hot.", "Driver was very polite.", "Everything as expected."]), driverStars: int(4, 5) }
        : undefined,
    cancelReason: status === "cancelled" ? pick(["Customer changed mind", "Item out of stock", "Address unreachable"]) : status === "rejected" ? "Merchant unable to fulfill" : undefined,
  };
  return order;
}

function ORDER_STATUS_SLICE(status: OrderStatus): OrderStatus[] {
  const flow: OrderStatus[] = ["placed", "accepted", "preparing", "ready", "driver_assigned", "picked_up", "on_the_way", "delivered"];
  if (status === "cancelled") return ["placed", "cancelled"];
  if (status === "rejected") return ["placed", "rejected"];
  const idx = flow.indexOf(status);
  return flow.slice(0, idx + 1);
}

const LIFECYCLE_PLAN: { status: OrderStatus; minsAgo: number }[] = [
  { status: "placed", minsAgo: 2 },
  { status: "placed", minsAgo: 5 },
  { status: "accepted", minsAgo: 8 },
  { status: "preparing", minsAgo: 12 },
  { status: "preparing", minsAgo: 15 },
  { status: "ready", minsAgo: 10 },
  { status: "driver_assigned", minsAgo: 18 },
  { status: "picked_up", minsAgo: 22 },
  { status: "on_the_way", minsAgo: 14 },
  { status: "on_the_way", minsAgo: 9 },
  { status: "delivered", minsAgo: 40 },
  { status: "delivered", minsAgo: 90 },
  { status: "delivered", minsAgo: 180 },
  { status: "delivered", minsAgo: 60 * 24 },
  { status: "delivered", minsAgo: 60 * 30 },
  { status: "cancelled", minsAgo: 70 },
  { status: "rejected", minsAgo: 120 },
];

export const ORDERS: Order[] = LIFECYCLE_PLAN.map((p, i) => buildOrder(i + 1, p.status, { minsAgo: p.minsAgo }));

// extra bulk history so reports/lists look populated
for (let i = 0; i < 40; i++) {
  const status = pick<OrderStatus>(["delivered", "delivered", "delivered", "cancelled"]);
  ORDERS.push(buildOrder(LIFECYCLE_PLAN.length + i + 1, status, { minsAgo: int(60 * 2, 60 * 24 * 20) }));
}

// ---------------- Support tickets ----------------
export const SUPPORT_TICKETS: SupportTicket[] = Array.from({ length: 9 }).map((_, i) => {
  const customer = pick(CUSTOMERS);
  const order = rnd() > 0.3 ? pick(ORDERS) : undefined;
  return {
    id: `ticket-${i + 1}`,
    subject: pick([
      "Order arrived late",
      "Missing item in order",
      "Driver could not find address",
      "Refund request",
      "App payment question",
      "Wrong item delivered",
      "Promo code not applying",
    ]),
    customerId: customer.id,
    orderId: order?.id,
    status: pick(["open", "pending", "resolved"]),
    priority: pick(["low", "medium", "high"]),
    createdAt: isoDaysAgo(int(0, 10)),
    lastMessage: "Thanks for reaching out, we're looking into this for you.",
  };
});
