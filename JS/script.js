/* =========================================
   TEKNOSTORE - TEMİZLENMİŞ JS DOSYASI (PHP UYUMLU)
   ========================================= */

// GLOBAL DEĞİŞKENLER
let aktifIndirimOrani = parseFloat(localStorage.getItem("aktifIndirimOrani")) || 0;
let secilenVaryasyonlar = {};

/* =========================================
   1. SAYFA YÜKLENME YÖNETİMİ (INIT)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {

    // 1. Genel Başlatıcılar
    sepetGuncelle();      // Sepet sayısını (header) güncelle
    aramaMotorunuBaslat(); // Arama kutusunu aktifleştir

    // Slider varsa başlat (Sadece index.php'de var)
    if (document.querySelector(".slider-container")) {
        sliderBaslat();
    }

    // Login/Register Sayfası Animasyonu (login.php)
    const container = document.getElementById('container');
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    if (container && signUpButton && signInButton) {
        signUpButton.addEventListener('click', () => container.classList.add("right-panel-active"));
        signInButton.addEventListener('click', () => container.classList.remove("right-panel-active"));
    }

    // Sepet Sayfası (cart.php)
    if (document.querySelector(".sepet-listesi")) {
        sepetSayfasiniDoldur();
    }

    // Checkout (Ödeme) Sayfası
    if (window.location.pathname.includes("checkout.php")) {
        checkoutYukle();
    }

    // NOT: Admin, Ürün Listeleme ve Detay sayfaları artık PHP tarafından dolduruluyor.
    // JS'in onlara karışmasına gerek yok.
});


/* =========================================
   2. SEPET YÖNETİMİ (MERKEZİ)
   ========================================= */

// YARDIMCI: Sepet Anahtarını Belirle (PHP Session'a Göre)
function getSepetKey() {
    // Sayfaya PHP tarafından bırakılan değişkene bak
    if (typeof phpKullanici !== 'undefined' && phpKullanici.girisYapti && phpKullanici.email) {
        return `sepet_${phpKullanici.email}`;
    }
    // Giriş yapmamışsa genel sepet
    return "sepet_misafir";
}

// A. PHP'DEN GELEN ÜRÜNÜ SEPETE EKLE (Detail.php ve Products.php için)

function detaydanSepeteEkle(urun, hizliEkle = false) {
    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];
    let adet = 1;

    // Adet bilgisini al (Sadece detay sayfasında varsa)
    const adetInput = document.getElementById("urun-adet");
    if (!hizliEkle && adetInput) {
        adet = parseInt(adetInput.value);
    }

    // --- FİYAT HESAPLAMA (Varyasyon Fiyat Farkları) ---
    // Not: PHP'den gelen ürün objesinde 'price' (fiyat) ve varsa 'fiyatFarklari' olmalı.
    let guncelFiyat = parseFloat(urun.price || urun.fiyat);
    let varyasyonMetni = "";

    // Eğer detay sayfasındaysak ve seçim yapıldıysa
    if (!hizliEkle && Object.keys(secilenVaryasyonlar).length > 0) {
        varyasyonMetni = Object.entries(secilenVaryasyonlar)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ");

        // Fiyat farkı hesabı (Gelişmiş özellik)
        // Bu özellik için ürün objesinde fiyat farklarının olması gerekir.
        // Şimdilik standart fiyat üzerinden gidiyoruz, ileride eklenebilir.
    } else {
        // Hızlı ekleme veya seçim yoksa
        varyasyonMetni = urun.ozellik || "Standart";
    }

    // Benzersiz Sepet ID'si
    const sepetId = urun.id + "_" + varyasyonMetni.replace(/\s/g, '');
    const varMi = sepet.find(item => item.sepetId === sepetId);

    if (varMi) {
        varMi.adet += adet;
        // Fiyat güncellenmesi gerekiyorsa buraya eklenebilir
    } else {
        sepet.push({
            id: urun.id,
            sepetId: sepetId,
            ad: urun.name || urun.ad, // PHP genelde 'name' gönderir
            fiyat: guncelFiyat,
            resim: urun.image_url ? (urun.image_url.startsWith("IMG") ? "../" + urun.image_url : urun.image_url) : urun.resim,
            ozellik: varyasyonMetni,
            adet: adet
        });
    }

    localStorage.setItem(sepetKey, JSON.stringify(sepet));
    sepetGuncelle();

    // Şık bir bildirim
    alert(`${urun.name || urun.ad} sepete eklendi!`);
}

// B. SEPET SAYFASINI DOLDUR (cart.php)
function sepetSayfasiniDoldur() {
    const sepetListesi = document.querySelector(".sepet-listesi");
    const sepetWrapper = document.querySelector(".sepet-wrapper");
    const ozetAlan = document.querySelector(".sepet-ozeti");

    if (!sepetListesi) return;

    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];

    sepetListesi.innerHTML = "";

    // DURUM: SEPET BOŞ
    if (sepet.length === 0) {
        if (sepetWrapper) sepetWrapper.classList.add("bos");
        sepetListesi.innerHTML = `
            <div class="bos-sepet-mesaj">
                <i class="fa fa-shopping-basket" style="font-size:60px; color:#cbd5e1; margin-bottom:20px;"></i>
                <h3 style="color:#334155;">Sepetiniz şu an boş.</h3>
                <p style="color:#64748b; margin-bottom:20px;">Hemen alışverişe başlayıp harika ürünleri keşfedin!</p>
                <a href="products.php" class="btn-primary" style="display:inline-block; padding:12px 30px; background:var(--primary-color); color:white; border-radius:8px; text-decoration:none; font-weight:600;">Alışverişe Başla</a>
            </div>`;
        if (ozetAlan) ozetAlan.style.display = "none";
        return;
    }

    // DURUM: SEPET DOLU
    if (sepetWrapper) sepetWrapper.classList.remove("bos");
    if (ozetAlan) ozetAlan.style.display = "block";

    let araToplam = 0;

    sepet.forEach(urun => {
        araToplam += urun.fiyat * urun.adet;
        const fiyatFormat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(urun.fiyat);

        const div = document.createElement("div");
        div.className = "sepet-urunu";
        div.innerHTML = `
            <img src="${urun.resim}" alt="${urun.ad}" onerror="this.src='https://via.placeholder.com/100'">
            <div class="sepet-urun-detay">
                <h4>${urun.ad}</h4>
                ${urun.ozellik ? `<span class="ozellik">${urun.ozellik}</span>` : ''}
                <div class="fiyat">${fiyatFormat}</div>
            </div>
            <div class="sepet-kontrol">
                <button onclick="sepetMiktarGuncelle('${urun.sepetId}', -1)">-</button>
                <input type="text" value="${urun.adet}" readonly>
                <button onclick="sepetMiktarGuncelle('${urun.sepetId}', 1)">+</button>
            </div>
            <button class="cop-kutusu" onclick="sepettenSil('${urun.sepetId}')"><i class="fa fa-trash"></i></button>
        `;
        sepetListesi.appendChild(div);
    });

    // Hesaplamalar
    const indirimTutari = araToplam * aktifIndirimOrani;
    const genelToplam = araToplam - indirimTutari;

    // Ara Toplam
    const araToplamEl = document.getElementById("ara-toplam");
    if (araToplamEl) araToplamEl.innerText = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(araToplam);

    // İndirim Satırı (Kupon varsa göster)
    const indirimSatiri = document.getElementById("indirim-satiri");
    const indirimOraniEl = document.getElementById("indirim-orani");
    const indirimTutariEl = document.getElementById("indirim-tutari");

    if (indirimSatiri && aktifIndirimOrani > 0) {
        indirimSatiri.style.display = "flex";
        if (indirimOraniEl) indirimOraniEl.innerText = `%${Math.round(aktifIndirimOrani * 100)}`;
        if (indirimTutariEl) indirimTutariEl.innerText = `-${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(indirimTutari)}`;
    } else if (indirimSatiri) {
        indirimSatiri.style.display = "none";
    }

    // Genel Toplam
    const genelToplamEl = document.getElementById("genel-toplam");
    if (genelToplamEl) genelToplamEl.innerText = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(genelToplam);
}

