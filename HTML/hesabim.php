<?php
session_start();
require_once '../db.php';

// Kullanıcı giriş yapmamışsa login sayfasına yönlendir
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'] ?? 'Kullanıcı';
$user_email = $_SESSION['user_email'] ?? '';

// Kullanıcının siparişlerini çek
try {
    $sql = "SELECT o.*, 
                   (SELECT GROUP_CONCAT(CONCAT(p.name, ' (x', oi.quantity, ')') SEPARATOR ', ')
                    FROM order_items oi 
                    JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id) as items_summary
            FROM orders o 
            WHERE o.user_id = :user_id 
            ORDER BY o.created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $orders = [];
}

// Durum renkleri için yardımcı fonksiyon
function getStatusInfo($status)
{
    switch ($status) {
        case 'hazirlaniyor':
            return ['bg' => '#fef3c7', 'text' => '#92400e', 'label' => 'Hazırlanıyor', 'icon' => 'fa-clock'];
        case 'kargoda':
            return ['bg' => '#dbeafe', 'text' => '#1e40af', 'label' => 'Kargoda', 'icon' => 'fa-truck'];
        case 'teslim_edildi':
            return ['bg' => '#d1fae5', 'text' => '#065f46', 'label' => 'Teslim Edildi', 'icon' => 'fa-check-circle'];
        case 'iptal':
            return ['bg' => '#fee2e2', 'text' => '#991b1b', 'label' => 'İptal Edildi', 'icon' => 'fa-times-circle'];
        default:
            return ['bg' => '#f3f4f6', 'text' => '#374151', 'label' => $status, 'icon' => 'fa-question-circle'];
    }
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hesabım - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .account-container {
            max-width: 1000px;
            margin: 40px auto;
            padding: 0 20px;
        }

        .account-header {
            background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
            border-radius: 16px;
            padding: 30px;
            color: white;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .account-avatar {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
        }

        .account-info h1 {
            margin: 0 0 5px 0;
            font-size: 1.5rem;
        }

        .account-info p {
            margin: 0;
            opacity: 0.8;
            font-size: 0.95rem;
        }

        .section-title {
            font-size: 1.3rem;
            color: #1f2937;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title i {
            color: #2563eb;
        }

        .orders-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .order-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            transition: 0.2s;
        }

        .order-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }

        .order-id {
            font-weight: 700;
            color: #111827;
            font-size: 1.1rem;
        }

        .order-date {
            color: #6b7280;
            font-size: 0.85rem;
        }

        .order-status {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .order-items {
            color: #4b5563;
            font-size: 0.9rem;
            margin-bottom: 15px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
        }

        .order-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 15px;
            border-top: 1px solid #f3f4f6;
        }

        .order-total {
            font-size: 1.2rem;
            font-weight: 700;
            color: #059669;
        }

        .no-orders {
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
        }

        .no-orders i {
            font-size: 4rem;
            color: #d1d5db;
            margin-bottom: 20px;
        }

        .no-orders h3 {
            color: #374151;
            margin-bottom: 10px;
        }

        .no-orders p {
            color: #6b7280;
            margin-bottom: 20px;
        }

        .no-orders a {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
        }

        .no-orders a:hover {
            background: #1d4ed8;
        }

        .quick-actions {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }

        .action-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            text-decoration: none;
            color: inherit;
            transition: 0.2s;
        }

        .action-card:hover {
            border-color: #2563eb;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }

        .action-card i {
            font-size: 1.5rem;
            color: #2563eb;
            margin-bottom: 10px;
        }

        .action-card span {
            display: block;
            font-weight: 500;
            color: #374151;
        }

        @media (max-width: 768px) {
            .quick-actions {
                grid-template-columns: 1fr;
            }

            .order-header {
                flex-direction: column;
            }
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
                    <input type="text" name="ara" placeholder="Ürün ara...">
                    <button type="submit"><i class="fa fa-search"></i></button>
                </form>
            </div>
            <div class="user-actions">
                <div class="user-profile">
                    <i class="fa fa-user-circle"></i>
                    <span><?php echo htmlspecialchars($user_name); ?></span>
                </div>
                <a href="logout.php" class="btn-header-action btn-logout-client">
                    <i class="fa fa-sign-out-alt"></i> Çıkış
                </a>
            </div>
            <a href="cart.php" class="sepet-btn">
                <i class="fa fa-shopping-cart"></i> Sepetim (<span id="sepet-sayac">0</span>)
            </a>
        </div>
    </header>

    <div class="account-container">

        <!-- Kullanıcı Bilgileri -->
        <div class="account-header">
            <div class="account-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="account-info">
                <h1>Merhaba, <?php echo htmlspecialchars($user_name); ?>!</h1>
                <p><i class="fas fa-envelope"></i> <?php echo htmlspecialchars($user_email); ?></p>
            </div>
        </div>

        <!-- Hızlı Erişim -->
        <div class="quick-actions">
            <a href="products.php" class="action-card">
                <i class="fas fa-store"></i>
                <span>Alışverişe Devam Et</span>
            </a>
            <a href="cart.php" class="action-card">
                <i class="fas fa-shopping-cart"></i>
                <span>Sepetim</span>
            </a>
            <a href="index.php" class="action-card">
                <i class="fas fa-home"></i>
                <span>Ana Sayfa</span>
            </a>
        </div>

        <!-- Siparişlerim -->
        <h2 class="section-title"><i class="fas fa-box"></i> Siparişlerim</h2>

        <?php if (count($orders) == 0): ?>
            <div class="no-orders">
                <i class="fas fa-box-open"></i>
                <h3>Henüz siparişiniz yok</h3>
                <p>İlk siparişinizi vermek için alışverişe başlayın!</p>
                <a href="products.php"><i class="fas fa-shopping-bag"></i> Alışverişe Başla</a>
            </div>
        <?php else: ?>
            <div class="orders-list">
                <?php foreach ($orders as $order): ?>
                    <?php $statusInfo = getStatusInfo($order['status']); ?>
                    <div class="order-card">
                        <div class="order-header">
                            <div>
                                <div class="order-id">Sipariş #<?php echo $order['id']; ?></div>
                                <div class="order-date">
                                    <i class="far fa-calendar-alt"></i>
                                    <?php echo isset($order['created_at']) ? date('d.m.Y H:i', strtotime($order['created_at'])) : '-'; ?>
                                </div>
                            </div>
                            <span class="order-status"
                                style="background:<?php echo $statusInfo['bg']; ?>; color:<?php echo $statusInfo['text']; ?>;">
                                <i class="fas <?php echo $statusInfo['icon']; ?>"></i>
                                <?php echo $statusInfo['label']; ?>
                            </span>
                        </div>

                        <div class="order-items">
                            <strong>Ürünler:</strong>
                            <?php echo htmlspecialchars($order['items_summary'] ?? 'Ürün bilgisi yok'); ?>
                        </div>

                        <div class="order-footer">
                            <span style="color:#6b7280; font-size:0.9rem;">Toplam Tutar</span>
                            <span class="order-total"><?php echo number_format($order['total_amount'], 0, ',', '.'); ?> ₺</span>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <footer>
        <p>&copy; 2025 TeknoStore. Web Programlama Dersi Projesi.</p>
    </footer>

    <script>
        const phpKullanici = {
            email: "<?php echo $user_email; ?>",
            girisYapti: true
        };
    </script>
    <script src="../JS/script.js"></script>

</body>

</html>