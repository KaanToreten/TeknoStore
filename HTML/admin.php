<?php
session_start();
require_once '../db.php'; // Veritabanı bağlantısı

// GÜVENLİK KONTROLÜ
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
    // header("Location: login.php?mesaj=yetkisiz");
    // exit;
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
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        /* ADMIN PANELİ İÇİN ÖZEL CSS (Burası sayfanın düzgün görünmesini sağlayacak) */

        body {
            background-color: #f3f4f6;
            /* Açık gri arka plan */
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        /* HEADER */
        .admin-header {
            background-color: #1f2937;
            /* Koyu Lacivert */
            color: white;
            padding: 0 30px;
            height: 60px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
        }

        .admin-brand {
            font-size: 1.2rem;
            font-weight: 700;
        }

        .admin-brand span {
            font-weight: 300;
            color: #9ca3af;
            font-size: 0.9rem;
            margin-left: 5px;
        }

        .admin-btn-logout {
            color: #f87171;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .admin-btn-logout:hover {
            color: #ef4444;
        }

        /* ANA YAPI (LAYOUT) */
        .admin-wrapper {
            display: flex;
            margin-top: 60px;
            /* Header yüksekliği kadar boşluk */
            min-height: calc(100vh - 60px);
        }

        /* SIDEBAR (SOL MENÜ) */
        .admin-sidebar-nav {
            width: 250px;
            background-color: #ffffff;
            border-right: 1px solid #e5e7eb;
            padding: 20px 0;
            flex-shrink: 0;
            /* Menünün daralmasını engelle */
            position: fixed;
            /* Sabit durması için */
            height: 100%;
            overflow-y: auto;
        }

        .admin-menu-item {
            display: flex;
            align-items: center;
            padding: 12px 25px;
            color: #4b5563;
            text-decoration: none;
            font-weight: 500;
            transition: 0.2s;
        }

        .admin-menu-item i {
            width: 25px;
            text-align: center;
            margin-right: 10px;
        }

        .admin-menu-item:hover {
            background-color: #f3f4f6;
            color: #111827;
        }

        .admin-menu-item.active {
            background-color: #eff6ff;
            color: #2563eb;
            border-right: 3px solid #2563eb;
        }

        /* MAIN CONTENT (ORTA ALAN) */
        .admin-main-card {
            flex: 1;
            /* Kalan tüm alanı kapla */
            margin-left: 250px;
            /* Sidebar genişliği kadar it */
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        /* CARD HEADER (Başlık ve Buton) */
        .admin-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            width: 100%;
            max-width: 900px;
        }

        .admin-page-title {
            font-size: 1.5rem;
            /* Başlık boyutunu küçülttük */
            color: #111827;
            margin: 0;
        }

        .admin-btn-add {
            background-color: #10b981;
            /* Yeşil */
            color: white;
            padding: 10px 20px;
            /* Buton boyutunu küçülttük */
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
        }

        .admin-btn-add:hover {
            background-color: #059669;
        }

        /* TABLO TASARIMI */
        .admin-table-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            /* Köşelerin yuvarlak kalması için */
            border: 1px solid #e5e7eb;
            max-width: 900px;
            width: 100%;
        }

        .admin-products-table {
            width: 100%;
            border-collapse: collapse;
        }

        .admin-products-table th {
            background-color: #f9fafb;
            color: #6b7280;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px 20px;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
        }

        .admin-products-table td {
            padding: 12px 20px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
            font-size: 0.95rem;
            vertical-align: middle;
        }

        .admin-products-table tr:last-child td {
            border-bottom: none;
        }

        .admin-products-table tr:hover {
            background-color: #f9fafb;
        }

        /* Resim ve Stok Badge */
        .admin-product-img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
            background: white;
        }

        .admin-stock-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 700;
        }

        .text-green {
            background-color: #d1fae5;
            color: #065f46;
        }

        .text-red {
            background-color: #fee2e2;
            color: #991b1b;
        }

        /* İşlem Butonları (Küçük ikonlar) */
        .admin-actions {
            display: flex;
            gap: 8px;
        }

        .admin-btn-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            text-decoration: none;
            transition: 0.2s;
        }

        .admin-btn-edit {
            background-color: #fffbeb;
            color: #d97706;
        }

        .admin-btn-edit:hover {
            background-color: #fcd34d;
            color: #92400e;
        }

        .admin-btn-delete {
            background-color: #fef2f2;
            color: #ef4444;
        }

        .admin-btn-delete:hover {
            background-color: #fca5a5;
            color: #7f1d1d;
        }

        /* MESAJ KUTULARI */
        .admin-alert {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 6px;
            font-weight: 500;
            background-color: #ecfdf5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 900px;
            width: 100%;
        }
    </style>
