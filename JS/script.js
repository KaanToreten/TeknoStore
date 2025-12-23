/* =========================================
   1. VERİ VE SABİTLER (ÜRÜNLER - GÜNCELLENMİŞ)
   ========================================= */
let urunler = JSON.parse(localStorage.getItem("urunler"));

if (!urunler || urunler.length === 0) {
    urunler = [
        {
            id: 1,
            ad: "MacBook Pro M3",
            kategori: "bilgisayar",
            fiyat: 75000,
            resim: "../IMG/macbook.jpg",
            stok: 15,
            aciklama: "Yeni nesil Apple M3 Pro çip ile güçlendirilmiş MacBook Pro.",
            secenekler: { "Renk": ["Gümüş", "Uzay Grisi"], "RAM": ["16GB", "32GB"], "SSD": ["512GB", "1TB"] },
            // YENİ EKLENEN KISIM: Fiyat Farkları
            fiyatFarklari: {
                "RAM|32GB": 8000,   // 32GB seçilirse 8000 TL ekle
                "SSD|1TB": 5000     // 1TB seçilirse 5000 TL ekle
            }
        },
        {
            id: 2,
            ad: "iPhone 15 Pro",
            kategori: "telefon",
            fiyat: 65000,
            resim: "../IMG/iphone15pro.jpg",
            stok: 10,
            aciklama: "Havacılık sınıfı titanyum tasarım. A17 Pro çip.",
            secenekler: { "Renk": ["Titanyum Mavi", "Titanyum Naturel", "Siyah"], "Hafıza": ["128GB", "256GB", "512GB"] },
            // YENİ EKLENEN KISIM
            fiyatFarklari: {
                "Hafıza|256GB": 4000,
                "Hafıza|512GB": 9000
            }
        },
        {
            id: 3,
            ad: "Sony WH-1000XM5",
            kategori: "aksesuar",
            fiyat: 12000,
            resim: "../IMG/kulaklik.jpg",
            stok: 25,
            aciklama: "Endüstri lideri gürültü engelleme.",
            secenekler: { "Renk": ["Siyah", "Gümüş"] }
            // Fiyat farkı yoksa yazmana gerek yok
        },
        {
            id: 4,
            ad: "iPad Air 5",
            kategori: "tablet",
            fiyat: 22000,
            resim: "../IMG/ipad5air.png",
            stok: 8,
            aciklama: "Apple M1 çipin çığır açan performansı.",
            secenekler: { "Renk": ["Uzay Grisi", "Mavi", "Pembe"], "Hafıza": ["64GB", "256GB"], "Bağlantı": ["Wi-Fi", "Wi-Fi + Cellular"] },
            fiyatFarklari: {
                "Hafıza|256GB": 3000,
                "Bağlantı|Wi-Fi + Cellular": 4500
            }
        },
        {
            id: 5,
            ad: "Dell XPS 15",
            kategori: "bilgisayar",
            fiyat: 85000,
            resim: "../IMG/notebook.jpg",
            stok: 5,
            aciklama: "Sınırları zorlayan performans.",
            secenekler: { "İşlemci": ["i7", "i9"], "RAM": ["16GB", "32GB"], "Ekran": ["FHD+", "OLED 3.5K"] },
            fiyatFarklari: {
                "İşlemci|i9": 10000,
                "RAM|32GB": 4000,
                "Ekran|OLED 3.5K": 6000
            }
        },
        {
            id: 6,
            ad: "Logitech MX Master 3S",
            kategori: "aksesuar",
            fiyat: 4500,
            resim: "../IMG/mouse.jpg",
            stok: 40,
            aciklama: "Simgeleşmiş MX Master 3S.",
            secenekler: { "Renk": ["Grafit", "Açık Gri"] }
        }
    ];
    localStorage.setItem("urunler", JSON.stringify(urunler));
}

let secilenVaryasyonlar = {};
let aktifIndirimOrani = 0; // Kupon için

