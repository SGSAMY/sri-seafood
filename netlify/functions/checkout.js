/* ==========================================================================
   Stripe Checkout — only used when shopMode is "checkout" in assets/js/config.js
   Needs one environment variable in Netlify → Site configuration → Environment variables:
     STRIPE_SECRET_KEY = sk_live_...  (or sk_test_... while testing)
   Prices are always taken from products.js on the server, never from the browser.
   ========================================================================== */
const PRODUCTS = require("../../assets/js/products.js");
const CFG = require("../../assets/js/config.js");

const json = (status, body) => ({ statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  if (CFG.shopMode !== "checkout") return json(403, { error: "Online checkout is switched off" });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(500, { error: "Payments not configured" });

  let items;
  try { items = JSON.parse(event.body || "{}").items || []; } catch { return json(400, { error: "Bad request" }); }
  if (!Array.isArray(items) || !items.length || items.length > 40) return json(400, { error: "Basket is empty" });

  const origin = event.headers.origin || `https://${event.headers.host}`;
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${origin}/order-success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${origin}/shop.html`);
  params.append("shipping_address_collection[allowed_countries][0]", "GB");
  params.append("phone_number_collection[enabled]", "true");
  params.append("billing_address_collection", "auto");

  let subtotal = 0, n = 0;
  const summary = [];
  for (const it of items) {
    const p = PRODUCTS.find((x) => x.id === it.id || x.aliases.includes(it.id));
    const half = p && p.unit === "kg";                 // kg items are sold in 500g steps
    const qty = Math.max(half ? 0.5 : 1, Math.min(20, Math.round((parseFloat(it.qty) || 1) * (half ? 2 : 1)) / (half ? 2 : 1)));
    if (!p || !p.inStock || p.price == null) return json(400, { error: `${it.id} is unavailable` });
    const cut = p.cuts.includes(it.cut) ? it.cut : p.cuts[0];
    const kgPrice = p.prices[cut];
    const note = String(it.note || "").slice(0, 200);
    const units = half ? qty * 2 : qty;
    const unitPence = Math.round(kgPrice * 100 / (half ? 2 : 1));
    subtotal += unitPence * units;
    params.append(`line_items[${n}][quantity]`, String(units));
    params.append(`line_items[${n}][price_data][currency]`, "gbp");
    params.append(`line_items[${n}][price_data][unit_amount]`, String(unitPence));
    params.append(`line_items[${n}][price_data][product_data][name]`, `${p.name}${cut ? " — " + cut : ""} (per ${half ? "500g" : p.unit})`);
    if (note) params.append(`line_items[${n}][price_data][product_data][description]`, `Note: ${note}`);
    summary.push(`${p.name}${cut ? " / " + cut : ""} ${qty}${p.unit}${note ? " (" + note + ")" : ""}`);
    n++;
  }

  const freeOver = Math.round(CFG.delivery.freeOver * 100);
  const fee = subtotal >= freeOver ? 0 : Math.round(CFG.delivery.fee * 100);
  params.append("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.append("shipping_options[0][shipping_rate_data][display_name]", fee ? "Local delivery (Saturday)" : "Free local delivery (Saturday)");
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(fee));
  params.append("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "gbp");
  params.append("metadata[order]", summary.join("; ").slice(0, 490));

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString()
  });
  const data = await res.json();
  if (!res.ok) { console.error(data); return json(502, { error: "Could not start checkout" }); }
  return json(200, { url: data.url });
};