// C. HEADER SEPET SAYACINI GÜNCELLE
function sepetGuncelle() {
    let sepet = JSON.parse(localStorage.getItem(getSepetKey())) || [];
    const toplamAdet = sepet.reduce((toplam, urun) => toplam + urun.adet, 0);
    document.querySelectorAll("#sepet-sayac").forEach(el => el.innerText = toplamAdet);
}

// D. MİKTAR GÜNCELLEME
function sepetMiktarGuncelle(sepetId, degisim) {
    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];
    const index = sepet.findIndex(u => u.sepetId === sepetId);

    if (index > -1) {
        sepet[index].adet += degisim;
        if (sepet[index].adet < 1) {
            if (confirm("Ürünü silmek istiyor musunuz?")) sepet.splice(index, 1);
            else sepet[index].adet = 1;
        }
        localStorage.setItem(sepetKey, JSON.stringify(sepet));
        sepetSayfasiniDoldur();
        sepetGuncelle();
    }
}

// E. SEPETTEN SİL
function sepettenSil(sepetId) {
    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];
    sepet = sepet.filter(u => u.sepetId !== sepetId);
    localStorage.setItem(sepetKey, JSON.stringify(sepet));
    sepetSayfasiniDoldur();
    sepetGuncelle();
}
/* =========================================
   3. CHECKOUT VE SİPARİŞ TAMAMLAMA
   ========================================= */
function checkoutYukle() {
    let sepet = JSON.parse(localStorage.getItem(getSepetKey())) || [];
    const ozetDiv = document.getElementById("checkout-ozet");

    if (ozetDiv) {
        let araToplam = 0;
        ozetDiv.innerHTML = "";

        if (sepet.length === 0) {
            ozetDiv.innerHTML = "<p>Sepetiniz boş.</p>";
            return;
        }

        sepet.forEach(u => {
            araToplam += u.fiyat * u.adet;
            ozetDiv.innerHTML += `
                <div class="ozet-satir">
                    <span>${u.ad} (x${u.adet})</span>
                    <span>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(u.fiyat * u.adet)}</span>
                </div>`;
        });

        ozetDiv.innerHTML += `
            <div class="ozet-toplam">
                <span>Toplam</span>
                <span>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(araToplam)}</span>
            </div>`;
    }
}

function siparisiTamamla() {
    const baslik = document.getElementById("adres-baslik").value;
    const sehir = document.getElementById("adres-sehir").value;
    const acik = document.getElementById("adres-acik").value;

    if (!baslik || !sehir || !acik) {
        alert("Lütfen adres bilgilerini eksiksiz doldurun.");
        return;
    }

    const tamAdres = `${baslik} - ${sehir} (${acik})`;

    // Önce kullanıcı sepetini dene, yoksa misafir sepetini kontrol et
    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];

    // Eğer kullanıcı sepeti boşsa ve misafir sepeti doluysa, onu kullan
    if (sepet.length === 0) {
        const misafirSepet = JSON.parse(localStorage.getItem("sepet_misafir")) || [];
        if (misafirSepet.length > 0) {
            sepet = misafirSepet;
            sepetKey = "sepet_misafir"; // Silmek için doğru anahtarı kullan
        }
    }

    if (sepet.length === 0) {
        alert("Sepetiniz boş!");
        return;
    }

    const toplamTutar = sepet.reduce((top, urun) => top + (urun.fiyat * urun.adet), 0);

    const siparisVerisi = {
        adres: tamAdres,
        toplam: toplamTutar,
        sepet: sepet
    };

    // API_CHECKOUT.PHP İLE VERİTABANINA KAYIT
    fetch('api_checkout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siparisVerisi)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert("Siparişiniz Başarıyla Alındı! Sipariş No: #" + data.order_id);
                localStorage.removeItem(sepetKey); // Kullanılan sepeti temizle
                localStorage.removeItem("sepet_misafir"); // Misafir sepetini de temizle (varsa)
                window.location.href = "hesabim.php";
            } else {
                alert("Hata: " + data.message);
                if (data.message.includes("giriş")) window.location.href = "login.php";
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            alert("Bir bağlantı hatası oluştu.");
        });
}
/* =========================================
   4. DETAY SAYFASI & SEÇENEKLER (GÜNCELLENMİŞ)
   ========================================= */

// Sayfa yüklendiğinde çalışacak
document.addEventListener("DOMContentLoaded", () => {
    // Sadece detay sayfasındaysak ve veri varsa çalıştır
    if (typeof sayfaUrunVerisi !== 'undefined' && document.getElementById("urun-secenekleri-container")) {
        // Seçenekleri oluştur
        secenekleriOlustur(sayfaUrunVerisi.secenekler);

        // Sepete ekle butonunu bağla
        const btn = document.querySelector(".sepete-ekle-btn"); // Class adını kontrol et
        if (btn) {
            // Eski onclick olayını temizle ve yenisini ekle
            btn.onclick = function () {
                detaydanSepeteEkle(sayfaUrunVerisi);
            };
        }
    }
});

function secenekleriOlustur(seceneklerData) {
    const container = document.getElementById("urun-secenekleri-container"); // HTML'de bu ID'li bir div olmalı!
    // Eğer HTML'de bu ID yoksa hata vermemesi için oluşturabiliriz veya kontrol ederiz
    if (!container) return;

    container.innerHTML = "";
    secilenVaryasyonlar = {};

    if (!seceneklerData) return;

    for (const [baslik, degerler] of Object.entries(seceneklerData)) {
        // İlk değeri varsayılan seç
        secilenVaryasyonlar[baslik] = degerler[0];

        const grup = document.createElement("div");
        grup.className = "secenek-grubu";
        grup.innerHTML = `<h4>${baslik}:</h4>`;

        const btnDiv = document.createElement("div");
        btnDiv.className = "secenek-butonlari";

        degerler.forEach((deger, i) => {
            const btn = document.createElement("button");
            btn.className = `varyasyon-btn ${i === 0 ? 'secili' : ''}`;
            btn.innerText = deger;

            // Butona tıklama olayı
            btn.onclick = function () {
                // Diğer butonların seçili sınıfını kaldır
                btnDiv.querySelectorAll(".varyasyon-btn").forEach(b => b.classList.remove("secili"));
                // Buna ekle
                this.classList.add("secili");
                // Seçimi güncelle
                secilenVaryasyonlar[baslik] = deger;

                // Fiyatı Güncelle (Artık global veriden okuyor)
                fiyatGuncelle(sayfaUrunVerisi);
            };
            btnDiv.appendChild(btn);
        });
        grup.appendChild(btnDiv);
        container.appendChild(grup);
    }
}

