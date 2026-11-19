# AA Play Lab — öğretmen için uygulama notları

## Öğrenciden ne bekliyoruz?

Amaç, oyundaki doğru düğmeleri ezberlemek değil; bir karar vermek, sonucunu görmek ve kararın neden işe yaradığını açıklayabilmek. Öğrenci oyun sonunda şu dört cümleyi kendi örneğiyle tamamlayabilmeli:

1. **Hedefim:** Neyi iyileştirmeye çalışıyorum?
2. **İlk denemem:** Hangi sırayı veya yöntemi seçtim, ne oldu?
3. **Değişikliğim:** Tek bir şeyi değiştirdim; sonuç nasıl değişti?
4. **Çıkarımım:** Bu örnekte neden işe yaradı? Başka bir durumda başarısız olabilir mi?

Her öğrenci bütün yıldızları hemen toplamak zorunda değil. Önce bir oyunu anlayarak bitirmesi, ardından yeni bir durumda aynı fikri kullanması daha değerli. Eşli çalışmada biri oynar, diğeri sıradaki hareketi ve sonucu açıklar; sonra roller değişir. Hız yarışı yapmayın.

## Oyunlara göre görev ve öğrenme kanıtı

| Oyun | Öğrenci ne yapacak? | Ne öğrenmesini bekliyoruz? | Anladığını nasıl görürüz? |
|---|---|---|---|
| **Beat the Robot** | Aynı duraklarda iki tam rota kuracak; bütün durakları gezip başlangıca dönecek. Pip’in en yakın durağa gitme kuralından kısa bir rota arayacak. | Geçerli çözüm ile iyi çözüm farklıdır. Bir adımda iyi görünen karar, bütün rota için en iyi karar olmayabilir. Tek geçerli karşı örnek “her zaman en iyi” iddiasını çürütür. | “Ben 14, Pip 16 metre gittik; aynı durakları gezdik ve başlangıca döndük” diyebilir. Yeni haritada robotu yenememesinin kuralın her zaman doğru olduğunu kanıtlamadığını açıklar. |
| **Command Centre** | Aynı işleri kuyruk ve yığınla çalıştıracak; sonra robotun son hareketlerini geri alacak. Adventure’da komut sırasını kendisi kuracak. | Kuyruk ilk gireni, yığın son gireni çıkarır. Veri yapısı işlem sırasını değiştirir. Undo, her adımda bir önceki durumu geri getirmelidir. | Right → Up → Up hareketlerini geri alırken Down → Down → Left gerektiğini açıklar. Yalnızca başlangıç noktasına dönmenin her ara adımın doğru olduğu anlamına gelmediğini söyler. |
| **Depot Detective** | 7, 14, 21 gibi aynı rafa yönelen parçaları yerleştirip arayacak. 14’ü boşluk bırakarak ve silinmiş işareti bırakarak ayrı ayrı silecek. Aynı anahtarları farklı sırayla ağaca ekleyecek. | Hash çakışması; aramanın durma koşulu; silmenin arama yolunu koruması; ağaç şeklinin maliyete etkisi. | “21 hâlâ orada ama arama boş rafı görünce erken durdu” diyebilir. Aynı yedi anahtarda 70’i dengeli yerleşimde 3, zincirde 7 kontrolle bulmayı karşılaştırır. |
| **Sorting Arena** | Aynı başlangıç dizisini iki araçla sıralayacak. Karşılaştırmaları ve diziye yazmaları ayrı ayrı okuyacak. Adventure’da yazma maliyetini ve iki hattı birleştirme işini hesaba katacak. | Doğru çıktı ile işlem maliyeti farklı ölçülerdir. Girdi sırası ve maliyet modeli yöntemin tercih edilirliğini değiştirir. Bölmek bedelsiz değildir. | “Daha az karşılaştırma yaptı ama daha çok yazdı” diyebilir. Yazma pahalılaşınca neden seçimini değiştirdiğini sayılarla gösterir. |
| **Factory Rush** | İşlerin sırasını değiştirecek; teslim tarihini, işlem süresini ve geliş anını birlikte inceleyecek. Bir turda kutu sayısını, başka turda zamanında teslim edilen değeri artıracak. | Hedef fonksiyonu, kısıt, bekleme, öncelik ve ödünleşim. Bir kural her iş kümesinde ve her hedefte en iyi olmayabilir. | Neden bir işi beklettiğini, neden bazen bütün işleri kurtaramadığını veya neden değerli bir yükü seçtiğini açıklar. “En çok kutu” ile “en çok değer”in farklı hedefler olduğunu ayırır. |

## Adventure bölümlerini nasıl kullanalım?

