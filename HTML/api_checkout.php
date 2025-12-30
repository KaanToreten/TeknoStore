<?php
session_start();
require_once '../db.php';
header('Content-Type: application/json');

// Kullanıcı giriş yapmış mı?
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Lütfen önce giriş yapın.']);
    exit;
}

// JSON verisini al
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'Veri gelmedi.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$adres = $data['adres'];
$sepet = $data['sepet'];
$toplam_tutar = $data['toplam'];

try {
    $pdo->beginTransaction();

    // 1. Siparişi 'orders' tablosuna ekle
    $stmt = $pdo->prepare("INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'hazirlaniyor')");
    $stmt->execute([$user_id, $toplam_tutar]);

    // Yeni oluşturulan siparişin ID'sini al
    $order_id = $pdo->lastInsertId();

    // 2. Sepetteki her ürünü 'order_items' tablosuna ekle ve stoktan düş
    $stmt_item = $pdo->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)");
    $stmt_stock = $pdo->prepare("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");

    foreach ($sepet as $urun) {
        // Sipariş detayını kaydet
        $stmt_item->execute([
            $order_id,
            $urun['id'],
            $urun['adet'],
            $urun['fiyat']
        ]);

        // Stoktan düş
        $stmt_stock->execute([
            $urun['adet'],  // Düşülecek miktar
            $urun['id'],    // Ürün ID
            $urun['adet']   // Stok kontrolü (stok >= adet olmalı)
        ]);
    }

    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Siparişiniz alındı!', 'order_id' => $order_id]);

} catch (PDOException $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Veritabanı hatası: ' . $e->getMessage()]);
}
?>