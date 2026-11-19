"""Learning bridges that list exact-length walks, then minimize their cost.

Both panels keep undirected AB=2, BC=2, AC=3. Repeated vertices are allowed;
the protocol stops after exactly k transmissions, even if C is reached early.
enumerate_walks(graph,start,target,steps) returns [(vertex_list,total_cost)].
Listed-neighbor order for k=3 gives A-B-A-C:7, A-C-A-C:9, A-C-B-C:7.
exact_walk_cost(graph,start,target,steps) returns (answer,table), where table
is a list of per-vertex dictionaries. From A, rows 0..3 in A,B,C order are
(0,inf,inf), (inf,2,3), (4,5,4), (7,6,7); answer C is 7. Guided answers are
walk count 3 and cost 7. Both visible functions reject non-integer or negative
steps and missing endpoints with ValueError. Finite integer edge weights,
including negative weights, are valid; all neighbors must be graph keys.
Empty enumeration returns []; an absent optimum is None via min(default=None)
in the worked caller, and infinity in the DP table.
"""


def _week_twelve(guided):
    check = guided(
        12,
        'Yönsüz <strong>AB = 2, BC = 2, AC = 3</strong> ağında A’dan başlayıp '
        '<strong>tam 3 bağlantı geçtikten sonra C’de biten kaç yürüyüş</strong> '
        'vardır? Sensöre yeniden uğramak serbest; erken C’ye varınca durulmaz. '
        'Bekleme ve öz-ilmek yoktur. Toplam maliyeti değil sayıyı yaz.',
        3,
        'İlk adım B veya C’dir. Her dalı tam üç bağlantıya tamamla; yalnız '
        'son tepesi C olanları tut. A–C–A–C de geçerlidir.',
        '<strong>3 yürüyüş.</strong> A–B–A–C (7), A–C–A–C (9), '
        'A–C–B–C (7). Parantezler maliyettir; yürüyüş sayısı değildir.',
        label='Tahminim (yürüyüş sayısı)'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w12-title">
<p class="learning-bridge-kicker" id="learning-bridge-w12">Hafta 12 · Dalları dene, seçimi geri al</p>
<h2 id="lb-w12-title">Üç aktarım turunda C’de biten testleri listele</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w11/#bridge-path"><strong>← Önce: Hafta 11 — en ucuz yol</strong><span>A–C maliyeti 3’tü; şimdi tam üç aktarım koşulunu ekliyoruz.</span></a>
<a href="../w13/#bridge-path"><strong>Sonra: Hafta 13 — aynı durumları birleştir →</strong><span>Tek tek listelemek yerine bu yürüyüşlerin en ucuzunu hesapla.</span></a>
</nav>
<p>Aynı yönsüz sensör ağı: <strong>AB = 2, BC = 2, AC = 3</strong>; ağırlıkları koruyoruz. Bu test protokolü üç aktarım turu sonunda C’de bitmeyi ister. Bekleme yok; aynı sensöre yeniden uğranabilir. Bu nedenle <strong>yürüyüş</strong> arıyoruz; tepe tekrarı yasak bir basit yol aramıyoruz. Bu koşul her haberleşme protokolü için zorunlu değildir.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-18">Bu haftanın laboratuvarı: tam adım koşulunu izle →</a><a href="../bridge/#dongu">Önkoşul: tekrarları adım adım say</a></p>
<p>Yerel laboratuvar yönlü A→B=2, B→C=3, A→C=1 ile <strong>tam iki</strong> bağlantıyı gösterir; aşağıdaki yönsüz üç aktarım testinden farklı girdidir.</p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — erken C’ye varınca devam et</summary>
<p>Tepe adları farklı stringler, bütün komşular sözlük anahtarı; ağırlıklar sonlu tamsayılardır. <code>steps</code> negatif olmayan bir tamsayıdır. <code>append</code> bir seçimi ekler; dönüşte <code>pop</code> onu geri alır.</p>
<pre><code>def enumerate_walks(graph, start, target, steps):
    if type(steps) is not int or steps &lt; 0:
        raise ValueError("invalid steps")
    if start not in graph or target not in graph:
        raise ValueError("unknown endpoint")
    answers, trail = [], [start]
    def search(u, remaining, cost):
        if remaining == 0:
            if u == target:
                answers.append((trail.copy(), cost))
            return
        for v, weight in graph[u]:
            trail.append(v)
            search(v, remaining - 1, cost + weight)
            trail.pop()
    search(start, steps, 0)
    return answers

graph = {{"A": [("B", 2), ("C", 3)],
         "B": [("A", 2), ("C", 2)],
         "C": [("A", 3), ("B", 2)]}}
walks = enumerate_walks(graph, "A", "C", 3)
best = min((cost for _, cost in walks), default=None)</code></pre>
<p>A–B–A–C toplamı <strong>2+2+3=7</strong>. A–C dalı C’de hemen durmaz: A–C–A–C maliyeti 9, A–C–B–C maliyeti 7’dir. Bir dalın dönüşünde izi kopyalamak, sonraki <code>pop</code> işlemlerinin kaydedilmiş cevabı bozmasını önler.</p>
</details>
{check}
<details><summary>Matematik köprüsü — sayma, en iyiyi bulma ve çıktı boyutu</summary><p>Her düğümde iki seçenek olduğundan bu üçgende k aktarım için 2ᵏ tam dal vardır; her biri C’de bitmez. Listeleme üstel büyüyebilir; her bulunan yürüyüşü kopyalamanın da maliyeti vardır. Burada çözüm sayısı <strong>3</strong>, maliyetler <strong>7,9,7</strong>, minimum <strong>7</strong>: üç farklı sorudur.</p></details>
<div class="learning-bridge-transfer" id="lb-w12-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>C’nin bağlantıları kaldırılırsa ne listelenir? Sıfır aktarımda A’dan A’ya ve A’dan C’ye sonuçları ayrı düşün. Bir sensöre tekrar gitmeyi yasaklarsan bu kod aynı problemi çözer mi?</p>
<details><summary>Kendi açıklamanı denetle</summary><p>Ulaşılamayan C için liste boştur; çağıran kodun minimumu <code>None</code> olur. Sıfır aktarımda A–A için <code>(["A"], 0)</code> tek boş yürüyüştür; A–C için çözüm yoktur. Tekrar yasağı gelirse ziyaret geçmişini izlemek gerekir; mevcut kod yürüyüş listeler. Her dalın sonlanmasını maliyet değil, azalan kalan adım sağlar.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> ekle/geri al adımlarını ve tam üç aktarım koşulunu açıklayabiliyorsan <a href="../w13/#bridge-path">minimumu tabloyla bul</a>. Takıldıysan <a href="#example-22">listeleme ile saymanın farkını incele</a>; bu görsel görev altkümelerini kullanır.</p>
</section>'''


def _week_thirteen(guided):
    check = guided(
        13,
        'Aynı yönsüz ağda <strong>AB = 2, BC = 2, AC = 3</strong>. A’dan C’ye '
        '<strong>tam 3 bağlantılı yürüyüşün en küçük toplam maliyeti</strong> '
        'kaçtır? Sensör tekrarına izin var; bir adımlı doğrudan yol bu sorunun '
        'cevabı değildir.',
        7,
        'İkinci satırda D[2,A] = 4 ve D[2,B] = 5. C’ye son bağlantı A’dan '
        '3 veya B’den 2 ekler. İki teklifi karşılaştır.',
        '<strong>7 maliyet birimi.</strong> min(4+3, 5+2) = 7. '
        'A–B–A–C ve A–C–B–C bu maliyeti sağlar; çözüm sayısı olan 3’ü yazma.',
        label='Tahminim (toplam maliyet)'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w13-title">
<p class="learning-bridge-kicker" id="learning-bridge-w13">Hafta 13 · Durumu tanımla, önceki satırdan hesapla</p>
<h2 id="lb-w13-title">Üç aktarımın en ucuzunu tüm yürüyüşleri saklamadan bul</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w12/#bridge-path"><strong>← Önce: Hafta 12 — yürüyüşleri listele</strong><span>Aynı adım sayısında aynı sensörde biten önekleri karşılaştır.</span></a>
<a href="../w14/#bridge-path"><strong>Sonra: Hafta 14 — hesaplama sınırlarını sorgula →</strong><span>Yeni kısıtlar durum uzayını büyüttüğünde verimli çözüm iddiasını yeniden denetle.</span></a>
</nav>
<p>Ağ ve ağırlıklar aynı: <strong>AB = 2, BC = 2, AC = 3</strong>. Üç aktarım turunda C’de bitme ve yeniden uğrama izni sürüyor. Hafta 12’deki üç yürüyüşün maliyetleri 7,9,7 idi; şimdi bütün liste yerine minimumu istiyoruz.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-1">Bu haftanın laboratuvarı: DP durumunu tanımla →</a><a href="../bridge/#matematik">Önkoşul: matematikteki ifadenin anlamını açıkla</a></p>
<p>Yerel laboratuvar genel DP tarifini verir; sensör tablosu aşağıdadır. <a href="#example-7">Mevcut Python laboratuvarı</a> ise <code>cat → cut</code> düzenleme uzaklığını hesaplar.</p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — aynı sensör, farklı adım sayısı</summary>
<p><strong>D[t,v]</strong>, A’dan v’ye tam t bağlantıyla ulaşan yürüyüşün minimum maliyetidir. Bütün komşular tanımlı, ağırlıklar sonlu tamsayı; adım sayısı negatif olmayan tamsayıdır.</p>
<pre><code>def exact_walk_cost(graph, start, target, steps):
    if type(steps) is not int or steps &lt; 0:
        raise ValueError("invalid steps")
    if start not in graph or target not in graph:
        raise ValueError("unknown endpoint")
    infinity = float("inf")
    table = [{{v: infinity for v in graph}}]
    table[0][start] = 0
    for t in range(1, steps + 1):
        previous = table[t - 1]
        current = {{v: infinity for v in graph}}
        for u in graph:
            if previous[u] == infinity:
                continue
            for v, weight in graph[u]:
                offer = previous[u] + weight
                current[v] = min(current[v], offer)
        table.append(current)
    return table[steps][target], table

graph = {{"A": [("B", 2), ("C", 3)],
         "B": [("A", 2), ("C", 2)],
         "C": [("A", 3), ("B", 2)]}}
answer, table = exact_walk_cost(graph, "A", "C", 3)</code></pre>
<div class="dp-scroll"><table class="bfs-table"><caption>D[t,v]: tam t bağlantı için minimum maliyet</caption><thead><tr><th scope="col">t</th><th scope="col">A</th><th scope="col">B</th><th scope="col">C</th></tr></thead><tbody><tr><th scope="row">0</th><td>0</td><td>∞</td><td>∞</td></tr><tr><th scope="row">1</th><td>∞</td><td>2</td><td>3</td></tr><tr><th scope="row">2</th><td>4</td><td>5</td><td>4</td></tr><tr><th scope="row">3</th><td>7</td><td>6</td><td>7</td></tr></tbody></table></div>
<p>D[1,C]=3’ü sonuca taşımıyoruz: bir bağlantı, üç bağlantı değildir. Her yeni satır yalnız önceki satırı okur; aynı satırdaki güncellemeyi tekrar kullanmak adım koşulunu bozabilir.</p>
</details>
{check}
<details><summary>Matematik köprüsü — satırın anlamından bağıntıya</summary><p>Taban <strong>D[0,A]=0</strong>, diğer tepeler için ∞’dur. Geçiş <strong>D[t,v] = min<sub>u→v</sub>(D[t−1,u] + w(u,v))</strong>: son bağlantıdan önceki en iyi maliyete o bağlantıyı ekle. Uygun önceki durum yoksa sonuç ∞ kalır. Burada V sensör, E komşuluk listelerindeki toplam bağlantı kaydı sayısıdır; yönsüz bir bağlantının iki kaydı vardır. k ≥ 1 için çalışma O(k(V+E)), saklanan tablo O(kV) alandır; sabit maliyetli aritmetik varsayılır. Bu kod sıfır satırı dahil (k+1)V hücre saklar; minimum maliyet 7, işlem sayısı değildir.</p></details>
<div class="learning-bridge-transfer" id="lb-w13-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Hiç yürüyüş yoksa veya k=0 ise ne olur? Ağırlık negatifleşirse sonlu k neden Dijkstra’dan farklıdır? “Her sensör en fazla bir kez” şartında (t,v) yeterli mi?</p>
<details><summary>Kendi açıklamanı denetle</summary><p>Çözüm yoksa ∞; k=0 ve başlangıç=hedef ise 0, farklıysa ∞. Sonlu k’de sınırlı sayıda yürüyüş vardır; negatif ağırlıklar da bu tabloda geçerlidir. Dijkstra’nın negatif olmama koşulu buraya taşınmaz. Sensör tekrarı yasaklanırsa geçmişte ziyaret edilen küme de gerekir; (t,v) tek başına gelecekteki seçenekleri belirlemez. Küme içeren durum sayısı üstel büyüyebilir.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> durumu, tabanı ve önceki satır şartını açıklayabiliyorsan <a href="../w14/#bridge-path">hesaplama sınırlarına geç</a>. Takıldıysan <a href="#example-22">durum sayısının neden büyüdüğünü incele</a>; bu görsel gezgin satıcı küme durumlarını karşılaştırır.</p>
</section>'''


def render(week, guided):
    """Render only Weeks 12–13 with the shared numeric-check helper."""
    if week == 12:
        return _week_twelve(guided)
    if week == 13:
        return _week_thirteen(guided)
    raise ValueError(f'Unsupported DP learning-bridge week: {week}')
