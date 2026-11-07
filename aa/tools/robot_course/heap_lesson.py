"""Week 7 explanations, heap frames and a trace of periodic releases."""

from heapq import heapify, heappop, heappush
from html import escape
from itertools import count
from math import ceil, log2


def table(caption, headings, rows):
    header = "".join(f'<th scope="col">{cell}</th>' for cell in headings)
    body = "".join(
        f'<tr><th scope="row">{first}</th>' + "".join(f"<td>{cell}</td>" for cell in rest) + "</tr>"
        for first, *rest in rows
    )
    return (f'<div class="heap-table-scroll" tabindex="0" role="region" aria-label="{escape(caption)}">'
            f'<table class="robot-table"><caption>{caption}</caption>'
            f'<thead><tr>{header}</tr></thead><tbody>{body}</tbody></table></div>')


def compare(tr):
    operations = (
        ("Yapı", "Zamanlayıcı ekle", "En erken zamanı bul", "En erken olanı çıkar")
        if tr else ("Structure", "Add a timer", "Find the next one", "Remove the next one")
    )
    rows = (
        (("Sırasız liste", "Sona 1 ekleme", "n kaydı tara", "n kaydı tara"),
         ("Sıralı liste", "n öğeye kadar kaydır", "1 erişim", "Sondan 1 çıkarma"),
         ("Min-öbek", "Yaklaşık log₂ n yer değiştirme", "1 erişim (kök)", "Yaklaşık log₂ n yer değiştirme"))
        if tr else
        (("Unsorted list", "1 append", "Scan all n", "Scan all n"),
         ("Sorted list", "Shift up to n", "1 read", "1 pop from the end"),
         ("Min-heap", "About log₂ n swaps", "1 read (root)", "About log₂ n swaps"))
    )
    counts = [(f"{n:,}", f"{n:,}", ceil(log2(n))) for n in (8, 128, 1000, 1000000)]
    if tr:
        counts = [(n.replace(",", "."), scan.replace(",", "."), depth) for n, scan, depth in counts]
    return (
        table("Zamanlayıcı işlemleri" if tr else "Timer operations", operations, rows)
        + table("Farklı kuyruk boyutlarında yaklaşık iş" if tr else "Approximate work at four queue sizes",
                ("Zamanlayıcı sayısı n", "Tam taramada incelenen kayıt", "Öbekte en çok yaklaşık katman")
                if tr else ("Timers n", "Entries inspected in a full scan", "Approximate heap levels at most"),
                counts)
    )


