const cards = [
  {
    "id": 19,
    "week": "1–4",
    "title": "Başlangıç: sembolsüz dört karar",
    "question": "Kâğıdı ikiye bölün. Sol tarafa ilk cevabınızı, sağa tartışmadan sonraki cevabınızı yazın.",
    "a": [
      "Gündelik işler",
      "1. 8 lambayı tek tek açıp kontrol et.\n2. Son yaptığın robot hareketini geri al."
    ],
    "b": [
      "İki durum daha",
      "3. 13 parçayı 5’lik kutulara koy.\n4. Aradığın kodun daha büyük olduğunu öğrenince küçük kodları ele."
    ],
    "lesson": "Henüz simge kullanmayın. Ne yaptığınızı bir arkadaşınıza tarif edin.",
    "check": "Önce tek başına 2 dk; sonra eşinle 3 dk. Her soru için “hangi işi saydım?” yazın.",
    "answer": "1: 8 kontrol. 2: son hareket önce geri alınır, yığın. 3: 3 kutu. 4: sıralı veride arama alanı küçülür; her seferinde yaklaşık yarısını eleyebilirsek logaritmik büyüme.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Başlangıç · tek başına, sonra eşinle",
    "minutes": 8,
    "start": 0,
    "end": 8
  },
  {
    "id": 20,
    "week": "2–3",
    "title": "Düzeltme kliniği: hızlı cevap mı, doğru soru mu?",
    "question": "Bir arkadaşınız “iki döngü varsa kesin n²” diyor.",
    "a": [
      "Durum A",
      "8 lambayı aç.\nSonra aynı 8 lambayı kapat.\n8+8=16 işlem."
    ],
    "b": [
      "Durum B",
      "8 vericinin her birini 8 alıcıyla test et.\n8×8=64 test."
    ],
    "lesson": "Döngü sayısını değil, her işin kaç kez yapıldığını sayın.",
    "check": "4 verici ve 6 alıcı için kaç test? 4 açma ve 6 kapama için kaç işlem?",
    "answer": "24 test; 10 açma/kapama işlemi. İki farklı boyut varsa n ve m kullanabiliriz; her şeyi n² diye adlandırmayın.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Başlangıç · tek başına, sonra eşinle",
    "minutes": 7,
    "start": 8,
    "end": 15
  },
  {
    "week": "1",
    "title": "Önce: neyi başarmak istiyoruz?",
    "question": "Robot 0’dan başlasın. Aynı doğru üzerindeki −4, −1, 1 ve 3 noktalarına uğrayıp 0’a dönsün.",
    "a": [
      "En yakına git: toplam 16 birim",
      "0 → −1 → 1 → 3 → −4 → 0\nMesafeler: 1+2+2+7+4 = 16.\nİlk eşitlikte −1’i seçtik."
    ],
    "b": [
      "Başka bir tur: toplam 14 birim",
      "0 → −1 → −4 → 1 → 3 → 0\nMesafeler: 1+3+5+2+3 = 14.\nİki tur da bütün noktaları ziyaret etti."
    ],
    "lesson": "En yakın sonraki adım, en kısa toplam turu garanti etmedi. Problem “en kısa turu bul”; algoritma ise hangi sırayla gideceğini söyleyen kuraldır.",
    "check": "Robot bir noktayı atlayıp daha kısa yol bulursa doğru mu?",
    "answer": "Hayır. Daha hızlı veya daha kısa olması, eksik işi doğru yapmaz.",
    "ref": "../../w1/#lesson",
    "extra": "Masada noktaları bir doğru üzerine koyun. İki turun uzunluğunu adım adım sayın. Uçlar −4 ve 3: araları 7. Kapalı bir tur bu aralığı iki yönde kat eder; en az 14 gerekir. B turu 14 ile bu sınıra ulaşır. Yakın komşu gibi bir sezgi (heuristic) iyi sonuç verebilir; en iyiyi garanti etmez.",
    "widget": "",
    "id": 1,
    "block": "Doğru çözüm · birlikte karşılaştır",
    "minutes": 4,
    "start": 15,
    "end": 19
  },
  {
    "week": "1",
    "title": "Aynı işler, iki farklı seçim",
    "question": "Tek test tezgâhında mümkün olduğunca çok işi bitirmek istiyoruz. Biten işle aynı anda yenisi başlayabilir.",
    "a": [
      "En kısa işi önce seç",
      "A: 0–3   B: 2–4   C: 3–5\nB ve C eşit kısa; eşitlikte B’yi seç.\nB ikisiyle de çakışır → yalnız 1 iş."
    ],
    "b": [
      "En erken biteni önce seç",
      "A’yı seç → saat 3’te biter.\nSonra C’yi seç → 3–5.\nSonuç: 2 iş."
    ],
    "lesson": "Eşitlikte B’yi seçen “en kısa iş” kuralı burada başarısız. Sabit zaman aralıklı işlerde, önce en erken biten uyumlu işi seçmek en fazla iş sayısını verir.",
    "check": "B 1.000 TL, A ve C toplam 200 TL kazandırırsa hangi amaç değişti?",
    "answer": "Artık iş sayısını değil geliri artırıyoruz. Aynı kural bu yeni amaç için garanti vermez.",
    "ref": "../../w1/#example-1-1",
    "extra": "Neden en erken biten? Başka bir çözümün ilk işini daha erken biten işle değiştirince, sonraki işlere ayrılan alan daralmaz. Aynı değişimi kalan işler için tekrar edebiliriz. Bu gerekçe bir örnekten daha güçlüdür. Eşitliksiz karşı örnek için C’yi 3–6 yapın: B tek başına en kısa iştir ama yine A ve C’den daha az iş seçtirir. Amaç iş sayısını artırmak; aralıklar sabit ve tek tezgâh var.",
    "widget": "",
    "id": 2,
    "block": "Doğru çözüm · birlikte karşılaştır",
    "minutes": 4,
    "start": 19,
    "end": 23
  },
  {
    "id": 21,
    "week": "1",
    "title": "Bozuk sıcaklık filtresi",
    "question": "Kural: yalnız 80’in ÜZERİNDEKİ sıcaklıklarda alarm ver.",
    "a": [
      "Yanlış kural: sıcaklık ≥ 80",
      "79 → alarm yok\n80 → alarm var\n81 → alarm var"
    ],
    "b": [
      "İstenen kural: sıcaklık > 80",
      "79 → alarm yok\n80 → alarm yok\n81 → alarm var"
    ],
    "lesson": "79 ve 81 ile test etmek hatayı yakalamaz. Sınırdaki 80 değeri karşı örnektir.",
    "check": "Eşinle “en az 80” ve “80’den büyük” için üçer test seç. Sonuçları karşılaştır.",
    "answer": "“En az 80” için 80 alarm verir; “80’den büyük” için vermez. Önce sözleşmeyi netleştirin; sonra kodu veya yöntemi denetleyin.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Doğru çözüm · birlikte karşılaştır",
    "minutes": 4,
    "start": 23,
    "end": 27
  },
  {
    "id": 22,
    "week": "1",
    "title": "Para üstü: büyük olanı almak neden yetmeyebilir?",
    "question": "Oyuncak makinede 1, 3 ve 4 değerli jetonlar var; her türden sınırsız. En az jetonla 6 ver.",
    "a": [
      "En büyüğü al",
      "4 + 1 + 1 = 6\n3 jeton."
    ],
    "b": [
      "Başka bir çözüm",
      "3 + 3 = 6\n2 jeton."
    ],
    "lesson": "Büyük jetonu önce almak bu sistemde en az sayıyı garanti etmedi. Bir karşı örnek yeter.",
    "check": "5 için iki yöntemi dene. Sonra 6’daki başarısızlığı bir cümleyle açıkla.",
    "answer": "5 için 4+1, iki jetonla en iyidir. Bir girdide başarılı olması, 6’da gördüğümüz hatayı silmez.",
    "ref": "../",
    "extra": "Gerçek para sistemleri hakkında genelleme yapmıyoruz. Jeton değerleri değişirse kuralın doğruluğu yeniden incelenir. Bütün kombinasyonları denemek küçük girdide kontrol yöntemi olabilir.",
    "widget": "",
    "block": "Doğru çözüm · birlikte karşılaştır",
    "minutes": 4,
    "start": 27,
    "end": 31
  },
  {
    "week": "1",
    "title": "Denemek ile garanti etmek farklı",
    "question": "Bir yöntemi 100 kez denedik. Hep çalıştı.",
    "a": [
      "100 başarılı deneme",
      "Yararlı kanıt izi.\nAma 101. farklı girdi bozuk olabilir."
    ],
    "b": [
      "Bütün durumları kapsayan gerekçe",
      "Başlangıç doğru.\nHer adım doğruluğu korur.\nİşlem mutlaka biter; sonuç sözleşmeye uyar."
    ],
    "lesson": "İspat, yalnızca denenen örnekleri değil bütün izin verilen girdileri kapsar. Tümevarımda küçük başlangıcı ve bir sonraki duruma geçişi gösteririz.",
    "check": "4 parçanın her sırasını denemek mi, 8 parçanın her sırasını denemek mi?",
    "answer": "4! = 24 sıra; 8! = 40.320 sıra. Parça sayısı iki katına çıktı ama deneme sayısı 1.680 kat oldu.",
    "ref": "../../w1/#lesson",
    "extra": "Kaba kuvvet (brute force), bütün adayları deneyip geçerli olanların en iyisini seçebilir. Doğru aday kümesi ve doğru puanlama gerekir; bu doğruluk, hız garantisi değildir. n! = n × (n−1) × … × 1; burada farklı parçaların bütün sıralarını sayıyoruz. Tam doğruluk için sonlanma da gösterilir: örneğin her turda kalan sonlu öğe sayısı azalır. Değişmezi korumak tek başına sonsuz döngüyü dışlamaz.",
    "widget": "",
    "id": 3,
    "block": "Doğru çözüm · birlikte karşılaştır",
    "minutes": 4,
    "start": 31,
    "end": 35
  },
  {
    "week": "2",
    "title": "n bir sır değil: kaç sensör var?",
    "question": "Her sensörü bir kez kontrol ediyoruz. Bir kontrolü bir iş birimi sayalım.",
    "a": [
      "Bir kez kontrol",
      "4 sensör → 4 kontrol\n8 sensör → 8 kontrol"
    ],
    "b": [
      "İki kez kontrol",
      "4 sensör → 8 kontrol\n8 sensör → 16 kontrol"
    ],
    "lesson": "İkisinde de sensör sayısını iki katına çıkarınca iş iki katına çıkıyor. Aynı büyüme biçimi; aynı iş miktarı değil.",
    "check": "n=6 iken ikinci yöntem kaç kontrol yapar?",
    "answer": "12. Burada n=6, iş=2n. n saniye demek değildir.",
    "ref": "../../w2/#lesson",
    "extra": "RAM modeli: küçük sayı karşılaştırması veya dizi gözüne erişim gibi temel işlemleri sabit maliyetli sayarız. Gerçek saniye; cihaz, dil ve işlem türüne bağlıdır. Çok büyük sayılar ve uzun metinler bu sabit maliyet varsayımına uymayabilir.",
    "widget": "growth",
    "id": 4,
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 4,
    "start": 35,
    "end": 39
  },
  {
    "id": 23,
    "week": "2–3",
    "title": "Kayıp anahtar: yeri değiştirilince iş değişir",
    "question": "Numaralı altı bölmeden birinde anahtar var. Soldan sağa bak.",
    "a": [
      "Anahtar ilk bölmede",
      "İlk kapağı aç → bul.\n1 arama adımı."
    ],
    "b": [
      "Anahtar son bölmede",
      "Altı kapağı da aç.\n6 arama adımı."
    ],
    "lesson": "Aynı yöntem, farklı girdi: farklı iş. Arama adımını bir bölmeyi kontrol etmek olarak sayıyoruz.",
    "check": "Anahtarın konumunu 2, 5, sonra 6 yapın. Kaç kontrol gerekti? “Bulundu” ile “yok” durumunu ayırın.",
    "answer": "Sırasıyla 2, 5, 6. Anahtar hiç yoksa da 6 kontrol gerekir; bütün bölmeleri eledikten sonra “yok” diyebiliriz.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "search",
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 4,
    "start": 39,
    "end": 43
  },
  {
    "week": "2–3",
    "title": "Arızalı sensör nerede?",
    "question": "8 sensörü soldan sağa kontrol et; ilk arızayı görünce dur.",
    "a": [
      "Arıza ilk sensörde",
      "1 kontrol.\nListe büyüse de bu durum hâlâ 1 kontrol."
    ],
    "b": [
      "Arıza son sensörde",
      "8 kontrol.\n16 sensörde sonuncu bozuksa 16 kontrol."
    ],
    "lesson": "En iyi durum: 1 kontrol, Θ(1). En kötü durum: n kontrol, Θ(n). Bu iki durum aynı algoritmaya aittir.",
    "check": "Arızanın her konumda olma olasılığı eşitse, 8 sensörde ortalama?",
    "answer": "(1+2+3+4+5+6+7+8)/8 = 4,5 kontrol. Tek çalışmada yarım kontrol yok; çok sayıda çalışmanın ortalaması var.",
    "ref": "../../w3/#r0_A",
    "extra": "Tam bir arıza olduğunu varsaydık. Hiç arıza yoksa bütün n sensörü denetleriz. Ortalama sonuç, seçtiğimiz olasılık varsayımına bağlıdır; en iyi ile en kötünün ortasını her problemde alamayız.",
    "widget": "",
    "id": 6,
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 4,
    "start": 43,
    "end": 47
  },
  {
    "week": "3",
    "title": "İki tur mu, her biriyle her biri mi?",
    "question": "4 sensörü test ediyoruz. Döngü sayısından önce yapılan işi tarif edin.",
    "a": [
      "Arka arkaya iki tarama",
      "4 sıcaklık + 4 voltaj kontrolü = 8.\n8 sensörde: 8+8=16.\nToplarız → Θ(n)."
    ],
    "b": [
      "Her sensörü her sensörle karşılaştır",
      "Kendisiyle de karşılaştır; AB ve BA ayrı sayılsın.\n4×4 = 16; 8×8 = 64 kontrol.\nBu modelde çarparız → Θ(n²)."
    ],
    "lesson": "Art arda işler toplanır. Her dış adımın içinde tekrar edilen işler çarpılabilir. Ama iç işin sayısı değişiyorsa tek tek toplamak gerekir.",
    "check": "Her farklı sensör çiftini yalnız bir kez karşılaştırsak, 4 sensörde kaç çift?",
    "answer": "3+2+1=6 çift: AB, AC, AD, BC, BD, CD. 8 sensörde 28. Formül n(n−1)/2; büyüme Θ(n²).",
    "ref": "../../w3/",
    "extra": "Üç farklı sensör seçip her üçlüyü bir kez incelemek: 4 sensörde 4, 8 sensörde 56 üçlü. Sayı n(n−1)(n−2)/6, büyüme Θ(n³). “Üç döngü var” tek başına yetmez; sınırlarını da okumalıyız.",
    "widget": "",
    "id": 7,
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 4,
    "start": 47,
    "end": 51
  },
  {
    "id": 24,
    "week": "2–3",
    "title": "El sıkışma mı, iki takımın maçları mı?",
    "question": "Her karşılaşmayı yalnız bir kez sayın.",
    "a": [
      "4 kişilik tek grup",
      "AB, AC, AD, BC, BD, CD\n6 farklı çift."
    ],
    "b": [
      "4 kişilik iki ayrı takım",
      "Her A takımı üyesi 4 B üyesiyle oynar.\n4×4=16 eşleşme."
    ],
    "lesson": "“Her biriyle her biri” ifadesinde aynı grupta mı, iki ayrı grupta mı olduğunuzu sorun. Kendisiyle eşleştirme var mı?",
    "check": "5 kişilik tek grup için çizerek sayın. İki takımda 5’er kişi varsa tekrar sayın.",
    "answer": "Tek grup: 4+3+2+1=10. İki takım: 5×5=25. İkisinin de büyümesi kareseldir, ama gerçek sayıları farklıdır.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "pairs",
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 4,
    "start": 51,
    "end": 55
  },
  {
    "week": "2–3",
    "title": "Her defasında yarısını ele",
    "question": "Bir parçanın numarasını sıralı kutularda arıyoruz.",
    "a": [
      "Tek tek ara",
      "16 kutuda en kötü 16 kutu aç.\n32 kutuda en kötü 32."
    ],
    "b": [
      "Ortaya bak, yarıyı ele",
      "16 → 8 → 4 → 2 → 1\n32 → 16 → 8 → 4 → 2 → 1\nBoyut iki kat: yalnız bir yarılama daha."
    ],
    "lesson": "log₂16=4: 16’yı 1’e indirmek için 4 yarılama. Logaritma burada “kaç kez yarıya?” sorusunun kısa yazımıdır.",
    "check": "16 sıralı kutuda ikili arama en kötü tam 4 kutuya mı bakar?",
    "answer": "Hayır; standart ortanca eleman araması 5 kutuya bakabilir. Farklı anahtarlarda, n≥1 için en kötü başarılı arama ⌊log₂n⌋+1 kutu kontrolüdür; Θ(log n).",
    "ref": "../../w3/",
    "extra": "İkili arama için veriler sıralı olmalı ve ortadaki elemana hızlı erişebilmeliyiz. Bağlı listede ortayı bulmak yürümeyi gerektirir. Çarpımın logaritması toplamdır: log₂(8×4)=3+2=5. log₂(n²)=2log₂n. Sabit taban değişimi yalnız sabit çarpan değiştirir. Burada bir ortanca kutuyu incelemeyi tek adım sayıyoruz. Kodda ayrı == ve < testleri kullanılırsa ilkel karşılaştırma sayısı farklıdır. Animasyon yalnız boyutu yukarı yuvarlayarak yarılama modelidir; gerçek ikili aramanın kalan adaylarını bire bir göstermez.",
    "widget": "half",
    "id": 8,
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 3,
    "start": 55,
    "end": 58
  },
  {
    "week": "2–3",
    "title": "⌈ ⌉ ve ⌊ ⌋: kutu sayısı",
    "question": "10 parçayı, her biri en çok 4 parça alan kutulara koyuyoruz.",
    "a": [
      "⌈10/4⌉ = 3 kutu",
      "[4 parça] [4 parça] [2 parça]\n2,5 kutu satın alamayız. Yukarı yuvarla."
    ],
    "b": [
      "⌊10/4⌋ = 2 dolu kutu",
      "İki kutu tamamen dolu.\nSon kutu yarım dolu. Aşağı yuvarla."
    ],
    "lesson": "⌈x⌉: x’ten küçük olmayan en yakın tam sayı. ⌊x⌋: x’ten büyük olmayan en yakın tam sayı. Bu işaretler büyüme sınıfı değildir.",
    "check": "12 parça için? 0 parça için?",
    "answer": "12/4=3: hem aşağı hem yukarı 3. Hiç parça yoksa gereken kutu 0.",
    "ref": "../../w3/#r0_a0",
    "extra": "İngilizce “ceiling” hem ⌈x⌉ için hem üst sınır benzetmesinde kullanılır. İşlemler farklıdır: ⌈2,5⌉ sayıyı 3 yapar; O(n) büyüme hakkında bir sınır bildirir.",
    "widget": "boxes",
    "id": 9,
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 3,
    "start": 58,
    "end": 61
  },
  {
    "id": 26,
    "week": "2–3",
    "title": "Servis minibüsü ve tam ekipler",
    "question": "17 öğrenci var. Bir minibüs 5 kişi alıyor; bir proje ekibi tam 5 kişi olmalı.",
    "a": [
      "Herkesi taşı",
      "5+5+5+2\n4 minibüs → ⌈17/5⌉."
    ],
    "b": [
      "Tam ekip kur",
      "5+5+5; 2 kişi artar.\n3 tam ekip → ⌊17/5⌋."
    ],
    "lesson": "Aynı bölme, iki farklı soru: herkese yer açmak mı, tamamen dolu grup saymak mı?",
    "check": "Önce 20, sonra 21 öğrenci için iki cevabı yazın. Artan kişi sayısını da bulun.",
    "answer": "20: 4 minibüs, 4 tam ekip, 0 artan. 21: 5 minibüs, 4 tam ekip, 1 artan. Bölme tam çıkınca iki yuvarlama aynıdır.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 3,
    "start": 61,
    "end": 64
  },
  {
    "id": 25,
    "week": "2–3",
    "title": "Etiket basmak: sabit ücret, parça başı iş",
    "question": "Yazıcıyı hazırlamak 3 iş; her parçanın etiketini basmak 2 iş birimi.",
    "a": [
      "4 parça",
      "3 hazırlık + 2×4 baskı = 11 iş."
    ],
    "b": [
      "8 parça",
      "3 hazırlık + 2×8 baskı = 19 iş."
    ],
    "lesson": "Girdi iki kat olunca toplam tam iki kat olmak zorunda değil. Sabit hazırlığın etkisi büyük partide küçülür. T(n)=2n+3, Θ(n).",
    "check": "10 ve 100 parça için hesaplayın. O(n), “en fazla tam n iş” olsaydı bu örnek neden uyuşmazdı?",
    "answer": "23 ve 203 iş. O(n), n’nin sabit bir katıyla üst sınır demektir; doğrudan n işlem demek değildir.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 3,
    "start": 64,
    "end": 67
  },
  {
    "week": "2",
    "title": "O, Ω, Θ: aynı iş için üç cümle",
    "question": "Gerçek işimiz T(n)=2n+3 kontrol olsun. Örneğin n=4 için 11, n=8 için 19.",
    "a": [
      "O(n): üstten bir sınır",
      "n≥1 iken 2n+3 ≤ 5n.\nİş, n’nin sabit bir katını aşmıyor."
    ],
    "b": [
      "Ω(n) ve Θ(n)",
      "2n+3 ≥ 2n: alttan da sınırlı → Ω(n).\n2n ≤ T(n) ≤ 5n: ikisi birlikte → Θ(n)."
    ],
    "lesson": "Θ(n): iş, doğrusal büyüme ailesinde. “Tam n işlem” demek değil. O yalnızca üst sınır söyler; Θ iki yönü de söyler. Sabit çarpanlar n ile büyüyemez.",
    "check": "2n+3 için O(n²) de doğru mu?",
    "answer": "Evet, n≥1 için 2n+3 ≤ 5n². Ama daha gevşek bir bilgi. Θ(n) büyüme biçimini daha net söyler.",
    "ref": "../../w2/#notes",
    "extra": "O, “en kötü durum” simgesi değildir; Ω da “en iyi durum” simgesi değildir. Önce hangi maliyeti incelediğimizi seçeriz (örneğin en kötü arama sayısı), sonra o fonksiyonun büyümesini sınırlarız. Sınırın bütün yeterince büyük n değerlerinde geçerli olması gerekir.",
    "widget": "",
    "id": 5,
    "block": "İşi say · nesnelerle ve küçük tablolarla",
    "minutes": 3,
    "start": 67,
    "end": 70
  },
  {
    "id": 40,
    "week": "1–4",
    "title": "10 dakika ara",
    "question": "Ekrandan uzaklaşın. Sonraki bölümde nesnelerle ve çizerek devam edeceğiz.",
    "a": [
      "Kısa mola",
      "Ayağa kalkın; dinlenin."
    ],
    "b": [
      "Dönüşte hazır olsun",
      "Bir kâğıt, kalem ve birkaç küçük kart."
    ],
    "lesson": "Bu süre 180 dakikalık ders planına dahildir.",
    "check": "Dönüşte devam etmek için Sonraki düğmesini kullanın.",
    "answer": "Mola sırasında tamamlanması gereken soru yok.",
    "extra": "Süreler öğretmen rehberidir; otomatik ilerleme veya süre baskısı yoktur.",
    "ref": "../",
    "widget": "",
    "block": "Ara",
    "minutes": 10,
    "start": 70,
    "end": 80
  },
  {
    "week": "3",
    "title": "Aynı sayılar; sıralama işi aynı mı?",
    "question": "4 ölçümü küçükten büyüğe düzenleyelim.",
    "a": [
      "Zaten sıralı: 1, 2, 3, 4",
      "Insertion: 3 anahtar karşılaştırması, 0 kaydırma.\nSelection: 3+2+1=6 karşılaştırma."
    ],
    "b": [
      "Ters sıralı: 4, 3, 2, 1",
      "Insertion: 1+2+3=6 karşılaştırma, 6 kaydırma.\nSelection: yine 3+2+1=6 karşılaştırma."
    ],
    "lesson": "Insertion, kartı elindeki sıralı yere sokmak gibidir; veri zaten sıralıysa kolaydır. Selection, kalanların tamamından her seferinde en küçüğü seçer.",
    "check": "Insertion’da bir tur bitince hangi cümle doğru kalır?",
    "answer": "İşlenen sol bölüm sıralıdır ve başta o bölümde bulunan aynı elemanları içerir. Başlangıçta bir eleman sıralıdır; yeni elemanı doğru yere sokmak bunu korur.",
    "ref": "../../w3/",
    "extra": "Standart, erken durabilen insertion sayıyoruz; döngü sınırı kontrollerini değil, anahtar karşılaştırmalarını sayıyoruz. Selection için daha güçlü cümle: sol bölüm sıralıdır VE içindeki her değer sağdaki her değerden büyük değildir. Yalnız “sol sıralı” demek en küçüklerin orada olduğunu garanti etmez.",
    "widget": "",
    "id": 10,
    "block": "Sırala ve gerekçelendir · ikili çalışma",
    "minutes": 5,
    "start": 80,
    "end": 85
  },
  {
    "id": 27,
    "week": "3",
    "title": "Kartları gerçekten yerleştir",
    "question": "Dört kâğıda 3, 1, 4, 2 yazın. Soldan sağa sıralı bir el oluşturun.",
    "a": [
      "Insertion: sıradaki kartı yerleştir",
      "[3] → [1,3] → [1,3,4]\nSonra 2’yi 1 ile 3 arasına koy."
    ],
    "b": [
      "Selection: kalanın en küçüğünü seç",
      "Önce 1, sonra 2, sonra 3.\nHer turda kalanların tamamına bak."
    ],
    "lesson": "Biriniz kartları taşısın; diğeriniz yalnız sayı karşılaştırmalarını saysın. Yer değiştirmeyi ayrı sütunda tutun.",
    "check": "3,1,4,2 için iki yöntemin karşılaştırmalarını sayın. Sonra 1,2,3,4 ile deneyin.",
    "answer": "Bu insertion uygulaması ilk dizide 5 anahtar karşılaştırması, 3 kaydırma yapar. Selection 6 karşılaştırma yapar. Sıralı girdide insertion 3, selection yine 6 karşılaştırma.",
    "ref": "../",
    "extra": "Insertion’da mevcut anahtar, soldaki büyük değerleri sağa kaydırır; küçük veya eşit değer görünce durur. Saydığımız karşılaştırmalar anahtar değerleri arasındadır; indis sınırı kontrolleri dahil değildir.",
    "widget": "insertion",
    "block": "Sırala ve gerekçelendir · ikili çalışma",
    "minutes": 5,
    "start": 85,
    "end": 90
  },
  {
    "id": 29,
    "week": "3",
    "title": "En büyüğü bul: neyi hatırlamalıyım?",
    "question": "Ölçümler 7, 2, 9, 4. Tek bir “şimdiye kadarki en büyük” kartı kullan.",
    "a": [
      "Her adımda doğru kayıt",
      "Başla: 7\n2’yi gör: 7 kalır\n9’u gör: 9 olur\n4’ü gör: 9 kalır"
    ],
    "b": [
      "Yanlış kayıt: son gördüğüm",
      "7 → 2 → 9 → 4\nSonuç 4 olur; en büyük değil."
    ],
    "lesson": "Değişmez: kayıt, şimdiye kadar gördüğüm bölümün en büyüğüdür. Her adımda bu cümleyi korumak sonucu açıklar.",
    "check": "−5, −2, −8 ile deneyin. Kaydı 0’dan başlatmak doğru mu?",
    "answer": "Sonuç −2 olmalı. 0’dan başlatmak yanlış: 0 girdide yok ve bütün değerlerden büyük. Boş olmayan listede ilk değerden başlatın.",
    "ref": "../",
    "extra": "Başlangıç: ilk eleman, tek elemanlı bölümün en büyüğü. Koruma: yeni değer büyükse kaydı değiştir, değilse bırak. Bitiş: bütün liste görüldü. Boş liste için ayrı sözleşme gerekir.",
    "widget": "",
    "block": "Sırala ve gerekçelendir · ikili çalışma",
    "minutes": 5,
    "start": 90,
    "end": 95
  },
  {
    "week": "2–3",
    "title": "Küçük işte hızlı olan, büyüyünce?",
    "question": "İki yöntemin iş modeli: A=10n, B=n². Her işin maliyetini aynı kabul ediyoruz.",
    "a": [
      "n=4",
      "A: 40 iş\nB: 16 iş\nB daha az iş yapıyor."
    ],
    "b": [
      "n=100",
      "A: 1.000 iş\nB: 10.000 iş\nA daha az iş yapıyor."
    ],
    "lesson": "Θ(n) her küçük girdide daha hızlı demek değildir. Büyüme, girdi arttığında ne olacağını anlatır. Burada eşitlik n=10’da.",
    "check": "n iki katına çıkınca n, n² ve n³ modelleri nasıl değişir?",
    "answer": "Sırasıyla 2, 4 ve 8 kat. log₂n yalnız 1 artar. Bunlar saniye değil, seçtiğimiz iş modelidir.",
    "ref": "../../w2/#lesson",
    "extra": "Büyüme sırası (yeterince büyük n): 1, log n, n, n log n, n², n³, 2ⁿ, n!. Üstel 2ⁿ için n’ye bir eklemek işi ikiye katlar. n log n, her biri yaklaşık n iş yapan yaklaşık log n seviye olarak düşünülebilir; bu haftalarda ayrıntılı sıralama algoritmasını ezberlemek gerekmiyor.",
    "widget": "",
    "id": 11,
    "block": "Sırala ve gerekçelendir · ikili çalışma",
    "minutes": 5,
    "start": 95,
    "end": 100
  },
  {
    "id": 28,
    "week": "2–3",
    "title": "Üç farklı çift: aynı iş sınıfı",
    "question": "8 ölçümün hepsini raporlamak istiyoruz.",
    "a": [
      "Birbirinden farklı gerçek sayılar",
      "Yöntem A: 8 okuma.\nYöntem B: 16 okuma.\nYöntem C: 8 okuma + 100 hazırlık."
    ],
    "b": [
      "Büyüyen girdi",
      "n okuma → Θ(n).\n2n okuma → Θ(n).\nn+100 iş → Θ(n)."
    ],
    "lesson": "Aynı büyüme sınıfı, aynı süre veya aynı iş sayısı değildir.",
    "check": "n=4 ve n=400 için C’yi hesaplayın. İki noktada gözlem yapmak bir Θ ispatı mı?",
    "answer": "104 ve 500. Hayır; bütün yeterince büyük n için gerekçe gerekir. Örneğin n≥100 iken n ≤ n+100 ≤ 2n.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Sırala ve gerekçelendir · ikili çalışma",
    "minutes": 5,
    "start": 100,
    "end": 105
  },
  {
    "week": "4",
    "title": "Numaralı dolap mı, adres zinciri mi?",
    "question": "8 parçayı sakla. Şimdi 6. parçayı getir veya başa yeni parça ekle.",
    "a": [
      "Dizi: yan yana numaralı gözler",
      "6. parçanın yeri doğrudan hesaplanır.\nBaşa eklerken 8 parçayı kaydır."
    ],
    "b": [
      "Bağlı liste: her kartta sonraki adres",
      "6. karta ulaşmak için bağlantıları izle.\nBaşa eklerken birkaç bağlantıyı değiştir."
    ],
    "lesson": "Bir yapı her işte en iyi değildir. Dizi numarayla erişimde iyi; bağlı liste bilinen konuma bağlantı değiştirerek eklemede iyi.",
    "check": "Bağlı listede “30 değerini sil” her zaman sabit iş mi?",
    "answer": "Hayır. Önce 30’u ve tek bağlı listede önceki düğümü bulman gerekebilir. Arama en kötü Θ(n); gerekli düğümler zaten biliniyorsa bağlantı güncelleme O(1).",
    "ref": "../#topic-2-2",
    "extra": "Dizi gözünün boyutunu sabit kabul ediyoruz. Tek bağlı düğüm “sonraki”yi; çift bağlı düğüm hem “önceki”ni hem “sonraki”ni tutar. Çift bağlantı daha çok bellek ister. Gözcü (sentinel), gerçek veri olmayan yardımcı düğümdür; ilk/son düğüm özel durumlarını azaltır. Yeni düğümün ayrıldığını ve gerekli adreslerin bilindiğini varsayıyoruz. Düğüm ayırma maliyeti bu bağlantı sayımının dışında.",
    "widget": "",
    "id": 12,
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 105,
    "end": 109
  },
  {
    "id": 30,
    "week": "4",
    "title": "Kargo rafı: yerini bilmek başka, aramak başka",
    "question": "8 numaralı raftaki paketi getir; sonra müşteri adı “Deniz” olan paketi bul.",
    "a": [
      "Raf numarası verildi",
      "Sabit boyutlu dizi gözünün adresi hesaplanır.\nTek erişim."
    ],
    "b": [
      "Yalnız müşteri adı verildi",
      "Ek bir arama yapısı yoksa etiketleri tara.\nEn kötü bütün paketlere bak."
    ],
    "lesson": "“Diziye erişim sabit” demek, dizinin içindeki herhangi bir değeri bulmak da sabit demek değildir.",
    "check": "6 paketi kâğıda yazın. Eşin önce bir konum, sonra bir isim söylesin. İki işin farkını anlatın.",
    "answer": "Konumla erişim Θ(1); ek indeks olmadan değere göre arama en kötü Θ(n). Sıralı ve hızlı konum erişimli veride ikili arama ayrı bir seçenektir.",
    "ref": "../",
    "extra": "Bu bir RAM modeli benzetmesi: Θ(1), gerçek depoda yürüme süresi değil, sabit boyutlu bir dizi gözünün adresini hesaplayıp erişme işidir. Etiket karşılaştırmasını da sabit maliyetli kabul ediyoruz.",
    "widget": "",
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 109,
    "end": 113
  },
  {
    "week": "4",
    "title": "Bulmak mı, eklemek mi daha sık?",
    "question": "Parça kodlarını tutan bir sözlük düşün: koda göre bul, ekle, sil.",
    "a": [
      "Sırasız dizi",
      "Kod ara: tek tek bak, en kötü n.\nSonda boş yer varsa ekle: sabit iş."
    ],
    "b": [
      "Sıralı dizi",
      "Kod ara: ikili arama, logaritmik iş.\nSırayı koruyarak ekle: en kötü n kaydırma."
    ],
    "lesson": "Çok arama, az güncelleme varsa sıralı dizi mantıklı olabilir. Yapıyı seçmeden önce sık yaptığın işlemi söyle.",
    "check": "Sırasız diziden bir elemanı silerken sırayı korumak gerekmiyorsa?",
    "answer": "Yeri biliniyorsa son elemanı o boşluğa taşıyıp boyutu azaltabiliriz: sabit iş. Ama silinecek elemanı aramak ayrıca n’ye kadar iş ister.",
    "ref": "../#topic-1-4",
    "extra": "“Ekleme O(1)” derken boş kapasiteyi ve eklenecek yeri bilme koşulunu söyleyin. Sıralı dizide minimum ilk, maksimum son gözdedir; sırasız dizide minimumu bulmak bütün elemanlara bakmayı gerektirir.",
    "widget": "",
    "id": 13,
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 113,
    "end": 117
  },
  {
    "week": "4",
    "title": "Raf dolunca bir göz mü, iki katı mı?",
    "question": "Boş, kapasitesi 1 olan dizinin SONUNA 8 ölçüm ekliyoruz. Dolunca daha büyük yere taşınıyor.",
    "a": [
      "Her seferinde +1 kapasite",
      "Taşınan eski ölçümler:\n1+2+3+4+5+6+7=28\nYeni ölçümleri yazma: 8. Toplam: 36."
    ],
    "b": [
      "Her seferinde iki kat kapasite",
      "Taşınan eski ölçümler:\n1+2+4=7\nYeni ölçümleri yazma: 8. Toplam: 15."
    ],
    "lesson": "Bazen tek sona ekleme pahalıdır. İkiye katlamada n kez sona eklemenin toplam işi Θ(n): sona ekleme başına amortize O(1). Araya eklemenin kaydırma maliyeti ayrıdır.",
    "check": "Bu, her eklemenin aynı kısa sürede biteceği anlamına mı gelir?",
    "answer": "Hayır. Taşıma yapan tek ekleme Θ(n) olabilir. Amortize, bütün işlem dizisinin toplam maliyetini işlemlere paylaştırır; rastgelelik veya olasılık gerektirmez.",
    "ref": "../#topic-3-1",
    "extra": "+10 gibi sabit artış da büyük n’de toplam Θ(n²) kopyalamaya yol açar. İkiye katlama toplam Θ(n) iş sağlar ama boş kapasite bırakır. Muhasebe benzetmesi: ucuz eklemelerde bir miktar iş kredisi ayır, sonraki taşımayı onunla öde. 15 ve 36 sayıları yalnız eski öğe kopyaları ile yeni öğe yazmalarını sayar; bellek ayırma, sayaç ve kontrol işlemleri dahil değildir.",
    "widget": "resize",
    "id": 14,
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 117,
    "end": 121
  },
  {
    "week": "4",
    "title": "Son gelen mi, ilk gelen mi?",
    "question": "A, sonra B, sonra C geldi. Şimdi birini çıkar.",
    "a": [
      "Yığın / stack: üst üste tabak",
      "A → B → C\nÖnce C çıkar (LIFO).\nGeri al: son hareketi önce geri al."
    ],
    "b": [
      "Kuyruk / queue: test tezgâhı sırası",
      "A → B → C\nÖnce A çıkar (FIFO).\nGelen ilk parçayı önce işle."
    ],
    "lesson": "Yığın ve kuyruk, işlem sırasını belirler. Altta dizi veya bağlı liste kullanılması ayrı bir tasarım seçimidir.",
    "check": "Kuyruğu iki yığınla kurarsak A, B, C nasıl A’dan çıkar?",
    "answer": "Giriş yığınına A,B,C gelir. Çıkış boşsa hepsini aktar: C,B,A. Artık çıkışın tepesinde A var. Her öğe bir kez aktarılır; işlem başına amortize O(1).",
    "ref": "../#topic-5-3",
    "extra": "Tek çıkarma, bütün öğeleri aktarıyorsa Θ(n) olabilir. Yığınla DFS bir dalın derinine gider; kuyrukla BFS komşuları katman katman işler. Henüz grafik algoritmalarını ezberlemeyin: farkı işlem sırası yaratıyor.",
    "widget": "order",
    "id": 15,
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 121,
    "end": 125
  },
  {
    "id": 31,
    "week": "4",
    "title": "Oyun hamleleri ve yazıcı işleri",
    "question": "A, B, C sırayla geldi. Şimdi iki iş çıkaracağız.",
    "a": [
      "Robot hareketini geri al",
      "Son iki hareket: önce C, sonra B.\nGeri alma yığını."
    ],
    "b": [
      "Yazıcı sırasını işlet",
      "İlk iki dosya: önce A, sonra B.\nYazdırma kuyruğu."
    ],
    "lesson": "Veri aynı olsa da doğru çıkarma sırası uygulamanın amacından gelir.",
    "check": "A,B ekle; birini çıkar; C ekle; hepsini çıkar. Yığın ve kuyruk sonuçlarını ayrı yazın.",
    "answer": "Yığın çıkarma sırası: B,C,A. Kuyruk çıkarma sırası: A,B,C. Aynı gelişler, farklı kurallar.",
    "ref": "../",
    "extra": "Geri alma için ters işlemin uygulanabilir olduğunu ve gerekli geçmiş bilginin saklandığını varsayıyoruz. Yığın doğru sırayı tutar; gerçek bir robot hareketinin güvenle tersine çevrilebileceğini garanti etmez.",
    "widget": "",
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 125,
    "end": 129
  },
  {
    "week": "4",
    "title": "Yığınla üç küçük iş",
    "question": "Üç araçta da en son yarım kalan işe dönüyoruz.",
    "a": [
      "Parantez: ([ ]) ve ([ )]",
      "([ ]) → açılanları yığına koy; ] için [, ) için ( çıkar → geçerli.\n([ )] → ) geldiğinde üstte [ var → yanlış."
    ],
    "b": [
      "Postfix: 3 4 + 2 ×",
      "3 ve 4’ü koy → + ile 7 üret.\n2’yi koy → × ile 14 üret.\nSonuç: 14."
    ],
    "lesson": "Minimumu da hızlı bilmek için her yığın kaydının yanında “buraya kadarki minimum”u sakla. 5,3,7 için minimumlar 5,3,3; 7 çıkınca minimum hâlâ 3.",
    "check": "100 kez push, sonra hepsini tek multi-pop ile çıkar: kaç öğe çıkarıldı?",
    "answer": "100. Son işlem tek başına pahalı; bütün dizi boyunca her öğe en çok bir kez kondu ve bir kez çıkarıldı. Toplam öğe işi 200.",
    "ref": "../#topic-4-1",
    "extra": "Postfix’te önce çıkan sağ, sonra çıkan sol işlenendir: “8 2 −” için 8−2=6. Parantez kontrolünde sonunda yığın boş olmalı. Multi-pop için çağrı başına sabit ek maliyet de vardır; m çağrının toplamı O(m) olur. Bu toplam sınır, başlangıçta boş yığın ve sabit maliyetli temel push/pop modeli içindir. Başlangıçta N öğe varsa onların çıkarılma maliyeti de eklenir: O(m+N).",
    "widget": "",
    "id": 16,
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 129,
    "end": 133
  },
  {
    "week": "4",
    "title": "Son üç ölçümü tut",
    "question": "Sensör: 10, 20, 30, sonra 40. Yalnız son üç ölçüme ihtiyacımız var.",
    "a": [
      "Her defasında kaydır ve yeniden topla",
      "10,20,30 → 20,30,40\nBüyük bir pencerede birçok öğeyi taşı ve yeniden oku."
    ],
    "b": [
      "Halka tampon + eldeki toplam",
      "Eski 10’un gözüne 40 yaz; başlangıcı ilerlet.\nToplam: 60−10+40=90. Ortalama: 90/3=30."
    ],
    "lesson": "Fiziksel gözler 40,20,30 olabilir; mantıksal sıra 20,30,40. Halka tamponda sırayı başlangıç konumu belirler.",
    "check": "İlk iki ölçüm 10 ve 20 iken ortalama 30/3 mü?",
    "answer": "Hayır. Yalnız iki geçerli ölçüm var: (10+20)/2=15. Pencere dolana kadar geçerli öğe sayısına böl.",
    "ref": "../#topic-6-3",
    "extra": "Kapasite 3 ise sonraki göz (i+1) % 3: 0→1→2→0. Okuma/yazma konumları aynı olduğunda boş ve doluyu ayırmak için sayaç, bayrak veya ayrılmış bir göz gerekir. Tampon dolunca eskiyi silmek burada bilinçli politika; her sistemde uygun değil. Kesme üreten sensör ile tüketici farklı hızlarda çalışırsa taşma politikasını belirtin.",
    "widget": "sensor",
    "id": 17,
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 4,
    "start": 133,
    "end": 137
  },
  {
    "id": 32,
    "week": "4",
    "title": "Acil durdurma için amortize yeterli mi?",
    "question": "Bir sensör kaydı eklemek çoğu zaman ucuz; bazen bütün dizi taşınıyor.",
    "a": [
      "Uzun rapor hazırlama",
      "Toplam iş önemli.\nİkiye katlanan dizi uygun olabilir."
    ],
    "b": [
      "Kesmede dar zaman bütçesi",
      "Tek bir pahalı ekleme bile süreyi aşabilir.\nÖnceden ayrılmış tampon düşünülebilir."
    ],
    "lesson": "Amortize O(1), her çağrının en kötü süresinin sabit olduğunu söylemez. Mühendislikte hangi gecikmenin önemli olduğunu belirtin.",
    "check": "Önceden ayrılan tampon dolarsa ne yapacaksınız? İki farklı uygulama için karar verin.",
    "answer": "Canlı gösterge: en eskiyi atıp güncel veriyi tutabilir. Kayıpsız kayıt: taşmayı bildirip üretim/tüketim hızını veya kapasiteyi düzenlemeli. Sessiz veri kaybı uygun olmayabilir.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Veriyi düzenle · çizerek çalış",
    "minutes": 3,
    "start": 137,
    "end": 140
  },
  {
    "id": 43,
    "week": "1–4",
    "title": "10 dakika ara",
    "question": "Ekrandan uzaklaşın. Sonraki bölümde nesnelerle ve çizerek devam edeceğiz.",
    "a": [
      "Kısa mola",
      "Ayağa kalkın; dinlenin."
    ],
    "b": [
      "Dönüşte hazır olsun",
      "Bir kâğıt, kalem ve birkaç küçük kart."
    ],
    "lesson": "Bu süre 180 dakikalık ders planına dahildir.",
    "check": "Dönüşte devam etmek için Sonraki düğmesini kullanın.",
    "answer": "Mola sırasında tamamlanması gereken soru yok.",
    "extra": "Süreler öğretmen rehberidir; otomatik ilerleme veya süre baskısı yoktur.",
    "ref": "../",
    "widget": "",
    "block": "Ara",
    "minutes": 10,
    "start": 140,
    "end": 150
  },
  {
    "id": 33,
    "week": "4",
    "title": "Sensör atölyesi: iki pencereyi elle yürüt",
    "question": "Ölçümler: 4, 8, 12, 16. Üç göz çizin; her yeni ölçümde toplamı ve ortalamayı yazın.",
    "a": [
      "Yeniden topla",
      "4 → ortalama 4\n4,8 → 6\n4,8,12 → 8\n8,12,16 → 12"
    ],
    "b": [
      "Eski toplamı kullan",
      "4\n4+8=12\n12+12=24\n24−4+16=36 → 36/3=12"
    ],
    "lesson": "Aynı cevap, farklı yapılan iş. Büyük pencerede eldeki toplamı güncellemek her örnekte bütün pencereyi taramayı önler.",
    "check": "İkinci turda pencereyi 2 yapın. Sonra 4,4,4,20 girdisini 3 gözle deneyin.",
    "answer": "Pencere 2: ortalamalar 4,6,10,14. Diğer girdide pencere 3: 4,4,4,28/3≈9,33. Büyük son ölçüm ortalamayı yükseltir ama 20’ye eşitlemez.",
    "ref": "../",
    "extra": "Çift çalışması: biri sensör, diğeri tampon yöneticisi olsun. Her ölçümde fiziksel gözleri ve eskiden yeniye mantıksal sırayı ayrı yazın. Sonra rolleri değiştirin. Gerçek kayan noktalı toplamlarda yuvarlama birikimi olabilir; bu etkinlikte küçük sayıları tam sayıyoruz.",
    "widget": "",
    "block": "Atölye · öğrenci çözer ve savunur",
    "minutes": 7,
    "start": 150,
    "end": 157
  },
  {
    "id": 34,
    "week": "4",
    "title": "Tasarım masası: üç iş, tek doğru yapı yok",
    "question": "Bir fabrika uygulamasındaki üç göreve ayrı yapı seçin.",
    "a": [
      "Görevler",
      "1. Son hareketi geri al.\n2. Gelen parçayı sırayla test et.\n3. Son 100 sıcaklığı göster."
    ],
    "b": [
      "Gerekçeli başlangıç seçimleri",
      "1. Yığın: son gelen önce.\n2. Kuyruk: ilk gelen önce.\n3. Halka tampon: sabit pencere."
    ],
    "lesson": "Bir yapı adı yazmak yetmez. Sık yapılan işlemi, çıkarma sırasını ve dolunca ne olacağını söyleyin.",
    "check": "Eşiniz “hepsinde dizi kullanalım” derse yanlış mı? İki düzey arasındaki farkı açıklayın.",
    "answer": "Mutlaka yanlış değil. Yığın/kuyruk işlem kurallarıdır; dizi bunları gerçekleştirmek için kullanılabilir. Verimli indeks yönetimi ve kapasite politikası ayrıca tasarlanır.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Atölye · öğrenci çözer ve savunur",
    "minutes": 7,
    "start": 157,
    "end": 164
  },
  {
    "id": 35,
    "week": "1–4",
    "title": "Yeni durum: takım kodu arşivi",
    "question": "10.000 kodu bir kez yükleyeceğiz; sonra çok arayacağız. Güncelleme çok seyrek.",
    "a": [
      "Öneri A: sırasız tut",
      "Kurması kolay.\nHer aramada tek tek kontrol gerekebilir."
    ],
    "b": [
      "Öneri B: bir kez sırala",
      "Başlangıçta sıralama işi var.\nSonraki aramalarda ikili arama kullan."
    ],
    "lesson": "Hazırlık maliyeti ile tekrar eden işi birlikte düşünün. Sayısal karşılaştırma için kaç arama yapılacağını da bilmek gerekir.",
    "check": "Koşulu değiştirin: sürekli ortalara ekleme var, arama çok az. İlk kararınız hâlâ güçlü mü?",
    "answer": "Sıralı diziyi korumak kaydırma maliyeti doğurur. İlk senaryodaki avantaj otomatik olarak taşınmaz. Baskın işlemi yeniden değerlendirin.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Atölye · öğrenci çözer ve savunur",
    "minutes": 6,
    "start": 164,
    "end": 170
  },
  {
    "week": "1–4",
    "title": "Çıkış bileti: artık simgeden önce işi söyle",
    "question": "Her soruyu önce günlük dilde, sonra istersen simgeyle cevapla.",
    "a": [
      "Dört hızlı karar",
      "1. 20’den 40 sensöre tam tarama?\n2. Sıralı dizide boyut iki kat; her adım yarıyı ele?\n3. İlk gelen parçayı önce işle?\n4. 17 parça, kutu başına 5?"
    ],
    "b": [
      "Cevap ve neden",
      "1. Kontrol sayısı iki kat → Θ(n).\n2. Yalnız yaklaşık bir adım daha → Θ(log n).\n3. Kuyruk: FIFO.\n4. ⌈17/5⌉=4 kutu; üçü yetmez."
    ],
    "lesson": "Her örnekte üç soru: Doğru sonucu üretiyor mu? Hangi işi sayıyorum? Girdi büyüyünce bu iş nasıl değişiyor?",
    "check": "Bir öğrenci bunları anlatamıyorsa neyi tekrar edelim?",
    "answer": "Sembolleri yeniden ezberletmeyin. 4 nesneyi masaya koyun; işi birlikte sayın. Sonra 8 nesneyle aynı işi tekrarlayın.",
    "ref": "../",
    "extra": "Bireysel cevapları toplayın. Yanlışın kaynağını ayırın: soru anlaşılmadı mı, iş yanlış mı sayıldı, yoksa yalnız simge mi karıştı? Sonraki kart aynı kavramları yeni sayılarla yoklar.",
    "widget": "",
    "id": 18,
    "block": "Bireysel çıkış kontrolü",
    "minutes": 5,
    "start": 170,
    "end": 175
  },
  {
    "id": 36,
    "week": "1–4",
    "title": "Çıkış bileti B: aynı fikir, yeni sayılar",
    "question": "Bireysel çözün; sonra bir arkadaşınızın gerekçesini denetleyin.",
    "a": [
      "Sorular",
      "1. 9’dan 18 parçaya iki tam tarama?\n2. 22 kişi, 6’lık araç?\n3. Son yapılan ayarı geri al?"
    ],
    "b": [
      "Çözümler",
      "1. 18’den 36 işe: iki kat.\n2. ⌈22/6⌉=4 araç.\n3. Yığın: son işlem önce."
    ],
    "lesson": "Son soru: Θ(n) demek “tam n adım” mı? Cevabınızı 2n+3 örneğiyle savunun.",
    "check": "İlk cevabınızla şimdi yazdığınızı karşılaştırın. Yanlış yaptığınız tek fikri seçip yeni bir örnek üretin.",
    "answer": "Hayır. 2n+3, n≥1 için 2n ile 5n arasındadır; bu yüzden Θ(n). Yeni örneğinizde n’nin ne olduğunu ve sayılan işi mutlaka yazın.",
    "ref": "../",
    "extra": "Önce iki kişi birlikte çözün. Biriniz işlemi yapsın, diğeri her işi çizgiyle saysın. Sonra rolleri değiştirin; farklı bir sayı ile tekrar deneyin.",
    "widget": "",
    "block": "Bireysel çıkış kontrolü",
    "minutes": 5,
    "start": 175,
    "end": 180
  }
];
