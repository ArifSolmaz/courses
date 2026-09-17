"""Keep the PHY101 browser calendar and private solution releases in agreement.

Run with --write after editing calendar.json; run with --check to verify the
derived files and the weekly notebooks. Neither mode publishes anything.
"""
import argparse
from datetime import date, timedelta
import json
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
        assert week["notebook"] == f"notebooks/Week_{index + 1:02d}.ipynb"
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
    for module, info in calendar["extensions"].items():
        assert int(module) in calendar["extension_modules"], module
        assert (COURSE_ROOT / info["notebook"]).is_file(), info["notebook"]
    validate_lab_strand(calendar)
    validate_supplements(calendar)


def validate_lab_strand(calendar):
    """The Deney column of the departmental schedule is fixed; check it stayed fixed."""
    official = {
        2: "Laboratuvar Tanitimi", 3: "Olcme Cihazlari",
        4: "Bir Boyutta Hareket - Serbest Dusme", 5: "Egik Atis - Surtunme",
        9: "Bir Boyutta Carpisma", 10: "Kati Cisimlerin Donmesi",
        11: "Eylemsizlik Momenti - Basit Sarkac", 12: "Telafi",
    }
    fold = str.maketrans("ÇĞİÖŞÜçğıöşü", "CGIOSUcgiosu")
    scheduled = {}
    for week in calendar["weeks"]:
        lab = week.get("lab")
        if lab is None:
            continue
        scheduled[week["week"]] = lab["title_tr"].translate(fold)
        if lab["brief"] is not None:
            assert (COURSE_ROOT / lab["brief"]).is_file(), lab["brief"]
        covers = lab["covers_week"]
        assert covers is None or 1 <= covers <= week["week"], (
            "An experiment cannot measure physics that has not been taught yet"
        )
    assert scheduled == official, "The lab column must match the departmental schedule"
    assert calendar["lab_strand"]["sessions"] == len(official), "Session count out of step"
    assert calendar["lab_strand"]["make_up_week"] == 12
    assert (COURSE_ROOT / calendar["lab_strand"]["toolkit"]).is_file()
    assert calendar["assessment_constraint"]["common_exams"] is True
    assert calendar["assessment_constraint"]["fixed_sequence"] is True


def validate_supplements(calendar):
    for name, info in calendar["supplements"].items():
        assert (COURSE_ROOT / info["notebook"]).is_file(), info["notebook"]
        assert isinstance(info["examinable"], bool), name


def solution_calendar_note(calendar, module):
    main = [w for w in calendar["weeks"] if w["kind"] == "teaching" and module in w["modules"]]
    assignments = "; ".join(
        f'week {w["week"]:02d} ({w["start"]}–{w["end"]})' for w in main
    ) if main else "optional extension material; no scheduled teaching week"
    return f'''## Solution file {module:02d} and the teaching calendar

This file solves **Module {module:02d}, P1–P10**. Its filename is kept for stable links; the number identifies the solution file, not a calendar week. The weekly notebooks label every problem with this module number. Taught in: **{assignments}**. Public release: **{calendar['release_dates'][str(module)]}** (Europe/Istanbul).

**Türkçe:** Bu dosyanın numarası çözüm dosyasını gösterir. Haftalık nottaki “Module {module:02d} Pn” etiketini bu dosyadaki aynı problem numarasıyla eşleştir.
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
                "The 13 weekly notebooks include a review week and a midterm week.",
                "Week_XX_Python_Solutions filenames identify solution files (source modules), not calendar weeks.",
                "Module 06 spans weeks 05 and 08; module 09 spans 10 and 11; module 04 spans 03 and 04.",
                "Run courses/fall/phy101/tools/sync_calendar.py --write, then --check.",
            ]
        write_preserving_newlines(js_path, javascript)
        if private is not None:
            write_preserving_newlines(release_path, json.dumps(private, ensure_ascii=False, indent=2) + "\n")
            for module in range(1, 15):
                path = args.solutions_root / private["source_dir"] / private["filename"].format(n=module)
                book = json.loads(path.read_text(encoding="utf-8"))
                book["cells"] = [c for c in book["cells"] if c.get("id") != "solution-calendar-alignment"]
                book["cells"].insert(1, {"cell_type": "markdown", "id": "solution-calendar-alignment",
                    "metadata": {}, "source": solution_calendar_note(calendar, module).splitlines(keepends=True)})
                write_preserving_newlines(path, json.dumps(book, ensure_ascii=False, indent=1) + "\n")
        print("Updated the browser calendar." if args.public_only else "Updated browser calendar, release dates and solution labels. Nothing published.")
    else:
        assert js_path.read_text(encoding="utf-8") == javascript, "Browser calendar needs --write"
        for week in calendar["weeks"]:
            assert (COURSE_ROOT / week["notebook"]).is_file(), week["notebook"]
        if private is not None:
            assert private["releases"] == calendar["release_dates"], "Private releases need --write"
            for module in range(1, 15):
                path = args.solutions_root / private["source_dir"] / private["filename"].format(n=module)
                book = json.loads(path.read_text(encoding="utf-8"))
                notes = [c for c in book["cells"] if c.get("id") == "solution-calendar-alignment"]
                assert len(notes) == 1 and "".join(notes[0]["source"]) == solution_calendar_note(calendar, module), path
        print("13 weekly notebooks, extension notebooks and browser data agree." if args.public_only
              else "13 weekly notebooks, browser data and 14 release dates agree.")


if __name__ == "__main__":
    main()
