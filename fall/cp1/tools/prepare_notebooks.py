"""Keep CP1's shared self-study tools and navigation consistent.

Run after editing weekly content, then run sync_course.py. This script does not
write exercise answers into student notebooks or infer completion from history.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]

HELPER = '''#@title Study tools — run this cell once (the code is hidden; you do not need to read it)
# These small tools give local study feedback.
_checkpoint_results = {}

def check_answer(number, answer, expected, explanation):
    actual = str(answer).strip().lower().replace(" ", "")
    target = str(expected).strip().lower().replace(" ", "")
    correct = actual == target
    _checkpoint_results[int(number)] = ("Concept check", int(correct), 1)
    if correct:
        print(f"Checkpoint {number}: correct. {explanation}")
    elif not str(answer).strip():
        print(f"Checkpoint {number}: enter your prediction, then run again.")
    else:
        print(f"Checkpoint {number}: review the example and try again.")
    return correct

def record_checkpoint(number, checks):
    """Report each concrete concept check used by the introductory notebook."""
    passed = sum(bool(correct) for _, correct in checks)
    _checkpoint_results[int(number)] = ("Concept checks", passed, len(checks))
    print(f"Checkpoint {number}: {passed}/{len(checks)} concept checks match.")
    for label, correct in checks:
        print(("OK: " if correct else "Review: ") + label)
    return passed, len(checks)

def exercise_checkpoint(number, practiced, expected=8):
    """Summarize an explicit self-report; this does not grade your code."""
    if not isinstance(practiced, (list, tuple, set)):
        _checkpoint_results.pop(int(number), None)
        print("Use a list of exercise numbers, for example [1, 2].")
        return 0, expected
    if any(type(item) is not int or not 1 <= item <= expected for item in practiced):
        _checkpoint_results.pop(int(number), None)
        print(f"Use whole exercise numbers from 1 to {expected}.")
        return 0, expected
    done = set(practiced)
    _checkpoint_results[int(number)] = ("Practice self-report", len(done), expected)
    print(f"Practice self-report: {len(done)}/{expected} core exercises reviewed.")
    print("This is your reflection, not a correctness score or a grade.")
    remaining = [str(i) for i in range(1, expected + 1) if i not in done]
    if remaining:
        print("Still to review:", ", ".join(remaining))
    print("For each exercise: test the result, explain the steps, then compare with the worked solution.")
    return len(done), expected

def show_progress_summary():
    print("\\nMy study feedback (this runtime)")
    for number in range(1, 6):
        if number in _checkpoint_results:
            kind, count, total = _checkpoint_results[number]
            print(f"{number}. {kind}: {count}/{total}")
        else:
            print(f"{number}. Not run yet")
    print("These checks send no grading submission. Save your notebook to keep your work.")

print("Local study tools ready.")
'''


def source(cell):
    value = cell.get("source", "")
    return value if isinstance(value, str) else "".join(value)


def set_source(cell, value):
    cell["source"] = value if isinstance(cell.get("source"), str) else value.splitlines(keepends=True)


def save(path, nb):
    old = path.read_bytes()
    newline = "\r\n" if b"\r\n" in old else "\n"
    text = json.dumps(nb, ensure_ascii=False, indent=1) + "\n"
    path.write_bytes(text.replace("\n", newline).encode("utf-8"))


def prepare(path, week, solutions=False):
    nb = json.loads(path.read_text(encoding="utf-8"))
    role = "solutions" if solutions else "lesson"
    core = 10 if week == 14 else 8
    # Format 4.5 records stable cell IDs for reliable notebook navigation.
    nb["nbformat"] = 4
    nb["nbformat_minor"] = 5
    nb.setdefault("metadata", {}).setdefault("cp1", {}).update(week=week, kind=role, core_exercises=core)
    if not solutions:
        for cell in nb["cells"]:
            text = source(cell)
            if cell["cell_type"] == "code" and "def exercise_checkpoint(" in text:
                set_source(cell, HELPER)
                cell.setdefault("metadata", {}).setdefault("jupyter", {})["source_hidden"] = True
                cell["metadata"]["cp1"] = {"role": "study_tools"}
                cell["outputs"], cell["execution_count"] = [], None
            elif cell["cell_type"] == "code" and re.search(r"^exercise_checkpoint\(5", text, re.M):
                set_source(cell, f'''# Add an exercise number only after testing and explaining your own work.
# Example: [1, 2] records your reflection about Exercises 1 and 2.
# Türkçe: Bu liste öz değerlendirmedir; kodunuzun doğruluğunu otomatik ölçmez.
practiced_exercises = []
exercise_checkpoint(5, practiced_exercises, expected={core})
show_progress_summary()
''')
                cell.setdefault("metadata", {})["cp1"] = {"role": "practice_reflection"}
                cell["outputs"], cell["execution_count"] = [], None
            elif cell["cell_type"] == "markdown":
                text = text.replace("Run each completed code cell so Checkpoint 5 can count your local progress.",
                                    "At Checkpoint 5, list the exercises you have tested and can explain. This is a self-report, not automatic grading.")
                if "Five-Hour Class Roadmap" in text:
                    # Preserve each week's agenda while making the feedback claim precise.
                    text = re.sub(r"All feedback remains.*?Run the setup cell once, then run each checkpoint when you reach it\.",
                                  "Concept checkpoints compare your predictions with an expected answer. Checkpoint 5 is an explicit practice reflection, not a correctness score. No grading submission is sent by these tools. Save your notebook to keep your work.\n\nRun the setup cell once, then each checkpoint when you reach it.", text, flags=re.S)
                    text = re.sub(r"Checkpoints provide immediate feedback.*?optional extensions—not homework\.",
                                  f"Concept checkpoints compare your predictions with an expected answer. Checkpoint 5 is your practice reflection. No grading submission is sent by these tools. Save the notebook to keep your work. Exercises {core + 1} and above are optional extensions.", text, flags=re.S)
                if re.search(r"^###[^\n]*Checkpoint 5", text, re.M):
                    text = f'''---
### Checkpoint 5 of 5 — Practice reflection (target 04:45)

After Exercises 1–{core}, edit `practiced_exercises` in the next cell.
List only the exercise numbers whose results you have tested and whose steps you can explain.
Leave the list empty until you have done that work. This is your explicit self-report;
the tool does not inspect or grade your solution and does not count execution history.

**Türkçe:** Bu liste öz değerlendirmedir. Hücreyi çalıştırmak tek başına yeterli değildir;
sonucu kontrol et ve çözüm adımlarını açıklayabildiğinden emin ol.
'''
                set_source(cell, text)
        link = f'''## Worked solutions and study support

Try each problem first. Then compare your reasoning and test cases with the complete
[Week {week:02d} worked solutions](../solutions/Week_{week:02d}_Solutions.ipynb).
The solution notebook includes every core exercise, optional exercise, and this week's bridge when present.

If you are using Colab, [open the published solution notebook](https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/fall/cp1/solutions/Week_{week:02d}_Solutions.ipynb).
Open it in a separate runtime. Running a solution first should not supply hidden variables to your own work.

**Türkçe:** Önce kendi çözümünü dene. Sonra adımları ve testleri karşılaştır; çözümü kapatıp farklı bir örneği kendin çöz.

[Simple course guide](../STUDY_GUIDE.md) · [All worked solutions](../solutions/README.md)
'''
        cell = next((c for c in nb["cells"] if c.get("metadata", {}).get("cp1", {}).get("role") == "solution_links"), None)
        if cell is None:
            cell = {"cell_type": "markdown", "metadata": {"cp1": {"role": "solution_links"}}, "source": ""}
            nb["cells"].append(cell)
        set_source(cell, link)
    else:
        guide = '''## Reading the worked solutions

Each section gives the problem, a plan, Python code, and an expected result or checks.
Try your own answer first. After comparing, close this notebook and solve a changed example.

An `assert condition` line checks that a result matches an expectation. If the condition is false,
Python raises `AssertionError`; it means that check failed. For decimal calculations, a check such
as `abs(actual - expected) < 0.001` allows a small rounding difference.

Some examples run several small test cases. A pair `(input_value, expected_result)` keeps an input
beside its expected answer. In `for value, expected in cases`, Python takes the two parts of each
pair and gives them those names. Follow the calculation inside the loop for one case at a time.

**Türkçe:** `assert`, beklenen sonuç ile gerçek sonucu karşılaştırır. Test başarısızsa önce girdiyi
ve ara değerleri incele. Birden fazla örnek varsa önce yalnızca bir örneğin adımlarını takip et.

File examples create sample files in the current runtime folder. Use a separate runtime for your
own practice so the worked answers do not supply hidden variables to it.
'''
        guide += f"\n[Week {week:02d} lesson](../notebooks/Week_{week:02d}.ipynb) · [All solutions](README.md) · [Course guide](../STUDY_GUIDE.md)\n"
        cell = next((c for c in nb["cells"] if c.get("metadata", {}).get("cp1", {}).get("role") == "solution_reading_guide"), None)
        if cell is None:
            cell = {"cell_type": "markdown", "metadata": {"cp1": {"role": "solution_reading_guide"}}, "source": ""}
            nb["cells"].insert(1, cell)
        set_source(cell, guide)
    seen = set()
    for i, cell in enumerate(nb["cells"]):
        candidate = cell.get("id") or f"cp1-w{week:02d}-{role}-{i:03d}"
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", candidate):
            candidate = f"cp1-w{week:02d}-{role}-{i:03d}"
        suffix = 0
        while candidate in seen:
            suffix += 1
            candidate = f"cp1-w{week:02d}-{role}-{i:03d}-{suffix}"
        cell["id"] = candidate
        seen.add(candidate)
        cell.setdefault("metadata", {})["id"] = candidate
        if not solutions and cell["cell_type"] == "code":
            match = re.search(r"^\s*#\s*✏️\s*\[EX(\d+)\]", source(cell), re.M)
            if match:
                number = int(match.group(1))
                cell["metadata"].setdefault("cp1", {}).update(exercise_id=f"EX{number:02d}", core=number <= core)
    save(path, nb)


if __name__ == "__main__":
    for week in range(1, 15):
        prepare(ROOT / "notebooks" / f"Week_{week:02d}.ipynb", week)
        solution = ROOT / "solutions" / f"Week_{week:02d}_Solutions.ipynb"
        if not solution.exists():
            raise FileNotFoundError(solution)
        prepare(solution, week, solutions=True)
    print("Prepared 14 lesson notebooks and 14 solution notebooks.")
