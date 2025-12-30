<?php
session_start();
require_once '../db.php';

// 1. ÜRÜN ID KONTROLÜ
if (!isset($_GET['id'])) {
    header("Location: products.php");
    exit;
}

$product_id = $_GET['id'];
// --- 1NF İHLALİ: YORUM EKLEME İŞLEMİ (HATALI TASARIM DEMOSU) ---
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['yorum_metni'])) {
    if (!isset($_SESSION['user_id'])) {
        header("Location: login.php");
        exit;
    }

    $yeniYorum = $_SESSION['user_name'] . "|" . $_POST['puan'] . "|" . htmlspecialchars($_POST['yorum_metni']);

    // 1. Bu ürün için daha önce yorum satırı açılmış mı?
    $stmt_check = $pdo->prepare("SELECT * FROM product_reviews_1nf WHERE product_id = :pid");
    $stmt_check->execute(['pid' => $product_id]);
    $existing = $stmt_check->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        // Varsa, eski verinin ucuna "###" koyup yenisini ekle (UPDATE)
        $guncelVeri = $existing['all_reviews'] . "###" . $yeniYorum;
        $stmt_upd = $pdo->prepare("UPDATE product_reviews_1nf SET all_reviews = :rev WHERE product_id = :pid");
        $stmt_upd->execute(['rev' => $guncelVeri, 'pid' => $product_id]);
    } else {
        // Yoksa yeni satır oluştur (INSERT)
        $stmt_ins = $pdo->prepare("INSERT INTO product_reviews_1nf (product_id, all_reviews) VALUES (:pid, :rev)");
        $stmt_ins->execute(['pid' => $product_id, 'rev' => $yeniYorum]);
    }

    // Sayfayı yenile ki yorum görünsün
    header("Location: detail.php?id=" . $product_id . "#yorumlar");
    exit;
}

// --- 1NF İHLALİ: YORUMLARI ÇEKME ---
$reviews_raw_string = "";
$stmt_get_rev = $pdo->prepare("SELECT all_reviews FROM product_reviews_1nf WHERE product_id = :pid");
$stmt_get_rev->execute(['pid' => $product_id]);
$row_rev = $stmt_get_rev->fetch(PDO::FETCH_ASSOC);

$parsed_reviews = []; // Yorumları burada toplayacağız
if ($row_rev) {
    $reviews_raw_string = $row_rev['all_reviews'];
    // "###" işaretine göre yorumları ayır
    $reviews_array = explode("###", $reviews_raw_string);

    foreach ($reviews_array as $rev_str) {
        // "|" işaretine göre detayları ayır (İsim, Puan, Yorum)
        $parts = explode("|", $rev_str);
        if (count($parts) >= 3) {
            $parsed_reviews[] = [
                'user' => $parts[0],
                'rating' => $parts[1],
                'comment' => $parts[2]
            ];
        }
    }
}

