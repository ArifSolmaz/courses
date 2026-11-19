"""Render the explanations before the weekly activities."""

from html import escape

from . import concepts_en, concepts_tr


def list_items(values):
    return "".join(f"<li>{escape(value)}</li>" for value in values)


def model(label, answer):
    return f"<details><summary>{label}</summary><p>{escape(answer)}</p></details>"


def sections(week, tr):
    source = concepts_tr if tr else concepts_en
    title, objectives, before, explanations, caption, frames, conclusion, mistakes, terms, trace, exit_answer = source.SUPPORT[week]
    objectives_title = "Bu derste yapabileceklerin" if tr else "You will be able to"
    before_title = "Başlamadan önce" if tr else "Before you start"
    mistakes_title = "Sık yapılan hatalar" if tr else "Common mistakes"
    glossary_title = "İngilizce–Türkçe terimler" if tr else "English–Turkish glossary"
    prose = "".join(f"<p>{escape(text)}</p>" for text in explanations)
    diagram = "".join(
        f"<li><strong>{escape(state)}</strong><span>{escape(reason)}</span></li>"
        for state, reason in frames
    )
    glossary = "".join(f"<dt>{escape(term)}</dt><dd>{escape(meaning)}</dd>" for term, meaning in terms)
    concepts = f"""<section id="concepts">
<h2>{escape(title)}</h2>
<h3>{objectives_title}</h3><ul>{list_items(objectives)}</ul>
<h3>{before_title}</h3><p>{escape(before)}</p>
{prose}
<figure class="concept-figure">
<figcaption>{escape(caption)}</figcaption>
<ol class="concept-frames">{diagram}</ol>
</figure>
<p>{escape(conclusion)}</p>
</section>
"""
    notes = f"""<section id="common-mistakes">
<h2>{mistakes_title}</h2><ul>{list_items(mistakes)}</ul>
<h3>{glossary_title}</h3><dl class="concept-glossary">{glossary}</dl>
</section>
"""
    trace_model = model("Üç cümlelik örnek açıklama" if tr else "Compare a three-sentence explanation", trace)
    exit_model = model("Örnek çıkış yanıtı" if tr else "Compare a sample exit answer", exit_answer)
    return concepts, notes, trace_model, exit_model
