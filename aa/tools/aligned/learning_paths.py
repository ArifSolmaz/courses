"""Add the first thirteen weeks' learning bridges without rewriting lesson content.

``apply(page, week)`` accepts a complete HTML page (0 = dashboard). Stable
markers make repeated application safe; ``strip(page)`` recovers its input.
The same adapter serves generated lessons, simple Week 3 and authored card pages.
"""
import re
from . import learning_paths_structures, learning_paths_priority, learning_paths_graphs, learning_paths_networks, learning_paths_dp


PANEL_START = '<!-- AA:LEARNING-BRIDGE:START -->'
PANEL_END = '<!-- AA:LEARNING-BRIDGE:END -->'
ASSETS_START = '<!-- AA:LEARNING-BRIDGE:ASSETS:START -->'
ASSETS_END = '<!-- AA:LEARNING-BRIDGE:ASSETS:END -->'


def strip(page):
    """Remove only this module's two marked additions, preserving other bytes."""
    for start, end in ((PANEL_START, PANEL_END), (ASSETS_START, ASSETS_END)):
        page = re.sub(re.escape(start) + r'.*?' + re.escape(end) + r'\n?', '', page, flags=re.S)
    return page


def _guided(week, prompt, expected, hint, solution, *, label='Tahminim (işlem sayısı)'):
    ident = f'lb-w{week}-count'
    return f'''<div class="learning-bridge-guided">
<h3>2. Bir adımı sen tamamla</h3>
<p>{prompt}</p>
<div class="learning-bridge-check" data-learning-check data-answer="{expected}">
<label for="{ident}">{label}</label>
<div class="learning-bridge-input-row"><input id="{ident}" type="number" min="0" step="1" inputmode="numeric" autocomplete="off" aria-describedby="{ident}-feedback"><button type="button" data-learning-check-button hidden>Yanıtımı kontrol et</button></div>
<p id="{ident}-feedback" class="learning-bridge-feedback" role="status" aria-live="polite">Önce tahminini yaz; gerekirse ipucunu aç.</p>
</div>
<details><summary>İpucu</summary><p>{hint}</p></details>
<details><summary>Çözüm ve gerekçe — kendi hesabından sonra aç</summary><p>{solution}</p></details>
</div>'''


def _home():
    return '''<section class="learning-bridge learning-bridge-home" id="learning-bridge-start" lang="tr" aria-labelledby="learning-bridge-home-title">
<p class="learning-bridge-kicker">İlk on üç hafta için öğrenme köprüsü</p>
<h2 id="learning-bridge-home-title">Koddan gerekçeli algoritma seçimine</h2>
<p>Bir sensör kaydını ararken önce adımları gör, sonra işi say, matematikle genelleştir ve yeni durumda kararını açıkla. Python'u önceden bilmen gerekmiyor; kâğıt üzerinde de ilerleyebilirsin.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="bridge/#basla">Köprü Laboratuvarı'nı aç →</a><a href="w1/#bridge-path">Hafta 1'den başla</a></p>
<ul class="learning-bridge-choices">
<li><a href="w1/#bridge-path"><strong>Kodları ve döngüleri takip etmek</strong><span>Hafta 1: bir aramayı elle yürüt, değişen durumu açıkla.</span></a></li>
<li><a href="w2/#bridge-path"><strong>Matematiksel ifadeleri anlamak</strong><span>Hafta 2: küçük sayımdan C(n)'ye ve büyüme sınırına geç.</span></a></li>
<li><a href="w3/#lb-w3-transfer"><strong>Konuların ne işe yaradığını görmek</strong><span>Hafta 3: sensör kimlikleri için arama yöntemi seç; koşullarını gerekçelendir.</span></a></li>
<li><a href="w1/#bridge-path"><strong>Konular arasındaki bağlantıları kurmak</strong><span>Doğruluk → sayım → veri yapısı → arama → öncelik → sıralama bağını izle.</span></a></li>
</ul>
<p>İlk üç haftadan sonra aynı sensör kayıtlarını sakla, kimlikle bul, önceliklendir ve sırala:</p>
<nav class="learning-bridge-actions" aria-label="Hafta 4–7 öğrenme köprüleri"><a href="w4/#bridge-path">Hafta 4 · Sakla</a><a href="w5/#bridge-path">Hafta 5 · Bul</a><a href="w6/#bridge-path">Hafta 6 · Önceliklendir</a><a href="w7/#bridge-path">Hafta 7 · Sırala</a></nav>
<p>Sonra sensörleri bir ağın düğümleri olarak düşün; kuyruk ve yığınla bağlantıları keşfet:</p>
<nav class="learning-bridge-actions" aria-label="Hafta 8–9 öğrenme köprüleri"><a href="w8/#bridge-path">Hafta 8 · BFS ile katmanları bul</a><a href="w9/#bridge-path">Hafta 9 · DFS ile bağımlılığı incele</a></nav>
<p>Aynı sensör ağında maliyeti de hesaba kat: bütün ağı kurmak ile bir kaynaktan veri göndermek farklı hedeflerdir.</p>
<nav class="learning-bridge-actions" aria-label="Hafta 10–11 öğrenme köprüleri"><a href="w10/#bridge-path">Hafta 10 · Ağı en az maliyetle bağla</a><a href="w11/#bridge-path">Hafta 11 · En ucuz yolları bul</a></nav>
<p>Aynı sensör ağında aktarım sayısını sınırladığında önce seçenekleri üret, sonra aynı alt sonuçları yeniden hesaplamadan kullan:</p>
<nav class="learning-bridge-actions" aria-label="Hafta 12–13 öğrenme köprüleri"><a href="w12/#bridge-path">Hafta 12 · Yürüyüşleri geri izlemeyle üret</a><a href="w13/#bridge-path">Hafta 13 · En iyi alt sonuçları sakla</a></nav>
<p class="learning-bridge-note">İlerleme ölçütü: cevabı görmekten önce tahmin etmek, sonra nedenini açıklamak ve bir sınır durumu denemek. Bu çalışmalar alıştırmadır; dersin mevcut sınav ve not düzeni sürer.</p>
</section>'''