/* =========================================
   2. SAYFA YÜKLENME YÖNETİMİ (INIT)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {

    // Genel Başlatıcılar
    sepetGuncelle();
    oturumHeaderKontrol();
    aramaMotorunuBaslat();

    // Sayfaya Göre Çalışacak Kodlar
    const path = window.location.pathname;

    // 1. Ürün Listeleme Sayfası (products.html veya index.html)
    if (document.getElementById("urun-listesi")) {
        urunleriListele();
    }

    // 2. Sepet Sayfası (cart.html)
    if (document.querySelector(".sepet-listesi")) {
        sepetSayfasiniDoldur();
    }

    // 3. Detay Sayfası (detail.html)
    if (path.includes("detail.html")) {
        detaySayfasiniYukle();
    }

    // 4. Login/Register Sayfası (Slider Animasyonu)
    const container = document.getElementById('container');
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    if (container && signUpButton && signInButton) {
        signUpButton.addEventListener('click', () => container.classList.add("right-panel-active"));
        signInButton.addEventListener('click', () => container.classList.remove("right-panel-active"));
    }


    // 5. Admin Sayfası
    if (path.includes("admin.html")) {
        adminUrunleriListele();
    }
});


/* =========================================
   3. SEPET YÖNETİMİ (MERKEZİ)
   ========================================= */

// Sepete Ekle (Listeden Hızlı Ekleme)
// YARDIMCI: Sepet Anahtarını Belirle (Her kullanıcı için ayrı)
function getSepetKey() {
    const oturum = localStorage.getItem("oturum");
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));
    if (oturum === "aktif" && kullanici && kullanici.email) {
        return `sepet_${kullanici.email}`;
    }
    return "sepet";
}

// LocalStorage'dan Kullanıcıları Al veya Mock Data Yükle
let kullanicilar = JSON.parse(localStorage.getItem("kullanicilar"));
if (!kullanicilar || kullanicilar.length === 0) {
    kullanicilar = [
        { ad: "Ahmet Yılmaz", email: "ahmet@gmail.com", telefon: "05554443322", rol: "musteri", kayitTarihi: "01.01.2024" },
        { ad: "Mehmet Demir", email: "mehmet@test.com", telefon: "05321234567", rol: "musteri", kayitTarihi: "15.02.2024" },
        { ad: "Ayşe Kaya", email: "ayse@demo.com", telefon: "05449876543", rol: "musteri", kayitTarihi: "20.03.2024" }
    ];
    localStorage.setItem("kullanicilar", JSON.stringify(kullanicilar));
}

function sepeteEkle(id) {
    const urun = urunler.find(u => u.id === id);
    // Hızlı eklemede varsayılan varyasyonlar seçilmediği için boş gönderiyoruz
    // veya ilk seçenekleri otomatik seçtirebilirsin. Basitlik için direkt ekliyoruz.
    detaydanSepeteEkle(urun, true);
}

