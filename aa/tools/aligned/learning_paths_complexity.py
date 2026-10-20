"""Final learning bridge: certificates, exhaustive search and reductions.

Keep undirected weighted AB=2, BC=2, AC=3; the endpoint-cover question ignores
these weights. Visible inputs are distinct string vertices and a simple graph's
(u,v,weight) triples, with declared endpoints. verify_cover(vertices,edges,
candidate,k) accepts a list of distinct declared strings covering every edge
with at most k choices. It returns False for malformed candidates or k not a
nonnegative built-in int. find_cover(vertices,edges,k) rejects invalid k with
ValueError, returns a witness list, and uses None only when no witness exists.
The triangle gives ['A','B'] at k=2 and None at k=1; an edgeless graph gives []
at k=0. Guided minimum count is 2. A failed certificate is not a no-instance
proof, and a feasible certificate alone is not an optimality proof.
"""


def _week_fourteen(guided):
    check = guided(
        14,
        '<strong>AB, BC, AC</strong> üçgeninde her bağlantının en az bir '
        'ucu seçili olmalı. <strong>En az kaç sensör</strong> gerekir? '
        'Korunan 2,2,3 bağlantı ağırlıkları bu soruda toplanmaz.',
        2,
        'Tek sensörde karşı bağlantı açıkta kalır. İki sensörün '
        'bütün bağlantılara değdiğini denetle.',
        '<strong>2 sensör.</strong> Yalnız A, BC’yi; yalnız B, AC’yi; '
        'yalnız C, AB’yi açık bırakır. A ve B ise bütün bağlantıları kapsar. '
        'Alt sınır ve geçerli seçim, minimumun 2 olduğunu gösterir.',
        label='Tahminim (sensör sayısı)'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w14-title">
<p class="learning-bridge-kicker" id="learning-bridge-w14">Hafta 14 · Bulmak, doğrulamak ve garanti vermek</p>
<h2 id="lb-w14-title">Bütün bağlantıları hangi sensör uçlarından izlersin?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w13/#bridge-path"><strong>← Önce: Hafta 13 — durum ve sınır</strong><span>Şimdi aday bulma işiyle verilen adayı denetleme işini ayır.</span></a>
<a href="../review/"><strong>Sonra: dersin toplu tekrarına geç →</strong><span>Aynı ağda farklı amaçların neden farklı yöntemler gerektirdiğini açıkla.</span></a>
</nav>
<p>Aynı yönsüz ağ: <strong>AB = 2, BC = 2, AC = 3</strong>. En çok k sensörde uç izlemeyi aç: her bağlantının en az bir ucu seçili olsun. Her sensör bir bütçe birimidir. Enerji/kablo ağırlıkları saklıdır, fakat <strong>kullanılmaz</strong>. Bu, tepe örtüsü (vertex cover) karar sorusudur.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-12">Bu haftanın laboratuvarı: izleme uçlarını seç →</a><a href="../bridge/#secim">Önkoşul: amaç ve koşula göre yöntem seç</a></p>
<p>Yerel kamera laboratuvarı farklı <strong>A–B–C–D yolunu</strong> kullanır; aşağıdaki üçgenle aynı girdi değildir.</p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — B neden yetmiyor, A ve B neden yetiyor?</summary>
<p>Tepe adları farklı stringler; basit yönsüz kenarların uçları tanımlıdır. Aday bir string listesidir. Arayıcı adayları boyut sırasıyla denetleyiciye verir.</p>
<pre><code>from itertools import combinations

def verify_cover(vertices, edges, candidate, k):
    if type(k) is not int or k &lt; 0 or type(candidate) is not list:
        return False
    if len(candidate) &gt; k:
        return False
    known = set(vertices)
    if any(type(v) is not str or v not in known for v in candidate):
        return False
    chosen = set(candidate)
    if len(chosen) != len(candidate):
        return False
    return all(u in chosen or v in chosen for u, v, _ in edges)

def find_cover(vertices, edges, k):
    if type(k) is not int or k &lt; 0:
        raise ValueError("invalid budget")
    for size in range(min(k, len(vertices)) + 1):
        for group in combinations(vertices, size):
            candidate = list(group)
            if verify_cover(vertices, edges, candidate, k):
                return candidate
    return None

vertices = ["A", "B", "C"]
edges = [("A", "B", 2), ("B", "C", 2), ("A", "C", 3)]
single_ok = verify_cover(vertices, edges, ["B"], 1)
witness = find_cover(vertices, edges, 2)</code></pre>
<p><code>["B"]</code> AB ve BC’yi kapsar, AC’yi açık bırakır: <code>False</code>. <code>["A","B"]</code> her kenarı kapsar: k=2 için EVET tanığıdır. Bir başarısız aday, diğerlerini elemez; HAYIR kanıtı değildir.</p>
</details>
{check}
<details><summary>Matematik köprüsü — hızlı denetim, büyük aday uzayı</summary><p>Küme üyeliği beklenen sabit maliyetliyse denetim O(|V|+|E|+|aday|) iştir; arama en çok <strong>2<sup>|V|</sup> altküme</strong> dener. Polinom sınıflandırması girdinin kodlanmış bit uzunluğuna göredir; ağırlığın veya bütçenin sayısal büyüklüğüne değil.</p><p>P’de karar polinom zamanda bulunur; <strong>P ⊆ NP</strong>. NP’de EVET yanıtları polinom boyutlu tanıklarla polinom zamanda denetlenir; NP “polinom olmayan” demek değildir. <a href="https://www.claymath.org/millennium/p-vs-np/">P ile NP’nin eşitliği hâlâ açık</a>. Üçgendeki küçük arama, genel problem için polinom algoritma veya NP-zorluk kanıtı vermez.</p></details>
<details><summary>Bağlantı köprüsü — indirgeme okunu ve tümleyeni ayır</summary><p>S bağımsızdır <strong>ancak ve ancak V∖S bir tepe örtüsüdür</strong>: S’de kenar yoksa her kenarın en az bir ucu dışarıdadır; örtünün dışında da kenar kalamaz. Üçgende {{C}} bağımsız, kalan {{A,B}} örtüdür. Aynı çizgede, 0 ≤ q ≤ |V| için <strong>en az q bağımsız tepe ⇔ en çok |V|−q tepeli örtü</strong>. Polinom dönüşüm <strong>(G,q) → (G,|V|−q)</strong> kenarları değiştirmez. Genel Bağımsız Küme karar problemini bilinen NP-tam başlangıç problemi olarak aldığımızda bu dönüşüm Tepe Örtüsü’nün NP-zorluğunu gösterir; polinom denetleyici ise NP üyeliğini sağlar.</p><p>Yeni B’nin zorluğu için bilinen zor <strong>A ≤<sub>poly</sub> B</strong> yönü gerekir: B çözücüsü A’yı da çözer. NP-tamlık hem NP üyeliği hem zorluk kanıtı gerektirir. <a href="#example-8">İndirgeme yönünü incele</a>. <a href="#example-13">Çizge tümleyeni laboratuvarı</a> bağımsız kümeden kliğe geçer; V∖S işleminden farklıdır.</p></details>
<div class="learning-bridge-transfer" id="lb-w14-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Yalnız D sensörü eklenirse minimum değişir mi? Hiç bağlantı yokken k=0 sonucu <code>[]</code> mi, <code>None</code> mı? k=3 için bütün sensörleri seçmek minimumu kanıtlar mı?</p>
<details><summary>Kendi açıklamanı denetle</summary><p>Bağlantısız D izleme gerektirmez; minimum 2 kalır. Kenarsız ağda <code>[]</code> geçerli tanık, <code>None</code> tanık bulunamadığı anlamındadır. Üçgende k=0 için tanık yoktur. Üç sensör geçerli fakat minimum değildir. Tek tanık uygulanabilirliği gösterir; optimum için alt sınır veya daha küçük adayları dışlama gerekçesi gerekir.</p></details></div>
<p><a href="#example-21">Mevcut Python laboratuvarı</a> toplamı 15 yapan görev altkümelerini denetler; sensör kapsamasından farklı problemdir.</p>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> tanığı denetleyip arama maliyetini, minimum gerekçesini ve indirgeme yönünü ayrı açıklayabiliyorsan <a href="../review/">dersin toplu tekrarına geç</a>. Takıldıysan <a href="#example-12">kamera seçimlerini yeniden dene</a>.</p>
</section>'''


def render(week, guided):
    """Render the final week's bridge using the shared numeric-check helper."""
    if week != 14:
        raise ValueError(f'Unsupported complexity learning-bridge week: {week}')
    return _week_fourteen(guided)