function fiyatGuncelle(urun) {
    if (!urun) return;

    let guncelFiyat = parseFloat(urun.fiyat);

    // Seçili varyasyonların fiyat farklarını ekle
    for (const [baslik, deger] of Object.entries(secilenVaryasyonlar)) {
        const farkKey = `${baslik}|${deger}`; // Örn: "RAM|32GB"

        if (urun.fiyatFarklari && urun.fiyatFarklari[farkKey]) {
            guncelFiyat += parseInt(urun.fiyatFarklari[farkKey]);
        }
    }

    const formatliFiyat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(guncelFiyat);
    const fiyatLabel = document.querySelector(".detay-fiyat"); // Class selector kullandım

    if (fiyatLabel) {
        // Animasyonlu Geçiş
        fiyatLabel.style.opacity = 0;
        setTimeout(() => {
            fiyatLabel.innerText = formatliFiyat;
            fiyatLabel.style.opacity = 1;
        }, 150);
    }
}


/* =========================================
   5. DİĞER FONKSİYONLAR (GALERİ, LOGIN, KUPON)
   ========================================= */
/* --- GELİŞMİŞ GALERİ FONKSİYONU (RESİMLERİ GETİRİR) --- */

// HTML'den (PHP'den) tıklanınca çalışan fonksiyon
function resimDegistir(imgElement) {
    if (!imgElement) return;

    // 1. Büyük Resmi Bul ve Değiştir
    const buyukResim = document.getElementById("detay-img");
    if (buyukResim) {
        // Küçük resmin src'sini büyük resme ata
        buyukResim.src = imgElement.src;
    }

    // 2. Aktif Sınıfı ve Opaklık Yönetimi
    // Tıklanan resmin içindeki bulunduğu container'daki tüm resimleri al
    const container = imgElement.parentElement;
    const tumResimler = container.querySelectorAll("img");

    tumResimler.forEach(img => {
        img.classList.remove("aktif");
        img.style.opacity = "0.6"; // Pasif opaklık
    });

    // Tıklananı aktif yap
    imgElement.classList.add("aktif");
    imgElement.style.opacity = "1"; // Tam görünürlük
}

function galeriOlustur(anaResim, urunId) {
    const container = document.getElementById("galeri-container");
    if (!container) return;

    container.innerHTML = ""; // Önce temizle



    // Resimleri Döngüyle Ekrana Bas
    galeriResimleri.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;

        // İlk resim aktif olsun
        if (index === 0) img.classList.add("aktif");

        // Tıklayınca büyük resmi değiştir
        img.onclick = function () {
            document.getElementById("detay-img").src = this.src;
            // Diğerlerinin aktifliğini kaldır, buna ekle
            container.querySelectorAll("img").forEach(im => im.classList.remove("aktif"));
            this.classList.add("aktif");
        };

        // Hata olursa (Resim yoksa) konsola yaz ama siteyi bozma
        img.onerror = function () { console.warn("Resim bulunamadı:", src); };

        container.appendChild(img);
    });
}

// Yorum ve Giriş Fonksiyonları (Öncekiyle aynı mantıkta sadeleştirildi)
function oturumHeaderKontrol() {
    const oturum = localStorage.getItem("oturum");
    const btn = document.querySelector('header a[href="login.php"], header a[href="account.php"]');
    if (btn) {
        if (oturum === "aktif") {
            btn.href = "account.php";
            btn.innerHTML = '<i class="fa fa-user-circle"></i> Hesabım';
        } else {
            btn.href = "login.php";
            btn.innerHTML = '<i class="fa fa-user"></i> Giriş Yap';
        }
    }
}

/* =========================================
   YORUM VE PUANLAMA SİSTEMİ (GELİŞMİŞ)
   ========================================= */

// 1. KULLANICI YILDIZ SEÇTİĞİNDE ÇALIŞIR
function yildizVer(puan) {
    // Seçilen puanı gizli inputa yaz
    const input = document.getElementById("secilen-yildiz");
    if (input) input.value = puan;

    // Görseli Güncelle (Seçilenler turuncu, diğerleri gri)
    const yildizlar = document.querySelectorAll("#yildiz-secimi i");
    yildizlar.forEach((yildiz, index) => {
        if (index < puan) {
            // Dolu Yıldız
            yildiz.classList.remove("far"); // İçi boş sınıfını sil
            yildiz.classList.add("fas");    // İçi dolu sınıfını ekle
            yildiz.style.color = "#f59e0b"; // Turuncu renk
        } else {
            // Boş Yıldız
            yildiz.classList.remove("fas");
            yildiz.classList.add("far");
            yildiz.style.color = "#cbd5e1"; // Gri renk
        }
    });
}

// 2. YORUMLARI LİSTELE (EKLENDİ)
function yorumListesiniGetir(urunId) {
    const kutu = document.getElementById("yorum-listesi-kutu");
    if (!kutu) return;

    let yorumlar = JSON.parse(localStorage.getItem(`yorumlar_urun_${urunId}`)) || [];

    if (yorumlar.length === 0) {
        kutu.innerHTML = '<p style="color:#777;">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>';
    } else {
        kutu.innerHTML = yorumlar.map(y => `
            <div class="yorum-kart">
                <div class="yorum-baslik">
                    <b>${y.ad}</b> 
                    <span style="color:#f59e0b; font-size:0.9rem; margin-left:10px;">
                        ${'<i class="fas fa-star"></i>'.repeat(y.puan)}${'<i class="far fa-star"></i>'.repeat(5 - y.puan)}
                    </span>
                    <small style="float:right; color:#999;">${y.tarih}</small>
                </div>
                <p style="margin-top:5px;">${y.metin}</p>
            </div>
        `).join("");
    }
}

// 2. ÜRÜNÜN GENEL ORTALAMASINI HESAPLA VE GÖSTER
function puanlariGuncelle(urunId) {
    // 1. LocalStorage'dan bu ürünün yorumlarını çek
    const yorumlar = JSON.parse(localStorage.getItem(`yorumlar_urun_${urunId}`)) || [];
    const ozetYazi = document.getElementById("yorum-sayisi-ozet");
    const anaYildizKutusu = document.getElementById("ana-yildizlar");

    if (!anaYildizKutusu || !ozetYazi) return;

    // Eğer hiç yorum yoksa
    if (yorumlar.length === 0) {
        ozetYazi.innerText = "(0 Değerlendirme)";
        anaYildizKutusu.innerHTML = `
            <i class="far fa-star"></i><i class="far fa-star"></i>
            <i class="far fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>
        `;
        anaYildizKutusu.style.color = "#cbd5e1"; // Gri
        return;
    }

    // 2. Ortalamayı Hesapla
    // Tüm puanları topla
    const toplamPuan = yorumlar.reduce((toplam, yorum) => toplam + yorum.puan, 0);
    // Yorum sayısına böl
    const ortalama = toplamPuan / yorumlar.length;
    // Yuvarla (Örn: 4.2 ise 4 yıldız, 4.6 ise 5 yıldız gibi)
    const yuvarlanmisPuan = Math.round(ortalama);

    // 3. Ekrana Bas (Ana Başlık Altına)
    let yildizHTML = "";
    for (let i = 1; i <= 5; i++) {
        if (i <= yuvarlanmisPuan) {
            yildizHTML += '<i class="fas fa-star"></i>'; // Dolu
        } else {
            yildizHTML += '<i class="far fa-star"></i>'; // Boş
        }
    }

    anaYildizKutusu.innerHTML = yildizHTML;
    anaYildizKutusu.style.color = "#f59e0b"; // Turuncu

    // Virgülden sonra 1 basamak göster (4.5 gibi)
    ozetYazi.innerText = `(${ortalama.toFixed(1)} / 5 - ${yorumlar.length} Değerlendirme)`;
}

