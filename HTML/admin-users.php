<?php
session_start();
require_once '../db.php';

// GÜVENLİK KONTROLÜ
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
    // header("Location: login.php?mesaj=yetkisiz");
    // exit;
}

// YORUM SİLME İŞLEMİ
// Not: Yorumlar 1NF violation formatında saklandığı için silme işlemi biraz karmaşık
// Bu örnekte basit tutuyoruz

// KULLANICILARI LİSTELE
try {
    $sql = "SELECT u.*, 
                   (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
            FROM users u 
            ORDER BY u.id DESC";
    $stmt = $pdo->query($sql);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Kullanıcı çekme hatası: " . $e->getMessage());
}

// TÜM YORUMLARI LİSTELE
try {
    $sql = "SELECT pr.*, p.name as product_name, p.image_url
            FROM product_reviews_1nf pr 
            LEFT JOIN products p ON pr.product_id = p.id 
            ORDER BY pr.product_id DESC";
    $stmt = $pdo->query($sql);
    $reviews_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Yorumları parse et
    $all_reviews = [];
    foreach ($reviews_raw as $row) {
        $reviews_array = explode("###", $row['all_reviews']);
        foreach ($reviews_array as $rev_str) {
            $parts = explode("|", $rev_str);
            if (count($parts) >= 3) {
                $all_reviews[] = [
                    'product_id' => $row['product_id'],
                    'product_name' => $row['product_name'],
                    'product_image' => $row['image_url'],
                    'user' => $parts[0],
                    'rating' => $parts[1],
                    'comment' => $parts[2]
                ];
            }
        }
    }
} catch (PDOException $e) {
    $all_reviews = [];
}

// Rol için badge
function getRoleBadge($role)
{
    if ($role == 'admin') {
        return ['bg' => '#fef3c7', 'text' => '#92400e', 'label' => 'Admin'];
    }
    return ['bg' => '#dbeafe', 'text' => '#1e40af', 'label' => 'Müşteri'];
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <title>Kullanıcı Yönetimi - TeknoStore Admin</title>
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

        /* Tab Navigation */
        .tab-navigation {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            max-width: 1000px;
            width: 100%;
        }

        .tab-btn {
            padding: 10px 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 500;
            cursor: pointer;
            transition: 0.2s;
            color: #4b5563;
        }

        .tab-btn:hover {
            background: #f9fafb;
        }

        .tab-btn.active {
            background: #2563eb;
            color: white;
            border-color: #2563eb;
        }

        .tab-content {
            display: none;
            max-width: 1000px;
            width: 100%;
        }

        .tab-content.active {
            display: block;
        }

        .admin-table-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #e5e7eb;
            width: 100%;
        }

        .admin-table {
            width: 100%;
            border-collapse: collapse;
        }

        .admin-table th {
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

        .admin-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
            font-size: 0.9rem;
            vertical-align: middle;
        }

        .admin-table tr:last-child td {
            border-bottom: none;
        }

        .admin-table tr:hover {
            background-color: #f9fafb;
        }

        .role-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            display: inline-block;
        }

        /* Review Card */
        .review-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
        }

        .review-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .review-product {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .review-product img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }

        .review-product-name {
            font-weight: 600;
            color: #111827;
            font-size: 0.95rem;
        }

        .review-user {
            font-size: 0.85rem;
            color: #6b7280;
        }

        .review-stars {
            color: #fbbf24;
        }

        .review-comment {
            color: #374151;
            font-size: 0.9rem;
            line-height: 1.5;
            padding: 10px;
            background: #f9fafb;
            border-radius: 6px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 25px;
            max-width: 1000px;
            width: 100%;
        }

        .stat-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
        }

        .stat-label {
            font-size: 0.85rem;
            color: #6b7280;
            margin-top: 5px;
        }

        .user-avatar {
            width: 35px;
            height: 35px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
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
            <a href="admin-orders.php" class="admin-menu-item">
                <i class="fas fa-shopping-cart"></i> Siparişler
            </a>
            <a href="admin-users.php" class="admin-menu-item active">
                <i class="fas fa-users"></i> Kullanıcılar
            </a>
            <a href="index.php" target="_blank" class="admin-menu-item"
                style="border-top:1px solid #eee; margin-top:10px;">
                <i class="fas fa-external-link-alt"></i> Siteye Git
            </a>
        </aside>

        <main class="admin-main-card">

            <!-- İstatistikler -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" style="color:#2563eb;"><?php echo count($users); ?></div>
                    <div class="stat-label"><i class="fas fa-users"></i> Toplam Kullanıcı</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color:#059669;"><?php echo count($all_reviews); ?></div>
                    <div class="stat-label"><i class="fas fa-comment"></i> Toplam Yorum</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" style="color:#f59e0b;">
                        <?php
                        $totalRating = 0;
                        foreach ($all_reviews as $r) {
                            $totalRating += intval($r['rating']);
                        }
                        echo count($all_reviews) > 0 ? number_format($totalRating / count($all_reviews), 1) : '0';
                        ?>
                    </div>
                    <div class="stat-label"><i class="fas fa-star"></i> Ortalama Puan</div>
                </div>
            </div>

            <!-- Tab Navigation -->
            <div class="tab-navigation">
                <button class="tab-btn active" onclick="switchTab('users')">
                    <i class="fas fa-users"></i> Kullanıcılar (<?php echo count($users); ?>)
                </button>
                <button class="tab-btn" onclick="switchTab('reviews')">
                    <i class="fas fa-comments"></i> Yorumlar (<?php echo count($all_reviews); ?>)
                </button>
            </div>

            <!-- Kullanıcılar Tab -->
            <div id="users-tab" class="tab-content active">
                <div class="admin-table-container">
                    <table class="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kullanıcı</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Sipariş Sayısı</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (count($users) == 0): ?>
                                <tr>
                                    <td colspan="5" style="text-align:center; padding:30px; color:#9ca3af;">
                                        Henüz kayıtlı kullanıcı yok.
                                    </td>
                                </tr>
                            <?php else: ?>
                                <?php foreach ($users as $user): ?>
                                    <?php $roleInfo = getRoleBadge($user['role'] ?? 'customer'); ?>
                                    <tr>
                                        <td style="font-weight:500;">#<?php echo $user['id']; ?></td>
                                        <td>
                                            <div style="display:flex; align-items:center; gap:10px;">
                                                <div class="user-avatar">
                                                    <?php echo strtoupper(substr($user['full_name'] ?? 'U', 0, 1)); ?>
                                                </div>
                                                <span style="font-weight:500; color:#111827;">
                                                    <?php echo htmlspecialchars($user['full_name'] ?? 'İsimsiz'); ?>
                                                </span>
                                            </div>
                                        </td>
                                        <td style="color:#6b7280;"><?php echo htmlspecialchars($user['email']); ?></td>
                                        <td>
                                            <span class="role-badge"
                                                style="background:<?php echo $roleInfo['bg']; ?>; color:<?php echo $roleInfo['text']; ?>;">
                                                <?php echo $roleInfo['label']; ?>
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                style="background:#f3f4f6; padding:3px 8px; border-radius:4px; font-size:0.85rem;">
                                                <?php echo $user['order_count']; ?> sipariş
                                            </span>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Yorumlar Tab -->
            <div id="reviews-tab" class="tab-content">
                <?php if (count($all_reviews) == 0): ?>
                    <div class="admin-table-container" style="padding:40px; text-align:center; color:#9ca3af;">
                        <i class="fas fa-comment-slash" style="font-size:2rem; margin-bottom:10px;"></i>
                        <p>Henüz yorum yapılmamış.</p>
                    </div>
                <?php else: ?>
                    <?php foreach (array_reverse($all_reviews) as $review): ?>
                        <div class="review-card">
                            <div class="review-header">
                                <div class="review-product">
                                    <img src="../<?php echo htmlspecialchars($review['product_image'] ?? 'images/placeholder.png'); ?>"
                                        alt="Ürün" onerror="this.src='https://via.placeholder.com/50'">
                                    <div>
                                        <div class="review-product-name">
                                            <a href="detail.php?id=<?php echo $review['product_id']; ?>"
                                                style="color:#111827; text-decoration:none;">
                                                <?php echo htmlspecialchars($review['product_name'] ?? 'Ürün'); ?>
                                            </a>
                                        </div>
                                        <div class="review-user">
                                            <i class="fas fa-user"></i> <?php echo htmlspecialchars($review['user']); ?>
                                        </div>
                                    </div>
                                </div>
                                <div class="review-stars">
                                    <?php
                                    for ($i = 0; $i < 5; $i++) {
                                        if ($i < $review['rating'])
                                            echo '<i class="fas fa-star"></i>';
                                        else
                                            echo '<i class="far fa-star"></i>';
                                    }
                                    ?>
                                    <span style="color:#6b7280; font-size:0.85rem; margin-left:5px;">
                                        (<?php echo $review['rating']; ?>/5)
                                    </span>
                                </div>
                            </div>
                            <div class="review-comment">
                                "<?php echo htmlspecialchars($review['comment']); ?>"
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>

        </main>
    </div>

    <script>
        function switchTab(tabName) {
            // Tüm tab buttonlarından active kaldır
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            // Tüm tab içeriklerini gizle
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            // Tıklanan tab'ı aktif et
            event.currentTarget.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
        }
    </script>

</body>

</html>