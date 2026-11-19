"""Authored learning bridges for heaps and divide-and-conquer sorting.

The shared adapter supplies its numeric-check renderer; these panels only add
content and routes, leaving the existing interactive lessons intact.
"""


def _week_six(guided):
    check = guided(
        6,
        'Geçerli min-öbek <code>[1, 3, 2, 7, 5, 4, 6]</code> içine <strong>0</strong> ekle. Aynı yukarı taşıma kuralıyla kaç <strong>anahtar karşılaştırması</strong> yapılır?',
        3,
        'Yeni eleman indis 7’dedir. Ebeveyn indislerini (i-1)//2 ile bul: 7 → 3 → 1 → 0. İndis ile saklanan değeri ayır.',
        '<strong>3 karşılaştırma, 3 takas.</strong> 0 sırasıyla 7, 3 ve 1 ile karşılaştırılır. Son öbek <code>[0, 1, 2, 3, 5, 4, 6, 7]</code>. Kökün ebeveyni olmadığı için orada yeni anahtar karşılaştırması yoktur.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w6-title">
<p class="learning-bridge-kicker" id="learning-bridge-w6">Hafta 6 · Önceliği yapıyla koru</p>
<h2 id="lb-w6-title">Sıradaki sensör işi hangisi?</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w5/#learning-bridge-w5"><strong>← Önce: Hafta 5 — anahtarla erişim</strong><span>Kimliği bulmaktan, en erken son tarihi bulmaya geçerken gereken düzen değişir.</span></a>
<a href="../w7/#learning-bridge-w7"><strong>Sonra: Hafta 7 — bütün kayıtları sırala →</strong><span>Bir minimumu korumak ile bütün kayıtları sıralamak farklı işlerdir.</span></a>
</nav>
<p>Sensör işlerini son tarihlerine göre çalıştıracağız: küçük anahtar daha acil. Min-öbek her ebeveyni çocuklarından küçük veya eşit tutar; <strong>dizinin tamamı sıralı değildir</strong>.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-15">Yerel laboratuvar: küçük öbekte eklemeyi izle →</a><a href="../bridge/#matematik">Önkoşul: büyümeyi matematikle açıkla</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — 1 hangi yolu izler?</summary>
<p>Laboratuvar <code>[2, 4, 3]</code> ile açılır. Burada ayrı, daha büyük bir örneği izle: <code>[2, 5, 4, 9, 7, 8]</code> sonuna 1 ekle. Sıfır tabanlı indis 6’nın ebeveyni <code>(6-1)//2 = 2</code>; orada değer 4 var.</p>
<p><code>1 &lt; 4</code>: takas et → <code>[2, 5, 1, 9, 7, 8, 4]</code>. Yeni indis 2, ebeveyn 0: <code>1 &lt; 2</code>, yeniden takas → <code>[1, 5, 2, 9, 7, 8, 4]</code>. Kök olunca dur. <strong>2 anahtar karşılaştırması, 2 takas</strong>; döngü koşulları, indis hesabı ve sona yazma bu sayaçlara dahil değil. Her tur yalnız yeni elemanın ebeveyn kenarını onarır.</p>
</details>
{check}
<details><summary>Matematik köprüsü — kısa yol, bütün işi anlatır mı?</summary>
<p>n ≥ 1 için kenar sayısıyla yükseklik ⌊log₂ n⌋: kökü okuma Θ(1), öbek onarımıyla ekleme ve minimum çıkarma O(log n); alttan yukarı kurma Θ(n). Bunlar farklı işlemlerdir. Python’un dinamik listesi büyürken bir ekleme Θ(n) taşıma gerektirebilir; sona eklemenin amortize O(1) oluşu her eklemeye aynı süre garantisi vermez.</p></details>
<div class="learning-bridge-transfer" id="lb-w6-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Hem “en acil işi al” hem “kimliği 42 olan işi bul” isteniyor. Tek öbek yeterli mi? Eşit son tarihlerinde geliş sırasını nasıl korursun? Boş öbekten iş istemeyi de açıkla.</p>
<details><summary>Kendi açıklamanı denetle</summary><p>Öbek minimuma uygundur; kimlik araması en kötü Θ(n) olabilir. Kimlik erişimi için ayrı bir sözlük düşün, güncellemelerde tutarlılığı koru. Eşitlikte artan geliş numarasını ikinci anahtar yap. Boşken “bekleyen iş yok” sonucunu kontrol et; kökü okumaya veya çıkarmaya çalışma.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> indis yolunu, korunan kuralı ve saydığın işlemi açıklayabiliyorsan <a href="../w7/#learning-bridge-w7">Hafta 7’de bütün kayıtları sırala</a>. Takıldıysan <a href="#example-12">indis ve değer ayrımını yeniden izle</a>.</p>
</section>'''


def _week_seven(guided):
    check = guided(
        7,
        '<code>[1, 3, 5]</code> ve <code>[2, 4, 6]</code> sıralı satırlarını birleştir. Bir satır boşalınca kalanı doğrudan kopyala. Kaç <strong>anahtar karşılaştırması</strong> gerekir?',
        5,
        'Öndeki adayları karşılaştır: (1,2), (3,2), (3,4), (5,4), (5,6). Çıktıya yazma ile anahtar karşılaştırmasını ayrı say.',
        '<strong>5 karşılaştırma.</strong> Çıktı <code>[1, 2, 3, 4, 5, 6]</code>. Sol satır boşalınca kalan 6 karşılaştırılmadan kopyalanır. Altı çıktı yazımı vardır; bu başka bir sayaçtır.'
    )
    return f'''<section class="learning-bridge" id="bridge-path" lang="tr" aria-labelledby="lb-w7-title">
<p class="learning-bridge-kicker" id="learning-bridge-w7">Hafta 7 · Böl, birleştir, maliyeti gerekçelendir</p>
<h2 id="lb-w7-title">İki sensör günlüğünü zaman sırasına koy</h2>
<nav class="learning-bridge-route" aria-label="Önceki ve sonraki kavram">
<a href="../w6/#learning-bridge-w6"><strong>← Önce: Hafta 6 — sıradaki minimum</strong><span>Öbek her seferinde bir iş seçer; şimdi bütün günlüğü sıralı üretiyoruz.</span></a>
<a href="../w8/#bridge-path"><strong>Sonra: Hafta 8 — BFS ve kuyruk →</strong><span>Grafı katman katman gezerken seçim kuralının neden geliş sırası olduğunu araştır.</span></a>
</nav>
<p>İki cihazın zaman sıralı kayıtlarını birleştir: kalan satırların ilk anahtarlarını karşılaştır; küçüğü yaz ve yalnız onun indisini ilerlet.</p>
<p class="learning-bridge-actions"><a class="learning-bridge-primary" href="#example-5">Yerel laboratuvar: birleştirmeyi adım adım izle →</a><a href="../bridge/#dongu">Önkoşul: döngüde hangi işi sayıyorum?</a></p>
<details class="learning-bridge-worked"><summary>1. Çözümlü örnek — satır boşalınca ne olur?</summary>
<p>Laboratuvar <code>[2, 5, 8]</code> ve <code>[1, 4, 9]</code> ile açılır. Buradaki ayrı örnek <code>[2, 5]</code> ve <code>[1, 4]</code>: <code>2 ≤ 1</code> yanlış → 1’i yaz; <code>2 ≤ 4</code> doğru → 2’yi yaz; <code>5 ≤ 4</code> yanlış → 4’ü yaz. Sağ satır boşalır; kalan 5’i kopyala.</p>
<p>Sonuç <code>[1, 2, 4, 5]</code>: <strong>3 anahtar karşılaştırması</strong>. Kalanı kopyalama, çıktı yazımları ve döngü koşulları sayılmaz. Çıktı sıralıdır; sıradaki minimum kalan iki baştan biridir. Girdiler sırasızsa gerekçe geçersizdir.</p>
</details>
{check}
<details><summary>Matematik köprüsü — tekrar bağıntısı neyi sayıyor?</summary>
<p>n = 2ᵏ ve T(1) = 0 olsun. Birleştirme maliyetini n çıktı yazımı olarak modelleyince <strong>T(n) = 2T(n/2) + n = n log₂ n</strong>: log₂ n birleştirme düzeyinin her birinde n yazım. Örneğin T(8) = 24. Bu, bütün Python işlemlerinin kesin sayısı değildir. n ≥ 2 toplam elemanı birleştirmede en kötü anahtar karşılaştırması n−1’dir; aynı sayaç değildir.</p></details>
<div class="learning-bridge-transfer" id="lb-w7-transfer"><h3>3. Yeni durumda kendin karar ver</h3>
<p>Günlükler zaten sıralıysa yeniden tümünü sıralar mısın? Eşit zamanlı iki kaydın kaynak sırası korunmalıysa bağ kuralın ne olur? Bir günlük boşken ve girdiler sırasızken kararını yeniden değerlendir.</p>
<details><summary>Kendi açıklamanı denetle</summary><p>Sıralı günlükleri toplam n kayıtta Θ(n) zamanda birleştir. Boşsa diğerini kopyala: sıfır anahtar karşılaştırması. Eşitlikte soldan almak, her girdinin iç sırasını ve soldan-sağa birleştirilmiş başlangıç sırasına göre kararlılığı korur; cihazlar arası gerçek geliş sırası için geliş numarasını sakla. Sırasız girdiyi önce sırala. Merge sort en kötü Θ(n log n); standart quicksort en kötü Θ(n²), farklı anahtarlarda bağımsız, eş olasılıklı rastgele pivotla beklenen Θ(n log n): beklenti her çalıştırmaya garanti değildir.</p></details></div>
<p class="learning-bridge-exit"><strong>Çıkış ölçütü:</strong> karşılaştırma ile yazımı ayırıp bağıntıyı düzeylerle açıklayabiliyorsan <a href="../w8/#bridge-path">Hafta 8’de seçim kuralını BFS’ye taşı</a>. Takıldıysan <a href="#example-7">n = 8 için üç birleştirme düzeyini yeniden izle</a>.</p>
</section>'''


def render(week, guided):
    """Render only Week 6 or 7; reject an unintended integration target."""
    if week == 6:
        return _week_six(guided)
    if week == 7:
        return _week_seven(guided)
    raise ValueError(f'Unsupported priority learning-bridge week: {week}')
