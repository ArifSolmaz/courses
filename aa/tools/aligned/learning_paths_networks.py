"""Learning bridges for network installation and weighted shortest routes.

Both weeks use undirected AB=2, BC=2, AC=3 on string vertices A,B,C.
Visible Python contracts: mst(vertices, edges) -> (chosen, total), where each
physical edge is one (u,v,weight) tuple and chosen contains the accepted tuples.
It returns AB,BC with total 4; on disconnected input it returns a minimum
spanning forest. dijkstra(graph,start) -> (distance,parent) accepts adjacency
lists of (destination,weight) pairs, rejects any negative weight with ValueError
(including unreachable edges), and leaves unreachable keys at infinity/None.
All neighbors must be declared keys; the start must be present. Weights are
finite integers. Triangle output from A is distances A:0,B:2,C:3 and parents
A:None,B:A,C:A. Guided answers are costs 4 and 3, never operation counts.
"""


def _week_ten(guided):
    check = guided(
        10,
        'Üç sensörü bağlayacaksın: <strong>AB = 2, BC = 2, AC = 3</strong>. '
        'Yönsüz ağın bütün tepelerini bağlayan bir ağacın en küçük '
        '<strong>toplam kablo maliyeti</strong> kaçtır? İşlem sayısını hesaplama.',
        4,
        'Bir kenar üç tepeyi bağlamaz; üç kenar çevrim oluşturur. '
        'İki kenarlı üç seçeneğin toplamlarını karşılaştır.',
        '<strong>4 maliyet birimi.</strong> AB + BC = 2 + 2 = 4; diğer iki '
        'ağaç 2 + 3 = 5’er birimdir. En iyi seçim üç sensörü de bağlar.',
        label='Tahminim (toplam maliyet)'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w10-title">
<p class="learning-bridge-kicker" id="learning-bridge-w10">Hafta 10 · Döngüsüz bağla, toplam maliyeti azalt</p>
<h2 id="lb-w10-title">Sensör ağını kurmak mı, bir mesajı ulaştırmak mı?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w9/#bridge-path"><strong>← Önce: Hafta 9 — döngüyü tanı</strong><span>Şimdi çevrim oluşturmayan bağlantıları maliyetle birlikte seç.</span></a>
<a href="../w11/#bridge-path"><strong>Sonra: Hafta 11 — tek yolun maliyeti →</strong><span>Ucuz kurulan ağ, her mesajın en ucuz yolu olmayabilir.</span></a>
</nav>
<p>A, B, C sensörleri arasındaki yönsüz kabloların maliyetleri <strong>AB = 2, BC = 2, AC = 3</strong>. Minimum kapsayan ağaç (MST), hepsini bağlarken <strong>seçilen kabloların toplamını</strong> küçültür. Buradaki birimler para veya kablo uzunluğu olabilir.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-19">Bu haftanın laboratuvarı: aynı ağda iki amacı karşılaştır →</a><a href="../bridge/#secim">Önkoşul: yöntemi koşullarıyla seç</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — Kruskal hangi kenarı reddeder?</summary>
<p>Tepe listesi farklı stringlerden oluşur; ağırlıklar sonlu tamsayıdır. Her uç önceden tanımlı, her yönsüz kenar bir kez yazılıdır. Kruskal ucuzdan pahalıya ilerler. <code>find</code> aynı gruptaki uçları tanır; küçük grup büyüğe bağlanır.</p>
<pre><code>def mst(vertices, edges):
    parent = {{v: v for v in vertices}}
    size = {{v: 1 for v in vertices}}
    def find(v):
        while v != parent[v]:
            parent[v] = parent[parent[v]]
            v = parent[v]
        return v
    chosen, total = [], 0
    for u, v, weight in sorted(edges, key=lambda e: e[2]):
        a, b = find(u), find(v)
        if a == b:
            continue
        if size[a] &lt; size[b]:
            a, b = b, a
        parent[b] = a
        size[a] += size[b]
        chosen.append((u, v, weight))
        total += weight
    return chosen, total

chosen, total = mst(["A", "B", "C"],
    [("A", "B", 2), ("B", "C", 2), ("A", "C", 3)])</code></pre>
<p>AB kabul edilir; BC ayrı grupları birleştirir. AC incelendiğinde uçlar zaten bağlıdır: eklenirse çevrim olur. Seçim AB, BC; toplam <strong>4</strong>.</p>
</details>
{check}
<details><summary>Matematik köprüsü — kenar sayısı, maliyet ve çalışma farklıdır</summary><p>Üç olası ağacın toplamı 4, 5, 5’tir. Bağlı V tepeli ağaç <strong>V−1 kenar</strong> içerir; maliyeti <strong>Σ<sub>e∈T</sub>w(e)</strong>, seçilen T kenarlarının ağırlık toplamıdır. Kenar sayısı 2 iken toplam maliyet 4 olabilir. <a href="../w7/#bridge-path">Hafta 7’deki sıralama</a> burada kenarları hazırlar. Sabit maliyetli karşılaştırmalar ve uygun union-find ile Kruskal’ın çalışma sınırı O(V + E log E)’dir (E ≥ 2). Bu sınır kablo maliyeti veya saniye değildir.</p></details>
<div class="learning-bridge-transfer" id="lb-w10-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>“Bir kablo kopsa da iletişim sürsün” şartı eklendi. MST yeterli mi? Hiç bağlantısı olmayan D sensörü eklenirse kodun döndürdüğü 4 neyi anlatır?</p>
<details><summary>Kendi açıklamanı denetle</summary><p>Ağaçta bir kenarın kopması ağı böler; yedeklilik ayrı tasarım şartıdır. Bu üçgende üç kabloyu da kurmak 7 birimdir ve tek kopmaya dayanır. Yalnız D eklenirse bütün tepeleri kapsayan ağaç yoktur. Kod, bileşenlerin minimum kapsayan ormanını döndürür: ABC’nin ağacı ve yalnız D; 4, tüm ağı bağlama garantisi değildir.</p></details></div>
<p><a href="#example-18">Mevcut Kruskal Python laboratuvarı</a> beş tepeli Graph W kullanır; yukarıdaki kod aynı kuralı üç sensöre uygular.</p>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> seçilen kenarları, geçerliliği ve toplamı açıklayabiliyorsan <a href="../w11/#bridge-path">aynı üçgende A–C yoluna geç</a>. Takıldıysan <a href="#example-10">Kruskal kabul/ret adımlarını izle</a>; bu görsel Graph W’dir.</p>
</section>'''


def _week_eleven(guided):
    check = guided(
        11,
        'Aynı yönsüz ağda <strong>AB = 2, BC = 2, AC = 3</strong>. '
        '<strong>A’dan C’ye en düşük toplam yol maliyeti</strong> kaçtır? '
        'MST’nin toplamını veya kenar sayısını yazma.',
        3,
        'A–C doğrudan yolunu ve A–B–C yolunu karşılaştır. '
        'Sadece MST’de seçilmiş kablolarla sınırlı değilsin.',
        '<strong>3 maliyet birimi.</strong> Doğrudan AC = 3; B üzerinden '
        '2 + 2 = 4. C’nin ebeveyni A olur. MST toplamı 4 farklı bir sorunun cevabıdır.',
        label='Tahminim (toplam maliyet)'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w11-title">
<p class="learning-bridge-kicker" id="learning-bridge-w11">Hafta 11 · Teklifleri karşılaştır, en ucuz yolu koru</p>
<h2 id="lb-w11-title">Aynı sensör ağında bir mesaj hangi yolu izlemeli?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w10/#bridge-path"><strong>← Önce: Hafta 10 — kurulum toplamı</strong><span>Aynı üçgende şimdi tek kaynaktan yol toplamını küçült.</span></a>
<a href="../w12/"><strong>Sonra: Hafta 12 — alt sonuçları yeniden kullan →</strong><span>En iyi bilinen değeri saklama fikrini tekrar eden alt problemlere taşı.</span></a>
</nav>
<p>Yönsüz ağ yine <strong>AB = 2, BC = 2, AC = 3</strong>; bu kez ağırlık mesajın bağlantıyı geçme maliyetidir. MST’deki A–B–C yolu 4, özgün ağdaki doğrudan A–C yolu 3’tür. Hangi toplamı en aza indirdiğini önce söyle.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-1">Bu haftanın laboratuvarı: aynı üçgende ağ ve yolu ayır →</a><a href="../bridge/#secim">Önkoşul: yöntemin koşullarını sorgula</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — B’den gelen teklif C’yi iyileştirir mi?</summary>
<p>Tepe adları farklı stringlerdir; bütün komşular sözlük anahtarıdır. Başlangıç mevcut olmalı; ağırlıklar sonlu, negatif olmayan tamsayılardır. Yönsüz bağlantıları iki yönde yazıyoruz. <a href="../w6/#bridge-path">Min-öbek</a>, en ucuz bekleyen teklifi verir.</p>
<pre><code>import heapq

def dijkstra(graph, start):
    if start not in graph:
        raise ValueError("unknown source")
    if any(w &lt; 0 for edges in graph.values() for _, w in edges):
        raise ValueError("negative weight")
    distance = {{v: float("inf") for v in graph}}
    parent = {{v: None for v in graph}}
    distance[start] = 0
    queue = [(0, start)]
    while queue:
        cost, u = heapq.heappop(queue)
        if cost != distance[u]:
            continue
        for v, weight in graph[u]:
            candidate = cost + weight
            if candidate &lt; distance[v]:
                distance[v] = candidate
                parent[v] = u
                heapq.heappush(queue, (candidate, v))
    return distance, parent

graph = {{"A": [("B", 2), ("C", 3)],
         "B": [("A", 2), ("C", 2)],
         "C": [("A", 3), ("B", 2)]}}
distance, parent = dijkstra(graph, "A")</code></pre>
<p>A işlenince B’ye 2, C’ye 3 teklif edilir. B’nin C’ye teklifi <code>2 + 2 = 4</code>; mevcut 3’ten küçük olmadığı için kayıt değişmez. Son uzaklıklar A:0, B:2, C:3. Eski öbek kaydı güncel uzaklığa eşit değilse atlanır; eşit maliyetli teklif ebeveyni değiştirmez.</p>
</details>
{check}
<details><summary>Matematik köprüsü — “gevşetmek” hangi sayıyı değiştirir?</summary><p><strong>d[v] ← min(d[v], d[u] + w)</strong>: v için mevcut en iyi teklif ile u üzerinden yeni teklifi karşılaştır; küçüğünü sakla. d[v], henüz sonuçlanmadan önce son minimumu garanti etmez. Dijkstra’da negatif olmayan ağırlıklar en küçük güncel teklifin kesinleşmesini sağlar. <a href="../w8/#bridge-path">Hafta 8’deki BFS</a> eşit pozitif ağırlıklarda yeterlidir. <a href="../w9/#bridge-path">Hafta 9’daki topolojik sıra</a> ise DAG’da, negatif ağırlıklar olsa da kenarları sırayla gevşetmeye izin verir.</p></details>
<div class="learning-bridge-transfer" id="lb-w11-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>C’nin bütün bağlantıları koparsa ne döndürmelisin? Sıfır maliyetli kenar Dijkstra’yı bozar mı? Negatif ölçüm girilince kodun neden sonuç vermemesi gerekir?</p>
<details><summary>Kendi açıklamanı denetle</summary><p>C tanımlı fakat erişilemezse uzaklığı ∞, ebeveyni <code>None</code> kalır; 0 veya bir yol uydurulmaz. Sıfır ağırlık geçerlidir. Kod, erişilmeyen bölümdekiler dahil her negatif kenarı baştan reddeder. Bu yönsüz ağda negatif kenarda gidip gelmek toplamı sınırsız azaltabilir; en kısa yürüyüşün sonlu minimumu kalmaz.</p></details></div>
<p><a href="#example-19">Mevcut Dijkstra Python laboratuvarı</a> yönlü A→B=2, A→C=5, B→C=1 girdisini kullanır; buradaki yönsüz üçgenle aynı girdi değildir.</p>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> yol toplamını, gevşetmeyi ve önkoşulu açıklayabiliyorsan <a href="../w12/">alt problemlere geç</a>. Takıldıysan <a href="#example-6">Dijkstra’nın seçim sırasını izle</a>; bu görsel de yönlü 2,5,1 örneğidir.</p>
</section>'''


def render(week, guided):
    """Render only Weeks 10–11, using the shared cost-label check helper."""
    if week == 10:
        return _week_ten(guided)
    if week == 11:
        return _week_eleven(guided)
    raise ValueError(f'Unsupported network learning-bridge week: {week}')
