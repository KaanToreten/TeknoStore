<?php
session_start();
require_once '../db.php';

try {
    // Ürünleri ve kategorilerini çek
    $sql = "SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id";

    $pageTitle = "Tüm Ürünler";

    // Arama ve Filtreleme Mantığı
    if (isset($_GET['ara']) && !empty($_GET['ara'])) {
        $ara = $_GET['ara'];
        $sql .= " WHERE p.name LIKE '%$ara%'";
        $pageTitle = "Arama: \"$ara\"";
    } else if (isset($_GET['kategori']) && !empty($_GET['kategori'])) {
        $kategori = htmlspecialchars($_GET['kategori']);
        $sql .= " WHERE c.name LIKE '%$kategori%' OR p.category_id IN (SELECT id FROM categories WHERE name LIKE '%$kategori%')";
        $pageTitle = ucfirst($kategori);
    }

    $sql .= " ORDER BY p.id DESC";

    $stmt = $pdo->query($sql);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Kategorileri çek
    $catStmt = $pdo->query("SELECT * FROM categories ORDER BY name");
    $categories = $catStmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Veri çekme hatası: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $pageTitle; ?> - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        /* Products Page Specific Styles */
        .products-hero {
            background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
            padding: 40px 0;
            margin-bottom: 30px;
        }

        .products-hero-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .products-hero h1 {
            color: white;
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
        }

        .products-hero p {
            color: rgba(255, 255, 255, 0.8);
            margin-top: 8px;
            font-size: 1rem;
        }

        .breadcrumb {
            display: flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.9rem;
        }

        .breadcrumb a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            transition: 0.2s;
        }

        .breadcrumb a:hover {
            color: white;
        }

        .breadcrumb i {
            font-size: 0.7rem;
        }

        /* Filter Bar */
        .filter-bar {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 15px 20px;
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .filter-tags {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .filter-tag {
            padding: 8px 16px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            font-size: 0.85rem;
            color: #4b5563;
            text-decoration: none;
            transition: 0.2s;
            font-weight: 500;
        }

        .filter-tag:hover {
            background: #e5e7eb;
            color: #1f2937;
        }

        .filter-tag.active {
            background: #2563eb;
            color: white;
            border-color: #2563eb;
        }

        .results-count {
            color: #6b7280;
            font-size: 0.9rem;
        }

        .results-count strong {
            color: #111827;
        }

        /* Products Grid - Enhanced */
        .products-main {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 1.5rem 60px;
        }

        .products-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;
        }

        @media (max-width: 1200px) {
            .products-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media (max-width: 900px) {
            .products-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 600px) {
            .products-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Product Card - Premium */
        .product-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
        }

        .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            border-color: rgba(37, 99, 235, 0.3);
        }

        .product-image {
            width: 100%;
            height: 220px;
            background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            position: relative;
            overflow: hidden;
        }

        .product-image img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
            transform: scale(1.05);
        }

        .product-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .product-badge.out-of-stock {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .product-info {
            padding: 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .product-category {
            font-size: 0.8rem;
            color: #2563eb;
            font-weight: 500;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .product-title {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .product-title a {
            color: inherit;
            text-decoration: none;
        }

        .product-title a:hover {
            color: #2563eb;
        }

        .product-rating {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 15px;
        }

        .product-rating .stars {
            color: #fbbf24;
            font-size: 0.85rem;
        }

        .product-rating span {
            color: #9ca3af;
            font-size: 0.8rem;
        }

        .product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid #f3f4f6;
        }

        .product-price {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
        }

        .product-price small {
            font-size: 0.85rem;
            font-weight: 400;
            color: #9ca3af;
        }

        .btn-view {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .btn-view:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        /* No Results */
        .no-results {
            grid-column: 1 / -1;
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 16px;
            border: 1px solid #e5e7eb;
        }

        .no-results i {
            font-size: 4rem;
            color: #d1d5db;
            margin-bottom: 20px;
        }

        .no-results h3 {
            font-size: 1.5rem;
            color: #374151;
            margin-bottom: 10px;
        }

        .no-results p {
            color: #6b7280;
            margin-bottom: 20px;
        }

        .no-results a {
            color: #2563eb;
            text-decoration: none;
            font-weight: 500;
        }
    </style>
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
                <form action="products.php" method="GET" style="display:contents;">
                    <input type="text" name="ara" placeholder="Ürün ara (Örn: Macbook, Kulaklık)..."
                        value="<?php echo isset($_GET['ara']) ? htmlspecialchars($_GET['ara']) : ''; ?>">
                    <button type="submit"><i class="fa fa-search"></i></button>
                </form>
            </div>
            <div class="user-actions">
                <?php if (isset($_SESSION['user_id'])): ?>
                    <div class="user-profile">
                        <i class="fa fa-user-circle"></i>
                        <span><?php echo htmlspecialchars($_SESSION['user_name'] ?? ''); ?></span>
                    </div>
                    <a href="hesabim.php" class="btn-header-action btn-orders">
                        <i class="fa fa-box-open"></i> Siparişlerim
                    </a>
                    <a href="logout.php" class="btn-header-action btn-logout-client">
                        <i class="fa fa-sign-out-alt"></i> Çıkış
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

    <!-- Hero Section -->
    <section class="products-hero">
        <div class="products-hero-content">
            <div>
                <div class="breadcrumb">
                    <a href="index.php"><i class="fas fa-home"></i> Ana Sayfa</a>
                    <i class="fas fa-chevron-right"></i>
                    <span><?php echo $pageTitle; ?></span>
                </div>
                <h1><?php echo $pageTitle; ?></h1>
                <p><?php echo count($products); ?> ürün listeleniyor</p>
            </div>
        </div>
    </section>

    <!-- Main Products Area -->
    <div class="products-main">

        <!-- Filter Bar -->
        <div class="filter-bar">
            <div class="filter-tags">
                <a href="products.php"
                    class="filter-tag <?php echo (!isset($_GET['kategori']) && !isset($_GET['ara'])) ? 'active' : ''; ?>">
                    Tümü
                </a>
                <?php foreach ($categories as $cat): ?>
                    <a href="products.php?kategori=<?php echo urlencode($cat['name']); ?>"
                        class="filter-tag <?php echo (isset($_GET['kategori']) && strtolower($_GET['kategori']) == strtolower($cat['name'])) ? 'active' : ''; ?>">
                        <?php echo htmlspecialchars($cat['name']); ?>
                    </a>
                <?php endforeach; ?>
            </div>
            <div class="results-count">
                <strong><?php echo count($products); ?></strong> ürün bulundu
            </div>
        </div>

        <!-- Products Grid -->
        <div class="products-grid">
            <?php if (count($products) > 0): ?>
                <?php foreach ($products as $product): ?>
                    <div class="product-card">
                        <div class="product-image">
                            <?php if ($product['stock'] > 0): ?>
                                <span class="product-badge">Stokta</span>
                            <?php else: ?>
                                <span class="product-badge out-of-stock">Tükendi</span>
                            <?php endif; ?>
                            <a href="detail.php?id=<?php echo $product['id']; ?>">
                                <img src="../<?php echo htmlspecialchars($product['image_url']); ?>"
                                    alt="<?php echo htmlspecialchars($product['name']); ?>"
                                    onerror="this.src='https://via.placeholder.com/200x200?text=Ürün'">
                            </a>
                        </div>
                        <div class="product-info">
                            <span
                                class="product-category"><?php echo htmlspecialchars($product['category_name'] ?? 'Kategori'); ?></span>
                            <h3 class="product-title">
                                <a href="detail.php?id=<?php echo $product['id']; ?>">
                                    <?php echo htmlspecialchars($product['name']); ?>
                                </a>
                            </h3>
                            <div class="product-rating">
                                <span class="stars">
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="fas fa-star"></i>
                                    <i class="far fa-star"></i>
                                </span>
                                <span>(4.0)</span>
                            </div>
                            <div class="product-footer">
                                <span class="product-price">
                                    <?php echo number_format($product['price'], 0, ',', '.'); ?> <small>₺</small>
                                </span>
                                <a href="detail.php?id=<?php echo $product['id']; ?>" class="btn-view">
                                    İncele <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Ürün Bulunamadı</h3>
                    <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
                    <a href="products.php"><i class="fas fa-arrow-left"></i> Tüm Ürünlere Dön</a>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 TeknoStore. Web Programlama Dersi Projesi.</p>
    </footer>

    <script>
        const phpKullanici = {
            email: "<?php echo isset($_SESSION['user_email']) ? $_SESSION['user_email'] : ''; ?>",
            girisYapti: <?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>
        };
    </script>

    <script src="../JS/script.js"></script>

</body>

</html>