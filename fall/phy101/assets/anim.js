/* ============================================================
   PHY101 — "predict, then watch" animation harness.

   Host element anywhere in a page:
       <div class="anim" data-anim="NAME"></div>

   A week module registers into it:
       PhyAnim.register("w2-graphs", function (m) { ... });

   Same conventions as aa/assets/anim.js (register + shared ui helpers,
   no dependencies, light/dark tokens, prefers-reduced-motion, aria),
   with physics-specific primitives instead of the code-tracing ones:
   Scene/plot for axes and curves, Player for a time scrub, and predict()
   for the gate that must be answered before the animation will run.

   The gate is not decoration. COURSE_POLICY.md 6 requires a written
   prediction before any demonstration is opened, because watching a curve
   move teaches very little until you have committed to what it should do.
   ============================================================ */
(function () {
  "use strict";

  var REGISTRY = {};
  var REDUCED = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- tiny DOM helpers ---------- */
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function btn(label, cls, onClick, title) {
    var b = h("button", cls || "", label);
    b.type = "button";
    if (title) { b.title = title; b.setAttribute("aria-label", title); }
    if (onClick) b.addEventListener("click", onClick);
    return b;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(n, d) {
    if (!isFinite(n)) return "—";
    var v = Number(n).toFixed(d == null ? 2 : d);
    if (Math.abs(Number(v)) === 0) v = (0).toFixed(d == null ? 2 : d);
    return v;
  }
  function cssVar(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    v = (v || "").trim();
    return v || fallback || "#888";
  }

  /* ---------- controls ---------- */
  function seg(parent, label, options, value, onChange) {
    if (label) parent.appendChild(h("span", "lab", esc(label)));
    var s = h("span", "seg");
    s.setAttribute("role", "group");
    if (label) s.setAttribute("aria-label", label);
    options.forEach(function (o) {
      var b = btn(esc(o[1]), "", function () {
        s.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        onChange(o[0]);
      });
      b.setAttribute("aria-pressed", String(o[0] === value));
      s.appendChild(b);
    });
    parent.appendChild(s);
    return {
      el: s,
      set: function (v) {
        s.querySelectorAll("button").forEach(function (x, i) {
          x.setAttribute("aria-pressed", String(options[i][0] === v));
        });
      }
    };
  }

  function slider(parent, label, o, onInput) {
    var id = "sl" + Math.random().toString(36).slice(2, 8);
    var lab = h("label", "lab", esc(label));
    lab.setAttribute("for", id);
    parent.appendChild(lab);
    var r = h("input");
    r.type = "range";
    r.id = id;
    r.min = o.min; r.max = o.max; r.step = o.step == null ? "any" : o.step;
    r.value = o.value;
    var out = h("span", "stat", "<b>" + esc(o.text ? o.text(o.value) : o.value) + "</b>");
    r.addEventListener("input", function () {
      var v = parseFloat(r.value);
      out.innerHTML = "<b>" + esc(o.text ? o.text(v) : v) + "</b>";
      onInput(v);
    });
    parent.appendChild(r);
    parent.appendChild(out);
    return {
      el: r,
      value: function () { return parseFloat(r.value); },
      set: function (v) {
        r.value = v;
        out.innerHTML = "<b>" + esc(o.text ? o.text(v) : v) + "</b>";
      }
    };
  }

  function stat(parent, label, initial) {
    var s = h("span", "stat", esc(label) + " <b>" + esc(initial == null ? "—" : initial) + "</b>");
    parent.appendChild(s);
    return { el: s, set: function (v) { s.querySelector("b").textContent = v; } };
  }

  /* ---------- the predict gate ---------- */
  function predict(parent, o) {
    var api = { answered: false, onReveal: null, el: null };
    var wrap = h("div", "anim-gate");
    api.el = wrap;
    wrap.appendChild(h("p", "q", "<strong>Predict first.</strong> " + (o.q || "")));
    if (o.q_tr) {
      var tr = h("p", "q");
      tr.lang = "tr";
      tr.style.color = "var(--muted)";
      tr.style.fontSize = ".86rem";
      tr.innerHTML = o.q_tr;
      wrap.appendChild(tr);
    }
    var opts = h("div", "anim-opts");
    var why = h("div", "anim-why");
    why.hidden = true;

    var buttons = (o.options || []).map(function (op) {
      var b = btn(esc(op[1]), "", function () { choose(op[0], b); });
      b.setAttribute("aria-pressed", "false");
      opts.appendChild(b);
      return { v: op[0], b: b };
    });

    function choose(v, b) {
      if (api.answered) return;
      api.answered = true;
      buttons.forEach(function (x) {
        x.b.setAttribute("aria-pressed", String(x.v === v));
        x.b.disabled = true;
        if (x.v === o.correct) x.b.classList.add("right");
        else if (x.v === v) x.b.classList.add("wrong");
      });
      var right = v === o.correct;
      why.hidden = false;
      why.innerHTML = "<strong>" + (right ? "Yes." : "Not quite.") + "</strong> " + (o.why || "");
      if (o.why_tr) why.innerHTML += ' <span lang="tr">' + o.why_tr + "</span>";
      // KaTeX auto-render already ran at page load, so anything injected now
      // has to be typeset by hand or the reader sees raw \mathrm{...}.
      if (typeof window.renderMathInElement === "function") {
        try {
          window.renderMathInElement(why, {
            delimiters: [{ left: "$$", right: "$$", display: true },
                         { left: "$", right: "$", display: false }],
            throwOnError: false
          });
        } catch (e) {}
      }
      if (typeof api.onReveal === "function") api.onReveal(right);
    }

    wrap.appendChild(opts);
    wrap.appendChild(why);
    parent.appendChild(wrap);
    return api;
  }

  /* ---------- Scene: one canvas, any number of plots ---------- */
  function Scene(parent, o) {
    o = o || {};
    var cv = h("canvas");
    cv.setAttribute("role", "img");
    if (o.alt) cv.setAttribute("aria-label", o.alt);
    parent.appendChild(cv);
    var ctx = cv.getContext("2d");
    var height = o.height || 260;
    var self = { ctx: ctx, canvas: cv, w: 0, h: height, drawFn: null };

    function size() {
      // clientWidth includes padding, whereas a 100%-width canvas does not.
      var style = getComputedStyle(parent);
      var cssW = Math.max(1, (parent.clientWidth || 640)
        - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0));
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      self.w = cssW;
      self.h = typeof o.responsiveHeight === "function" ? o.responsiveHeight(cssW) : height;
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(self.h * dpr);
      cv.style.height = self.h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    self.clear = function () {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.restore();
    };
    self.col = cssVar;
    self.onDraw = function (fn) { self.drawFn = fn; return self; };
    self.draw = function () {
      if (!self.drawFn) return;
      self.clear();
      self.drawFn(self);
    };

    /* a rectangular plot area with its own data transform */
    self.plot = function (p) {
      var pad = p.pad || { l: 46, r: 12, t: 14, b: 30 };
      var x0 = p.x || 0, y0 = p.y || 0;
      var pw = (p.w || self.w) - pad.l - pad.r;
      var ph = (p.h || self.h) - pad.t - pad.b;
      var xl = p.xlim || [0, 1], yl = p.ylim || [0, 1];
      var P = {};
      P.X = function (v) { return x0 + pad.l + (v - xl[0]) / (xl[1] - xl[0]) * pw; };
      P.Y = function (v) { return y0 + pad.t + ph - (v - yl[0]) / (yl[1] - yl[0]) * ph; };
      P.w = pw; P.h = ph; P.xlim = xl; P.ylim = yl;

      P.frame = function () {
        var border = cssVar("--border-strong", "#999");
        var muted = cssVar("--muted", "#888");
        ctx.save();
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        ctx.strokeRect(x0 + pad.l, y0 + pad.t, pw, ph);
        ctx.fillStyle = muted;
        ctx.font = "11px " + cssVar("--font-mono", "monospace").replace(/['"]/g, "");
        // zero lines
        if (yl[0] < 0 && yl[1] > 0) {
          ctx.save();
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = border;
          ctx.beginPath(); ctx.moveTo(P.X(xl[0]), P.Y(0)); ctx.lineTo(P.X(xl[1]), P.Y(0)); ctx.stroke();
          ctx.restore();
        }
        (p.yticks || []).forEach(function (v) {
          ctx.textAlign = "right"; ctx.textBaseline = "middle";
          ctx.fillText(String(v), x0 + pad.l - 6, P.Y(v));
        });
        (p.xticks || []).forEach(function (v) {
          ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillText(String(v), P.X(v), y0 + pad.t + ph + 6);
        });
        if (p.ylabel) {
          ctx.save();
          ctx.translate(x0 + 12, y0 + pad.t + ph / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(p.ylabel, 0, 0);
          ctx.restore();
        }
        if (p.xlabel) {
          ctx.textAlign = "center"; ctx.textBaseline = "top";
          ctx.fillText(p.xlabel, x0 + pad.l + pw / 2, y0 + pad.t + ph + 15);
        }
        ctx.restore();
      };

      P.line = function (pts, opt) {
        opt = opt || {};
        if (!pts.length) return;
        ctx.save();
        ctx.strokeStyle = opt.color || cssVar("--phy-blue", "#1565c0");
        ctx.lineWidth = opt.width || 2;
        if (opt.dash) ctx.setLineDash(opt.dash);
        ctx.beginPath();
        pts.forEach(function (q, i) { i ? ctx.lineTo(P.X(q[0]), P.Y(q[1])) : ctx.moveTo(P.X(q[0]), P.Y(q[1])); });
        ctx.stroke();
        ctx.restore();
      };

      /* Signed area. Runs above the baseline and runs below it are filled
         separately, so "area below the axis counts as negative" is something
         the reader can see rather than something the caption asserts. */
      P.fill = function (pts, opt) {
        opt = opt || {};
        if (pts.length < 2) return;
        var base = opt.base == null ? 0 : opt.base;
        var pos = opt.color || cssVar("--accent-soft", "rgba(230,81,0,.12)");
        var neg = opt.negColor || cssVar("--red-soft", "rgba(198,40,40,.12)");

        function band(run, colour) {
          if (run.length < 2) return;
          ctx.save();
          ctx.fillStyle = colour;
          ctx.beginPath();
          ctx.moveTo(P.X(run[0][0]), P.Y(base));
          run.forEach(function (q) { ctx.lineTo(P.X(q[0]), P.Y(q[1])); });
          ctx.lineTo(P.X(run[run.length - 1][0]), P.Y(base));
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        var run = [pts[0]];
        var sign = pts[0][1] >= base ? 1 : -1;
        for (var i = 1; i < pts.length; i++) {
          var q = pts[i], sg = q[1] >= base ? 1 : -1;
          if (sg !== sign) {                       // interpolate the crossing
            var pv = pts[i - 1];
            var f = (base - pv[1]) / ((q[1] - pv[1]) || 1e-9);
            var xc = pv[0] + f * (q[0] - pv[0]);
            run.push([xc, base]);
            band(run, sign > 0 ? pos : neg);
            run = [[xc, base]];
            sign = sg;
          }
          run.push(q);
        }
        band(run, sign > 0 ? pos : neg);
      };

      P.dot = function (x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.fillStyle = opt.color || cssVar("--phy-orange", "#e65100");
        ctx.beginPath();
        ctx.arc(P.X(x), P.Y(y), opt.r || 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      P.vline = function (x, opt) {
        opt = opt || {};
        ctx.save();
        ctx.strokeStyle = opt.color || cssVar("--phy-orange", "#e65100");
        ctx.lineWidth = opt.width || 1.5;
        if (opt.dash !== false) ctx.setLineDash(opt.dash || [4, 3]);
        ctx.beginPath();
        ctx.moveTo(P.X(x), P.Y(yl[0])); ctx.lineTo(P.X(x), P.Y(yl[1]));
        ctx.stroke();
        ctx.restore();
      };

      P.arrow = function (x1, y1, x2, y2, opt) {
        opt = opt || {};
        var ax = P.X(x1), ay = P.Y(y1), bx = P.X(x2), by = P.Y(y2);
        var a = Math.atan2(by - ay, bx - ax), head = opt.head || 8;
        ctx.save();
        ctx.strokeStyle = ctx.fillStyle = opt.color || cssVar("--phy-orange", "#e65100");
        ctx.lineWidth = opt.width || 2;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
        if (Math.hypot(bx - ax, by - ay) > 3) {
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx - head * Math.cos(a - 0.4), by - head * Math.sin(a - 0.4));
          ctx.lineTo(bx - head * Math.cos(a + 0.4), by - head * Math.sin(a + 0.4));
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      };

      P.text = function (x, y, str, opt) {
        opt = opt || {};
        ctx.save();
        ctx.fillStyle = opt.color || cssVar("--muted", "#888");
        ctx.font = (opt.size || 11) + "px " + cssVar("--font-mono", "monospace").replace(/['"]/g, "");
        ctx.textAlign = opt.align || "left";
        ctx.textBaseline = opt.baseline || "bottom";
        ctx.fillText(str, P.X(x) + (opt.dx || 0), P.Y(y) + (opt.dy || 0));
        ctx.restore();
      };

      P.title = function (str) {
        ctx.save();
        ctx.fillStyle = cssVar("--heading", "#111");
        ctx.font = "600 12px " + cssVar("--font-body", "sans-serif").replace(/['"]/g, "");
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
        ctx.fillText(str, x0 + pad.l, y0 + pad.t - 3);
        ctx.restore();
      };
      return P;
    };

    size();
    var ro = window.ResizeObserver ? new ResizeObserver(function () { size(); self.draw(); }) : null;
    if (ro) ro.observe(parent); else window.addEventListener("resize", function () { size(); self.draw(); });
    window.addEventListener("phy101:theme", function () { self.draw(); });
    return self;
  }

  /* ---------- Player: a time scrub over [0, duration] ---------- */
  function Player(parent, o) {
    o = o || {};
    var dur = o.duration || 4;
    var t = 0, playing = false, raf = null, last = 0, speed = 1;
    var api = {};

    var play = btn(REDUCED ? "step ▸" : "play ▸", "", toggle, "Play or pause the animation");
    var reset = btn("reset", "ghost", function () { stop(); t = 0; sync(); }, "Reset to the start");
    parent.appendChild(play);
    parent.appendChild(reset);

    var scrubLab = h("label", "lab", "time");
    var scrubId = "pl" + Math.random().toString(36).slice(2, 8);
    scrubLab.setAttribute("for", scrubId);
    parent.appendChild(scrubLab);
    var scrub = h("input");
    scrub.type = "range"; scrub.id = scrubId;
    scrub.min = 0; scrub.max = 1000; scrub.value = 0; scrub.step = 1;
    scrub.setAttribute("aria-label", "Scrub through time");
    scrub.addEventListener("input", function () {
      stop();
      t = (parseFloat(scrub.value) / 1000) * dur;
      emit();
    });
    parent.appendChild(scrub);

    if (o.speeds !== false) {
      seg(parent, "speed", [[0.5, "½×"], [1, "1×"], [2, "2×"]], 1, function (v) { speed = v; });
    }

    function emit() {
      if (o.onFrame) o.onFrame(Math.min(t / dur, 1), t);
    }
    function sync() {
      scrub.value = String(Math.round(Math.min(t / dur, 1) * 1000));
      emit();
    }
    function frame(now) {
      if (!playing) return;
      if (!last) last = now;
      t += ((now - last) / 1000) * speed;
      last = now;
      if (t >= dur) { t = dur; sync(); stop(); return; }
      sync();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (t >= dur) t = 0;
      playing = true; last = 0;
      play.textContent = "pause ‖";
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      playing = false;
      play.textContent = REDUCED ? "step ▸" : "play ▸";
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }
    function toggle() {
      if (REDUCED) {                       // step in tenths instead of animating
        stop();
        t = t >= dur ? 0 : Math.min(dur, t + dur / 10);
        sync();
        return;
      }
      playing ? stop() : start();
    }

    /* stop burning frames when the animation scrolls out of view */
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (!e.isIntersecting && playing) stop(); });
      }, { threshold: 0 }).observe(parent);
    }

    api.play = function () { if (!REDUCED) start(); };
    api.stop = stop;
    api.reset = function () { stop(); t = 0; sync(); };
    api.t = function () { return t; };
    api.duration = dur;
    api.sync = sync;
    return api;
  }

  /* ---------- boot ---------- */
  function boot() {
    document.querySelectorAll("[data-anim]").forEach(function (host) {
      if (host.__phyBooted) return;
      var name = host.getAttribute("data-anim");
      var fn = REGISTRY[name];
      if (!fn) return;
      host.__phyBooted = true;

      var head = host.querySelector(".anim-head");
      var gate = h("div");
      var stage = h("div", "anim-stage");
      var controls = h("div", "anim-controls");
      var stats = h("p", "anim-stats");
      var foot = host.querySelector(".anim-foot");

      host.insertBefore(gate, foot || null);
      host.insertBefore(stage, foot || null);
      host.insertBefore(controls, foot || null);
      host.insertBefore(stats, foot || null);

      try {
        fn({
          host: host, head: head, gate: gate, stage: stage,
          controls: controls, stats: stats, foot: foot, U: window.PhyAnim.ui
        });
      } catch (err) {
        stage.appendChild(h("p", "anim-fallback",
          "This animation could not start in your browser. The same demonstration runs in the week's Colab notebook."));
        if (window.console) console.error("[PhyAnim] " + name, err);
      }
    });
  }

  window.PhyAnim = {
    register: function (name, fn) {
      REGISTRY[name] = fn;
      if (document.readyState !== "loading") boot();
    },
    boot: boot,
    reduced: REDUCED,
    ui: {
      h: h, btn: btn, esc: esc, fmt: fmt, cssVar: cssVar,
      seg: seg, slider: slider, stat: stat,
      predict: predict, Scene: Scene, Player: Player
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
