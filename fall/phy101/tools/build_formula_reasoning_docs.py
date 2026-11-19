from __future__ import annotations

import html
import os
import re
import shutil
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches, Pt
from PIL import Image, ImageChops

from check_formula_reasoning import validate_source


ROOT = Path(r"C:\Users\arifs\Documents\GitHub\courses\fall\phy101")
SRC_MD = ROOT / "FORMULA_REASONING_W01_W07.md"
OUT_DOCX = ROOT / "PHY101_Formula_Reasoning_W01_W07.docx"
OUT_PDF = ROOT / "PHY101_Formula_Reasoning_W01_W07.pdf"
BUILD = ROOT / "_build_formula_reasoning"
EQ_DIR = BUILD / "equation_images"
EQ_PDF_DIR = BUILD / "equation_pdf"
PDF_BUILD_DIR = BUILD / "pdf"

PDFTOPPM = Path(
    r"C:\Users\arifs\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe"
)
XELATEX = shutil.which("xelatex") or r"C:\Users\arifs\AppData\Local\Programs\MiKTeX\miktex\bin\x64\xelatex.exe"


@dataclass
class Token:
    kind: str
    text: str
    level: int = 0


def parse_markdown(text: str) -> list[Token]:
    tokens: list[Token] = []
    lines = text.splitlines()
    i = 0
    paragraph: list[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            tokens.append(Token("paragraph", " ".join(line.strip() for line in paragraph).strip()))
            paragraph = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            flush_paragraph()
            lang = stripped[3:].strip().lower()
            i += 1
            block: list[str] = []
            while i < len(lines) and not lines[i].strip().startswith("```"):
                block.append(lines[i].rstrip())
                i += 1
            if i < len(lines):
                i += 1
            tokens.append(Token("equation" if lang == "tex" else "code", "\n".join(block).strip()))
            continue

        if not stripped:
            flush_paragraph()
            i += 1
            continue

        if stripped == "---":
            flush_paragraph()
            tokens.append(Token("rule", ""))
            i += 1
            continue

        if stripped.startswith("> "):
            flush_paragraph()
            tokens.append(Token("quote", stripped[2:].strip()))
            i += 1
            continue

        m = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if m:
            flush_paragraph()
            tokens.append(Token("heading", m.group(2).strip(), len(m.group(1))))
            i += 1
            continue

        if stripped.startswith("- "):
            flush_paragraph()
            tokens.append(Token("bullet", stripped[2:].strip()))
            i += 1
            continue

        m = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m:
            flush_paragraph()
            tokens.append(Token("number", f"{m.group(1)}. {m.group(2).strip()}"))
            i += 1
            continue

        paragraph.append(line)
        i += 1

    flush_paragraph()
    return tokens


def latex_escape_text(s: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(ch, ch) for ch in s)


def is_math_inline(s: str) -> bool:
    math_signs = ("\\", "_", "^", "=", "<", ">", "+", "-", "/", "theta", "mu", "Delta", "sum", "frac", "sqrt")
    unitish = re.search(r"\b[avgxyfrkitdmNJKW]\b", s) is not None
    return any(mark in s for mark in math_signs) or unitish


def normalize_inline_math(s: str) -> str:
    s = s.strip()
    s = s.replace(" deg", r"^\circ")
    s = re.sub(r"\btheta\b", lambda _: r"\theta", s)
    s = re.sub(r"\bphi\b", lambda _: r"\phi", s)
    s = re.sub(r"\bmu\b", lambda _: r"\mu", s)
    s = re.sub(r"\bDelta\b", lambda _: r"\Delta", s)
    s = s.replace("->", r"\to")
    return s


def latex_inline(s: str) -> str:
    out: list[str] = []
    pos = 0
    pattern = re.compile(r"(\*\*([^*]+)\*\*)|`([^`]+)`")
    for m in pattern.finditer(s):
        out.append(latex_escape_text(s[pos : m.start()]))
        if m.group(2) is not None:
            out.append(r"\textbf{" + latex_escape_text(m.group(2)) + "}")
        else:
            code = m.group(3)
            if is_math_inline(code):
                out.append("$" + normalize_inline_math(code) + "$")
            else:
                out.append(r"\texttt{" + latex_escape_text(code) + "}")
        pos = m.end()
    out.append(latex_escape_text(s[pos:]))
    return "".join(out)


def tex_display(block: str) -> str:
    lines = [line.strip() for line in block.splitlines() if line.strip()]
    if len(lines) == 1:
        return r"\[" + "\n" + lines[0] + "\n" + r"\]"
    joined = r" \\ ".join(lines)
    return r"\[" + "\n" + r"\begin{aligned}" + "\n" + joined + "\n" + r"\end{aligned}" + "\n" + r"\]"


def build_latex_pdf_source(tokens: list[Token]) -> str:
    body: list[str] = []
    for token in tokens:
        if token.kind == "heading":
            cmd = {1: "section*", 2: "subsection*", 3: "subsubsection*", 4: "paragraph"}.get(token.level, "paragraph")
            body.append("\\" + cmd + "{" + latex_inline(token.text) + "}")
        elif token.kind == "paragraph":
            body.append(latex_inline(token.text) + "\n")
        elif token.kind == "bullet":
            body.append(r"\noindent\textbullet\ " + latex_inline(token.text) + r"\par")
        elif token.kind == "number":
            body.append(r"\noindent " + latex_inline(token.text) + r"\par")
        elif token.kind == "equation":
            body.append(tex_display(token.text))
        elif token.kind == "quote":
            body.append(r"\begin{quote}\itshape " + latex_inline(token.text) + r"\end{quote}")
        elif token.kind == "code":
            body.append(r"\begin{quote}\small\ttfamily")
            body.append(latex_escape_text(token.text).replace("\n", r"\\"))
            body.append(r"\end{quote}")
        elif token.kind == "rule":
            body.append(r"\vspace{2pt}\hrule\vspace{2pt}")

    return r"""\documentclass[10pt,a4paper]{article}
\usepackage[margin=0.55in]{geometry}
\usepackage{amsmath,amssymb}
\usepackage{fontspec}
\setmainfont{Arial}
\usepackage{microtype}
\usepackage{xcolor}
\definecolor{headingblue}{HTML}{17365D}
\setlength{\parindent}{0pt}
\setlength{\parskip}{3pt}
\setlength{\abovedisplayskip}{3pt}
\setlength{\belowdisplayskip}{3pt}
\setlength{\abovedisplayshortskip}{2pt}
\setlength{\belowdisplayshortskip}{2pt}
\linespread{0.96}
\pagestyle{plain}
\usepackage{titlesec}
\titleformat{\section}{\large\bfseries\color{headingblue}}{}{0pt}{}
\titleformat{\subsection}{\normalsize\bfseries\color{headingblue}}{}{0pt}{}
\titleformat{\subsubsection}{\normalsize\bfseries\color{headingblue}}{}{0pt}{}
\titlespacing*{\section}{0pt}{6pt}{3pt}
\titlespacing*{\subsection}{0pt}{5pt}{2pt}
\titlespacing*{\subsubsection}{0pt}{4pt}{2pt}
\begin{document}
""" + "\n".join(body) + "\n\\end{document}\n"


def build_equation_source(equations: list[str]) -> str:
    pages: list[str] = []
    for block in equations:
        pages.append(tex_display(block) + "\n\\newpage")
    return r"""\documentclass[12pt,a4paper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{amsmath,amssymb}
\pagestyle{empty}
\begin{document}
""" + "\n".join(pages) + "\n\\end{document}\n"


def run(cmd: list[str], cwd: Path) -> None:
    proc = subprocess.run(cmd, cwd=str(cwd), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if proc.returncode != 0:
        print(proc.stdout)
        raise RuntimeError(f"Command failed: {' '.join(cmd)}")


def crop_equation_image(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGB")
    bg = Image.new("RGB", im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert("L")
    # Convert near-white anti-aliased pixels to black background, then crop.
    diff = diff.point(lambda px: 255 if px > 10 else 0)
    bbox = diff.getbbox()
    if bbox is None:
        im.save(dst)
        return
    pad = 20
    box = (
        max(bbox[0] - pad, 0),
        max(bbox[1] - pad, 0),
        min(bbox[2] + pad, im.width),
        min(bbox[3] + pad, im.height),
    )
    im.crop(box).save(dst)


SUB_MAP = str.maketrans("0123456789+-=()abcdefghijklmnopqrstuvwxyz", "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐ♭꜀ᑯₑբ₉ₕᵢⱼₖₗₘₙₒₚ۹ᵣₛₜᵤᵥwₓᵧ₂")
SUP_MAP = str.maketrans("0123456789+-=()abcdefghijklmnopqrstuvwxyz", "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ")


def unicode_formula(s: str) -> str:
    s = html.unescape(s)
    replacements = {
        r"\Delta": "Δ",
        r"\theta": "θ",
        r"\phi": "φ",
        r"\mu": "μ",
        r"\eta": "η",
        r"\sum": "Σ",
        r"\vec": "vec ",
        r"\cdot": "·",
        r"\times": "×",
        r"\le": "≤",
        r"\ge": "≥",
        r"\to": "→",
        r"\Rightarrow": "⇒",
        r"\parallel": "∥",
        r"\perp": "⊥",
        r"\pi": "π",
        r"\circ": "°",
        r"\sin": "sin",
        r"\cos": "cos",
        r"\tan": "tan",
        r"\sqrt": "√",
        r"\frac12": "½",
        r"\qquad": "    ",
        r"\quad": "  ",
        r"\ ": " ",
        r"\,": " ",
        r"\mathrm": "",
        r"\rm": "",
    }
    for old, new in replacements.items():
        s = s.replace(old, new)
    s = re.sub(r"\{([^{}]+)\}", r"\1", s)
    s = re.sub(r"_([A-Za-z0-9+-])", lambda m: m.group(1).translate(SUB_MAP), s)
    s = re.sub(r"\^([A-Za-z0-9+-])", lambda m: m.group(1).translate(SUP_MAP), s)
    return s


def add_inline_runs(paragraph, text: str) -> None:
    pos = 0
    pattern = re.compile(r"(\*\*([^*]+)\*\*)|`([^`]+)`")
    for m in pattern.finditer(text):
        if m.start() > pos:
            paragraph.add_run(text[pos : m.start()])
        if m.group(2) is not None:
            run = paragraph.add_run(m.group(2))
            run.bold = True
        else:
            code = m.group(3)
            run = paragraph.add_run(unicode_formula(code) if is_math_inline(code) else code)
            run.font.name = "Cambria Math" if is_math_inline(code) else "Consolas"
        pos = m.end()
    if pos < len(text):
        paragraph.add_run(text[pos:])


def configure_doc(document: Document) -> None:
    styles = document.styles
    styles["Normal"].font.name = "Arial"
    styles["Normal"].font.size = Pt(9.5)
    styles["Normal"].paragraph_format.space_after = Pt(2)
    styles["Normal"].paragraph_format.line_spacing = 1.0
    for style_name in ("Heading 1", "Heading 2", "Heading 3"):
        styles[style_name].font.name = "Arial"
        styles[style_name].font.bold = True
        styles[style_name].paragraph_format.space_before = Pt(4)
        styles[style_name].paragraph_format.space_after = Pt(2)


def build_docx(tokens: list[Token], equation_images: list[Path]) -> None:
    doc = Document()
    configure_doc(doc)
    section = doc.sections[0]
    section.top_margin = Inches(0.5)
    section.bottom_margin = Inches(0.5)
    section.left_margin = Inches(0.55)
    section.right_margin = Inches(0.55)
    eq_index = 0

    for token in tokens:
        if token.kind == "heading":
            level = min(max(token.level, 1), 3)
            paragraph = doc.add_heading(level=level)
            add_inline_runs(paragraph, token.text)
        elif token.kind == "paragraph":
            paragraph = doc.add_paragraph()
            add_inline_runs(paragraph, token.text)
        elif token.kind == "bullet":
            paragraph = doc.add_paragraph(style="List Bullet")
            add_inline_runs(paragraph, token.text)
        elif token.kind == "number":
            paragraph = doc.add_paragraph()
            add_inline_runs(paragraph, token.text)
        elif token.kind == "equation":
            img = equation_images[eq_index]
            eq_index += 1
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            with Image.open(img) as im:
                width_inches = min(5.8, max(0.85, im.width / 255.0))
            p.add_run().add_picture(str(img), width=Inches(width_inches))
        elif token.kind == "quote":
            p = doc.add_paragraph()
            add_inline_runs(p, token.text)
            for run in p.runs:
                run.italic = True
        elif token.kind == "code":
            p = doc.add_paragraph()
            run = p.add_run(token.text)
            run.font.name = "Consolas"
            run.font.size = Pt(7.5)
        elif token.kind == "rule":
            doc.add_paragraph("")

    doc.save(OUT_DOCX)


def main() -> int:
    text = SRC_MD.read_text(encoding="utf-8")
    validate_source(text, SRC_MD)
    tokens = parse_markdown(text)
    equations = [token.text for token in tokens if token.kind == "equation"]

    BUILD.mkdir(exist_ok=True)
    EQ_DIR.mkdir(parents=True, exist_ok=True)
    EQ_PDF_DIR.mkdir(parents=True, exist_ok=True)
    PDF_BUILD_DIR.mkdir(parents=True, exist_ok=True)
    for folder in (EQ_DIR, EQ_PDF_DIR, PDF_BUILD_DIR):
        for old in folder.glob("*"):
            if old.is_file():
                old.unlink()

    eq_tex = EQ_PDF_DIR / "equations.tex"
    eq_tex.write_text(build_equation_source(equations), encoding="utf-8")
    run([str(XELATEX), "-interaction=nonstopmode", "-halt-on-error", eq_tex.name], EQ_PDF_DIR)
    run([str(PDFTOPPM), "-r", "220", "-png", str(EQ_PDF_DIR / "equations.pdf"), str(EQ_DIR / "eq")], EQ_PDF_DIR)

    raw_pages = sorted(EQ_DIR.glob("eq-*.png"))
    cropped: list[Path] = []
    for idx, page in enumerate(raw_pages, start=1):
        dst = EQ_DIR / f"equation_{idx:03d}.png"
        crop_equation_image(page, dst)
        cropped.append(dst)

    if len(cropped) != len(equations):
        raise RuntimeError(f"Expected {len(equations)} equation images, got {len(cropped)}")

    build_docx(tokens, cropped)

    latex_source = build_latex_pdf_source(tokens)
    pdf_tex = PDF_BUILD_DIR / "PHY101_Formula_Reasoning_W01_W07.tex"
    pdf_tex.write_text(latex_source, encoding="utf-8")
    run([str(XELATEX), "-interaction=nonstopmode", "-halt-on-error", pdf_tex.name], PDF_BUILD_DIR)
    built_pdf = PDF_BUILD_DIR / "PHY101_Formula_Reasoning_W01_W07.pdf"
    shutil.copyfile(built_pdf, OUT_PDF)

    print(f"Wrote {OUT_DOCX}")
    print(f"Wrote {OUT_PDF}")
    print(f"Rendered {len(equations)} displayed equation blocks.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
