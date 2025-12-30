<?php
session_start();
?>
<!DOCTYPE html>
<html lang="tr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ödeme Yap - TeknoStore</title>
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .checkout-container {
            max-width: 800px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 30px;
        }

        .form-box {
            background: white;
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
        }

        .form-title {
            font-size: 1.2rem;
            margin-bottom: 20px;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 10px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 0.9rem;
            color: #64748b;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            font-size: 1rem;
        }

        .ozet-satir {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            color: #475569;
        }

        .ozet-toplam {
            font-weight: 700;
            color: #0f172a;
            font-size: 1.2rem;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            margin-top: 10px;
        }

        .kaydet-checkbox {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
            font-size: 0.9rem;
            background: #f0f9ff;
            padding: 10px;
            border-radius: 6px;
            border: 1px solid #bae6fd;
            color: #0369a1;
            cursor: pointer;
        }

        .kaydet-checkbox input {
            width: auto;
        }
    </style>
</head>

<body>

    <header>
        <div class="container">
            <div class="logo"><a href="index.php" style="text-decoration:none;">
                    <h1>TeknoStore</h1>
                </a></div>
            <div class="sepet-alani"><a href="cart.php" class="sepet-btn">Sepete Dön</a></div>
        </div>
    </header>

    <main class="container" style="margin-top: 30px; margin-bottom: 50px;">
        <h2 style="margin-bottom: 20px;">Ödeme ve Teslimat</h2>

        <div class="checkout-container">
            <div class="form-box">
                <h3 class="form-title">Teslimat Adresi</h3>

                <div class="form-group" id="kayitli-adres-kutusu" style="display: none;">
                    <label>Kayıtlı Adreslerim</label>
                    <select id="adres-secimi" onchange="adresDoldur()">
                        <option value="">Yeni Adres Gir...</option>
                    </select>
                </div>

                <form id="checkout-form" onsubmit="event.preventDefault(); siparisiTamamla();">
                    <div class="form-group">
                        <label>Adres Başlığı (Örn: Ev, İş)</label>
                        <input type="text" id="adres-baslik" placeholder="Ev Adresim" required>
                    </div>
                    <div class="form-group">
                        <label>Şehir</label>
                        <input type="text" id="adres-sehir" placeholder="İstanbul" required>
                    </div>
                    <div class="form-group">
                        <label>Açık Adres</label>
                        <textarea id="adres-acik" rows="3" placeholder="Mahalle, Sokak, Kapı No..." required></textarea>
                    </div>

                    <label class="kaydet-checkbox">
                        <input type="checkbox" id="adresi-kaydet">
                        Bu adresi bir sonraki siparişim için kaydet.
                    </label>
                </form>
            </div>

            <div class="form-box" style="height: fit-content;">
                <h3 class="form-title">Sipariş Özeti</h3>
                <div id="checkout-ozet">
                </div>

                <h3 class="form-title" style="margin-top: 20px;">Kart Bilgileri</h3>
                <div class="form-group">
                    <label>Kart Üzerindeki İsim</label>
                    <input type="text" placeholder="Ad Soyad"
                        oninput="this.value = this.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')">
                </div>
                <div class="form-group">
                    <label>Kart Numarası</label>
                    <input type="text" placeholder="0000 0000 0000 0000" maxlength="19"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/(.{4})/g, '$1 ').trim()">
                </div>
                <div style="display: flex; gap: 10px; align-items: flex-end;">
                    <div class="form-group" style="flex:2;">
                        <label>Son Kullanma Tarihi (Ay/Yıl)</label>
                        <div style="display: flex; gap: 10px;">
                            <select style="flex:1;">
                                <option value="" disabled selected>Ay</option>
                                <option value="01">01</option>
                                <option value="02">02</option>
                                <option value="03">03</option>
                                <option value="04">04</option>
                                <option value="05">05</option>
                                <option value="06">06</option>
                                <option value="07">07</option>
                                <option value="08">08</option>
                                <option value="09">09</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                            </select>
                            <select id="skt-yil" style="flex:1;"></select>
                        </div>
                    </div>
                    <div class="form-group" style="flex:1;">
                        <label>CVC</label>
                        <input type="text" placeholder="***" maxlength="3"
                            oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                    </div>
                </div>
                <script>
                    // Yıl Seçeneklerini Doldur (2025 - 2040)
                    const yilSelect = document.getElementById("skt-yil");
                    if (yilSelect) {
                        let yilHtml = '<option value="" disabled selected>Yıl</option>';
                        for (let i = 2025; i <= 2040; i++) {
                            yilHtml += `<option value="${i}">${i}</option>`;
                        }
                        yilSelect.innerHTML = yilHtml;
                    }
                </script>

                <button onclick="siparisiTamamla()" class="sepet-onayla-btn" style="width: 100%; margin-top: 10px;">
                    Siparişi Tamamla <i class="fa fa-check"></i>
                </button>
            </div>
        </div>
    </main>

    <script>
        const phpKullanici = {
            email: "<?php echo isset($_SESSION['user_email']) ? $_SESSION['user_email'] : ''; ?>",
            girisYapti: <?php echo isset($_SESSION['user_id']) ? 'true' : 'false'; ?>
        };
    </script>
    <script src="../JS/script.js"></script>
</body>

</html>