// 3. YORUM GÖNDERME İŞLEMİ
function yorumGonder(event) {
    event.preventDefault(); // Sayfanın yenilenmesini engelle

    // ID'yi URL'den al
    const urlParams = new URLSearchParams(window.location.search);
    const urunId = urlParams.get('id');

    // Form verilerini al
    const metin = document.getElementById("yorum-metin").value;
    const puan = document.getElementById("secilen-yildiz").value;

    // Kullanıcı bilgisini al
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));
    const ad = kullanici ? kullanici.ad : "Anonim";

    // KONTROL: Yıldız seçilmiş mi?
    if (puan == "0" || puan === "") {
        alert("Lütfen ürün için bir yıldız puanı seçiniz!");
        return; // Fonksiyonu durdur
    }

    // Yeni Yorum Objesi
    const yeniYorum = {
        ad: ad,
        metin: metin,
        puan: parseInt(puan),
        tarih: new Date().toLocaleDateString('tr-TR')
    };

    // Kaydet
    let yorumlar = JSON.parse(localStorage.getItem(`yorumlar_urun_${urunId}`)) || [];
    yorumlar.push(yeniYorum);
    localStorage.setItem(`yorumlar_urun_${urunId}`, JSON.stringify(yorumlar));

    alert("Değerlendirmeniz alındı! Teşekkürler.");

    // Formu Temizle ve Yıldızları Sıfırla
    event.target.reset();
    yildizVer(0); // Yıldızları griye çevir

    // Listeyi ve Ortalamayı Anında Güncelle (Sayfa yenilenmeden gör)
    yorumListesiniGetir(urunId);
    puanlariGuncelle(urunId);
}

// 4. LOGİN DURUMUNA GÖRE FORM GÖSTER/GİZLE
function yorumFormunuAyarla() {
    const formContainer = document.getElementById("yorum-formu-container");
    const uyariContainer = document.getElementById("giris-uyari-kutu");
    const oturum = localStorage.getItem("oturum");

    if (formContainer && uyariContainer) {
        if (oturum === "aktif") {
            formContainer.style.display = "block";
            uyariContainer.style.display = "none";
        } else {
            formContainer.style.display = "none";
            uyariContainer.style.display = "block";
        }
    }
}


// KUPON SİSTEMİ
function kuponUygula() {
    const kod = document.getElementById("kupon-kodu").value.toUpperCase().trim();
    const KUPONLAR = { "FUSUNHOCA": 0.50, "ERKANHOCA": 0.50, "TEKNOSTORE": 0.10 };

    if (KUPONLAR[kod]) {
        aktifIndirimOrani = KUPONLAR[kod];
        localStorage.setItem("aktifIndirimOrani", aktifIndirimOrani);
        sepetSayfasiniDoldur();
        alert(`%${aktifIndirimOrani * 100} İndirim Uygulandı!`);
    } else {
        alert("Geçersiz Kupon!");
    }
}

function urunleriListele() {
    const kutu = document.getElementById("urun-listesi");
    if (!kutu) return;

    const urlParams = new URLSearchParams(window.location.search);
    const kategori = urlParams.get('kategori');
    const aramaTerimi = urlParams.get('ara');

    // Önce listeyi temizle (Optimized: innerHTML += kullanmadan toplu ekleme yapacağız)
    let htmlContent = "";
    let gosterilecekUrunler = urunler;

    // 1. Durum: Kategori Filtresi Varsa
    if (kategori) {
        gosterilecekUrunler = urunler.filter(u => u.kategori === kategori);
    }
    // 2. Durum: Arama Yapılmışsa
    else if (aramaTerimi) {
        const kucukTerim = aramaTerimi.toLocaleLowerCase('tr');

        gosterilecekUrunler = urunler.filter(u =>
            (u.ad && u.ad.toLocaleLowerCase('tr').includes(kucukTerim)) ||
            (u.aciklama && u.aciklama.toLocaleLowerCase('tr').includes(kucukTerim))
        );

        // Kullanıcıya ne aradığını gösterelim
        const baslik = document.querySelector(".main-content h2");
        if (baslik) baslik.innerText = `"${aramaTerimi}" için sonuçlar:`;
    }

    // SONUÇ YOKSA
    if (gosterilecekUrunler.length === 0) {
        kutu.innerHTML = `
            <div style="text-align:center; width:100%; padding:50px;">
                <i class="fa fa-search" style="font-size:40px; color:#cbd5e1; margin-bottom:15px;"></i>
                <h3>Üzgünüz, aradığınız kriterlere uygun ürün bulamadık.</h3>
                <p>Lütfen farklı anahtar kelimelerle tekrar deneyin veya <a href="products.php" style="color:blue;">Tüm Ürünleri</a> inceleyin.</p>
            </div>`;
        return;
    }

    // LİSTELEME
    gosterilecekUrunler.forEach(u => {
        const fiyat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(u.fiyat);
        htmlContent += `
            <div class="urun-karti">
                <a href="detail.html?id=${u.id}" style="text-decoration:none; color:inherit;">
                    <div class="resim-alani"><img src="${u.resim}" alt="${u.ad}"></div>
                    <h4>${u.ad}</h4>
                    <p class="ozellik" style="text-transform:capitalize;">${u.kategori}</p>
                </a>
                <div class="alt-bilgi">
                    <span class="fiyat">${fiyat}</span>
                    <button onclick="window.location.href='detail.php?id=${u.id}'">İncele</button>
                </div>
            </div>`;
    });

    kutu.innerHTML = htmlContent;
}
/* =========================================
   6. GİRİŞ, KAYIT VE ÇIKIŞ İŞLEMLERİ
   ========================================= */

// A. KAYIT KONTROL (Telefon Numarasını Kaydeder)
function kayitKontrol(event) {
    event.preventDefault();

    const adInput = document.getElementById('reg-ad');
    const ad = adInput ? adInput.value : "İsimsiz Kullanıcı";
    const email = document.getElementById('reg-email').value;
    const telefon = document.getElementById('reg-phone').value;
    const sifre1 = document.getElementById('reg-pass').value;
    const sifre2 = document.getElementById('reg-pass-confirm').value;

    // Telefon Kontrolü
    if (telefon.length !== 11) {
        alert("HATA: Telefon numarası 11 haneli olmalıdır! (Örn: 05551234567)");
        return false;
    }

    // Şifre Uzunluk Kontrolü
    if (sifre1.length < 6 || sifre1.length > 20) {
        alert("HATA: Şifreniz en az 6, en fazla 20 karakter olmalıdır!");
        return false;
    }

    // Şifre Eşleşme Kontrolü
    if (sifre1 !== sifre2) {
        alert("HATA: Şifreler eşleşmiyor!");
        return false;
    }

    if (!/[A-Z]/.test(sifre1) || !/[0-9]/.test(sifre1)) {
        alert("HATA: Şifre en az 1 Büyük Harf ve 1 Rakam içermelidir!");
        return false;
    }

    // Kullanıcıyı Oluştur (Simülasyon)
    const yeniKullanici = {
        ad: ad,
        email: email,
        sifre: sifre1, // Şifre kaydedildi
        telefon: telefon,
        rol: "musteri",
        kayitTarihi: new Date().toLocaleDateString('tr-TR'),
        adresler: [] // Boş adres dizisi başlat
    };

    // 1. Geçici kayıt olarak sakla (Giriş yapınca asıl kullanıcı olacak)
    localStorage.setItem("geciciKayit", JSON.stringify(yeniKullanici));

    // 2. Kullanıcı Listesine Ekle (Admin görsün diye)
    let kullanicilar = JSON.parse(localStorage.getItem("kullanicilar")) || [];
    kullanicilar.push(yeniKullanici);
    localStorage.setItem("kullanicilar", JSON.stringify(kullanicilar));

    alert("Kayıt Başarılı! Şimdi giriş yapabilirsiniz.");

    // Login formuna geçiş yap
    const container = document.getElementById('container');
    if (container) container.classList.remove("right-panel-active");

    // Formu temizle
    event.target.reset();
}