### Robot: dört adım

- **Beat Pip:** Bir karşı örnek bul. Önce geçerli tam rota, sonra mesafe karşılaştırması.
- **City blocks:** Mesafeyi yatay ve dikey sokaklardan say. Bu modelde çapraz uçuş yok.
- **Pick up first:** A’dan almadan D’ye teslim etme. Daha kısa fakat kuralı bozan rota çözüm değildir.
- **A new city:** Harita değişince eski sırayı kopyalama; aynı düşünceyi yeni duruma uygula.

Sorunuz: “Mesafeyi düşürdün ama bir teslimat koşulunu bozduysan başarılı sayılır mısın?”

### Command Centre: dört adım

- **Find the exit:** Kuyruktaki komutları yazıldığı sırada çalıştır.
- **Reverse control:** Yığında son yazılan önce çalışır; programı buna göre kur.
- **Collect the key:** Çıkışa varmak tek başına yetmez; anahtar da gerekir.
- **A new mission:** Harita değişince yürütme sırasını yeniden izle.

Sorunuz: “Aynı ok listesini kuyruktan yığına geçirirsek robotun ilk hareketi ne olur?”

### Depot: dört adım

- **Build the shelves:** Yerleştirme sırası ile çakışmaları ve en uzun arama yolunu incele.
- **The lost parcel:** Silinmiş işaretinin neden gerekli olduğunu başarısız aramadan gör.
- **Grow a tree:** Aynı sayıları farklı sırayla ekle; ağacın yüksekliğini ve arama yolunu karşılaştır.
- **Choose the index:** Yeni anahtar kümesine göre hash tablosu veya ağaç seç.

Sorunuz: “Bir anahtarın hızlı bulunması, bütün anahtarların hızlı bulunacağını gösterir mi?” Hedef burada en yavaş aramanın kontrol sayısıdır.

### Sorting: dört adım

- **An easy line?:** Zaten sıralı girdide gereksiz taramayı fark et.
- **Expensive writes:** Yazmanın pahalı olduğu durumda yalnızca karşılaştırma sayısına bakma.
- **Two packing lanes:** Bölmenin kazancını birleştirme maliyetiyle birlikte hesapla.
- **A new contract:** Yeni sayılar ve yeni maliyetlerle eski planı yeniden değerlendir.

Sorunuz: “İki hattı ayrı ayrı sıralamak bittiğinde bütün iş bitmiş oluyor mu?” Buradaki enerji puanı eğitim amaçlı işlem maliyetidir; gerçek joule ölçümü değildir. İki hat seçmek de gerçek paralel çalışma süresini simüle etmez.

### Factory: altı adım

- **Open the doors:** Sırayı teslim tarihine göre yeniden düzenle.
- **The big box:** Uzun işin kısa işleri bekletmesini fark et.
- **You cannot save everyone:** Ulaşılamayan hedefi zorlamak yerine kurtarılan iş sayısını artır.
- **Special cargo:** Kutu sayısı yerine zamanında taşınan değeri artır.
- **Wait for it:** Yakında gelecek kısa işleri beklemek bazen uzun işe hemen başlamaktan iyidir.
- **New factory day:** Değişen siparişlerde yeni plan kur; eski sıra evrensel kural değildir.

Sorunuz: “Neden fabrikanın kısa süre boş durmasına izin verdin?” Model tek işçili ve kesintisizdir: başlamış iş durdurulamaz; geliş zamanları önceden görünür. Oyun içi adımlar gerçek sınıf süresi değildir.

## Ders sırasında uygulanacak kısa döngü

1. **Oyna:** Başlangıçta uzun açıklama yapmadan bir deneme yaptırın.
2. **Karşılaştır:** Aynı girdide ikinci bir plan denetsinler. İki denemede hem veriyi hem yöntemi değiştirirlerse farkın nedenini ayıramazlar.
3. **Göster:** Öğrenci tek bir kritik hamleyi veya sonucu ekranda göstersin.
4. **Adlandır:** Önce deneyimi konuşturun; sonra “kuyruk”, “karşı örnek”, “maliyet”, “kısıt” terimini bağlayın.
5. **Yeni durum:** Bir değer, hedef veya kural değişsin. Öğrenci ezberi değil fikri taşıyabilsin.

Zorlanan öğrenciye tam çözümü söylemek yerine iki seçenek verin: “Bu işi önce yaparsan hangisi bekler?” İlerleyen öğrenciye “Kuralının bozulduğu bir durum bul” görevi verin. Yeni durumu açıklayamadan çok yıldız toplayan öğrenciye daha fazla bölüm vermek yerine önceki iki denemeyi karşılaştırmasını isteyin.

