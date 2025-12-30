<?php
session_start();
require_once '../db.php';

$mesaj = "";

// FORM GÖNDERİLDİ Mİ?
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // --- KAYIT OLMA İŞLEMİ (Sign Up) ---
    if (isset($_POST['islem']) && $_POST['islem'] == 'kayit') {
        $ad = $_POST['name'];
        $email = $_POST['email'];
        $sifre = $_POST['password'];

        // Şifreyi şifrele (Hashleme - Güvenlik İçin)
        // Ödevde "secure password" istenirse bu önemlidir.
        // $hashli_sifre = password_hash($sifre, PASSWORD_DEFAULT); 
        // Şimdilik düz kaydedelim ki SQL Injection demosunda işe yarasın:
        $hashli_sifre = $sifre;

        try {
            // E-posta var mı kontrol et
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);

            if ($stmt->rowCount() > 0) {
                $mesaj = "Bu e-posta adresi zaten kayıtlı!";
            } else {
                // Yeni kullanıcı ekle
                $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'customer')");
                if ($stmt->execute([$ad, $email, $hashli_sifre])) {
                    $mesaj = "Kayıt başarılı! Şimdi giriş yapabilirsiniz.";
                } else {
                    $mesaj = "Kayıt sırasında bir hata oluştu.";
                }
            }
        } catch (PDOException $e) {
            $mesaj = "Veritabanı hatası: " . $e->getMessage();
        }
    }

    // --- GİRİŞ YAPMA İŞLEMİ (Sign In) ---
    if (isset($_POST['islem']) && $_POST['islem'] == 'giris') {
        $email = $_POST['email'];
        $sifre = $_POST['password'];

        try {
            // Kullanıcıyı bul
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
            $stmt->execute([$email, $sifre]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // Oturumu Başlat
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['full_name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['user_role'] = $user['role']; // admin veya customer

                // Role göre yönlendir
                if ($user['role'] == 'admin') {
                    header("Location: admin.php");
                } else {
                    header("Location: index.php"); // Müşteriler ana sayfaya
                }
                exit;
            } else {
                $mesaj = "Hatalı e-posta veya şifre!";
            }
        } catch (PDOException $e) {
            $mesaj = "Hata: " . $e->getMessage();
        }
    }
}
?>

<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <title>Giriş Yap / Kayıt Ol - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</head>

<body>

    <header>
        <div class="container container-header">
            <div class="logo">
                <a href="index.php" style="text-decoration:none;">
                    <h1>TeknoStore</h1>
                </a>
            </div>
            <a href="index.php" class="sepet-btn">Ana Sayfaya Dön</a>
        </div>
    </header>

    <div class="auth-wrapper">
        <div class="container" id="container">

            <div class="form-container sign-up-container">
                <form action="login.php" method="POST">
                    <h1>Hesap Oluştur</h1>
                    <div class="social-container">
                        <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social"><i class="fab fa-google"></i></a>
                        <a href="#" class="social"><i class="fab fa-apple"></i></a>
                    </div>
                    <span>veya e-posta ile kayıt ol</span>

                    <input type="hidden" name="islem" value="kayit">
                    <input type="text" name="name" placeholder="Ad Soyad" required />
                    <input type="email" name="email" placeholder="E-Posta" required />
                    <input type="password" name="password" placeholder="Şifre" required />

                    <button type="submit">Kayıt Ol</button>
                    <?php if ($mesaj)
                        echo "<p style='color:red; font-size:12px;'>$mesaj</p>"; ?>
                </form>
            </div>

            <div class="form-container sign-in-container">
                <form action="login.php" method="POST">
                    <h1>Giriş Yap</h1>
                    <div class="social-container">
                        <a href="#" class="social"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="social"><i class="fab fa-google"></i></a>
                        <a href="#" class="social"><i class="fab fa-apple"></i></a>
                    </div>
                    <span>Hesabınızla giriş yapın</span>

                    <input type="hidden" name="islem" value="giris">
                    <input type="email" name="email" placeholder="E-Posta" required />
                    <input type="password" name="password" placeholder="Şifre" required />

                    <a href="#">Şifremi Unuttum?</a>
                    <button type="submit">Giriş Yap</button>


                    <?php if ($mesaj)
                        echo "<p style='color:red; font-size:12px;'>$mesaj</p>"; ?>
                </form>
            </div>

            <div class="overlay-container">
                <div class="overlay">
                    <div class="overlay-panel overlay-left">
                        <h1>Tekrar Hoşgeldiniz!</h1>
                        <p>Zaten bir hesabınız var mı? Giriş yaparak alışverişe devam edin.</p>
                        <button class="ghost" id="signIn">Giriş Yap</button>
                    </div>
                    <div class="overlay-panel overlay-right">
                        <h1>Merhaba, Arkadaş!</h1>
                        <p>Henüz hesabınız yok mu? Hemen kayıt olun ve fırsatları kaçırmayın.</p>
                        <button class="ghost" id="signUp">Kayıt Ol</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const phpKullanici = {
            email: "<?php echo isset($_SESSION['user_email']) ? $_SESSION['user_email'] : ''; ?>",
            girisYapti: <?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>
        };
    </script>

    <script src="../JS/script.js"></script>
</body>

</html>