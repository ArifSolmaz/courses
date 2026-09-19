/* ============================================================
   AA — week 2 "Try it yourself" animations
   w2-receipt, w2-swap, w2-predict, w2-split, w2-badge, w2-bug
   Uses AAAnim.ui helpers from anim.js; extra styles in anim-w2.css.
   ============================================================ */
(function () {
  "use strict";
  var U = AAAnim.ui, h = U.h, btn = U.btn, esc = U.esc;

  /* ---------- Python-faithful little helpers ---------- */

  /* CodeTrace prints a function value with String(v); this lets us show
     Python-style text (e.g. 10.0, "pen" · str) without extra quotes. */
  function raw(text) { var f = function () {}; f.toString = function () { return text; }; return f; }

  /* repr() of a Python str: single quotes unless the text contains ' and no " */
  function strRepr(s) {
    var q = s.indexOf("'") >= 0 && s.indexOf('"') < 0 ? '"' : "'";
    return q + s.replace(/\\/g, "\\\\").split(q).join("\\" + q) + q;
  }
  /* repr() of a Python float (shortest round-trip digits, Python's layout rules) */
  function floatRepr(x) {
    if (x !== x) return "nan";
    if (x === Infinity) return "inf";
    if (x === -Infinity) return "-inf";
    if (x === 0) return 1 / x < 0 ? "-0.0" : "0.0";
    var sign = x < 0 ? "-" : "", m = Math.abs(x).toExponential();   /* shortest digits */
    var parts = m.split("e"), digits = parts[0].replace(".", ""), e = parseInt(parts[1], 10);
    if (e < -4 || e >= 16) {
      var mant = digits.length > 1 ? digits[0] + "." + digits.slice(1) : digits;
      var ea = Math.abs(e);
      return sign + mant + "e" + (e < 0 ? "-" : "+") + (ea < 10 ? "0" : "") + ea;
    }
    if (e < 0) return sign + "0." + new Array(-e).join("0") + digits;
    var ip = digits.slice(0, e + 1), fp = digits.slice(e + 1);
    while (ip.length < e + 1) ip += "0";
    return sign + ip + "." + (fp || "0");
  }
  /* format(x, ".Nf") — rounds the exact binary value, ties to even like Python */
  function fixed(x, n) {
    if (x !== x) return "nan";
    if (!isFinite(x)) return x > 0 ? "inf" : "-inf";
    var a = Math.abs(x), sign = x < 0 || Object.is(x, -0) ? "-" : "";
    if (a >= 1e21) return sign + a.toFixed(0);
    var ex = a.toFixed(Math.min(100, n + 80)), dot = ex.indexOf(".");
    var tail = ex.slice(dot + 1 + n);
    if (/^50*$/.test(tail)) {                       /* exact tie: round half to even */
      var head = ex.slice(0, dot + 1 + n).replace(/\.$/, "");
      var lastDigit = parseInt(head.replace(".", "").slice(-1), 10);
      if (lastDigit % 2 === 0) return sign + head;
    }
    return sign + a.toFixed(n);
  }
  /* Python values used in the traces: {t: "str"|"int"|"float", v} */
  function S(v) { return { t: "str", v: v }; }
  function I(v) { return { t: "int", v: v }; }
  function F(v) { return { t: "float", v: v }; }
  function repr(p) { return p.t === "str" ? strRepr(p.v) : p.t === "float" ? floatRepr(p.v) : String(p.v); }
  function show(p) { return raw(repr(p) + "  · " + p.t); }
  function pyFloat(s) {
    var t = s.trim().replace(/(\d)_(?=\d)/g, "$1");
    if (/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(t)) return F(parseFloat(t));
    var m = /^([+-]?)(inf|infinity|nan)$/i.exec(t);
    if (m) return F(/nan/i.test(m[2]) ? NaN : (m[1] === "-" ? -Infinity : Infinity));
    return { err: "ValueError: could not convert string to float: " + strRepr(s) };
  }
  function pyInt(s) {
    var t = s.trim();
    if (/^[+-]?\d+(_\d+)*$/.test(t)) return I(parseInt(t.replace(/_/g, ""), 10));
    return { err: "ValueError: invalid literal for int() with base 10: " + strRepr(s) };
  }
  function traceback(file, lineNo, src, errLine) {
    return ["Traceback (most recent call last):", '  File "' + file + '", line ' + lineNo + ", in <module>",
      "    " + src.trim(), errLine];
  }
  function textIn(value, label, size) {
    var i = h("input", "w2-in");
    i.type = "text"; i.value = value; i.size = size || 8; i.maxLength = 24;
    i.setAttribute("aria-label", label);
    i.spellcheck = false; i.autocomplete = "off";
    return i;
  }
  function copy(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
  function lines(src) { return src.split("\n"); }

  /* ============================================================
     Task 1 — w2-receipt: input → conversion → arithmetic → :.2f
     ============================================================ */
  function receipt(host) {
    host.classList.add("w2-wide");
    U.title(host, "Animation · run receipt.py one line at a time");
    var CODE = 'item = input("Item: ")\n' +
      'price = float(input("Unit price: "))\n' +
      'qty = int(input("Quantity: "))\n\n' +
      "line_total = price * qty\n" +
      "with_tax = line_total * 1.20\n\n" +
      'print(f"{qty} x {item} = {line_total:.2f}")\n' +
      'print(f"With 20% tax:  {with_tax:.2f}")';
    var SRC = lines(CODE);

    var opts = h("div", "anim-opts w2-opts");
    var fItem = textIn("pen", "Item name the user types", 9);
    var fPrice = textIn("4.1", "Unit price the user types", 6);
    var fQty = textIn("3", "Quantity the user types", 4);
    opts.appendChild(h("span", "lab", "the user types &rarr; Item:"));
    opts.appendChild(fItem);
    opts.appendChild(h("span", "lab", "Unit price:"));
    opts.appendChild(fPrice);
    opts.appendChild(h("span", "lab", "Quantity:"));
    opts.appendChild(fQty);
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts w2-opts");
    opts2.appendChild(h("span", "lab", "what if the user types…"));
    opts2.appendChild(btn("price 4,1", "", function () { fPrice.value = "4,1"; fQty.value = "3"; ct.load(); }, "Type the price with a comma"));
    opts2.appendChild(btn("quantity 2.5", "", function () { fPrice.value = "4.1"; fQty.value = "2.5"; ct.load(); }, "Type a decimal quantity"));
    opts2.appendChild(btn("back to 4.1 × 3", "", function () { fItem.value = "pen"; fPrice.value = "4.1"; fQty.value = "3"; ct.load(); }));
    host.appendChild(opts2);
    [fItem, fPrice, fQty].forEach(function (f) {
      f.addEventListener("change", function () { ct.load(); });
      f.addEventListener("keydown", function (e) { if (e.key === "Enter") ct.load(); });
    });

    var lens;
    function build() {
      var f = [], vars = {}, out = [], run = 0, rows = [];
      function push(line, note, extra) {
        var fr = { line: line, vars: copy(vars), out: out.slice(), note: note, counters: { "statements run": run }, rows: rows.slice() };
        if (extra) Object.keys(extra).forEach(function (k) { fr[k] = extra[k]; });
        f.push(fr);
      }
      function fail(line, errLine, note) {
        out = out.concat(traceback("receipt.py", line, SRC[line - 1], errLine));
        push(line, note, { err: line, errOut: true });
      }
      push(0, "The three boxes above are what the user will type. Before you press <strong>play</strong>: which variables will hold text, and which will hold numbers?");

      var item = S(fItem.value);
      out.push("Item: ");
      push(1, "<code>input</code> prints its prompt and waits for the user to type something.");
      out[out.length - 1] = "Item: " + item.v;
      vars.item = show(item); run++;
      push(1, "The user typed <strong>" + esc(item.v) + "</strong> and pressed Enter. <code>input()</code> always hands back <em>text</em>, so <code>item</code> is a str.");

      out.push("Unit price: " + fPrice.value);
      vars["input(…)"] = show(S(fPrice.value));
      push(2, "Inside out: <code>input</code> runs first and returns the text " + esc(strRepr(fPrice.value)) + " — not a number yet.");
      delete vars["input(…)"];
      var price = pyFloat(fPrice.value);
      if (price.err) {
        fail(2, price.err, "Python stops at line 2. Read the <strong>last line</strong> of the traceback: <code>float()</code> cannot turn " +
          esc(strRepr(fPrice.value)) + " into a number" + (fPrice.value.indexOf(",") >= 0 ? " — Python only accepts a <strong>dot</strong> as the decimal point." : "."));
        return f;
      }
      vars.price = show(price); run++;
      push(2, "<code>float(...)</code> converts that text into the decimal number <strong>" + floatRepr(price.v) + "</strong>. Now <code>price</code> is a float.");

      out.push("Quantity: " + fQty.value);
      vars["input(…)"] = show(S(fQty.value));
      push(3, "Again <code>input</code> returns text: " + esc(strRepr(fQty.value)) + ".");
      delete vars["input(…)"];
      var qty = pyInt(fQty.value);
      if (qty.err) {
        fail(3, qty.err, "Python stops at line 3. <code>int()</code> only accepts whole-number text, so " + esc(strRepr(fQty.value)) +
          " is refused. The traceback's last line says exactly that (§2.7).");
        return f;
      }
      vars.qty = show(qty); run++;
      push(3, "<code>int(...)</code> converts it into the whole number <strong>" + qty.v + "</strong>. Now we have one str, one float and one int.");

      var lt = F(price.v * qty.v);
      vars.line_total = show(lt); run++;
      var messy = floatRepr(lt.v).length > 8;
      push(5, "Right side first: " + floatRepr(price.v) + " × " + qty.v + ". A float times an int gives a float" +
        (messy ? ", and floats are stored in binary, so the exact result is <strong>" + floatRepr(lt.v) + "</strong>. Keep an eye on that." : ": <strong>" + floatRepr(lt.v) + "</strong>."));

      var wt = F(lt.v * 1.20);
      vars.with_tax = show(wt); run++;
      push(6, "Add 20% tax by multiplying by 1.20: <strong>" + floatRepr(wt.v) + "</strong>.");

      var l1 = qty.v + " x " + item.v + " = " + fixed(lt.v, 2);
      out.push(l1); run++;
      rows.push(["line_total", floatRepr(lt.v), fixed(lt.v, 2)]);
      push(8, "The f-string drops the values in. <code>:.2f</code> shows <code>line_total</code> with two decimals: " +
        floatRepr(lt.v) + " &rarr; <strong>" + fixed(lt.v, 2) + "</strong>. The stored value is not changed — only how it is printed.");

      out.push("With 20% tax:  " + fixed(wt.v, 2)); run++;
      rows.push(["with_tax", floatRepr(wt.v), fixed(wt.v, 2)]);
      push(9, "Second receipt line: " + floatRepr(wt.v) + " &rarr; <strong>" + fixed(wt.v, 2) + "</strong>.");

      push(0, "Done: a two-line receipt, and <strong>" + run + " statements</strong> ran. Type a price of 4000000 and it is still " + run +
        " — the count does not depend on the numbers (§2.9). Now try the <em>what if</em> buttons.");
      return f;
    }

    var ct = U.CodeTrace(host, {
      code: CODE, build: build, varsTitle: "variables · value · kind", outTitle: "screen",
      fps: function (i, fr) { return 0.9; },
      onFrame: function (fr) {
        lens.rows(fr.rows.length ? fr.rows : [["—", "", ""]]);
      }
    });
    ct.extra.appendChild(h("div", "ct-h", "stored value vs what :.2f prints"));
    var tw = h("div", "anim-table-wrap");
    ct.extra.appendChild(tw);
    lens = U.table(tw, ["name", "stored", "printed"]);
    lens.el.classList.add("w2-tbl");
    ct.load();
  }
  AAAnim.register("w2-receipt", receipt);

  /* ============================================================
     Task 2 — w2-swap: names point at values
     ============================================================ */
  function swap(host) {
    var VARIANTS = {
      naive: { label: "first try", file: 'a = "left"\nb = "right"\na = b\nb = a\nprint(a, b)' },
      temp: { label: "temporary name", file: 'a = "left"\nb = "right"\ntemp = a\na = b\nb = temp\nprint(a, b)' },
      tuple: { label: "shortcut", file: 'a = "left"\nb = "right"\na, b = b, a\nprint(a, b)' }
    };
    var cur = "naive", guess = null;
    U.title(host, "Animation · names are arrows pointing at values");
    var opts = h("div", "anim-opts w2-opts");
    opts.appendChild(U.seg("version", [["naive", "a = b; b = a"], ["temp", "with temp"], ["tuple", "a, b = b, a"]], cur,
      function (v) { cur = v; guess = null; paintGuess(); ct.load(); }));
    host.appendChild(opts);
    var gq = h("div", "anim-opts w2-opts w2-guess");
    gq.appendChild(h("span", "lab", "predict: print(a, b) shows"));
    var gb = ["right left", "right right", "left left", "left right"].map(function (g) {
      var b = btn(g, "", function () { guess = g; paintGuess(); ct.load(); });
      gq.appendChild(b); return b;
    });
    host.appendChild(gq);
    function paintGuess() { gb.forEach(function (b) { b.setAttribute("aria-pressed", String(b.textContent === guess)); }); }

    var NS = "http://www.w3.org/2000/svg";
    function sv(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      if (parent) parent.appendChild(e);
      return e;
    }
    var svg;
    var NAME_Y = { a: 38, b: 96, temp: 154 }, VAL_Y = { L: 56, R: 136 };
    var parts = { tags: {}, arrows: {}, vals: {} };
    function buildSvg(parent) {
      svg = sv("svg", { viewBox: "0 0 400 190", "class": "w2-swap-svg", role: "img",
        "aria-label": "Names a, b and temp drawn as tags with arrows to the text values they point at" });
      var defs = sv("defs", {}, svg);
      ["L", "R"].forEach(function (k) {
        var mk = sv("marker", { id: "w2m-" + k + "-" + uid, viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
        sv("path", { d: "M0,0 L10,5 L0,10 z", "class": "w2-mk-" + k }, mk);
      });
      ["a", "b", "temp"].forEach(function (n) {
        var g = sv("g", { "class": "w2-tag" }, svg);
        sv("rect", { x: 6, y: NAME_Y[n] - 17, width: 72, height: 34, rx: 8 }, g);
        var t = sv("text", { x: 42, y: NAME_Y[n] + 6, "text-anchor": "middle" }, g); t.textContent = n;
        parts.tags[n] = g;
        parts.arrows[n] = sv("path", { "class": "w2-arrow" }, svg);
      });
      [["L", "left"], ["R", "right"]].forEach(function (p) {
        var g = sv("g", { "class": "w2-val w2-val-" + p[0] }, svg);
        sv("rect", { x: 222, y: VAL_Y[p[0]] - 22, width: 172, height: 44, rx: 10 }, g);
        var t = sv("text", { x: 308, y: VAL_Y[p[0]] + 7, "text-anchor": "middle" }, g); t.textContent = '"' + p[1] + '"';
        var s = sv("text", { x: 308, y: VAL_Y[p[0]] + 38, "text-anchor": "middle", "class": "w2-val-sub" }, g);
        parts.vals[p[0]] = { g: g, sub: s };
      });
      var tup = sv("g", { "class": "w2-tuple" }, svg);
      sv("rect", { x: 92, y: 78, width: 124, height: 36, rx: 8 }, tup);
      var tt = sv("text", { x: 154, y: 101, "text-anchor": "middle" }, tup); tt.textContent = "(b, a)";
      parts.tuple = tup; parts.tupleText = tt;
      parent.appendChild(svg);
    }
    var uid = Math.floor(Math.random() * 1e9);

    function build() {
      var src = VARIANTS[cur].file, L = lines(src), f = [], ptr = {}, vars = {}, out = [], moves = 0;
      function val(k) { return k === "L" ? "left" : "right"; }
      function push(line, note, extra) {
        var fr = { line: line, ptr: copy(ptr), vars: copy(vars), out: out.slice(), note: note,
          counters: { "swap assignments": moves } };
        if (extra) Object.keys(extra).forEach(function (k) { fr[k] = extra[k]; });
        f.push(fr);
      }
      function set(n, k) { ptr[n] = k; vars[n] = val(k); }
      push(0, "Choose a prediction above, then press <strong>play</strong>. Each name is an arrow; <code>=</code> moves an arrow — it never copies or changes the text itself.");
      set("a", "L"); push(1, "<code>a</code> now points at the text \"left\".", { moved: ["a"] });
      set("b", "R"); push(2, "<code>b</code> now points at \"right\". That is the setup; from here on we count the assignments that do the swap.", { moved: ["b"] });
      if (cur === "naive") {
        set("a", "R"); moves++;
        push(3, "Right side first: <code>b</code> is \"right\". Then <code>a</code>'s arrow moves there. Nothing points at \"left\" any more — it is <strong>lost</strong>.", { moved: ["a"] });
        set("b", "R"); moves++;
        push(4, "Right side first: <code>a</code> is <em>now</em> \"right\", so <code>b</code> points at \"right\" too. The old \"left\" is gone for good.", { moved: ["b"] });
      } else if (cur === "temp") {
        set("temp", "L"); moves++;
        push(3, "<code>temp</code> points at \"left\" as well — a second arrow keeps it safe.", { moved: ["temp"] });
        set("a", "R"); moves++;
        push(4, "<code>a</code> moves to \"right\". \"left\" is still reachable through <code>temp</code>.", { moved: ["a"] });
        set("b", "L"); moves++;
        push(5, "<code>b</code> takes whatever <code>temp</code> points at: \"left\". Swapped.", { moved: ["b"] });
      } else {
        push(3, "Right side first: Python reads <code>b</code> and <code>a</code> <em>before</em> any arrow moves and packs them as (\"right\", \"left\").", { tuple: true });
        set("a", "R"); set("b", "L"); moves++;
        push(3, "Then both arrows move together: <code>a</code> &rarr; \"right\", <code>b</code> &rarr; \"left\". One assignment statement.", { moved: ["a", "b"] });
      }
      out.push(vars.a + " " + vars.b);
      var ok = vars.a === "right" && vars.b === "left";
      var printed = out[0], n = moves, which = cur;
      push(L.length, "", { final: function () {
        return (ok ? "Swapped" : "Not a swap — both names now hold \"right\"") + ". Printed <strong>" + printed + "</strong>" +
          (guess ? (guess === printed ? " — exactly what you predicted." : " — you predicted \"" + guess + "\".") : ".") +
          " Assignments doing the swap: <strong>" + n + "</strong>" +
          (which === "temp" ? " (three, as the solution says)." : which === "tuple" ? " (one, as the solution says)." : ". Now try the version with temp.");
      } });
      return f;
    }
    function onFrame(fr) {
      if (!svg) return;
      ["a", "b", "temp"].forEach(function (n) {
        var k = fr.ptr[n], ar = parts.arrows[n], tag = parts.tags[n];
        var moved = fr.moved && fr.moved.indexOf(n) >= 0;
        tag.setAttribute("class", "w2-tag" + (k ? "" : " off") + (moved ? " moved" : ""));
        if (!k) { ar.setAttribute("d", ""); ar.setAttribute("class", "w2-arrow"); ar.removeAttribute("marker-end"); return; }
        var y0 = NAME_Y[n], y1 = VAL_Y[k] + (n === "a" ? -8 : n === "b" ? 0 : 8);
        ar.setAttribute("d", "M78," + y0 + " C150," + y0 + " 150," + y1 + " 220," + y1);
        ar.setAttribute("class", "w2-arrow w2-arrow-" + k + (moved ? " moved" : ""));
        ar.setAttribute("marker-end", "url(#w2m-" + k + "-" + uid + ")");
      });
      ["L", "R"].forEach(function (k) {
        var names = ["a", "b", "temp"].filter(function (n) { return fr.ptr[n] === k; });
        var lost = !names.length && Object.keys(fr.ptr).length >= 2;
        parts.vals[k].g.setAttribute("class", "w2-val w2-val-" + k + (lost ? " lost" : "") + (fr.tuple ? " read" : "") +
          (!names.length && !lost ? " off" : ""));
        parts.vals[k].sub.textContent = lost ? "no name points here — lost" : names.length ? "pointed at by " + names.join(", ") : "";
      });
      parts.tuple.setAttribute("class", "w2-tuple" + (fr.tuple ? " on" : ""));
      parts.tupleText.textContent = '("right", "left")';
      if (fr.final) ct.msg.innerHTML = fr.final();
    }
    var ct = U.CodeTrace(host, { code: function () { return VARIANTS[cur].file; }, build: build, onFrame: onFrame, fps: 0.8, outTitle: "output" });
    buildSvg(ct.extra);
    ct.load();
  }
  AAAnim.register("w2-swap", swap);

  /* ============================================================
     Task 3 — w2-predict: write it down, then run each line
     ============================================================ */
  function predict(host) {
    var ROWS = [
      { code: "print(10 / 4)", out: "2.5", vis: "div",
        why: "<code>/</code> always gives a decimal (a float): 10 split into 4 equal parts is 2.5 each.",
        miss: { "2": "That is what <code>//</code> gives. A single <code>/</code> is exact division and always gives a decimal.", "2.0": "That is <code>//</code>-style thinking. <code>/</code> keeps the .5." } },
      { code: "print(10 // 4)", out: "2", vis: "floor",
        why: "<code>//</code> asks \"how many whole 4s fit into 10?\" Two groups of 4 fit (8); the rest is ignored.",
        miss: { "2.5": "That is what <code>/</code> gives. <code>//</code> keeps only the number of whole groups.", "2.0": "Right amount, but two ints give the int <code>2</code>, printed without <code>.0</code>.", "3": "Three 4s would be 12 — more than 10. <code>//</code> rounds down." } },
      { code: "print(10 % 4)", out: "2", vis: "mod",
        why: "<code>%</code> is the remainder: after taking out two whole 4s (8), <strong>2</strong> are left over.",
        miss: { "2.5": "<code>%</code> is not division. It is what is <em>left over</em> after the whole groups.", "0.5": "<code>%</code> is not a fraction: it counts the leftover items — 2 of them.", "0": "0 would mean 4 divides 10 exactly. It does not: 10 = 4 + 4 + 2." } },
      { code: 'print("10" * 3)', out: "101010", vis: "rep",
        why: "<code>\"10\"</code> is text. Text times a whole number <em>repeats</em> the text: \"10\" + \"10\" + \"10\".",
        miss: { "30": "That would be number times number — but <code>\"10\"</code> has quotes, so it is text. Text * 3 repeats it.", "10 10 10": "Close — repetition adds no spaces.", "typeerror": "Surprisingly, no error: text * int is allowed (it repeats). It is text <strong>+</strong> int that fails.", "error": "Surprisingly, no error: text * int is allowed (it repeats). It is text <strong>+</strong> int that fails." } },
      { code: "print(10 * 3)", out: "30", vis: "mul",
        why: "No quotes this time: 10 is a number, so this is ordinary multiplication — three rows of ten.",
        miss: { "101010": "That was the line above. Here <code>10</code> has no quotes, so it is a number: 10 × 3 = 30.", "30.0": "Two ints multiply to an int: <code>30</code>, no <code>.0</code>." } }
    ];
    U.title(host, "Animation · predict, then run — one line at a time");
    host.appendChild(h("p", "muted w2-small", "Type what you think each line prints, then run it. The animation shows <em>why</em> Python prints what it prints."));
    var list = h("div", "w2-pred");
    host.appendChild(list);
    var state = [], m;
    ROWS.forEach(function (r, j) {
      var row = h("div", "w2-prow");
      var code = h("code", "w2-pcode", U.pyLine(r.code));
      var inp = textIn("", "Your prediction for " + r.code, 8);
      inp.placeholder = "prediction";
      var go = btn("run", "", function () { run(j); }, "Run " + r.code);
      var res = h("div", "w2-pres");
      row.appendChild(h("span", "w2-pno", String(j + 1)));
      row.appendChild(code); row.appendChild(inp); row.appendChild(go); row.appendChild(res);
      list.appendChild(row);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") run(j); });
      state.push({ row: row, inp: inp, go: go, res: res, done: false, warned: false, ok: null });
    });
    var stats = h("div", "anim-stats");
    var sRight = U.stat("right first time"), sDone = U.stat("lines run");
    stats.appendChild(sRight.el); stats.appendChild(sDone.el);
    host.appendChild(stats);
    m = U.msg(host);
    var bar = h("div", "anim-controls");
    var bNext = btn("&#9654; run next line", "primary", function () {
      for (var j = 0; j < ROWS.length; j++) if (!state[j].done) { run(j, true); return; }
    });
    var bReset = btn("&#8634; start again", "", reset);
    bar.appendChild(bNext); bar.appendChild(bReset);
    host.appendChild(bar);

    function norm(s) { return s.trim().replace(/^["']|["']$/g, "").replace(/\s+/g, " ").toLowerCase(); }
    function run(j, fromNext) {
      var st = state[j], r = ROWS[j], p = st.inp.value;
      if (st.done) return;
      if (!p.trim() && !st.warned) {
        st.warned = true;
        m.innerHTML = "Line " + (j + 1) + ": write your prediction in its box first — or press " + (fromNext ? "<strong>run next line</strong>" : "<strong>run</strong>") + " again to just see it.";
        st.inp.focus({ preventScroll: true });
        return;
      }
      st.done = true; st.inp.disabled = true; st.go.disabled = true;
      var n = norm(p), quoted = /^\s*["']/.test(p);
      var ok = n === r.out || (r.out === "2.5" && n === "2.50");
      st.ok = p.trim() ? ok : null;
      var fb;
      if (!p.trim()) fb = "No prediction — next time, commit to one first.";
      else if (ok) fb = "Right." + (quoted ? " (print shows text without the quotes.)" : "");
      else fb = r.miss[n] || "Not quite — Python prints <strong>" + r.out + "</strong>.";
      st.row.className = "w2-prow ran " + (st.ok === true ? "good" : st.ok === false ? "bad" : "");
      st.res.innerHTML = '<div class="w2-pout"><span class="muted">output</span> <b>' + r.out + "</b> " +
        (st.ok === true ? '<span class="w2-ok">&#10003;</span>' : st.ok === false ? '<span class="w2-no">&#10007; you wrote ' + esc(p.trim()) + "</span>" : "") + "</div>";
      st.res.appendChild(visual(r.vis));
      st.res.appendChild(h("p", "w2-why", r.why));
      m.innerHTML = "Line " + (j + 1) + ": " + fb;
      tally();
    }
    function tally() {
      var done = state.filter(function (s) { return s.done; }).length;
      var right = state.filter(function (s) { return s.ok === true; }).length;
      sRight.set(right + " / " + done); sDone.set(done + " / " + ROWS.length);
      bNext.disabled = done === ROWS.length;
      if (done === ROWS.length) {
        m.innerHTML = "All five run: <strong>2.5, 2, 2, 101010, 30</strong>. You had " + right + " right first time. " +
          (state[3].ok === false ? "Line 4 is the one that surprises nearly everyone — multiplying text repeats it." : "The fourth line is the one that surprises nearly everyone.");
      }
    }
    function dots(n, cls) { var s = ""; for (var i = 0; i < n; i++) s += '<i class="' + (cls || "") + '" style="animation-delay:' + (i * 40) + 'ms"></i>'; return s; }
    function visual(kind) {
      var v = h("div", "w2-vis");
      if (kind === "div") {
        v.innerHTML = '<div class="w2-split4">' + [1, 2, 3, 4].map(function () { return '<span style="flex:2.5">2.5</span>'; }).join("") +
          '</div><div class="w2-cap">a length of 10 cut into 4 equal parts</div>';
      } else if (kind === "floor" || kind === "mod") {
        v.innerHTML = '<div class="w2-groups">' +
          '<span class="w2-grp' + (kind === "floor" ? " hi" : "") + '">' + dots(4) + "</span>" +
          '<span class="w2-grp' + (kind === "floor" ? " hi" : "") + '">' + dots(4) + "</span>" +
          '<span class="w2-rest' + (kind === "mod" ? " hi" : "") + '">' + dots(2, "r") + "</span></div>" +
          '<div class="w2-cap">10 items in groups of 4: ' + (kind === "floor" ? "<b>2</b> whole groups" : "<b>2</b> left over") + "</div>";
      } else if (kind === "rep") {
        v.innerHTML = '<div class="w2-rep"><span>10</span><span>10</span><span>10</span></div><div class="w2-cap">the text "10", three times, glued together</div>';
      } else {
        v.innerHTML = '<div class="w2-rows">' + [0, 1, 2].map(function () { return "<div>" + dots(10) + "</div>"; }).join("") +
          '</div><div class="w2-cap">3 rows of 10 = 30</div>';
      }
      return v;
    }
    function reset() {
      state.forEach(function (st) {
        st.done = false; st.warned = false; st.ok = null; st.inp.disabled = false; st.inp.value = "";
        st.go.disabled = false; st.res.innerHTML = ""; st.row.className = "w2-prow";
      });
      sRight.set("0 / 0"); sDone.set("0 / " + ROWS.length); bNext.disabled = false;
      m.innerHTML = "Write all five predictions down first. Then run the lines one by one.";
    }
    reset();
  }
  AAAnim.register("w2-predict", predict);

  /* ============================================================
     Task 4 — w2-split: // deals whole rounds, % is what is left
     ============================================================ */
  function split(host) {
    host.classList.add("w2-wide");
    var bill = 137, people = 4;
    U.title(host, "Animation · deal the bill out in whole rounds");
    var opts = h("div", "anim-opts w2-opts");
    var sB = h("input"); sB.type = "range"; sB.min = "1"; sB.max = "200"; sB.value = "137";
    sB.setAttribute("aria-label", "Bill");
    var vB = h("span", "lab", "137");
    var sP = h("input"); sP.type = "range"; sP.min = "1"; sP.max = "10"; sP.value = "4";
    sP.setAttribute("aria-label", "Number of people");
    var vP = h("span", "lab", "4");
    opts.appendChild(h("span", "lab", "bill")); opts.appendChild(sB); opts.appendChild(vB);
    host.appendChild(opts);
    var opts2 = h("div", "anim-opts w2-opts");
    opts2.appendChild(h("span", "lab", "people")); opts2.appendChild(sP); opts2.appendChild(vP);
    opts2.appendChild(btn("137 and 4", "", function () { sB.value = "137"; sP.value = "4"; change(); }, "Back to the task's numbers"));
    host.appendChild(opts2);
    function change() { bill = +sB.value; people = +sP.value; vB.textContent = bill; vP.textContent = people; ct.load(); }
    sB.addEventListener("input", change); sP.addEventListener("input", change);

    function code() {
      return "bill = " + bill + "\npeople = " + people + "\n\neach = bill // people\nleft = bill % people\n\n" +
        'print(f"{each} each, {left} left over")\nprint(f"Exact share: {bill / people:.2f}")';
    }
    var pot, table, cols = [];
    function build() {
      var f = [], vars = {}, out = [], run = 0;
      var each = Math.floor(bill / people), left = bill % people;
      function push(line, note, st) {
        f.push({ line: line, vars: copy(vars), out: out.slice(), note: note,
          counters: { "statements run": run, "whole rounds dealt": st.k }, k: st.k, phase: st.phase || "" });
      }
      push(0, "Picture the " + bill + " units as tokens. How many does each friend get if you only hand out <em>whole</em> rounds? Predict, then press <strong>play</strong>.", { k: 0 });
      vars.bill = raw(bill + "  · int"); run++; push(1, "The bill: " + bill + " units on the table.", { k: 0 });
      vars.people = raw(people + "  · int"); run++; push(2, people + " friends.", { k: 0 });
      for (var k = 1; k <= each; k++) {
        vars["bill // people"] = raw(k + " so far");
        push(4, k === 1 ? "<code>//</code> works like dealing cards: one token to each friend per round." :
          "Round " + k + ": " + (bill - k * people) + " tokens still on the table.", { k: k, phase: "deal" });
      }
      delete vars["bill // people"];
      vars.each = raw(each + "  · int"); run++;
      push(4, "Only " + left + " token" + (left === 1 ? "" : "s") + " left — not enough for another full round of " + people +
        ". So <code>each</code> is <strong>" + each + "</strong>.", { k: each });
      vars.left = raw(left + "  · int"); run++;
      push(5, "<code>%</code> gives exactly those leftovers: <code>" + bill + " % " + people + "</code> is <strong>" + left + "</strong>.", { k: each, phase: "left" });
      out.push(each + " each, " + left + " left over"); run++;
      push(7, "First line of output, straight from the two ints.", { k: each, phase: "left" });
      var share = fixed(bill / people, 2);
      out.push("Exact share: " + share); run++;
      push(8, "<code>/</code> does exact division: " + bill + " / " + people + " = " + floatRepr(bill / people) + ", shown with <code>:.2f</code> as <strong>" + share + "</strong>." +
        (left ? " The leftover " + left + " is shared out too: " + left + " / " + people + " = " + floatRepr(left / people) + " more each." : " Nothing was left over, so the exact share is a whole number."), { k: each, phase: "share" });
      push(0, "<strong>" + each + " each, " + left + " left over</strong> — and exact share <strong>" + share + "</strong>. " +
        "Check: " + each + " × " + people + " + " + left + " = " + (each * people + left) + ". Move the sliders to try other bills.", { k: each, phase: "share" });
      return f;
    }
    function tok(n, cls) { var s = ""; for (var i = 0; i < n; i++) s += '<i class="' + cls + '"></i>'; return s; }
    function onFrame(fr) {
      var each = Math.floor(bill / people), left = bill % people;
      var onTable = bill - fr.k * people;
      var leftCls = fr.phase === "left" || fr.phase === "share" ? "lo" : "";
      pot.innerHTML = '<div class="w2-ph">on the table · ' + onTable + "</div><div class=\"w2-toks\">" +
        tok(onTable - (fr.k === each ? left : 0), "") + (fr.k === each ? tok(left, leftCls) : "") + "</div>";
      if (cols.length !== people) {
        table.innerHTML = ""; cols = [];
        for (var p = 0; p < people; p++) {
          var c = h("div", "w2-person");
          table.appendChild(c); cols.push(c);
        }
      }
      var extra = fr.phase === "share" && left ? '<span class="w2-frac">+ ' + floatRepr(left / people) + "</span>" : "";
      cols.forEach(function (c, p) {
        c.innerHTML = '<div class="w2-ph">friend ' + (p + 1) + '</div><div class="w2-cnt"><b>' + fr.k + "</b>" + extra + '</div><div class="w2-toks">' + tok(fr.k, "g") + "</div>";
      });
    }
    var ct = U.CodeTrace(host, {
      code: code, build: build, onFrame: onFrame,
      fps: function (i, fr) { return fr[i] && fr[i].phase === "deal" && fr[i].k > 2 && fr[i + 1] && fr[i + 1].phase === "deal" ? 9 : 0.9; }
    });
    pot = h("div", "w2-pot"); table = h("div", "w2-people");
    ct.extra.appendChild(pot); ct.extra.appendChild(table);
    ct.load();
  }
  AAAnim.register("w2-split", split);

  /* ============================================================
     Task 5 — w2-badge: upper(), joining, and counting letters
     ============================================================ */
  function badge(host) {
    host.classList.add("w2-wide");
    U.title(host, "Animation · build the badge, count the letters");
    var opts = h("div", "anim-opts w2-opts");
    var fF = textIn("ada", "First name the user types", 10), fL = textIn("lovelace", "Surname the user types", 12);
    opts.appendChild(h("span", "lab", "First name:")); opts.appendChild(fF);
    opts.appendChild(h("span", "lab", "Surname:")); opts.appendChild(fL);
    opts.appendChild(btn("use", "", function () { ct.load(); }));
    host.appendChild(opts);
    [fF, fL].forEach(function (f) {
      f.addEventListener("change", function () { ct.load(); });
      f.addEventListener("keydown", function (e) { if (e.key === "Enter") ct.load(); });
    });
    var CODE = 'first = input("First name: ")\nlast = input("Surname: ")\n\n' +
      'full = first.upper() + " " + last.upper()\nletters = len(first) + len(last)\n\n' +
      'print(f"[ {full} ]")\nprint(f"{letters} letters in your name")';
    function chars(s) { return Array.from(s); }
    var row;
    function build() {
      var first = fF.value, last = fL.value, A = chars(first), B = chars(last);
      var f = [], vars = {}, out = [], nF = A.length, nL = B.length;
      function push(line, note, st) {
        f.push({ line: line, vars: copy(vars), out: out.slice(), note: note, st: st,
          counters: { "len(first)": st.cf == null ? "?" : st.cf, "len(last)": st.cl == null ? "?" : st.cl, letters: st.letters == null ? "?" : st.letters } });
      }
      var base = { up: false, space: false, cf: null, cl: null, letters: null, count: -1, len: false };
      function st(o) { var r = copy(base); Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
      push(0, "Predict first: how many letters will the badge report for the names above? Then press <strong>play</strong>.", st({ hideA: true, hideB: true }));
      out.push("First name: " + first); vars.first = show(S(first));
      push(1, "<code>first</code> holds the text " + esc(strRepr(first)) + ", exactly as typed.", st({ hideB: true }));
      out.push("Surname: " + last); vars.last = show(S(last));
      push(2, "<code>last</code> holds " + esc(strRepr(last)) + ".", st({}));
      push(4, "<code>.upper()</code> makes capital copies. The originals in <code>first</code> and <code>last</code> are not changed.", st({ up: true }));
      var full = first.toUpperCase() + " " + last.toUpperCase();
      vars.full = show(S(full));
      push(4, "Joining with <code>+</code> glues the pieces, with a space (<code>\" \"</code>) in the middle: " + esc(strRepr(full)) + ".", st({ up: true, space: true }));
      var i;
      for (i = 1; i <= nF; i++) push(5, "<code>len(first)</code> counts the characters of <code>first</code>: " + i + (i === nF ? "." : " …"), st({ up: true, space: true, count: i, cf: i }));
      if (!nF) push(5, "<code>first</code> is empty, so <code>len(first)</code> is 0.", st({ up: true, space: true, cf: 0 }));
      for (i = 1; i <= nL; i++) push(5, "<code>len(last)</code> counts the characters of <code>last</code>: " + i + (i === nL ? "." : " …"), st({ up: true, space: true, count: nF + i, cf: nF, cl: i }));
      if (!nL) push(5, "<code>last</code> is empty, so <code>len(last)</code> is 0.", st({ up: true, space: true, cf: nF, cl: 0 }));
      vars.letters = raw((nF + nL) + "  · int");
      push(5, nF + " + " + nL + " = <strong>" + (nF + nL) + "</strong>. The space was never counted, because it is in neither <code>first</code> nor <code>last</code>.",
        st({ up: true, space: true, count: nF + nL, cf: nF, cl: nL, letters: nF + nL }));
      out.push("[ " + full + " ]");
      push(7, "The badge line, with the f-string dropping <code>full</code> between the brackets.", st({ up: true, space: true, cf: nF, cl: nL, letters: nF + nL }));
      out.push((nF + nL) + " letters in your name");
      push(8, "And the count.", st({ up: true, space: true, cf: nF, cl: nL, letters: nF + nL }));
      var lf = chars(full).length;
      push(0, "What if we had written <code>len(full)</code>? It counts every character of " + esc(strRepr(full)) +
        " — <strong>including the space</strong> — and gives <strong>" + lf + "</strong>. The original names contain " + (nF + nL) + " code points; uppercasing can change the length (ß becomes SS). len counts code points, including any spaces typed into the name boxes.",
        st({ up: true, space: true, cf: nF, cl: nL, letters: nF + nL, len: true, count: lf }));
      return f;
    }
    function onFrame(fr) {
      var s = fr.st, A = chars(s.len ? fF.value.toUpperCase() : fF.value), B = chars(s.len ? fL.value.toUpperCase() : fL.value), html = "", k = 0;
      function tile(c, cls, label) {
        k++;
        var numbered = s.count >= k;
        return '<span class="w2-tile ' + cls + (numbered ? " counted" : "") + '">' + esc(c === " " ? "␣" : c) +
          (numbered ? "<small>" + k + "</small>" : "") + "</span>";
      }
      html += '<span class="w2-group"><span class="w2-gl">first</span>' + (s.hideA ? '<span class="w2-tile ghost">?</span>' :
        A.map(function (c) { return tile(s.up ? c.toUpperCase() : c, s.up ? "up" : ""); }).join("")) + "</span>";
      if (s.space) {
        if (s.len) html += '<span class="w2-group"><span class="w2-gl">" "</span>' + tile(" ", "sp bad") + "</span>";
        else html += '<span class="w2-group"><span class="w2-gl">" "</span><span class="w2-tile sp">␣</span></span>';
      }
      html += '<span class="w2-group"><span class="w2-gl">last</span>' + (s.hideB ? '<span class="w2-tile ghost">?</span>' :
        B.map(function (c) { return tile(s.up ? c.toUpperCase() : c, s.up ? "up" : ""); }).join("")) + "</span>";
      row.innerHTML = html;
    }
    var ct = U.CodeTrace(host, { code: CODE, build: build, onFrame: onFrame,
      fps: function (i, fr) { return fr[i] && fr[i].line === 5 && fr[i + 1] && fr[i + 1].line === 5 ? 2.6 : 0.9; } });
    row = h("div", "w2-tiles");
    ct.extra.appendChild(row);
    ct.load();
  }
  AAAnim.register("w2-badge", badge);

  /* ============================================================
     Task 6 — w2-bug: what kind is each side?
     ============================================================ */
  function bug(host) {
    var cur = "buggy", solved = false;
    U.title(host, "Animation · trace buggy.py and read the error");
    var opts = h("div", "anim-opts w2-opts");
    var vseg = U.seg("program", [["buggy", "buggy.py"], ["fixed", "fixed.py"]], cur, function (v) { cur = v; ct.load(); });
    opts.appendChild(vseg);
    var fN = textIn("12", "Number the user types", 5);
    opts.appendChild(h("span", "lab", "the user types")); opts.appendChild(fN);
    host.appendChild(opts);
    var fixedBtn = vseg.querySelectorAll("button")[1];
    fixedBtn.disabled = true; fixedBtn.title = "Answer the two questions below to unlock";
    fN.addEventListener("change", function () { ct.load(); });
    fN.addEventListener("keydown", function (e) { if (e.key === "Enter") ct.load(); });
    var FILES = { buggy: 'n = input("A number: ")\nprint(n + 5)', fixed: 'n = int(input("A number: "))\nprint(n + 5)' };

    var kinds;
    function build() {
      var src = lines(FILES[cur]), f = [], vars = {}, out = [], typed = fN.value;
      function push(line, note, ex) {
        var fr = { line: line, vars: copy(vars), out: out.slice(), note: note, kinds: null };
        if (ex) Object.keys(ex).forEach(function (k) { fr[k] = ex[k]; });
        f.push(fr);
      }
      push(0, cur === "buggy" ? "The program should add 5 to the number the user types. Press <strong>play</strong> and watch the kind of each value."
        : "The fixed program. Press <strong>play</strong> and compare the kinds with the buggy run.");
      out.push("A number: " + typed);
      var n;
      if (cur === "buggy") {
        n = S(typed);
        vars.n = show(n);
        push(1, "<code>input()</code> hands back text, so <code>n</code> is the <strong>str</strong> " + esc(strRepr(typed)) + " — even though it looks like a number.");
      } else {
        vars["input(…)"] = show(S(typed));
        push(1, "<code>input()</code> still returns text: " + esc(strRepr(typed)) + "…");
        delete vars["input(…)"];
        n = pyInt(typed);
        if (n.err) {
          out = out.concat(traceback("fixed.py", 1, src[0], n.err));
          push(1, "…but " + esc(strRepr(typed)) + " is not a whole number, so <code>int()</code> refuses with a <strong>ValueError</strong>. Type digits to see the fix work.", { err: 1, errOut: true });
          return f;
        }
        vars.n = show(n);
        push(1, "…and <code>int(...)</code> turns it into the <strong>int</strong> " + n.v + " before it is stored.");
      }
      push(2, "Before printing, Python works out <code>n + 5</code>. What kind is each side?", { kinds: { l: n, r: I(5), ok: n.t !== "str" } });
      if (n.t === "str") {
        out = out.concat(traceback("buggy.py", 2, src[1], 'TypeError: can only concatenate str (not "int") to str'));
        push(2, "A str on the left, an int on the right: Python will not glue a number onto text. It stops with a <strong>TypeError</strong> — read the last line of the traceback.",
          { err: 2, errOut: true, kinds: { l: n, r: I(5), ok: false }, quiz: true });
      } else {
        out.push(String(n.v + 5));
        push(2, "int + int is ordinary addition: <strong>" + (n.v + 5) + "</strong>. One word — <code>int</code> — made the difference.", { kinds: { l: n, r: I(5), ok: true } });
      }
      return f;
    }
    function onFrame(fr) {
      if (!fr.kinds) { kinds.innerHTML = ""; kinds.className = "w2-kinds"; }
      else {
        var k = fr.kinds;
        kinds.className = "w2-kinds " + (k.ok ? "ok" : "bad");
        kinds.innerHTML = '<span class="w2-kchip"><b>' + esc(repr(k.l)) + "</b><small>" + k.l.t + '</small></span><span class="w2-kop">+</span>' +
          '<span class="w2-kchip"><b>' + esc(repr(k.r)) + "</b><small>" + k.r.t + '</small></span><span class="w2-kres">' +
          (k.ok ? "&rarr; " + (k.l.v + k.r.v) : "&rarr; str + int ✗") + "</span>";
      }
      if (fr.quiz) quiz.classList.add("on");
    }
    var ct = U.CodeTrace(host, { code: function () { return FILES[cur]; }, build: build, onFrame: onFrame, fps: 0.75, outTitle: "screen" });
    kinds = h("div", "w2-kinds");
    ct.extra.appendChild(kinds);

    /* the two questions */
    var quiz = h("div", "w2-quiz");
    function ask(q, opts, onRight) {
      var box = h("div", "w2-q");
      box.appendChild(h("p", "", q));
      var r = h("div", "anim-opts w2-opts"), fb = h("p", "anim-msg");
      opts.forEach(function (o) {
        var b = btn(o[0], "", function () {
          if (o[1] === true) {
            r.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            b.className = "right"; fb.innerHTML = o[2]; onRight();
          } else { b.className = "wrong"; b.disabled = true; fb.innerHTML = o[2]; }
        });
        r.appendChild(b);
      });
      box.appendChild(r); box.appendChild(fb);
      quiz.appendChild(box);
      return box;
    }
    var q2;
    ask("Which error did it raise?", [
      ["SyntaxError", false, "No — the program is valid Python; it ran line 1 fine. The problem only appears when line 2 runs."],
      ["NameError", false, "No — <code>n</code> was defined on line 1, so Python knows the name."],
      ["TypeError", true, "Right: a <strong>TypeError</strong>. The kinds do not go together — <code>n</code> is text (str), 5 is a number (int)."],
      ["ValueError", false, "Not this time. A ValueError is when a conversion like <code>int(\"abc\")</code> fails — and nothing is converted here."]
    ], function () { q2.classList.add("on"); });
    q2 = ask("Which one-word change fixes it?", [
      ["str(5)", false, "That runs, but <code>n + str(5)</code> joins text: typing 12 prints <strong>125</strong>, not 17."],
      ["\"5\"", false, "Putting 5 in quotes makes both sides text: typing 12 prints <strong>125</strong>. Joined, not added."],
      ["int(input(…))", true, "Right: convert on the way in. <code>n</code> becomes a real number before the addition. The <strong>fixed.py</strong> button is now unlocked — run it."],
      ["float(n)", false, "That would work too (it prints 17.0), but it changes line 2, not the input — and gives a decimal. The one-word fix in the solution is <code>int</code> on line 1."]
    ], function () { solved = true; fixedBtn.disabled = false; fixedBtn.title = ""; });
    q2.classList.add("w2-q2");
    host.appendChild(quiz);
    ct.load();
  }
  AAAnim.register("w2-bug", bug);
})();