## Sembol ve karmaşıklık konusuna köprü

Oyun puanı doğrudan O(n) veya Θ(n) değildir. Önce n’nin ne olduğunu belirleyin: parça sayısı mı, durak sayısı mı, iş sayısı mı? Sonra hangi işlemi saydığınızı söyleyin. Örneğin selection sort için 4 parçada 6, 8 parçada 28 anahtar karşılaştırmasını saymak büyüme fikrine giriş olabilir; birkaç küçük ölçüm tek başına asimptotik ispat değildir.

Hash tablolarında her arama kesin O(1) değildir. Bu oyundaki doğrusal sondalama çakışmalarda uzar. Ağaç da kendini dengelemez; zincire dönüşebilir. “Dengeli ağaçta arama daha kısa olabilir” gözlemini bu koşulları söyleyerek genelleştirin. Yığının her problemde kuyruktan iyi veya kuyruk algoritmasının her çizelgeleme probleminde optimal olduğu sonucunu çıkarmayın.

## Puan ve öğrenme aynı şey değildir

Ortak sınıf tablosunda beş oyun, **48 sabit hedef** üzerinden görünür: her hedefin ilk başarısı 10 puan, toplam **480 puan**. Bunun 33 hedefi temel oyunlar ve Adventure (330 puan), 15 hedefi Strategy Quests (150 puan) içindir. Robot/Commands/Depot: iki temel hedef + dört Adventure; Sorting: Mixed up dizisinde iki araç + dört Adventure; Factory: üç Classic hedef + altı Adventure. Her oyunda ayrıca Rescue, Rule flip ve Plan duel olmak üzere üç Strategy Quest vardır. Robot, Commands, Depot ve Sorting 9’ar hedef/90’ar puan; Factory 12 hedef/120 puandır. Serbest denemeler ve yeni rastgele günler pratik içindir; aynı hedef tekrar puan üretmez. Bu, öğrenme kanıtı değil tamamlanma göstergesidir.

Factory’nin ayrı performans tablosunda önce zamanında teslim sayısı, eşitlikte en uzun bekleme karşılaştırılır. Tıklama hızı puan kazandırmaz. Genel tabloda aynı tamamlanma sayısı aynı sırayı paylaşır. Bir oyunun daha fazla hedefi olması daha fazla toplam puan imkânı verir; oyun sütunlarında paydalar bu yüzden görünür.

Bunlar ders notuna eklenmemeli: mevcut değerlendirme düzeni %50 ara sınav + %50 final olarak kalır. Sınıf tablosu öğrenciyi sıralamak için tek öğrenme ölçütü değildir; takma ad, tekrar deneme ve eşli çalışma serbesttir.

## Öğrenciden alınacak çok kısa çalışma kaydı

- Oyun ve hedef:
- İlk planım ve sonucum:
- Değiştirdiğim tek şey:
- Yeni sonuç:
- Neden değiştiğini gösteren bir hamle:
- Bu fikri sınayacağım yeni durum:

Bu kaydı bütün bölümlerde istemeyin. Her oyundan seçilen bir anlamlı deneme yeterli. İsterseniz yazı yerine öğrenci bir arkadaşına ekran üzerinde anlatabilir.

Öğretmen için üç gözlem düzeyi: **Deniyor** (hamle yapıyor, nedenini henüz açıklayamıyor); **Açıklıyor** (kendi örneğinde sebep-sonuç kuruyor); **Aktarıyor** (yeni durumda planını gerekçesiyle değiştirebiliyor). Bunlar puanlama değil, hangi desteği vereceğinizi gösteren notlardır.

## Canlı testten çıkarım

19 Ekim 2026: `test_user`, First shift’te Stack ile B→C→D→E→F→A oynadı: 5/6 zamanında, en uzun bekleme 5 adım. Aynı girdide Queue ile A→B→C→D→E→F: 6/6, en uzun bekleme 1 adım. Sunucu daha iyi sonucu sakladı. Busy shift’te A→B→C→D→F→E: 5/6, en uzun bekleme 4 adım. Altı iş altı teslim adımı gerektirirken bütün son teslim tarihleri en geç 5. adım olduğundan 6/6 mümkün değildir.

Bu testin benim için gösterdiği: arayüzden oynama, sınıfa katılma, sonucu sunucuya kaydetme ve en iyi sonucu güncelleme çalışıyor. Ben kuralları ve kaynak kodu önceden biliyorum; yüksek puanım oyunun yeni başlayan bir öğrenciye tek başına yeterince öğrettiğini kanıtlamaz. Bunun için öğrencinin kendi açıklamasına ve yeni durumdaki kararına bakmalıyız.