// Detay Sayfasından Sepete Ekle (Varyasyonlu)
// Detay Sayfasından Sepete Ekle (FİYAT HESAPLAMALI VERSİYON)
function detaydanSepeteEkle(urun, hizliEkle = false) {
    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];
    let adet = 1;

    // Adet bilgisini al
    if (!hizliEkle && document.getElementById("urun-adet")) {
        adet = parseInt(document.getElementById("urun-adet").value);
    }

    // --- FİYAT HESAPLAMA (DÜZELTİLEN KISIM) ---
    let guncelFiyat = urun.fiyat; // Başlangıç fiyatı
    let varyasyonMetni = "";

    if (!hizliEkle && Object.keys(secilenVaryasyonlar).length > 0) {
        // Seçilen özelliklere göre fiyatı artır
        for (const [baslik, deger] of Object.entries(secilenVaryasyonlar)) {
            const key = `${baslik}|${deger}`; // Örn: "Hafıza|256GB"

            // Eğer bu özellik için bir fiyat farkı tanımlıysa ekle
            if (urun.fiyatFarklari && urun.fiyatFarklari[key]) {
                guncelFiyat += urun.fiyatFarklari[key];
            }
        }

        // Metni oluştur (Örn: "Renk: Siyah, Hafıza: 256GB")
        varyasyonMetni = Object.entries(secilenVaryasyonlar)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ");
    }
    else if (hizliEkle && urun.secenekler) {
        varyasyonMetni = "Varsayılan Seçenekler";
    }
    // ------------------------------------------

    // Benzersiz Sepet ID'si (Ürün ID + Özellikler)
    const sepetId = urun.id + "_" + varyasyonMetni.replace(/\s/g, '');

    const varMi = sepet.find(item => item.sepetId === sepetId);

    if (varMi) {
        varMi.adet += adet;
        // Fiyatı güncelle (Belki kullanıcı daha önce eski fiyattan eklemiştir)
        varMi.fiyat = guncelFiyat;
    } else {
        sepet.push({
            id: urun.id,
            sepetId: sepetId,
            ad: urun.ad,
            fiyat: guncelFiyat, // ARTIK HESAPLANMIŞ FİYATI KAYDEDİYORUZ
            resim: urun.resim,
            ozellik: varyasyonMetni,
            adet: adet
        });
    }

    localStorage.setItem(sepetKey, JSON.stringify(sepet));
    sepetGuncelle();
    alert(`${urun.ad} sepete eklendi! (Birim Fiyat: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(guncelFiyat)})`);
}

// Headerdaki Sepet Sayacını Güncelle
function sepetGuncelle() {
    let sepet = JSON.parse(localStorage.getItem(getSepetKey())) || [];
    const toplamAdet = sepet.reduce((toplam, urun) => toplam + urun.adet, 0);
    document.querySelectorAll("#sepet-sayac").forEach(el => el.innerText = toplamAdet);
}

// Sepet Sayfasını Doldur (Ve Boşsa Ortala)
function sepetSayfasiniDoldur() {
    const sepetListesi = document.querySelector(".sepet-listesi");
    const sepetWrapper = document.querySelector(".sepet-wrapper");
    const ozetAlan = document.querySelector(".sepet-ozeti");

    if (!sepetListesi) return;

    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];

    // --- TAMİR KODU (Eski verileri düzelt) ---
    sepet = sepet.map(u => {
        if (!u.sepetId) u.sepetId = u.id + "_" + Math.random().toString(36).substr(2, 5);
        return u;
    });
    localStorage.setItem(sepetKey, JSON.stringify(sepet));
    // ----------------------------------------

    sepetListesi.innerHTML = "";

    // DURUM: SEPET BOŞ
    if (sepet.length === 0) {
        // CSS ile ortalamak için wrapper'a 'bos' sınıfı ekle
        if (sepetWrapper) sepetWrapper.classList.add("bos");

        sepetListesi.innerHTML = `
            <div class="bos-sepet-mesaj">
                <i class="fa fa-shopping-basket" style="font-size:60px; color:#cbd5e1; margin-bottom:20px;"></i>
                <h3 style="color:#334155;">Sepetiniz şu an boş.</h3>
                <p style="color:#64748b; margin-bottom:20px;">Hemen alışverişe başlayıp harika ürünleri keşfedin!</p>
                <a href="products.html" class="btn-primary" style="display:inline-block; padding:12px 30px; background:var(--primary-color); color:white; border-radius:8px; text-decoration:none; font-weight:600;">Alışverişe Başla</a>
            </div>`;
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

    document.getElementById("ara-toplam").innerText = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(araToplam);
    document.getElementById("genel-toplam").innerText = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(genelToplam);

    // İndirim Gösterimi
    const indirimSatiri = document.getElementById("indirim-satiri");
    if (aktifIndirimOrani > 0 && indirimSatiri) {
        indirimSatiri.style.display = "flex";
        document.getElementById("indirim-orani").innerText = `%${aktifIndirimOrani * 100}`;
        document.getElementById("indirim-tutari").innerText = `-${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(indirimTutari)}`;
    } else if (indirimSatiri) {
        indirimSatiri.style.display = "none";
    }
}

