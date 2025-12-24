<?php
session_start();
require_once '../db.php';
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeknoStore - Kurumsal Teknoloji Mağazası</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>

    <header>
        <div class="container">
            <div class="logo">
                <h1>TeknoStore</h1>
            </div>
            <div class="arama-kutusu">
                <input type="text" placeholder="Ürün ara...">
                <button type="button"><i class="fa fa-search"></i></button>
            </div>
            <div class="hesap-menu">
                <?php if (isset($_SESSION['user_id'])): ?>
                    <a href="account.php" style="font-weight:bold; color:var(--primary-color);">
                        <i class="fa fa-user-circle"></i> <?php echo htmlspecialchars($_SESSION['user_name']); ?>
                    </a>
                    <div class="dropdown-menu">
                        <a href="account.php">Siparişlerim</a>
                        <a href="logout.php">Çıkış Yap</a>
                    </div>
                <?php else: ?>
                    <a href="login.php" id="giris-link"><i class="fa fa-user"></i> Giriş Yap / Kayıt Ol</a>
                <?php endif; ?>
            </div>
            <a href="cart.php" class="sepet-btn">
                <i class="fa fa-shopping-cart"></i> Sepetim (<span id="sepet-sayac">0</span>)
            </a>
        </div>
    </header>

    <section class="slider-container">
        <div class="slider-wrapper">

            <div class="slide aktif"
                style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('../IMG/photo1.jpg');">
                <div class="slide-icerik">
                    <span class="etiket">Üniversiteye Özel</span>
                    <h2>Piri Reis Üniversitesi Öğrencilerine<br>Tüm Laptoplarda %15 İndirim!</h2>
                    <p>Okul e-posta adresinle kayıt ol, indirim kodunu kap.</p>
                    <a href="products.php?kategori=bilgisayar" class="btn-slider">Fırsatları İncele</a>
                </div>
            </div>

            <div class="slide"
                style="background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('../IMG/photo2.jpg');">
                <div class="slide-icerik">
                    <span class="etiket" style="background:#ef4444;">Sınav Dönemi</span>
                    <h2>Final Haftasında Odaklan:<br>Gürültü Engelleyici Kulaklıklar</h2>
                    <p>Sony ve Apple kulaklıklarda sepette net indirim.</p>
                    <a href="products.php?kategori=aksesuar" class="btn-slider">Kulaklıkları Gör</a>
                </div>
            </div>

            <div class="slide"
                style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('../IMG/photo3.jpg');">
                <div class="slide-icerik">
                    <span class="etiket" style="background:#f59e0b;">Yeni Sezon</span>
                    <h2>Geleceği Kodla:<br>En Yeni Donanımlar Burada</h2>
                    <p>Yazılım ve mühendislik öğrencileri için özel setler.</p>
                    <a href="products.html" class="btn-slider">Alışverişe Başla</a>
                </div>
            </div>

        </div>

        <button class="slider-btn prev" onclick="slaytDegistir(-1)"><i class="fa fa-chevron-left"></i></button>
        <button class="slider-btn next" onclick="slaytDegistir(1)"><i class="fa fa-chevron-right"></i></button>

        <div class="slider-noktalar">
            <span class="nokta aktif" onclick="slaytaGit(0)"></span>
            <span class="nokta" onclick="slaytaGit(1)"></span>
            <span class="nokta" onclick="slaytaGit(2)"></span>
        </div>
    </section>

    <main class="container">

        <aside class="sidebar">
            <h3>Kategoriler</h3>
            <ul>
                <li><a href="products.php">Tüm Ürünler</a></li>
                <li><a href="products.php?kategori=bilgisayar">Bilgisayarlar</a></li>
                <li><a href="products.php?kategori=telefon">Telefonlar</a></li>
                <li><a href="products.php?kategori=tablet">Tabletler</a></li>
                <li><a href="products.php?kategori=aksesuar">Aksesuarlar</a></li>
            </ul>
        </aside>

        <section class="urun-vitrini" id="urun-listesi">
            <?php
            // Son 8 ürünü çekelim
            try {
                // Veritabanı bağlantısı zaten yukarıda index.php başında 'db.php' çağrılmıyor, ekleyelim.
                // Not: index.php başında session_start var ama db.php yok. Onu da eklememiz lazım.
                // Burada geçici olarak db bağlantısını kullanıyoruz, ama en tepeye require eklemek daha doğru.
                // Replace yaparken en tepeye de ekleyeceğim.
            
                $stmt = $pdo->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC LIMIT 8");
                $home_products = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if (count($home_products) == 0) {
                    echo '<p style="padding:20px">Henüz ürün eklenmemiş.</p>';
                } else {
                    foreach ($home_products as $product) {
                        ?>
                        <div class="urun-karti">
                            <a href="detail.php?id=<?php echo $product['id']; ?>" style="text-decoration:none; color:inherit;">
                                <div class="resim-alani">
                                    <img src="../<?php echo htmlspecialchars($product['image_url']); ?>"
                                        alt="<?php echo htmlspecialchars($product['name']); ?>">
                                </div>
                                <h4><?php echo htmlspecialchars($product['name']); ?></h4>
                                <p class="ozellik"><?php echo htmlspecialchars($product['category_name'] ?? ''); ?></p>
                            </a>
                            <div class="alt-bilgi">
                                <span class="fiyat"><?php echo number_format($product['price'], 0, ',', '.'); ?> ₺</span>
                                <button onclick="window.location.href='detail.php?id=<?php echo $product['id']; ?>'">İncele</button>
                            </div>
                        </div>
                        <?php
                    }
                }
            } catch (PDOException $e) {
                echo "Hata: " . $e->getMessage();
            }
            ?>
        </section>

    </main>

    <footer>
        <p>&copy; 2025 TeknoStore. Web Programlama Dersi Projesi.</p>
    </footer>

    <script src="../JS/script.js"></script>

</body>

</html>