## Derse başlarken öğrenciye söyleyebileceğiniz yönerge

“Bir oyun seçin. Önce kendi planınızı deneyin. Sonra aynı durumda tek bir kararınızı değiştirin. Sonuçları karşılaştırın. Arkadaşınıza hangi hamlenin sonucu değiştirdiğini gösterin. Bir yıldız kazandığınızda yeni bir örnekte de aynı fikrin işe yarayıp yaramadığını deneyin. Hata yapmak serbest; nedenini bulmak oyunun bir parçası.”

## Her oyun için somut küçük çalışma

| Oyun | İki deneme | Öğrenciden isteyeceğiniz açıklama | Sonraki deneme |
|---|---|---|---|
| Robot | Aynı haritada önce en yakın durağı seç; sonra farklı bir tam rota kur. | “Bu kısa adım, daha sonra hangi uzun dönüşe neden oldu?” İki toplam mesafeyi göstersin. | Yeni haritada aynı sıranın hâlâ iyi olup olmadığını sınasın. |
| Commands | Aynı ok listesini önce kuyrukla, sonra yığınla çalıştır. | İlk çalışacak oku önceden söylesin; sonuç değişince sırayı açıklasın. | Anahtarlı bölümde yalnızca çıkışa varmanın neden yetmediğini göstersin. |
| Depot | 7, 14, 21'i yerleştir; 14'ü boş bırakarak ve silinmiş işaretiyle ayrı ayrı sil. | 21'i ararken kontrol edilen rafları tek tek göstersin. | Aynı anahtarları ağaca farklı sırayla ekleyip en uzun arama yolunu karşılaştırsın. |
| Sorting | Aynı karışık diziyi selection ve insertion ile sırala. | Doğru sonuç, karşılaştırma ve yazma sayılarını ayrı ayrı karşılaştırsın. | Yazma maliyetini artıran Adventure bölümünde tercihinin neden değiştiğini söylesin. |
| Factory | Aynı siparişlerde iki farklı tam iş sırası dene. | Hangi işin hangi iş yüzünden geç kaldığını çizelgede göstersin. | Değerli yük bölümünde kutu sayısı ile toplam değeri ayrı ayrı değerlendirsin. |

Her öğrenciden bu beş çalışmanın her biri için bir karşılaştırma bekleyebilirsiniz; bütün bölümleri tek derste bitirmeyi zorunlu tutmayın. Hızlı ilerleyenlere yeni durum ve karşı örnek görevi verin. Zorlananlara bir oyunda iki gerekçeli deneme yaptırın.

## Canlı oynama kapsamı ve sınırları

19 Ekim 2026 kontrolünde beş oyunun temel görevleri, Sorting'in iki yöntemi ve 22 Adventure bölümü arayüzden oynandı. Sorting'in sabit karışık dizisinde selection: 15 karşılaştırma / 6 yazma; insertion: 12 karşılaştırma / 14 yazma verdi. Bu, “daha az karşılaştırma” ile “daha az yazma”nın aynı şey olmadığını göstermek için uygun bir karşılaştırmadır.

Bu oynama kontrolü bütün görsel durumların hatasız olduğunu kanıtlamadı: kullanıcı ekran görüntülerinde küçük kutunun yüzünün kesildiği ve komut ızgarasında boş satırın daraldığı görüldü. Bu iki sorun daha sonra düzeltilip tekrar kontrol edildi; aşağıdaki güncel kontrol kapsamına bakın. Oynanış testi, görsel test ve öğrencinin gerçekten öğrenmesini değerlendirme ayrı kontrollerdir.


## Güncel Adventure gösterimlerini derste kullanma