// Miktar Güncelle ve Sil
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

function sepettenSil(sepetId) {
    let sepetKey = getSepetKey();
    let sepet = JSON.parse(localStorage.getItem(sepetKey)) || [];
    sepet = sepet.filter(u => u.sepetId !== sepetId);
    localStorage.setItem(sepetKey, JSON.stringify(sepet));
    sepetSayfasiniDoldur();
    sepetGuncelle();
}

/* =========================================
   4. DETAY SAYFASI & SEÇENEKLER
   ========================================= */
function detaySayfasiniYukle() {
    const urlParams = new URLSearchParams(window.location.search);
    const urunId = parseInt(urlParams.get('id'));
    const urun = urunler.find(u => u.id === urunId);

    if (urun) {
        // İçerikleri Doldur
        document.getElementById("detay-img").src = urun.resim;
        document.getElementById("detay-baslik").innerText = urun.ad;
        document.getElementById("detay-aciklama").innerText = urun.aciklama;
        document.getElementById("detay-fiyat").innerText = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(urun.fiyat);

        // Galeri ve Yorumlar
        galeriOlustur(urun.resim, urun.id);
        yorumListesiniGetir(urunId); // Bu fonksiyonun ismi de değişmiş olabilir, kontrol ettim aşağıda "yorumListesiniGetir" yok, direkt listeleme yapılıyor. Düzeltiyorum.
        puanlariGuncelle(urun.id); // Puanları göster
        yorumFormunuAyarla(); // Formun görünürlüğünü ayarla

        // Seçenekleri Oluştur
        secenekleriOlustur(urun.secenekler);

        // Sepet Butonu Bağla
        const btn = document.getElementById("detay-sepete-ekle-btn");
        if (btn) btn.onclick = () => detaydanSepeteEkle(urun);
    }
}

function secenekleriOlustur(seceneklerData) {
    const container = document.getElementById("urun-secenekleri-container");
    if (!container) return;

    container.innerHTML = "";
    secilenVaryasyonlar = {};

    if (!seceneklerData) return;

    for (const [baslik, degerler] of Object.entries(seceneklerData)) {
        secilenVaryasyonlar[baslik] = degerler[0]; // İlkini seç

        const grup = document.createElement("div");
        grup.className = "secenek-grubu";
        grup.innerHTML = `<h4>${baslik}:</h4>`;

        const btnDiv = document.createElement("div");
        btnDiv.className = "secenek-butonlari";

        degerler.forEach((deger, i) => {
            const btn = document.createElement("button");
            btn.className = `varyasyon-btn ${i === 0 ? 'secili' : ''}`;
            btn.innerText = deger;
            btn.onclick = function () {
                btnDiv.querySelectorAll(".varyasyon-btn").forEach(b => b.classList.remove("secili"));
                this.classList.add("secili");
                secilenVaryasyonlar[baslik] = deger;

                // Fiyatı Güncelle
                const urun = urunler.find(u => u.id === parseInt(new URLSearchParams(window.location.search).get('id')));
                fiyatGuncelle(urun);
            };
            btnDiv.appendChild(btn);
        });
        grup.appendChild(btnDiv);
        container.appendChild(grup);
    }
}

function fiyatGuncelle(urun) {
    if (!urun) return;
    let guncelFiyat = urun.fiyat;

    // Seçili varyasyonların fiyat farklarını ekle
    for (const [baslik, deger] of Object.entries(secilenVaryasyonlar)) {
        // Anahtar oluştur: "RAM|32GB"
        const farkKey = `${baslik}|${deger}`;
        if (urun.fiyatFarklari && urun.fiyatFarklari[farkKey]) {
            guncelFiyat += parseInt(urun.fiyatFarklari[farkKey]);
        }
    }

    const formatliFiyat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(guncelFiyat);
    const fiyatLabel = document.getElementById("detay-fiyat");

    // Animasyonlu Geçiş (Basit)
    fiyatLabel.style.opacity = 0;
    setTimeout(() => {
        fiyatLabel.innerText = formatliFiyat;
        fiyatLabel.style.opacity = 1;
    }, 150);
}

