<?php
session_start();
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ürün Detayı - TeknoStore</title>
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
                <input type="text" placeholder="Ürün ara... (Örn: Laptop)">
                <button type="button"><i class="fa fa-search"></i></button>
            </div>
            <div class="sepet-alani" style="display: flex; gap: 10px;">
                <a href="account.php" class="sepet-btn"
                    style="background-color: var(--light-bg); border-color: var(--border-color); color: var(--text-primary);">
                    <i class="fa fa-user"></i> Hesap
                </a>
                <a href="cart.php" class="sepet-btn">
                    <i class="fa fa-shopping-cart"></i> Sepetim (<span id="sepet-sayac">0</span>)
                </a>
            </div>
        </div>
    </header>

    <main class="container urun-detay-container" style="margin-top: 30px; margin-bottom: 50px;">

        <div class="detay-galeri">
            <div class="buyuk-resim-cerceve">
                <img id="detay-img" src="" alt="Ürün Resmi">
            </div>
            <div class="kucuk-resimler" id="galeri-container">
            </div>
        </div>

        <div class="detay-bilgi">
            <p class="marka-etiketi">TeknoStore Özel</p>
            <h2 id="detay-baslik" class="detay-baslik">Yükleniyor...</h2>

            <div class="detay-yildiz-ozet">
                <div class="yildizlar" id="ana-yildizlar" style="color: #cbd5e1;">
                    <i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i><i
                        class="far fa-star"></i><i class="far fa-star"></i>
                </div>
                <span class="degerlendirme-sayisi" id="yorum-sayisi-ozet">(0 Değerlendirme)</span>
            </div>

            <p id="detay-fiyat" class="detay-fiyat">...</p>

            <div id="urun-secenekleri-container" class="urun-secenekleri">
            </div>

            <div class="kisa-aciklama" style="margin-top: 20px;">
                <p id="detay-aciklama">Ürün bilgileri yükleniyor...</p>
            </div>

            <div class="detay-aksiyon">
                <div class="adet-secimi">
                    <button onclick="adetDegistir(-1)">-</button>
                    <input type="number" id="urun-adet" value="1" min="1" readonly>
                    <button onclick="adetDegistir(1)">+</button>
                </div>

                <button id="detay-sepete-ekle-btn" class="sepete-ekle-btn">
                    <i class="fa fa-shopping-cart"></i> Sepete Ekle
                </button>
            </div>

        </div>

    </main>

    <section class="container detay-alt-bolum">
        <div class="sekmeler">
            <button class="sekme-btn active" onclick="sekmeDegistir('yorumlar')">Yorumlar & Değerlendirmeler</button>
            <button class="sekme-btn" onclick="sekmeDegistir('taksit')">Taksit Seçenekleri</button>
        </div>

        <div id="yorumlar" class="sekme-icerik aktif">
            <div class="yorum-grid">

                <div class="yorum-listesi" id="yorum-listesi-kutu">
                    <p style="color:#777;">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                </div>

                <div class="yorum-yap-formu">

                    <div id="yorum-formu-container" style="display: none;">
                        <h3>Değerlendir</h3>
                        <form onsubmit="yorumGonder(event)">
                            <div class="yildiz-secimi" id="yildiz-secimi">
                                <i class="far fa-star" data-value="1" onclick="yildizVer(1)"></i>
                                <i class="far fa-star" data-value="2" onclick="yildizVer(2)"></i>
                                <i class="far fa-star" data-value="3" onclick="yildizVer(3)"></i>
                                <i class="far fa-star" data-value="4" onclick="yildizVer(4)"></i>
                                <i class="far fa-star" data-value="5" onclick="yildizVer(5)"></i>
                            </div>
                            <input type="hidden" id="secilen-yildiz" value="0">

                            <div class="form-grup">
                                <textarea id="yorum-metin" rows="4" placeholder="Ürün hakkındaki düşünceleriniz..."
                                    required></textarea>
                            </div>
                            <button type="submit" class="yorum-btn">Yorumu Gönder</button>
                        </form>
                    </div>

                    <div id="giris-uyari-kutu" style="text-align: center; padding: 20px; display: none;">
                        <i class="fa fa-lock"
                            style="font-size: 40px; color: var(--text-secondary); margin-bottom: 15px;"></i>
                        <p>Yorum yapmak için hesabınıza giriş yapmalısınız.</p>
                        <a href="login.html" class="sepet-btn"
                            style="display: inline-block; margin-top: 10px; background: var(--primary-color); color: white; border:none;">
                            Giriş Yap
                        </a>
                    </div>

                </div>
            </div>
        </div>

        <div id="taksit" class="sekme-icerik">
            <!-- <p>Anlaşmalı bankaların kredi kartlarına 9 taksit imkanı.</p> -->

            <div class="taksit-tablosu-container">
                <table class="taksit-tablosu">
                    <thead>
                        <tr>
                            <th>Banka</th>
                            <th>Taksit Sayısı</th>
                            <th>Aylık Tutar</th>
                            <th>Toplam Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i class="fas fa-credit-card" style="color:#15803d;"></i> Garanti Bonus</td>
                            <td>3 Taksit</td>
                            <td>21.666 TL</td>
                            <td>65.000 TL</td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-credit-card" style="color:#7e22ce;"></i> Yapı Kredi World</td>
                            <td>6 Taksit</td>
                            <td>10.833 TL</td>
                            <td>65.000 TL</td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-credit-card" style="color:#1d4ed8;"></i> İş Bankası Max.</td>
                            <td>9 Taksit</td>
                            <td>7.222 TL</td>
                            <td>65.000 TL</td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-credit-card" style="color:#c2410c;"></i> Ziraat Bankkart</td>
                            <td>12 Taksit</td>
                            <td>5.416 TL</td>
                            <td>65.000 TL</td>
                        </tr>
                    </tbody>
                </table>
                <p style="font-size:0.85rem; color:#64748b; margin-top:15px; text-align:center;">
                    * Taksit seçenekleri bankanıza göre değişiklik gösterebilir. Yasal sınırlamalar geçerlidir.
                </p>
            </div>
        </div>
    </section>

    <footer>
        <p>&copy; 2025 TeknoStore. Web Programlama Dersi Projesi.</p>
    </footer>

    <script src="../JS/script.js"></script>

</body>

</html>