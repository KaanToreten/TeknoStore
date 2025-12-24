<?php
session_start();
require_once '../db.php';

// Giriş kontrolü
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$user_name = $_SESSION['user_name'];

// Kullanıcının siparişlerini çek
try {
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $siparisler = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Hata: " . $e->getMessage());
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <title>Hesabım - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>

<body>

    <header>
        <div class="container" style="display:flex; justify-content:space-between; align-items:center; height:80px;">
            <div class="logo"><a href="index.php" style="text-decoration:none;">
                    <h1>TeknoStore</h1>
                </a></div>
            <div>
                <a href="products.php" class="sepet-btn">Alışverişe Dön</a>
                <a href="logout.php" class="sepet-btn" style="background:#ef4444; color:white; border:none;">Çıkış</a>
            </div>
        </div>
    </header>

    <div class="container" style="margin-top:30px;">
        <h2>Merhaba, <?php echo htmlspecialchars($user_name); ?></h2>

        <h3 style="margin-top:30px; border-bottom:1px solid #ddd; padding-bottom:10px;">Sipariş Geçmişim</h3>

        <?php if (count($siparisler) > 0): ?>
            <table class="taksit-tablosu" style="margin-top:20px;">
                <thead>
                    <tr>
                        <th>Sipariş No</th>
                        <th>Tarih</th>
                        <th>Tutar</th>
                        <th>Durum</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($siparisler as $siparis): ?>
                        <tr>
                            <td>#<?php echo $siparis['id']; ?></td>
                            <td><?php echo date("d.m.Y H:i", strtotime($siparis['created_at'])); ?></td>
                            <td><?php echo number_format($siparis['total_amount'], 2); ?> ₺</td>
                            <td>
                                <span
                                    style="padding:5px 10px; border-radius:15px; font-size:0.8rem; font-weight:bold;
                                background: <?php echo ($siparis['status'] == 'teslim_edildi' ? '#dcfce7' : '#fff7ed'); ?>;
                                color: <?php echo ($siparis['status'] == 'teslim_edildi' ? '#166534' : '#c2410c'); ?>;">
                                    <?php echo ucfirst($siparis['status']); ?>
                                </span>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <p style="margin-top:20px; color:#666;">Henüz verilmiş bir siparişiniz yok.</p>
        <?php endif; ?>
    </div>

    <script src="../JS/script.js"></script>
</body>

</html>