// B. GİRİŞ YAP (Kaydedilen Bilgiyi Alır)
function girisYap(event, tip) {
    event.preventDefault();
    let email, sifre;

    if (tip === 'giris') {
        const form = document.querySelector('.sign-in-container form');
        email = form.querySelector('input[type="email"]').value;
        sifre = form.querySelector('input[type="password"]').value;
    } else {
        // Otomatik giriş senaryosu (şifresiz)
        email = "test@test.com"; sifre = "123";
    }

    // 1. ADMIN GİRİŞİ
    if (email === "admin@admin.com" && sifre === "123456") {
        localStorage.setItem("oturum", "aktif");
        localStorage.setItem("kullanici", JSON.stringify({ ad: "Sistem Yöneticisi", email: email, rol: "admin" }));
        alert("Yönetici girişi başarılı!");
        window.location.href = "admin.php";
        return;
    }

    // 2. MÜŞTERİ GİRİŞİ
    // Önce geçici kayıttaki veriyi kontrol et
    let kayitliUser = JSON.parse(localStorage.getItem("geciciKayit"));

    // Kullanıcı Kontrolü
    if (!kayitliUser) {
        alert("Sistemde kayıtlı kullanıcı bulunamadı! Lütfen önce kayıt olun.");
        return;
    }

    if (kayitliUser.email !== email) {
        alert("Bu e-posta adresi ile kayıtlı bir hesap bulunamadı.");
        return;
    }

    if (kayitliUser.sifre !== sifre) {
        alert("Hatalı şifre!");
        return;
    }

    // Giriş Başarılı
    localStorage.setItem("oturum", "aktif");
    localStorage.setItem("kullanici", JSON.stringify(kayitliUser));

    alert(`Hoşgeldiniz, ${kayitliUser.ad}!`);
    window.location.href = "index.php";
}

// ÇIKIŞ YAP
function cikisYap() {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        localStorage.removeItem("oturum");
        // localStorage.removeItem("kullanici"); // İsteğe bağlı: Kullanıcıyı hatırlamak istersen silme
        window.location.href = "index.php";
    }
}

function adminCikis() {
    if (confirm("Yönetim panelinden çıkmak istediğinize emin misiniz?")) {
        localStorage.removeItem("oturum");
        window.location.href = "login.php";
    }
}

/* =========================================
   7. HESAP VE SİPARİŞ YÖNETİMİ
   ========================================= */

// HESAP SAYFASINI DOLDUR (account.php)
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("account.php")) {
        hesapSayfasiniYukle();
    }
});

function hesapSayfasiniYukle() {
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));

    if (!kullanici) {
        window.location.href = "login.php";
        return;
    }

    // 1. Profil Bilgileri
    if (document.getElementById("sidebar-ad")) document.getElementById("sidebar-ad").innerText = kullanici.ad || "";
    if (document.getElementById("prof-ad")) document.getElementById("prof-ad").innerText = kullanici.ad || "";
    if (document.getElementById("prof-email")) document.getElementById("prof-email").innerText = kullanici.email || "";
    if (document.getElementById("prof-tel")) document.getElementById("prof-tel").innerText = kullanici.telefon || "Belirtilmemiş";
    if (document.getElementById("prof-tarih") && kullanici.kayitTarihi)
        document.getElementById("prof-tarih").innerText = kullanici.kayitTarihi;

    // 2. Siparişleri Listele (Kullanıcı verisiyle)
    siparisleriListele(kullanici);

    // 3. Adresleri Listele
    adresleriListele(kullanici);
}

function siparisleriListele(kullanici) {
    const siparisler = JSON.parse(localStorage.getItem("siparisler")) || [];
    const listeKutu = document.getElementById("siparis-listesi");
    if (!listeKutu) return;

    // FİLTRELEME: Sadece bu kullanıcının siparişlerini göster
    const kullaniciSiparisleri = siparisler.filter(sip => sip.kullaniciEmail === kullanici.email);

    if (kullaniciSiparisleri.length === 0) {
        listeKutu.innerHTML = `<p style="color:#64748b;">Henüz verilmiş bir siparişiniz yok.</p>`;
    } else {
        let html = `<table class="order-table">
                    <thead>
                        <tr>
                            <th>Sipariş No</th>
                            <th>Tarih</th>
                            <th>Tutar</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>`;

        kullaniciSiparisleri.reverse().forEach(sip => {
            const fiyat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(sip.tutar);
            html += `
                <tr>
                    <td>#${sip.siparisNo}</td>
                    <td>${sip.tarih}</td>
                    <td>${fiyat}</td>
                    <td><span class="status-badge status-hazirlaniyor">${sip.durum}</span></td>
                </tr>`;
        });
        html += `</tbody></table>`;
        listeKutu.innerHTML = html;
    }
}

function adresleriListele(kullanici) {
    const adresKutusu = document.getElementById("kayitli-adres-listesi");
    if (!adresKutusu) return;

    if (kullanici.adresler && kullanici.adresler.length > 0) {
        adresKutusu.innerHTML = "";
        kullanici.adresler.forEach(adres => {
            adresKutusu.innerHTML += `
            <div class="info-box" style="background:white; border-left:4px solid var(--primary-color);">
                <label style="font-weight:bold; color:var(--primary-color); font-size:1rem;">
                    <i class="fa fa-map-marker-alt"></i> ${adres.baslik}
                </label>
                <p style="font-size:0.95rem; margin-top:5px;">${adres.acik}</p>
                <p style="font-size:0.85rem; color:#64748b; margin-top:5px;">${adres.sehir}</p>
            </div>`;
        });
    } else {
        adresKutusu.innerHTML = `<p>Henüz kayıtlı adresiniz yok. Sipariş verirken kaydedebilirsiniz.</p>`;
    }
}

/* =========================================
   8. CHECKOUT VE ADRES YÖNETİMİ
   ========================================= */

// Checkout Sayfası Yüklendiğinde
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("checkout.php")) {
        checkoutYukleFull();
    }
});

