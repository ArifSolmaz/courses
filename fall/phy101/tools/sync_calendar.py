"""Keep the PHY101 browser calendar and private solution releases in agreement.

Run with --write after editing calendar.json; run with --check to verify all
derived files and dated weekly notebooks. Neither mode publishes anything.
"""
import argparse
from datetime import date, timedelta
import json
import re
from pathlib import Path

COURSE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOLUTIONS_ROOT = COURSE_ROOT.parent.parent.parent / "phy101-solutions"


def write_preserving_newlines(path, text):
    previous = path.read_bytes() if path.exists() else b""
    newline = "\r\n" if previous.count(b"\r\n") > previous.count(b"\n") / 2 else "\n"
    if previous == text.replace("\n", newline).encode("utf-8"):
        return
    path.write_text(text, encoding="utf-8", newline=newline)


def validate_calendar(calendar):
    weeks = calendar["weeks"]
    assert [w["week"] for w in weeks] == list(range(1, 14)), "Expected 13 calendar rows"
    assert [w["week"] for w in weeks if w["kind"] == "review"] == [6]
    assert [w["week"] for w in weeks if w["kind"] == "midterm"] == [7]
    assert len([w for w in weeks if w["kind"] == "teaching"]) == 11
    last_class = {}
    for index, week in enumerate(weeks):
        start, end = date.fromisoformat(week["start"]), date.fromisoformat(week["end"])
        assert start.weekday() == 0 and end == start + timedelta(days=4)
        assert start == date(2026, 9, 21) + timedelta(weeks=index)
        assert week["notebook"] == f"calendar/Week_{index + 1:02d}.ipynb"
        if week["kind"] == "midterm":
            assert week["session_date"] is None, "Do not invent an exact examination date"
        else:
            session = date.fromisoformat(week["session_date"])
            assert start <= session <= end and session.weekday() == 1
            if week["kind"] == "teaching":
                for module in week["modules"]:
                    last_class[module] = session
        assert all(1 <= m <= 14 for m in week["modules"] + week["support_modules"])
    term_end = date.fromisoformat(calendar["term_end"])
    expected = {
        str(module): min(last_class[module] + timedelta(days=7), term_end).isoformat()
        if module in last_class else term_end.isoformat()
        for module in range(1, 15)
    }
    assert calendar["release_dates"] == expected, "Releases must follow final core teaching use"
    assert set(calendar["extension_modules"]) == set(range(1, 15)) - set(last_class)


def solution_calendar_note(calendar, module):
    main = [w for w in calendar["weeks"] if w["kind"] == "teaching" and module in w["modules"]]
    assignments = "; ".join(
        f'calendar week {w["week"]:02d} ({w["start"]}–{w["end"]})' for w in main
    ) if main else "supporting / extension material; no separate scheduled teaching week"
    return f'''## Source module {module:02d} and the teaching calendar

This file solves **Module {module:02d}, P1–P10**. Its legacy filename is kept for stable links; the module number is not a calendar-week number. Main teaching use: **{assignments}**. Full-file public release: **{calendar['release_dates'][str(module)]}** (Europe/Istanbul).

Use the dated weekly notebooks in `courses/fall/phy101/calendar/` for teaching order. They label each source problem by its module and number.

**Türkçe:** Bu dosyanın numarası kaynak modülü gösterir. Takvim haftasındaki “Module {module:02d}, Pn” etiketini bu dosyadaki aynı problem numarasıyla eşleştir.
'''


