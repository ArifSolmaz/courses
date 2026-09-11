# Computer Programming I (Python, Notebook-based)
**Duration:** 14 weeks — **5 hours/week**
**Format:** Google Colab / Jupyter notebooks

## 🎯 CORE MASTERY: "I can solve a problem step by step with code"
> **Algorithmic Thinking** — Given any problem, the student can decompose it into
> sequential steps and express those steps as a working Python program using
> variables, conditions, loops, and functions.
>
> Every week teaches new *vocabulary* (syntax, tools, patterns) but always in
> service of this ONE skill. The weekly question is always:
> **"How does this new tool help me express my solution steps better?"**

## Weekly Deliverable (standard)
Each week: **one lesson notebook and one complete worked-solution companion**.
- `Week_XX.ipynb` (≈5 hours): explanations, examples, concept checkpoints, core practice, optional extensions, breaks and review.
- `solutions/Week_XX_Solutions.ipynb`: every numbered exercise and the bridge/preview, with reasoning and checks.
- Weeks 1–13: eight core exercises per week. Week 14: ten core milestones including report writing and program integration.
- Weekly notebooks are private practice. Assessment remains midterm 25%, final 50%, in-class demonstration and technical explanation 25%.

Start with the [simple course guide](STUDY_GUIDE.md) and [worked-solution index](solutions/README.md).

**Calendar:** this is a 14-week topic sequence. Official CP1 teaching dates, holidays and exam dates have not been supplied; use the announced timetable.

## Notebook Template (same structure each week)
1. **Title & Learning Objectives** — always linked back to core mastery
2. **Core Mastery Connection** — 2-3 sentences: "This week adds ___ to your problem-solving toolkit"
3. **Content Parts** (6-10 parts per week with explanations + code examples)
4. **Exercises** (Easy / Medium / Challenge levels) — each framed as a *problem to solve*, not syntax drill
5. **Bridge** (a guided preview or exercise connecting to the next week)
6. **Worked-solution companion** (reasoning, runnable answers, expected results and checks)

## Distribution
- GitHub repo + "Open in Colab" links
- Students work in Colab

---

<!-- BEGIN CP1 GENERATED INDEX -->
| Week | Lesson | Worked solutions | Core / optional |
|---|---|---|---|
| 01 | [Colab Setup, Variables & Data Types](notebooks/Week_01.ipynb) | [Complete solutions](solutions/Week_01_Solutions.ipynb) | 8 / 7 |
| 02 | [Operators, F-Strings & Type Conversion](notebooks/Week_02.ipynb) | [Complete solutions](solutions/Week_02_Solutions.ipynb) | 8 / 4 |
| 03 | [Conditionals & Decision Making](notebooks/Week_03.ipynb) | [Complete solutions](solutions/Week_03_Solutions.ipynb) | 8 / 4 |
| 04 | [for Loops & range -- Repetition](notebooks/Week_04.ipynb) | [Complete solutions](solutions/Week_04_Solutions.ipynb) | 8 / 4 |
| 05 | [while Loops, break & continue](notebooks/Week_05.ipynb) | [Complete solutions](solutions/Week_05_Solutions.ipynb) | 8 / 4 |
| 06 | [Problem-Solving Patterns](notebooks/Week_06.ipynb) | [Complete solutions](solutions/Week_06_Solutions.ipynb) | 8 / 4 |
| 07 | [Lists Fundamentals](notebooks/Week_07.ipynb) | [Complete solutions](solutions/Week_07_Solutions.ipynb) | 8 / 4 |
| 08 | [2D Lists & Nested Loops](notebooks/Week_08.ipynb) | [Complete solutions](solutions/Week_08_Solutions.ipynb) | 8 / 4 |
| 09 | [String Processing](notebooks/Week_09.ipynb) | [Complete solutions](solutions/Week_09_Solutions.ipynb) | 8 / 4 |
| 10 | [Functions — Basics](notebooks/Week_10.ipynb) | [Complete solutions](solutions/Week_10_Solutions.ipynb) | 8 / 4 |
| 11 | [Scope & Mini-Library](notebooks/Week_11.ipynb) | [Complete solutions](solutions/Week_11_Solutions.ipynb) | 8 / 4 |
| 12 | [Error Handling](notebooks/Week_12.ipynb) | [Complete solutions](solutions/Week_12_Solutions.ipynb) | 8 / 4 |
| 13 | [File I/O & CSV](notebooks/Week_13.ipynb) | [Complete solutions](solutions/Week_13_Solutions.ipynb) | 8 / 4 |
| 14 | [Mini Project — Sensor Log Summary](notebooks/Week_14.ipynb) | [Complete solutions](solutions/Week_14_Solutions.ipynb) | 10 / 2 |
<!-- END CP1 GENERATED INDEX -->