</head>

<body>

    <header class="admin-header">
        <div class="admin-header-left">
            <div class="admin-brand">TeknoStore <span>Yönetim Paneli</span></div>
        </div>
        <div class="admin-header-right">
            <span style="margin-right: 15px; font-size: 0.9rem;">Yönetici</span>
            <a href="logout.php" class="admin-btn-logout">
                <i class="fas fa-sign-out-alt"></i> Çıkış
            </a>
        </div>
    </header>

    <div class="admin-wrapper">

        <aside class="admin-sidebar-nav">
            <a href="admin.php" class="admin-menu-item active">
                <i class="fas fa-box"></i> Ürünler
            </a>
            <a href="admin-orders.php" class="admin-menu-item">
                <i class="fas fa-shopping-cart"></i> Siparişler
            </a>
            <a href="admin-users.php" class="admin-menu-item">
                <i class="fas fa-users"></i> Kullanıcılar
            </a>
            <a href="index.php" target="_blank" class="admin-menu-item"
                style="border-top:1px solid #eee; margin-top:10px;">
                <i class="fas fa-external-link-alt"></i> Siteye Git
            </a>
        </aside>

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
                            <th width="70">Görsel</th>
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
                                    <td>#<?php echo $product['id']; ?></td>
                                    <td>
                                        <img src="../<?php echo htmlspecialchars($product['image_url']); ?>" alt="Ürün"
                                            class="admin-product-img" onerror="this.src='https://via.placeholder.com/50'">
                                    </td>
                                    <td style="font-weight:500; color:#111827;">
                                        <?php echo htmlspecialchars($product['name']); ?>
                                    </td>
                                    <td>
                                        <span
                                            style="background:#f3f4f6; color:#4b5563; padding:2px 8px; border-radius:4px; font-size:0.8rem;">
                                            <?php echo htmlspecialchars($product['category_name'] ?? '-'); ?>
                                        </span>
                                    </td>
                                    <td style="font-weight:600; color:#111827;">
                                        <?php echo number_format($product['price'], 0, ',', '.'); ?> ₺
                                    </td>
                                    <td>
                                        <span
                                            class="admin-stock-badge <?php echo $product['stock'] > 0 ? 'text-green' : 'text-red'; ?>">
                                            <?php echo $product['stock'] > 0 ? $product['stock'] . ' Adet' : 'Tükendi'; ?>
                                        </span>
                                    </td>
                                    <td>
                                        <div class="admin-actions">
                                            <a href="admin-edit.php?id=<?php echo $product['id']; ?>"
                                                class="admin-btn-icon admin-btn-edit" title="Düzenle">
                                                <i class="fas fa-pen" style="font-size:0.8rem;"></i>
                                            </a>
                                            <a href="?sil_id=<?php echo $product['id']; ?>"
                                                class="admin-btn-icon admin-btn-delete" title="Sil"
                                                onclick="return confirm('Bu ürünü silmek istediğinize emin misiniz?');">
                                                <i class="fas fa-trash" style="font-size:0.8rem;"></i>
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