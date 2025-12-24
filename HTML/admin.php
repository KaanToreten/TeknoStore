<?php
session_start();
require_once '../db.php'; // Veritabanı bağlantısı

// GÜVENLİK KONTROLÜ
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
    header("Location: login.php?mesaj=yetkisiz");
    exit;
}

// SİLME İŞLEMİ
if (isset($_GET['sil_id'])) {
    $id = $_GET['sil_id'];
    try {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
        $stmt->execute(['id' => $id]);
        header("Location: admin.php?mesaj=silindi");
        exit;
    } catch (PDOException $e) {
        $hata = "Silme hatası: " . $e->getMessage();
    }
}

// LİSTELEME İŞLEMİ
try {
    $sql = "SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            ORDER BY p.id DESC";
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
    <title>Admin Paneli - TeknoStore</title>
    <!-- CSS Dosyasını Versiyonlayarak Cache Sorununu Çözüyoruz -->
    <link rel="stylesheet" href="../CSS/style.css?v=<?php echo time(); ?>">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>

    <header class="admin-header">
        <div class="admin-header-left">
            <div class="admin-brand">TeknoStore <span>Yönetim Paneli</span></div>
        </div>
        <div class="admin-header-right">
            <span class="admin-user-info">Hoşgeldin, Yönetici</span>
            <a href="logout.php" class="admin-btn-logout">
                <i class="fas fa-sign-out-alt"></i> Çıkış
            </a>
        </div>
    </header>

    <div class="admin-wrapper">

        <!-- SIDEBAR -->
        <aside class="admin-sidebar-nav">
            <a href="admin.php" class="admin-menu-item active">
                <i class="fas fa-box"></i> Ürünler
            </a>
            <a href="#" class="admin-menu-item">
                <i class="fas fa-shopping-cart"></i> Siparişler
            </a>
            <a href="#" class="admin-menu-item">
                <i class="fas fa-users"></i> Kullanıcılar
            </a>
            <a href="#" class="admin-menu-item">
                <i class="fas fa-comments"></i> Yorumlar
            </a>
            <a href="#" class="admin-menu-item">
                <i class="fas fa-chart-line"></i> Raporlar
            </a>
            <a href="#" class="admin-menu-item">
                <i class="fas fa-cog"></i> Ayarlar
            </a>
            <div style="margin-top:20px; border-top:1px solid #e5e7eb; padding-top:10px;">
                <a href="index.php" target="_blank" class="admin-menu-item">
                    <i class="fas fa-external-link-alt"></i> Siteyi Gör
                </a>
            </div>
        </aside>

        <!-- MAIN CONTENT -->
        <main class="admin-main-card">

            <div class="admin-card-header">
                <h2 class="admin-page-title">Ürün Yönetimi</h2>
                <a href="admin-add.php" class="admin-btn-add">
                    <i class="fas fa-plus"></i> Yeni Ürün Ekle
                </a>
            </div>

            <?php if (isset($_GET['mesaj'])): ?>
                <?php if ($_GET['mesaj'] == 'silindi'): ?>
                    <div class="admin-alert"><i class="fas fa-check-circle"></i> Ürün başarıyla silindi!</div>
                <?php elseif ($_GET['mesaj'] == 'eklendi'): ?>
                    <div class="admin-alert"><i class="fas fa-check-circle"></i> Yeni ürün başarıyla eklendi!</div>
                <?php elseif ($_GET['mesaj'] == 'guncellendi'): ?>
                    <div class="admin-alert"><i class="fas fa-check-circle"></i> Ürün bilgileri güncellendi!</div>
                <?php endif; ?>
            <?php endif; ?>

            <div class="admin-table-container">
                <table class="admin-products-table">
                    <thead>
                        <tr>
                            <th width="50">ID</th>
                            <th width="80">Resim</th>
                            <th>Ürün Adı</th>
                            <th>Kategori</th>
                            <th>Fiyat</th>
                            <th>Stok</th>
                            <th width="100">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (count($products) == 0): ?>
                            <tr>
                                <td colspan="7" style="text-align:center; padding:30px; color:#9ca3af;">
                                    Henüz hiç ürün eklenmemiş.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($products as $product): ?>
                                <tr>
                                    <td style="color:#6b7280;">#<?php echo $product['id']; ?></td>
                                    <td>
                                        <img src="../<?php echo htmlspecialchars($product['image_url']); ?>" alt="Ürün"
                                            class="admin-product-img" onerror="this.src='https://via.placeholder.com/50'">
                                    </td>
                                    <td style="font-weight:500;"><?php echo htmlspecialchars($product['name']); ?></td>
                                    <td>
                                        <span
                                            style="background:#f1f5f9; padding:4px 10px; border-radius:4px; font-size:0.85rem;">
                                            <?php echo htmlspecialchars($product['category_name'] ?? '-'); ?>
                                        </span>
                                    </td>
                                    <td style="font-weight:600;"><?php echo number_format($product['price'], 0, ',', '.'); ?> ₺
                                    </td>
                                    <td>
                                        <span
                                            class="admin-stock-badge <?php echo $product['stock'] > 0 ? 'text-green' : 'text-red'; ?>">
                                            <?php echo $product['stock']; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="admin-actions">
                                            <a href="admin-edit.php?id=<?php echo $product['id']; ?>"
                                                class="admin-btn-icon admin-btn-edit" title="Düzenle">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <a href="?sil_id=<?php echo $product['id']; ?>"
                                                class="admin-btn-icon admin-btn-delete" title="Sil"
                                                onclick="return confirm('Bu ürünü silmek istediğinize emin misiniz?');">
                                                <i class="fas fa-trash-alt"></i>
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>

        </main>
    </div>

</body>

</html>