## 14-Week Topic Plan (CP1)

### PHASE 1: Learning the Vocabulary (Weeks 1-2)
*"These are the building blocks for expressing your solution steps"*

### Week 01 — Your First Steps: Variables, Types & print()
**Core mastery link:** Before you can solve problems with code, you need to know how to store data and show results.
- What is Python? Notebook environment
- Variables, naming rules, assignment
- Data types: `int`, `float`, `str`, `bool`
- `print()`, `type()`, escape characters
- Basic arithmetic & operator precedence
- 15 exercises: 8 core + 7 optional + bridge walkthrough to Week 02

### Week 02 — Better Expressions: Operators, f-strings & Conversion
**Core mastery link:** Real problems need comparisons, formatted output, and user input — these expand what your steps can express.
- All arithmetic operators: `+ - * / // % **`
- Comparison operators → bool results
- Assignment operators: `+=`, `-=`, etc.
- Type conversion: `int()`, `float()`, `str()`, `bool()`
- f-string formatting: `.2f`, alignment, `%`
- `input()` function, string operations
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 03

### PHASE 2: Expressing Decisions & Repetition (Weeks 3-5)
*"These are how you express choices and repetition in your solution steps"*

### Week 03 — Making Decisions: Conditionals (if/elif/else)
**Core mastery link:** Most problems require decisions — "if this, do that." Conditionals let your program choose different paths.
- Boolean expressions review
- `if`, `elif`, `else` with indentation
- Logical operators: `and`, `or`, `not`
- Chained comparisons, nested conditionals
- Input validation patterns, edge cases
- Common pitfalls: `=` vs `==`
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 04

### Week 04 — Repeating Steps: for Loops & range()
**Core mastery link:** Many solutions require doing the same step many times. Loops let you repeat without repeating yourself.
- `for` loop anatomy: variable, iterable, body
- `range(n)`, `range(a,b)`, `range(a,b,step)`
- Accumulator patterns: sum, count, product
- Nested loops, star patterns
- Off-by-one errors
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 05

### Week 05 — Flexible Repetition: while Loops, break & continue
**Core mastery link:** Some problems need to repeat until a condition is met, not a fixed number of times. `while` gives you that flexibility.
- `while` loop: condition-controlled loops
- `break` and `continue` control flow
- Infinite loops, sentinel values, guard patterns
- Input validation with loops
- Common mistakes and debugging
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 06

### PHASE 3: Recognizing & Applying Patterns (Week 6)
*"Experienced problem-solvers recognize recurring patterns — now you will too"*

### Week 06 — The Problem-Solver's Toolbox: Patterns
**Core mastery link:** This is the heart of the course. You learn to *recognize* which pattern fits a problem, then *apply* it. Sum, count, min/max, search — these are reusable solution templates.
- Sum, count, min/max accumulator patterns
- Average and search/scan patterns
- Combining multiple patterns in one loop
- Working with data lists
- Building summary reports
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 07

### PHASE 4: Working with Collections (Weeks 7-9)
*"Real problems involve collections of data — lists, tables, text"*

