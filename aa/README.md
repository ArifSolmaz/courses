# AA Algorithm Analysis

The 14-week course follows the topic order of the supplied bilingual Skiena CSE 373 notes. Document lectures 1–22 are grouped into teaching weeks; the dashboard and every weekly page identify the corresponding lectures and reading sections.

No prior Python knowledge is assumed. The core route uses a specified problem, labelled figure, worked trace, correctness and cost reasoning, and an edge case. Short Python demonstrations are supporting material. The former Python-first lessons and detailed guide are preserved in `python/`, explicitly labelled as the earlier sequence.

## Build and check

- `python3 aa/tools/build.py`
- `python3 aa/tools/verify_alignment.py`
- `node aa/tools/verify_week1_stories.cjs`

Canonical sources are in `tools/aligned/`; see its README for extraction provenance and question placement. Shared page chrome is retained in `tools/build_legacy.py`; do not run that historical generator into the current routes.

Each week includes at least ten test questions followed by written questions, with visible answers and sequential weekly numbering. All 120 original source MCQs and 205 original written exercises have placements; some tests are deliberately repeated as prerequisite review. Sixteen new conceptual tests fill gaps. Python-specific questions remain in the supporting lessons.

Week 1 retains the robot-tour and movie-scheduling demonstrations. Weeks 12–14 assign selected introductory reading, with advanced applications and proofs as optional depth. Assessment weighting remains midterm 50% and final 50%; weekly practice is ungraded.

Older `guide/wNN/` addresses lead to the current weekly lessons. Auxiliary guide pages lead to the preserved supporting reference. The optional-extensions landing page now points readers to the weeks where those topics are taught.
