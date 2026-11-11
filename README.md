# Sri Seafood — website

A fast, static website for Sri Seafood. No monthly platform fee: it runs free on Netlify (or GitHub Pages).

## What's inside

| Page | File |
|---|---|
| Home | `index.html` |
| Shop (filter, search, sort) | `shop.html` |
| Product page (one template for every fish) | `product.html?id=king-fish` |
| Our story | `about.html` |
| Delivery & FAQ | `delivery.html` |
| Contact (form → your Netlify inbox) | `contact.html` |
| Privacy, thank-you, order-success, 404 | |

Everything you'll usually edit lives in two files:

- **`assets/js/products.js`** — names, prices, stock (`inStock: false` = "Sold out"), cut options, photos.
- **`assets/js/config.js`** — shop mode, phone/WhatsApp numbers, delivery days, free-delivery threshold.

## Switching the shop on and off

In `assets/js/config.js` set `shopMode`:

| Mode | What customers see |
|---|---|
| `"whatsapp"` **(default)** | Full basket. "Send order on WhatsApp" turns it into a ready-written message to +44 7733 689 686 with items, cuts, notes, name, postcode and preferred drop day. No payment online. |
| `"catalogue"` | No basket. Every product has an "Order on WhatsApp" button. |
| `"checkout"` | Full online shop with secure card payment via Stripe. |

### Turning on card payments later
1. Create a Stripe account (pay-as-you-go, no monthly fee).
2. Netlify → *Site configuration → Environment variables* → add `STRIPE_SECRET_KEY` (start with a `sk_test_…` key).
3. Set `delivery.fee` in `config.js` to your real delivery charge.
4. Change `shopMode` to `"checkout"` and redeploy. Test with card `4242 4242 4242 4242`, then swap in your live key.

Prices are checked on the server from `products.js`, so nobody can change a price in their browser.

## Deploying on Netlify (recommended)

**Drag and drop:** Netlify → *Add new site → Deploy manually* → drop this folder.
**From GitHub:** push this folder to a repo → Netlify → *Import from Git*. No build command; publish directory `.`.

Then: *Domain management → Add domain* → `sriseafood.co.uk` and follow the DNS steps.

Netlify handles: free HTTPS, the contact form (submissions under *Forms*; turn on email notifications there), the Stripe function, and redirects so old Wix links like `/product-page/king-fish` and `/about-us` still work.

> GitHub Pages also works for the pages, but not the contact form, payments or old-link redirects. Use Netlify.

## Before you cancel Wix ✅

All photos, the logo and the founder photo are now stored in this folder, so nothing loads from Wix any more.

1. **Deploy to Netlify** and check the site on your phone.
2. **Domain:** if `sriseafood.co.uk` is registered through Wix, point its DNS at Netlify (or transfer it out) before ending the plan. Wix can keep the domain registration on its own without the £35/month website plan.
3. **Cancel the Wix website plan.** Old Wix links (e.g. `/product-page/king-fish`, `/about-us`) redirect to the new pages automatically.

## Updating photos
Product photos are in `assets/img/products/`. To change one, replace the file with a new square photo (keep it under ~90KB) using the same file name.

## No delivery this week?
Open `assets/js/config.js` and add the date to `skipDates`, e.g.
`skipDates: ["2026-12-26"],` — the "Next fresh drop" date and the basket's delivery choices skip it automatically. Then redeploy.

## Optional
- Add your Sri Seafood Games link in `config.js` → `gamesUrl` and it appears in the footer.
- Logo files: `assets/img/logo.png` (navy, for light backgrounds) and `assets/img/logo-white.png` (for the navy footer and menu).