Öğrenciler [Play Lab](https://arifsolmaz.github.io/courses/aa/play-lab/) üzerinden oyunları açabilir. [Adventure Worlds](https://arifsolmaz.github.io/courses/aa/play-lab/adventures/) dört oyunun seviyelerini, [Factory Rush](https://arifsolmaz.github.io/courses/aa/play-lab/factory/) kendi Adventure modunu içerir. Ortak puan için üstteki sınıf koduyla [sınıf tablosuna](https://arifsolmaz.github.io/courses/aa/play-lab/board/) takma adla katılmaları gerekir. Yıldızlar tarayıcıda saklanır; ortak tablo ayrı sunucu kaydıdır. Eski yerel yıldızları olan öğrenci, ortak tabloya kaydetmek için hedefi yeniden tamamlayabilir. Aynı hedef ikinci kez puan eklemez.

| Ekranda ne gösteriliyor? | Öğrenciden ne isteyin? | Kaçınılacak yanlış çıkarım |
|---|---|---|
| **Robot:** seçilen duraklar ve başlangıca dönüş yolu. | İki tam rotanın toplamını karşılaştırsın; A’dan alma/D’ye teslim koşulunu ayrıca denetlesin. | Daha kısa fakat geçersiz rota başarı değildir. Bu haritada mesafe yatay+dikey sokak uzunluğudur. |
| **Commands:** yürütülen komut vurgulanır; çarpışmada sorunlu komut ve robotun kaldığı hücre kırmızı görünür. | Önce ilk çalışacak komutu göstersin. Çarpışmadan sonra bütün planı silmeden tek hatalı komutu düzeltsin. Yığında vurgunun neden ters yönde ilerlediğini anlatsın. | Robotun kırmızı hücresi duvarın kendisi değildir; robotun çarpmadan önce kaldığı yerdir. |
| **Depot:** aranan anahtar, izlenen yol ve bulundu/durdu sonucu görünür; ilgili raflar veya düğümler vurgulanır. | Başarısız aramada hangi boş rafın aramayı durdurduğunu göstersin. Dengeli ağaç ile zincirin en uzun aramasını karşılaştırsın. | Bir karede vurgulanan bütün düğümler eşzamanlı kontrol edilmez. Gösterim her aramanın yol özetidir; her tekil sondalamanın animasyonu değildir. |
| **Sorting:** başlangıç sırası, sıralanmış iki hat ve birleşmiş sonuç ayrı aşamalardır. | İki hattın kendi içinde sıralı olmasına rağmen bütün dizinin neden hazır olmadığını anlatsın; birleştirme maliyetini sonuçtan okusun. | Bunlar aşama özetleridir; her karşılaştırma ve yazma ayrı hareketle gösterilmez. Animasyon süresi algoritmanın çalışma süresi değildir. |

“Test my plan” sırasında sırayı izlesinler; sonra **aynı girdide** bir karar değiştirip yeniden denesinler. Animasyonu izleyerek puan almak yerine “hangi karar sonucu değiştirdi?” sorusuna bir ekran örneğiyle yanıt vermelerini bekleyin. Ayrıntılı ipucu gerektiğinde açılabilir; başlangıçta bütün açıklamaları okutmanız gerekmez.

## Strategy Quests ile öğrenmeyi derinleştirme

Her oyundaki [Strategy Quests](https://arifsolmaz.github.io/courses/aa/play-lab/quests/) bağlantısı üç farklı düşünme görevi açar:

- **Rescue:** Verilen sorunlu planı düzelt. Öğrenci önce sorunu, sonra yaptığı değişikliğin etkisini söylesin.
- **Rule flip:** Önce ilk durumu çöz; kural veya veri değişince eski planı yeni durumda dene, sonra uyarla. Eski planın yeni durumda neden yetersiz kaldığını açıklasın.
- **Plan duel:** Rakip planla aynı koşullarda karşılaş. Ekrandaki hedefe göre seçimini gerekçelendirsin; sadece sonucun yeşil olmasına bakmasın.

İlerleyiş önerisi: bir temel oyun → aynı oyunun Adventure seviyeleri → Rescue → Rule flip → Plan duel. Bu zorunlu bir hız çizelgesi değildir. Zorlanan öğrenci iki anlamlı denemeyi açıklasın; ilerleyen öğrenci fikri yeni duruma taşısın. Her görev ilk başarıda 10 puandır; tekrarlar öğrenme için serbesttir ve puanı büyütmez.

## Güncel test kapsamı — 19 Ekim 2026

Factory dışındaki dört oyunun **16 Adventure seviyesi**, canlı sürümde tek tek laptop (1366×768) ve mobil boyutunda (390×844), her seviyede başarılı ve başarısız planla oynandı: toplam **64 deneme**. Sonrasında komut vurgusu, depo arama yolu, ağaç okunaklılığı ve sıralama aşamaları yerelde iyileştirildi; değişen 12 seviye her iki boyutta yeniden denendi. Ek olarak 320 pikselde 1+7 parçalı dar sıralama hattı kontrol edildi.

Mobil kontrol tarayıcı boyutu benzetimidir; fiziksel telefon testi değildir. Yeni durum üreten seviyelerde bu turda Case 1 kullanıldı. Bütün rastgele durumlar ve bütün cihazlar için hatasızlık iddiası yoktur. 15 Strategy Quest’in daha önceki canlı testinde `test_user` 480 puana ulaştı; tekrarlar 480’i artırmadı. Bu sonuçlar işleyişi doğrular, öğrencinin öğrenmesini tek başına ölçmez.
