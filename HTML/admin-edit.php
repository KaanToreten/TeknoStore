<?php
session_start();
require_once '../db.php';

// GÜVENLİK KONTROLÜ
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
    header("Location: login.php?mesaj=yetkisiz");
    exit;
}

if (!isset($_GET['id'])) {
    header("Location: admin.php");
    exit;
}

$id = $_GET['id'];

// Mevcut veriyi çek
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$urun = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$urun)
    die("Ürün bulunamadı!");

// Güncelleme İşlemi
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $ad = $_POST['name'];
    $fiyat = $_POST['price'];
    $stok = $_POST['stock'];
    $aciklama = $_POST['description'];

    // Değerleri diziye at (Dinamik SQL için)
    $params = [$ad, $fiyat, $stok, $aciklama];
    $sql = "UPDATE products SET name=?, price=?, stock=?, description=?";

    // Eğer yeni resim yüklenmişse
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $izin_verilen_uzantilar = ['jpg', 'jpeg', 'png', 'webp'];
        $dosya_adi = basename($_FILES["image"]["name"]);
        $dosya_uzantisi = strtolower(pathinfo($dosya_adi, PATHINFO_EXTENSION));

        // Güvenlik: Uzantı ve Boyut Kontrolü
        if (in_array($dosya_uzantisi, $izin_verilen_uzantilar) && $_FILES["image"]["size"] <= 5000000) {
            $yeni_dosya_adi = uniqid() . "." . $dosya_uzantisi;
            $hedef_klasor = "../IMG/";

            if (move_uploaded_file($_FILES["image"]["tmp_name"], $hedef_klasor . $yeni_dosya_adi)) {
                $sql .= ", image_url=?";
                $params[] = "IMG/" . $yeni_dosya_adi;
            }
        }
    }

    $sql .= " WHERE id=?";
    $params[] = $id;

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        header("Location: admin.php?mesaj=guncellendi");
        exit;
    } catch (PDOException $e) {
        die("Hata: " . $e->getMessage());
    }
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <title>Ürün Düzenle - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
</head>

<body>
    <div class="container" style="max-width: 600px; margin-top: 50px;">
        <h2>Ürün Düzenle</h2>

        <form method="POST" enctype="multipart/form-data" class="adres-formu">
            <div class="form-grup">
                <label>Ürün Adı:</label>
                <input type="text" name="name" value="<?php echo htmlspecialchars($urun['name']); ?>" required>
            </div>

            <div class="form-grup">
                <label>Fiyat (TL):</label>
                <input type="number" name="price" step="0.01" value="<?php echo $urun['price']; ?>" required>
            </div>

            <div class="form-grup">
                <label>Stok Adedi:</label>
                <input type="number" name="stock" value="<?php echo $urun['stock']; ?>" required>
            </div>

            <div class="form-grup">
                <label>Açıklama:</label>
                <textarea name="description" rows="4"><?php echo htmlspecialchars($urun['description']); ?></textarea>
            </div>

            <div class="form-grup">
                <label>Yeni Resim (Opsiyonel):</label>
                <input type="file" name="image">
                <p>Mevcut: <img src="../<?php echo htmlspecialchars($urun['image_url']); ?>" width="50"></p>
            </div>

            <button type="submit" class="odeme-btn" style="background-color:#3b82f6;">Güncelle</button>
            <a href="admin.php" style="display:block; text-align:center; margin-top:10px;">İptal</a>
        </form>
    </div>

    <script src="../JS/script.js"></script>
</body>

</html>