def frame(values, focus, caption, tr):
    positions = [(150, 25), (78, 82), (222, 82), (42, 139)]
    edges = []
    nodes = []
    cells = []
    for index, value in enumerate(values):
        x, y = positions[index]
        if index:
            px, py = positions[(index - 1) // 2]
            edges.append(f'<line x1="{px}" y1="{py}" x2="{x}" y2="{y}"/>')
        highlight = ' class="heap-highlight"' if index in focus else ''
        nodes.append(f'<g{highlight}><circle cx="{x}" cy="{y}" r="18"/>'
                     f'<text x="{x}" y="{y + 5}">{value}</text></g>')
        cells.append(f'<li{highlight}><span>{index}</span><strong>{value}</strong></li>')
    array_label = "Dizi, indis ve değer" if tr else "Array, index and value"
    return f"""<figure class="heap-frame">
<div class="heap-views">
<svg class="heap-tree" viewBox="0 0 300 162" aria-hidden="true">{"".join(edges + nodes)}</svg>
<ol class="heap-array" aria-label="{array_label}">{"".join(cells)}</ol>
</div><figcaption>{caption}</figcaption></figure>"""


def diagrams(tr):
    insert = (
        ("Başlangıç. Kök 4, çocukları 9 ve 7.", "3 sona eklenir. Ebeveyni 9 ile karşılaştır.",
         "3 ile 9 yer değiştirir. Şimdi 3’ün ebeveyni 4.", "3 ile 4 yer değiştirir. 3 kökte ve öbek hazır.")
        if tr else
        ("Start with root 4 and children 9 and 7.", "Append 3. Compare it with its parent 9.",
         "Swap 3 and 9. Now the parent of 3 is 4.", "Swap 3 and 4. The new minimum is at the root.")
    )
    remove = (
        ("Kök 3, çıkaracağımız en erken zaman.", "3’ü çıkar, son öğe 9’u köke taşı. İki çocuğa bak.",
         "9’u küçük çocuk 4 ile değiştir. 9 yaprakta ve işlem biter.")
        if tr else
        ("The root 3 is the earliest time to remove.", "Remove 3 and move the last value 9 to the root. Compare both children.",
         "Swap 9 with the smaller child 4. The 9 is now a leaf, so stop.")
    )
    sequences = (
        ("Ekleme · Yukarı kaydır" if tr else "Insert · Sift up", insert,
         [([4, 9, 7], ()), ([4, 9, 7, 3], (1, 3)), ([4, 3, 7, 9], (0, 1)), ([3, 4, 7, 9], (0,))]),
        ("Çıkarma · Aşağı kaydır" if tr else "Remove · Sift down", remove,
         [([3, 4, 7, 9], (0,)), ([9, 4, 7], (0, 1)), ([4, 9, 7], (1,))]),
    )
    blocks = []
    for heading, captions, states in sequences:
        frames = "".join(frame(values, focus, caption, tr) for (values, focus), caption in zip(states, captions))
        blocks.append(f"""<div class="heap-diagram">
<h3>{heading}</h3>{frames}
<div class="heap-controls" hidden>
<button type="button" data-heap-prev>{"Önceki" if tr else "Previous"}</button>
<output aria-live="polite"></output>
<button type="button" data-heap-next>{"Sonraki" if tr else "Next"}</button>
</div></div>""")
    return "".join(blocks)


def cheat_sheet(tr):
    operations = (
        ("<code>heappush(heap, item)</code>", "Yeni öğeyi ekler ve öbek düzenini onarır." if tr else "Insert an item and restore heap order."),
        ("<code>heappop(heap)</code>", "En küçük öğeyi çıkarıp döndürür. Boşsa IndexError." if tr else "Remove and return the minimum. Raises IndexError on an empty heap."),
        ("<code>heapreplace(heap, item)</code>", "En küçüğü döndürür ve yeni öğeyi ekler. Öbek boş olmamalı." if tr else "Return the old minimum and insert the replacement. The heap must be nonempty."),
        ("<code>heapify(items)</code>", "Mevcut listeyi yerinde öbeğe dönüştürür." if tr else "Rearrange an existing list into a heap in place."),
        ("<code>heap[0]</code>", "En küçüğü çıkarmadan okur. Önce öbeğin dolu olduğunu kontrol et." if tr else "Peek at the minimum without removing it. Check that the heap is nonempty first."),
    )
    return table("Python öbek işlemleri" if tr else "Python heap operations",
                 ("İşlem", "Davranış") if tr else ("Operation", "Behavior"), operations)


def concepts(tr):
    intro = """
<h2>Önce öbeği tanı</h2>
<h3>Bu derste yapabileceklerin</h3>
<ul>
<li>Dizi ile ağaç görünümü arasında geçiş yapabilirsin.</li>
<li>Bir ekleme ve bir çıkarma işlemini adım adım izleyebilirsin.</li>
<li>Zamanlayıcı kuyruğu için sırasız listeyi, sıralı listeyi ve min-öbeği karşılaştırabilirsin.</li>
<li>Python’da zamanı gelen görevleri seçip bir sonraki hazır olma zamanını ekleyebilirsin.</li>
</ul>
<h3>Başlamadan önce</h3>
<p>6. haftadaki sıralı diziyi hatırla. Araya bir öğe eklemek için komşuları kaydırmıştık. Burada da bir dizi kullanacağız, ancak daha zayıf bir düzen kuralı yeterli.</p>
<ul>
<li>Öbek bir dizide saklanır. Ağaç, indis ilişkilerini görmenin bir yoludur.</li>
<li>Min-öbekte her ebeveyn, çocuklarından küçük veya eşittir.</li>
<li>i indisinin çocukları 2i + 1 ve 2i + 2. Kök dışındaki bir i için ebeveyn (i − 1) // 2.</li>
</ul>
<p>Öncelik kuyruğu, önce en öncelikli öğeyi verir. Bu derste öncelik, en erken hazır olma zamanıdır. Ağaç yukarıdan aşağıya, her katman soldan sağa doldurulur. Ebeveyn kuralı her dalda geçerli olduğundan kök tüm öğelerden küçük veya eşittir. Kardeşler arasında bir sıralama kuralı yoktur.</p>
<h3>Neden doğrudan liste kullanmayalım?</h3>
""" if tr else """
<h2>Start with the heap</h2>
<h3>You will be able to</h3>
<ul>
<li>Read the same heap as an array and as a tree.</li>
<li>Trace an insertion and a removal one swap at a time.</li>
<li>Compare an unsorted list, a sorted list and a min-heap for timer work.</li>
<li>Release due tasks in Python and schedule their next release.</li>
</ul>
<h3>Before you start</h3>
<p>Recall the sorted array from Week 6. Inserting into the middle meant shifting neighboring values. This week we still use an array, with a weaker ordering rule.</p>
<ul>
<li>A heap is stored in an array. The tree is a way to see the index relationships.</li>
<li>In a min-heap every parent is less than or equal to its children.</li>
<li>At index i, the children are 2i + 1 and 2i + 2. For a non-root index i, the parent is (i − 1) // 2.</li>
</ul>
<p>A priority queue returns the item with highest priority first. Here that means the earliest release time. Fill the tree from top to bottom and left to right at each level. The parent rule holds along every path from the root, so the root is at most every entry. Siblings can appear in either order.</p>
<h3>Why not just a list?</h3>
"""
    assumptions = (
        """<p>Sıralı listenin en erken öğesini sağ uçta tuttuğumuzu varsayıyoruz. Böylece sondan çıkarmak bir işlemdir. Sırasız listede minimumun indisini taramayla bulduktan sonra öğeyi son öğeyle değiştirebilirsin. Sona ekleme, dizinin zaman zaman büyümesi dışında bir işlem sayılır.</p>
<p>Her yeni ağaç katmanı yaklaşık iki kat öğe barındırır. Bu yüzden 1.000 zamanlayıcıda bir öbek işlemi yaklaşık 10 katman boyunca ilerleyebilir, tam tarama ise 1.000 kayda bakar. Yer değiştirme ile karşılaştırma aynı işlem değildir. Aşağı kaydırırken küçük çocuğu seçmek için iki çocuğa da bakman gerekebilir. Süreyi laboratuvarda ölç.</p>
<h3>Dizi ve ağaçta aynı adımlar</h3>
<p><strong>Yukarı kaydır.</strong> Yeni öğeyi sona koy. Ebeveyniyle karşılaştır. Daha küçükse yer değiştir. Kökü bulunca veya ebeveyn daha küçük ya da eşit olunca dur.</p>
<p><strong>Aşağı kaydır.</strong> En küçüğü kökten al. Son öğeyi köke taşı. Daha büyükse küçük çocuğuyla değiştir. Yaprağa ulaştığında veya iki çocuk da daha küçük değilse dur.</p>
<p>Şekillerde küçük sayı dizi indisi, büyük sayı değerdir. Vurgulu hücreler o adımda karşılaştırılan veya taşınan öğeleri gösterir.</p>"""
        if tr else
        """<p>Assume the sorted list keeps the earliest item at its right end, so popping it takes one step. In an unsorted list, once a scan finds the minimum index, you can fill the gap with the last item. Appending usually takes one step, with occasional resizing.</p>
<p>Each tree level holds about twice as many entries as the one above it. At 1,000 timers a heap update can travel about 10 levels, while a full scan checks 1,000 entries. A swap and a comparison are different operations. Sifting down can also require comparing both children before choosing one. Use the lab to see what that means for time.</p>
<h3>The same steps in the tree and array</h3>
<p><strong>Sift up.</strong> Put the new item at the end. Compare it with its parent. Swap if it is smaller. Stop at the root or when the parent is smaller or equal.</p>
<p><strong>Sift down.</strong> Remove the root. Move the last item to the root. If it is larger than its smaller child, swap them. Stop at a leaf or when neither child is smaller.</p>
<p>The small number in each array cell is the index. The large number is the value. Highlights show the entries compared or moved in that frame.</p>"""
    )
    python_intro = (
        "<h3>Python heapq başvuru kartı</h3><p><code>heapq</code> sıradan bir listeyi min-öbek olarak yönetir. "
        "Öbek işlemlerini kullan ki ebeveyn kuralı korunsun.</p>"
        if tr else
        "<h3>Python heapq cheat sheet</h3><p><code>heapq</code> manages an ordinary list as a min-heap. "
        "Use its operations to preserve the parent rule.</p>"
    )
    ties = (
        """<p>Her kayıt <code>(release, seq, task)</code> olsun. Python önce hazır olma zamanını, sonra sıra numarasını karşılaştırır. Her eklemede farklı bir <code>seq</code> ver. Böylece eşit zamanlarda ilk eklenen çıkar. <code>seq</code> olmadan iki eşit zamanda Python görev nesnelerini karşılaştırmayı deneyebilir ve sıralanamayan nesnelerde <code>TypeError</code> oluşur.</p>
<p>Örneğin <code>(2, 1, imu)</code>, <code>(2, 4, motor)</code> kaydından önce gelir. Bu sıra numarası yalnız eşitlik içindir. Görev önceliği veya son tamamlanma zamanı değildir.</p>"""
        if tr else
        """<p>Store <code>(release, seq, task)</code>. Python compares the release time first and the sequence number next. Give every insertion a unique <code>seq</code> so equal release times come out in insertion order. Without it, equal release times can make Python compare task objects. Objects that have no ordering raise <code>TypeError</code>.</p>
<p>For example, <code>(2, 1, imu)</code> comes before <code>(2, 4, motor)</code>. This sequence number breaks ties only. It does not set task priority or a completion deadline.</p>"""
    )
    python_link = "Python heapq belgeleri" if tr else "Python heapq documentation"
    return (f'<section id="heap-basics">{intro}{compare(tr)}{assumptions}{diagrams(tr)}'
            f'{python_intro}{cheat_sheet(tr)}{ties}'
            f'<p><a href="https://docs.python.org/3/library/heapq.html">{python_link}</a></p></section>')

TASKS = (
    ("M", "Motor control", "Motor kontrolü", 1),
    ("I", "IMU", "IMU", 2),
    ("O", "Odometry", "Odometri", 10),
    ("T", "Telemetry", "Telemetri", 50),
)


def periodic_rows(tr):
    next_seq = count()
    periods = {code: period for code, _, _, period in TASKS}
    names = {code: turkish if tr else english for code, english, turkish, _ in TASKS}
    heap = [(period, next(next_seq), code) for code, period in periods.items()]
    heapify(heap)

    def entry(item):
        release, seq, code = item
        return f"({release}, {seq}, {code})"

    rows = []
    for now in range(1, 13):
        while heap and heap[0][0] <= now:
            release, seq, code = heappop(heap)
            next_entry = (release + periods[code], next(next_seq), code)
            heappush(heap, next_entry)
            snapshot = ", ".join(entry(item) for item in heap)
            rows.append((now, f"<code>{entry((release, seq, code))}</code>",
                         names[code], f"<code>{entry(next_entry)}</code>",
                         f"<code>[{snapshot}]</code>"))
    return rows


def schedule(tr):
    tasks = table(
        "Robot görevleri" if tr else "Robot tasks",
        ("Kod", "Görev", "Periyot (ms)", "İlk hazır olma zamanı (ms)")
        if tr else ("Code", "Task", "Period (ms)", "First release (ms)"),
        [(code, turkish if tr else english, period, period) for code, english, turkish, period in TASKS],
    )
    loop = """while heap and heap[0][0] <= now:
    release, _, task = heappop(heap)
    run(task)
    heappush(heap, (release + period[task], next(sequence), task))"""
    intro = """
<h2>Robotun ilk 12 milisaniyesi</h2>
<p>Dört görev kendi periyodunun sonunda ilk kez hazır olsun. Kuyruk yalnız bir sonraki hazır olma zamanını tutar. Bu izde her tikte hazır görevlerin hepsini işliyoruz. İşleyici süreleri ve gerçek zamanlı görev öncelikleri bu küçük modelin dışında.</p>
""" if tr else """
<h2>The robot’s first 12 milliseconds</h2>
<p>Each task first becomes ready at the end of its own period. The queue holds the next release for each task. In this trace, each tick handles all releases due at that tick. Handler durations and operating-system task priorities are outside this small model.</p>
"""
    explain = (
        """<p>Başlangıç öbeği <code>[(1, 0, M), (2, 1, I), (10, 2, O), (50, 3, T)]</code>. Sıra numaraları 0’dan başlıyor. Her tikte kökü oku. Hazır olma zamanı şimdiye eşit veya küçükse çıkar, görevi çalıştır ve yeni zamanı ekle. Kök ilerideyse sonraki tike geç.</p>"""
        if tr else
        """<p>The initial heap is <code>[(1, 0, M), (2, 1, I), (10, 2, O), (50, 3, T)]</code>. Sequence numbers start at zero. At each tick, peek at the root. When its release time is at or before now, pop it, run the task and push its next release. If the root is in the future, wait for the next tick.</p>"""
    )
    wrap_up = (
        """<p>2 ms’de hem I hem M hazır. I daha önce eklendiği için önce çıkar. 10 ms’de O, I, M sırası da aynı kuralla oluşur. T’nin ilk zamanı 50 ms olduğu için tabloda çalışmaz ama öbekte kalır.</p>
<p>Sonraki zamanı <code>release + period</code> ile hesapla. Örneğin 10 ms’de çalışan O, 20 ms için yeniden eklenir. 10 ms işi 11 ms’ye sarksa bile 10 + 10 hesabı dönem çizgisini korur. Gerçek sistemde birikmiş işleri çalıştırma, atlama veya birleştirme politikasını ayrıca seçersin.</p>"""
        if tr else
        """<p>At 2 ms, I and M are both due. I comes first because it was inserted earlier. At 10 ms, the same rule gives O, I, M. T stays in the heap throughout the trace because its first release is at 50 ms.</p>
<p>Schedule the next time with <code>release + period</code>. For example, O runs at 10 ms and is pushed back for 20 ms. If its 10 ms release were handled at 11 ms, adding the period to 10 would still keep the original schedule. A real controller needs a policy for missed releases, such as catching up, skipping or coalescing them.</p>"""
    )
    trace = table(
        "Her çıkarmadan ve yeniden eklemeden sonraki öbek dizisi" if tr else "Heap array after each pop, run and push",
        ("Şimdi (ms)", "Çıkar", "Çalıştır", "Yeniden ekle", "Son öbek")
        if tr else ("Now (ms)", "Pop", "Run", "Push next", "Heap after the push"),
        periodic_rows(tr),
    )
    return (f'<section id="robot-timers">{intro}{tasks}{explain}'
            f'<pre class="lab-variation"><code>{escape(loop)}</code></pre>{trace}{wrap_up}</section>')


def reference_notes(tr):
    glossary = (
        ("Release time", "Hazır olma zamanı", "Görevin çalışmaya başlayabileceği en erken an." if tr else "Earliest time a job can start."),
        ("Deadline", "Son tamamlanma zamanı", "İşin bitmesi gereken son an." if tr else "Latest time a job should finish."),
        ("Due", "Zamanı gelmiş", "Hazır olma zamanı ≤ şimdi. Eşitlik dahildir." if tr else "Release time ≤ now. Includes equality."),
        ("Overdue", "Gecikmiş", "Henüz işlenmemiş ve hazır olma zamanı < şimdi." if tr else "Still waiting and release time < now."),
        ("Pending", "Bekleyen", "Kuyrukta ve henüz işlenmemiş." if tr else "Queued and still waiting to be handled."),
        ("Priority queue", "Öncelik kuyruğu", "En öncelikli kaydı önce veren yapı." if tr else "Returns the highest-priority entry first."),
    )
    prose = """
<h2>Sık yapılan hatalar</h2>
<ul class="heap-mistakes-list">
<li><strong>Öbeği sıralı sanmak.</strong> [4, 9, 7] geçerli bir min-öbek. Yalnız ebeveynler ile çocukları arasında kural var.</li>
<li><strong>İkinci en küçüğü <code>heap[1]</code> sanmak.</strong> Bu örnekte <code>heap[1]</code> 9, ikinci en küçük değer 7.</li>
<li><strong>Boş öbekten okumak veya çıkarmak.</strong> Önce <code>if heap:</code> ile kontrol et.</li>
<li><strong>Zamanı gelmiş ile gecikmişi karıştırmak.</strong> Şimdi 20 iken hazır olma zamanı 20 olan görev zamanı gelmiştir. İşlenmemiş 19 gecikmiştir.</li>
<li><strong>Eşitlik kuralını unutmak.</strong> Her eklemede yeni sıra numarası kullan. Görev nesnesi karşılaştırmaya girmez.</li>
</ul>
<h3>Gerçek sistemler farklı yapılar kullanır</h3>
<p>FreeRTOS, geciken görevlerin uyanma zamanını sıralı bağlı listede tutar. Linux’un yüksek çözünürlüklü zamanlayıcıları ise zaman sırası için dengeli bir kırmızı-siyah ağaç kullanır. Küçük bir kuyrukta basit bir yapı yeterli olabilir. Laboratuvarda ölçtüğün süreleri gerçek kuyruk boyutuyla karşılaştır. <a href="https://github.com/FreeRTOS/FreeRTOS-Kernel/blob/main/tasks.c">FreeRTOS kaynak kodu</a> · <a href="https://docs.kernel.org/timers/hrtimers.html">Linux hrtimers belgeleri</a></p>
<h3>İngilizce–Türkçe terimler</h3>
""" if tr else """
<h2>Common mistakes</h2>
<ul class="heap-mistakes-list">
<li><strong>Treating the heap as sorted.</strong> [4, 9, 7] is a valid min-heap. The ordering rule applies between a parent and its children.</li>
<li><strong>Reading <code>heap[1]</code> as the second smallest.</strong> Here that gives 9, while the second smallest is 7.</li>
<li><strong>Peeking or popping when empty.</strong> Check <code>if heap:</code> first.</li>
<li><strong>Confusing due and overdue.</strong> At tick 20, a release at 20 is due. A release at 19 that still waits is overdue.</li>
<li><strong>Forgetting the tie-breaker.</strong> Use a fresh sequence number so the comparison never reaches the task object.</li>
</ul>
<h3>What real systems use</h3>
<p>FreeRTOS keeps delayed tasks in a linked list ordered by wake time. Linux high-resolution timers use a balanced red-black tree for time ordering. For a small queue, a simple structure can be fast enough. Compare the lab timings with the queue sizes your controller actually sees. <a href="https://github.com/FreeRTOS/FreeRTOS-Kernel/blob/main/tasks.c">FreeRTOS source</a> · <a href="https://docs.kernel.org/timers/hrtimers.html">Linux hrtimers documentation</a></p>
<h3>English–Turkish glossary</h3>
"""
    terms = table("Zamanlayıcı terimleri" if tr else "Timer terms",
                  ("İngilizce", "Türkçe", "Bu derste anlamı") if tr else ("English", "Turkish", "Meaning here"),
                  glossary)
    return f'<section id="heap-mistakes">{prose}{terms}</section>'


def trace_answer(tr):
    return (
        '<details><summary>Üç cümlelik örnek açıklama</summary><p>'
        'Min-öbekte kök en küçük öğedir çünkü her ebeveyn çocuklarından küçük veya eşittir. '
        'Eklemede yeni öğe yalnız kendi ebeveyn yolu boyunca yukarı çıkar. '
        'Kök çıkarılınca son öğe köke gelir ve düzen sağlanana kadar küçük çocukla yer değiştirir.</p></details>'
        if tr else
        '<details><summary>Compare a three-sentence explanation</summary><p>'
        'The root is the minimum because each parent is no larger than its children. '
        'Insertion only needs to move the new entry up its parent path. '
        'After removing the root, move the last entry there and swap it down with the smaller child until the heap rule holds.</p></details>'
    )


def exit_answer(tr):
    return (
        '<details><summary>Örnek çıkış yanıtı</summary><p>'
        'Başlatmadan önce görevin kalan çevrim bütçesine sığdığını kontrol et. '
        '0,15 ms bütçede 0,07 ms’lik iki iş sığar, üçüncüsü bekler. '
        'Bekleyen işin gecikmesini sonraki tikte kaydet veya güvenlik kuralına göre bir hata bildir.</p></details>'
        if tr else
        '<details><summary>Compare a sample exit answer</summary><p>'
        'Before each dispatch, check that its cost fits the remaining cycle budget. '
        'Two 0.07 ms dispatches fit in 0.15 ms, so leave the third due entry pending. '
        'At the next tick record any lateness or report a fault if the safety policy calls for it.</p></details>'
    )


def midterm_card(tr, home, suffix):
    topics = (
        (("İlk eşleşme", "İz sür, karşılaştırmaları say ve eşleşmesiz durumu dene."),
         ("Büyüme", "n, n log₂ n ve n² için girdi büyüdüğünde ne olacağını tahmin et."),
         ("İkili arama", "lo ve hi sınırlarını güncelle, tablo dışı indisi yorumla."),
         ("FIFO ve halka", "Baş indisini ve boyutu izle, bellek bütçesini hesapla."),
         ("Tam arama", "Sıralı arama ile karma tablosunu karşılaştır, çakışmayı izle."),
         ("Medyan süzgeci", "Pencereyi sırala, medyanı bul ve tepki gecikmesini açıkla."),
         ("Zamanlayıcı öbeği", "Bir ekleme ve çıkarma izle, zamanı geleni seç."))
        if tr else
        (("First match", "Trace a scan, count comparisons and test a miss."),
         ("Growth", "Predict how n, n log₂ n and n² change as input grows."),
         ("Binary search", "Update lo and hi and interpret an out-of-range index."),
         ("FIFO and ring buffers", "Track the head and size and calculate a memory budget."),
         ("Exact lookup", "Compare sorted and hash lookup and trace a collision."),
         ("Median filtering", "Sort a window, find its median and explain response delay."),
         ("Timer heaps", "Trace a push and pop and pick the next due task."))
    )
    rows = [
        (f'<a href="{home}w{week}/{suffix}#exam-practice">{week} · {topic}</a>', action)
        for week, (topic, action) in enumerate(topics, 1)
    ]
    title = "1–7. haftalara kısa bakış" if tr else "Weeks 1–7 at a glance"
    return (f'<section id="midterm-card"><h2>{title}</h2>'
            + table("Ara sınav kartı" if tr else "Midterm review card",
                    ("Hafta ve konu", "Yardımsız yap") if tr else ("Week and topic", "Try without help"), rows)
            + "</section>")
