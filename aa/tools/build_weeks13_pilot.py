#!/usr/bin/env python3
"""Build the bilingual Week 1–3 pilot pages without changing course lessons.

Run directly for the checked-in routes, or use --output /tmp/aa to build under
an alternate AA root for a reproducibility check. Task content remains in the
shared, bilingual aa/pilot/tasks.js module.
"""
from __future__ import annotations

import argparse
import html
import json
from pathlib import Path
import subprocess

AA_ROOT = Path(__file__).resolve().parents[1]


def esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def label(en: str, tr: str, language: str) -> str:
    return en if language == "en" else tr


def load_tasks() -> dict:
    source = AA_ROOT / "pilot/tasks.js"
    result = subprocess.run(
        ["node", "-e", "process.stdout.write(JSON.stringify(require(process.argv[1])))", str(source)],
        check=True, capture_output=True, text=True,
    )
    tasks = json.loads(result.stdout)
    if tasks["protocol"] != "aa-weeks1-3-v1":
        raise ValueError("The task protocol must remain aa-weeks1-3-v1.")
    return tasks


def options(items: list[tuple[str, str]]) -> str:
    return "".join(f'<option value="{esc(value)}">{esc(text)}</option>' for value, text in items)


def paper_blank(id_: str) -> str:
    return f'<p class="print-value" data-print-for="{esc(id_)}">________________</p>'


def select(id_: str, text: str, items: list[tuple[str, str]], *, description: str = "") -> str:
    described = f' aria-describedby="{esc(id_)}-help"' if description else ""
    extra = f'<p id="{esc(id_)}-help" class="caption">{esc(description)}</p>' if description else ""
    return f'<div class="field"><label for="{esc(id_)}">{esc(text)}</label><select id="{esc(id_)}" name="{esc(id_)}"{described}>{options(items)}</select>{paper_blank(id_)}{extra}</div>'


def textarea(id_: str, text: str, maximum: int = 1200, rows: int = 3) -> str:
    return f'<div class="field"><label for="{esc(id_)}">{esc(text)}</label><textarea id="{esc(id_)}" name="{esc(id_)}" rows="{rows}" maxlength="{maximum}"></textarea>{paper_blank(id_)}</div>'


def number(id_: str, text: str, maximum: int = 120, step: str = "any") -> str:
    return f'<div class="field"><label for="{esc(id_)}">{esc(text)}</label><input id="{esc(id_)}" name="{esc(id_)}" type="number" min="0" max="{maximum}" step="{esc(step)}" inputmode="decimal">{paper_blank(id_)}</div>'


def button(id_: str, text: str, *, js: bool = True, disabled: bool = False) -> str:
    attrs = ' class="js-only" hidden disabled' if js else (' disabled' if disabled else "")
    return f'<button id="{esc(id_)}" type="button"{attrs}>{esc(text)}</button>'


def support_options(language: str) -> list[tuple[str, str]]:
    return [("", label("Unknown", "Bilinmiyor", language)),
            ("independent", label("Alone", "Bağımsız", language)),
            ("hint", label("Hint", "İpucu", language)),
            ("solution", label("Solution", "Çözüm", language))]


def phase_fields(phase: str, text: str, language: str) -> str:
    return (
        '<div class="phase-observations">'
        + number("time-" + phase, label(f"{text}: actual minutes (optional)", f"{text}: gerçek dakika (isteğe bağlı)", language))
        + '<p class="caption">' + esc(label(
            "Leave unobserved time blank. The planned duration is not an observed measurement.",
            "Gözlenmeyen süreyi boş bırak. Planlanan süre, gözlenmiş ölçüm değildir.", language)) + '</p>'
        + textarea("bottleneck-" + phase, label("Where did you get stuck? (optional, 500 characters)", "Nerede takıldın? (isteğe bağlı, 500 karakter)", language), 500, 2)
        + '</div>'
    )