### Week 07 — Organizing Data: Lists
**Core mastery link:** Most real problems involve many data points, not just one. Lists let your solution steps work with collections.
- Creating lists, indexing, slicing
- Modifying: `append()`, `insert()`, `pop()`, `remove()`
- List operations: `len()`, `in`, `sorted()`, `+`, `*`
- Iterating: `for`, `range`, `enumerate`
- Common list patterns and methods
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 08

### Week 08 — Tabular Data: 2D Lists & Nested Loops
**Core mastery link:** Many real-world datasets are tables (rows × columns). 2D lists + nested loops let you process tabular data.
- 2D lists as matrices, row/column access
- Nested `for` loops for 2D traversal
- Row/column statistics: sum, min, max, avg
- Building and modifying 2D lists
- Practical: grades tables, temperature grids
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 09

### Week 09 — Text as Data: String Processing
**Core mastery link:** Text is data too. Parsing, splitting, and searching strings lets you solve problems involving text input.
- String methods: `split`, `join`, `strip`, `replace`, `find`
- Character iteration and searching
- Parsing structured text and CSV-like lines
- Building strings with concatenation and `join`
- Practical: log line parsing
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 10

### PHASE 5: Naming & Reusing Steps (Weeks 10-11)
*"Functions let you name groups of steps and reuse them — the key to solving bigger problems"*

### Week 10 — Naming Your Steps: Functions
**Core mastery link:** As problems grow, you need to name and reuse groups of steps. Functions turn your solution patterns into reusable tools.
- `def`, parameters, arguments, `return`
- Single/multiple parameters and return values
- Default parameters, keyword arguments
- `print()` vs `return` distinction
- Docstrings, built-in functions review
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 11

### Week 11 — Building Your Toolkit: Scope & Composition
**Core mastery link:** Real solutions combine many functions. Understanding scope and composition lets you build larger programs from small, reliable pieces.
- Local vs global scope, variable lifetime
- The `global` keyword (when to avoid it)
- Variable shadowing, name resolution
- Functions calling functions (composition)
- Refactoring scripts into function libraries
- Dictionary creation, key access, updates and iteration before their use in exercises
- Tuple returns/unpacking; local rebinding versus mutation of a passed list
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 12

### PHASE 6: Real-World Robustness (Weeks 12-13)
*"Real-world problems have messy input and persistent data — errors and files handle that"*

### Week 12 — Handling the Unexpected: Error Handling
**Core mastery link:** Real-world data is messy. Error handling makes your solutions robust — they handle bad input gracefully instead of crashing.
- Syntax vs Runtime vs Logical errors
- `try`/`except` basics, specific exceptions
- `else` and `finally` clauses
- Input validation with `try`/`except`
- Defensive programming patterns, finite-number checks and boundary cases
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 13

### Week 13 — Persistent Data: File I/O & CSV
**Core mastery link:** Real problems need to read data from files and save results. File I/O connects your programs to persistent, real-world data.
- `open()`, read, write with `with` statement
- File modes: `r`, `w`, `a`
- CSV concept, manual parsing with `split()`
- Writing CSV data and summary files
- Practical: student grades, temperature logs
- 12 exercises: 8 core + 4 optional + bridge walkthrough to Week 14

### PHASE 7: Proving Mastery (Week 14)
*"You solve a complete real-world problem from scratch — step by step"*

### Week 14 — Capstone: Sensor Log Summary
**Core mastery link:** This is the proof. You take a real problem, decompose it into steps, and build a complete working solution using everything you've learned.
- Read sensor CSV data (timestamp, sensor, value)
- Validate row shape, known sensors, finite numbers and sensor-specific ranges
- State behavior for empty input and empty sensor groups
- Compute statistics per sensor (min/max/mean/count)
- Generate formatted summary report
- Write clean data + report to files
- 12 exercises: 10 core + 2 optional; the two bonuses are included in the optional count
