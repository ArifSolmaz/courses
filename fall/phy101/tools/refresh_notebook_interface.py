"""Apply the shared, self-contained physics notebook interface.

Usage: python fall/phy101/tools/refresh_notebook_interface.py [notebook ...]
Only code/layout and the labelled reading guide are maintained here. Physics
explanations, worked examples, problem statements, and solutions are preserved.
"""
from pathlib import Path
import ast
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HELPER_ID = "phy101-widget-layout"
GUIDE_ID = "phy101-reading-guide"
GUIDE = """## How to use these physics notes / Bu notları nasıl kullanmalı?

**Notes edition: 11 September 2026 — typeset equations and worked explanations.**

**Read the physics and the worked algebra first.** Draw the system, choose a law,
rearrange the equation, substitute values with units, and check the answer.
You can solve the problems on paper; writing Python is not a learning requirement.

**Use a demonstration as a check:** run Setup and the layout cell once, then run
the demo you want. Predict what will change before moving a slider. Release the
slider to update; controls stay beside the result while the plot area scrolls.
On a narrow screen the controls stack above a shorter plot pane.

Long plotting code is collapsed. In Colab it appears as a labelled run cell;
open its source only if you want to inspect the implementation. Animations have
their own play/pause buttons and use sampled display frames; calculations keep the
original data. An exported or GitHub preview cannot run Python
sliders: open the notebook in Colab/Jupyter and run the cells for live controls.

**Türkçe:** Önce şekil → fizik ilkesi → denklem → cebirsel işlem → birimli sonuç.
Python yazmak zorunda değilsin. Grafikte ne değişeceğini tahmin et, kaydırıcıyı
değiştirip bırak ve sonucu yorumla. Bir şekil büyükse sonuç alanını kaydır;
kontroller aynı panelde kalır.
"""


def lines(text):
    return text.splitlines(keepends=True)


def compact_animations(source):
    if "FuncAnimation(" not in source or "physics_frames(" in source:
        return source
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return source  # setup cells may contain IPython magics
    source_lines = source.splitlines(keepends=True)
    def offset(line, column):
        return sum(map(len, source_lines[:line - 1])) + len(source_lines[line - 1].encode("utf-8")[:column].decode("utf-8"))
    edits = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        name = node.func.attr if isinstance(node.func, ast.Attribute) else getattr(node.func, "id", "")
        if name != "FuncAnimation":
            continue
        keywords = {keyword.arg: keyword.value for keyword in node.keywords}
        if "frames" not in keywords or "interval" not in keywords:
            continue
        frames = ast.get_source_segment(source, keywords["frames"])
        interval = ast.get_source_segment(source, keywords["interval"])
        for value, replacement in [(keywords["frames"], f"physics_frames({frames})"),
                                   (keywords["interval"], f"physics_interval({frames}, {interval})")]:
            edits.append((offset(value.lineno, value.col_offset), offset(value.end_lineno, value.end_col_offset), replacement))
    for start, end, replacement in sorted(edits, reverse=True):
        source = source[:start] + replacement + source[end:]
    return source