/* =========================================
   5. DİĞER FONKSİYONLAR (GALERİ, LOGIN, KUPON)
   ========================================= */
/* --- GELİŞMİŞ GALERİ FONKSİYONU (RESİMLERİ GETİRİR) --- */
function galeriOlustur(anaResim, urunId) {
    const container = document.getElementById("galeri-container");
    if (!container) return;

    container.innerHTML = ""; // Önce temizle

    // Ürün ID'sine göre resim listesi (Senin dosya isimlerine göre ayarladım)
    let galeriResimleri = [];
    const id = parseInt(urunId);

    // YENİ: Otomatik Galeri (Veriden Gelen)
    const urunVerisi = urunler.find(u => u.id === id);
    if (urunVerisi && urunVerisi.resimler && urunVerisi.resimler.length > 0) {
        galeriResimleri = urunVerisi.resimler;
    } else {
        // ESKİ: Hardcoded ID Kontrolü (Geriye Dönük Uyumluluk)
        switch (id) {
            case 1: // MacBook
                galeriResimleri = ["../IMG/macbook.jpg", "../IMG/macbook_1.jpg", "../IMG/macbook_2.jpg", "../IMG/macbook_3.jpg"];
                break;
            case 2: // iPhone
                galeriResimleri = ["../IMG/iphone15pro.jpg", "../IMG/iphone15pro_1.jpg", "../IMG/iphone15pro_2.jpg", "../IMG/iphone15pro_3.jpg"];
                break;
            case 3: // Kulaklık
                galeriResimleri = ["../IMG/kulaklik.jpg", "../IMG/kulaklik_1.jpg", "../IMG/kulaklik_2.jpg", "../IMG/kulaklik_3.jpg"];
                break;
            case 4: // iPad
                galeriResimleri = ["../IMG/ipad5air.png", "../IMG/ipad5air_1.png", "../IMG/ipad5air_2.png", "../IMG/ipad5air_3.png"];
                break;
            case 5: // Laptop (Dell)
                galeriResimleri = ["../IMG/notebook.jpg", "../IMG/notebook_1.jpg", "../IMG/notebook_2.jpg", "../IMG/notebook_3.jpg"];
                break;
            case 6: // Mouse
                galeriResimleri = ["../IMG/mouse.jpg", "../IMG/mouse_1.jpg", "../IMG/mouse_2.jpg", "../IMG/mouse_3.jpg"];
                break;
            default:
                // Eğer özel resim yoksa sadece ana resmi koy
                galeriResimleri = [anaResim];
        }
    }

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
    const btn = document.querySelector('header a[href="login.html"], header a[href="account.html"]');
    if (btn) {
        if (oturum === "aktif") {
            btn.href = "account.html";
            btn.innerHTML = '<i class="fa fa-user-circle"></i> Hesabım';
        } else {
            btn.href = "login.html";
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
                <p>Lütfen farklı anahtar kelimelerle tekrar deneyin veya <a href="products.html" style="color:blue;">Tüm Ürünleri</a> inceleyin.</p>
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
                    <button onclick="window.location.href='detail.html?id=${u.id}'">İncele</button>
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
        window.location.href = "admin.html";
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
    window.location.href = "index.html";
}

// ÇIKIŞ YAP
function cikisYap() {
    if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
        localStorage.removeItem("oturum");
        // localStorage.removeItem("kullanici"); // İsteğe bağlı: Kullanıcıyı hatırlamak istersen silme
        window.location.href = "index.html";
    }
}

function adminCikis() {
    if (confirm("Yönetim panelinden çıkmak istediğinize emin misiniz?")) {
        localStorage.removeItem("oturum");
        window.location.href = "login.html";
    }
}

/* =========================================
   7. HESAP VE SİPARİŞ YÖNETİMİ
   ========================================= */

// HESAP SAYFASINI DOLDUR (account.html)
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("account.html")) {
        hesapSayfasiniYukle();
    }
});