def shell(tasks: dict, language: str, page: str, content: str) -> str:
    teacher = page == "teacher"
    prefix = ("../" if teacher else "") + ("../" if language == "tr" else "")
    alternate = "../" if language == "tr" else "tr/"
    current = '<span aria-current="page">English</span>' if language == "en" else '<span aria-current="page">Türkçe</span>'
    other = f'<a href="{alternate}" hreflang="{"tr" if language == "en" else "en"}">{"Türkçe" if language == "en" else "English"}</a>'
    languages = current + other if language == "en" else other + current
    title = label("Teacher form · Weeks 1–3 pilot", "Öğretmen formu · Hafta 1–3 pilotu", language) if teacher else tasks["title"][language]
    scripts = [prefix + "tasks.js?v=1", prefix + "model.js?v=1"]
    if teacher:
        scripts.extend(prefix + file + "?v=1" for file in ("csv.js", "report.js", "teacher.js"))
    else:
        scripts.extend(prefix + "../w" + str(i) + "/model.js?v=1" for i in (1, 2, 3))
        scripts.append(prefix + "student.js?v=1")
    scripts_html = "\n".join(f'<script src="{esc(src)}" defer></script>' for src in scripts)
    counterpart = (prefix + ("tr/" if language == "tr" else "")) if teacher else (prefix + "teacher/" + ("tr/" if language == "tr" else ""))
    counterpart_text = label("Student instructions", "Öğrenci yönergesi", language) if teacher else label("Teacher tools", "Öğretmen araçları", language)
    draft_status = '<p id="draft-status" role="status" aria-live="polite"></p>'
    fallback = '<p id="enhancement-fallback" class="notice">' + esc(label(
        'Digital flow is not active yet. If controls do not appear, use the printed instructions and record responses on paper; no digital work has been saved.',
        'Dijital akış henüz etkin değil. Kontroller görünmezse basılı yönergeleri kullanıp yanıtları kâğıda kaydet; bu oturumda dijital çalışma henüz kaydedilmedi.', language)) + '</p>'
    content = content.replace(draft_status, draft_status + fallback)
    return f'''<!doctype html>
<html lang="{language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{esc(label('A 25-minute, bilingual small-group pilot for tracing, counting work and choosing a search method in Weeks 1–3.', 'Hafta 1–3’te izleme, işi sayma ve arama yöntemi seçme için 25 dakikalık iki dilli küçük grup pilotu.', language))}">
<title>{esc(title)} · AA</title>
<link rel="stylesheet" href="{esc(prefix)}style.css?v=1">
{scripts_html}
</head>
<body data-pilot-page="{page}">
<a class="skip" href="#main">{esc(label('Skip to content', 'İçeriğe geç', language))}</a>
<header class="course-header header-row"><a href="{esc(prefix)}../">AA</a><div class="header-end"><span>{esc(label('Weeks 1–3 pilot', 'Hafta 1–3 pilotu', language))}</span><nav class="language-switch" aria-label="{esc(label('Language', 'Dil', language))}">{languages}</nav></div></header>
<main id="main">
<nav class="back-links actions" aria-label="{esc(label('Pilot entries', 'Pilot girişleri', language))}"><a href="{esc(prefix)}../resources/">{esc(label('Additional resources', 'Ek kaynaklar', language))}</a><a href="{esc(counterpart)}">{esc(counterpart_text)}</a></nav>
{content}
</main>
<footer><p>AA · {esc(label('Weeks 1–3 · Small-group pilot', 'Hafta 1–3 · Küçük grup pilotu', language))}</p><a href="{esc(prefix)}../">{esc(label('AA home', 'AA ana sayfa', language))}</a></footer>
</body>
</html>
'''