def refresh(path):
    raw = path.read_bytes()
    newline = "\r\n" if raw.count(b"\r\n") > raw.count(b"\n") / 2 else "\n"
    notebook = json.loads(path.read_text(encoding="utf-8"))
    cells = [c for c in notebook["cells"] if c.get("id") not in {HELPER_ID, GUIDE_ID}]
    helper = Path(__file__).with_name("physics_widgets.py").read_text(encoding="utf-8")
    added_helper = False
    rebuilt = []
    for cell in cells:
        source = "".join(cell["source"])
        if cell["cell_type"] == "code":
            if "# Run once. This pulse" in source:
                continue
            if re.search(r"checkpoint_\d+_response\s*=", source):
                cell = {"cell_type": "markdown", "metadata": {},
                        "id": cell.get("id", "checkpoint-" + str(len(rebuilt))),
                        "source": lines("**Your explanation / Açıklaman:** Write or discuss your reasoning in words, with an equation or sketch where useful.\n")}
            elif "Your solution here" in source:
                cell = {"cell_type": "markdown", "metadata": {},
                        "id": cell.get("id", "reasoning-" + str(len(rebuilt))),
                        "source": lines("**Your working / Çözümün:** Givens and units → diagram → principle → algebra → substitution → answer and sense check. Use paper or add a text cell.\n")}
            else:
                source = re.sub(r"(?<![\w.])(?:widgets\.)?interact(?=\()", "physics_interact", source)
                source = re.sub(r"HTML\((\w+)\.to_jshtml\(\)\)", r"physics_animation_html(\1)", source)
                source = compact_animations(source)
                source = source.replace(
                    "display(widgets.VBox([widgets.HBox([v0_slider, angle_slider, launch_btn]), output]))",
                    "display(physics_panel([v0_slider, angle_slider, launch_btn], output))")
                source = source.replace(
                    "display(widgets.VBox([widgets.HBox([angle_game, fire_btn, new_btn]), game_out]))",
                    "display(physics_panel([angle_game, fire_btn, new_btn], game_out))")
                source = source.replace(
                    "display(widgets.VBox([\n    widgets.HBox([theta_w, mass_w]),\n    widgets.HBox([mus_w, muk_w, run_btn]),\n    incline_out\n]))",
                    "display(physics_panel([theta_w, mass_w, mus_w, muk_w, run_btn], incline_out))")
                source = source.replace(
                    "display(widgets.VBox([widgets.HBox([m1_w, m2_w, atwood_btn]), atwood_out]))",
                    "display(physics_panel([m1_w, m2_w, atwood_btn], atwood_out))")
                # The car example estimates the natural-frequency match, not the
                # exact damped resonance peak for every type of road forcing.
                if path.stem == "Week_12" and "maximum amplitude" in source:
                    source = source.replace("maximum amplitude", "near the natural-frequency match (estimate)")
                if not source.startswith("#@title"):
                    if "import " in source and len(source.splitlines()) < 35:
                        title = "Run once — prepare the physics demonstrations"
                    elif "physics_interact(" in source or "physics_panel(" in source:
                        title = "Run the demonstration — predict, adjust, observe"
                    elif "Animation" in source or "to_jshtml" in source:
                        title = "Run the animation — observe the physical motion"
                    else:
                        title = "Optional numerical check — the algebra is explained above"
                    source = "#@title " + title + "\n" + source
                cell["source"] = lines(source)
                cell["execution_count"] = None
                cell["outputs"] = []
                cell.setdefault("metadata", {}).update({"cellView": "form", "jupyter": {"source_hidden": True}})
                cell["metadata"]["tags"] = list(dict.fromkeys(cell["metadata"].get("tags", []) + ["hide-input"]))
        rebuilt.append(cell)
        if cell["cell_type"] == "code" and not added_helper and re.search(r"(?:import ipywidgets|from ipywidgets import)", source):
            rebuilt.append({"cell_type": "code", "id": HELPER_ID,
                "metadata": {"cellView": "form", "jupyter": {"source_hidden": True}, "tags": ["hide-input"]},
                "source": lines("#@title Run once — keep controls beside figures\n" + helper),
                "execution_count": None, "outputs": []})
            added_helper = True
    if not added_helper:
        raise ValueError(f"No widget import/setup found in {path}")
    colab_url = "https://colab.research.google.com/github/ArifSolmaz/courses/blob/main/fall/phy101/" + path.resolve().relative_to(ROOT).as_posix()
    opening = f"[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)]({colab_url})\n\n[Open this notebook in Colab / Bu notu Colab’da aç]({colab_url})\n\n"
    rebuilt.insert(1, {"cell_type": "markdown", "id": GUIDE_ID, "metadata": {}, "source": lines(opening + GUIDE)})
    # v4.5 is the first notebook schema with stable cell IDs. Some original
    # notebooks are v4.2, so adding IDs also needs this explicit minor upgrade.
    notebook["nbformat_minor"] = max(5, notebook.get("nbformat_minor", 0))
    for index, cell in enumerate(rebuilt):
        cell.setdefault("id", f"{path.stem.lower()}-{index:03d}")
    notebook["cells"] = rebuilt
    notebook["metadata"].pop("widgets", None)
    path.write_text(json.dumps(notebook, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline=newline)
    print(path.name, "interface refreshed")


if __name__ == "__main__":
    paths = [Path(p) for p in sys.argv[1:]] or sorted((ROOT / "notebooks").glob("Week_*.ipynb"))
    for path in paths:
        refresh(path)
