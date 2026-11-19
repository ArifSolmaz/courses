"""Reject accidental Jekyll Liquid delimiters in PHY101 formula drafts.

These drafts contain literal LaTeX, not Liquid templates. Jekyll processes
Liquid even inside fenced Markdown code blocks.
"""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def liquid_conflicts(text: str) -> list[int]:
    return [
        number
        for number, line in enumerate(text.splitlines(), 1)
        if "{{" in line or "{%" in line
    ]


def validate_source(text: str, path: Path) -> None:
    conflicts = liquid_conflicts(text)
    if conflicts:
        locations = ", ".join(f"{path}:{number}" for number in conflicts)
        raise ValueError(f"Unexpected Liquid opening delimiter in formula draft: {locations}")


def main() -> int:
    paths = sorted(ROOT.glob("FORMULA_REASONING*.md"))
    if not paths:
        print("No formula reasoning drafts found.", file=sys.stderr)
        return 1
    failed = False
    for path in paths:
        try:
            validate_source(path.read_text(encoding="utf-8"), path.relative_to(ROOT))
        except ValueError as exc:
            print(exc, file=sys.stderr)
            failed = True
        else:
            print(f"PASS: {path.relative_to(ROOT)}")
    return int(failed)


if __name__ == "__main__":
    raise SystemExit(main())