def source_calendar_note(calendar, module):
    main = [w for w in calendar["weeks"] if w["kind"] == "teaching" and module in w["modules"]]
    supporting = [w for w in calendar["weeks"] if module in w["support_modules"]]
    links = lambda rows: "; ".join(
        f'[Calendar week {w["week"]:02d}: {w["title_en"]} — Open in Colab](https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/fall/phy101/{w["notebook"]})'
        for w in rows)
    use = "Main teaching lessons: " + links(main) if main else "This is supporting / extension material, with no separate calendar week."
    if supporting:
        use += "\n\nSupporting reading for: " + links(supporting)
    return f'''## Use the dated weekly lesson / Tarihli haftalık notu kullan

This is **source module {module:02d}**. Its legacy filename keeps problem and solution links stable. The number identifies the source module; use the dated lessons for teaching order.

{use}

Start with the [course calendar](https://arifsolmaz.github.io/courses/fall/phy101/web/PHY101_Course_Dashboard.html) for the scheduled lesson. Problems here keep the identifier **Module {module:02d}, Pn**, matching the complete solution collection.

**Türkçe:** Bu dosya konu kaynağıdır. Dersin tarihe göre düzenlenmiş akışı için yukarıdaki haftalık not bağlantısını kullan; çözüm ararken modül ve problem numarasını koru.
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    parser.add_argument("--solutions-root", type=Path, default=DEFAULT_SOLUTIONS_ROOT)
    parser.add_argument("--public-only", action="store_true", help="Update/check course files without opening the private solutions repository.")
    args = parser.parse_args()
    calendar = json.loads((COURSE_ROOT / "calendar.json").read_text(encoding="utf-8"))
    validate_calendar(calendar)
    javascript = "// Generated from ../calendar.json by tools/sync_calendar.py.\n"
    javascript += "window.PHY101_CALENDAR = " + json.dumps(calendar, ensure_ascii=False, indent=2) + ";\n"
    js_path = COURSE_ROOT / "web/phy101-calendar.js"
    release_path = args.solutions_root / "schedule.json"
    private = None if args.public_only else json.loads(release_path.read_text(encoding="utf-8"))
    if args.write:
        if private is not None:
            private["releases"] = calendar["release_dates"]
            private["_note"] = [
                "Derived from courses/fall/phy101/calendar.json; change that calendar first.",
                calendar["release_policy"],
                "The 13 dated weekly lessons include a review week and a midterm week.",
                "Legacy Week_XX_Python_Solutions filenames identify source modules, not calendar weeks.",
                "Module 06 spans calendar weeks 05 and 08; module 09 spans 10 and 11.",
                "Run courses/fall/phy101/tools/sync_calendar.py --write, then --check.",
            ]
        write_preserving_newlines(js_path, javascript)
        if private is not None:
            write_preserving_newlines(release_path, json.dumps(private, ensure_ascii=False, indent=2) + "\n")
        for module in range(1, 15):
            if private is not None:
                path = args.solutions_root / private["source_dir"] / private["filename"].format(n=module)
                book = json.loads(path.read_text(encoding="utf-8"))
                book["cells"] = [c for c in book["cells"] if c.get("id") != "solution-calendar-alignment"]
                book["cells"].insert(1, {"cell_type": "markdown", "id": "solution-calendar-alignment",
                    "metadata": {}, "source": solution_calendar_note(calendar, module).splitlines(keepends=True)})
                write_preserving_newlines(path, json.dumps(book, ensure_ascii=False, indent=1) + "\n")
            source_path = COURSE_ROOT / f"notebooks/Week_{module:02d}.ipynb"
            source_book = json.loads(source_path.read_text(encoding="utf-8"))
            source_book["cells"] = [c for c in source_book["cells"] if c.get("id") != "source-calendar-route"]
            first = source_book["cells"][0]
            if first["cell_type"] == "markdown":
                title = "".join(first["source"])
                title = re.sub(rf"^(#\s*)Week\s+0*{module}\b", rf"\1Source module {module:02d}", title)
                first["source"] = title.splitlines(keepends=True)
            route_index = 2 if len(source_book["cells"]) > 1 and source_book["cells"][1].get("id") == "phy101-reading-guide" else 1
            source_book["cells"].insert(route_index, {"cell_type": "markdown", "id": "source-calendar-route",
                "metadata": {}, "source": source_calendar_note(calendar, module).splitlines(keepends=True)})
            write_preserving_newlines(source_path, json.dumps(source_book, ensure_ascii=False, indent=1) + "\n")
        print("Updated public calendar and source labels." if args.public_only else "Updated browser calendar, release dates, and source/solution calendar labels. Nothing published.")
    else:
        assert js_path.read_text(encoding="utf-8") == javascript, "Browser calendar needs --write"
        if private is not None:
            assert private["releases"] == calendar["release_dates"], "Private releases need --write"
        for week in calendar["weeks"]:
            assert (COURSE_ROOT / week["notebook"]).is_file(), week["notebook"]
        for module in range(1, 15):
            if private is not None:
                path = args.solutions_root / private["source_dir"] / private["filename"].format(n=module)
                book = json.loads(path.read_text(encoding="utf-8"))
                notes = [c for c in book["cells"] if c.get("id") == "solution-calendar-alignment"]
                assert len(notes) == 1 and "".join(notes[0]["source"]) == solution_calendar_note(calendar, module), path
            source_path = COURSE_ROOT / f"notebooks/Week_{module:02d}.ipynb"
            source_book = json.loads(source_path.read_text(encoding="utf-8"))
            routes = [c for c in source_book["cells"] if c.get("id") == "source-calendar-route"]
            assert len(routes) == 1 and "".join(routes[0]["source"]) == source_calendar_note(calendar, module), source_path
        print("13 weekly lessons, browser data, and source labels agree." if args.public_only else "13 weekly lessons, review/midterm dates, browser data, and 14 release dates agree.")


if __name__ == "__main__":
    main()
