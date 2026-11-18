(() => {
  const $ = (s, r = document) => r.querySelector(s),
    $$ = (s, r = document) => [...r.querySelectorAll(s)],
    L = (k) => {
      try {
        return JSON.parse(localStorage[k] || "null");
      } catch (e) {
        return null;
      }
    },
    W = (k, v) => {
      try {
        localStorage[k] = JSON.stringify(v);
      } catch (e) {}
    };
  const root = document.documentElement,
    tb = $("#theme");
  const sync = () => (tb.textContent = root.dataset.t === "dark" ? "Light mode" : "Dark mode");
  sync();
  tb.onclick = () => {
    root.dataset.t = root.dataset.t === "dark" ? "" : "dark";
    try {
      localStorage.lf_theme = root.dataset.t || "light";
    } catch (e) {}
    sync();
  };
  const me = L("lf_session");
  if (me) {
    const pr = (L("lf_profiles") || {})[me.name] || {};
    $("#auth").innerHTML =
      `<a href="profile.html" class="me">${pr.avatar ? `<img src="${pr.avatar}" alt="" width="28" height="28">` : ""}${me.name}</a><a href="#" id="out">Sign out</a>`;
    $("#out").onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem("lf_session");
      location.reload();
    };
  }
  $$(".hs,.big").forEach((f) => {
    f.onsubmit = (e) => {
      e.preventDefault();
      location.href = "search.html?q=" + encodeURIComponent($("input", f).value.trim());
    };
  });
  const hx = async (s) =>
    [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  const pg = document.body.dataset.page,
    em = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  if (pg === "cat") {
    if (innerWidth < 860) $(".flt").open = false;
    const g = $("#grid"),
      cards = $$(".gig", g),
      fv = L("lf_fav") || [];
    cards.forEach((c) => {
      const b = $(".fav", c),
        k = c.dataset.id;
      if (fv.includes(k)) {
        b.setAttribute("aria-pressed", "true");
        b.textContent = "Saved";
      }
      b.onclick = () => {
        const a = L("lf_fav") || [],
          on = b.getAttribute("aria-pressed") !== "true";
        W("lf_fav", on ? [...a, k] : a.filter((x) => x !== k));
        b.setAttribute("aria-pressed", on);
        b.textContent = on ? "Saved" : "Save";
      };
    });
    const run = () => {
      const mn = +$("#pmin").value || 0,
        mx = +$("#pmax").value || 1e9,
        lv = $$(".lv:checked").map((x) => x.value),
        sy = $$(".sty:checked").map((x) => x.value.split(/[^a-z0-9]+/).filter((w) => w.length > 2)),
        s = $("#sort").value;
      let n = 0;
      cards.forEach((c) => {
        const p = +c.dataset.p,
          ok =
            p >= mn &&
            p <= mx &&
            (!lv.length || lv.includes(c.dataset.lv)) &&
            (!sy.length || sy.some((ws) => ws.some((w) => c.dataset.k.includes(w))));
        c.hidden = !ok;
        n += ok;
      });
      [...cards]
        .sort((a, b) =>
          s === "r"
            ? b.dataset.r - a.dataset.r
            : s === "a"
              ? a.dataset.p - b.dataset.p
              : s === "d"
                ? b.dataset.p - a.dataset.p
                : 0,
        )
        .forEach((c) => g.append(c));
      $("#cnt").textContent = n + (n === 1 ? " service" : " services");
      $("#none").hidden = n > 0;
    };
    $$("#pmin,#pmax,.lv,.sty,#sort").forEach((e) => (e.oninput = run));
  }
  if (pg === "help") {
    $$(".tp").forEach(
      (b) =>
        (b.onclick = () => {
          $("#hq").value = b.dataset.q;
          $("#hq").dispatchEvent(new Event("input"));
          $("#faqs").scrollIntoView();
        }),
    );
    $("#hq").oninput = (e) => {
      const q = e.target.value.toLowerCase();
      let n = 0;
      $$("#faqs details").forEach((d) => {
        const ok = d.textContent.toLowerCase().includes(q);
        d.hidden = !ok;
        n += ok;
      });
      $("#hnone").hidden = n > 0;
    };
  }
  $$("[data-n]").forEach((el) => {
    const t = +el.dataset.n;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    let i = 0;
    const f = () => {
      i += t / 40;
      el.textContent = Math.min(t, Math.round(i)).toLocaleString();
      if (i < t) requestAnimationFrame(f);
    };
    new IntersectionObserver((e, o) => {
      if (e[0].isIntersecting) {
        f();
        o.disconnect();
      }
    }).observe(el);
  });
  if (pg === "contact")
    $("#cf").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target,
        v = (n) => f[n].value.trim(),
        r = $("#ce");
      if (!v("n")) return (r.textContent = "Enter your name.");
      if (!em(v("e"))) return (r.textContent = "Enter a valid email address.");
      if (!v("s")) return (r.textContent = "Select a topic.");
      if (v("m").length < 10) return (r.textContent = "Write a message of at least 10 characters.");
      r.textContent = "";
      location.href = `mailto:jatins0420@gmail.com?subject=${encodeURIComponent(v("s") + " - " + v("n"))}&body=${encodeURIComponent(v("m") + "\n\nFrom: " + v("n") + " <" + v("e") + ">")}`;
    };
  if (pg === "register") {
    let role = location.hash === "#client" ? "client" : "freelancer";
    const set = (r) => {
      role = r;
      $("#tf").classList.toggle("on", r === "freelancer");
      $("#tc").classList.toggle("on", r === "client");
      $("#x").firstChild.textContent = r === "client" ? "Company (optional)" : "Skills";
      $("#rb").textContent = "Create " + r + " account";
    };
    set(role);
    $("#tf").onclick = () => set("freelancer");
    $("#tc").onclick = () => set("client");
    $("#rf").onsubmit = async (e) => {
      e.preventDefault();
      const n = $("#rn").value.trim(),
        m = $("#re").value.trim().toLowerCase(),
        p = $("#rp").value,
        x = $("#rx").value.trim(),
        r = $("#re2");
      if (!/^[a-zA-Z\s]{2,50}$/.test(n))
        return (r.textContent = "Name must be 2–50 letters and spaces.");
      if (!em(m)) return (r.textContent = "Enter a valid email address.");
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(p))
        return (r.textContent =
          "Password needs 8+ characters with upper and lower case, a number and a symbol.");
      if (role === "freelancer" && x.length < 3)
        return (r.textContent = "List at least one skill.");
      const u = L("lf_users") || {};
      if (u[m])
        return (r.textContent = "An account with this email already exists. Sign in instead.");
      u[m] = { name: n, role, extra: x, h: await hx(p) };
      W("lf_users", u);
      W("lf_session", { name: n, email: m, role });
      location.href = "index.html";
    };
  }
  if (pg === "login")
    $("#lf").onsubmit = async (e) => {
      e.preventDefault();
      const m = $("#le").value.trim().toLowerCase(),
        r = $("#le2"),
        u = (L("lf_users") || {})[m];
      if (!em(m)) return (r.textContent = "Enter a valid email address.");
      if (!u || u.h !== (await hx($("#lp").value)))
        return (r.textContent = "Email or password is incorrect.");
      W("lf_session", { name: u.name, email: m, role: u.role });
      location.href = "index.html";
    };
})();

(() => {
  const h = document.querySelector("header"),
    b = h.querySelector(".mb");
  b.onclick = () => {
    const o = h.classList.toggle("open");
    b.setAttribute("aria-expanded", o);
  };
  const p = location.pathname.split("/").pop() || "index.html";
  h.querySelectorAll(".cats a").forEach((a) => {
    if (a.getAttribute("href") === p) a.classList.add("on");
  });
})();
