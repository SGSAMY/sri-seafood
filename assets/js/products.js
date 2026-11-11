/* ==========================================================================
   SRI SEAFOOD — PRODUCT CATALOGUE  (prices match the November 2026 price list)
   Edit prices, stock and cuts here. Every page (and the payment function)
   reads from this one list.

   id        → used in the web address: product.html?id=king-fish
   prices    → £ per kg for each preparation the customer can choose, e.g.
               { "Whole": 17.60, "Cleaned": 18.75, "Steak": 22.80 }
               Whole = unprepared whole fish. Leave a cut out if you don't offer it.
               {} = price on request.
   unit      → "kg" (sold from 500g, in 500g steps) or "prawn" etc.
   inStock   → false shows "Sold out" and blocks ordering
   aliases   → old web addresses that should open this product
   image     → photo path in assets/img/products/ ("" shows an illustration).
   hero      → false keeps this photo out of the random homepage picture
               (still shown in the shop). Leave it out to include the photo.
   ========================================================================== */
(function (root, factory) {
  var data = factory();
  // Derive helpers: cuts (list of options) and price (lowest "from" price)
  data.forEach(function (p) {
    p.prices = p.prices || {};
    p.cuts = Object.keys(p.prices);
    var vals = p.cuts.map(function (c) { return p.prices[c]; });
    p.price = vals.length ? Math.min.apply(null, vals) : null;
    p.priceVaries = vals.length > 1 && Math.max.apply(null, vals) !== p.price;
    p.aliases = p.aliases || [];
  });
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.SRI_PRODUCTS = data;
})(typeof self !== "undefined" ? self : this, function () {

  return [
    /* ---------- Signature ---------- */
    { id: "tiger-prawns", name: "Prawns (Uncleaned)", category: "shellfish", unit: "kg", inStock: true, featured: true,
      prices: { "Whole": 12.50 }, image: "assets/img/products/prawns.jpg",
      short: "Jumbo prawns with large, meaty bodies and a sweet flavour.",
      description: "Extraordinary jumbo prawns with large, meaty bodies and a naturally sweet flavour, supplied whole and uncleaned. Sublime grilled, or added to luxury curries and gourmet meals." },

    { id: "sea-bream", name: "Sea Bream", category: "fish", unit: "kg", inStock: true, featured: true,
      prices: { "Whole": 12.78, "Cleaned": 13.81, "Steak": 14.81 }, image: "assets/img/products/sea-bream.jpg",
      short: "Tender white flesh with a mild, slightly sweet profile.",
      description: "Premium sea bream with tender white flesh and a mild, slightly sweet profile. A refined choice for grilling, baking or Mediterranean dining." },

    { id: "mackerel", name: "Mackerel", category: "fish", unit: "kg", inStock: true, featured: true,
      prices: { "Whole": 11.78, "Cleaned": 12.95, "Steak": 13.95 }, image: "assets/img/products/mackerel.jpg",
      short: "Rich, oily and meaty — made for the grill or a coastal curry.",
      description: "Premium oily mackerel with a deep, rich flavour and meaty texture. Excellent grilled, fried, or adding heartiness to coastal curries." },

    { id: "anchovy", hero: false, name: "Anchovy", category: "fish", unit: "kg", inStock: true, featured: true,
      prices: { "Cleaned": 19.88 }, image: "assets/img/products/anchovy.jpg",
      short: "Small, oily and intensely savoury. Cleaned and ready to cook.",
      description: "Small, oily and intensely savoury. Our cleaned anchovies (nethili) are perfect for frying, grilling, or adding deep umami to pasta, pizzas and salads." },

    /* ---------- Fresh fish ---------- */
    { id: "king-fish", name: "King Fish", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 20.99, "Cleaned": 21.99, "Steak": 27.99, "Head Removed & Steak Cut": 28.99, "Curry Cut": 29.99 },
      image: "assets/img/products/king-fish.jpg",
      short: "Robust, meaty texture and savoury depth. A vanjaram favourite.",
      description: "Our premium king fish (vanjaram) is renowned for its rich flavour, meaty texture and exceptional quality. Carefully prepared and hygienically packed — perfect for grilling, baking, pan-frying or traditional curries." },

    { id: "pomfret-black", name: "Pomfret – Black", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 21.97, "Cleaned": 22.97, "Steak": 23.97 }, image: "assets/img/products/pomfret-black.jpg",
      short: "Firm, flavourful black pomfret — superb fried or in curry.",
      description: "Black pomfret with firm, flavourful flesh that holds its shape beautifully. Superb shallow-fried, grilled or simmered in a rich curry." },

    { id: "pomfret-silver", hero: false, name: "Pomfret – Silver", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 32.93, "Cleaned": 33.93, "Steak": 34.93 }, image: "assets/img/products/pomfret-silver.jpg",
      short: "The prized silver pomfret — delicate, buttery and fine.",
      description: "The prized silver pomfret, with delicate, buttery white flesh and very few bones. A special-occasion fish for steaming, tawa fry or grilling." },

    { id: "pomfret-gold", hero: false, name: "Pomfret – Gold", category: "fish", unit: "kg", inStock: true, aliases: ["silver-promfret"],
      prices: { "Whole": 14.95, "Cleaned": 15.95, "Steak": 16.95 }, image: "assets/img/products/pomfret-gold.jpg",
      short: "Delicate flavour, tender texture — an everyday classic.",
      description: "Golden pomfret, carefully selected for its delicate flavour and tender texture. Ideal for steaming, grilling or Asian-style cooking." },

    { id: "red-snapper", name: "Red Snapper (Small)", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 17.79, "Cleaned": 18.90 }, image: "assets/img/products/red-snapper-small.jpg",
      short: "Firm, succulent and sweet. Brilliant fried or in curry.",
      description: "Vibrant, succulent red snapper with a firm texture and rich, sweet taste. Perfect grilled, fried or in an authentic seafood curry." },

    { id: "red-snapper-large", name: "Red Snapper (Large)", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 19.67, "Cleaned": 20.81, "Steak": 22.80 }, image: "assets/img/products/red-snapper.jpg",
      short: "Larger snapper — ideal cut into steaks.",
      description: "Larger red snapper with firm, sweet flesh — ideal cut into steaks, or roasted whole for a family table." },

    { id: "sea-bass", name: "Sea Bass", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 12.85, "Cleaned": 13.90, "Steak": 14.90 }, image: "assets/img/products/sea-bass.jpg",
      short: "Delicate, flaky white flesh with a clean taste.",
      description: "Exquisite sea bass with delicate, flaky white flesh and a mild, clean profile. Sublime grilled, baked or pan-fried." },

    { id: "lady-fish", hero: false, name: "Lady Fish", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 20.86, "Cleaned": 21.86 }, image: "assets/img/products/lady-fish.jpg",
      short: "Mild and delicate with a white, flaky texture.",
      description: "Delicate, mild-flavoured lady fish, prized for its white, flaky texture. A premium choice for light frying or traditional steamed preparations." },

    { id: "salmon-fish", hero: false, name: "Salmon", category: "fish", unit: "kg", inStock: true,
      prices: { "Cleaned": 19.92, "Steak": 21.96 }, image: "assets/img/products/salmon.jpg",
      short: "Whole salmon, cleaned or cut into steaks.",
      description: "Whole salmon, cleaned or cut into steaks. Rich and buttery — wonderful baked, grilled or in curry." },

    { id: "salmon", name: "Salmon Fillet", category: "fish", unit: "kg", inStock: true,
      prices: { "Fillet": 23.97 }, image: "assets/img/products/salmon-fillet.jpg",
      short: "Rich, buttery and tender. Ready to sear, bake or grill.",
      description: "Our salmon fillet is celebrated for its rich, buttery oil content and tender, flaky bite. Wonderful pan-seared, baked or grilled." },

    { id: "tuna", name: "Tuna", category: "fish", unit: "kg", inStock: true,
      prices: { "Steak": 33.93 }, image: "assets/img/products/tuna.jpg",
      short: "Deep red, firm steaks for searing and grilling.",
      description: "Firm, deep-red tuna steaks with a clean, meaty flavour. Sear quickly over high heat, grill, or cube for a spiced curry." },

    { id: "barramundi", name: "Barramundi", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 17.73, "Cleaned": 18.80, "Steak": 21.20 }, image: "assets/img/products/barramundi.jpg",
      short: "Mild, buttery white fish with large flakes.",
      description: "Barramundi (koduva) with a mild, buttery flavour and large, moist flakes. Excellent pan-fried with crisp skin, baked or in curry." },

    { id: "emperor", name: "Emperor", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 18.68, "Cleaned": 19.87, "Steak": 22.53 }, image: "assets/img/products/emperor.jpg",
      short: "Firm, sweet reef fish — great whole or in curry.",
      description: "Emperor fish with firm, sweet white flesh. Lovely roasted or grilled whole, or cut for a rich, spiced curry." },

    { id: "trevally", hero: false, name: "Trevally", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 17.85, "Cleaned": 18.92, "Steak": 21.47 }, image: "assets/img/products/trevally.jpg",
      short: "Meaty and full-flavoured. A curry and fry essential.",
      description: "Trevally (paarai) with a meaty texture and full flavour that holds up to bold spices — superb fried or in curry." },

    { id: "barracuda", name: "Barracuda", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 18.80, "Cleaned": 19.87, "Steak": 21.86 }, image: "assets/img/products/barracuda.jpg",
      short: "Firm, lean steaks that stay together in the pan.",
      description: "Barracuda (sheela) with firm, lean flesh that holds its shape — ideal for steaks, fry and slow-cooked curries." },

    { id: "indian-mackerel", name: "Indian Mackerel", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 17.60, "Cleaned": 18.75 }, image: "assets/img/products/indian-mackerel.jpg",
      short: "Bold, oily ayala — the home-style fry favourite.",
      description: "Indian mackerel (ayala / bangda) with a bold, rich flavour. A home-cooking favourite for masala fry, grilling or tangy curries." },

    { id: "sardine", name: "Sardine", category: "fish", unit: "kg", inStock: true,
      prices: { "Whole": 14.95, "Cleaned": 16.90 }, image: "assets/img/products/sardine.jpg",
      short: "Small, oily and full of flavour. Perfect fried.",
      description: "Sardines (mathi) — small, oily and packed with flavour. Classic fried, grilled or in a tangy curry." },

    /* ---------- Shellfish & squid ---------- */
    { id: "squid", name: "Squid", category: "shellfish", unit: "kg", inStock: true,
      prices: { "Whole": 18.90, "Cleaned": 19.95 }, image: "assets/img/products/squid.jpg",
      short: "Tender squid for rings, stir-fries and pepper fry.",
      description: "Fresh squid that turns beautifully tender when cooked quickly. Slice into rings for frying, stir-fry, or make a classic pepper fry." },

    { id: "crab", name: "Blue Crab", category: "shellfish", unit: "kg", inStock: true,
      prices: { "Whole": 18.45, "Cleaned": 19.49 }, image: "assets/img/products/blue-crab.jpg",
      short: "Purely sweet, tender meat for curries and feasts.",
      description: "Outstanding blue crab with purely sweet, tender meat. A refined pick for steaming or hearty curries — a stunning centrepiece for a coastal dinner." },

    { id: "lobster", hero: false, name: "Lobster", category: "shellfish", unit: "kg", inStock: true,
      prices: { "Whole": 29.93 }, image: "assets/img/products/lobster.jpg",
      short: "Sweet, tender meat for a special occasion.",
      description: "Luxurious lobster with sweet, tender meat and a rich flavour. A decadent choice for steaming, grilling, or elevating any special-occasion menu." }
  ];
});