def student(tasks: dict, language: str) -> str:
    t = lambda en, tr: label(en, tr, language)
    prefix = "../" if language == "tr" else ""
    phase_names = {phase["id"]: phase["label"][language] for phase in tasks["schedule"]}
    intro = f'''<section class="intro" aria-labelledby="pilot-title"><p class="eyebrow">{esc(t('6–8 learners · 25 minutes', '6–8 öğrenci · 25 dakika'))}</p><h1 id="pilot-title">{esc(t('Follow the reasoning from a record to a method.', 'Bir kayıttan yönteme düşünceyi izle.'))}</h1><p class="lead">{esc(t('Trace the first match, count the work, and test when a search method fits the task. Write your own first and transfer explanations; a teacher will assess the evidence in four separate dimensions.', 'İlk eşleşmeyi izle, yapılan işi say ve bir arama yönteminin işe hangi koşullarda uyduğunu sına. İlk ve aktarım açıklamalarını kendin yaz; öğretmen kanıtları dört ayrı boyutta değerlendirecek.'))}</p>
<ol class="schedule">{''.join('<li><strong>' + str(x['minutes']) + ' ' + esc(t('min', 'dk')) + '</strong> ' + esc(x['label'][language]) + '</li>' for x in tasks['schedule'])}</ol>
<p class="notice">{esc(t('Use only a participant code P01–P08, not a name or student number. With JavaScript, this browser tab keeps a draft in sessionStorage; it is not sent to a server and is not a durable backup. Download before closing the tab. An observed time is entered manually; the plan is never saved as a measured time.', 'Ad veya öğrenci numarası yerine yalnız P01–P08 katılımcı kodunu kullan. JavaScript açıkken bu tarayıcı sekmesi taslağı sessionStorage içinde tutar; sunucuya göndermez ve kalıcı yedek değildir. Sekmeyi kapatmadan indir. Gözlenen süre elle girilir; plan, ölçülmüş süre diye kaydedilmez.'))}</p>
<p id="draft-status" role="status" aria-live="polite"></p>
<noscript><p class="notice">{esc(t('JavaScript is off: use the four sections on paper. The facilitator collects the first response before handing out the guide, and collects transfer responses before showing answers from the separate teacher page. Use the browser Print command. Digital locking, language-preserving drafts and downloads require JavaScript.', 'JavaScript kapalı: dört bölümü kâğıtta kullan. Öğretmen rehberi vermeden önce ilk yanıtı, ayrı öğretmen sayfasındaki yanıtları göstermeden önce aktarım yanıtını toplar. Tarayıcının Yazdır komutunu kullan. Dijital kilitleme, dil geçişinde taslak koruma ve indirme için JavaScript gerekir.'))}</p></noscript></section>'''
    id_select = select("student-id", t("Participant code", "Katılımcı kodu"), [("", t("Choose code", "Kod seç"))] + [(f"P{i:02}", f"P{i:02}") for i in range(1,9)])
    id_select += select("student-response-language", t("Language used in my responses", "Yanıtlarımda kullandığım dil"), [("", t("Unknown", "Bilinmiyor")), ("en", "English"), ("tr", "Türkçe"), ("mixed", t("Mixed", "Karma"))], description=t("The language you write may differ from the interface. You can update this choice at any stage; switching the interface keeps it. This is context, not a learning score.", "Yazdığın dil arayüzden farklı olabilir. Bu seçimi her aşamada değiştirebilirsin; arayüz dilini değiştirince korunur. Bu bir bağlam bilgisidir, öğrenme puanı değildir."))
    start = '<section class="card session-start">' + id_select + '<p>' + esc(t("Keep both attempts in your own words. A number alone is not an explanation. Conceptual hints and seeing a solution are recorded separately from content quality; record navigation-only help in a note. “Unknown” means this support or language information was not recorded; it does not grade your answer.", "İki denemeyi de kendi cümlelerinle yaz. Tek sayı açıklama değildir. Kavramsal ipucu ve çözümü görme, içeriğin niteliğinden ayrı kaydedilir; yalnız gezinme yardımı aldıysan nota yaz. “Bilinmiyor”, bu destek veya dil bilgisinin kaydedilmediğini belirtir; yanıtını puanlamaz.")) + '</p><div class="actions">' + button("start-pilot", t("Start first attempt", "İlk denemeye başla")) + button("student-print", t("Print student sheet", "Öğrenci formunu yazdır")) + '</div></section>'
    stages = []
    for phase in ("pre", "post"):
        p = tasks["phases"][phase]
        questions = []
        for q in p["questions"]:
            questions.append('<fieldset><legend>' + esc(q["title"][language]) + '</legend><p id="' + phase + '-' + q['id'] + '-prompt">' + esc(q['prompt'][language]) + '</p>'
                + f'<label class="response-label" for="{phase}-{q["id"]}">{esc(t("Your explanation", "Açıklaman"))}</label><textarea id="{phase}-{q["id"]}" name="{phase}-{q["id"]}" rows="3" maxlength="1200" aria-describedby="{phase}-{q["id"]}-prompt"></textarea>{paper_blank(phase + '-' + q['id'])}'
                + select("support-" + phase + "-" + q["id"], t("Support for this response", "Bu yanıtta destek"), support_options(language)) + '</fieldset>')
        stage = '<section class="stage card" data-stage="' + phase + '" aria-labelledby="' + phase + '-title"><p class="eyebrow">' + str(5 if phase == 'pre' else 7) + ' ' + esc(t('minutes planned', 'dakika planlandı')) + '</p><h2 id="' + phase + '-title">' + esc(p['title'][language]) + '</h2><p class="context">' + esc(p['context'][language]) + '</p><p>' + esc(p['instruction'][language]) + '</p>' + ''.join(questions) + phase_fields(phase, phase_names[phase], language)
        stage += '<div class="actions">' + button('finish-' + phase, t('Save first attempt and open guide', 'İlk yanıtı sakla, rehberi aç') if phase == 'pre' else t('Save transfer attempt', 'Aktarımı sakla')) + '</div></section>'
        stages.append(stage)
    practice = '<section class="stage card" data-stage="practice" aria-labelledby="practice-title"><p class="eyebrow">10 ' + esc(t('minutes planned', 'dakika planlandı')) + '</p><h2 id="practice-title">' + esc(t('One learning route · Weeks 1 → 2 → 3', 'Tek öğrenme rotası · Hafta 1 → 2 → 3')) + '</h2><p>' + esc(t('Predict first, then reveal one step. Hints are optional and are recorded. Resetting a demonstration does not erase its hint history. The guide is supported practice, not a scored test.', 'Önce tahmin et, sonra bir adımı aç. İpuçları isteğe bağlıdır ve kaydedilir. Gösterimi sıfırlamak ipucu geçmişini silmez. Rehber destekli çalışmadır; puanlanan bir sınav değildir.')) + '</p>'
    for week in ('w1','w2','w3'):
        g=tasks['practice'][week]
        records = g.get('records', g.get('directory'))
        practice += '<article id="guide-' + week + '" class="guide" aria-labelledby="guide-' + week + '-title"><p class="eyebrow">' + str(g['minutes']) + ' ' + esc(t('minutes planned', 'dakika planlandı')) + '</p><h3 id="guide-' + week + '-title">' + esc(g['title'][language]) + '</h3><p>' + esc(g['prompt'][language]) + '</p><p class="data-line"><strong>' + esc(t('Records', 'Kayıtlar')) + ':</strong> <span class="tokens">' + esc(json.dumps(records)) + '</span>'
        if 'target' in g:
            practice += ' · ' + esc(t('target', 'hedef')) + ': <strong>' + str(g['target']) + '</strong>'
        practice += '</p>'
        if week == 'w2':
            practice += select('guide-w2-mode',t('Loop pattern','Döngü düzeni'),[('sequential',t('Sequential','Ardışık')),('nested',t('Nested','İç içe'))])
        practice += textarea('guide-' + week + '-predict', t('My prediction (optional, ungraded)', 'Tahminim (isteğe bağlı, puanlanmaz)'), 1200, 2)
        practice += '<div class="actions">' + button('guide-' + week + '-next',t('Reveal one step','Bir adımı aç')) + button('guide-' + week + '-reset',t('Start over','Başa dön')) + button('guide-' + week + '-end',t('Reveal worked result','İşlenmiş sonucu aç')) + '</div><p id="guide-' + week + '-state" role="status" aria-live="polite"></p><ol id="guide-' + week + '-history" class="step-history"></ol>'
        practice += '<details data-hint="' + week + '"><summary>' + esc(t('Hint · record that I used it', 'İpucu · kullandığımı kaydet')) + '</summary><p>' + esc(g['hint'][language]) + '</p></details>'
        fragment = {'w1':'trace','w2':'sequential','w3':'binary'}[week]
        practice += '<p class="caption optional-reference"><a href="' + prefix + '../' + week + ('/tr/' if language == 'tr' else '/') + '#' + fragment + '" target="_blank" rel="noopener">' + esc(t('Optional full lesson (new tab)', 'İsteğe bağlı tam ders (yeni sekme)')) + '</a></p></article>'
    practice += phase_fields('practice',phase_names['practice'],language) + '<div class="actions">' + button('finish-practice',t('Begin independent transfer','Bağımsız aktarıma geç')) + '</div></section>'
    reflection = '<section class="stage card" data-stage="reflection" aria-labelledby="reflection-title"><p class="eyebrow">3 ' + esc(t('minutes planned','dakika planlandı')) + '</p><h2 id="reflection-title">' + esc(phase_names['reflection']) + '</h2><p>' + esc(t('Save both original attempts before comparing with the model explanation. Seeing the answer does not change the saved first or transfer response. Add any later correction only in the separate reflection note.', 'Model açıklamayla karşılaştırmadan iki ilk denemeyi sakla. Yanıtı görmek saklanan ilk veya aktarım yanıtını değiştirmez. Sonradan yaptığın düzeltmeyi yalnız ayrı yansıtma notuna ekle.')) + '</p><div class="actions">' + button('show-key',t('Both saved · show explanation','İkisi saklandı · açıklamayı aç')) + '</div><section id="answer-key" class="answer-key" aria-live="polite"></section>'
    reflection += textarea('reflection-notes',t('Reflection or correction after comparison (optional, separate from original responses)','Karşılaştırma sonrası düşüncem veya düzeltmem (isteğe bağlı, ilk yanıtlardan ayrı)'),1200,4) + phase_fields('reflection',phase_names['reflection'],language) + '</section>'
    downloads = '<section class="card save-section"><h2>' + esc(t('Keep your work','Çalışmanı sakla')) + '</h2><p>' + esc(t('Download the current response report even if you did not finish. Open it and check the participant code, both responses and any unfinished stage before giving it to the teacher. Do not put identifying personal information into notes.', 'Bitirmediysen de güncel yanıt raporunu indir. Öğretmene vermeden önce açıp katılımcı kodunu, iki yanıtı ve yarım kalan aşamayı kontrol et. Notlara kişiyi tanımlayan bilgi yazma.')) + '</p><div class="actions">' + button('download-student',t('Download response report (TXT)','Yanıt raporunu indir (TXT)')) + '</div><p id="student-status" role="status" aria-live="polite"></p><div id="student-errors" role="alert"></div><details id="saved-responses"><summary>' + esc(t('Review saved responses','Saklanan yanıtları incele')) + '</summary><div id="saved-response-text"></div></details></section>'
    resets = '<section class="card no-print">' + button('student-reset-request',t('Start a new participant','Yeni katılımcı başlat')) + '<div id="student-reset-confirm" class="confirmation" hidden><p>' + esc(t('This removes this participant’s draft from this browser tab. Download anything you want to keep first.','Bu katılımcının taslağı bu tarayıcı sekmesinden silinecek. Saklamak istediğin çalışmayı önce indir.')) + '</p><div class="actions">' + button('student-reset',t('Yes, remove draft','Evet, taslağı sil'),js=False) + button('student-reset-cancel',t('Cancel','Vazgeç'),js=False) + '</div></div></section>'
    return shell(tasks,language,'student',intro + '<form id="student-form" novalidate>' + start + stages[0] + practice + stages[1] + reflection + downloads + resets + '</form>')