function checkoutYukleFull() {
    // 1. Kullanıcı Kontrolü - PHP Session'dan gelen bilgiyi kullan
    if (typeof phpKullanici === 'undefined' || !phpKullanici.girisYapti) {
        alert("Sipariş vermek için giriş yapmalısınız.");
        window.location.href = "login.php";
        return;
    }

    // 2. Sipariş Özetini Getir - Önce kullanıcı sepetini dene, yoksa misafir sepetini
    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];

    // Eğer kullanıcı sepeti boşsa, misafir sepetini kontrol et
    if (sepet.length === 0) {
        const misafirSepet = JSON.parse(localStorage.getItem("sepet_misafir")) || [];
        if (misafirSepet.length > 0) {
            sepet = misafirSepet;
        }
    }

    const ozetDiv = document.getElementById("checkout-ozet");

    if (ozetDiv) {
        let araToplam = 0;
        let indirimOrani = parseFloat(localStorage.getItem("aktifIndirimOrani")) || 0;
        ozetDiv.innerHTML = "";

        sepet.forEach(u => {
            araToplam += u.fiyat * u.adet;
            ozetDiv.innerHTML += `
                <div class="ozet-satir">
                    <span>${u.ad} (x${u.adet})</span>
                    <span>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(u.fiyat * u.adet)}</span>
                </div>`;
        });

        const indirimTutari = araToplam * indirimOrani;
        const genelToplam = araToplam - indirimTutari;

        if (indirimOrani > 0) {
            ozetDiv.innerHTML += `
                <div class="ozet-satir">
                    <span>Ara Toplam</span>
                    <span>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(araToplam)}</span>
                </div>
                <div class="ozet-satir" style="color:green;">
                    <span>İndirim (%${indirimOrani * 100})</span>
                    <span>-${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(indirimTutari)}</span>
                </div>
            `;
        }

        ozetDiv.innerHTML += `
            <div class="ozet-toplam">
                <span>Toplam</span>
                <span>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(genelToplam)}</span>
            </div>`;
    }

    // 3. Kayıtlı Adresleri Listele (Dropdown)
    const adresKutusu = document.getElementById("kayitli-adres-kutusu");
    const select = document.getElementById("adres-secimi");

    if (adresKutusu && select && kullanici.adresler && kullanici.adresler.length > 0) {
        adresKutusu.style.display = "block";

        // Önce temizle (Yeni Adres hariç)
        select.innerHTML = '<option value="">Yeni Adres Gir...</option>';

        kullanici.adresler.forEach((adres, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.text = `${adres.baslik} - ${adres.sehir}`;
            select.appendChild(option);
        });
    }
}

// Dropdown'dan Seçilince Formu Doldur
function adresDoldur() {
    const select = document.getElementById("adres-secimi");
    const index = select.value;

    const baslikInput = document.getElementById("adres-baslik");
    const sehirInput = document.getElementById("adres-sehir");
    const acikInput = document.getElementById("adres-acik");

    if (index === "") {
        baslikInput.value = "";
        sehirInput.value = "";
        acikInput.value = "";
        return;
    }

    const kullanici = JSON.parse(localStorage.getItem("kullanici"));
    const secilenAdres = kullanici.adresler[index];

    if (secilenAdres) {
        baslikInput.value = secilenAdres.baslik;
        sehirInput.value = secilenAdres.sehir;
        acikInput.value = secilenAdres.acik;
    }
}

/* siparisiTamamla fonksiyonu dosyanın başında tanımlı - burası kaldırıldı */

function adetDegistir(miktar) {
    const input = document.getElementById("urun-adet");
    if (!input) return;

    let yeniDeger = parseInt(input.value) + miktar;
    if (yeniDeger < 1) yeniDeger = 1;
    if (yeniDeger > 10) yeniDeger = 10;
    input.value = yeniDeger;
}

function sekmeDegistir(sekmeId) {
    document.querySelectorAll(".sekme-icerik").forEach(div => div.classList.remove("aktif"));
    document.querySelectorAll(".sekme-btn").forEach(btn => btn.classList.remove("active"));

    const hedef = document.getElementById(sekmeId);
    if (hedef) hedef.classList.add("aktif");

    // Butonu da aktif yap (Basit yol: event.target kullanılabilir ama parametre olarak gelmiyor)
    // Bu yüzden tüm butonlardan kaldırıp tıklanana manuel class ekleme HTML tarafında onclick ile yapılabilir.
    // Şimdilik sadece içerik değişimi yeterli.
}
/* =========================================
   8. ADMIN PANELİ İŞLEMLERİ
   ========================================= */