try {
    // 2. ÜRÜNÜ VE KATEGORİSİNİ ÇEK
    $stmt = $pdo->prepare("SELECT p.*, c.name as category_name 
                           FROM products p 
                           LEFT JOIN categories c ON p.category_id = c.id 
                           WHERE p.id = :id");
    $stmt->execute(['id' => $product_id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        header("Location: products.php"); // Ürün yoksa listeye dön
        exit;
    }

    // 3. TEKNİK ÖZELLİKLERİ ÇEK (Veritabanına eklediklerin: RAM, İşlemci vb.)
    $stmt_feat = $pdo->prepare("SELECT f.name, pf.value, pf.price_diff 
                                FROM product_features pf 
                                JOIN features f ON pf.feature_id = f.id 
                                WHERE pf.product_id = :id");
    $stmt_feat->execute(['id' => $product_id]);
    $features = $stmt_feat->fetchAll(PDO::FETCH_ASSOC);

    // 4. GALERİ RESİMLERİNİ ÇEK
    $stmt_img = $pdo->prepare("SELECT image_url FROM product_images WHERE product_id = :id");
    $stmt_img->execute(['id' => $product_id]);
    $extra_images = $stmt_img->fetchAll(PDO::FETCH_COLUMN);

    // Ana resmi de listenin en başına ekleyelim ki galeride o da görünsün
    $all_images = [$product['image_url']];
    if ($extra_images) {
        $all_images = array_merge($all_images, $extra_images);
    }
} catch (PDOException $e) {
    die("Veritabanı Hatası: " . $e->getMessage());
}



// 5. JS İÇİN VARYASYONLARI HAZIRLA (Butonlar için)
// Veritabanından gelen product_features tablosuna göre dinamik oluşturuyoruz
$jsSecenekler = [];
$jsFiyatFarklari = [];

foreach ($features as $feat) {
    $fName = $feat['name'];
    $fVal = $feat['value'];
    $fPrice = isset($feat['price_diff']) ? (float) $feat['price_diff'] : 0;

    // Seçenekler listesine ekle
    if (!isset($jsSecenekler[$fName])) {
        $jsSecenekler[$fName] = [];
    }
    // Aynı değer tekrar etmesin
    if (!in_array($fVal, $jsSecenekler[$fName])) {
        $jsSecenekler[$fName][] = $fVal;
    }

    // Fiyat farkı varsa ekle
    if ($fPrice != 0) {
        $key = $fName . '|' . $fVal;
        $jsFiyatFarklari[$key] = $fPrice;
    }
}

// Eğer hiç özellik yoksa varsayılan
if (empty($jsSecenekler)) {
    $jsSecenekler = ["Seçenek" => ["Standart"]];
}

// Tüm veriyi paketle (JS okusun diye)
$urunJsonData = [
    'id' => $product['id'],
    'ad' => $product['name'],
    'fiyat' => (float) $product['price'],
    'resim' => "../" . $product['image_url'],
    'aciklama' => $product['description'],
    'secenekler' => $jsSecenekler,
    'fiyatFarklari' => $jsFiyatFarklari
];
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <title><?php echo $product['name']; ?> - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>

    <header>
        <div class="container">
            <div class="logo">
                <a href="index.php" style="text-decoration:none;">
                    <h1>TeknoStore</h1>
                </a>
            </div>
            <div class="arama-kutusu">
                <input type="text" placeholder="Ürün ara...">
                <button type="button"><i class="fa fa-search"></i></button>
            </div>
            <div class="user-actions">
                <?php if (isset($_SESSION['user_id'])): ?>
                    <div class="user-profile">
                        <i class="fa fa-user-circle"></i>
                        <span><?php echo htmlspecialchars($_SESSION['user_name'] ?? ''); ?></span>
                    </div>
                    <a href="account.php" class="btn-header-action btn-orders">
                        <i class="fa fa-box-open"></i> Siparişlerim
                    </a>
                    <a href="logout.php" class="btn-header-action btn-logout-client">
                        <i class="fa fa-sign-out"></i> Çıkış
                    </a>
                <?php else: ?>
                    <a href="login.php" class="btn-header-action btn-login">
                        <i class="fa fa-user"></i> Giriş Yap / Kayıt Ol
                    </a>
                <?php endif; ?>
            </div>
            <a href="cart.php" class="sepet-btn">
                <i class="fa fa-shopping-cart"></i> Sepetim (<span id="sepet-sayac">0</span>)
            </a>
        </div>
    </header>

    <main class="container urun-detay-container" style="margin-top: 40px; margin-bottom: 60px;">

        <div class="detay-galeri">
            <div class="buyuk-resim-cerceve">
                <img id="detay-img" src="../<?php echo $all_images[0]; ?>" alt="<?php echo $product['name']; ?>">
            </div>

            <div class="kucuk-resimler" id="galeri-container">
                <?php foreach ($all_images as $index => $imgYolu): ?>
                    <img src="../<?php echo $imgYolu; ?>" class="<?php echo $index === 0 ? 'aktif' : ''; ?>"
                        onclick="resimDegistir(this)"
                        style="cursor: pointer; opacity: <?php echo $index === 0 ? '1' : '0.6'; ?>;">
                <?php endforeach; ?>
            </div>
        </div>

        <div class="detay-bilgi">
            <p class="marka-etiketi"><?php echo $product['category_name']; ?></p>

            <h1 class="detay-baslik"><?php echo $product['name']; ?></h1>

            <div class="detay-yildiz-ozet">
                <div class="yildizlar" id="ana-yildizlar" style="color:#fbbf24;">
                    <i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i
                        class="far fa-star"></i><i class="far fa-star"></i>
                </div>
                <span class="degerlendirme-sayisi" id="yorum-sayisi-ozet"></span>
            </div>

            <div class="detay-fiyat-alani">
                <span class="detay-fiyat"><?php echo number_format($product['price'], 0, ',', '.'); ?> ₺</span>
            </div>

            <div class="stok-bilgisi" style="margin: 15px 0;">
                <?php if ($product['stock'] > 0): ?>
                    <span
                        style="color: #16a34a; font-weight: 600; background: #dcfce7; padding: 5px 10px; border-radius: 5px;">
                        <i class="fa fa-check-circle"></i> Stokta Var
                    </span>
                <?php else: ?>
                    <span
                        style="color: #dc2626; font-weight: 600; background: #fee2e2; padding: 5px 10px; border-radius: 5px;">
                        <i class="fa fa-times-circle"></i> Tükendi
                    </span>
                <?php endif; ?>
            </div>

            <?php if (count($features) > 0): ?>
                <div class="urun-ozellikleri-listesi"
                    style="margin: 20px 0; background: #f8fafc; padding: 15px; border-radius: 8px; border:1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 10px; font-size: 0.95rem; color: #334155; font-weight:700;">Teknik Özellikler:
                    </h4>
                    <ul style="list-style: none; padding: 0;">
                        <?php foreach ($features as $feat): ?>
                            <li style="margin-bottom: 6px; font-size: 0.9rem; color:#475569;">
                                <strong style="color:#1e293b;"><?php echo $feat['name']; ?>:</strong>
                                <?php echo $feat['value']; ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <div id="urun-secenekleri-container" class="urun-secenekleri" style="margin-top:20px;">
            </div>

            <div class="kisa-aciklama" style="margin-top:20px;">
                <p><?php echo $product['description']; ?></p>
            </div>

            <div class="detay-aksiyon" style="margin-top: 30px;">
                <div class="adet-secimi">
                    <button onclick="adetDegistir(-1)">-</button>
                    <input type="number" id="urun-adet" value="1" min="1" readonly>
                    <button onclick="adetDegistir(1)">+</button>
                </div>
                <button class="sepete-ekle-btn">
                    <i class="fa fa-shopping-cart"></i> Sepete Ekle
                </button>
            </div>
        </div>
    </main>

    <section class="container detay-alt-bolum">
        <div class="sekmeler">
            <button class="sekme-btn active" onclick="sekmeDegistir('yorumlar')">Değerlendirmeler</button>
            <button class="sekme-btn" onclick="sekmeDegistir('taksit')">Taksit Seçenekleri</button>
        </div>

        <div id="yorumlar" class="sekme-icerik aktif">
            <div class="yorum-grid">
                <div class="yorum-liste-tarafi">
                    <h3>Kullanıcı Yorumları (<?php echo count($parsed_reviews); ?>)</h3>

                    <?php if (empty($parsed_reviews)): ?>
                        <p style="color:#666;">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                    <?php else: ?>
                        <?php foreach (array_reverse($parsed_reviews) as $rev): ?>
                            <div class="yorum-kutu" style="border-bottom:1px solid #eee; padding: 15px 0;">
                                <div style="display:flex; justify-content:space-between;">
                                    <strong style="color:#333;"><?php echo $rev['user']; ?></strong>
                                    <div style="color:#fbbf24;">
                                        <?php
                                        for ($i = 0; $i < 5; $i++) {
                                            if ($i < $rev['rating'])
                                                echo '<i class="fas fa-star"></i>';
                                            else
                                                echo '<i class="far fa-star"></i>';
                                        }
                                        ?>
                                    </div>
                                </div>
                                <p style="margin-top:5px; color:#555;"><?php echo $rev['comment']; ?></p>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>

                <div class="yorum-form-tarafi">
                    <?php if (isset($_SESSION['user_id'])): ?>
                        <div class="yorum-yap-alani"
                            style="background:#f8fafc; padding:20px; border-radius:10px; border:1px solid #e2e8f0;">
                            <h3 style="margin-bottom:15px;">Değerlendir</h3>

                            <form action="" method="POST">
                                <label>Puanınız:</label>
                                <select name="puan"
                                    style="width:100%; padding:10px; margin-bottom:15px; border-radius:5px;">
                                    <option value="5">5 Yıldız - Çok İyi</option>
                                    <option value="4">4 Yıldız - İyi</option>
                                    <option value="3">3 Yıldız - Orta</option>
                                    <option value="2">2 Yıldız - Kötü</option>
                                    <option value="1">1 Yıldız - Çok Kötü</option>
                                </select>

                                <textarea name="yorum_metni" placeholder="Ürün hakkındaki düşünceleriniz..." required
                                    style="width:100%; padding:12px; margin-bottom:15px; border-radius:8px; border:1px solid #cbd5e1; min-height:100px; resize:vertical;"></textarea>

                                <button type="submit" class="btn-primary"
                                    style="width:100%; background-color:#2563eb; color:white; padding:10px; border-radius:8px; border:none; cursor:pointer;">
                                    Yorumu Gönder
                                </button>
                            </form>
                        </div>
                    <?php else: ?>
                        <div class="alert" style="background:#fff3cd; color:#856404; padding:15px;">
                            Yorum yapmak için <a href="login.php">Giriş Yapın</a>.
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <div id="taksit" class="sekme-icerik">
            <div class="taksit-tablosu-container">
                <table class="taksit-tablosu">
                    <thead>
                        <tr>
                            <th>Banka</th>
                            <th>Taksit Sayısı</th>
                            <th>Aylık Tutar</th>
                            <th>Toplam Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i class="fab fa-cc-visa" style="color:#1d4ed8; font-size:1.2rem;"></i> World</td>
                            <td>3 Taksit</td>
                            <td><?php echo number_format($product['price'] / 3, 2, ',', '.'); ?> TL</td>
                            <td><?php echo number_format($product['price'], 2, ',', '.'); ?> TL</td>
                        </tr>
                        <tr>
                            <td><i class="fab fa-cc-mastercard" style="color:#c2410c; font-size:1.2rem;"></i> Bonus</td>
                            <td>6 Taksit</td>
                            <td><?php echo number_format($product['price'] / 6, 2, ',', '.'); ?> TL</td>
                            <td><?php echo number_format($product['price'], 2, ',', '.'); ?> TL</td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-credit-card" style="color:#15803d; font-size:1.2rem;"></i> Maximum</td>
                            <td>9 Taksit</td>
                            <td><?php echo number_format($product['price'] / 9, 2, ',', '.'); ?> TL</td>
                            <td><?php echo number_format($product['price'], 2, ',', '.'); ?> TL</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <script>
        const sayfaUrunVerisi = <?php echo json_encode($urunJsonData); ?>;
        const phpKullanici = {
            email: "<?php echo isset($_SESSION['user_email']) ? $_SESSION['user_email'] : ''; ?>",
            girisYapti: <?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>
        };

        // Sekme Değiştirme (JS dosyasında yoksa diye garanti olsun)
        function sekmeDegistir(id) {
            document.querySelectorAll('.sekme-icerik').forEach(el => el.classList.remove('aktif'));
            document.querySelectorAll('.sekme-btn').forEach(el => el.classList.remove('active'));
            document.getElementById(id).classList.add('aktif');
            // Tıklanan butonu aktif yap
            event.currentTarget.classList.add('active');
        }
    </script>
    <script src="../JS/script.js"></script>
</body>

</html>