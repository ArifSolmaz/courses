# Fully worked examples from the question bank

The four `worked_examples_*.json` files contain 60 additional teaching examples.
Their solutions are visible from beginning to end, with symbolic rearrangements,
numerical substitutions, units, physical checks and Turkish explanations. They
are reading and review material in the weekly lessons.

Fifty-five examples use the mechanics chapters of the supplied Young/Freedman
*University Physics with Modern Physics*, 14th Global Edition question bank.
Each example identifies the original Word filename, section and question number.
The five periodic-motion examples are explicitly labelled instructor extensions
of the bank's spring-energy and swing models: the oscillations chapter was not
present in the supplied collection. Added or changed parameters are stated.

Only questions with complete textual givens and geometry were used. The legacy
Word documents contain embedded equation and figure objects; questions whose
required information could not be read were excluded. The originals are not
published in this course. No unverified page numbers are assigned.

The bank's answer choices are not a substitute for verification. Solutions are
derived independently, with the gravitational acceleration stated where used.
The `checks` arrays hold numerical checks for maintenance; students see the
explanations and LaTeX, without these Python calculation expressions.

To update the examples, edit the JSON sources, then run from the repository root:

```powershell
python -B fall/phy101/tools/sync_worked_examples.py
python -B fall/phy101/tools/build_calendar_notebooks.py
python -B fall/phy101/tools/sync_worked_examples.py --check
python -B fall/phy101/tools/build_calendar_notebooks.py --check
```

The examples are inserted before the existing problem set in each relevant source
module and before paper practice in its dated lesson. Their `calendar_week` values
control the actual teaching placement. Existing problem IDs and worked keys remain
separate from these additional examples.
