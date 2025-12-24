<?php
session_start();
require_once '../db.php';

// GÜVENLİK KONTROLÜ
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] != 'admin') {
    header("Location: login.php?mesaj=yetkisiz");
    exit;
}

// Form gönderildi mi?
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $ad = $_POST['name'];
    $fiyat = $_POST['price'];
    $stok = $_POST['stock'];
    $kategori = $_POST['category_id'];
    $aciklama = $_POST['description'];

    // Resim Yükleme İşlemi
    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $izin_verilen_uzantilar = ['jpg', 'jpeg', 'png', 'webp'];
        $dosya_adi = basename($_FILES["image"]["name"]);
        $dosya_uzantisi = strtolower(pathinfo($dosya_adi, PATHINFO_EXTENSION));

        // Güvenlik: Uzantı Kontrolü
        if (!in_array($dosya_uzantisi, $izin_verilen_uzantilar)) {
            $hata = "Sadece JPG, JPEG, PNG ve WEBP formatları yüklenebilir.";
        }
        // Güvenlik: Boyut Kontrolü (Max 5MB)
        elseif ($_FILES["image"]["size"] > 5000000) {
            $hata = "Dosya boyutu çok yüksek! (Max 5MB)";
        } else {
            // Benzersiz isim oluştur (Çakışmayı önlemek için)
            $yeni_dosya_adi = uniqid() . "." . $dosya_uzantisi;
            $hedef_klasor = "../IMG/";
            $hedef_dosya = $hedef_klasor . $yeni_dosya_adi;

            if (move_uploaded_file($_FILES["image"]["tmp_name"], $hedef_dosya)) {
                // Veritabanına kaydet
                $db_resim_yolu = "IMG/" . $yeni_dosya_adi;

                try {
                    $stmt = $pdo->prepare("INSERT INTO products (name, category_id, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$ad, $kategori, $aciklama, $fiyat, $stok, $db_resim_yolu]);

                    header("Location: admin.php?mesaj=eklendi");
                    exit;
                } catch (PDOException $e) {
                    $hata = "Veritabanı hatası: " . $e->getMessage();
                }
            } else {
                $hata = "Resim yüklenirken bir hata oluştu. Klasör izinlerini kontrol edin.";
            }
        }
    } else {
        $hata = "Lütfen bir resim seçin.";
    }
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <title>Yeni Ürün Ekle - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
</head>

<body>
    <div class="container" style="max-width: 600px; margin-top: 50px;">
        <h2>Yeni Ürün Ekle</h2>
        <?php if (isset($hata))
            echo "<p style='color:red'>$hata</p>"; ?>

        <form method="POST" enctype="multipart/form-data" class="adres-formu">
            <div class="form-grup">
                <label>Ürün Adı:</label>
                <input type="text" name="name" required>
            </div>

            <div class="form-grup">
                <label>Kategori:</label>
                <select name="category_id" style="width:100%; padding:10px;">
                    <option value="1">Bilgisayar</option>
                    <option value="2">Telefon</option>
                    <option value="3">Aksesuar</option>
                    <option value="4">Tablet</option>
                </select>
            </div>

            <div class="form-grup">
                <label>Fiyat (TL):</label>
                <input type="number" name="price" step="0.01" required>
            </div>

            <div class="form-grup">
                <label>Stok Adedi:</label>
                <input type="number" name="stock" required>
            </div>

            <div class="form-grup">
                <label>Açıklama:</label>
                <textarea name="description" rows="4"></textarea>
            </div>

            <div class="form-grup">
                <label>Ürün Resmi:</label>
                <input type="file" name="image" required>
            </div>

            <button type="submit" class="odeme-btn">Ürünü Kaydet</button>
            <a href="admin.php" style="display:block; text-align:center; margin-top:10px;">İptal</a>
        </form>
    </div>

    <script src="../JS/script.js"></script>
</body>

</html>