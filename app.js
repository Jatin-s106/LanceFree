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
  const D = window.LF,
    pg = document.body.dataset.page,
    me = L("lf_session"),
    E = (s) =>
      String(s ?? "").replace(
        /[&<>"]/g,
        (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
      ),
    em = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const all = () => [...D.gigs, ...(L("lf_mygigs") || [])],
    qs = new URLSearchParams(location.search);
  const card = (g, i = 0) =>
    `<article class="gig" data-id="${E(g.id)}"><div class="ph"><img src="${E(g.img || "gig-" + g.slug + "-0.jpg")}" alt="${E(g.t)}" width="400" height="250" loading="lazy">${g.badge ? `<span class="bd">${E(g.badge)}</span>` : ""}</div><div class="gb"><p class="mu"><a href="freelancer.html?u=${encodeURIComponent(g.who)}">${E(g.who)}</a> · ${E(g.lv)}</p><h3><a href="gig.html?id=${E(g.id)}">${E(g.t)}</a></h3><p>${E(g.d).slice(0, 140)}</p><div class="gf"><span>${g.r ? "★ " + g.r + " (" + g.n + ")" : "New"}</span><button class="fav" type="button" aria-pressed="false">Save</button><b>From $${g.p}</b></div></div></article>`;
  const favBtns = (r) =>
    $$(".gig", r).forEach((c) => {
      const b = $(".fav", c),
        k = c.dataset.id,
        set = (on) => {
          b.setAttribute("aria-pressed", on);
          b.textContent = on ? "Saved" : "Save";
        };
      set((L("lf_fav") || []).includes(k));
      b.onclick = () => {
        const a = L("lf_fav") || [],
          on = b.getAttribute("aria-pressed") !== "true";
        W("lf_fav", on ? [...a, k] : a.filter((x) => x !== k));
        set(on);
        if (pg === "saved" && !on) saved();
      };
    });
  // order dialog
  document.body.insertAdjacentHTML(
    "beforeend",
    '<dialog id="od"><form id="of" novalidate><h2>Place an order</h2><p id="os" class="mu"></p><label>Your name<input id="on"></label><label>Email address<input id="oe" type="email"></label><label>Project brief<textarea id="ob" rows="4"></textarea></label><p class="err" id="oer" role="alert"></p><div class="rowb"><button class="btn">Send order request</button><button class="btn o" type="button" id="oc">Cancel</button></div></form></dialog>',
  );
  const od = $("#od");
  let cur = "";
  const order = (t, pk, pr, dl) => {
    cur = `${t} - ${pk} package (${pr}, ${dl})`;
    $("#os").textContent = cur;
    $("#on").value = me ? me.name : "";
    $("#oe").value = me ? me.email : "";
    $("#oer").textContent = "";
    od.showModal();
  };
  $("#oc").onclick = () => od.close();
  $("#of").onsubmit = (e) => {
    e.preventDefault();
    const n = $("#on").value.trim(),
      m = $("#oe").value.trim(),
      b = $("#ob").value.trim(),
      r = $("#oer");
    if (!n) return (r.textContent = "Enter your name.");
    if (!em(m)) return (r.textContent = "Enter a valid email address.");
    if (b.length < 10) return (r.textContent = "Describe your project in at least 10 characters.");
    location.href = `mailto:jatins0420@gmail.com?subject=${encodeURIComponent("Order: " + cur)}&body=${encodeURIComponent(b + "\n\nFrom: " + n + " <" + m + ">")}`;
    od.close();
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".ord");
    if (b) order(b.dataset.t, b.dataset.pk, b.dataset.pr, b.dataset.dl);
  });
  // search
  if (pg === "search") {
    const q = $("#sq"),
      c = $("#sc");
    q.value = qs.get("q") || "";
    c.value = qs.get("c") || "";
    const run = () => {
      const w = q.value.toLowerCase().split(/\s+/).filter(Boolean);
      const r = all().filter(
        (g) =>
          (!c.value || g.slug === c.value) &&
          w.every((x) => (g.t + " " + g.d + " " + g.who + " " + g.cat).toLowerCase().includes(x)),
      );
      $("#sr").innerHTML = r.map(card).join("");
      $("#se").hidden = r.length > 0;
      $("#sn").textContent = r.length + (r.length === 1 ? " service found" : " services found");
      favBtns($("#sr"));
    };
    q.oninput = c.onchange = run;
    $("#sf").onsubmit = (e) => {
      e.preventDefault();
      run();
    };
    run();
  }
  // saved
  const saved = () => {
    const f = L("lf_fav") || [],
      a = all().filter((g) => f.includes(g.id));
    $("#sv").innerHTML = a.map(card).join("");
    $("#sve").hidden = a.length > 0;
    favBtns($("#sv"));
  };
  if (pg === "saved") {
    saved();
    const m = L("lf_mygigs") || [];
    $("#mg").innerHTML = m
      .map((g, i) =>
        card(g, i).replace(
          "</article>",
          `<div class="gb"><button class="fav del" data-id="${g.id}" type="button">Delete</button></div></article>`,
        ),
      )
      .join("");
    $("#mge").hidden = m.length > 0;
    favBtns($("#mg"));
    $$(".del").forEach(
      (b) =>
        (b.onclick = () => {
          W(
            "lf_mygigs",
            m.filter((g) => g.id !== b.dataset.id),
          );
          location.reload();
        }),
    );
    const d = L("lf_draft");
    if (d) {
      const p = $("#dr");
      p.hidden = false;
      p.innerHTML = `You have a draft gig: <a href="create-gig.html">${E(d.t || "Untitled")} (continue editing)</a>`;
    }
  }
  // gig detail
  if (pg === "gig") {
    const g = all().find((x) => x.id === qs.get("id")),
      el = $("#gd");
    if (!g)
      el.innerHTML =
        '<h1>Service not found</h1><p>It may have been removed. <a href="search.html">Search all services</a>.</p>';
    else {
      document.title = g.t + " | LanceFree";
      const pk = g.pk || D.pk[g.slug] || [],
        fq = g.faq || D.faq[g.slug] || [],
        more = all()
          .filter((x) => x.slug === g.slug && x.id !== g.id)
          .slice(0, 3);
      el.innerHTML = `<p class="crumb" style="padding:0 0 16px"><a href="index.html">LanceFree</a> / <a href="${g.slug}.html">${E(g.cat)}</a></p><div class="gd"><div><h1>${E(g.t)}</h1><p class="mu"><a href="freelancer.html?u=${encodeURIComponent(g.who)}">${E(g.who)}</a> · ${E(g.lv)} · ${g.r ? "★ " + g.r + " (" + g.n + " reviews)" : "New"}</p><img class="wide" style="margin:16px 0" src="${E(g.img || "gig-" + g.slug + "-0.jpg")}" alt="${E(g.t)}"><p>${E(g.long || g.d)}</p>${g.req ? `<h3>What the seller needs from you</h3><p>${E(g.req)}</p>` : ""}<button class="fav" id="gf" type="button" aria-pressed="false">Save</button>
<h2 style="margin-top:32px">Frequently asked questions</h2>${fq.map(([q, a]) => `<details name="f"><summary>${E(q)}</summary><p>${E(a)}</p></details>`).join("") || '<p class="mu">No questions yet.</p>'}
${more.length ? `<h2 style="margin-top:32px">More in ${E(g.cat)}</h2><div class="grid">${more.map(card).join("")}</div>` : ""}</div>
<div>${pk.map((p) => `<div class="pkg"><h3>${E(p.n)}</h3><p class="price">${E(p.pr)}</p><p class="mu">${E(p.dl)}</p><ul>${p.f.map((x) => `<li>${E(x)}</li>`).join("")}</ul><button class="btn ord" type="button" data-t="${E(g.t)}" data-pk="${E(p.n)}" data-pr="${E(p.pr)}" data-dl="${E(p.dl)}">Order ${E(p.n)}</button></div>`).join("")}</div></div>`;
      const b = $("#gf"),
        set = (on) => {
          b.setAttribute("aria-pressed", on);
          b.textContent = on ? "Saved" : "Save";
        };
      set((L("lf_fav") || []).includes(g.id));
      b.onclick = () => {
        const a = L("lf_fav") || [],
          on = b.getAttribute("aria-pressed") !== "true";
        W("lf_fav", on ? [...a, g.id] : a.filter((x) => x !== g.id));
        set(on);
      };
      favBtns($(".grid", el) || el);
    }
  }

  // profiles
  const PR = () => L("lf_profiles") || {},
    mono = (n) => {
      const i =
        n
          .replace(/[^a-zA-Z ]/g, " ")
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "?";
      return (
        "data:image/svg+xml," +
        encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#e6e9ec"/><text x="48" y="60" text-anchor="middle" font-size="34" font-family="Georgia,serif" fill="#2c4a6b">${i}</text></svg>`,
        )
      );
    };
  const shrink = (f, m) =>
    new Promise((r) => {
      const x = new FileReader();
      x.onload = () => {
        const im = new Image();
        im.onload = () => {
          const k = Math.min(1, m / Math.max(im.width, im.height)),
            c = document.createElement("canvas");
          c.width = im.width * k;
          c.height = im.height * k;
          c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          r(c.toDataURL("image/jpeg", 0.8));
        };
        im.src = x.result;
      };
      x.readAsDataURL(f);
    });
  if (pg === "fl") {
    const u = qs.get("u") || "",
      gs = all().filter((g) => g.who === u),
      el = $("#fp");
    if (!gs.length && !PR()[u])
      el.innerHTML =
        '<h1>Freelancer not found</h1><p><a href="search.html">Search all services</a>.</p>';
    else {
      const p = PR()[u] || {},
        g0 = gs[0] || {},
        rt = gs.filter((g) => g.r),
        avg = rt.length ? (rt.reduce((a, g) => a + +g.r, 0) / rt.length).toFixed(1) : "",
        cats = [...new Set(gs.map((g) => g.cat))],
        h = [...u].reduce((a, c) => a + c.charCodeAt(0), 0),
        pf =
          p.portfolio || [1, 2, 3, 4].filter((_, i) => i !== h % 4).map((n) => "work" + n + ".jpg");
      document.title = u + " | LanceFree";
      el.innerHTML = `<div class="avrow"><img class="av" src="${p.avatar || mono(u)}" alt="Profile photo of ${E(u)}" width="96" height="96"><div><h1 style="margin:0">${E(u)}</h1><p class="mu">${E(g0.lv || "Freelancer")}${avg ? " · ★ " + avg : ""} · ${gs.length} ${gs.length === 1 ? "gig" : "gigs"}</p>${me && me.name === u ? '<a href="profile.html">Edit profile</a>' : ""}</div></div>
<p style="max-width:62ch;margin-top:20px">${E(p.bio || "Freelancer on LanceFree offering " + (cats.join(", ").toLowerCase() || "services") + ".")}</p>${(p.skills || cats).length ? `<p class="mu">Skills: ${E((p.skills || cats).join(", "))}</p>` : ""}
<h2 style="margin-top:32px">Portfolio</h2><div class="grid">${pf.map((x) => `<img class="wide" src="${E(x)}" alt="Portfolio example by ${E(u)}" loading="lazy">`).join("")}</div>
<h2 style="margin-top:32px">Gigs</h2><div class="grid" id="fg">${gs.map(card).join("") || '<p class="mu">No gigs yet.</p>'}</div>`;
      favBtns($("#fg"));
    }
  }
  if (pg === "profile") {
    if (!me) {
      $("#pgate").hidden = false;
      $("#pw").hidden = true;
    } else {
      let p = PR()[me.name] || {};
      const pv = () => {
        $("#pav").src = p.avatar || mono(me.name);
        $("#pgl").innerHTML = (p.portfolio || [])
          .map(
            (x, i) =>
              `<span><img src="${x}" alt="Portfolio image ${i + 1}"><button type="button" data-i="${i}" aria-label="Remove image ${i + 1}">×</button></span>`,
          )
          .join("");
        $$("#pgl button").forEach(
          (b) =>
            (b.onclick = () => {
              p.portfolio.splice(+b.dataset.i, 1);
              pv();
            }),
        );
      };
      $("#pbio").value = p.bio || "";
      $("#psk").value = (p.skills || []).join(", ");
      $("#pub").href = "freelancer.html?u=" + encodeURIComponent(me.name);
      pv();
      $("#pph").onchange = async (e) => {
        if (e.target.files[0]) {
          p.avatar = await shrink(e.target.files[0], 256);
          pv();
        }
      };
      $("#ppf").onchange = async (e) => {
        p.portfolio = p.portfolio || [];
        for (const f of [...e.target.files]) {
          if (p.portfolio.length < 6) p.portfolio.push(await shrink(f, 640));
        }
        pv();
      };
      $("#pf").onsubmit = (e) => {
        e.preventDefault();
        p.bio = $("#pbio").value.trim();
        p.skills = $("#psk")
          .value.split(",")
          .map((x) => x.trim())
          .filter(Boolean);
        const all = PR();
        all[me.name] = p;
        try {
          localStorage.lf_profiles = JSON.stringify(all);
        } catch (x) {
          return ($("#pe").textContent =
            "Storage is full. Remove some portfolio images and try again.");
        }
        location.href = "freelancer.html?u=" + encodeURIComponent(me.name);
      };
    }
  }
  // create gig
  if (pg === "create") {
    if (!me) {
      $("#gate").hidden = false;
      $("#gw").hidden = true;
      return;
    }
    let st = 0,
      tags = [],
      imgs = [],
      faqs = [];
    const S = $$(".step"),
      P = $$("#stp li"),
      f = (id) => $("#" + id),
      cats = {};
    $$("#gc option").forEach((o) => o.value && (cats[o.value] = o.textContent));
    const show = (n) => {
      st = n;
      S.forEach((s, i) => (s.hidden = i !== n));
      P.forEach((p, i) => p.classList.toggle("on", i === n));
      f("bk").hidden = n === 0;
      f("nx").textContent = n === 4 ? "Publish gig" : "Next";
      f("ge").textContent = "";
      if (n === 4)
        f("sum").textContent =
          `${f("gt").value} · ${cats[f("gc").value] || ""} · from $${f("pp0").value}`;
    };
    const upd = () => {
      f("tc").textContent = f("gt").value.length;
      f("dc").textContent = f("gdsc").value.length;
      f("pt").textContent = f("gt").value || "Your gig title appears here";
      f("pd").textContent = f("gdsc").value.slice(0, 120) || "Your description preview";
      f("pp").textContent = f("pp0").value || 0;
      f("pw").textContent = me.name;
    };
    const tg = () => {
      f("tgs").innerHTML = tags
        .map(
          (t, i) =>
            `<span>${E(t)} <button type="button" data-i="${i}" aria-label="Remove ${E(t)}">×</button></span>`,
        )
        .join("");
      $$("#tgs button").forEach(
        (b) =>
          (b.onclick = () => {
            tags.splice(+b.dataset.i, 1);
            tg();
          }),
      );
    };
    f("tg").onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const v = e.target.value.trim();
        if (v && tags.length < 5 && !tags.includes(v)) {
          tags.push(v);
          tg();
        }
        e.target.value = "";
      }
    };
    const fqr = (q = "", a = "") => {
      const d = document.createElement("div");
      d.innerHTML = `<label>Question<input class="fq" value="${E(q)}"></label><label>Answer<textarea class="fa" rows="2">${E(a)}</textarea></label>`;
      f("fqs").append(d);
    };
    f("af").onclick = () => fqr();
    f("gi").onchange = (e) => {
      imgs = [];
      f("gp").innerHTML = "";
      [...e.target.files].slice(0, 5).forEach((x) => {
        shrink(x, 640).then((u) => {
          imgs.push(u);
          f("gp").insertAdjacentHTML("beforeend", `<img src="${u}" alt="">`);
        });
      });
    };
    $$("#gf input,#gf textarea,#gf select").forEach((e) => e.addEventListener("input", upd));
    const gather = () => ({
      t: f("gt").value.trim(),
      c: f("gc").value,
      tags,
      pk: [0, 1, 2].map((i) => ({
        n: f("pn" + i).value.trim() || ["Basic", "Standard", "Premium"][i],
        p: f("pp" + i).value,
        dl: f("pd" + i).value,
        rv: f("pr" + i).value,
        i: f("pi" + i).value.trim(),
      })),
      d: f("gdsc").value.trim(),
      q: f("gq").value.trim(),
      faq: $$("#fqs>div")
        .map((d) => [$(".fq", d).value.trim(), $(".fa", d).value.trim()])
        .filter((x) => x[0] && x[1]),
      v: f("gv").value.trim(),
    });
    const d = L("lf_draft");
    if (d) {
      f("gt").value = d.t || "";
      f("gc").value = d.c || "";
      tags = d.tags || [];
      tg();
      d.pk.forEach((p, i) => {
        f("pn" + i).value = p.n;
        f("pp" + i).value = p.p;
        f("pd" + i).value = p.dl;
        f("pr" + i).value = p.rv;
        f("pi" + i).value = p.i;
      });
      f("gdsc").value = d.d || "";
      f("gq").value = d.q || "";
      (d.faq || []).forEach((x) => fqr(...x));
      f("gv").value = d.v || "";
    }
    f("sd").onclick = () => {
      W("lf_draft", gather());
      f("ge").textContent = "";
      f("ge").style.color = "inherit";
      f("ge").textContent = "Draft saved in this browser.";
    };
    f("bk").onclick = () => show(st - 1);
    f("nx").onclick = () => {
      const g = gather(),
        r = f("ge");
      r.style.color = "";
      if (st === 0) {
        if (g.t.length < 10)
          return (r.textContent = "Enter a gig title of at least 10 characters.");
        if (!g.c) return (r.textContent = "Select a category.");
      }
      if (st === 1 && g.pk.some((p) => !(+p.p >= 5)))
        return (r.textContent = "Set a price of at least $5 for every package.");
      if (st === 2 && g.d.length < 50)
        return (r.textContent = "Describe your service in at least 50 characters.");
      if (st === 3) {
        if (!imgs.length) return (r.textContent = "Add at least one image.");
        if (g.v && !/^https?:\/\//.test(g.v))
          return (r.textContent = "Enter a valid video link starting with https://.");
      }
      if (st < 4) return show(st + 1);
      const id = "my-" + Date.now(),
        pk = g.pk.map((p) => ({
          n: p.n,
          pr: "$" + p.p,
          dl: p.dl + " delivery",
          f: [p.rv + " revisions", ...(p.i ? p.i.split("\n").filter(Boolean) : [])],
        }));
      const a = L("lf_mygigs") || [];
      a.push({
        id,
        slug: g.c,
        cat: cats[g.c],
        badge: "New",
        img: imgs[0],
        who: me.name,
        lv: "New Seller",
        t: g.t,
        d: g.d,
        long: g.d,
        req: g.q,
        r: "",
        n: "",
        p: +g.pk[0].p,
        pk,
        faq: g.faq,
      });
      W("lf_mygigs", a);
      localStorage.removeItem("lf_draft");
      location.href = "gig.html?id=" + id;
    };
    fqr();
    show(0);
    upd();
  }
})();
