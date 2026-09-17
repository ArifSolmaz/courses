# Short-URL redirect pages for PHY101 weeks

These files belong in the **other** repository, `ArifSolmaz/arifsolmaz.github.io`,
not in this one. They are generated here so they stay in step with
`calendar.json`; copy them across when the week pages change shape.

## What to copy

    fall/phy101/tools/short-urls/phy101/w1/index.html   ->   <arifsolmaz.github.io>/phy101/w1/index.html
    ...                                                       ...
    fall/phy101/tools/short-urls/phy101/w13/index.html  ->   <arifsolmaz.github.io>/phy101/w13/index.html

Each file is a redirect only. It carries no teaching content, which keeps the
rule in `PUBLIC_URLS.md` intact: the short-URL repository routes, and this
repository teaches.

## What changes

Before, `/phy101/wN/` pointed at the dashboard's `#week-N` section. It now
points at the generated week notes:

    https://arifsolmaz.github.io/courses/fall/phy101/wN/

`/phy101/` itself is unchanged and still points at the dashboard.

## Regenerating

    python3 fall/phy101/tools/build_short_urls.py

Do not hand-edit these files; the week titles come from `calendar.json`.
