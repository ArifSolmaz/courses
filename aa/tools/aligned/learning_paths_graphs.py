"""Learning bridges for BFS and directed DFS, using the shared check helper.

Visible model checks: bfs(graph, 'A') on the undirected AB, AC, BD, CD
diamond plus isolated E returns distances A:0, B:1, C:1, D:2, parents
A:None, B:A, C:A, D:B and eight adjacency-entry inspections. Four vertices
are dequeued; E is absent from the discovery dictionaries. The guided count
is eight. dfs_dependencies(graph) on directed AB, AC, BD, CD returns discovery
[A,B,D,C], finish [D,B,C,A] and four arc inspections. Reversing finish gives
[A,C,B,D]. C->D reaches black D without a cycle; adding D->A must raise
ValueError when A is gray. Its guided count is four, not a timestamp.
"""


def _week_eight(guided):
    check = guided(
        8,
        'Yönsüz kenarları AB, AC, BD, CD olan ve E tepesi yalnız kalan çizgede A’dan BFS bitene kadar <strong>kaç komşuluk '
        'listesi girdisi incelenir?</strong> Önceden keşfedilmiş komşuya bakmayı '
        'da say; kuyruktan çıkarmaları ve diğer Python işlemlerini sayma.',
        8,
        'A, B, C ve D’nin listelerinin her biri iki girdili. E’ye ulaşılmıyor. '
        'Her yönsüz kenarın iki uçtaki kaydını ayrı ayrı say.',
        '<strong>8 inceleme.</strong> 2 + 2 + 2 + 2 = 8 = 2·4 kenar. '
        'Ayrıca 4 tepe kuyruktan çıkarılır; bu ayrı bir sayaçtır. '
        'E’nin uzaklığı 0 değildir: A’dan erişilemez.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w8-title">
<p class="learning-bridge-kicker" id="learning-bridge-w8">Hafta 8 · Kuyruktan en az adımlı yola</p>
<h2 id="lb-w8-title">Sensör ağına kaç bağlantıyla ulaşırsın?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w7/#bridge-path"><strong>← Önce: Hafta 7 — amaca göre yöntem</strong><span>Şimdi sıralama yerine bağlantıları izleyerek erişim arıyoruz.</span></a>
<a href="../w9/#bridge-path"><strong>Sonra: Hafta 9 — derine git, geri dön →</strong><span>Aynı bağlantılarda bu kez döngü ve bağımlılık ara.</span></a>
</nav>
<p>Her bağlantı bir adım olsun. BFS, <a href="../w4/#lb-w4-transfer">Hafta 4’teki FIFO kuyruğuyla</a> önce yakın sensörleri işler. Bir tepeyi <strong>kuyruğa eklerken işaretlemek</strong>, iki farklı komşunun onu tekrar eklemesini önler.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-10">Bu haftanın laboratuvarı: BFS kuyruğunu izle →</a><a href="../bridge/#arama">Önkoşul: arama adımlarını takip et</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — D’nin ebeveynini önce tahmin et</summary>
<p>Yerel görsel A–D’yi gösterir; burada yalnız kalan E’yi ekledik. Bütün komşular sözlükte anahtardır, başlangıç A’dır. Listelerde yazılı sırayı izle.</p>
<pre><code>from collections import deque

def bfs(graph, start):
    distance, parent = {{start: 0}}, {{start: None}}
    queue, scans = deque([start]), 0
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            scans += 1
            if v not in distance:
                distance[v] = distance[u] + 1
                parent[v] = u
                queue.append(v)
    return distance, parent, scans

graph = {{"A": ["B", "C"], "B": ["A", "D"],
         "C": ["A", "D"], "D": ["B", "C"], "E": []}}
distance, parent, scans = bfs(graph, "A")</code></pre>
<p>Kuyruk <code>[A] → [B,C] → [C,D] → [D] → []</code>. D’yi önce B keşfeder: uzaklığı <strong>2</strong>, ebeveyni B; C onu yeniden eklemez. Komşu sırası değişirse ebeveyn C olabilir, en az kenar sayısı değişmez.</p>
</details>
{check}
<details><summary>Matematik köprüsü — iki büyüklüğü birlikte say</summary><p>V tepe, E kenar sayısı olsun. Sabit maliyetli keşif/kuyruk işlemleri modelinde komşuluk listeleriyle tam dolaşım O(V + E); tam satırları taranan matriste O(V²). Bu kaynak araması yalnız erişilen bölgeyi işler; çizgeyi okumak ayrı maliyettir. Sayılar saniye değildir.</p></details>
<div class="learning-bridge-transfer" id="lb-w8-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Doğrudan A–D bağlantısı 10, A–B ve B–D bağlantıları 1’er birim enerji harcıyor. BFS enerji tüketimini en aza indirir mi? Başlangıç E ise ne olur?</p>
<details><summary>Kendi açıklamanı denetle</summary><p>BFS bir kenarlı yolu seçebilir: enerji 10. İki kenarlı A–B–D ise 2 harcar. BFS en az kenarı bulur; farklı ağırlıklarda en düşük toplamı garanti etmez. Negatif olmayan ağırlıklarda Dijkstra uygundur. E’den yalnız E keşfedilir: uzaklığı 0, komşu incelemesi 0.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> keşif anını, kenar sayısını ve ağırlık sınırını açıklayabiliyorsan <a href="../w9/#bridge-path">DFS’ye geç</a>. Takıldıysan <a href="#example-15">FIFO ve işaretleme gerekçesini yeniden izle</a>.</p>
</section>'''


def _week_nine(guided):
    check = guided(
        9,
        'A→B, A→C, B→D, C→D okları olan yönlü çizgede tüm DFS tamamlanınca <strong>kaç yönlü kenar '
        'incelenir?</strong> C → D, D bitmiş olsa da sayılır. Giriş/çıkışları '
        've renk atamalarını bu sayaca katma.',
        4,
        'A’nın iki, B’nin bir, C’nin bir, D’nin sıfır çıkış komşusu var. '
        'Yönsüz çizgedeki gibi ikiyle çarpma.',
        '<strong>4 inceleme.</strong> A→B, B→D, A→C, C→D. Sonuncusu siyah '
        'tepeye gider; incelenir ama yeni çağrı oluşturmaz. Dört tepenin '
        'giriş ve bitiş olayları başka sayaçlardır.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w9-title">
<p class="learning-bridge-kicker" id="learning-bridge-w9">Hafta 9 · Etkin çağrıdan güvenli bağımlılık sırasına</p>
<h2 id="lb-w9-title">Sensör görevlerinde hangi iş hangisini bekler?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w8/#bridge-path"><strong>← Önce: Hafta 8 — katmanları keşfet</strong><span>Kuyruk yerine çağrı yığını kullanınca keşif sırası değişir.</span></a>
<a href="../w10/"><strong>Sonra: Hafta 10 — en az maliyetle bağla →</strong><span>Döngü bilgisini, bütün sensörleri bağlayan ucuz ağı seçmeye taşı.</span></a>
</nav>
<p>A → B, “A işi B’den önce yapılmalı” demektir. DFS bir dalı bitirip geri döner: <strong>beyaz</strong> keşfedilmemiş, <strong>gri</strong> çağrı yığınında etkin, <strong>siyah</strong> bitmiş tepedir.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-3">Bu haftanın laboratuvarı: üç durumu izle →</a><a href="../bridge/#dongu">Önkoşul: tekrarları saymayı hatırla</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — C, D’yi görünce döngü mü var?</summary>
<p>Yerel görselle aynı yönlü çizge; bütün komşular sözlükte anahtardır ve yazılı sırada denenir. İçteki <code>visit</code> çağrıları dönüş yerlerini çağrı yığınında saklar; <code>nonlocal</code> ortak inceleme sayacını günceller.</p>
<pre><code>def dfs_dependencies(graph):
    state = {{u: "white" for u in graph}}
    discovery, finish, scans = [], [], 0
    def visit(u):
        nonlocal scans
        state[u] = "gray"
        discovery.append(u)
        for v in graph[u]:
            scans += 1
            if state[v] == "white":
                visit(v)
            elif state[v] == "gray":
                raise ValueError("directed cycle")
        state[u] = "black"
        finish.append(u)
    for u in graph:
        if state[u] == "white":
            visit(u)
    return discovery, finish, scans

graph = {{"A": ["B", "C"], "B": ["D"], "C": ["D"], "D": []}}
discovery, finish, scans = dfs_dependencies(graph)</code></pre>
<p>Keşif <code>A,B,D,C</code>; bitiş <code>D,B,C,A</code>. C→D incelendiğinde D siyahtır: döngü kanıtı değildir. Ters bitiş <strong>A,C,B,D</strong>, her oku ileri taşıyan geçerli topolojik sıradır; tek olası sıra değildir.</p>
</details>
{check}
<div class="learning-bridge-transfer" id="lb-w9-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>D→A eklenirse hangi durum hatayı kanıtlar? Bağlantısız bir görev, iki yönlü fiziksel bağlantı veya en az bağlantılı yol istendiğinde aynı kararı kullanabilir misin?</p>
<details><summary>Kendi açıklamanı denetle</summary><p>D’den A’ya bakarken A gridir: A→B→D→A döngüsü vardır; topolojik sıra yoktur. Topolojik sıralama yalnız yönlü döngüsüz çizgede (DAG) mümkündür. Dış döngü bağlantısız görevleri de kapsar. Bu kod yönlüdür; basit yönsüz çizgede ebeveyne dönüş kenarı döngü sayılmamalıdır. DFS en az kenarlı yolu garanti etmez; bunun için BFS’ye dön.</p></details></div>
<p>Komşuluk listeleriyle tam DFS O(V + E)’dir; renkler ve çağrı yığını O(V) ek yer kullanır. Çok derin bir çizgede Python’un özyineleme sınırına dikkat et; açık yığın kullanılabilir. <a href="#example-19">Mevcut Python laboratuvarı</a> aynı bağımlılık problemini DFS yerine giriş dereceleriyle <strong>Kahn algoritması</strong> kullanarak çözer.</p>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> gri ile siyahı ayırıp sıranın her oku sağladığını denetleyebiliyorsan <a href="../w10/">Hafta 10’a geç</a>. Takıldıysan <a href="#example-11">döngü oluşturan oku yeniden izle</a>.</p>
</section>'''


def render(week, guided):
    """Render Week 8 or 9 and reject an unintended integration target."""
    if week == 8:
        return _week_eight(guided)
    if week == 9:
        return _week_nine(guided)
    raise ValueError(f'Unsupported graph learning-bridge week: {week}')
