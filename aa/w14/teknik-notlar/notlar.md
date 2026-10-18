# AA · 14. Hafta — 22 örneğin Türkçe teknik açıklaması

Bu notlar **indirgemeler, NP-tamlık ve mühendislikte çözüm garantileri** dersindeki 22 kartı aynı sırayla açıklar. 9 ve 16 numaralı mola kartlarında cevaplı tekrar bulunur. Her bölüm ilgili örneğe ve ders notuna bağlanır; açıklamalar ve cevaplar doğrudan görünür.

Bu hafta büyük formüllerden önce dört soruyu ayırıyoruz: Bir çözüm **bulduk mu**, verilen çözümü **kontrol ettik mi**, onun **en iyi olduğunu kanıtladık mı**, yoksa yalnızca **iyi bir aday mı** elde ettik?

- **Karar problemi:** Cevabı evet/hayır olan soru.
- **Tanık veya sertifika:** Bir evet cevabını doğrulamak için sunulan bilgi; seçilmiş görev indeksleri gibi.
- **Doğrulayıcı:** Tanığın bütün koşulları sağlayıp sağlamadığını kontrol eden algoritma.
- **Girdi uzunluğu:** Veriyi yazmak için gereken sembol/bit sayısı. Bir sayının değeriyle aynı değildir.
- **Polinom zaman:** Girdi uzunluğu N için O(Nᵏ) gibi, sabit k kuvvetiyle sınırlanan çalışma süresi.
- **İndirgeme:** Bir problemi başka bir probleme, cevap ilişkisini koruyarak dönüştürme.
- **OPT:** Verilen örnek için mümkün olan en iyi amaç değeri.
- **Alt/üst sınır:** Minimum ararken OPT'nin altına inemeyeceği değer ve geçerli bir çözümün verdiği üst değer.
- **Sezgisel yöntem:** İyi bir çözüm bulmayı amaçlayan yöntem; sırf hızlı çalışması optimum garantisi vermez.
- **Yaklaşım garantisi:** İzin verilen bütün girdiler için kanıtlanmış kalite sınırı.

