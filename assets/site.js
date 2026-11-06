/* Friends of FCAS site.
   All words and photos live in /content/*.json and are edited through Pages CMS.
   This script reads those files and builds each page, so editors never touch HTML. */

(function () {
  "use strict";

  var PAW = '<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="68" rx="22" ry="18"/><circle cx="23" cy="42" r="9"/><circle cx="39" cy="24" r="10"/><circle cx="61" cy="24" r="10"/><circle cx="77" cy="42" r="9"/></svg>';

  var ICONS = {
    heart: '<path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 4.5 7 4.5c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.8 0 6 3.8 4.5 7.3C19.5 16.4 12 21 12 21z"/>',
    hands: '<path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5V4a1.5 1.5 0 0 1 3 0v6m0-5a1.5 1.5 0 0 1 3 0v6m0-3.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-2.7L3.3 15a1.6 1.6 0 0 1 2.5-2L7 14.5"/>',
    gift: '<rect x="3" y="8" width="18" height="5" rx="1"/><path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 3.5 6.5 8 12 8zm0 0s1.5-5 4-4.5S17.5 8 12 8z"/>',
    home: '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5"/><path d="M12 17.5s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z"/>',
    paw: '<circle cx="7" cy="9" r="1.8"/><circle cx="10.5" cy="5.5" r="1.8"/><circle cx="14.5" cy="5.5" r="1.8"/><circle cx="18" cy="9" r="1.8"/><path d="M12 11c-3 0-6 4.5-6 7 0 1.7 1.3 2.5 3 2.5 1.3 0 2-.6 3-.6s1.7.6 3 .6c1.7 0 3-.8 3-2.5 0-2.5-3-7-6-7z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    megaphone: '<path d="M3 10v4h3l7 4V6L6 10H3zM17 9a4 4 0 0 1 0 6M6 14l1.5 5h2.5l-1.3-4.3"/>'
  };

  var NAV = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["animals.html", "Our Animals"],
    ["events.html", "Events"],
    ["help.html", "How to Help"],
    ["contact.html", "Contact"]
  ];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  // Rich text from the editor is HTML; plain text gets split into paragraphs.
  function rich(s) {
    s = String(s || "").trim();
    if (!s) return "";
    if (/<[a-z][\s\S]*>/i.test(s)) return s;
    return s.split(/\n\s*\n/).map(function (p) {
      return "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>";
    }).join("");
  }
  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.paw) + "</svg>";
  }
  function placeholder(variant) {
    return '<div class="ph ' + (variant || "") + '">' + PAW + "</div>";
  }
  function img(src, alt, variant) {
    if (!src) return placeholder(variant);
    return '<img src="' + esc(src) + '" alt="' + esc(alt || "") + '" loading="lazy">';
  }
  function isExternal(url) { return /^https?:\/\//i.test(url || ""); }
  function link(url, text, cls) {
    if (!url) return "";
    var ext = isExternal(url) ? ' target="_blank" rel="noopener"' : "";
    return '<a class="' + (cls || "") + '" href="' + esc(url) + '"' + ext + ">" + esc(text) + "</a>";
  }
  function load(name) {
    return fetch("content/" + name + ".json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }
  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function donateUrl(S) { return S.donate_link || "help.html"; }
  function volunteerUrl(S) { return S.volunteer_link || "help.html"; }
  function $(id) { return document.getElementById(id); }
  function set(id, html) { var el = $(id); if (el) el.innerHTML = html; }

  /* ---------- shared chrome ---------- */
  function renderHeader(S) {
    var page = document.body.getAttribute("data-page");
    var a = S.announcement || {};
    var html = "";
    if (a.show && a.text) {
      html += '<div class="announce">' + esc(a.text) + (a.link ? link(a.link, (a.link_text || "Learn more") + " →") : "") + "</div>";
    }
    var brand = S.logo
      ? '<img src="' + esc(S.logo) + '" alt="' + esc(S.org_name) + '">'
      : '<span class="brand-mark">' + PAW + '</span><span class="brand-text">' + esc(S.org_name) + "</span>";
    html += '<header class="site-header"><div class="wrap header-inner">' +
      '<a class="brand" href="index.html">' + brand + "</a>" +
      '<button class="menu-toggle" aria-label="Open menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
      '<nav class="nav" aria-label="Main">' +
      NAV.map(function (n) {
        var key = n[0].replace(".html", "");
        return '<a href="' + n[0] + '"' + (key === page ? ' class="active" aria-current="page"' : "") + ">" + n[1] + "</a>";
      }).join("") +
      link(donateUrl(S), "Donate", "btn btn-primary") +
      "</nav></div></header>";
    set("site-header", html);

    var t = document.querySelector(".menu-toggle"), nav = document.querySelector(".nav");
    if (t) t.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      t.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function socials(S) {
    var out = [];
    if (S.facebook) out.push(link(S.facebook, "Facebook"));
    if (S.instagram) out.push(link(S.instagram, "Instagram"));
    if (S.tiktok) out.push(link(S.tiktok, "TikTok"));
    return out.length ? '<div class="socials">' + out.join("") + "</div>" : "";
  }

  function renderFooter(S) {
    var contact = [];
    if (S.email) contact.push('<a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a>");
    if (S.phone) contact.push(esc(S.phone));
    if (S.mailing_address) contact.push(esc(S.mailing_address).replace(/\n/g, "<br>"));
    var html = '<footer class="site-footer"><div class="wrap">' +
      '<div class="footer-grid">' +
      "<div><h3>" + esc(S.org_name) + "</h3><p>" + esc(S.nonprofit_note) + "</p>" +
      (S.ein ? "<p>EIN: " + esc(S.ein) + "</p>" : "") + socials(S) + "</div>" +
      '<div><h3>Explore</h3><ul class="footer-links">' +
      NAV.map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") +
      "</ul></div>" +
      "<div><h3>Contact</h3>" + (contact.length ? "<p>" + contact.join("<br>") + "</p>" : '<p><a href="contact.html">Get in touch</a></p>') +
      '<p><a href="' + esc(donateUrl(S)) + '"' + (isExternal(donateUrl(S)) ? ' target="_blank" rel="noopener"' : "") + ">Donate →</a></p></div>" +
      "</div>" +
      '<div class="footer-bottom">© ' + new Date().getFullYear() + " " + esc(S.org_name) + ". All rights reserved.</div>" +
      "</div></footer>";
    set("site-footer", html);
  }

  /* ---------- building blocks ---------- */
  function helpCard(w) {
    return '<div class="card"><div class="icon-badge">' + icon(w.icon) + "</div>" +
      "<h3>" + esc(w.title) + "</h3><p>" + esc(w.text) + "</p>" +
      (w.button_link ? link(w.button_link, (w.button_text || "Learn more") + " →", "more") : '<a class="more" href="help.html">Learn more →</a>') +
      "</div>";
  }

  function animalCard(a, i) {
    var st = (a.status || "").toLowerCase();
    var cls = st.indexOf("adopt") === 0 ? "adopted" : st.indexOf("pend") === 0 ? "pending" : "";
    var meta = [a.type, a.age, a.sex].filter(Boolean).map(esc).join(" · ");
    var variants = ["", "alt", "warm"];
    return '<article class="card animal">' +
      '<div class="animal-photo">' + img(a.photo, a.name, variants[i % 3]) +
      (a.status ? '<span class="badge ' + cls + '">' + esc(a.status) + "</span>" : "") + "</div>" +
      '<div class="animal-body"><h3>' + esc(a.name) + "</h3>" +
      (meta ? '<div class="animal-meta">' + meta + "</div>" : "") +
      "<p>" + esc(a.story) + "</p>" +
      (a.link ? link(a.link, "Meet " + (a.name || "me") + " →", "more") : "") +
      "</div></article>";
  }

  function eventItem(e, past) {
    var d = parseDate(e.date);
    var chip = d
      ? '<div class="date-chip"><div class="m">' + d.toLocaleString("en-US", { month: "short" }) + '</div><div class="d">' + d.getDate() + "</div></div>"
      : '<div class="date-chip"><div class="d">★</div></div>';
    var when = [d ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "", e.time].filter(Boolean).join(" · ");
    return '<article class="card event' + (past ? " past" : "") + '">' + chip + "<div>" +
      "<h3>" + esc(e.title) + "</h3>" +
      '<div class="event-meta">' + esc(when) + (e.location ? "<br>" + esc(e.location) : "") + "</div>" +
      (e.image ? '<img src="' + esc(e.image) + '" alt="' + esc(e.title) + '" loading="lazy">' : "") +
      "<p>" + esc(e.description) + "</p>" +
      (e.link ? link(e.link, "Details →", "more") : "") +
      "</div></article>";
  }

  function splitEvents(list) {
    var t = today(), up = [], past = [];
    (list || []).forEach(function (e) {
      var d = parseDate(e.date);
      (d && d < t ? past : up).push(e);
    });
    up.sort(function (a, b) { return (parseDate(a.date) || 0) - (parseDate(b.date) || 0); });
    past.sort(function (a, b) { return parseDate(b.date) - parseDate(a.date); });
    return { up: up, past: past };
  }

  /* ---------- pages ---------- */
  var PAGES = {
    index: function (S) {
      return Promise.all([load("home"), load("help"), load("animals"), load("events")]).then(function (r) {
        var H = r[0], help = r[1], A = r[2], E = r[3];
        set("hero-title", esc(H.hero_title));
        set("hero-text", esc(H.hero_text));
        set("hero-buttons",
          link(volunteerUrl(S), "Volunteer with us", "btn btn-primary") +
          link(donateUrl(S), "Donate", "btn btn-outline"));
        set("hero-media", img(H.hero_image, H.hero_title));
        set("intro-title", esc(H.intro_title));
        set("intro-text", rich(H.intro_text));
        set("intro-media", img(H.intro_image, H.intro_title, "warm"));
        set("belief-quote", "“" + esc(H.belief_quote) + "”");
        set("help-cards", (help.ways || []).slice(0, 4).map(helpCard).join(""));

        var animals = (A.animals || []).filter(function (a) { return a.featured; });
        if (!animals.length) animals = A.animals || [];
        set("animal-cards", animals.slice(0, 3).map(animalCard).join("") || '<p class="empty">Check back soon to meet our animals.</p>');

        var ev = splitEvents(E.events).up.slice(0, 2);
        if (ev.length) set("event-list", ev.map(function (e) { return eventItem(e); }).join(""));
        else { var s = $("events-section"); if (s) s.style.display = "none"; }

        set("closing-text", esc(H.closing_text));
        set("closing-buttons",
          link(donateUrl(S), "Donate today", "btn btn-primary") +
          link(volunteerUrl(S), "Volunteer", "btn btn-outline"));
      });
    },

    about: function () {
      return load("about").then(function (A) {
        set("page-title", esc(A.title));
        set("page-lead", esc(A.lead));
        set("about-body", rich(A.body));
        set("about-media", img(A.image, A.title));
        set("program-list", (A.programs || []).map(function (p) {
          return '<div class="program"><h3>' + esc(p.title) + "</h3><p>" + esc(p.text) + "</p></div>";
        }).join(""));
        var team = A.team || [];
        if (team.length) {
          set("team-list", team.map(function (p, i) {
            return '<div class="person"><div class="avatar">' + img(p.photo, p.name, i % 2 ? "alt" : "") + "</div>" +
              "<h3>" + esc(p.name) + '</h3><div class="role">' + esc(p.role) + "</div>" +
              (p.bio ? "<p>" + esc(p.bio) + "</p>" : "") + "</div>";
          }).join(""));
        } else { var s = $("team-section"); if (s) s.style.display = "none"; }
      });
    },

    animals: function (S) {
      return load("animals").then(function (A) {
        set("page-title", esc(A.title));
        set("page-lead", esc(A.intro));
        set("animal-cards", (A.animals || []).map(animalCard).join("") || '<p class="empty">Check back soon to meet our animals.</p>');
        set("shelter-link", S.shelter_adoptables_link
          ? link(S.shelter_adoptables_link, "See every adoptable animal at FCAS →", "btn btn-primary")
          : "");
      });
    },

    events: function () {
      return load("events").then(function (E) {
        set("page-title", esc(E.title));
        set("page-lead", esc(E.intro));
        var ev = splitEvents(E.events);
        set("event-list", ev.up.map(function (e) { return eventItem(e); }).join("") || '<p class="empty">No upcoming events right now. Check back soon!</p>');
        if (ev.past.length) set("past-list", ev.past.map(function (e) { return eventItem(e, true); }).join(""));
        else { var s = $("past-section"); if (s) s.style.display = "none"; }
      });
    },

    help: function (S) {
      return load("help").then(function (H) {
        set("page-title", esc(H.title));
        set("page-lead", esc(H.intro));
        var variants = ["", "warm", "alt"];
        set("help-rows", (H.ways || []).map(function (w, i) {
          var url = w.button_link || (/donat/i.test(w.title) ? S.donate_link : /volunt/i.test(w.title) ? S.volunteer_link : "") || "contact.html";
          return '<div class="help-row"><div class="help-media">' + img(w.image, w.title, variants[i % 3]) + "</div>" +
            '<div><div class="icon-badge">' + icon(w.icon) + "</div><h2>" + esc(w.title) + "</h2>" +
            '<p class="lead">' + esc(w.text) + '</p><div class="btn-row">' +
            link(url, w.button_text || "Learn more", "btn btn-primary") + "</div></div></div>";
        }).join(""));
      });
    },

    contact: function (S) {
      return load("contact").then(function (C) {
        set("page-title", esc(C.title));
        set("page-lead", esc(C.intro));
        var items = [];
        if (S.email) items.push('<li><strong>Email</strong><a href="mailto:' + esc(S.email) + '">' + esc(S.email) + "</a></li>");
        if (S.phone) items.push("<li><strong>Phone</strong>" + esc(S.phone) + "</li>");
        if (S.mailing_address) items.push("<li><strong>Mailing address</strong>" + esc(S.mailing_address).replace(/\n/g, "<br>") + "</li>");
        if (socials(S)) items.push("<li><strong>Follow us</strong>" + socials(S) + "</li>");
        if (S.volunteer_link) items.push("<li><strong>Volunteer</strong>" + link(S.volunteer_link, "Fill out our volunteer form →") + "</li>");
        set("contact-list", items.join("") || '<li class="empty">Contact details coming soon.</li>');
      });
    }
  };

  /* ---------- boot ---------- */
  load("settings").then(function (S) {
    S.org_name = S.org_name || "Friends of FCAS";
    renderHeader(S);
    renderFooter(S);
    var page = document.body.getAttribute("data-page");
    return PAGES[page] ? PAGES[page](S) : null;
  }).then(function () {
    document.body.classList.add("ready");
  });
})();
