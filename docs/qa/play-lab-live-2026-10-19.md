# Play Lab canlı kontrol — 19 Ekim 2026

## Yayın ve hesap

- Canlı site: https://arifsolmaz.github.io/courses/aa/play-lab/
- Test hesabı: test_user; sınıf: AA · Fall 2026.
- Görsel düzeltme: 5488ef7. Takip düzeltmesi: d03737e.
- Ortak tabloda doğrulanan sonuç: Robot 6/6, Commands 6/6, Depot 6/6, Sorting 6/6, Factory 9/9; toplam 330/330.
- Gerçek arayüzden oynandı ve sunucu kayıtları arayüzden okundu. Puan doğrudan veritabanına yazılmadı. Tekrarlarda puan artmadı.

## Oynanan kapsam

- Robot, Commands, Depot: bütün Warm up ve Challenge görevleri. Sandbox: yeni Robot haritası (6,5,8,1), dört hareketli komut programı ve geri alma, 7/14/21 hash silme ve arama; dengeli/zincir ağaçta 70 araması.
- Sorting: Mixed up, Almost sorted, Backwards girdilerinin her biri selection ve insertion ile tamamen sıralandı. Karşılaştırma/yazma sonuçları sırasıyla: 15/6 ve 12/14; 15/2 ve 6/6; 15/6 ve 15/20.
- Factory: First shift 6/6, en uzun bekleme 1; The rush 5/6, en uzun bekleme 4. İki sonuç sunucuya yeniden gönderildi; mevcut iyi sonuç korundu. Repair shop tamamlandı; yanlış eski işlem seçimi reddedildi.
- Üç sürpriz Factory görevi de tamamlandı: Happy customers, Save five!, Nobody left behind.
- 22 Adventure bölümü: Robot 4, Commands 4, Depot 4, Sorting 4, Factory 6. Tümünde hedef karşılandı.
- Challenge defteri: 15 otomatik sonuç kontrolü ve 1 öz değerlendirme kaydı tamamlandı. Bunlar ek ortak puan vermez; kişisel çalışma notlarıdır.

## Görsel / etkileşim kontrolü

- Canlı tarayıcıda normal pencere, 390×844 mobil görünüm ve 1366×768 laptop görünümü kullanıldı. Gerçek telefon donanımı testi yapılmadı.
- Sorting kutularında 1 ve tekrarlı küçük değerler, yeni Case 2; yüzlerin kutu sınırları içinde olduğu ölçüldü.
- Commands 25 hücresinin yüksekliği eşit; boş satır, simgeli satır ve yürütme izi kontrol edildi.
- Robot hatalı rota, Commands duvara çarpma, Depot boş silme ve uzun zincir, Sorting maliyet hedefini aşma, Factory geç kalan iş / yanlış undo geri bildirimleri gözlendi.
- Mobilde sekiz parçalı özel Sorting dizisi, üç temel Challenge ekranı, dört Adventure dünyası ve Factory değerli yük animasyonu incelendi.
- Başarı ve hata ekranlarında metin ve düğmeler incelendi; uzun ekranlar normal dikey kaydırma gerektirir.

## Bulunan ve düzeltilenler

1. Commands boş ızgara satırı küçülüyordu: beş eşit satır tanımlandı.
2. Küçük Sorting kutusunda yüz kesiliyordu: sayı/yüz alanları ve taban yüksekliği düzeltildi; değer farkları korunuyor.
3. Ana sayfada hiçbir şey yüklenmediği yazıyordu; sınıf kayıtlarıyla uyumlu açıklama eklendi.
4. Sorting ve Repair metinleri ortak sınıf puanını açıklamıyordu; güncellendi.
5. Workshop görevleri eski menü adlarını kullanıyordu; Challenge, Sandbox, Classic, First shift, The rush, Repair shop adlarına bağlandı.
6. Factory yükleme animasyonunda kutular etkin görünmesine rağmen tıklama yok sayılıyordu; animasyon boyunca kutular pasif, bitince tekrar etkin. Yerelde ve canlıda animasyon sırasında disabled=true, tamamlandığında disabled=false olduğu ölçüldü; yeniden başlatma da çalıştı.

## Sınırlar

Bu kontrol sabit bölümleri ve belirtilen ek durumları kapsar. Sınırsız rastgele haritaların / özel girdilerin bütün kombinasyonlarının veya bütün tarayıcıların hatasız olduğu iddiası değildir. Oyunun kurallarını önceden bilen bir test kullanıcısının 330 puanı, yeni başlayan öğrencinin kavramları öğrendiğinin kanıtı değildir. Öğretmen notlarındaki karşılaştırma ve açıklama görevleri bunun için gereklidir.

## Son yayın doğrulaması

İki yayın da başarıyla tamamlandı. Canlı Adventure CSS sürümü `20261019layout2`; canlı Factory yeni kutu kilidi ve ortak puan açıklaması doğrulandı. Workshop yeni yönergesi önbellekten bağımsız URL ile doğrulandı. Daha önce açık kalan sekmeler eski HTML gösterebildiğinden yenileme gerekebilir. Son canlı tablo yeniden yüklenince test_user hâlâ 330/330 gösterdi.