**Güncel durum:** P ile NP'nin eşit olup olmadığı açık bir problemdir. Bu notlar P≠NP'yi kanıtlanmış kabul etmez. [Clay Mathematics Institute — resmî problem ve durum](https://www.claymath.org/millennium/p-vs-np/).

## 1. Çözümü bulmak ile verileni kontrol etmek farklı işlerdir

[Ders sayfasındaki örnek 1](../#example-1) · [İlgili ders notu](../lecture-notes.html#topic-0-1)

Görev süreleri 8,7,6,5,4. Bir makineye toplam 15 verecek görevleri seçmek istiyoruz. Birisi “8 ve 7'yi al” dediğinde toplamı kontrol etmek kolaydır: 8+7=15. Ama cevap verilmemişse hangi görevlerin seçileceğini aramamız gerekir.

| Kontrol | Neden gerekli? |
|---|---|
| Seçilen görevler girdide var mı? | Hayalî bir görev kullanılamaz |
| Her görev en fazla bir kez mi seçildi? | Aynı işi iki kez sayamayız |
| Toplam gerçekten 15 mi? | Üyelik tek başına yeterli değil |

**Değer yerine kimlik.** İki ayrı görev aynı sürede olabilir. Bu yüzden tanıkta görev indeksleri kullanmak daha nettir. `[0,1]`, Python'da 8 ve 7 süreli görevlerdir. İlk görsel görevleri 1'den, Python kodu 0'dan numaralandırır.

**Bir başarısız aday.** 8 ve 6'nın toplamı 14. Bu aday yanlış, fakat problem çözümsüz değil; 8+7 ve 6+5+4 geçerli. “Bu seçimi reddettim” ile “bütün seçimleri eledim” aynı iddia değildir.

**Karmaşıklık bağlantısı.** Beş görev küçük bir örnek. NP tanımı, giderek büyüyen girdilerde evet tanıklarının boyutunun ve kontrol süresinin girdi uzunluğuna göre polinom olmasını ister. Bir bulmacanın bize zor gelmesi, matematiksel zorluk kanıtı değildir.

**Kontrol ve cevap.** Tanığa yalnızca “evet” yazmak yeterli mi? Hayır. Doğrulayıcı, neden evet olduğunu verilen bilgi üzerinden denetleyebilmelidir; etikete güvenmez.

## 2. Önce hangi soruyu sorduğunuzu belirleyin

[Ders sayfasındaki örnek 2](../#example-2) · [İlgili ders notu](../lecture-notes.html#topic-1-2)

Aynı beş işi iki özdeş makineye dağıtalım. Her iş bölünmeden bir makinede tamamlanıyor; işler baştan hazır, bağımsız ve süreleri sabit.

| Sürüm | İstenen çıktı |
|---|---|
| Karar | Bütün işler 15 zaman biriminde biter mi? |
| Arama | 15 içinde bitiren bir görev dağılımı ver |
| Optimizasyon | Mümkün olan en küçük bitiş süresini bul |

Makine yükleri 15 ve 15 olan dağılım, karar sorusuna evet tanığıdır. Denetleyici bütün görevlerin tam bir kez atandığını ve her makinenin toplamının 15'i aşmadığını kontrol eder. Sadece bir makinenin listesini kontrol etmek, diğer işlerin kaybolmasını gözden kaçırabilir.

**En iyilik ayrı bir iddia.** Bir 15'lik plan bulmak OPT≤15 gösterir. Burada toplam iş 30 ve iki makine olduğundan OPT≥30/2=15. İki sınır birleşince OPT=15 kanıtlanır. Alt sınır olmadan yalnızca bir üst sınır biliyor olurduk.

**Terimlerin kapsamı.** P ve NP karar problemleri sınıflarıdır. “En iyi planı bul” optimizasyon sürümüne doğrudan NP-tam demek yerine hangi karar sürümünün NP-tam, hangi optimizasyon sürümünün NP-zor olduğunu belirtmek gerekir.

**Kontrol ve cevap.** Bir 17'lik plan, “16 içinde biter mi?” sorusuna hayır cevabı verir mi? Hayır. Daha iyi bir dağılım henüz bulunmamış olabilir. Bir planın belirli sınırı aşması, bütün planların aşacağını kanıtlamaz.

## 3. P ve NP tam olarak ne söyler?

[Ders sayfasındaki örnek 3](../#example-3) · [İlgili ders notu](../lecture-notes.html#topic-1-3)

**P:** Girdi uzunluğuna göre polinom zamanda evet/hayır cevabı bulunabilen karar problemleri. **NP:** Evet örnekleri için polinom uzunlukta bir tanığın polinom zamanda doğrulanabildiği karar problemleri.

NP'deki N, “not” anlamında değildir; adın kökeni nondeterministic polynomial time'dır. Bu derste onun eşdeğer tanık-doğrulama tanımını kullanıyoruz.

**Neden P, NP'nin içinde?** Problemi zaten polinom zamanda çözebiliyorsanız tanığı görmezden gelip problemi çözerek evet cevabını doğrulayabilirsiniz. Dolayısıyla `P ⊆ NP`. “NP olan problem mutlaka zordur” yanlıştır; kolay P problemleri de NP'dedir.

**Evet ve hayır farkı.** NP tanımı evet tanığıyla ilgilidir. Bir alt küme bulup toplamı göstermek eveti kanıtlar. Hiç uygun alt küme olmadığını kısa bir tanıkla göstermek aynı tanımın otomatik sonucu değildir.

**Açık soru.** Polinom zamanda doğrulanabilen bütün bu karar problemleri polinom zamanda çözülebilir mi? P=NP sorusu budur. “Bulmak kesinlikle her zaman daha zordur” diye kanıtlanmış bir genelleme yapmıyoruz. [Resmî durum: çözülmemiş](https://www.claymath.org/millennium/p-vs-np/).

**Kontrol ve cevap.** Polinom zaman pratikte her zaman hızlı mı? Hayır. N¹⁰⁰ gibi bir büyüme polinomdur ama kullanılabilir olmayabilir; sabit katsayılar ve gerçek girdi boyutu da önemlidir. Teorik sınıf ile bir bilgisayardaki ölçülen süreyi ayrı değerlendirin.

## 4. Hız sözü vermeden önce adayları sayın

[Ders sayfasındaki örnek 4](../#example-4) · [İlgili ders notu](../lecture-notes.html#topic-1-4)

n görevin her biri ya alınır ya alınmaz: 2ⁿ alt küme. Her yeni görev eski her seçimi ikiye ayırır; yeni görevi içeren ve içermeyen sürümler.

| n | Alt küme sayısı |
|---|---|
| 5 | 32 |
| 10 | 1.024 |
| 20 | 1.048.576 |
| 21 | 2.097.152 |
| 30 | 1.073.741.824 |

20'den 21'e çıkmak bir milyonun üzerinde yeni aday ekler. 10'dan 20'ye çıkmak aday sayısını iki değil 1.024 katına çıkarır. Her adayı kontrol etmek ayrıca iş gerektirir; aday sayısıyla toplam çalışma süresi aynı ölçü değildir.

**DP neden her zaman kurtarmaz?** Durum bütün bir ziyaret edilmiş kümeyi içeriyorsa 2ⁿ farklı küme olabilir. Alt küme toplamı için O(nT) tablosu da hedef T'nin sayısal değerine bağlıdır. T≈2ᵇ ise hedefi yaklaşık b bit ile yazabilirken tablo genişliği yaklaşık 2ᵇ olabilir. Bu nedenle ikili kodlamada sözde polinom denir.

**Neyi kanıtlamadık?** Tam aramanın 2ⁿ aday üretmesi, her olası algoritmanın en az 2ⁿ iş yapacağını kanıtlamaz. Bir algoritmanın maliyetini analiz etmek ile problem için genel alt sınır kanıtlamak farklıdır.

**Kontrol ve cevap.** 32 adayı hızlıca deneyen kod, 100 görevde de hızlı olacak mı? Bu deneyden böyle bir sonuç çıkmaz. Girdi arttığında aday üretiminin büyümesini ayrıca hesaplamak gerekir.

## 5. Küçük ifade farkları problemi değiştirebilir

[Ders sayfasındaki örnek 5](../#example-5) · [İlgili ders notu](../lecture-notes.html#topic-1-5)

Euler turu her **kenarı**, Hamilton çevrimi her **düğümü** bir kez kullanmayı ister; ikisi de başlangıca döner. Hamilton çevriminde başlangıç düğümü kapanış için tekrar yazılır; diğer ziyaretler tekrarlanmaz.

| Problem | Korunacak nesne | Genel durum |
|---|---|---|
| Yönsüz Euler turu | Her kenar tam bir kez | Polinom zamanda bulunabilir |
| Hamilton çevrimi var mı? | Her düğüm tam bir kez | Genel graflarda NP-tam |

Yönsüz, en az bir kenarı olan graf için Euler turunun koşulu: kenara sahip düğümler bağlı ve bütün dereceler çift. Bağlı olmayan iki ayrı çevrimde dereceler çift olsa bile tek turla bütün kenarlara ulaşılamaz. Tek kalan izole düğümler kenar turuna engel değildir.

**Somut ayrım.** Ortak tek merkez düğümde birleşen iki üçgen düşünün. Merkezin derecesi 4, diğerlerinin 2; graf bağlıdır. Euler turu merkezi yeniden ziyaret ederek iki üçgenin bütün kenarlarını gezer. Ama Hamilton çevrimi bir üçgenden diğerine geçip geri dönmek için merkezi tekrar kullanmak zorunda kalır; mümkün değildir.

Benzer biçimde 2-SAT polinom zamanda çözülürken 3-SAT NP-tamdır. “Yalnızca bir terim arttı” demek hesaplama yapısının değişmediğini göstermez.

**Kontrol ve cevap.** NP-tam sınıfındaki her küçük örnek uzun sürer mi? Hayır. Örneğin açıkça bir çevrim olan grafın Hamilton cevabı kolaydır. Sınıflandırma bütün büyüyen girdiler için genel en kötü durum garantisini ilgilendirir.

## 6. İndirgeme cevabı koruyan bir çeviridir

[Ders sayfasındaki örnek 6](../#example-6) · [İlgili ders notu](../lecture-notes.html#topic-2-1)

`A ≤p B`, A örneğini polinom zamanda bir B örneğine dönüştürebildiğimiz ve **A evet ancak ve ancak B evet** olduğu anlamına gelir. Burada kullanılan tür, polinom zamanda çoktan-bire indirgemedir.

```text
A girdisi x → çevirici f → B girdisi f(x) → B çözücüsü → A için aynı evet/hayır
```

**Üç yükümlülük.** Çevirici bütün geçerli A girdilerinde çalışmalı, polinom zaman/boyut sınırına uymalı ve iki yönde cevap korumalıdır. Tek bir örnek resmi, genel kanıt yerine geçmez.

**İki yön neden?** A evetse B evet göstermeyi başardık diyelim. A hayırken de B evet olabiliyorsa B çözücüsünün eveti A için güvenilir olmaz. Bu yüzden B evet ise A evet yönü de şarttır; birlikte hayır cevaplarını da korurlar.

**Gizli iş yapılamaz.** “Önce A'yı bütün olasılıkları deneyerek çöz, sonra cevaba uygun basit B üret” genellikle polinom zaman şartını sağlamaz. Zor arama çeviricinin içine saklanamaz.

**Çıkarım.** B'nin polinom çözücüsü varsa bu hattın tamamı A'yı polinom zamanda çözer. B girdisinin boyutunun da polinomla sınırlı olması, çözücünün yeni girdideki süresinin kontrolden çıkmaması için önemlidir.

**Kontrol ve cevap.** A'dan B'ye indirgeme, B'nin mutlaka A'dan daha yavaş olduğu anlamına mı gelir? Hayır. Bu, gerçek saniyeleri sıralayan bir ifade değil, çözücülerin ve zorluk kanıtlarının nasıl aktarılabildiğini anlatan ilişkidir.

## 7. Sıralamayı kullanarak yakın sayı çiftini bulmak

[Ders sayfasındaki örnek 7](../#example-7) · [İlgili ders notu](../lecture-notes.html#topic-2-2)

Girdi 9,2,6,3. Farklı iki konumdaki sayılar arasında en küçük mutlak farkı arıyoruz. Sıralayınca 2,3,6,9 elde edilir.

| Komşu çift | Fark |
|---|---|
| 2,3 | 1 |
| 3,6 | 3 |
| 6,9 | 3 |

**Neden komşular yeterli?** Sıralı listede a≤b≤c olsun. c−a, hem b−a hem c−b kadar veya onlardan büyüktür. Aralarında başka sayı bulunan bir çifti seçmek yerine daha küçük veya eşit aralıklı bir komşu çift seçebiliriz. Bu nedenle minimum farkı gerçekleştiren en az bir komşu çift vardır.

**İş miktarı.** Sıralama O(n log n) karşılaştırma, komşu farkları tarama O(n) iş. Bütün n(n−1)/2 çifti denemek gerekmiyor. Bu analiz olağan sayısal karşılaştırma modelinde yapılır.

**Tekrarlar.** Girdi 9,2,2,6 ise iki ayrı konumdaki 2'ler sıralamada yan yana gelir, fark 0 olur. “Farklı konumlar” ile “farklı değerler” aynı şart değildir.

**İndirgeme bağlantısı.** Bilinen bir sıralama alt yordamını kullanarak başka bir işi çözdük. Bu, problem dönüştürme fikrini öğretir; tek başına iki karar problemi arasında NP-zorluk kanıtı değildir.

**Kontrol ve cevap.** Tek elemanlı listede minimum çift farkı nedir? Uygun çift yoktur. Algoritmanın en az iki sayı varsayımı sağlanmadığında boş sonuç veya hata davranışı ayrıca tanımlanmalıdır.

## 8. Yeni problemi zor göstermek için oku ona doğru çizin

[Ders sayfasındaki örnek 8](../#example-8) · [İlgili ders notu](../lecture-notes.html#topic-2-4)

A bilinen NP-tam karar problemi, B yeni karar problemi olsun. B'nin NP-tamlığını göstermek için iki ayrı bölüm gerekir.

| Bölüm | Gösterilecek şey |
|---|---|
| NP üyeliği | B'nin evet tanığı polinom boyutta ve polinom zamanda kontrol edilebilir |
| NP-zorluk | Bilinen NP-zor A'dan B'ye polinom indirgeme: A ≤p B |

**Okun mantığı.** B'yi hızlı çözen bir cihazımız olduğunu varsayalım. A'yı B'ye çevirip bu cihazı kullanınca A da hızlı çözülür. Bu yüzden B, A'nın zorluğunu taşır. Aynı A bütün NP problemlerini temsil edecek kadar zorsa B de NP-zordur; indirgemelerin bileşkesi polinom kalır.

**Ters ok neden yetmez?** B≤p A yalnızca A çözücüsünün B'ye yardımcı olacağını gösterir. Kolay bir problem de zor bir problem aracılığıyla çözülebilir; buradan kolay problemin zor olduğu çıkmaz.

**NP-zor ve NP-tam.** NP-tam, hem NP-zor hem NP üyesi demektir. NP-zor terimi optimizasyon problemlerine veya NP içinde olduğu gösterilmemiş problemlere de uygulanabilir. İki terimi eşanlamlı kullanmayın.

**Kontrol ve cevap.** B için kısa doğrulayıcı yazdık; NP-tamlığı kanıtladık mı? Hayır. P problemleri için de kısa doğrulama mümkündür. Ayrıca doğru yönde indirgeme, genel yapım kuralı, polinom boyut ve evet/hayır eşdeğerliği gerekir.

## 9. İlk mola: iddianın ne olduğunu söyleyin

[Ders sayfasındaki örnek 9](../#example-9) · [İlgili ders notu](../lecture-notes.html)

64–74. dakikalardaki moladan sonra aşağıdaki cümleleri karşılaştırın.

| İddia | Doğru yorum |
|---|---|
| Bir aday reddedildi | Yalnızca o aday geçersiz |
| Bir geçerli aday bulundu | Evet cevabı kanıtlandı |
| Tam arama 2ⁿ aday üretiyor | Bu algoritmanın aday sayısı üstel |
| Problem NP içinde | Evet tanıkları verimli doğrulanabilir |
| A ≤p B | B çözücüsü A'yı çözmekte kullanılabilir |

**Soru:** “NP, polinom değil demektir” doğru mu? **Cevap:** Hayır; P, NP'nin alt kümesidir. NP adı bir polinom-zaman dışlama etiketi değildir.

**Soru:** Bir araştırmacı NP-tam B için polinom algoritma kanıtlarsa ne olur? **Cevap:** NP'deki bütün karar problemleri B'ye indirgenebildiğinden P=NP sonucu çıkar. Birkaç büyük örnekte hızlı çalışmak böyle bir genel kanıt değildir.

**Soru:** Zor olduğu bilinen A yerine B'den A'ya çeviri yazmak B'yi zor gösterir mi? **Cevap:** Hayır. Zorluk aktarma hedefi B ise ok A'dan B'ye gitmelidir.

**Küçük uygulama.** Görevler 8,7,6,5,4 ve hedef 15. 8+6 başarısız, 8+7 başarılı. İkinci tanık birincinin başarısızlığının neden “çözümsüz” anlamına gelmediğini doğrudan gösterir.

## 10. SAT: bütün kuralları sağlayan anahtar ayarları var mı?

[Ders sayfasındaki örnek 10](../#example-10) · [İlgili ders notu](../lecture-notes.html#topic-3-1)

Formül `(a VEYA b) VE (DEĞİL a VEYA c)`. Değişken doğru/yanlış anahtarıdır. Literal değişkenin kendisi veya değillenmiş hâlidir. Bir yan tümce içindeki VEYA için en az bir literal, yan tümceler arasındaki VE için bütün yan tümceler doğru olmalı.

| a | b | c | a VEYA b | DEĞİL a VEYA c | Formül |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 0 |
| 0 | 0 | 1 | 0 | 1 | 0 |
| 0 | 1 | 0 | 1 | 1 | 1 |
| 0 | 1 | 1 | 1 | 1 | 1 |
| 1 | 0 | 0 | 1 | 0 | 0 |
| 1 | 0 | 1 | 1 | 1 | 1 |
| 1 | 1 | 0 | 1 | 0 | 0 |
| 1 | 1 | 1 | 1 | 1 | 1 |

0 yanlış, 1 doğru. Sekiz atamanın dördü başarılıdır. Görsel her adımda bir atamayı ve iki yan tümcenin sonuçlarını gösterir.

**Kontrol örneği.** a=1,b=0,c=1 için ilk kural a sayesinde, ikinci kural c sayesinde doğru. DEĞİL a yanlış olsa da ikinci VEYA'nın tamamı yanlış olmaz; diğer literal yeterlidir.

**Doğrulama ve arama.** Verilen bir atamayı denetlemek için formüldeki literal oluşumları taranır. Bütün atamaları üretmek ise n değişkende 2ⁿ adaydır. Kısa doğrulama ile kısa aramayı karıştırmayın.

**Sınıf ayrımı.** Bu özel formül iki literalli yan tümceler içerir; bir 2-SAT örneğidir. Genel SAT'ın NP-tam olması, bu kısıtlı alt sınıfın zor olduğunu söylemez.

**Kontrol ve cevap.** a=1,b=0,c=0'ın başarısızlığı formülün doyurulamaz olduğunu gösterir mi? Hayır; tabloda dört başka başarılı atama vardır.

## 11. Uzun bir yan tümceyi yeni değişkenle bölmek

[Ders sayfasındaki örnek 11](../#example-11) · [İlgili ders notu](../lecture-notes.html#topic-3-3)

`a VEYA b VEYA c VEYA d` yerine iki yan tümce kuruyoruz:

```text
(a VEYA b VEYA w)
VE
(DEĞİL w VEYA c VEYA d)
```

w yeni bir değişkendir. Soru “her w değeri çalışıyor mu?” değil, **“iki kuralı aynı anda sağlayan bir w var mı?”** sorusudur.

| Eski literaller | w seçimi | Neden çalışır veya çalışmaz? |
|---|---|---|
| a veya b doğru | w=0 | İlk yan tümce zaten doğru; ikincide DEĞİL w doğru |
| a,b yanlış; c veya d doğru | w=1 | İlk yan tümceyi w, ikincisini c veya d sağlar |
| Dördü de yanlış | Hiçbiri | İlk kural w=1, ikinci kural w=0 ister |

**Eşdeğerliğin türü.** Her sabit a,b,c,d ataması için eski yan tümce doğruysa onu genişleten en az bir w vardır; yanlışsa hiçbir w yoktur. Yeni formül, eski değişkenlere ek olarak w içerdiği için “w'yi nasıl seçersek seçelim aynı doğruluk değeri” iddiası kurulmaz.

**Taze değişken şartı.** w'yi mevcut bir değişken veya başka yan tümcenin yardımcı değişkeni olarak yeniden kullanmak istemeden ek bağlar yaratabilir. Her dönüşüm için gereken yardımcı değişkenler ayrı seçilir.

**Genel indirgeme sınırı.** Burada yalnızca dört literalli bir CNF yan tümcesi açıklandı. Bütün CNF-SAT → 3-SAT kanıtı daha uzun yan tümceleri zincirler, kısa yan tümceleri kullanılan 3-SAT tanımına göre ele alır ve toplam boyutun polinom kaldığını gösterir.

**Kontrol ve cevap.** a=1,b=c=d=0 iken w=1 çalışır mı? Hayır; ikinci yan tümce yanlış olur. Ama w=0 çalışır. Varoluş koşulu tam olarak bu ayrımı ifade eder.

## 12. Koridorları uç noktalara kamera koyarak kapsamak

[Ders sayfasındaki örnek 12](../#example-12) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

Graf A–B–C–D: kenarlar AB,BC,CD. Kamera bir düğüme konur ve ona değen kenarları kapsar. B ve C seçilince bütün kenarlar kapsanır. Bu, düğüm örtüsüdür; amaç bütün düğümleri seçmek değildir.

| Seçilen düğümler | Kapsanmayan kenar | Örtü mü? |
|---|---|---|
| B | CD | Hayır |
| B,C | Yok | Evet |
| A,C | Yok | Evet |
| A,D | BC | Hayır |

**Bağımsız küme ilişkisi.** C bir örtüyse dışarıda kalan V−C içinde bir kenar olamaz; olsaydı o kenarın iki ucu da seçilmemiş olurdu. Tersine dışarıdakiler arasında kenar yoksa her kenarın en az bir ucu C'dedir. Dolayısıyla `C örtü ⇔ V−C bağımsız`.

n düğümde en fazla k boyutlu örtü vardır ancak ve ancak en az n−k boyutlu bağımsız küme vardır. Burada grafı değiştirmedik; yalnızca seçilen düğüm kümesinin tümleyenini aldık.

**Optimumu kanıtlama.** AB ve CD ortak uç taşımıyor; her biri örtüden en az bir düğüm ister. En az iki düğüm zorunlu, B,C ile iki yeterli: optimum 2. Tamamlayıcı ilişki maksimum bağımsız küme boyutunu da 4−2=2 yapar.

**Görselde deney.** B seçiliyken C'yi kapatın: CD turuncu kalır. C'yi açınca bütün kenarlar yeşil olur. Yeşil, o kenarın seçilmiş bir ucu olduğunu gösterir.

**Kontrol ve cevap.** İzole bir düğüme kamera şart mı? Hayır; ona değen kenar yok. Model kenar kapsamasını istiyor, bütün düğümlerin gözetimini değil.

## 13. Bu kez grafın tümleyenini almak

[Ders sayfasındaki örnek 13](../#example-13) · [İlgili ders notu](../lecture-notes.html#topic-4-1)

Önceki bölümde düğüm kümesinin tümleyenini aldık. Şimdi aynı düğümleri koruyup grafın kenarlarını değiştiriyoruz. Basit yönsüz grafta farklı düğümler arasındaki her mevcut kenar silinir, her eksik kenar eklenir.

| Düğüm çifti | A–B–C–D yolunda | Tümleyen grafta |
|---|---|---|
| AB | Var | Yok |
| AC | Yok | Var |
| AD | Yok | Var |
| BC | Var | Yok |
| BD | Yok | Var |
| CD | Var | Yok |

Tümleyenin kenarları AC,AD,BD. A,D orijinalde bağımsız bir küme; tümleyende aralarında kenar olduğundan iki düğümlü bir klik olur. Klik, seçilen farklı düğümlerin her çiftinin komşu olduğu kümedir.

**Genel gerekçe.** S içindeki her çift G'de kenarsızsa aynı çift tümleyende kenarlıdır. Bu yüzden aynı S için `G'de bağımsız ⇔ tümleyende klik`. Kümenin boyutu değişmez; karar eşiği k de aynı kalır.

**İki işlem yan yana.** Örtüden bağımsız kümeye giderken graf aynı, seçilen küme değişir. Bağımsız kümeden kliğe giderken seçilen küme aynı, graf değişir. Bu ayrımı kaybetmek yanlış eşik veya yanlış kenar üretir.

**Boyut.** Tümleyen n(n−1)/2'ye kadar kenar içerebilir; seyrek bir graf yoğunlaşabilir. Bu yine n'ye göre polinom büyüklüktür.

**Kontrol ve cevap.** A'dan A'ya kenar eklenir mi? Hayır; basit graf modelinde yalnızca farklı düğüm çiftleri çevrilir. Bir düğümlü küme de çift koşulunu boş olarak sağladığı için kliktir.

## 14. 3-SAT seçimlerini grafa kodlamak

[Ders sayfasındaki örnek 14](../#example-14) · [İlgili ders notu](../lecture-notes.html#topic-4-2)

Bu isteğe bağlı derinleşme örneği, küçük parçaların genel bir indirgeme kanıtına nasıl dönüştüğünü gösterir. n değişken, her biri üç literal oluşumu içeren m yan tümce var.

**Grafın yapımı.** Her değişken için x ve DEĞİL x düğümlerini bir kenarla bağlayın. Her yan tümce için üç ayrı oluşum düğümünden bir üçgen kurun. Her oluşumu, aynı literal adını taşıyan değişken düğümüne bağlayın. İstenen örtü boyutu en fazla `n+2m`.

| Parça | Zorunlu en az seçilen düğüm |
|---|---|
| Her değişken kenarı | 1 |
| Her yan tümce üçgeni | 2 |
| Hepsi birlikte | n+2m |

Bu parçaların düğümleri ayrıdır. Bütçe tam alt sınıra eşit olduğu için her değişken çiftinden tam bir, her üçgenden tam iki düğüm seçilir; fazlalık payı yoktur.

**Atamadan örtüye.** Doğru olan değişken literalini seçin. Her yan tümcede doğru bir oluşumu dışarıda bırakıp diğer iki oluşumu seçin. Dışarıda kalan oluşumun bağlantı kenarını, doğru literal düğümü kapsar. Diğer bütün bağlantı kenarları seçilmiş oluşum uçlarından kapsanır.

**Örtüden atamaya.** Seçilen değişken literalini doğru yorumlayın. Her üçgende dışarıda bırakılan oluşumun bağlantısını kapsamak için onun literal düğümü seçilmiş olmalıdır. Dolayısıyla her yan tümcede en az bir doğru literal bulunur.

**Görsel örnek.** `(a VEYA b VEYA c)` için a=doğru,b=c=yanlış. Seçilenler a,¬b,¬c,b₁,c₁: 3+2=5 düğüm, dokuz kenarı da kapsar. a₁ dışarıdadır ama a bağlantı ucunda seçilidir.

**Kontrol ve cevap.** Her değişkenin iki literalini birden seçemez miyiz? Bütçeyi aşarız; üçgenlerden eksiltmek de onların kenarlarını açık bırakır. Yapım 2n+3m düğüm ve n+6m kenar üretir, yani boyut doğrusaldır. Bir örtünün kenarları kapsadığını polinom zamanda kontrol etmek de NP üyeliğini sağlar.

## 15. Eşit makine yükü bir bölüştürme sorusudur

[Ders sayfasındaki örnek 15](../#example-15) · [İlgili ders notu](../lecture-notes.html#topic-4-3)

8,7,6,5,4 toplamı 30. Partition, bütün sayıları iki gruba tam birer kez koyarak toplamları eşitlemenin mümkün olup olmadığını sorar. Burada 8+7=15 ve 6+5+4=15 bir tanıktır.

**Kontrol.** Sadece iki toplamın eşitliğine bakmayın: bir işi unutmuş veya iki gruba birden koymuş olabiliriz. Görev kimlikleri birlikte bütün girdiyi bir kez kapsamalı, gruplar ayrık olmalıdır.

**Hedef farkı.** Subset Sum keyfî T hedefli bir alt küme sorar. Partition hedefi toplamın yarısı olarak belirler ve kalanlar diğer gruptur. Bunlar yakın ama aynı soru cümlesi değildir.

**Tek toplam.** Tamsayı sürelerin toplamı 31 ise eşit gruplar 15,5 gerektirir; tamsayıların toplamıyla mümkün değildir. Çift toplam ise yalnızca gerekli koşuldur: 2,2,2 toplamı 6 ama 3 yapan alt küme yoktur.

**Karmaşıklık.** İkili yazılmış pozitif tamsayılarla karar sürümleri NP-tamdır; aynı zamanda sayısal hedefe bağlı sözde polinom DP yöntemleri vardır. Bu iki bilgi çelişmez, çünkü hedefin değeri girdi bit uzunluğundan çok büyük olabilir.

**Mühendislik modeli.** Buradaki işler bağımsız ve iki özdeş makinede çalışır. Genel job-shop modelindeki işlem sıraları, belirli makine rotaları veya bekleme kısıtları yoktur. “İş planlama” başlığını görmek, bu basit modelin bütün fabrika çizelgelemesini temsil ettiği anlamına gelmez.

**Kontrol ve cevap.** Eşit bölme yoksa işler planlanamaz mı? Hayır; eşit olmayan yüklerle plan yapılabilir. Eşitlik hedefinin başarısızlığı, bütün fizibilitenin başarısızlığı değildir.

## 16. İkinci mola: hangi şeyin tümleyenini aldık?

[Ders sayfasındaki örnek 16](../#example-16) · [İlgili ders notu](../lecture-notes.html)

122–132. dakikalardaki moladan sonra üç dönüşümü kendi cümlenizle açıklayın.

| Dönüşüm | Değişen | Korunan cevap ilişkisi |
|---|---|---|
| Örtü → bağımsız küme | Seçilen düğüm kümesi | En fazla k ↔ en az n−k |
| Bağımsız küme → klik | Grafın kenarları | Aynı küme, aynı k |
| Dört literal → iki üçlü yan tümce | Yeni yardımcı değişken | Eski doğru ↔ çalışan bir yardımcı değer var |

**Soru:** w'nin iki değerinden biri başarısızsa dönüşüm bozulmuş mudur? **Cevap:** Hayır. Başarılı en az bir w yeterlidir. Hiçbiri çalışmıyorsa o eski atama için yeni formül doyurulamıyordur.

**Soru:** Grafı tümleyip seçilen kümeyi de otomatik tümlemeli miyiz? **Cevap:** Hayır. Bağımsız-küme/klik ilişkisinde aynı seçili küme tutulur. İki farklı işlemi karıştırmayın.

**Soru:** 3-SAT grafında bütçeyi büyütürsek neden kanıt değişir? **Cevap:** Fazla düğüm seçmek iki zıt literal düğümünü de kapsama alabilir; tam bir tutarlı doğruluk seçimi çıkaran sıkı bütçe gerekçesi artık aynı şekilde işlemez.

**Kısa kontrol.** Partition toplamının çift olması yeterli mi? Hayır; 2,2,2 karşı örneği. Basit bir gerekli koşul ile problemi tamamen çözen koşulu ayırın.

## 17. Hızlı bir plan iyi olabilir, en iyi olmayabilir

[Ders sayfasındaki örnek 17](../#example-17) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

LPT yöntemi işleri büyükten küçüğe sıralar ve her işi o anda daha az yüklü makineye verir. Eşitlikte ilk makine seçiliyor.

| Atanan iş | Makine | Son yükler |
|---|---|---|
| 8 | 1 | 8,0 |
| 7 | 2 | 8,7 |
| 6 | 2 | 8,13 |
| 5 | 1 | 13,13 |
| 4 | 1 | 17,13 |

Bitiş süresi büyük yük olan 17. Geçerli bir plan, fakat 8+7 ve 6+5+4 dağılımıyla 15 elde edilebilir.

**Optimum kanıtı.** Bütün işlerin toplamı 30. İki makinenin ikisi de 15'ten önce biterse toplam 30 birim işi tamamlamaları mümkün olmaz. OPT≥15. Elde 15'lik plan da olduğundan OPT≤15. Böylece OPT=15.

**Somut kalite farkı.** Bu örnekte sezgisel sonuç optimumdan 2 birim fazla; oran 17/15≈1,1333. Bu hesap bu tek girdiye aittir. Bütün girdiler için bir yaklaşım faktörü söylemek ayrıca genel kanıt gerektirir. LPT için bilinen sınırlar bulunması, onun her örnekte tam optimum bulduğu anlamına gelmez.

**Görseli okuma.** İlk adımlar açgözlü atamaları gösterir. Son kare küçük örneğin bütün dağılımlarını deneyerek gerçek optimumla karşılaştırır. Bu tam aramanın büyük ölçeğe aynı hızda taşınacağı varsayılmamalıdır.

**Kontrol ve cevap.** 17 bulundu diye 16'nın imkânsız olduğunu söyleyebilir miyiz? Hayır. Daha önce 15'lik planı gördük. İyi bir aday üst sınır sağlar, daha iyi adayların yokluğunu kanıtlamaz.

## 18. Bildiğiniz şeyi alt ve üst sınırla ifade edin

[Ders sayfasındaki örnek 18](../#example-18) · [İlgili ders notu](../lecture-notes.html#topic-5-2)

Bu örnekte makinelere atanmış toplam işler 30,40,25 dakika; bir işin zorunlu sıralı işlem zinciri 35 dakika. Geçerliliği ayrıca kontrol edilmiş bir çizelgenin süresi 46 dakika.

**Alt sınırlar.** 40 dakikalık işi olan makine bu işleri aynı anda yapamaz; en az 40 dakika gerekir. Sıralı 35 dakikalık zincir de en az 35 ister. Bu işler kısmen paralel yürüyebileceği için 40+35 toplamıyoruz, maksimumlarını alıyoruz: LB=40.

**Üst sınır.** Gerçekten geçerli 46'lık çizelge varsa optimum ondan kötü olamaz. Sonuç `40 ≤ OPT ≤ 46`.

| Bilgi | Söylenebilecek sonuç |
|---|---|
| OPT en az 40 | 38 dakikalık plan bu modelde mümkün değil |
| Elde geçerli 46 var | OPT en fazla 46 |
| İki sınır birlikte | Plan en fazla 6 dakika fazla sürüyor |
| 46/OPT ≤ 46/40 | Optimuma göre en fazla %15 fazlalık |

**Yüzdeyi doğru okuyun.** Gerçek OPT 44 ise kayıp 2/44≈%4,55; OPT 46 ise kayıp sıfır. %15 hesaplanan üst sınırdır, gerçek kaybın tam değeri değildir. Paydanın optimum olduğu da açıkça belirtilmelidir.

**Varsayımlar.** Makine iş yükleri o makinelere zorunlu olarak atanmış işlerdir; eğer yeniden dağıtılabiliyorlarsa mevcut bir dağılımın 40 yükü bütün çözümler için alt sınır olmayabilir. Zincir de gerçekten ardışık olmak zorundadır.

**Kontrol ve cevap.** Sadece bu dört sayı bir 46'lık çizelge kurar mı? Hayır. Çakışmaların, sıraların ve kaynakların denetlendiği gerçek bir plan ayrıca gerekir.

## 19. Basit düğüm örtüsü algoritmasının iki kat garantisi

[Ders sayfasındaki örnek 19](../#example-19) · [İlgili ders notu](../lecture-notes.html#topic-5-3)

Ağırlıksız minimum düğüm örtüsü arıyoruz. Kapsanmamış bir kenar seç, **iki ucunu da** örtüye al, bu uçlara değen bütün kenarları kalan listeden çıkar. Kenar kalmayana kadar sürdür.

A–B–C–D yolunda önce AB seçilirse A ve B alınır; AB ve BC çıkarılır. Sonra CD seçilir; C ve D alınır. Dört düğüm döner. Oysa B,C ile iki düğüm yeterlidir.

**Kanıtın birinci yarısı: alt sınır.** Algoritmanın seçtiği kenarlar ortak uç taşımaz; bir eşleşme oluşturur. r böyle kenar varsa her geçerli örtü bunların her birinden en az bir uç almak zorundadır. Kenarlar uç paylaşmadığı için aynı düğüm iki ayrı zorunluluğu karşılayamaz: OPT≥r.

**İkinci yarısı: üretilen boyut.** Algoritma her kenardan iki uç alır: 2r düğüm. Çıkarılan her kenarın seçilmiş bir ucu vardır; işlem sonunda bütün kenarlar kapsanır. Dolayısıyla `dönen boyut=2r≤2OPT`.

**Seçim sırası.** Önce BC seçilirse B,C bütün yolu kapsar ve sonuç optimum olur. Garantinin anlamı her çalışmada tam iki kat kötü olmak değil, iki katı aşmamaktır.

**Kontrol ve cevap.** Her seçilen kenardan yalnızca bir uç alsak aynı kanıt sürer mi? Hayır; çıkarılan bütün komşu kenarların kapsandığı artık garanti değildir. En büyük eşleşmeyi bulmak da şart değildir; algoritma sonunda elde edilen maksimal eşleşme yeterlidir. Maksimal, yeni ayrık kenar eklenememesi; maksimum ise mümkün olan en çok kenar demektir.

Bu kanıt düğüm sayısını minimize eden ağırlıksız model içindir. Düğümlerin farklı maliyetleri varsa sayısal iki kat garantisi kendiliğinden maliyete geçmez.

## 20. MST tur garantisi metrik uzaklıklar ister

[Ders sayfasındaki örnek 20](../#example-20) · [İlgili ders notu](../lecture-notes.html#topic-5-4)

Birim karenin dört köşesi A,B,C,D sırayla çevrede olsun. Komşu köşeler arası 1, köşegenler √2. Tam yönsüz grafta bütün çiftler arasında doğrudan uzaklık vardır.

**MST.** Üç kenar bir ağacı bağlar. Her farklı köşe arası uzaklık en az 1 olduğundan maliyet en az 3; üç kare kenarı bunu sağlar. **Tur.** Kare çevresi dört birim kenarla maliyet 4. Her Hamilton turu dört kenar içerdiği ve her kenar en az 1 olduğu için 4 optimumdur.

**Genel kanıtın adımları:**

1. Optimum turdan bir kenar silince kapsayan ağaç kalır. Maliyetler negatif değilse bu ağaç turdan pahalı olmaz; MST≤OPT.
2. MST'nin her kenarını iki kez kullanmak bağlı, çift dereceli bir yapı verir; Euler yürüyüşü maliyeti 2MST.
3. Tekrarlanan düğümleri atlayarak henüz ziyaret edilmemiş düğüme doğrudan gidin. Üçgen eşitsizliği, doğrudan geçişin atlanan yol bölümünden pahalı olmamasını sağlar.
4. Elde edilen tur ≤2MST≤2OPT.

**Karede somut yürüyüş.** A–B–C–D ağacını iki kez gezmek A,B,C,D,C,B,A, maliyet 6. Tekrarlanan C ve B atlanınca A,B,C,D,A, maliyet 4 olur. Garantinin üst sınırına ulaşmak zorunda değiliz.

**Kontrol ve cevap.** Doğrudan geçiş yoksa veya üçgen eşitsizliği bozulursa kısaltma güvenli mi? Hayır. Eksik kenar geçişi imkânsız kılabilir; mevcut ama pahalı bir kenar maliyeti artırabilir. Bu iki-kat kanıtı tam, yönsüz, negatif olmayan metrik uzaklık varsayımlarıyla birlikte kullanılmalıdır.

## 21. Python ile önce doğrula, sonra küçük bir tam arama yap

[Ders sayfasındaki örnek 21](../#example-21) · [İlgili ders notu](../lecture-notes.html#topic-1-1)

Ana sayfadaki **Run** düğmesinin kodu aşağıdadır. Görev indeksleri 0'dan başlar. `[0,1]`, 8 ve 7 süreli iki işi belirtir. `input()` kullanılmaz.

```python
from itertools import combinations

jobs = [8, 7, 6, 5, 4]
target = 15

def verifies(indices):
    if len(set(indices)) != len(indices):
        return False
    if any(type(i) is not int or i < 0 or i >= len(jobs) for i in indices):
        return False
    return sum(jobs[i] for i in indices) == target

print("Check [0, 1]:", verifies([0, 1]))
print("Check [0, 0]:", verifies([0, 0]))
for size in range(len(jobs) + 1):
    for indices in combinations(range(len(jobs)), size):
        if verifies(indices):
            print("Valid:", indices, [jobs[i] for i in indices])
```

| Satır | Açıklama |
|---|---|
| 1 | Sabit boyutlu, tekrarsız indeks seçimlerini üreten combinations aracını alır. |
| 2 | Okunabilirlik için boş satır; işlem yapmaz. |
| 3 | Beş görev süresini listeler. |
| 4 | Aranan tam toplamı 15 yapar. |
| 5 | Boş ayırıcı satır. |
| 6 | Verilen aday indeksleri denetleyen fonksiyonu tanımlar. |
| 7 | Küme tekrarları kaldırır; boyut değişiyorsa aynı indeks tekrar kullanılmıştır. |
| 8 | Tekrarlı adayı False döndürerek reddeder. |
| 9 | Her indeksin tam int türünde, negatif olmayan ve liste sınırları içinde olduğunu sınar. any, bir geçersiz indeks bile varsa doğru olur. |
| 10 | Geçersiz indeksli adayı reddeder; böylece sonraki liste erişimi güvenli kalır. |
| 11 | Görev sürelerini toplar ve hedefe eşitlik sonucunu döndürür. |
| 12 | Boş ayırıcı satır. |
| 13 | Geçerli [0,1] tanığını deneyip sonucu yazar. |
| 14 | Aynı işi iki kez kullanan [0,0] adayını deneyip sonucu yazar. |
| 15 | Seçim boyutlarını 0,1,2,3,4,5 olarak gezer; üst sınır dahil olmadığı için +1 var. |
| 16 | O boyutta bütün farklı indeks kombinasyonlarını üretir. |
| 17 | Her adayı aynı doğrulayıcıya gönderir. |
| 18 | Geçerliyse indeks demetini ve karşılık gelen süre listesini yazdırır. |

Beklenen çıktı:

```text
Check [0, 1]: True
Check [0, 0]: False
Valid: (0, 1) [8, 7]
Valid: (2, 3, 4) [6, 5, 4]
```

**Kontrol ile aramanın maliyeti.** Tek tanık için tekrar, tür, sınır ve toplam kontrol edilir. Dıştaki iki döngü ise 1+5+10+10+5+1=32 alt kümeyi üretir. Doğrulayıcının kısa olması bu dış aramayı polinom yapmaz. Genel n için aday sayısı 2ⁿ, bu uygulamada toplam iş birim aritmetik ve olağan küme işlemleri altında O(n2ⁿ) ölçeğindedir.

**Girdi sözleşmesi.** Fonksiyon, hash edilebilir öğeler içeren liste/demet adayları için yazılmıştır; keyfî bozuk nesneleri güvenle işleyen bir kullanıcı-girdisi ayrıştırıcısı değildir. Örneğin iç içe liste `set` aşamasında hata verir. `type(i) is int` kontrolü bool değerini de reddeder; Python'da bool, int alt türü olsa bile burada kabul edilmez.

**Deney ve cevap.** `verifies([-1])` ve `verifies([5])` False. Hedef 16 yapılırsa [0,1] artık yanlış; geçerli seçim [7,5,4] olur. Hedef 0 ise boş seçim geçerlidir. Bir tanık hatasını düzeltmek ile tüm problem için yeni arama yapmak farklı işlerdir.

## 22. Sonuç verirken doğru garantiyi seçin

[Ders sayfasındaki örnek 22](../#example-22) · [İlgili ders notu](../lecture-notes.html#topic-5-1)

Bir mühendislik probleminde ilk iş “hangi algoritmayı yazalım?” sorusundan önce girdi, kısıt ve amacı açıklaştırmaktır. İki özdeş makine mi, farklı makineler mi? İşler bölünebilir mi? Öncelik veya teslim süresi var mı? Küçük model değişikliği çözüm yöntemini etkileyebilir.

| Çözücünün sonucu | Güvenle söylenebilecek şey |
|---|---|
| Doğrulanmış geçerli plan | Evet; minimizasyonda bir üst sınır var |
| Geçerli plan + eşit alt sınır | Plan optimum |
| İki-kat yaklaşım algoritması | Varsayımları altında değer en fazla 2OPT |
| Sezgisel sonuç ve ölçülmüş sınırlar | O örnek için bildirilen aralık/kalite sınırı |
| Süre doldu | Kaynak sınırına ulaşıldı; tek başına çözümsüzlük yok |

**Kesin yöntemler hâlâ değerlidir.** NP-tamlık bütün örneklerin pratikte zor olduğunu veya hiçbir büyük örneğin çözülemeyeceğini söylemez. Küçük boyut, özel yapı, DP, dal-sınır veya güçlü kesin çözücüler işe yarayabilir. Kanıtlanmış genel polinom çözücü ile birçok gerçek örneği hızlı çözmek farklı başarılardır.

**Yaklaşım ve sezgisel ayrımı.** “Örneklerde iyi çıktı” deneysel kanıttır; “izin verilen her girdide iki katı aşmaz” genel matematiksel garantidir. Bir sezgisel için de sınır hesaplanabilir; o durumda neyin örneğe özel, neyin genel olduğunu belirtin.

**AI ile bağlantı.** Kod doğru sözdizimiyle çalışsa bile yanlış hedefi minimize edebilir, bir işi iki kez kullanabilir veya zaman aşımını hayır gibi sunabilir. Öğrencinin katkısı çıktının anlamını, doğrulamasını ve garantisini denetlemektir.

**Son kontrol ve cevap.** “NP-tam, dolayısıyla polinom algoritma imkânsız” demek doğru mu? Bu koşulsuz biçimiyle hayır; P≠NP kanıtlanmış değildir. [Clay Mathematics Institute güncel durumu açık problem olarak listeler](https://www.claymath.org/millennium/p-vs-np/). Doğru sonuç, herhangi bir NP-tam problem için genel polinom algoritmanın P=NP sonucunu doğuracağıdır.

