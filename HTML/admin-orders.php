<?php
session_start();
require_once '../db.php';

// GÜVENLİK KONTROLÜ
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
    // header("Location: login.php?mesaj=yetkisiz");
    // exit;
}

// SİPARİŞ DURUMU GÜNCELLEME
if (isset($_POST['update_status'])) {
    $order_id = $_POST['order_id'];
    $new_status = $_POST['status'];
    try {
        $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
        $stmt->execute(['status' => $new_status, 'id' => $order_id]);
        header("Location: admin-orders.php?mesaj=guncellendi");
        exit;
    } catch (PDOException $e) {
        $hata = "Güncelleme hatası: " . $e->getMessage();
    }
}

try {
    // DÜZELTİLMİŞ HALİ
    // Veritabanındaki sütun adı 'full_name' olduğu için onu kullanıyoruz.
    $sql = "SELECT o.*, u.full_name as user_name, u.email as user_email,
                   (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC 
            LIMIT 0, 25";

    $stmt = $pdo->query($sql);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Veri çekme hatası: " . $e->getMessage());
}

// Durum renkleri için yardımcı fonksiyon
function getStatusColor($status)
{
    switch ($status) {
        case 'hazirlaniyor':
            return ['bg' => '#fef3c7', 'text' => '#92400e', 'label' => 'Hazırlanıyor'];
        case 'kargoda':
            return ['bg' => '#dbeafe', 'text' => '#1e40af', 'label' => 'Kargoda'];
        case 'teslim_edildi':
            return ['bg' => '#d1fae5', 'text' => '#065f46', 'label' => 'Teslim Edildi'];
        case 'iptal':
            return ['bg' => '#fee2e2', 'text' => '#991b1b', 'label' => 'İptal Edildi'];
        default:
            return ['bg' => '#f3f4f6', 'text' => '#374151', 'label' => $status];
    }
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <title>Sipariş Yönetimi - TeknoStore Admin</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        body {
            background-color: #f3f4f6;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }

        .admin-header {
            background-color: #1f2937;
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

        .admin-wrapper {
            display: flex;
            margin-top: 60px;
            min-height: calc(100vh - 60px);
        }

        .admin-sidebar-nav {
            width: 250px;
            background-color: #ffffff;
            border-right: 1px solid #e5e7eb;
            padding: 20px 0;
            flex-shrink: 0;
            position: fixed;
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

        .admin-main-card {
            flex: 1;
            margin-left: 250px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .admin-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            width: 100%;
            max-width: 1000px;
        }

        .admin-page-title {
            font-size: 1.5rem;
            color: #111827;
            margin: 0;
        }

        .admin-table-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #e5e7eb;
            max-width: 1000px;
            width: 100%;
        }

        .admin-orders-table {
            width: 100%;
            border-collapse: collapse;
        }

        .admin-orders-table th {
            background-color: #f9fafb;
            color: #6b7280;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid #e5e7eb;
        }

        .admin-orders-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
            font-size: 0.9rem;
            vertical-align: middle;
        }

        .admin-orders-table tr:last-child td {
            border-bottom: none;
        }

        .admin-orders-table tr:hover {
            background-color: #f9fafb;
        }

        .status-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
        }

        .status-select {
            padding: 6px 10px;
            border-radius: 6px;
            border: 1px solid #d1d5db;
            font-size: 0.85rem;
            cursor: pointer;
            background: white;
        }

        .btn-update {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            cursor: pointer;
            font-weight: 500;
        }

        .btn-update:hover {
            background-color: #1d4ed8;
        }

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
            max-width: 1000px;
            width: 100%;
        }

        .order-details-btn {
            background: #f3f4f6;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            color: #374151;
        }

        .order-details-btn:hover {
            background: #e5e7eb;
        }

        /* Modal */
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 25px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 15px;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }

        .order-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .order-item img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
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
            <a href="admin.php" class="admin-menu-item">
                <i class="fas fa-box"></i> Ürünler
            </a>
            <a href="admin-orders.php" class="admin-menu-item active">
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
                <h2 class="admin-page-title">Sipariş Yönetimi</h2>
                <div style="font-size: 0.9rem; color: #6b7280;">
                    <i class="fas fa-box-open"></i> Toplam <?php echo count($orders); ?> sipariş
                </div>
            </div>

            <?php if (isset($_GET['mesaj']) && $_GET['mesaj'] == 'guncellendi'): ?>
                <div class="admin-alert"><i class="fas fa-check-circle"></i> Sipariş durumu güncellendi!</div>
            <?php endif; ?>

            <div class="admin-table-container">
                <table class="admin-orders-table">
                    <thead>
                        <tr>
                            <th>Sipariş No</th>
                            <th>Müşteri</th>
                            <th>Tutar</th>
                            <th>Ürün Sayısı</th>
                            <th>Durum</th>
                            <th>Tarih</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (count($orders) == 0): ?>
                            <tr>
                                <td colspan="7" style="text-align:center; padding:30px; color:#9ca3af;">
                                    Henüz sipariş yok.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($orders as $order): ?>
                                <?php $statusInfo = getStatusColor($order['status']); ?>
                                <tr>
                                    <td style="font-weight:600;">#<?php echo $order['id']; ?></td>
                                    <td>
                                        <div style="font-weight:500; color:#111827;">
                                            <?php echo htmlspecialchars($order['user_name'] ?? 'Misafir'); ?>
                                        </div>
                                        <div style="font-size:0.8rem; color:#6b7280;">
                                            <?php echo htmlspecialchars($order['user_email'] ?? '-'); ?>
                                        </div>
                                    </td>
                                    <td style="font-weight:600; color:#059669;">
                                        <?php echo number_format($order['total_amount'], 0, ',', '.'); ?> ₺
                                    </td>
                                    <td>
                                        <span
                                            style="background:#f3f4f6; padding:3px 8px; border-radius:4px; font-size:0.85rem;">
                                            <?php echo $order['item_count']; ?> ürün
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge"
                                            style="background:<?php echo $statusInfo['bg']; ?>; color:<?php echo $statusInfo['text']; ?>;">
                                            <?php echo $statusInfo['label']; ?>
                                        </span>
                                    </td>
                                    <td style="font-size:0.85rem; color:#6b7280;">
                                        <?php echo isset($order['created_at']) ? date('d.m.Y H:i', strtotime($order['created_at'])) : '-'; ?>
                                    </td>
                                    <td>
                                        <form method="POST" style="display:flex; gap:5px; align-items:center;">
                                            <input type="hidden" name="order_id" value="<?php echo $order['id']; ?>">
                                            <select name="status" class="status-select">
                                                <option value="hazirlaniyor" <?php echo $order['status'] == 'hazirlaniyor' ? 'selected' : ''; ?>>Hazırlanıyor</option>
                                                <option value="kargoda" <?php echo $order['status'] == 'kargoda' ? 'selected' : ''; ?>>Kargoda</option>
                                                <option value="teslim_edildi" <?php echo $order['status'] == 'teslim_edildi' ? 'selected' : ''; ?>>Teslim Edildi</option>
                                                <option value="iptal" <?php echo $order['status'] == 'iptal' ? 'selected' : ''; ?>>İptal</option>
                                            </select>
                                            <button type="submit" name="update_status" class="btn-update">
                                                <i class="fas fa-save"></i>
                                            </button>
                                        </form>
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