def teacher(tasks: dict, language: str) -> str:
    t=lambda en,tr:label(en,tr,language)
    intro='<section class="intro" aria-labelledby="pilot-title"><p class="eyebrow">'+esc(t('6–8 learners · 25-minute protocol','6–8 öğrenci · 25 dakikalık protokol'))+'</p><h1 id="pilot-title">'+esc(t('Compare the explanations, with their evidence.','Açıklamaları kanıtlarıyla karşılaştır.'))+'</h1><p class="lead">'+esc(t('Use the new Weeks 1–3 pilot: first-match tracing, equality-check counts, the purpose of the output, and the conditions for binary search. Content scores, support, observed time and bottlenecks are separate records.','Yeni Hafta 1–3 pilotunu kullan: ilk eşleşmeyi izleme, eşitlik kontrolü sayımı, çıktının amacı ve ikili aramanın koşulları. İçerik puanı, destek, gözlenen süre ve takılma noktaları ayrı kayıtlardır.'))+'</p><p class="notice">'+esc(t('This is the Weeks 1–3 instrument, not the legacy sensor-network capstone rubric. Use P01–P08 and keep unused records blank. With JavaScript, a draft stays in sessionStorage in this browser tab; no data is sent to a server. Download the current CSV before closing. An import first opens a preview and changes nothing until confirmation.','Bu, eski sensör-ağı bütünleşik uygulama rubriği değil, Hafta 1–3 ölçme aracıdır. P01–P08 kullan; kullanılmayan kayıtları boş bırak. JavaScript açıkken taslak bu tarayıcı sekmesinde sessionStorage içinde tutulur; sunucuya veri gönderilmez. Kapatmadan güncel CSV’yi indir. Yüklenen dosya önce önizlemeyi açar; onaylanmadan kayıtları değiştirmez.'))+'</p><p id="draft-status" role="status" aria-live="polite"></p><noscript><p class="notice">'+esc(t('JavaScript is off: use the student sheet and this teacher form on paper. Print one teacher form per participant. CSV import/export and numerical summaries require JavaScript. Do not treat blank scores or missing time as zero.','JavaScript kapalı: öğrenci yönergesini ve bu öğretmen formunu kâğıtta kullan. Her öğrenci için ayrı öğretmen formu yazdır. CSV yükleme/indirme ve sayısal özet için JavaScript gerekir. Boş puanı veya eksik süreyi sıfır sayma.'))+'</p></noscript></section>'
    admin='<section class="card"><h2>'+esc(t('Before the session','Oturumdan önce'))+'</h2><ol><li>'+esc(t('Check the student language and a downloaded response file; prepare a paper fallback. Allocate anonymous codes to 6–8 learners.','Öğrenci dilini ve indirilen yanıt dosyasını kontrol et; kâğıt seçeneğini hazırla. 6–8 öğrenciye adsız kodlar ayır.'))+'</li><li>'+esc(t('Keep the first attempt individual and save it before the guide. The guide is supported work. Keep transfer individual and save it before showing answers. Never overwrite an original attempt with the model explanation.','İlk deneme bireysel olsun ve rehberden önce saklansın. Rehber destekli çalışmadır. Aktarım bireysel olsun ve yanıtlardan önce saklansın. İlk denemenin üzerine model açıklamayı yazma.'))+'</li><li>'+esc(t('Plan 5 minutes first response, 10 guided work (3+3+4), 7 transfer and 3 reflection/saving. Stop at 25 minutes; keep unfinished responses. Record actual phase times only if observed; navigation help, hints and seeing a solution are different observations.','5 dakika ilk yanıt, 10 rehberli çalışma (3+3+4), 7 aktarım ve 3 yansıtma/saklama planla. 25. dakikada dur; yarım kalan yanıtları koru. Gerçek aşama süresini yalnız gözlendiğinde kaydet; gezinme yardımı, ipucu ve çözümü görmek farklı gözlemlerdir.'))+'</li><li>'+esc(t('Assess the original explanations afterwards using the same four content rubrics. Support is recorded separately and does not automatically change a content score. “Unknown” means the support or language information was not recorded. Explicit “I do not know” can support 0; no response remains unscored.','İlk yazılmış açıklamaları sonradan aynı dört içerik rubriğiyle değerlendir. Destek ayrıca kaydedilir ve içerik puanını kendiliğinden değiştirmez. “Bilinmiyor”, destek veya dil bilgisinin kaydedilmediğini belirtir. Açıkça “Bilmiyorum” yazılması 0 için kanıt olabilir; yanıt yoksa puan boş kalır.'))+'</li></ol></section>'
    form='<section class="card" aria-labelledby="record-title"><h2 id="record-title">'+esc(t('Participant assessment','Katılımcı değerlendirmesi'))+'</h2><p>'+esc(tasks['rubricPolicy'][language])+'</p><form id="record-form" novalidate>'
    form+=select('participant',t('Participant code','Katılımcı kodu'),[(f'P{i:02}',f'P{i:02}')for i in range(1,9)])
    form+=select('response-language',t('Language used for the responses','Yanıtlarda kullanılan dil'),[('',t('Unknown','Bilinmiyor')),('en','English'),('tr','Türkçe'),('mixed',t('Mixed','Karma'))],description=t('Language is context, not a fifth learning score. Unknown language is not assumed to be English or Turkish.','Dil bağlam bilgisidir; beşinci öğrenme puanı değildir. Bilinmeyen dil İngilizce veya Türkçe varsayılmaz.'))
    for dimension in tasks['dimensions']:
        d=dimension['id']
        form+='<fieldset class="dimension"><legend>'+esc(dimension['title'][language])+'</legend><ul class="rubric">'+''.join('<li><strong>'+str(score)+':</strong> '+esc(tasks['rubrics'][d][str(score)][language])+'</li>' for score in (0,1,2))+'</ul><div class="phase-pair">'
        for phase in ('pre','post'):
            phase_title=t('First response','İlk yanıt') if phase=='pre' else t('Transfer response','Aktarım yanıtı')
            form+='<section><h3>'+esc(phase_title)+'</h3>'+select('teacher-'+phase+'-'+d,t('Content score','İçerik puanı'),[('',t('Unscored','Seçilmedi')),('0','0'),('1','1'),('2','2')])+textarea('evidence-'+phase+'-'+d,t('Quote or observation supporting this score (required for a score)','Bu puanı destekleyen alıntı veya gözlem (puan için gerekli)'),1200,3)+select('support-'+phase+'-'+d,t('Support observed for this response','Bu yanıtta gözlenen destek'),support_options(language))+'</section>'
        form+='</div></fieldset>'
    form+='<fieldset><legend>'+esc(t('Observed time and bottlenecks','Gözlenen süre ve takılma noktaları'))+'</legend><p>'+esc(t('Use actual minutes, not the plan. A complete total requires all four phase times. Unobserved time stays blank. For each phase note the difficulty, a brief quote or observed action, and any facilitator help.','Planı değil, gerçek dakikayı kullan. Tam toplam için dört aşamanın süresi gerekir. Gözlenmeyen süre boş kalır. Her aşamada zorluğu, kısa bir alıntıyı veya gözlenen adımı ve öğretmen yardımını belirt.'))+'</p>'
    for phase in tasks['schedule']:
        form+=phase_fields(phase['id'],phase['label'][language],language)
    form+='</fieldset><fieldset><legend>'+esc(t('Guide context','Rehber bağlamı'))+'</legend>'+number('practice-hints',t('Distinct guide hints opened (0–3; optional)','Açılan farklı rehber ipucu (0–3; isteğe bağlı)'),3,'1')+select('practice-solution',t('Any worked guide result shown?','Rehberde tamamlanmış sonuç gösterildi mi?'),[('',t('Unknown','Bilinmiyor')),('no',t('No','Hayır')),('yes',t('Yes','Evet'))])+textarea('teacher-notes',t('Other teacher notes (optional, 1200 characters)','Diğer öğretmen notları (isteğe bağlı, 1200 karakter)'),1200,3)+'</fieldset><div id="record-errors" role="alert"></div><p id="record-status" role="status" aria-live="polite"></p></form></section>'
    summary='<section class="card" aria-labelledby="summary-title"><h2 id="summary-title">'+esc(t('Compare the eight records','Sekiz kaydı karşılaştır'))+'</h2><p>'+esc(t('For each dimension, compare only same-learner pairs with both content scores and evidence. The paired count may differ by dimension. The independent-only comparison also requires both responses to be marked “Alone”; unknown support is never counted as independent. Missing data is not zero.','Her boyutta yalnız aynı öğrencinin iki içerik puanı ve kanıtı bulunan çiftlerini karşılaştır. Eşleşmiş sayı boyuta göre değişebilir. Yalnız bağımsız karşılaştırma, iki yanıtın da “Bağımsız” işaretlenmesini gerektirir; bilinmeyen destek bağımsız sayılmaz. Eksik veri sıfır değildir.'))+'</p><div class="table-scroll" role="region" tabindex="0" aria-label="'+esc(t('Participant comparison','Katılımcı karşılaştırması'))+'"><table><thead><tr><th>'+esc(t('Code','Kod'))+'</th><th>'+esc(t('First /8','İlk /8'))+'</th><th>'+esc(t('Transfer /8','Aktarım /8'))+'</th><th>'+esc(t('Difference','Fark'))+'</th><th>'+esc(t('Minutes','Dakika'))+'</th><th>'+esc(t('Status','Durum'))+'</th></tr></thead><tbody id="comparison-body">'+''.join('<tr><th scope="row">P'+f'{i:02}'+'</th><td>—</td><td>—</td><td>—</td><td>—</td><td>'+esc(t('Blank','Boş'))+'</td></tr>'for i in range(1,9))+'</tbody></table></div><div id="dimension-results"></div><div id="total-results"></div><div id="timing-results"></div><div id="support-results"></div><div id="language-results"></div><p class="notice">'+esc(tasks['interpretation'][language])+'</p>'+textarea('pilot-conclusion',t('What will I change next? Cite a dimension, evidence and any time/bottleneck finding.','Sonraki değişikliğim ne? Bir boyutu, kanıtı ve varsa süre/takılma bulgusunu belirt.'),1200,4)+'</section>'
    imports='<section class="card no-print" aria-labelledby="csv-title"><h2 id="csv-title">'+esc(t('Continue from a CSV','CSV’den devam et'))+'</h2><p>'+esc(t('Choose a Week 1–3 pilot CSV. The file is read on this device, not uploaded to a server. The preview does not change current records. After confirmation, all eight records and the session conclusion are replaced by the file. Download current work first. Legacy sensor-network CSV files belong to the separate legacy pilot and are not reinterpreted with these rubrics.','Hafta 1–3 pilot CSV’si seç. Dosya bu cihazda okunur; sunucuya yüklenmez. Önizleme güncel kayıtları değiştirmez. Onaydan sonra sekiz kayıt ve oturum sonuç notu dosyadakilerle değişir. Güncel çalışmayı önce indir. Eski sensör-ağı CSV’leri ayrı eski pilota aittir; bu rubriklerle yeniden yorumlanmaz.'))+'</p><label for="import-file">'+esc(t('Week 1–3 pilot CSV file','Hafta 1–3 pilot CSV dosyası'))+'</label><input id="import-file" type="file" accept=".csv,text/csv" class="js-only" hidden disabled><p id="import-status" role="status" aria-live="polite"></p><div id="import-preview" hidden><div id="import-summary"></div><div class="actions">'+button('import-apply',t('Confirm and continue','Onayla ve devam et'),js=False)+button('import-cancel',t('Cancel','Vazgeç'),js=False)+'</div></div><div class="actions">'+button('download-template',t('Download blank CSV','Boş CSV indir'))+button('download-results',t('Download current CSV','Güncel CSV indir'))+'</div></section>'
    report='<section class="card" aria-labelledby="report-title"><h2 id="report-title">'+esc(t('Teacher report','Öğretmen raporu'))+'</h2><p>'+esc(t('Generate a report from confirmed current records: four evidence-backed comparisons, support, observed phase times, language context and all bottleneck notes. A pending CSV preview is excluded. Regenerate after edits. Downloaded HTML can be opened offline or printed.','Onaylanmış güncel kayıtlardan rapor üret: kanıta dayalı dört karşılaştırma, destek, gözlenen aşama süreleri, dil bağlamı ve bütün takılma notları. Bekleyen CSV önizlemesi dahil değildir. Düzenlemeden sonra yeniden üret. İndirilen HTML çevrimdışı açılabilir veya yazdırılabilir.'))+'</p><div class="actions">'+button('make-teacher-report',t('Prepare teacher report','Öğretmen raporunu hazırla'))+button('download-teacher-report',t('Download report (HTML)','Raporu indir (HTML)'))+button('teacher-print',t('Print teacher page','Öğretmen sayfasını yazdır'))+'</div><p id="teacher-report-status" role="status" aria-live="polite"></p><pre id="teacher-report-preview" hidden></pre></section>'
    keys='<details class="teacher-answer-key"><summary>'+esc(t('Teacher reference · model answers','Öğretmen başvurusu · örnek yanıtlar'))+'</summary><p>'+esc(t('Keep these explanations away from learners until both attempts are saved. These are assessment references, not automatic scoring rules.','İki deneme de saklanana kadar bu açıklamaları öğrenciden ayrı tut. Bunlar değerlendirme başvurularıdır; otomatik puanlama kuralları değildir.'))+'</p>'
    for phase in ('pre','post'):
        keys+='<h3>'+esc(tasks['phases'][phase]['title'][language])+'</h3><ol>'+''.join('<li><strong>'+esc(q['title'][language])+':</strong> '+esc(q['answer'][language])+'</li>'for q in tasks['phases'][phase]['questions'])+'</ol>'
    keys+='<h3>'+esc(t('Guided work','Rehberli çalışma'))+'</h3><ol>'+''.join('<li><strong>'+esc(tasks['practice'][week]['title'][language])+':</strong> '+esc(tasks['practice'][week]['solution'][language])+'</li>'for week in ('w1','w2','w3'))+'</ol>'
    keys+='</details>'
    reset='<section class="card no-print">'+button('clear-request',t('Clear all pilot records','Bütün pilot kayıtlarını sil'))+'<div id="clear-confirm" class="confirmation" hidden><p>'+esc(t('All eight records and the session conclusion will be removed from this tab. Download current work first.','Sekiz kayıt ve oturum sonuç notu bu sekmeden silinecek. Güncel çalışmayı önce indir.'))+'</p><div class="actions">'+button('clear-all',t('Yes, clear all','Evet, hepsini sil'),js=False)+button('clear-cancel',t('Cancel','Vazgeç'),js=False)+'</div></div></section>'
    return shell(tasks,language,'teacher',intro+admin+form+summary+imports+report+keys+reset)


def main() -> None:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=AA_ROOT,help='Alternate AA root (default: the source aa directory).')
    args=parser.parse_args()
    tasks=load_tasks()
    routes=[('pilot/index.html',student(tasks,'en')),('pilot/tr/index.html',student(tasks,'tr')),
            ('pilot/teacher/index.html',teacher(tasks,'en')),('pilot/teacher/tr/index.html',teacher(tasks,'tr'))]
    for relative,source in routes:
        target=args.output/relative
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(source,encoding='utf-8')
        print(target)


if __name__ == '__main__':
    main()