function hesapSayfasiniYukle() {
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));

    if (!kullanici) {
        window.location.href = "login.html";
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
    if (window.location.pathname.includes("checkout.html")) {
        checkoutYukle();
    }
});

function checkoutYukle() {
    // 1. Kullanıcı Kontrolü
    const kullanici = JSON.parse(localStorage.getItem("kullanici"));
    if (!kullanici) {
        alert("Sipariş vermek için giriş yapmalısınız.");
        window.location.href = "login.html";
        return;
    }

    // 2. Sipariş Özetini Getir
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    const ozetDiv = document.getElementById("checkout-ozet");

    if (ozetDiv) {
        let toplam = 0;
        ozetDiv.innerHTML = "";

        sepet.forEach(u => {
            toplam += u.fiyat * u.adet;
            ozetDiv.innerHTML += `
                <div class="ozet-satir">
                    <span>${u.ad} (x${u.adet})</span>
                    <span>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(u.fiyat * u.adet)}</span>
                </div>`;
        });

        ozetDiv.innerHTML += `
            <div class="ozet-toplam">
                <span>Toplam</span>
                <span>${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(toplam)}</span>
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

// SİPARİŞİ VE ADRESİ KAYDET (checkout.html)
function siparisiTamamla() {
    const baslik = document.getElementById("adres-baslik").value;
    const sehir = document.getElementById("adres-sehir").value;
    const acik = document.getElementById("adres-acik").value;
    const kaydetCheckbox = document.getElementById("adresi-kaydet");

    if (!baslik || !sehir || !acik) {
        alert("Lütfen adres bilgilerini eksiksiz doldurun.");
        return;
    }

    let kullanici = JSON.parse(localStorage.getItem("kullanici"));

    // 1. Adresi Kaydetme İsteği
    if (kaydetCheckbox && kaydetCheckbox.checked) {
        if (!kullanici.adresler) kullanici.adresler = [];

        // Aynı başlık varsa ekleme yapma basit kontrolü
        const varMi = kullanici.adresler.find(a => a.baslik === baslik);
        if (!varMi) {
            kullanici.adresler.push({ baslik: baslik, sehir: sehir, acik: acik });
            localStorage.setItem("kullanici", JSON.stringify(kullanici));
        }
    }

    // 2. Siparişi Oluştur
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    if (sepet.length === 0) { alert("Sepetiniz boş!"); return; }

    const toplamTutar = sepet.reduce((top, urun) => top + (urun.fiyat * urun.adet), 0);

    const yeniSiparis = {
        siparisNo: Math.floor(Math.random() * 900000) + 100000,
        tarih: new Date().toLocaleDateString('tr-TR'),
        tutar: toplamTutar,
        durum: "Hazırlanıyor",
        teslimatAdresi: `${baslik} (${sehir})`,
        kullaniciEmail: kullanici.email, // EKLENDİ: Siparişi kullanıcıya bağla
        urunler: sepet
    };

    let siparisler = JSON.parse(localStorage.getItem("siparisler")) || [];
    siparisler.push(yeniSiparis);
    localStorage.setItem("siparisler", JSON.stringify(siparisler));

    // Sepeti Temizle
    localStorage.removeItem("sepet");

    alert(`Siparişiniz Başarıyla Alındı! \nSipariş No: #${yeniSiparis.siparisNo}`);
    window.location.href = "account.html";
}

// Diğer yardımcı fonksiyonlar...
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
            window.location.href = `products.html?ara=${encodeURIComponent(terim)}`;
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