<?php
session_start();
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sepetim - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
                <input type="text" placeholder="Ürün ara...">
                <button type="button"><i class="fa fa-search"></i></button>
            </div>
            <div class="hesap-menu">
                <?php if (isset($_SESSION['user_id'])): ?>
                    <a href="account.php" style="font-weight:bold; color:var(--primary-color);">
                        <i class="fa fa-user-circle"></i> <?php echo htmlspecialchars($_SESSION['user_name']); ?>
                    </a>
                    <div class="dropdown-menu">
                        <a href="account.php">Siparişlerim</a>
                        <a href="logout.php">Çıkış Yap</a>
                    </div>
                <?php else: ?>
                    <a href="login.php" id="giris-link"><i class="fa fa-user"></i> Giriş Yap / Kayıt Ol</a>
                <?php endif; ?>
            </div>
            <a href="cart.php" class="sepet-btn">
                <i class="fa fa-shopping-cart"></i> Sepetim (<span id="sepet-sayac">0</span>)
            </a>
        </div>
    </header>

    <main class="container" style="flex-direction: column; margin-top: 30px; margin-bottom: 50px;">
        <h2 class="sayfa-basligi" style="text-align: center;">Sepetim</h2>

        <div class="sepet-wrapper">
            <div class="sepet-listesi">
            </div>

            <div class="sepet-ozeti" style="display: none;">
                <div class="ozet-kutu">
                    <h3>Sipariş Özeti</h3>
                    <div class="ozet-satir">
                        <span>Ara Toplam</span>
                        <span id="ara-toplam">0,00 TL</span>
                    </div>

                    <div class="kupon-wrapper">
                        <input type="text" id="kupon-kodu" placeholder="Kupon Kodu Giriniz..." autocomplete="off">
                        <button onclick="kuponUygula()" class="btn-kupon">UYGULA</button>
                    </div>
                    <div id="kupon-mesaj" class="kupon-mesaj"></div>

                    <div class="ozet-satir">
                        <span>Kargo</span>
                        <span style="color: green;">Bedava</span>
                    </div>

                    <div class="ozet-satir indirim" id="indirim-satiri"
                        style="display: none; color: var(--primary-color);">
                        <span>İndirim (<span id="indirim-orani">%0</span>)</span>
                        <span id="indirim-tutari">-0,00 TL</span>
                    </div>

                    <hr>

                    <div class="ozet-satir toplam">
                        <span>Toplam</span>
                        <span id="genel-toplam">0,00 TL</span>
                    </div>

                    <button onclick="window.location.href='checkout.html'" class="sepet-onayla-btn">
                        Sepeti Onayla <i class="fa fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <p>&copy; 2025 TeknoStore. Web Programlama Dersi Projesi.</p>
    </footer>

    <script src="../JS/script.js"></script>

</body>

</html>