function adminUrunleriListele() {
    const tabloBody = document.querySelector("#admin-urun-listesi");
    if (!tabloBody) return;

    tabloBody.innerHTML = "";

    tabloBody.innerHTML = "";

    // KULLANICI KONTROLÜ (Sadece kendi ürünlerini görsün)
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));
    const adminEmail = kullanici ? kullanici.email : "";

    // Satici alanı olmayanlar (sistem ürünleri) veya saticisi ben olanlar
    const filtrelenmis = urunler.filter(u => !u.satici || u.satici === adminEmail);

    // Reverse yaparak son eklenenleri en üste koy
    const tersListe = [...filtrelenmis].reverse();

    tersListe.forEach(u => {
        const fiyat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(u.fiyat);
        const stokDurumu = u.stok && u.stok < 5 ? 'color:red;' : 'color:green;';
        const stokSayi = u.stok ? u.stok : Math.floor(Math.random() * 20) + 1; // Stok yoksa rastgele ata

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${u.id}</td>
            <td><img src="${u.resim}" alt="Urun" width="50"></td>
            <td>${u.ad}</td>
            <td>${fiyat}</td>
            <td><span style="font-weight:bold; ${stokDurumu}">${stokSayi}</span></td>
            <td>
                <button class="islem-btn duzenle" onclick="urunDuzenle(${u.id})"><i class="fa fa-edit"></i></button>
                <button class="islem-btn sil" onclick="urunSil(${u.id})"><i class="fa fa-trash"></i></button>
            </td>
        `;
        tabloBody.appendChild(tr);
    });
}

// 1. Yeni Varyasyon KATEGORİSİ Ekle
function varyasyonSatiriEkle(baslik = "", degerler = []) {
    const container = document.getElementById("varyasyon-container");
    const mesaj = document.getElementById("varyasyon-yok-mesaj");
    if (mesaj) mesaj.style.display = "none";

    // Benzersiz ID oluştur
    const catId = "cat-" + Date.now() + Math.random().toString(36).substr(2, 9);

    const kutu = document.createElement("div");
    kutu.className = "varyasyon-kutu";
    kutu.id = catId;

    kutu.innerHTML = `
        <div class="secenek-baslik-row">
            <input type="text" value="${baslik}" placeholder="Özellik Adı (Örn: Renk, Kapasite)" class="var-kategori-adi" style="flex:1; padding:8px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold;">
            <button type="button" class="btn-mini btn-del-row" onclick="document.getElementById('${catId}').remove()">Sil</button>
        </div>
        <div class="degerler-wrapper">
            <!-- Değer satırları buraya -->
        </div>
        <div style="margin-top:10px;">
            <button type="button" class="btn-mini btn-add-val" onclick="varyasyonDegerEkle('${catId}')">+ Değer Ekle</button>
        </div>
    `;

    container.appendChild(kutu);

    // Eğer başlangıç değerleri varsa ekle, yoksa boş bir satır ekle
    if (degerler.length > 0) {
        degerler.forEach(d => {
            varyasyonDegerEkle(catId, d.deger, d.fiyat);
        });
    } else {
        varyasyonDegerEkle(catId);
    }
}

// 2. Yeni Varyasyon DEĞERİ Ekle
function varyasyonDegerEkle(catId, gelenDeger = "", gelenFiyat = "") {
    const kutu = document.getElementById(catId);
    if (!kutu) return;

    const wrapper = kutu.querySelector(".degerler-wrapper");

    const row = document.createElement("div");
    row.className = "deger-satir";

    row.innerHTML = `
        <div class="deger-container" style="flex:1; display:flex; gap:10px;">
            <input type="text" value="${gelenDeger}" placeholder="Değer (Örn: Kırmızı)" class="var-deger-adi" style="flex:2; padding:6px; border:1px solid #ddd; border-radius:4px;">
            <input type="number" value="${gelenFiyat}" placeholder="Ek Fiyat (TL)" class="var-deger-fiyat" style="flex:1; padding:6px; border:1px solid #ddd; border-radius:4px;">
        </div>
        <button type="button" class="btn-mini btn-del-row" onclick="this.parentElement.remove()" title="Bu değeri sil">x</button>
    `;

    wrapper.appendChild(row);
}

function urunEkle(event) {
    event.preventDefault();

    const ad = document.getElementById("yeni-urun-ad").value;
    const fiyat = parseFloat(document.getElementById("yeni-urun-fiyat").value);
    const stok = parseInt(document.getElementById("yeni-urun-stok").value);
    const duzenlenenId = document.getElementById("duzenlenen-urun-id").value;
    const resimInput = document.getElementById("yeni-urun-resim");

    // --> Resim İşleme
    let resimler = [];
    let anaResim = "";

    if (resimInput.files && resimInput.files.length > 0) {
        // Yeni resim seçildiyse onları al
        for (let i = 0; i < resimInput.files.length; i++) {
            resimler.push("../IMG/" + resimInput.files[i].name);
        }
        anaResim = resimler[0];
    }

    // --> Yeni Yapılandırılmış Varyasyonları Topla
    let yeniSecenekler = {};
    let yeniFiyatFarklari = {};

    const kategoriler = document.querySelectorAll("#varyasyon-container .varyasyon-kutu");

    kategoriler.forEach(kutu => {
        const kategoriAdi = kutu.querySelector(".var-kategori-adi").value.trim();
        if (!kategoriAdi) return;

        const degerSatirlari = kutu.querySelectorAll(".deger-satir");
        let kategorininDegerleri = [];

        degerSatirlari.forEach(satir => {
            const degerAdi = satir.querySelector(".var-deger-adi").value.trim();
            const ekFiyat = parseFloat(satir.querySelector(".var-deger-fiyat").value);

            if (degerAdi) {
                kategorininDegerleri.push(degerAdi);

                // Eğer ek fiyat varsa ve 0'dan büyükse veya negatifse ekle
                if (!isNaN(ekFiyat) && ekFiyat !== 0) {
                    yeniFiyatFarklari[`${kategoriAdi}|${degerAdi}`] = ekFiyat;
                }
            }
        });

        if (kategorininDegerleri.length > 0) {
            yeniSecenekler[kategoriAdi] = kategorininDegerleri;
        }
    });

    const kullanici = JSON.parse(localStorage.getItem("kullanici"));

    if (duzenlenenId) {
        // DÜZENLEME MODU
        const id = parseInt(duzenlenenId);
        const index = urunler.findIndex(u => u.id === id);

        if (index > -1) {
            // Güvenlik: Başkasının ürününü düzenlemeye çalışıyor mu?
            if (urunler[index].satici && urunler[index].satici !== kullanici.email) {
                alert("Bu ürünü düzenleme yetkiniz yok!");
                return;
            }

            urunler[index].ad = ad;
            urunler[index].fiyat = fiyat;
            urunler[index].stok = stok;
            urunler[index].secenekler = yeniSecenekler;
            urunler[index].fiyatFarklari = yeniFiyatFarklari;

            // Eğer yeni resim seçildiyse güncelle, yoksa eskisi kalsın
            if (resimler.length > 0) {
                urunler[index].resim = anaResim;
                urunler[index].resimler = resimler;
            }

            alert("Ürün başarıyla güncellendi!");
        }
    } else {
        // YENİ EKLEME MODU
        if (resimler.length === 0) {
            resimler.push("https://via.placeholder.com/150");
            anaResim = resimler[0];
        }

        const yeniId = urunler.length > 0 ? Math.max(...urunler.map(u => u.id)) + 1 : 100;

        const yeniUrun = {
            id: yeniId,
            ad: ad,
            kategori: "genel",
            fiyat: fiyat,
            stok: stok,
            resim: anaResim,
            resimler: resimler,
            aciklama: "Yeni eklenen ürün.",
            secenekler: yeniSecenekler,
            fiyatFarklari: yeniFiyatFarklari,
            satici: kullanici.email
        };

        urunler.push(yeniUrun);
        alert("Ürün başarıyla eklendi!");
    }

    localStorage.setItem("urunler", JSON.stringify(urunler));

    modalKapat();
    adminUrunleriListele();
}

function yeniUrunModalAc() {
    // Formu sıfırla
    document.querySelector(".modal-form").reset();
    document.getElementById("duzenlenen-urun-id").value = "";
    document.getElementById("modal-baslik").innerText = "Yeni Ürün Ekle";

    // Varyasyonları temizle
    document.getElementById("varyasyon-container").innerHTML = '<p id="varyasyon-yok-mesaj" style="font-size:0.85rem; color:#94a3b8; text-align:center;">Henüz seçenek eklenmedi.</p>';

    modalAc();
}

function urunDuzenle(id) {
    const urun = urunler.find(u => u.id === id);
    if (!urun) return;

    // Formu doldur
    document.getElementById("duzenlenen-urun-id").value = urun.id;
    document.getElementById("yeni-urun-ad").value = urun.ad;
    document.getElementById("yeni-urun-fiyat").value = urun.fiyat;
    document.getElementById("yeni-urun-stok").value = urun.stok || 0;

    document.getElementById("modal-baslik").innerText = "Ürün Düzenle: #" + urun.id;

    // Varyasyonları Doldur
    const container = document.getElementById("varyasyon-container");
    container.innerHTML = ""; // Temizle

    if (urun.secenekler && Object.keys(urun.secenekler).length > 0) {
        Object.entries(urun.secenekler).forEach(([kategori, degerler]) => {
            // Değerleri hazırla: [{deger: 'Red', fiyat: 100}, ...]
            let hazirlanmisDegerler = [];

            if (Array.isArray(degerler)) {
                degerler.forEach(d => {
                    let fiyatFarki = "";
                    const key = `${kategori}|${d}`;
                    if (urun.fiyatFarklari && urun.fiyatFarklari[key]) {
                        fiyatFarki = urun.fiyatFarklari[key];
                    }
                    hazirlanmisDegerler.push({ deger: d, fiyat: fiyatFarki });
                });
            }

            // Kategori ve altında değerlerini ekle
            varyasyonSatiriEkle(kategori, hazirlanmisDegerler);
        });
    } else {
        container.innerHTML = '<p id="varyasyon-yok-mesaj" style="font-size:0.85rem; color:#94a3b8; text-align:center;">Bu üründe seçenek yok.</p>';
    }

    modalAc();
}

function urunSil(id) {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
        urunler = urunler.filter(u => u.id !== id);
        localStorage.setItem("urunler", JSON.stringify(urunler));
        adminUrunleriListele();
    }
}

/* =========================================
   9. ADMIN PANEL SEKMELERİ VE RAPORLAR
   ========================================= */

// 4. Admin Panel Sekme Geçişi
function adminPanelGecis(sekmeId) {
    // Tüm bölümleri gizle
    document.querySelectorAll(".admin-bolum").forEach(div => div.style.display = "none");

    // İlgili bölümü göster
    const hedef = document.getElementById("bolum-" + sekmeId);
    if (hedef) hedef.style.display = "block";

    // Link aktiflik durumu
    document.querySelectorAll(".sidebar-link").forEach(a => a.classList.remove("active"));
    const link = document.getElementById("link-" + sekmeId);
    if (link) link.classList.add("active");

    // Verileri Yükle
    if (sekmeId === 'urunler') adminUrunleriListele();
    if (sekmeId === 'siparisler') adminSiparisleriListele();
    if (sekmeId === 'kullanicilar') adminKullanicilariListele();
    if (sekmeId === 'yorumlar') adminYorumlariListele();
    if (sekmeId === 'raporlar') adminRaporlariOlustur();
}

function adminSiparisleriListele() {
    const tablo = document.getElementById("admin-siparis-listesi");
    if (!tablo) return;

    tablo.innerHTML = "";
    const siparisler = JSON.parse(localStorage.getItem("siparisler")) || [];

    if (siparisler.length === 0) {
        tablo.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Henüz sipariş yok.</td></tr>";
        return;
    }

    [...siparisler].reverse().forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>#${s.siparisNo}</td>
            <td>${s.tarih}</td>
            <td>${s.kullaniciEmail || "Misafir"}</td>
            <td>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(s.tutar)}</td>
            <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:0.85rem;">${s.durum}</span></td>
        `;
        tablo.appendChild(tr);
    });
}