def _week_one():
    guided = _guided(
        1,
        'Aynı listede hedef bu kez <strong>5</strong>. Soldan başlayıp eşitlik bulunduğunda durursan kaç eleman-hedef eşitliği sınarsın?',
        5,
        'İndisler 0 ile başlar; karşılaştırma sayısı 1 ile başlar. Hedefe gelene kadar 4, 7, 2, 9 ve 5 değerlerini sırayla denetle.',
        '<strong>5 karşılaştırma.</strong> 5 son elemandır; önceki dört eşitlik başarısızdır. Hedef listede yoksa da bu listede 5 karşılaştırma gerekir; sonuçları farklıdır.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w1-title">
<p class="learning-bridge-kicker" id="learning-bridge-w1">Hafta 1 · Gör, sonra doğruluğu açıkla</p>
<h2 id="lb-w1-title">Bir sensör kaydını aramak ne demek?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../bridge/#basla"><strong>← Önce: somut bir arama</strong><span>Girdi ve beklenen çıktıyı gör; algoritmanın neyi çözmesi gerektiğini belirle.</span></a>
<a href="../w2/#learning-bridge-w2"><strong>Sonra: Hafta 2 — yapılan işi say →</strong><span>Doğru sonuç istediğimizi belirledikten sonra aynı işin maliyetini karşılaştırabiliriz.</span></a>
</nav>
<p>Sensör kimlikleri <code>[4, 7, 2, 9, 5]</code>. Görev: hedef varsa ilk bulunduğu indisi, yoksa “bulunamadı” sonucunu döndürmek. Her eleman-hedef eşitlik sınamasını bir işlem sayıyoruz.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="../bridge/#arama">Köprü Laboratuvarı: aramayı adım adım izle →</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — önce 9 için tahmin et</summary>
<p>Laboratuvar kodu bulunca “Found!” mesajı verir. Burada aynı aramayı, bulunan indisi döndürecek şekilde yazıyoruz; <code>enumerate</code> her elemanla birlikte 0'dan başlayan indisini verir. <code>None</code>, bulunamadı sonucudur; bir indis değildir.</p>
<pre><code>def find_sensor(sensors, target):
    for i, value in enumerate(sensors):
        if value == target:
            return i
    return None

find_sensor([4, 7, 2, 9, 5], 9)  # 3</code></pre>
<p>Hedef 9: <code>4 ≠ 9 → 7 ≠ 9 → 2 ≠ 9 → 9 = 9</code>. Dört karşılaştırma sonunda indis <strong>3</strong> döner; arama durur. Hedef 6 ise beş eleman da denenir ve “bulunamadı” döner.</p>
<p>Neden daha önceki bir hedefi kaçırmadık? Her yeni adımdan önce, daha önce kontrol ettiğimiz hiçbir eleman hedefe eşit değildir. Liste bittiğinde bu gerekçe bütün elemanları kapsar.</p>
</details>
{guided}
<div class="learning-bridge-transfer" id="lb-w1-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Aranan kimlik <strong>ilk elemanda</strong>, <strong>hiç yok</strong> veya liste <strong>boş</strong> olsaydı ne dönerdi, kaç karşılaştırma yapardın? Cevabı açmadan önce sonuç ile işlem sayısını ayrı ayrı yaz veya bir arkadaşına anlat.</p>
<details><summary>Kendi açıklamanı denetle</summary><p>İlk elemandaki hedef: indis 0, bir karşılaştırma. Olmayan hedef: “bulunamadı”, beş karşılaştırma. Boş liste: “bulunamadı”, sıfır eleman-hedef karşılaştırması. “İlk elemana bakıp yoksa bırak” kuralı, hedef 9 iken yanlış sonuç verir; bu bir karşı örnektir. Birkaç başarılı deneme bütün yasal girdiler için doğruluk ispatı değildir.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> bir adımı, durma koşulunu ve boş listeyi açıklayabiliyorsan <a href="../w2/#learning-bridge-w2">Hafta 2'de sayımı genelleştir</a>. Takıldıysan <a href="../bridge/#arama">aramayı sıfırlayıp hedef 6 ile yeniden izle</a>.</p>
</section>'''


def _week_two():
    guided = _guided(
        2,
        'Beş kayıtta bulunmayan hedef için <strong>5</strong> eşitlik sınaması yaptık. Liste <strong>10 kayda</strong> büyür ve hedef yine bulunmazsa kaç eşitlik sınaması gerekir?',
        10,
        'Durma nedeni hedefi bulmak değil listenin bitmesi. Her kayıt için tam bir eşitlik sınaması var.',
        '<strong>C(10) = 10.</strong> C(10)/C(5) = 10/5 = 2; bu sayımda girdi iki katına çıkınca iş de iki katına çıkar. Genel en kötü durum C(n) = n, yani Θ(n).'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w2-title">
<p class="learning-bridge-kicker" id="learning-bridge-w2">Hafta 2 · Sayımdan matematiğe geç</p>
<h2 id="lb-w2-title">Beş kayıtla gördüğümüzü n kayıt için nasıl söyleriz?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w1/#learning-bridge-w1"><strong>← Önce: Hafta 1 — doğru sonuç</strong><span>Girdi, çıktı ve durma koşulu aynı olmalı ki maliyetleri karşılaştıralım.</span></a>
<a href="../w3/#learning-bridge-w3"><strong>Sonra: Hafta 3 — koddan toplam kur →</strong><span>Bir aramanın sayımını, değişen döngü tekrarlarına uygula.</span></a>
</nav>
<p>Hafta 1'deki sensör aramasına dön: saydığımız birim <strong>eleman ile hedefin eşitliğini sınamak</strong>. İndis artırma, döngü koşulu veya saniye ölçümü bu sayaca dahil değil. Sayım birimini söylemeden iki sayıyı karşılaştırma.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="../bridge/#matematik">Köprü Laboratuvarı: sayıyı matematikle açıkla →</a><a href="../bridge/#secim">Girdi büyüyünce ne değişir?</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — en iyi ve en kötü durumu ayır</summary>
<p><code>[4, 7, 2, 9, 5]</code> listesinde 4 aranırsa 1, 9 aranırsa 4, bulunmayan 6 aranırsa 5 eşitlik sınaması yapılır. Uzunluğu n ≥ 1 olan listelerde <strong>C<sub>best</sub>(n) = 1</strong>, <strong>C<sub>worst</sub>(n) = n</strong>. Boş listeyi ayrıca ele alırız: C(0) = 0.</p>
<p>En kötü sayım Θ(n)'dir: n ile hem alttan hem üstten sınırlıdır. O(n) bir üst sınırdır; örneğin O(n²) de geçerli bir üst sınırdır ama sıkı büyüme sınıfını söylemez. Big-O tek başına “en kötü durum” demek değildir; önce hangi durumu saydığını belirt.</p>
</details>
{guided}
<details><summary>Matematik köprüsü — küçük terimleri neden bırakıyoruz?</summary>
<p>Başka bir algoritmanın sayımı T(n) = 3n² + 5n + 7 olsun. n ≥ 1 için 5n ≤ 5n² ve 7 ≤ 7n²; dolayısıyla <strong>3n² ≤ T(n) ≤ 15n²</strong>. Alt sabit 3, üst sabit 15 ve eşik n₀ = 1, Θ(n²) iddiasını doğrular. Bunlar işlem sayısı sınırlarıdır; saniye cinsinden kesin süre değildir.</p></details>
<div class="learning-bridge-transfer" id="lb-w2-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Bir kontrolcü 100 kayıt içinde arama yapıyor. Bir denemede hedef ilk kayıtta bulundu. “Bu arama her zaman bir işlem sürer” diyebilir misin? Aynı veri için bu iddiayı bozan hedefi seç ve süre bütçesi verirken hangi durumu kullanacağını gerekçelendir.</p>
<details><summary>Kendi açıklamanı denetle</summary><p>İlk kayıt yalnızca o denemenin maliyetini verir. Hedef son kayıtta veya listede yoksa 100 eşitlik sınaması gerekir; bu, “her zaman 1” iddiasına karşı örnektir. Bir son tarihi her girdide karşılamak için en kötü durum gerekir. Gerçek süre hesabı ayrıca her işlemin maliyetini ve kalan işleri gerektirir; tek ölçüm veya Θ sınıfı kesin süre garantisi vermez.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> saydığın birimi, girdi durumunu ve C(n)'yi söyleyebiliyorsan <a href="../w3/#learning-bridge-w3">Hafta 3'te bir toplam kur</a>. Formül havada kalıyorsa <a href="../bridge/#arama">önce beş kaydın sayımına dön</a>.</p>
</section>'''


def _week_three():
    guided = _guided(
        3,
        'Aynı sensör çiftlerini denetleme işinde <strong>n = 5</strong> olsun. <code>for i in range(n): for j in range(i):</code> gövdesi toplam kaç kez çalışır?',
        10,
        'Her i için j = 0, …, i−1. Dış döngünün beş turuna karşılık 0 + 1 + 2 + 3 + 4 yaz; sonra topla.',
        '<strong>10 kez.</strong> C(5) = 5·4/2 = 10. n = 4 olsaydı 0 + 1 + 2 + 3 = 6 olurdu. Her çift bir kez sayılır; n² sayımı kendisiyle eşleşmeleri ve ters yöndeki tekrarları da içerir.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w3-title">
<p class="learning-bridge-kicker" id="learning-bridge-w3">Hafta 3 · Kodu toplamla, sonucu kararla bağla</p>
<h2 id="lb-w3-title">Aramadan sensör çiftlerine: hangi iş kaç kez?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w2/#learning-bridge-w2"><strong>← Önce: Hafta 2 — sayım birimi ve büyüme</strong><span>Şimdi her döngü turunun katkısını toplayarak C(n)'yi çıkarıyoruz.</span></a>
<a href="../w4/#bridge-path"><strong>Sonra: Hafta 4 — diziler ve bağlı listeler →</strong><span>İkili aramadaki hızlı orta elemana erişimin, veri yapısına bağlı olduğunu incele.</span></a>
</nav>
<p>Aynı sensörlerin bu kez her farklı çiftini bir kez karşılaştıralım. Önce tek karşılaştırmayı tanımla, sonra tekrarları yaz; yalnızca “iki döngü var” diyerek sonucu seçme.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="../bridge/#dongu">Köprü Laboratuvarı: kare ve üçgen sayımı karşılaştır →</a><a href="../bridge/#secim">Arama yöntemini seç</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — n = 3 için çiftleri önce yaz</summary>
<pre><code>for i in range(n):
    for j in range(i):
        compare(sensor[i], sensor[j])</code></pre>
<p>n = 3 iken i = 0 hiç çift üretmez; i = 1 için (1,0), i = 2 için (2,0) ve (2,1) vardır. Toplam <strong>0 + 1 + 2 = 3</strong>. Genel sayım <strong>C(n) = n(n−1)/2</strong>. n ≥ 2 için n²/4 ≤ C(n) ≤ n²/2; dolayısıyla Θ(n²). n = 0 ve n = 1 için sayı 0'dır.</p>
<p>İç döngü <code>range(n)</code> olsaydı n² çağrı olurdu. Aynı Θ(n²) sınıfı, aynı kesin sayım veya aynı işi yapmak demek değildir.</p>
</details>
{guided}
<div class="learning-bridge-transfer" id="lb-w3-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>1.024 sensör kimliğinde tekrar tekrar arama yapacaksın. Veri sıralı bir dizideyse hangi yöntemi seçersin? Veri sırasızsa veya ortaya ulaşmak için bağlantıları yürümen gerekiyorsa kararının hangi gerekçesi değişir? Önce yöntem, önkoşul ve maliyetini kendi cümlelerinle açıkla.</p>
<details><summary>Kendi açıklamanı denetle</summary><p>Sıralı ve indisle sabit zamanda erişilen dizide ikili arama uygundur. Bir <strong>yoklama</strong>yı orta anahtarla hedefin tek üç yönlü karşılaştırması olarak sayarsak, n ≥ 1 için en kötü durumda en fazla ⌊log₂ n⌋ + 1 yoklama gerekir; 1.024 kayıtta <strong>11</strong>. Gerçek kodda <code>==</code> ve <code>&lt;</code> ayrı ayrı sayılırsa ilkel karşılaştırma sayısı farklı olabilir.</p>
<p>Sırasız <code>[4, 7, 2, 9, 5]</code> üzerinde ortayı seçip yarıyı atmak güvenli değildir: örneğin 7, orta değer 2'den büyük olsa da soldadır. Önce sıralama gerekiyorsa bunun ve güncellemelerin maliyetini ekle. Bağlı listede ortayı bulmak için yürümek gerektiğinden logaritmik yoklama sayısı otomatik olarak logaritmik zaman vermez. Bu bağ, Hafta 4'teki veri yapısı seçiminin nedenidir.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> küçük bir girdide çiftleri yazıp toplamı genelleyebiliyor ve arama tercihini önkoşullarıyla açıklayabiliyorsan <a href="../w4/#bridge-path">Hafta 4'e geç</a>. Sayımda takıldıysan <a href="../bridge/#dongu">n = 3 ile döngüyü yeniden izle</a>; ardından aşağıdaki dersle devam et.</p>
</section>'''


def apply(page, week):
    """Idempotently enrich dashboard / Weeks 1–13; other pages are unchanged."""
    if week not in range(14):
        return page
    page = strip(page)
    base = '' if week == 0 else '../'
    assets = (ASSETS_START + '\n'
              + f'<link rel="stylesheet" href="{base}assets/learning-bridges.css?v=2">\n'
              + f'<script defer src="{base}assets/learning-bridges.js?v=1"></script>\n'
              + ASSETS_END + '\n')
    if '</head>' not in page:
        raise ValueError(f'Week {week}: missing head boundary')
    page = page.replace('</head>', assets + '</head>', 1)
    if week in (4, 5):
        panel = learning_paths_structures.render(week, _guided)
    elif week in (6, 7):
        panel = learning_paths_priority.render(week, _guided)
    elif week in (8, 9):
        panel = learning_paths_graphs.render(week, _guided)
    elif week in (10, 11):
        panel = learning_paths_networks.render(week, _guided)
    elif week in (12, 13):
        panel = learning_paths_dp.render(week, _guided)
    else:
        panel = {0: _home, 1: _week_one, 2: _week_two, 3: _week_three}[week]()
    block = PANEL_START + '\n' + panel + '\n' + PANEL_END + '\n'
    if week == 0:
        anchor = '<section class="schedule"'
    elif '<nav class="week-tabs"' in page:
        anchor = '<nav class="week-tabs"'
    elif '<article id="scene"' in page:
        anchor = '<article id="scene"'
    else:
        # The plain-language Week 3 is intentionally a self-contained page.
        anchor = '<div class="rule">'
    if anchor not in page:
        raise ValueError(f'Week {week}: missing learning-bridge insertion boundary')
    return page.replace(anchor, block + anchor, 1)
