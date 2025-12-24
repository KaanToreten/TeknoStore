<?php
require_once '../db.php';

try {
    // Ürünleri ve kategorilerini çek
    $sql = "SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id";

    // Arama ve Filtreleme Mantığı
    if (isset($_GET['ara'])) {
        $ara = htmlspecialchars($_GET['ara']);
        $sql .= " WHERE p.name LIKE '%$ara%'";
    } else if (isset($_GET['kategori'])) {
        // Kategori ismine göre filtreleme (Basit yöntem)
        // Gerçek projede kategori ID'si ile yapılır ama şimdilik isme göre yapalım
        $kategori = htmlspecialchars($_GET['kategori']);
        // JOIN yaptığımız için c.name kullanabiliriz
        $sql .= " WHERE c.name LIKE '%$kategori%' OR p.category_id IN (SELECT id FROM categories WHERE name LIKE '%$kategori%')";
    }

    $stmt = $pdo->query($sql);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Veri çekme hatası: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ürünler - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>

    <header>
        <div class="container">
            <div class="logo">
                <a href="index.html" style="text-decoration:none;">
                    <h1>TeknoStore</h1>
                </a>
            </div>
            <div class="arama-kutusu">
                <input type="text" placeholder="Ürün ara (Örn: Macbook, Kulaklık)...">
                <button><i class="fa fa-search"></i></button>
            </div>
            <div class="header-sag">
                <div class="hesap-menu">
                    <a href="login.html" id="giris-link"><i class="fa fa-user"></i> Giriş Yap</a>
                    <div class="dropdown-menu" id="user-menu">
                        <a href="account.html">Hesabım</a>
                        <a href="#" onclick="cikisYap()">Çıkış Yap</a>
                    </div>
                </div>
                <a href="cart.html" class="sepet-btn">
                    <i class="fa fa-shopping-cart"></i> Sepetim
                    <span id="sepet-adet" class="badge">0</span>
                </a>
            </div>
        </div>
    </header>

    <div class="container main-wrapper">

        <aside class="sidebar">
            <h3>Kategoriler</h3>
            <ul>
                <li><a href="products.php">Tüm Ürünler</a></li>
                <li><a href="products.php?kategori=Bilgisayar">Bilgisayarlar</a></li>
                <li><a href="products.php?kategori=Telefon">Telefonlar</a></li>
                <li><a href="products.php?kategori=Tablet">Tabletler</a></li>
                <li><a href="products.php?kategori=Aksesuar">Aksesuarlar</a></li>
            </ul>
        </aside>

        <div class="main-content">
            <h2>Tüm Ürünler</h2>

            <div id="urun-listesi" class="urun-grid">
                <?php if (count($products) > 0): ?>
                    <?php foreach ($products as $product): ?>
                        <div class="urun-karti">
                            <a href="detail.php?id=<?php echo $product['id']; ?>" style="text-decoration:none; color:inherit;">
                                <div class="resim-alani">
                                    <img src="../<?php echo $product['image_url']; ?>" alt="<?php echo $product['name']; ?>">
                                </div>
                                <h4><?php echo $product['name']; ?></h4>
                                <p class="ozellik"><?php echo $product['category_name']; ?></p>
                            </a>
                            <div class="alt-bilgi">
                                <span class="fiyat">
                                    <?php echo number_format($product['price'], 0, ',', '.'); ?> ₺
                                </span>
                                <button
                                    onclick="window.location.href='detail.php?id=<?php echo $product['id']; ?>'">İncele</button>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p style="padding: 20px;">Aradığınız kriterlere uygun ürün bulunamadı.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script src="../JS/script.js"></script>

    <script>
        // Sayfa yüklendiğinde script.js'in ürün listelemesini engelle
        // (Eğer script.js içinde 'urunleriListele' otomatik çağrılıyorsa bu işe yaramayabilir,
        // o yüzden JS dosyasından o satırı silmen en garantisidir.)
    </script>
</body>

</html>