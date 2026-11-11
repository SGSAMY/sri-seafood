/* ==========================================================================
   SRI SEAFOOD — SITE SETTINGS
   This is the only file you need to edit to switch the shop on or off.
   ========================================================================== */
(function (root, factory) {
  var cfg = factory();
  if (typeof module === "object" && module.exports) module.exports = cfg;
  else root.SRI_CONFIG = cfg;
})(typeof self !== "undefined" ? self : this, function () {
  return {
    /* SHOP MODE — pick one:
       "whatsapp"  → customers build a basket, then send the order to you on WhatsApp (no payment online). DEFAULT.
       "checkout"  → full online shop: basket + secure card payment via Stripe (needs STRIPE_SECRET_KEY on Netlify).
       "catalogue" → no basket at all; every product just has an "Order on WhatsApp" button. */
    shopMode: "whatsapp",

    business: {
      name: "Sri Seafood",
      tagline: "Fresh from the Sea. Quality You Trust.",
      location: "Royal Tunbridge Wells, Kent",
      deliveryArea: "Kent, Sussex, Croydon and Orpington",
      email: "info@sriseafood.co.uk",
      phone: "+44 7425 254 624",
      whatsappNumber: "447733689686",            // digits only, no + or spaces
      whatsappDisplay: "+44 7733 689 686",
      whatsappCommunity: "https://chat.whatsapp.com/CjFyxm2n4WYGlaCX2Nku85",
      facebook: "https://www.facebook.com/profile.php?id=61592710559635",
      instagram: "https://www.instagram.com/sri.seafood/",
      linkedin: "https://www.linkedin.com/company/sri-seafood/",
      gamesUrl: ""                                 // optional: link to Sri Seafood Games, e.g. "https://...netlify.app"
    },

    delivery: {
      dropDays: [6],                    // regular delivery days: 0=Sun … 6=Sat → Saturday
      extraDays: [2],                   // "subject to availability" days → Tuesday ([] to hide)

      /* NO-DELIVERY DATES — add any date you are NOT delivering (holidays, no stock).
         Format "YYYY-MM-DD", in quotes, separated by commas. The website skips these
         and shows the next delivery day instead. Old dates can be left or deleted.
         Example: skipDates: ["2026-12-26", "2027-01-02"], */
      skipDates: [],

      freeOver: 45,                     // £ — free delivery threshold
      fee: 4.99                         // £ — CHECK THIS: delivery charge below the threshold (used in "checkout" mode)
    },

    currency: "GBP"
  };
});
