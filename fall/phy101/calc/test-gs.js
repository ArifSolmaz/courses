/* Run the Apps Script's doGet() against a fake Google environment, because
   debugging it inside the script editor means print statements and guessing. */
const fs = require("fs");

let out = null;
global.ContentService = {
  MimeType: { JAVASCRIPT: "js", JSON: "json" },
  createTextOutput: (t) => ({ _t: t, _m: null, setMimeType(m) { this._m = m; out = this; return this; } })
};
let SHEET = [];
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({ getSheets: () => [{ getDataRange: () => ({ getValues: () => SHEET }) }] })
};

eval(fs.readFileSync("apps-script.gs", "utf8"));

let fails = 0, n = 0;
function ok(c, what, extra) { n++; if (!c) { fails++; console.log("  FAIL " + what + (extra ? "  <- " + extra : "")); } }
function call(params) {
  out = null;
  const res = doGet({ parameter: params });
  const text = (res && res._t) || (out && out._t) || "";
  const body = params.callback ? text.replace(/^[^(]*\(/, "").replace(/\);?$/, "") : text;
  return { raw: text, mime: (res && res._m) || (out && out._m), data: JSON.parse(body) };
}

SHEET = [
  ["Timestamp", "Öğrenci No / Student ID", "Kod / Code", "Cevap / Answer"],
  ["9/18/2026 14:52:16", 1111, 9208, "15.7"],
  ["9/18/2026 14:52:36", 2222, 9208, "999"],
  ["9/18/2026 14:53:00", 3333, 9208, "15,7"],
  ["9/18/2026 15:10:00", 4444, 1234, "42"],          // another round
  ["9/18/2026 15:11:00", 1111, 9208, "15.7"],        // duplicate, later
  ["9/18/2026 15:12:00", "",   9208, "77"]           // blank id
];

console.log("Apps Script doGet()");
let r = call({ code: "9208" });
ok(r.data.ok === true, "returns ok for a valid code", JSON.stringify(r.data).slice(0,80));
ok(r.data.rows.length === 4, "four rows for 9208 - blank dropped, the repeat KEPT for the console to judge", r.data.rows.length);
ok(r.data.rows.filter(x => x.id === "1111").length === 2, "a student's second submission is returned, not silently dropped");
ok(r.data.rows.every(x => x.id && x.ans !== undefined), "each row has id and answer");
ok(!r.data.rows.some(x => String(x.id) === "4444"), "the other round's row is not included");
ok(JSON.stringify(r.data.rows[0]) === JSON.stringify({ts:"9/18/2026 14:52:16",id:"1111",ans:"15.7"}),
   "row shape is exactly ts/id/ans - no extra columns leak", JSON.stringify(r.data.rows[0]));

r = call({ code: "1234" });
ok(r.data.rows.length === 1 && r.data.rows[0].id === "4444", "a different code returns only its own row");

r = call({});
ok(r.data.ok === false, "no code -> refused, so the whole term cannot be pulled", JSON.stringify(r.data));
r = call({ code: "12" });
ok(r.data.ok === false, "a short code is refused");
r = call({ code: "abcd" });
ok(r.data.ok === false, "a non-numeric code is refused");

r = call({ code: "9208", callback: "cb7" });
ok(/^cb7\(/.test(r.raw) && /\);?$/.test(r.raw), "JSONP wraps the payload in the callback", r.raw.slice(0,20));
ok(r.mime === "js", "and is served as JavaScript", r.mime);
r = call({ code: "9208", callback: "alert(1)//" });
ok(/^alert1\(/.test(r.raw), "a hostile callback name is stripped to safe characters", r.raw.slice(0,24));

/* Turkish headings, and a sheet whose columns are in a different order */
SHEET = [["Cevap", "Kod", "Zaman", "Ogrenci No"], ["15.7", 9208, "t1", 5555]];
r = call({ code: "9208" });
ok(r.data.rows.length === 1 && r.data.rows[0].id === "5555" && r.data.rows[0].ans === "15.7",
   "columns are found by heading, in any order", JSON.stringify(r.data.rows));

/* a sheet with no usable headings must say so, not return nonsense */
SHEET = [["a", "b", "c"], [1, 2, 3]];
r = call({ code: "9208" });
ok(r.data.ok === false && /column/.test(r.data.error), "unusable headings are reported", JSON.stringify(r.data));

/* an empty sheet */
SHEET = [];
r = call({ code: "9208" });
ok(r.data.ok === true && r.data.rows.length === 0, "an empty sheet is not an error");

/* the shared key, when set */
SHEET = [["Timestamp","No","Kod","Cevap"],["t",1111,9208,"15.7"]];
SHARED_KEY = "hunter2";
ok(call({ code: "9208" }).data.ok === false, "with a key set, a request without it is refused");
ok(call({ code: "9208", key: "wrong" }).data.ok === false, "and a wrong key is refused");
ok(call({ code: "9208", key: "hunter2" }).data.ok === true, "the right key works");
SHARED_KEY = "";

console.log(fails ? "\nFAILED " + fails + " of " + n : "\nall " + n + " checks passed");
process.exit(fails ? 1 : 0);
