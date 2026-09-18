/**
 * PHY101 — Calculator Challenge: live results endpoint
 * ---------------------------------------------------------------------------
 * Paste this into the response sheet's own script editor (Extensions →
 * Apps Script), then deploy it once as a Web app. The console calls it during
 * a round and marks the answers by itself, so there is no copy-and-paste.
 *
 * WHAT IT GIVES OUT, and nothing else:
 *   - only the rows whose code matches the one asked for (no code, no data)
 *   - only three fields per row: student number, code, answer, plus the
 *     timestamp used for the speed bonus
 *   - never a name, never an email, never another round
 *
 * The deployment URL is the key to this data. Keep it as you would a
 * password: it goes in the console's Settings on your own machine and
 * nowhere else. Do not put it on a slide, in the repo, or in an email.
 * If it leaks, Deploy → Manage deployments → Archive, and deploy again for
 * a fresh URL.
 *
 * SETUP is in README §7. It takes about five minutes, once, for the term.
 */

/* Optional. Leave "" for none. If you set it, put the same word in the
   console's Settings; requests without it are refused. It is a second lock on
   the same door - the URL is already secret - so it mainly buys you the
   ability to change the key without redeploying. */
var SHARED_KEY = "";

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cb = String(p.callback || "").replace(/[^A-Za-z0-9_.]/g, "");

  function reply(obj) {
    var json = JSON.stringify(obj);
    if (cb) {
      /* JSONP: the console is a static page on another origin (or a file on
         disk), and a script tag is the one request that always works from
         both without any CORS configuration. */
      return ContentService.createTextOutput(cb + "(" + json + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json)
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    if (SHARED_KEY && String(p.key || "") !== SHARED_KEY) {
      return reply({ ok: false, error: "bad key" });
    }

    /* A code is required. Without one this returns nothing at all, so the
       endpoint can never be used to pull the whole term. */
    var code = String(p.code || "").replace(/[^0-9]/g, "");
    if (!/^[0-9]{4}$/.test(code)) {
      return reply({ ok: false, error: "a four-digit code is required" });
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var values = sheet.getDataRange().getValues();
    if (!values.length) return reply({ ok: true, code: code, rows: [] });

    var head = values[0].map(function (h) { return String(h).toLowerCase(); });
    var col = function (needles) {
      for (var i = 0; i < head.length; i++) {
        for (var j = 0; j < needles.length; j++) {
          if (head[i].indexOf(needles[j]) >= 0) return i;
        }
      }
      return -1;
    };
    var iTs  = col(["timestamp", "zaman"]);
    var iId  = col(["student", "öğrenci", "ogrenci", "number", "no"]);
    var iCd  = col(["code", "kod"]);
    var iAns = col(["answer", "cevap", "sonuç", "sonuc"]);

    if (iId < 0 || iCd < 0 || iAns < 0) {
      return reply({ ok: false,
        error: "could not find the student / code / answer columns",
        headings: values[0].map(String) });
    }

    /* EVERY matching row, including a student's repeat submissions. Which
       attempt counts is a teaching decision, so the console decides it in one
       place rather than this script quietly dropping rows first. */
    var rows = [];
    for (var r = 1; r < values.length; r++) {
      var rowCode = String(values[r][iCd]).replace(/[^0-9]/g, "");
      if (rowCode !== code) continue;
      var id = String(values[r][iId]).trim();
      if (!id) continue;
      rows.push({
        ts: iTs >= 0 ? String(values[r][iTs]) : "",
        id: id,
        ans: String(values[r][iAns])
      });
    }
    return reply({ ok: true, code: code, rows: rows, n: rows.length });

  } catch (err) {
    return reply({ ok: false, error: String(err && err.message || err) });
  }
}