function adminKullanicilariListele() {
    const tablo = document.getElementById("admin-kullanici-listesi");
    if (!tablo) return;

    tablo.innerHTML = "";
    const kullanicilar = JSON.parse(localStorage.getItem("kullanicilar")) || [];

    [...kullanicilar].reverse().forEach(k => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${k.ad}</td>
            <td>${k.email}</td>
            <td>${k.telefon}</td>
            <td>${k.rol}</td>
            <td>${k.kayitTarihi || "-"}</td>
        `;
        tablo.appendChild(tr);
    });
}

function adminRaporlariOlustur() {
    const siparisler = JSON.parse(localStorage.getItem("siparisler")) || [];
    const kullanicilar = JSON.parse(localStorage.getItem("kullanicilar")) || [];

    // Toplam Satış
    const toplamSatis = siparisler.reduce((toplam, s) => toplam + s.tutar, 0);
    document.getElementById("rap-toplam-satis").innerText = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(toplamSatis);

    // Toplam Sipariş
    document.getElementById("rap-toplam-siparis").innerText = siparisler.length;

    // Toplam Ürün (Stok değil çeşit)
    document.getElementById("rap-toplam-urun").innerText = urunler.length;

    // Toplam Kullanıcı
    document.getElementById("rap-toplam-kullanici").innerText = kullanicilar.length;
}

function adminYorumlariListele() {
    const tablo = document.getElementById("admin-yorum-listesi");
    if (!tablo) return;

    tablo.innerHTML = "";
    let toplamYorum = 0;

    urunler.forEach(u => {
        // Bu ürünün yorumlarını al
        let yorumlar = JSON.parse(localStorage.getItem(`yorumlar_urun_${u.id}`)) || [];

        yorumlar.forEach((y, index) => {
            toplamYorum++;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.ad}</td>
                <td>${y.ad}</td>
                <td><span style="color:#f59e0b; font-weight:bold;">${y.puan} <i class="fa fa-star"></i></span></td>
                <td><small>${y.metin}</small></td>
                <td>${y.tarih}</td>
                <td>
                    <button class="islem-btn sil" onclick="adminYorumSil(${u.id}, ${index})"><i class="fa fa-trash"></i></button>
                </td>
            `;
            tablo.appendChild(tr);
        });
    });

    if (toplamYorum === 0) {
        tablo.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Henüz yorum yok.</td></tr>";
    }
}

function adminYorumSil(urunId, yorumIndex) {
    if (confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
        let yorumlar = JSON.parse(localStorage.getItem(`yorumlar_urun_${urunId}`)) || [];

        // Yorumu sil
        yorumlar.splice(yorumIndex, 1);

        // Kaydet
        localStorage.setItem(`yorumlar_urun_${urunId}`, JSON.stringify(yorumlar));

        // Listeyi yenile
        adminYorumlariListele();
    }
}


/* =========================================
   10. ARAMA MOTORU FONKSİYONLARI
   ========================================= */

function aramaMotorunuBaslat() {
    const aramaKutusu = document.querySelector(".arama-kutusu input");
    const aramaButonu = document.querySelector(".arama-kutusu button");

    if (!aramaKutusu || !aramaButonu) return;

    // Arama Yapma İşlemi
    function aramayaGit() {
        const terim = aramaKutusu.value.trim();
        if (terim.length > 0) {
            // Ürünler sayfasına 'ara' parametresiyle git
            // encodeURIComponent: Türkçe karakterleri ve boşlukları linke uygun hale getirir
            window.location.href = "products.php?ara=" + encodeURIComponent(terim);
        }
    }

    // 1. Butona Tıklayınca
    aramaButonu.onclick = aramayaGit;

    // 2. Enter Tuşuna Basınca
    aramaKutusu.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Formun varsayılan davranışını durdur
            aramayaGit();
        }
    });
}
/* =========================================
   11. ANA SAYFA SLIDER MEKANİZMASI
   ========================================= */
let slideIndex = 0;
let slideInterval;

// Sayfa yüklendiğinde slider'ı başlat (Sadece index.html'de varsa)
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".slider-container")) {
        sliderBaslat();
    }
});

function sliderBaslat() {
    // İlk slaytı göster
    gosterSlayt(slideIndex);
    // Otomatik döngüyü başlat (5 saniyede bir)
    slideInterval = setInterval(() => slaytDegistir(1), 5000);
}

function slaytDegistir(n) {
    // Manuel geçiş yapınca süreyi sıfırla ki karışmasın
    clearInterval(slideInterval);
    slideIndex += n;
    gosterSlayt(slideIndex);
    slideInterval = setInterval(() => slaytDegistir(1), 5000);
}

function slaytaGit(n) {
    clearInterval(slideInterval);
    slideIndex = n;
    gosterSlayt(slideIndex);
    slideInterval = setInterval(() => slaytDegistir(1), 5000);
}

function gosterSlayt(n) {
    const slides = document.getElementsByClassName("slide");
    const noktalar = document.getElementsByClassName("nokta");

    if (slides.length === 0) return;

    // Başa veya sona sarma mantığı
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;

    // Hepsini gizle
    for (let i = 0; i < slides.length; i++) {
        slides[i].classList.remove("aktif");
    }
    for (let i = 0; i < noktalar.length; i++) {
        noktalar[i].classList.remove("aktif");
    }

    // Seçileni göster
    slides[slideIndex].classList.add("aktif");
    if (noktalar.length > 0) noktalar[slideIndex].classList.add("aktif");
}