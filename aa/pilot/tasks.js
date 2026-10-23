/* Bilingual pilot tasks. Content scores are human judgments; no numeric answer is automatically graded. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AAWeeksPilotTasks = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze); Object.freeze(value);
    }
    return value;
  }
  return freeze({
  "protocol": "aa-weeks1-3-v1",
  "title": {
    "en": "Weeks 1–3 · Small-group pilot",
    "tr": "Hafta 1–3 · Küçük grup pilotu"
  },
  "dimensions": [
    {
      "id": "code",
      "title": {
        "en": "Following code and loops",
        "tr": "Kodları ve döngüleri takip etmek"
      }
    },
    {
      "id": "math",
      "title": {
        "en": "Understanding mathematical expressions",
        "tr": "Matematiksel ifadeleri anlamak"
      }
    },
    {
      "id": "purpose",
      "title": {
        "en": "Seeing what the topics are for",
        "tr": "Konuların ne işe yaradığını görmek"
      }
    },
    {
      "id": "links",
      "title": {
        "en": "Connecting topics",
        "tr": "Konular arasındaki bağlantıları kurmak"
      }
    }
  ],
  "schedule": [
    {
      "id": "pre",
      "minutes": 5,
      "label": {
        "en": "First attempt",
        "tr": "İlk deneme"
      }
    },
    {
      "id": "practice",
      "minutes": 10,
      "label": {
        "en": "Guided work",
        "tr": "Rehberli çalışma"
      }
    },
    {
      "id": "post",
      "minutes": 7,
      "label": {
        "en": "Transfer attempt",
        "tr": "Aktarım denemesi"
      }
    },
    {
      "id": "reflection",
      "minutes": 3,
      "label": {
        "en": "Save and reflect",
        "tr": "Sakla ve düşün"
      }
    }
  ],
  "phases": {
    "pre": {
      "title": {
        "en": "First attempt",
        "tr": "İlk deneme"
      },
      "records": [
        18,
        24,
        7,
        11,
        7,
        31
      ],
      "target": 7,
      "context": {
        "en": "A maintenance team keeps incoming message IDs in arrival order: [18, 24, 7, 11, 7, 31]. Positions start at 1. The target device ID is 7.",
        "tr": "Bakım ekibi gelen mesajların kimliklerini geliş sırasıyla tutuyor: [18, 24, 7, 11, 7, 31]. Konumlar 1’den başlar. Hedef cihaz kimliği 7."
      },
      "instruction": {
        "en": "Write four short responses in your own words. One or two short lines per item are enough; do not fill an entire comparison table. I do not know is a valid response.",
        "tr": "Kendi cümlelerinle dört kısa yanıt yaz. Her madde için bir-iki kısa satır yeter; karşılaştırma tablosunun tamamını doldurma. Bilmiyorum geçerli bir yanıttır."
      },
      "questions": [
        {
          "id": "code",
          "title": {
            "en": "Follow the search",
            "tr": "Aramayı izle"
          },
          "prompt": {
            "en": "First match: show each checked position/value and its = or ≠ decision. Give the returned position and equality-check count. Why stop? A short trace is enough.",
            "tr": "İlk eşleşme: bakılan her konum/değeri ve = veya ≠ kararını göster. Dönen konumu ve eşitlik kontrolü sayısını ver. Neden durulur? Kısa bir iz yeter."
          },
          "answer": {
            "en": "18 ≠ 7, 24 ≠ 7, then 7 = 7: return position 3 after 3 equality checks. Every earlier position was ruled out. The later 7 at position 5 does not change the first-match output.",
            "tr": "18 ≠ 7, 24 ≠ 7, sonra 7 = 7: üç eşitlik kontrolünden sonra konum 3 döner. Önceki bütün konumlar elenmiştir. Konum 5’teki sonraki 7 ilk eşleşme çıktısını değiştirmez."
          },
          "key": {
            "checkedPositions": [
              1,
              2,
              3
            ],
            "checkedValues": [
              18,
              24,
              7
            ],
            "equal": [
              false,
              false,
              true
            ],
            "resultPosition": 3,
            "checks": 3
          }
        },
        {
          "id": "math",
          "title": {
            "en": "Name and count the unit",
            "tr": "Birimi adlandır ve say"
          },
          "prompt": {
            "en": "For these records, A makes two complete scans one after another. B compares all n × n position pairs, including self-comparisons and reversed pairs. Give n, both totals and both C(n) formulas. Name the unit. Do “no” results count? Are these seconds?",
            "tr": "Bu kayıtlarda A art arda iki tam tarama yapıyor. B, kendisiyle ve ters yöndeki çiftler dahil bütün n × n konum çiftlerini karşılaştırıyor. n’yi, iki toplamı ve iki C(n) formülünü ver. Birimi adlandır. “Hayır” sonuçları sayılır mı? Bunlar saniye midir?"
          },
          "answer": {
            "en": "n = 6 records. A does 6 + 6 = 12 checks; B does 6 rows × 6 cells = 36 checks. Both count equality checks, including ‘no’. They produce different reports and cannot be substituted just because one count is smaller. Neither count measures seconds.",
            "tr": "n = 6 kayıttır. A 6 + 6 = 12 kontrol; B 6 satır × 6 hücre = 36 kontrol yapar. İkisi de ‘hayır’ dahil eşitlik kontrolünü sayar. Farklı raporlar üretirler; yalnız sayımı küçük diye biri diğerinin yerine geçmez. İkisi de saniye ölçmez."
          },
          "key": {
            "n": 6,
            "sequential": 12,
            "nested": 36,
            "sequentialFormula": "n+n=2 n",
            "nestedFormula": "n*n=n²",
            "unit": "equality check",
            "countsNo": true,
            "seconds": false
          }
        },
        {
          "id": "purpose",
          "title": {
            "en": "Check the changed request",
            "tr": "Değişen isteği denetle"
          },
          "prompt": {
            "en": "The team now needs the target device’s last message. Give the needed position. Use the first and last positions to explain why the old stopping rule fails. Why return a position rather than the ID? Would sorting preserve arrival positions?",
            "tr": "Ekip artık hedef cihazın son mesajını istiyor. Gereken konumu ver. Eski durma kuralının neden yetmediğini ilk ve son konumla göster. Neden kimliği değil konumu döndürürüz? Sıralamak geliş konumlarını korur mu?"
          },
          "answer": {
            "en": "The last 7 is at position 5. ID 7 tells which device; position 5 tells which message to open. Stopping at position 3 misses position 5. Sorting changes arrival positions, so original positions must be retained separately if sorting is used.",
            "tr": "Son 7 konum 5’tedir. Kimlik 7 hangi cihazı, konum 5 hangi mesajın açılacağını söyler. Konum 3’te durmak konum 5’i kaçırır. Sıralama geliş konumlarını değiştirir; kullanılırsa özgün konum bilgisi ayrıca korunmalıdır."
          },
          "key": {
            "lastPosition": 5,
            "firstPosition": 3,
            "id": 7,
            "returnIdSufficient": false,
            "firstStopSufficient": false,
            "sortPreservesArrival": false
          }
        },
        {
          "id": "links",
          "title": {
            "en": "Test the reason for discarding",
            "tr": "Eleme gerekçesini sına"
          },
          "prompt": {
            "en": "Different directory: [4, 31, 11, 18, 24, 7, 26, 20], target 7. A binary step checks position 4: 18 > 7, so it discards positions 5–8. Show the target’s position to explain why this fails. Contrast left-to-right scanning; state the ordering and access conditions binary search needs.",
            "tr": "Farklı rehber: [4, 31, 11, 18, 24, 7, 26, 20], hedef 7. Bir ikili adım konum 4’e bakıyor: 18 > 7 deyip konum 5–8’i eliyor. Neden başarısız olduğunu hedefin konumuyla göster. Soldan taramayla karşılaştır; ikili aramanın sıralama ve erişim koşullarını belirt."
          },
          "answer": {
            "en": "The target 7 is at position 6, inside the discarded side. Sorted order is what would justify concluding that every value to the right of 18 is larger than 7. The given order does not justify that inference. A left-to-right search reaches position 6 without discarding unchecked positions. Binary search needs sorted order for this inference and direct access for cheap midpoint access; preparation and the required output must also be accounted for.",
            "tr": "Hedef 7, elenen taraftaki konum 6’dadır. 18’in sağındaki bütün değerlerin 7’den büyük olduğunu çıkarabilmek için sıralılık gerekir; verilen sıra bu çıkarımı desteklemez. Soldan arama bakılmamış konumları elemeden konum 6’ya ulaşır. İkili aramada bu çıkarım için sıralılık, ortaya ucuz erişim için doğrudan erişim gerekir; hazırlık ve istenen çıktı da hesaba katılır."
          },
          "key": {
            "midpoint": 4,
            "value": 18,
            "discarded": [
              5,
              8
            ],
            "targetPosition": 6,
            "linearResultPosition": 6,
            "linearProbes": 6,
            "requiresSorted": true,
            "requiresDirectAccess": true
          },
          "directory": [
            4,
            31,
            11,
            18,
            24,
            7,
            26,
            20
          ],
          "target": 7
        }
      ]
    },
    "post": {
      "title": {
        "en": "Transfer attempt",
        "tr": "Aktarım denemesi"
      },
      "records": [
        24,
        7,
        18,
        11,
        31,
        11,
        4,
        26
      ],
      "target": 11,
      "context": {
        "en": "Use new messages in arrival order: [24, 7, 18, 11, 31, 11, 4, 26]. Positions still start at 1. The target device ID is 11. Apply the same reasoning to these records; do not copy your first answer.",
        "tr": "Geliş sırasındaki yeni mesajları kullan: [24, 7, 18, 11, 31, 11, 4, 26]. Konumlar yine 1’den başlar. Hedef cihaz kimliği 11. Aynı düşünme adımlarını bu kayıtlara uygula; ilk yanıtını kopyalama."
      },
      "instruction": {
        "en": "Write four short responses in your own words. One or two short lines per item are enough; do not fill an entire comparison table. I do not know is a valid response.",
        "tr": "Kendi cümlelerinle dört kısa yanıt yaz. Her madde için bir-iki kısa satır yeter; karşılaştırma tablosunun tamamını doldurma. Bilmiyorum geçerli bir yanıttır."
      },
      "questions": [
        {
          "id": "code",
          "title": {
            "en": "Follow the search",
            "tr": "Aramayı izle"
          },
          "prompt": {
            "en": "First match: show each checked position/value and its = or ≠ decision. Give the returned position and equality-check count. Why stop? A short trace is enough.",
            "tr": "İlk eşleşme: bakılan her konum/değeri ve = veya ≠ kararını göster. Dönen konumu ve eşitlik kontrolü sayısını ver. Neden durulur? Kısa bir iz yeter."
          },
          "answer": {
            "en": "24 ≠ 11, 7 ≠ 11, 18 ≠ 11, then 11 = 11: return position 4 after 4 equality checks. All earlier positions were ruled out. The later 11 at position 6 does not change the first-match result.",
            "tr": "24 ≠ 11, 7 ≠ 11, 18 ≠ 11, sonra 11 = 11: dört eşitlik kontrolünden sonra konum 4 döner. Önceki bütün konumlar elenmiştir. Konum 6’daki sonraki 11 ilk eşleşme sonucunu değiştirmez."
          },
          "key": {
            "checkedPositions": [
              1,
              2,
              3,
              4
            ],
            "checkedValues": [
              24,
              7,
              18,
              11
            ],
            "equal": [
              false,
              false,
              false,
              true
            ],
            "resultPosition": 4,
            "checks": 4
          }
        },
        {
          "id": "math",
          "title": {
            "en": "Name and count the unit",
            "tr": "Birimi adlandır ve say"
          },
          "prompt": {
            "en": "For these records, A makes two complete scans one after another. B compares all n × n position pairs, including self-comparisons and reversed pairs. Give n, both totals and both C(n) formulas. Name the unit. Do “no” results count? Are these seconds?",
            "tr": "Bu kayıtlarda A art arda iki tam tarama yapıyor. B, kendisiyle ve ters yöndeki çiftler dahil bütün n × n konum çiftlerini karşılaştırıyor. n’yi, iki toplamı ve iki C(n) formülünü ver. Birimi adlandır. “Hayır” sonuçları sayılır mı? Bunlar saniye midir?"
          },
          "answer": {
            "en": "n = 8 records. A does 8 + 8 = 16 checks; B does 8 rows × 8 cells = 64 checks. ‘No’ results count, and checks are not seconds. The formulas describe different required reports; a smaller count alone does not license substituting one report for the other.",
            "tr": "n = 8 kayıttır. A 8 + 8 = 16 kontrol; B 8 satır × 8 hücre = 64 kontrol yapar. ‘Hayır’ sonuçları da sayılır; kontroller saniye değildir. Formüller farklı istenen raporları anlatır; yalnız sayımın küçük olması bir raporu ötekinin yerine koymayı haklı çıkarmaz."
          },
          "key": {
            "n": 8,
            "sequential": 16,
            "nested": 64,
            "sequentialFormula": "n+n=2 n",
            "nestedFormula": "n*n=n²",
            "unit": "equality check",
            "countsNo": true,
            "seconds": false
          }
        },
        {
          "id": "purpose",
          "title": {
            "en": "Check the changed request",
            "tr": "Değişen isteği denetle"
          },
          "prompt": {
            "en": "The team now needs the target device’s last message. Give the needed position. Use the first and last positions to explain why the old stopping rule fails. Why return a position rather than the ID? Would sorting preserve arrival positions?",
            "tr": "Ekip artık hedef cihazın son mesajını istiyor. Gereken konumu ver. Eski durma kuralının neden yetmediğini ilk ve son konumla göster. Neden kimliği değil konumu döndürürüz? Sıralamak geliş konumlarını korur mu?"
          },
          "answer": {
            "en": "The last 11 is at position 6. ID 11 identifies the device; position 6 locates the message. Stopping at position 4 misses the later message at 6. Sorting changes arrival positions; preserve those original positions separately when needed.",
            "tr": "Son 11 konum 6’dadır. Kimlik 11 cihazı tanımlar; konum 6 mesajın yerini gösterir. Konum 4’te durmak konum 6’daki sonraki mesajı kaçırır. Sıralama geliş konumlarını değiştirir; gereken özgün konumları ayrıca koru."
          },
          "key": {
            "lastPosition": 6,
            "firstPosition": 4,
            "id": 11,
            "returnIdSufficient": false,
            "firstStopSufficient": false,
            "sortPreservesArrival": false
          }
        },
        {
          "id": "links",
          "title": {
            "en": "Test the reason for discarding",
            "tr": "Eleme gerekçesini sına"
          },
          "prompt": {
            "en": "Different directory: [4, 24, 11, 18, 7, 20, 26, 31], target 24. A binary step checks position 4: 18 < 24, so it discards positions 1–4. Show the target’s position to explain why this fails. Contrast left-to-right scanning; state the ordering and access conditions binary search needs.",
            "tr": "Farklı rehber: [4, 24, 11, 18, 7, 20, 26, 31], hedef 24. Bir ikili adım konum 4’e bakıyor: 18 < 24 deyip konum 1–4’ü eliyor. Neden başarısız olduğunu hedefin konumuyla göster. Soldan taramayla karşılaştır; ikili aramanın sıralama ve erişim koşullarını belirt."
          },
          "answer": {
            "en": "Target 24 is at position 2, inside the discarded side. With no sorted-order guarantee, 18 < 24 at the middle says nothing about all values to its left. A left-to-right search finds 24 at position 2. Binary search needs sorted order for the discard argument and direct positional access for cheap midpoint access; preparation and output requirements still matter.",
            "tr": "Hedef 24, elenen taraftaki konum 2’dedir. Sıralılık garantisi yokken ortadaki 18 < 24 bilgisi soldaki bütün değerler için bir şey söylemez. Soldan arama 24’ü konum 2’de bulur. İkili aramada eleme gerekçesi için sıralılık, ortaya ucuz erişim için doğrudan konum erişimi gerekir; hazırlık ve çıktı koşulları yine önemlidir."
          },
          "key": {
            "midpoint": 4,
            "value": 18,
            "discarded": [
              1,
              4
            ],
            "targetPosition": 2,
            "linearResultPosition": 2,
            "linearProbes": 2,
            "requiresSorted": true,
            "requiresDirectAccess": true
          },
          "directory": [
            4,
            24,
            11,
            18,
            7,
            20,
            26,
            31
          ],
          "target": 24
        }
      ]
    }
  },
  "practice": {
    "w1": {
      "minutes": 3,
      "title": {
        "en": "Week 1 · Trace and stop",
        "tr": "Hafta 1 · İzle ve dur"
      },
      "records": [
        18,
        7,
        18,
        24
      ],
      "target": 24,
      "prompt": {
        "en": "Predict the next position, value and equality decision before revealing each step. What are the returned position and the check count? Then predict the result for target 18 in the same arrival list.",
        "tr": "Her adımı açmadan sonraki konum, değer ve eşitlik kararını tahmin et. Dönen konum ve kontrol sayısı nedir? Ardından aynı geliş listesinde hedef 18 için sonucu tahmin et."
      },
      "hint": {
        "en": "The contract asks for the first matching position, starting at 1. A “no” result still counts as an equality check; a later match is not needed after the first.",
        "tr": "Anlaşma, 1’den başlayan ilk eşleşme konumunu istiyor. “Hayır” da bir eşitlik kontrolüdür; ilk eşleşmeden sonra sonraki eşleşmeye gerek yok."
      },
      "solution": {
        "en": "Target 24: positions 1, 2, 3, 4 contain 18, 7, 18, 24; the decisions are no, no, no, yes. Return position 4 after 4 equality checks. For target 18, return position 1 after 1 check; another 18 at position 3 does not change the first result. ID, position and count answer different questions.",
        "tr": "Hedef 24: konum 1, 2, 3, 4’te 18, 7, 18, 24 var; kararlar hayır, hayır, hayır, evet. 4 eşitlik kontrolünden sonra konum 4 döner. Hedef 18 için 1 kontrolden sonra konum 1 döner; konum 3’teki başka bir 18 ilk sonucu değiştirmez. Kimlik, konum ve sayım farklı soruları yanıtlar."
      }
    },
    "w2": {
      "minutes": 3,
      "title": {
        "en": "Week 2 · Add or repeat",
        "tr": "Hafta 2 · Topla veya yinele"
      },
      "records": [
        18,
        7,
        18
      ],
      "prompt": {
        "en": "For n = 3 records, predict the total for two full sequential scans and for the full n × n comparison table. Reveal the first table row and the start of the next. Explain where addition or multiplication comes from. What happens to 2 n and n² when positive n doubles?",
        "tr": "n = 3 kayıtta iki ardışık tam taramanın ve tam n × n karşılaştırma tablosunun toplamını tahmin et. İlk tablo satırını ve sonraki satırın başını aç. Toplama veya çarpmanın nereden geldiğini açıkla. Pozitif n iki katına çıkınca 2 n ve n² ne olur?"
      },
      "hint": {
        "en": "Sequential scans finish one whole pass before starting the next. In the full table, the inner loop restarts at column 1 for every new row. Count both equal and unequal cells.",
        "tr": "Ardışık taramalar, sonraki tura geçmeden bir turun tamamını bitirir. Tam tabloda iç döngü, her yeni satırda sütun 1’den yeniden başlar. Eşit ve farklı hücrelerin ikisini de say."
      },
      "solution": {
        "en": "Two scans: 3 + 3 = 6 equality checks, so C(n) = 2 n. Full table: 3 rows × 3 cells = 9 checks, so C(n) = n². The first row is (1, 1), (1, 2), (1, 3); then comes (2, 1). n counts records, not distinct IDs; here two records have ID 18. When positive n doubles, 2 n doubles and n² quadruples. The two reports are different outputs, and check counts are not seconds.",
        "tr": "İki tarama: 3 + 3 = 6 eşitlik kontrolü; C(n) = 2 n. Tam tablo: 3 satır × 3 hücre = 9 kontrol; C(n) = n². İlk satır (1, 1), (1, 2), (1, 3); sonra (2, 1) gelir. n farklı kimlikleri değil kayıtları sayar; burada iki kaydın kimliği 18. Pozitif n iki katına çıkınca 2 n iki, n² dört kat olur. İki rapor farklı çıktılardır; kontrol sayısı saniye değildir."
      }
    },
    "w3": {
      "minutes": 4,
      "title": {
        "en": "Week 3 · Check the conditions",
        "tr": "Hafta 3 · Koşulları denetle"
      },
      "directory": [
        4,
        7,
        11,
        18,
        24,
        31,
        42,
        56
      ],
      "target": 42,
      "prompt": {
        "en": "The directory is already sorted, its IDs are distinct, and each position can be accessed directly. Predict the midpoint and next interval before revealing a binary probe. Compare the result and probe count with a left-to-right search. Then consider what a midpoint comparison can tell you if the directory is not sorted.",
        "tr": "Rehber hazır sıralı, kimlikleri farklı ve her konuma doğrudan erişiliyor. İkili yoklamayı açmadan orta konumu ve sonraki aralığı tahmin et. Sonucu ve yoklama sayısını soldan aramayla karşılaştır. Ardından rehber sıralı değilse orta karşılaştırmasının ne söyleyebileceğini düşün."
      },
      "hint": {
        "en": "Choose floor((left + right) / 2). Sorted order is what justifies ruling out a whole side. The checked midpoint is excluded from the new interval. Count one abstract three-way comparison as one probe for both methods.",
        "tr": "(sol + sağ) / 2’yi aşağı yuvarla. Bir tarafın tamamını elemeyi haklı çıkaran şey sıralılıktır. Kontrol edilen orta, yeni aralıkta kalmaz. İki yöntemde de tek soyut üç yönlü karşılaştırmayı bir yoklama say."
      },
      "solution": {
        "en": "For target 42, binary search checks position 4 (18), then 6 (31), then 7 (42): 3 probes, result position 7. A left-to-right search makes 7 probes in the same directory and returns 7. This is a given sorted-directory position, not the original arrival position. For target 56 the binary method takes 4 probes, so one example does not cover every target. Without sorted order, a single midpoint comparison cannot justify discarding all positions on one side. For one unsorted search, scanning needs no preparation; for many searches, include preparation and the required position information in the choice.",
        "tr": "Hedef 42 için ikili arama konum 4 (18), sonra 6 (31), sonra 7’ye (42) bakar: 3 yoklama, sonuç konum 7. Soldan arama aynı rehberde 7 yoklama yapar ve 7 döndürür. Bu, verilen sıralı rehberin konumudur; özgün geliş konumu değildir. Hedef 56 için ikili yöntem 4 yoklama yapar; tek örnek bütün hedefleri kapsamaz. Sıralılık yokken tek orta karşılaştırması bir taraftaki bütün konumları elemeyi haklı çıkarmaz. Sırasız tek aramada tarama hazırlık istemez; çok aramada hazırlığı ve gereken konum bilgisini de seçime kat."
      }
    }
  },
  "rubricPolicy": {
    "en": "Score each written response separately from 0 to 2, and cite evidence for every selected score. Do not derive the score from a numeric answer, a choice, the learner’s self-rating or elapsed time. Missing response/evidence is blank, not 0. Explicit ‘I do not know’ is evidence for 0. Record independence, hint use or solution exposure separately; a content score does not by itself show independent performance. Do not overwrite the first attempt with corrections.",
    "tr": "Her yazılı gerekçeyi 0–2 arasında ayrı puanla ve seçilen her puan için kanıt yaz. Puanı yalnız sayısal yanıttan, seçenekten, öğrencinin özpuanından veya süreden türetme. Eksik yanıt/kanıt boş kalır;0 değildir. Açıkça ‘Bilmiyorum’ yazılması 0 için kanıttır. Bağımsızlığı, ipucunu veya çözümü görmeyi ayrıca kaydet; içerik puanı tek başına bağımsız performansı göstermez. İlk denemeyi düzeltmelerle değiştirme."
  },
  "rubrics": {
    "code": {
      "0": {
        "en": "No workable trace, or a fundamental contradiction such as returning the target ID as the position or continuing past the first match under the first-match contract.",
        "tr": "İşleyen bir iz yok veya hedef kimliğini konum diye döndürmek, ilk eşleşme anlaşmasında eşleşmeden sonra devam etmek gibi temel bir çelişki var."
      },
      "1": {
        "en": "Some positions/decisions or the returned result are correct, but the trace, count or explanation for stopping is incomplete.",
        "tr": "Bazı konum/kararlar veya sonuç doğru; ancak iz, sayım ya da durma gerekçesi eksik."
      },
      "2": {
        "en": "All visited positions, values and equality decisions are correct; the response returns the first matching position, counts those checks and explains that earlier positions were ruled out.",
        "tr": "Bakılan bütün konumlar, değerler ve eşitlik kararları doğru; ilk eşleşmenin konumu ve kontrol sayısı verilmiş, önceki konumların elendiği açıklanmış."
      }
    },
    "math": {
      "0": {
        "en": "Counts the ID, distinct devices or seconds instead of records/checks, or fundamentally confuses adding two full scans with a full n × n table.",
        "tr": "Kayıt/kontrol yerine kimliği, farklı cihazları veya saniyeyi sayıyor ya da iki tam taramanın toplamını tam n × n tabloyla temel olarak karıştırıyor."
      },
      "1": {
        "en": "Some values or formulas are correct, but the grouping or the equality-check unit is missing or inconsistent.",
        "tr": "Bazı sayılar veya formüller doğru; ancak gruplama ya da eşitlik kontrolü birimi eksik/tutarsız."
      },
      "2": {
        "en": "Defines n as the record count; derives 2 n from two full scans and n² from n checks in each of n rows; gives the correct totals and explains that ‘no’ also counts and the result is not seconds.",
        "tr": "n’yi kayıt sayısı olarak tanımlar; iki tam taramadan 2 n’yi, n satırın her birindeki n kontrolden n²’yi kurar; doğru toplamları verir, ‘hayır’ın da sayıldığını ve sonucun saniye olmadığını açıklar."
      }
    },
    "purpose": {
      "0": {
        "en": "Treats the device ID as the needed message location, or says the first-match result still answers the last-message request.",
        "tr": "Cihaz kimliğini gereken mesaj konumu sayıyor veya ilk eşleşme sonucunun son mesaj isteğini hâlâ karşıladığını söylüyor."
      },
      "1": {
        "en": "Identifies the last position or the changed requirement, but does not fully connect output type, stopping rule and arrival-order preservation.",
        "tr": "Son konumu veya değişen isteği buluyor; ancak çıktı türü, durma kuralı ve geliş sırasının korunması arasındaki bağı tamamlamıyor."
      },
      "2": {
        "en": "Gives the last position, distinguishes ID from message location, uses the first and last positions as evidence against early stopping, and explains that sorting changes original arrival positions.",
        "tr": "Son konumu verir; kimliği mesajın yerinden ayırır; ilk ve son konumları erken durmaya karşı kanıt olarak kullanır ve sıralamanın özgün geliş konumlarını değiştirdiğini açıklar."
      }
    },
    "links": {
      "0": {
        "en": "Claims the binary discard is safe without sorted order, or cannot use the target’s given position to test it.",
        "tr": "Sıralılık yokken ikili elemenin güvenli olduğunu söylüyor veya hedefin verilmiş konumunu kullanarak bunu sınayamıyor."
      },
      "1": {
        "en": "Notices the list is unsorted or the target is discarded, but the position evidence, connection to scanning, or required ordering/access conditions are incomplete.",
        "tr": "Listenin sırasız olduğunu veya hedefin elendiğini fark ediyor; ancak konum kanıtı, soldan tarama bağı veya sıralama/erişim koşulları eksik."
      },
      "2": {
        "en": "Locates the target inside the discarded range, explains why one midpoint comparison cannot justify that range without sorted order, contrasts this with left-to-right scanning and states sorted order plus direct positional access.",
        "tr": "Hedefi elenen aralıkta konumuyla gösterir; sıralılık yokken tek orta karşılaştırmasının o aralık için gerekçe olmadığını açıklar; soldan taramayla karşılaştırır ve sıralılık ile doğrudan konum erişimini belirtir."
      }
    }
  },
  "interpretation": {
    "en": "These are descriptive results for this small group. The first and transfer tasks use different data, list lengths, target positions and discard directions; they are not psychometrically equated. A pre/post difference alone does not establish that the lesson caused a change. Compare evidence and support as well as scores.",
    "tr": "Bunlar bu küçük grubun betimleyici sonuçlarıdır. İlk ve aktarım görevlerinde veri, liste uzunluğu, hedef konumu ve eleme yönü farklıdır; görevlerin ölçme güçlüğü eşitlenmiş değildir. Ön/son farkı tek başına değişime dersin neden olduğunu göstermez. Puanlarla birlikte kanıtı ve desteği de karşılaştır."
  }
});
});
