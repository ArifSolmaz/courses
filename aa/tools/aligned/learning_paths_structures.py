"""Learning bridges for Weeks 4–5; reuse the shared numeric-check renderer.

Expected checks: Week 4 shifts two elements when inserting 8 at index 2 of
[4, 7, 9, 12] with spare capacity; that is three element-slot writes including
the new value. Its guided n=7, i=3 insertion shifts four elements. Week 5's
linear-probing table (m=7, keys 7,14,21) finds 21 in three probes and rejects
28 in four, including the first empty slot at index 3. A tombstone at index 1
preserves the search for 21; replacing it with an empty slot does not.
"""


def _week_four(guided):
    practice = guided(
        4,
        'Kapasitesi yeterli bir dizide <strong>n = 7</strong> sensör kaydı var. '
        '<strong>i = 3</strong> indisine yeni kayıt eklerken kaç eski kayıt bir göz sağa kayar? '
        'Yeni kaydın yazılmasını ve sayaç atamalarını sayma.',
        4,
        'İndisler 0’dan başlar. Eski 3, 4, 5 ve 6 indislerindeki kayıtların '
        'yer açmak için taşınması gerekir; n − i ifadesiyle karşılaştır.',
        '<strong>4 kaydırma.</strong> C(7, 3) = 7 − 3 = 4. Yeni kaydın yazılmasıyla '
        'dizi gözlerine toplam 5 yazma yapılır. Başa eklemede 7, sona eklemede 0 '
        'kaydırma olur; yeniden bellek ayırma bu hesaba dahil değildir.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w4-title">
<p class="learning-bridge-kicker" id="learning-bridge-w4">Hafta 4 · İşlemden veri yapısı seçimine</p>
<h2 id="lb-w4-title">Sensör kayıtlarını nerede tutmalıyız?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w3/#bridge-path"><strong>← Önce: Hafta 3 — tekrarları say</strong><span>Döngünün kaç kayıt taşıdığını bulmak, veri yapısının maliyetini açıklar.</span></a>
<a href="../w5/#bridge-path"><strong>Sonra: Hafta 5 — anahtarla eriş →</strong><span>Dizi ve bağlantıları, ağaç ile karma tablosunun yapı taşları olarak kullan.</span></a>
</nav>
<p>Sensör kimlikleri dizide tutuluyor. <strong>İndisle erişmek</strong> ile <strong>araya eklemek</strong> aynı iş değildir. Önce hareket eden kayıtları izle; sonra maliyeti ve kullanım amacını açıkla.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-13">Bu haftanın laboratuvarı: sıralı dizide yer aç →</a><a href="../bridge/#secim">Önkoşul tekrarı: arama yöntemi seçimi</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — 8’i araya eklemeden tahmin et</summary>
<p>Dört kayıt, bir boş göz ve yeterli kapasite var. Sıralı kalması için 8’i indis 2’ye ekleyelim. Sondan ilerleyerek henüz taşınmamış değerleri koruruz.</p>
<pre><code>a = [4, 7, 9, 12, None]
n, i, shifts = 4, 2, 0
for j in range(n, i, -1):
    a[j] = a[j - 1]
    shifts += 1
a[i] = 8
print(a, shifts)  # [4, 7, 8, 9, 12] 2</code></pre>
<p>12 ve 9 taşınır: <strong>2 kaydırma</strong>. Yeni 8’in yazılması dahil <strong>3 dizi gözüne yazma</strong> vardır; bütün Python atamalarını saymıyoruz. Genel kaydırma sayısı <strong>C(n, i) = n − i</strong> (0 ≤ i ≤ n, ek kapasite ayırmadan). Başa ekleme Θ(n), sona ekleme yeterli kapasiteyle Θ(1) zamandır. <a href="lecture-notes.html#sh_op">Notlardaki kaydırma sayacında</a> n ve konumu değiştirerek sınayabilirsin.</p>
</details>
{practice}
<div class="learning-bridge-transfer" id="lb-w4-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Sensör paketlerini geliş sırasıyla işleyeceksin. Her paketten sonra dizinin başını silmek mi, kapasitesi önceden ayrılmış bir halka tampon kullanmak mı uygun? Ayrıca “bağlı listeye ekleme her zaman sabittir” iddiasında hangi bilgi eksik? Seçimini ve sınır durumunu yaz.</p>
<details><summary>Kendi açıklamanı denetle</summary><p>FIFO kuyruk için halka tampon, baş ve son indislerini ilerleterek kayıtları kaydırmadan ekleyip çıkarır; tek işlem Θ(1)’dir. Boş ve dolu durumlarını ayırmak, dolunca reddetme veya eski kaydı ezme politikasını belirtmek gerekir. Bağlı listede öncül düğüm zaten biliniyorsa bağlantı güncellemesi Θ(1)’dir; ekleme yerini aramak ise Θ(n) sürebilir. Yapı seçimi, gerekli işlemler ve süre sınırıyla birlikte yapılır.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> kaydırma ile yazmayı ayırıp FIFO seçimini gerekçelendirebiliyorsan <a href="../w5/#bridge-path">Hafta 5’te sözlük seçimine geç</a>. Takıldıysan <a href="lecture-notes.html#sh_op">sayacı başa ve sona ekleme için yeniden dene</a>; kuyruk için <a href="lecture-notes.html#s5">halka tamponu incele</a>.</p>
</section>'''


def _week_five(guided):
    practice = guided(
        5,
        'Aynı tabloda yalnız <strong>7, 14, 21</strong> bulunuyor; silme yapılmadı. '
        '<strong>28</strong> aranırsa “yok” sonucuna kadar kaç göz yoklanır? '
        'Durmayı sağlayan boş gözü de bir yoklama say.',
        4,
        '28 mod 7 = 0. Sırayla göz 0, 1 ve 2 doludur. Aramayı ilk gerçekten boş '
        'göz olan 3 durdurur.',
        '<strong>4 yoklama.</strong> 0 → 1 → 2 → 3 yolunda son göz boştur. '
        'Bulunan 21 için 3, bulunmayan 28 için 4 yoklama gerekir; '
        'aynı başlangıç gözü, aynı arama maliyeti anlamına gelmez.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w5-title">
<p class="learning-bridge-kicker" id="learning-bridge-w5">Hafta 5 · Çakışmayı izle, sözlüğü gerekçeyle seç</p>
<h2 id="lb-w5-title">Bir sensör kimliği tek gözle bulunur mu?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w4/#bridge-path"><strong>← Önce: Hafta 4 — erişim ve güncelleme</strong><span>Dizinin hızlı erişimi, aynı göze düşen anahtarları kendiliğinden ayırmaz.</span></a>
<a href="../w6/#bridge-path"><strong>Sonra: Hafta 6 — sırayı yönet →</strong><span>Kimliği bulmak ile en öncelikli kaydı seçmenin farklı işlemler olduğunu karşılaştır.</span></a>
</nav>
<p>Sensör kimliğinden son ölçümüne ulaşan bir sözlük kuruyoruz. Karma tablosunda <strong>bir yoklama, bir tablo gözünü incelemektir</strong>. Sonuca ve maliyete ayrı ayrı bak; “karma her zaman sabittir” diye varsayma.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-18">Bu haftanın laboratuvarı: silmenin aramaya etkisini izle →</a><a href="../bridge/#arama">Önkoşul tekrarı: arama adımlarını izleme</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — 21’i bulmadan yolu çiz</summary>
<p>Tablo boyutu <strong>m = 7</strong>, h(k) = k mod 7; doğrusal yoklamada her adım (i + 1) mod 7’dir. Boş tabloya sırayla 7, 14, 21 ekle: üçü de önce göz 0’ı ister. Son durum <code>[7, 14, 21, boş, boş, boş, boş]</code>.</p>
<p>21 aranırken <strong>0 → 1 → 2</strong>: 7 ve 14 eşit değildir, 21 bulunur; <strong>3 yoklama</strong>. <a href="lecture-notes.html#ht2_m">Notlardaki düzenlenebilir tabloda</a> m’yi 7 yap, tabloyu boşalt, yalnız bu üç anahtarı ekle; her işlemde “İleri” ile yolu izle. Bu sayfanın silme görseli ayrıca 1 anahtarını da içerir; aşağıdaki sayımda yalnız üç anahtar vardır.</p>
<p>Şimdi 14’ü sil: göz 1’i gerçekten boş yaparsan 21 araması orada durup yanlışlıkla “yok” der. <strong>Mezar taşı</strong> aramanın devam etmesini sağlar; böylece 21 yine bulunur. Silme modlarını aynı başlangıç tablosuyla karşılaştır. Hiç boş göz yoksa bulunamayan hedef için m yoklamada dur; başa sarıp sonsuza dek arama.</p>
</details>
{practice}
<div class="learning-bridge-transfer" id="lb-w5-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>A sistemi yalnız kimliği bilinen sensörün ölçümünü sık sorguluyor. B sistemi ayrıca kimlikleri 100–200 arasındaki bütün kayıtları sırayla istiyor. Hangi sözlüğü seçersin? Beklenen maliyet ile her girdide garanti arasındaki farkı da açıkla.</p>
<details><summary>Kendi açıklamanı denetle</summary><p>A için sabit boyutlu anahtarlar, uygun karma dağılımı, yük faktörü α ≤ c &lt; 1 ve mezar taşı birikiminin denetlenmesiyle arama beklenen O(1)’dir; kümelenmede en kötü Θ(n) olabilir. B için dengeli BST, anahtarla aramada O(log n) garantisi verir; k sonuçlu aralık sorgusu uygun dolaşımla O(log n + k) sürer. Karma tablosu anahtar sırasını korumaz. Dengelenmeyen BST’nin yüksekliği n’e uzayabilir; sıradan bir BST’ye logaritmik garanti verme.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> yoklama yolunu ve silme tuzağını açıklayıp sorguya göre yapı seçebiliyorsan <a href="../w6/#bridge-path">Hafta 6’ya geç</a>. Takıldıysan <a href="lecture-notes.html#ht2_m">7, 14, 21 ile tabloyu yeniden kur</a>; denge gerekçesi için <a href="lecture-notes.html#s3">ağaç yüksekliğine dön</a>.</p>
</section>'''


def render(week, guided):
    """Return one bridge; ``guided`` is the shared five-argument helper."""
    return {4: _week_four, 5: _week_five}[week](guided)
