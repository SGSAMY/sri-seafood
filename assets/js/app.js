/* ==========================================================================
   SRI SEAFOOD — site behaviour
   Product rendering · shop filters · product page · basket · WhatsApp / Stripe
   ========================================================================== */
(function () {
  "use strict";

  var CFG = window.SRI_CONFIG;
  var PRODUCTS = window.SRI_PRODUCTS || [];
  var MODE = CFG.shopMode; // whatsapp | checkout | catalogue
  var B = CFG.business;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var money = function (n) { return "£" + Number(n).toFixed(2); };
  var byId = function (id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id || PRODUCTS[i].aliases.indexOf(id) > -1) return PRODUCTS[i]; return null; };
  var priceOf = function (p, cut) { return p.prices[cut] != null ? p.prices[cut] : p.price; };
  /* Line total in pounds, worked out in pence per 500g so it always matches the card checkout */
  var lineTotal = function (p, cut, qty) {
    var kg = p.unit === "kg", unitPence = Math.round(priceOf(p, cut) * 100 / (kg ? 2 : 1));
    return unitPence * Math.round(qty * (kg ? 2 : 1)) / 100;
  };
  var CAT = { fish: "Fresh Fish", shellfish: "Shellfish & Squid" };
  var stepOf = function (p) { return p && p.unit === "kg" ? 0.5 : 1; };
  var fmtQty = function (q, p) { return p.unit === "kg" ? (q < 1 ? q * 1000 + "g" : q + " kg") : q + " " + p.unit + (q > 1 ? "s" : ""); };

  document.documentElement.classList.add("mode-" + MODE);

  /* ---------- Icons ---------- */
  var I = {
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.03c-.24.69-1.42 1.32-1.96 1.37-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36l.56.01c.18.01.42-.07.66.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.36 1.46.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 2 .95.29.15.49.22.56.34.07.12.07.7-.17 1.39Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'
  };
  var FISH = '<svg viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 50c22-30 70-40 112-22 14 6 26 14 34 22-8 8-20 16-34 22C88 90 40 80 18 50Z"/><path d="M164 50l22-20v40l-22-20Z"/><circle cx="48" cy="44" r="4" fill="currentColor"/><path d="M70 30c8 12 8 28 0 40M96 26c-6 8-6 40 0 48" opacity=".45"/><path d="M110 28c10 4 22 10 30 16M110 72c10-4 22-10 30-16" opacity=".3"/></svg>';
  var SHELL = '<svg viewBox="0 0 200 100" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M40 70c0-30 26-52 58-52 26 0 46 14 52 34 4 14-6 26-20 26H60c-12 0-20-3-20-8Z"/><path d="M60 78c4-14 14-30 30-40M84 78c2-14 8-28 20-40M108 78c0-12 4-24 12-34" opacity=".45"/><path d="M150 50c12-6 22-18 26-30M146 60c14-2 28-8 36-18" /><circle cx="128" cy="40" r="3.5" fill="currentColor"/><path d="M48 78l-10 10M70 78l-6 12M92 78l-2 12" opacity=".5"/></svg>';

  function media(p, cls) {
    var ph = '<div class="ph" aria-hidden="true">' + (p.category === "shellfish" ? SHELL : FISH) + "<span>" + esc(p.name) + "</span></div>";
    var img = p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" onerror="this.remove()">' : "";
    return '<div class="' + (cls || "media") + '">' + ph + img + "</div>";
  }
  function priceHTML(p, cut) {
    if (p.price == null) return '<span class="price" style="font-size:1rem">Price on request</span>';
    var from = !cut && p.priceVaries ? "<small>from </small>" : "";
    return '<span class="price">' + from + money(cut ? priceOf(p, cut) : p.price) + " <small>/ " + esc(p.unit) + "</small></span>";
  }

  /* ---------- WhatsApp ---------- */
  function waLink(text) { return "https://wa.me/" + B.whatsappNumber + "?text=" + encodeURIComponent(text); }
  function waProduct(p, cut, qty, note) {
    var t = "Hello Sri Seafood! I'd like to order:\n\n• " + p.name + (cut ? " — " + cut : "") + (qty ? " × " + fmtQty(qty, p) : "");
    if (note) t += "\n  Note: " + note;
    t += "\n\nPlease confirm availability and the next delivery slot. Thank you!";
    return waLink(t);
  }

  /* ---------- Product card ---------- */
  function cardHTML(p) {
    var badge = !p.inStock ? '<span class="badge badge--out">Sold out</span>' : (p.featured ? '<span class="badge badge--gold">Signature</span>' : "");
    var action;
    if (!p.inStock) action = "";
    else if (MODE === "catalogue" || p.price == null)
      action = '<a class="add-btn add-btn--wa" href="' + waProduct(p) + '" target="_blank" rel="noopener" aria-label="Order ' + esc(p.name) + ' on WhatsApp">' + I.wa + "</a>";
    else if (p.cuts && p.cuts.length > 1)
      action = '<a class="add-btn" href="product.html?id=' + p.id + '" aria-label="Choose cut for ' + esc(p.name) + '">' + I.plus + "</a>";
    else
      action = '<button class="add-btn" data-quick-add="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to basket">' + I.plus + "</button>";
    return '<article class="card reveal">' + badge + media(p) +
      '<div class="card-body"><div class="card-cat">' + CAT[p.category] + "</div>" +
      '<h3><a href="product.html?id=' + p.id + '">' + esc(p.name) + "</a></h3>" +
      "<p>" + esc(p.short) + "</p>" +
      '<div class="card-foot">' + priceHTML(p) + action + "</div></div></article>";
  }

  function renderGrid(el, list) {
    el.innerHTML = list.length ? list.map(cardHTML).join("") : '<div class="empty">No fish match that search — try another name, or <a class="link-arrow" href="' + waLink("Hello Sri Seafood! Do you have…") + '" target="_blank" rel="noopener">ask us on WhatsApp</a></div>';
    observeReveal(el);
  }

  $$("[data-products]").forEach(function (el) {
    var kind = el.getAttribute("data-products");
    var limit = +el.getAttribute("data-limit") || 999;
    var list = PRODUCTS.slice();
    if (kind === "featured") list = list.filter(function (p) { return p.featured; });
    if (kind === "range") list = list.filter(function (p) { return !p.featured && p.inStock && p.image; });
    if (kind === "related") {
      var cur = byId(new URLSearchParams(location.search).get("id"));
      list = list.filter(function (p) { return p.inStock && (!cur || (p.id !== cur.id && p.category === cur.category)); });
    }
    renderGrid(el, list.slice(0, limit));
  });
  $$("[data-product-count]").forEach(function (el) { el.textContent = PRODUCTS.length; });

  /* ---------- Shop page ---------- */
  var shopGrid = $("#shop-grid");
  if (shopGrid) {
    var state = { cat: new URLSearchParams(location.search).get("cat") || "all", q: "", sort: "featured" };
    var apply = function () {
      var list = PRODUCTS.filter(function (p) {
        return (state.cat === "all" || p.category === state.cat) &&
          (!state.q || (p.name + " " + p.description).toLowerCase().indexOf(state.q) > -1);
      });
      var s = state.sort;
      list.sort(function (a, b) {
        if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
        if (s === "low") return (a.price || 999) - (b.price || 999);
        if (s === "high") return (b.price || 0) - (a.price || 0);
        if (s === "az") return a.name.localeCompare(b.name);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
      renderGrid(shopGrid, list);
      $("#result-count").textContent = list.length + (list.length === 1 ? " item" : " items") + (state.cat !== "all" ? " in " + CAT[state.cat] : "");
      $$("[data-cat]").forEach(function (c) { c.classList.toggle("is-active", c.getAttribute("data-cat") === state.cat); c.setAttribute("aria-pressed", c.getAttribute("data-cat") === state.cat); });
    };
    $$("[data-cat]").forEach(function (c) { c.addEventListener("click", function () { state.cat = c.getAttribute("data-cat"); apply(); }); });
    $("#shop-search").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); apply(); });
    $("#shop-sort").addEventListener("change", function (e) { state.sort = e.target.value; apply(); });
    apply();
  }

  /* ---------- Product page ---------- */
  var pdp = $("#pdp");
  if (pdp) {
    var p = byId(new URLSearchParams(location.search).get("id"));
    if (!p) {
      pdp.innerHTML = '<div class="empty"><h2>We couldn\'t find that fish</h2><p>It may have swum off the menu.</p><a class="btn btn--primary" href="shop.html">Browse the full catch</a></div>';
    } else {
      document.title = p.name + " | Sri Seafood";
      var md = $('meta[name="description"]'); if (md) md.setAttribute("content", p.description);
      /* Give each product its own address for Google */
      var canon = "https://sriseafood.co.uk/product?id=" + p.id;
      var cl = $('link[rel="canonical"]'); if (cl) cl.setAttribute("href", canon);
      var ogu = $('meta[property="og:url"]'); if (ogu) ogu.setAttribute("content", canon);
      var ogt = $('meta[property="og:title"]'); if (ogt) ogt.setAttribute("content", p.name + " | Sri Seafood");
      var ogd = $('meta[property="og:description"]'); if (ogd) ogd.setAttribute("content", p.description);
      var step = stepOf(p); var sel = { cut: p.cuts.length ? p.cuts[0] : "", qty: 1 };
      var canBuy = p.inStock && p.price != null;
      var buyBtns = "";
      if (!p.inStock) buyBtns = '<div class="pdp-actions single"><a class="btn btn--wa btn--block" target="_blank" rel="noopener" href="' + waLink("Hello Sri Seafood! Please let me know when " + p.name + " is back in stock.") + '">' + I.wa + " Tell me when it's back</a></div>";
      else if (MODE === "catalogue" || !canBuy) buyBtns = '<div class="pdp-actions single"><a id="pdp-wa" class="btn btn--wa btn--block" target="_blank" rel="noopener" href="#">' + I.wa + " Order on WhatsApp</a></div>";
      else buyBtns = '<div class="pdp-actions"><button id="pdp-add" class="btn btn--primary">' + I.bag + ' Add to basket</button><a id="pdp-wa" class="btn btn--wa" target="_blank" rel="noopener" href="#">' + I.wa + " Order now on WhatsApp</a></div>";

      pdp.innerHTML =
        media(p, "pdp-media") +
        '<div><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> / <a href="shop.html">Shop</a> / <a href="shop.html?cat=' + p.category + '">' + CAT[p.category] + "</a></nav>" +
        '<div class="card-cat">' + CAT[p.category] + (p.inStock ? "" : " · Sold out") + "</div>" +
        "<h1>" + esc(p.name) + "</h1>" +
        '<div class="pdp-price" id="pdp-price">' + priceHTML(p, sel.cut) + "</div>" +
        '<p class="pdp-desc">' + esc(p.description) + "</p>" +
        (p.cuts.length ? '<div class="opt-group"><span class="label">Cut type</span><div class="chips" role="radiogroup" aria-label="Cut type">' +
          p.cuts.map(function (c, i) { return '<button class="chip chip--opt' + (i === 0 ? " is-active" : "") + '" role="radio" aria-checked="' + (i === 0) + '" data-cut="' + esc(c) + '">' + esc(c) + (p.cuts.length > 1 ? ' <span style="opacity:.7;font-weight:600">· ' + money(p.prices[c]) + "</span>" : "") + "</button>"; }).join("") + "</div></div>" : "") +
        '<div class="opt-group"><span class="label">Quantity' + (p.unit === "kg" ? " (minimum 500g)" : "") + '</span><div class="qty"><button data-q="-1" aria-label="Decrease">−</button><output id="pdp-qty">' + fmtQty(1, p) + '</output><button data-q="1" aria-label="Increase">+</button></div></div>' +
        '<div class="opt-group"><label class="label" for="pdp-note">Special requests <span style="font-weight:500;color:var(--muted)">(optional)</span></label><textarea id="pdp-note" class="textarea" maxlength="500" placeholder="e.g. head on, medium pieces, skin removed…" style="min-height:84px"></textarea></div>' +
        buyBtns +
        '<p class="pdp-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>Priced per ' + esc(p.unit) + '. Fresh fish varies naturally in size, so we confirm the final weight and price with you before delivery. Head and tail included unless you ask otherwise.</p>' +
        '<div class="acc"><details open><summary>Freshness &amp; packing</summary><p>Selected from trusted suppliers, prepared to your chosen cut, vacuum-packed and delivered in an insulated cool box with ice. Keep refrigerated and enjoy within 1–2 days, or freeze on arrival.</p></details>' +
        "<details><summary>Delivery</summary><p>Our regular fresh drop is every <b>Saturday</b> across " + esc(B.deliveryArea) + "; Tuesday delivery is subject to availability. Orders close at 7pm the day before. Free delivery on orders over " + money(CFG.delivery.freeOver) + '. <a class="link-arrow" href="delivery.html">Delivery details</a></p></details>' +
        "<details><summary>Payment</summary><p>Pay by card, cash or bank transfer. We check every item before it leaves us.</p></details></div></div>";

      var qtyOut = $("#pdp-qty");
      var updWa = function () { var a = $("#pdp-wa"); if (a) a.href = waProduct(p, sel.cut, sel.qty, $("#pdp-note").value.trim()); };
      $$("[data-cut]", pdp).forEach(function (b) {
        b.addEventListener("click", function () {
          sel.cut = b.getAttribute("data-cut");
          $$("[data-cut]", pdp).forEach(function (x) { x.classList.toggle("is-active", x === b); x.setAttribute("aria-checked", x === b); });
          $("#pdp-price").innerHTML = priceHTML(p, sel.cut);
          updWa();
        });
      });
      $$("[data-q]", pdp).forEach(function (b) {
        b.addEventListener("click", function () { sel.qty = Math.max(step, Math.min(20, +(sel.qty + step * b.getAttribute("data-q")).toFixed(1))); qtyOut.textContent = fmtQty(sel.qty, p); updWa(); });
      });
      $("#pdp-note").addEventListener("input", updWa);
      var addBtn = $("#pdp-add");
      if (addBtn) addBtn.addEventListener("click", function () { Basket.add(p.id, sel.cut, sel.qty, $("#pdp-note").value.trim()); });
      updWa();
    }
  }

  /* ---------- Basket ---------- */
  var KEY = "sri_basket_v1";
  var Basket = {
    items: (function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } })()
      .filter(function (i) { var p = byId(i.id); if (p) i.id = p.id; return p && p.inStock && p.price != null && (!i.cut || p.prices[i.cut] != null); }),
    save: function () { try { localStorage.setItem(KEY, JSON.stringify(this.items)); } catch (e) {} renderBasket(); },
    add: function (id, cut, qty, note) {
      var p = byId(id); if (!p || !p.inStock || p.price == null) return;
      var key = id + "|" + (cut || "") + "|" + (note || "");
      var ex = this.items.filter(function (i) { return i.key === key; })[0];
      if (ex) ex.qty = Math.min(20, ex.qty + qty); else this.items.push({ key: key, id: id, cut: cut || "", qty: qty, note: note || "" });
      this.save();
      bump();
      toast(p.name + (cut ? " (" + cut + ")" : "") + " added", "View basket", openDrawer);
    },
    set: function (key, qty) {
      this.items = this.items.map(function (i) { if (i.key === key) i.qty = qty; return i; }).filter(function (i) { return i.qty > 0; });
      this.save();
    },
    subtotal: function () { return this.items.reduce(function (s, i) { var p = byId(i.id); return s + lineTotal(p, i.cut, i.qty); }, 0); },
    count: function () { return this.items.length; }
  };

  function bump() { $$(".cart-count").forEach(function (c) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }); }

  /* Drawer markup */
  if (MODE !== "catalogue") {
    var drawerHTML =
      '<div class="scrim" data-close-drawer></div>' +
      '<aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" aria-hidden="true">' +
      '<div class="drawer-head"><h2 id="drawer-title">Your basket</h2><button class="icon-btn" data-close-drawer aria-label="Close basket">' + I.close + "</button></div>" +
      '<div class="drawer-body" id="drawer-body"></div><div class="drawer-foot" id="drawer-foot"></div></aside>';
    document.body.insertAdjacentHTML("beforeend", drawerHTML);
  }
  var drawer = $(".drawer"), scrim = $(".scrim");
  function openDrawer() { if (!drawer) return; drawer.classList.add("is-open"); scrim.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; setTimeout(function () { var c = $("[data-close-drawer].icon-btn"); c && c.focus(); }, 300); }
  function closeDrawer() { if (!drawer) return; drawer.classList.remove("is-open"); scrim.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-open-basket]")) { e.preventDefault(); openDrawer(); }
    if (e.target.closest("[data-close-drawer]")) closeDrawer();
    var qa = e.target.closest("[data-quick-add]");
    if (qa) { e.preventDefault(); var p = byId(qa.getAttribute("data-quick-add")); Basket.add(p.id, p.cuts[0] || "", 1, ""); }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeDrawer(); closeMenu(); } });

  function nextDropDates(n, days) {
    days = days || CFG.delivery.dropDays;
    var skip = CFG.delivery.skipDates || [];
    var ymd = function (x) { return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); };
    var out = [], d = new Date(); d.setHours(12, 0, 0, 0);
    for (var i = 1; out.length < n && i < 120; i++) {
      var x = new Date(d); x.setDate(d.getDate() + i);
      if (days.indexOf(x.getDay()) > -1 && skip.indexOf(ymd(x)) === -1) out.push(x);
    }
    return out;
  }
  /* Delivery slot options: regular days, plus "subject to availability" days, in date order */
  function slotOptions() {
    var reg = nextDropDates(3).map(function (d) { return { d: d, label: fmtDay(d) }; });
    var extra = (CFG.delivery.extraDays || []).length ? nextDropDates(2, CFG.delivery.extraDays).map(function (d) { return { d: d, label: fmtDay(d) + " (if available)" }; }) : [];
    return reg.concat(extra).sort(function (a, b) { return a.d - b.d; }).map(function (o) { return "<option>" + o.label + "</option>"; }).join("");
  }
  var fmtDay = function (d) { return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" }); };

  function renderBasket() {
    var n = Basket.count();
    $$(".cart-count").forEach(function (c) { c.textContent = n; c.classList.toggle("has-items", n > 0); });
    var body = $("#drawer-body"), foot = $("#drawer-foot");
    if (!body) return;
    if (!n) {
      body.innerHTML = '<div class="drawer-empty">' + FISH + '<p><b style="color:var(--ink);font-family:var(--f-display);font-size:1.3rem">Your basket is empty</b><br>Add today\'s catch and we\'ll take it from there.</p><a class="btn btn--primary" href="shop.html">Browse the catch</a></div>';
      foot.innerHTML = ""; foot.style.display = "none"; return;
    }
    foot.style.display = "";
    body.innerHTML = Basket.items.map(function (i) {
      var p = byId(i.id);
      return '<div class="line-item">' + media(p, "thumb") +
        "<div><h4>" + esc(p.name) + '</h4><div class="meta">' + (i.cut ? esc(i.cut) + " · " : "") + money(priceOf(p, i.cut)) + "/" + esc(p.unit) + (i.note ? "<br>“" + esc(i.note) + "”" : "") + "</div>" +
        '<div class="qty"><button data-k="' + esc(i.key) + '" data-d="-1" aria-label="Decrease">−</button><output>' + fmtQty(i.qty, p) + '</output><button data-k="' + esc(i.key) + '" data-d="1" aria-label="Increase">+</button></div></div>' +
        '<div class="right"><b>' + money(lineTotal(p, i.cut, i.qty)) + '</b><button class="remove" data-rm="' + esc(i.key) + '">Remove</button></div></div>';
    }).join("");

    var sub = Basket.subtotal(), free = CFG.delivery.freeOver, left = Math.max(0, free - sub);
    var delivery = left > 0 ? CFG.delivery.fee : 0;
    var barHTML = '<div class="free-bar">' + (left > 0 ? "Add <b>" + money(left) + "</b> more for free delivery" : "<b>You've unlocked free delivery</b> ✦") + '<div class="bar"><i style="width:' + Math.min(100, (sub / free) * 100) + '%"></i></div></div>';

    if (MODE === "whatsapp") {
      foot.innerHTML =
        '<div class="totals"><div><span>Estimated subtotal</span><b>' + money(sub) + "</b></div><div><span>Delivery</span><span>" + (left > 0 ? "Confirmed on WhatsApp" : "Free") + "</span></div></div>" +
        barHTML.replace('class="free-bar"', 'class="free-bar" style="margin-top:0;margin-bottom:16px"') +
        '<form class="checkout-form" id="wa-form"><input class="input" name="name" placeholder="Your name" autocomplete="name" required>' +
        '<input class="input" name="postcode" placeholder="Delivery postcode" autocomplete="postal-code" required>' +
        '<select class="select" name="slot" aria-label="Preferred delivery">' + slotOptions() + "<option>Next available slot</option></select></form>" +
        '<button class="btn btn--wa btn--block" form="wa-form" type="submit">' + I.wa + " Send order on WhatsApp</button>" +
        '<p class="small-print">No payment now — we\'ll confirm weights, total and delivery time on WhatsApp.</p>' +
        '<button type="button" class="link-btn" id="alt-toggle" aria-expanded="false">No WhatsApp? Send your order by email instead</button>' +
        '<form class="checkout-form alt-form" id="alt-form" hidden>' +
        '<input class="input" type="tel" name="phone" placeholder="Phone number" autocomplete="tel" required>' +
        '<input class="input" type="email" name="email" placeholder="Email address" autocomplete="email" required>' +
        '<button class="btn btn--primary btn--block" type="submit">Send order</button>' +
        '<p class="small-print" style="margin:0">We\'ll call or email you to confirm weights, total and delivery time.</p></form>';

      var waForm = $("#wa-form");
      var buildOrder = function () {
        var lines = Basket.items.map(function (i) { var p = byId(i.id); return "• " + p.name + (i.cut ? " — " + i.cut : "") + " × " + fmtQty(i.qty, p) + " (" + money(lineTotal(p, i.cut, i.qty)) + ")" + (i.note ? "\n   Note: " + i.note : ""); });
        return { lines: lines.join("\n"), name: waForm.name.value.trim(), postcode: waForm.postcode.value.trim().toUpperCase(), slot: waForm.slot.value };
      };
      waForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var o = buildOrder();
        var msg = "Hello Sri Seafood! New order:\n\n" + o.lines +
          "\n\nEstimated subtotal: " + money(sub) +
          "\nName: " + o.name + "\nPostcode: " + o.postcode + "\nPreferred delivery: " + o.slot +
          "\n\nPlease confirm the final weight, total and delivery time. Thank you!";
        window.open(waLink(msg), "_blank", "noopener");
      });

      /* Backup for customers without WhatsApp: sends the order through Netlify Forms ("order") */
      $("#alt-toggle").addEventListener("click", function (e) {
        var f = $("#alt-form"); f.hidden = !f.hidden; e.currentTarget.setAttribute("aria-expanded", !f.hidden);
        if (!f.hidden) f.phone.focus();
      });
      $("#alt-form").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!waForm.reportValidity()) return;
        var f = e.target, btn = $("button[type=submit]", f), o = buildOrder();
        btn.disabled = true; btn.textContent = "Sending…";
        var data = new URLSearchParams({
          "form-name": "order", name: o.name, postcode: o.postcode, phone: f.phone.value.trim(), email: f.email.value.trim(),
          delivery: o.slot, order: o.lines, subtotal: money(sub)
        });
        fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data.toString() })
          .then(function (r) { if (!r.ok) throw new Error(r.status); })
          .then(function () {
            Basket.items = []; Basket.save();
            $("#drawer-body").innerHTML = '<div class="drawer-empty"><p><b style="color:var(--ink);font-family:var(--f-display);font-size:1.4rem">Thank you — order received</b><br>We\'ll be in touch shortly to confirm weights, total and your delivery slot.</p><a class="btn btn--primary" href="shop.html">Back to the shop</a></div>';
          })
          .catch(function () {
            btn.disabled = false; btn.textContent = "Send order";
            toast("Sorry, that didn't send. Please call us on " + B.phone + ".");
          });
      });
    } else {
      foot.innerHTML =
        '<div class="totals"><div><span>Subtotal</span><b>' + money(sub) + "</b></div><div><span>Delivery</span><span>" + (delivery ? money(delivery) : "Free") + '</span></div><div class="grand"><span>Total</span><span>' + money(sub + delivery) + "</span></div></div>" +
        barHTML.replace('class="free-bar"', 'class="free-bar" style="margin-top:0;margin-bottom:16px"') +
        '<button class="btn btn--primary btn--block" id="checkout-btn">' + I.lock + " Checkout securely</button>" +
        '<p class="small-print">Secure card payment by Stripe. Fresh fish is weighed on packing — we\'ll contact you about any difference.</p>';
      $("#checkout-btn").addEventListener("click", function (e) {
        var btn = e.currentTarget; btn.disabled = true; btn.textContent = "Taking you to secure checkout…";
        fetch("/.netlify/functions/checkout", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: Basket.items.map(function (i) { return { id: i.id, cut: i.cut, qty: i.qty, note: i.note }; }) })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (d.url) location.href = d.url; else throw new Error(d.error || "Checkout unavailable");
        }).catch(function (err) {
          btn.disabled = false; btn.innerHTML = I.lock + " Checkout securely";
          toast("Online payment isn't available right now — please order on WhatsApp.", "WhatsApp", function () { window.open(waLink("Hello Sri Seafood! I'd like to place an order."), "_blank"); });
          console.error(err);
        });
      });
    }
  }
  document.addEventListener("click", function (e) {
    var d = e.target.closest("[data-d]");
    if (d) { var k = d.getAttribute("data-k"); var it = Basket.items.filter(function (i) { return i.key === k; })[0]; if (it) { var st = stepOf(byId(it.id)), nq = +(it.qty + st * d.getAttribute("data-d")).toFixed(1); Basket.set(k, nq < st ? 0 : Math.min(20, nq)); } }
    var rm = e.target.closest("[data-rm]");
    if (rm) Basket.set(rm.getAttribute("data-rm"), 0);
  });
  renderBasket();

  /* Clear basket after successful Stripe payment */
  if (document.body.hasAttribute("data-clear-basket")) { Basket.items = []; Basket.save(); }

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  function toast(msg, actionLabel, action) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.innerHTML = "<span>" + esc(msg) + "</span>" + (actionLabel ? "<button>" + esc(actionLabel) + "</button>" : "");
    if (action) $("button", toastEl).onclick = function () { toastEl.classList.remove("is-show"); action(); };
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 3800);
  }

  /* ---------- Next drop ---------- */
  $$("[data-next-drop]").forEach(function (el) { el.textContent = fmtDay(nextDropDates(1)[0]); });

  /* ---------- Links from config ---------- */
  $$("[data-wa-community]").forEach(function (a) { a.href = B.whatsappCommunity; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-chat]").forEach(function (a) { a.href = waLink(a.getAttribute("data-wa-chat") || "Hello Sri Seafood!"); a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-games]").forEach(function (el) { if (B.gamesUrl) { el.hidden = false; var a = el.tagName === "A" ? el : $("a", el); if (a) { a.href = B.gamesUrl; a.target = "_blank"; a.rel = "noopener"; } } });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header & mobile menu ---------- */
  var header = $(".site-header");
  var onScroll = function () { header && header.classList.toggle("is-scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var menu = $(".mobile-nav");
  function closeMenu() { if (menu) { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; } }
  $$("[data-open-menu]").forEach(function (b) { b.addEventListener("click", function () { menu.classList.add("is-open"); menu.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }); });
  $$("[data-close-menu]").forEach(function (b) { b.addEventListener("click", closeMenu); });
  var here = location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a, .mobile-nav a").forEach(function (a) { if (a.getAttribute("href") === here || (here === "product.html" && a.getAttribute("href") === "shop.html")) a.setAttribute("aria-current", "page"); });

  /* ---------- Reveal on scroll ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function observeReveal(root) {
    $$(".reveal:not(.is-in)", root).forEach(function (el, i) {
      if (!io) { el.classList.add("is-in"); return; }
      el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el);
    });
  }
  observeReveal(document);
})();
