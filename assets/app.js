(function () {
  "use strict";

  var M = window.MENU;
  var app = document.getElementById("app");
  var track = document.getElementById("navTrack");
  var input = document.getElementById("q");
  var emptyEl = document.getElementById("empty");
  var foot = document.getElementById("foot");

  if (!M || !Array.isArray(M.categories)) {
    app.textContent = "فایل منو (menu-data.js) پیدا نشد.";
    return;
  }
  var C = M.config || {};

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== "") e.textContent = text;
    return e;
  }
  function digitsToLatin(s) {
    return String(s == null ? "" : s)
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x06F0; })
      .replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x0660; });
  }
  function norm(s) {
    return digitsToLatin(s)
      .replace(/ي/g, "ی")   // ي -> ی
      .replace(/ك/g, "ک")   // ك -> ک
      .replace(/[‌‍ً-ٟـ]/g, "")
      .toLowerCase().trim();
  }
  function toPrice(v) {
    if (v == null || v === "") return null;
    var n = parseFloat(digitsToLatin(v).replace(/[,٬،\s]/g, ""));
    return isFinite(n) && n > 0 ? n : null;
  }
  function fmt(n) { return n.toLocaleString("fa-IR"); }

  /* inline icons: constants only, never user data */
  var ICONS = {
    cup:  '<path d="M5 11h11v3.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V11z"/><path d="M16 12h1.5a2.5 2.5 0 0 1 0 5H15.6"/><path d="M8.5 3.5c0 1.6 1.6 1.6 1.6 3.2M12.2 3.5c0 1.6 1.6 1.6 1.6 3.2"/>',
    tea:  '<path d="M4 10h13v3.5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V10z"/><path d="M17 11.5h1.4a2.4 2.4 0 0 1 0 4.8H16.6"/><path d="M10.5 3v3.5M10.5 6.5 8.4 8.6M10.5 6.5l2.1 2.1"/>',
    ice:  '<path d="M6.5 4h11l-1.4 15.2a1.5 1.5 0 0 1-1.5 1.3H9.4a1.5 1.5 0 0 1-1.5-1.3L6.5 4z"/><path d="M8 9.5h8"/><path d="M9.6 14l2.2-1.2 2.2 1.2v2.3L11.8 17.5 9.6 16.3z"/><path d="M14.5 2.5 16 4"/>',
    gem:  '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M12 20 9 9l3-5 3 5z"/>'
  };
  function icon(name) {
    var s = el("span", "ico");
    s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.gem) + "</svg>";
    return s;
  }
  function safeColor(c) { return /^#[0-9a-fA-F]{3,8}$/.test(String(c || "")) ? c : "#e9b949"; }

  /* ---------- header from config ---------- */
  function setText(id, v) { var n = document.getElementById(id); if (n && v) n.textContent = v; }
  setText("welcome", C.welcome);
  setText("brand", C.name);
  setText("latin", C.latinName);
  setText("tagline", C.tagline);
  if (C.name) document.title = "منوی " + C.name;

  /* ---------- nav chips ---------- */
  var chips = {};
  M.categories.forEach(function (cat, i) {
    var id = "cat-" + (cat.id || i);
    var a = el("a", "chip");
    a.href = "#" + id;
    a.style.setProperty("--c", safeColor(cat.accent));
    a.appendChild(icon(cat.icon));
    a.appendChild(el("span", null, cat.short || cat.title));
    track.appendChild(a);
    chips[id] = a;
  });

  /* ---------- render ---------- */
  var sectionObserver, itemObserver;

  function render() {
    var q = norm(input.value);
    app.textContent = "";
    if (sectionObserver) sectionObserver.disconnect();
    if (itemObserver) itemObserver.disconnect();

    var shown = 0;
    M.categories.forEach(function (cat, i) {
      var id = "cat-" + (cat.id || i);
      var accent = safeColor(cat.accent);
      var items = (cat.items || []).filter(function (it) {
        if (!it || !it.name) return false;
        if (!q) return true;
        return norm(it.name + " " + (it.en || "") + " " + (it.note || "")).indexOf(q) > -1;
      });
      chips[id].hidden = items.length === 0;
      if (!items.length) return;
      shown += items.length;

      var sec = el("section", "cat");
      sec.id = id;
      sec.style.setProperty("--c", accent);

      var head = el("div", "cat-head");
      var ci = el("div", "cat-ico"); ci.appendChild(icon(cat.icon).firstChild);
      head.appendChild(ci);
      var ct = el("div", "cat-text");
      ct.appendChild(el("h2", "cat-title", cat.title));
      if (cat.subtitle) ct.appendChild(el("div", "cat-sub", cat.subtitle));
      head.appendChild(ct);
      head.appendChild(el("span", "cat-count", fmt(items.length) + " مورد"));
      sec.appendChild(head);

      var list = el("div", "list");
      items.forEach(function (it, idx) {
        var price = toPrice(it.price);
        var off = it.available === false;
        var row = el("div", "item" + (price ? " has-price" : "") + (off ? " off" : ""));
        row.style.setProperty("--d", (idx % 6) * 45 + "ms");
        row.appendChild(el("span", "dot"));

        var txt = el("div", "txt");
        txt.appendChild(el("div", "name", it.name));
        if (it.en) txt.appendChild(el("span", "en", it.en));
        if (it.note) txt.appendChild(el("span", "note", it.note));
        row.appendChild(txt);

        if (off) row.appendChild(el("span", "badge", "ناموجود"));
        if (price) {
          row.appendChild(el("span", "lead"));
          var p = el("span", "price", fmt(price));
          if (C.currency) p.appendChild(el("small", null, C.currency));
          row.appendChild(p);
        }
        list.appendChild(row);
      });
      sec.appendChild(list);
      app.appendChild(sec);
    });

    emptyEl.hidden = shown > 0;
    observe();
  }

  function observe() {
    var rows = app.querySelectorAll(".item");
    if (!("IntersectionObserver" in window)) {
      rows.forEach(function (r) { r.classList.add("in"); });
      return;
    }
    itemObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); itemObserver.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    rows.forEach(function (r) { itemObserver.observe(r); });

    sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        setActive(e.target.id);
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    app.querySelectorAll(".cat").forEach(function (s) { sectionObserver.observe(s); });
  }

  function setActive(id) {
    Object.keys(chips).forEach(function (k) { chips[k].classList.toggle("active", k === id); });
    var a = chips[id];
    if (a && track.scrollWidth > track.clientWidth) {
      var target = a.offsetLeft - (track.clientWidth - a.offsetWidth) / 2;
      track.scrollTo({ left: target, behavior: "smooth" });
    }
  }

  var timer;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  });

  /* ---------- footer ---------- */
  function buildFooter() {
    foot.textContent = "";
    if (C.note) foot.appendChild(el("p", "foot-note", C.note));

    var links = el("div", "foot-links");
    var svg = function (path) {
      var s = el("span");
      s.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + path + "</svg>";
      return s.firstChild;
    };
    var pill = function (tag, iconPath, text, href) {
      var n = el(tag);
      if (href) n.href = href;
      n.appendChild(svg(iconPath));
      var b = document.createElement("bdi"); b.textContent = text; n.appendChild(b);
      links.appendChild(n);
    };

    if (C.instagram) {
      var raw = String(C.instagram).trim();
      var m = raw.match(/instagram\.com\/([A-Za-z0-9._]+)/i);
      var handle = (m ? m[1] : raw.replace(/^@/, ""));
      if (/^[A-Za-z0-9._]+$/.test(handle)) {
        pill("a", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/>', "@" + handle, "https://instagram.com/" + handle);
        links.lastChild.target = "_blank"; links.lastChild.rel = "noopener";
      } else pill("span", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>', raw);
    }
    if (C.phone) {
      var tel = digitsToLatin(C.phone).replace(/[^\d+]/g, "");
      pill(tel ? "a" : "span", '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>', String(C.phone), tel ? "tel:" + tel : null);
    }
    if (C.hours) pill("span", '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', String(C.hours));
    if (C.address) pill("span", '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', String(C.address));

    if (links.childNodes.length) foot.appendChild(links);
    foot.appendChild(el("p", "foot-copy", "© " + (C.name || "")));
  }

  buildFooter();
  render();
  // highlight the first chip before the user scrolls
  var first = app.querySelector(".cat");
  if (first) setActive(first.id);
})();
