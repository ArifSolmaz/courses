"""Generate CP1 navigation and workload summaries from the actual notebooks.

Run prepare_notebooks.py first. No external service or package is required.
"""
from pathlib import Path
import html
import json
import re
from render_experiences import LESSONS, render as render_experiences

ROOT = Path(__file__).resolve().parents[1]
COLAB = "https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/fall/cp1/"


def source(cell):
    value = cell.get("source", "")
    return value if isinstance(value, str) else "".join(value)


def plain(value):
    return re.sub(r"[*`#]", "", value).strip()


def inline(value):
    value = html.escape(value)
    value = re.sub(r"`([^`]+)`", r"<code>\1</code>", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", value)
    return value


def write(path, value):
    newline = "\r\n" if path.exists() and b"\r\n" in path.read_bytes() else "\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(value.replace("\r\n", "\n").replace("\n", newline).encode("utf-8"))


def load_week(week):
    name = f"Week_{week:02d}"
    nb = json.loads((ROOT / "notebooks" / f"{name}.ipynb").read_text(encoding="utf-8"))
    solution = ROOT / "solutions" / f"{name}_Solutions.ipynb"
    sol = json.loads(solution.read_text(encoding="utf-8"))
    cells = nb["cells"]
    text = [source(c) for c in cells]
    title = re.sub(r"^#\s*Week\s*\d+:\s*", "", text[0].splitlines()[0])
    title = re.split(r"\s+—\s+PHASE", title)[0].strip()
    core = nb["metadata"]["cp1"]["core_exercises"]
    objectives = []
    for i, value in enumerate(text):
        if cells[i]["cell_type"] == "markdown" and "Learning Objectives" in value:
            objectives = [re.sub(r"^\s*(?:[-*]|\d+\.)\s+", "", line) for line in value.splitlines()
                          if re.match(r"^\s*(?:[-*]|\d+\.)\s+", line)]
            break
    lessons = []
    for c, value in zip(cells, text):
        if c["cell_type"] == "markdown":
            for m in re.finditer(r"^##\s+Part\s+\d+[^\n]*", value, re.M):
                lessons.append(plain(m.group()))
    exercises = []
    for i, cell in enumerate(cells):
        ex_id = cell.get("metadata", {}).get("cp1", {}).get("exercise_id")
        if not ex_id:
            continue
        number = int(ex_id[2:])
        title_match = None
        for j in range(i - 1, -1, -1):
            if cells[j]["cell_type"] != "markdown":
                continue
            matches = list(re.finditer(rf"^###\s+Exercise\s+{number}\s*:\s*(.+)$", text[j], re.M))
            if matches:
                title_match = matches[-1].group(1)
                break
            if i - j > 6:
                break
        if title_match is None and week == 14 and number == 1:
            title_match = "Create and inspect the sample dataset (provided setup)"
        if title_match is None:
            raise ValueError(f"Missing exercise title: {name} {ex_id}")
        exercises.append({"id": ex_id, "number": number, "title": plain(title_match), "core": number <= core})
    covered = {c.get("metadata", {}).get("cp1", {}).get("solution_for") for c in sol["cells"]
               if c["cell_type"] == "markdown"}
    expected = {ex["id"] for ex in exercises}
    if week < 14:
        expected.add("BRIDGE")
    if expected - covered:
        raise ValueError(f"Missing solution sections {name}: {sorted(expected - covered)}")
    if len(exercises) != (15 if week == 1 else 12):
        raise ValueError(f"Unexpected exercise coverage {name}: {len(exercises)}")
    # Keep Python as literal text in static HTML: no JS template escape layer.
    candidates = [(i, value) for i, value in enumerate(text) if cells[i]["cell_type"] == "code"
                  and 40 <= len(value) <= 1300 and not any(marker in value for marker in
                  ("check_answer(", "exercise_checkpoint(", "[EX", "input(", "%%", "_checkpoint_results"))]
    if week == 13:
        candidates = [(i, value) for i, value in candidates if 'open("output.txt", "w")' in value or "open('output.txt', 'w')" in value] or candidates
    snippet = candidates[0][1] if candidates else ""
    return {"week": week, "title": plain(title), "objectives": objectives, "lessons": lessons,
            "exercises": exercises, "core": core, "optional": len(exercises) - core,
            "bridge": week < 14, "notebook": f"notebooks/{name}.ipynb",
            "solutions": f"solutions/{name}_Solutions.ipynb", "snippet": snippet}


def panel(week):
    n = week["week"]
    lesson = LESSONS[n - 1]
    rows = ''.join(f'<tr><td>{ex["id"]}</td><td>{html.escape(ex["title"])}</td><td>{"Core" if ex["core"] else "Optional"}</td></tr>' for ex in week["exercises"])
    return f'''<section class="week-panel{' active' if n == 1 else ''}" id="week-{n}" aria-labelledby="heading-{n}">
<p class="eyebrow">Week {n:02d} · {html.escape(lesson['strand'])}</p>
<h2 class="week-heading" id="heading-{n}">{html.escape(lesson['title'])}</h2>
<p class="subtitle">{html.escape(lesson['question'])}</p>
<p>{html.escape(lesson['subtitle'])}</p>
<a class="button" href="Week_{n:02d}.html">Start Week {n:02d} →</a>
<p class="study-note">The lesson takes you through Understand → Investigate → Check. Open Colab when you reach the experiment.</p>
<details class="path-resources"><summary>Notebook, solutions &amp; practice reference</summary><div>
<p>Python tools: {inline(week['title'])}. {week['core']} core / {week['optional']} optional exercises. Weekly notebooks are private practice.</p>
<a href="{COLAB + week['notebook']}" target="_blank" rel="noopener">Lesson in Colab</a>
<a href="../{week['notebook']}" download>Download notebook</a>
<a href="{COLAB + week['solutions']}" target="_blank" rel="noopener">Worked solutions in Colab</a>
<a href="../{week['solutions']}" download>Download solutions</a>
<details><summary>Exercise list</summary><div class="table-scroll"><table class="exercise-table"><thead><tr><th>ID</th><th>Notebook exercise</th><th>Role</th></tr></thead><tbody>{rows}</tbody></table></div></details>
</div></details></section>'''


def sync():
    weeks = [load_week(n) for n in range(1, 15)]
    render_experiences(weeks, write)
    for w in weeks:
        w["experience"] = f"web/Week_{w['week']:02d}.html"
        w["engineering_title"] = LESSONS[w["week"] - 1]["title"]
    manifest = {"course": "CP1", "weeks": weeks, "calendar_status": "Official dated CP1 timetable not supplied",
                "assessment": {"midterm": 25, "final": 50, "demonstration": 25}}
    write(ROOT / "course_manifest.json", json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    template = (ROOT / "tools" / "templates" / "dashboard.html").read_text(encoding="utf-8")
    nav = ''.join(f'<option value="{w["week"]}">Week {w["week"]:02d} · {html.escape(LESSONS[w["week"]-1]["title"])}</option>' for w in weeks)
    dashboard = template.replace("<!-- CP1:NAV -->", nav).replace("<!-- CP1:PANELS -->", "\n".join(panel(w) for w in weeks))
    write(ROOT / "web" / "CP1_Course_Dashboard.html", dashboard)
    table = "| Week | HTML experience | Lesson notebook | Worked solutions | Core / optional |\n|---|---|---|---|---|\n"
    for w in weeks:
        table += f'| {w["week"]:02d} | [{w["engineering_title"]}]({w["experience"]}) | [{w["title"]}]({w["notebook"]}) | [Complete solutions]({w["solutions"]}) | {w["core"]} / {w["optional"]} |\n'
    outline = (ROOT / "content.md").read_text(encoding="utf-8")
    block = "<!-- BEGIN CP1 GENERATED INDEX -->\n" + table + "<!-- END CP1 GENERATED INDEX -->"
    if "<!-- BEGIN CP1 GENERATED INDEX -->" in outline:
        outline = re.sub(r"<!-- BEGIN CP1 GENERATED INDEX -->.*?<!-- END CP1 GENERATED INDEX -->", lambda _: block, outline, flags=re.S)
    else:
        outline = outline.replace("## 14-Week Topic Plan (CP1)", block + "\n\n## 14-Week Topic Plan (CP1)")
    for w in weeks:
        pattern = rf"(### Week {w['week']:02d}\b.*?)(?=### Week|\Z)"
        def replace_count(match):
            value = match.group(1)
            bridge = f" + bridge walkthrough to Week {w['week'] + 1:02d}" if w["week"] < 14 else "; the two bonuses are included in the optional count"
            line = f"- {len(w['exercises'])} exercises: {w['core']} core + {w['optional']} optional{bridge}"
            return re.sub(r"^- \d+ (?:exercises|guided project steps)[^\n]*", lambda _: line, value, flags=re.M)
        outline = re.sub(pattern, replace_count, outline, flags=re.S)
    write(ROOT / "content.md", outline)
    index = "# CP1 worked solutions\n\nTry each problem first; use these companions to compare reasoning, inspect tests and retry with different values. Every core exercise, optional exercise and bridge/preview in Weeks 1–13 is included. Week 14 contains the complete tested sensor pipeline.\n\n**Türkçe:** Önce kendi çözümünü dene; sonra adımları ve testleri karşılaştır. Çözümü kapatıp değişik değerlerle yeniden çöz.\n\nOpen a solution in a separate runtime. These are private-practice learning aids, not work to submit as your own assessed demonstration. The numbered `EX` labels match the lesson notebooks. `BRIDGE` marks a transition walkthrough.\n\n"
    index += table.replace("](web/", "](../web/").replace("](notebooks/", "](../notebooks/").replace("](solutions/", "](")
    index += "\nEach notebook is self-contained and uses fixed demonstration inputs so it can run from top to bottom. File examples write sample files in the current runtime folder. Read the problem and assumptions before running.\n\n[Simple course guide](../STUDY_GUIDE.md) · [Dashboard](../web/CP1_Course_Dashboard.html)\n"
    write(ROOT / "solutions" / "README.md", index)
    syllabus = (ROOT / "web" / "CP1_Syllabus.html").read_text(encoding="utf-8")
    rows = []
    for w in weeks:
        goals = "; ".join(w["objectives"][:3])
        rows.append(f'<tr><td class="week-num-cell">{w["week"]:02d}</td><td><div class="topic-title">{inline(w["title"])}</div><small>{w["core"]} core / {w["optional"]} optional</small></td><td class="topic-items">{inline(goals)}</td><td><a class="nb-link" href="Week_{w["week"]:02d}.html">HTML experience</a><br><a class="nb-link" href="../{w["notebook"]}" download>Lesson notebook</a><br><a class="nb-link" href="../{w["solutions"]}" download>Worked solutions</a></td></tr>')
    pattern = r'(<table class="schedule-table">.*?<tbody>).*?(</tbody>)'
    syllabus, count = re.subn(pattern, lambda m: m.group(1) + "\n" + "\n".join(rows) + "\n" + m.group(2), syllabus, count=1, flags=re.S)
    if count != 1:
        raise ValueError("Syllabus schedule table not found")
    write(ROOT / "web" / "CP1_Syllabus.html", syllabus)
    print(f"Synchronized 14 weeks, {sum(len(w['exercises']) for w in weeks)} exercises, and all solution links.")


if __name__ == "__main__":
    sync()
