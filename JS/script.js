/* =========================================
   1. VERİ VE SABİTLER (ÜRÜNLER)
   ========================================= */
const urunler = [
    {
        id: 1,
        ad: "MacBook Pro M3",
        kategori: "bilgisayar",
        fiyat: 75000,
        resim: "../IMG/macbook.jpg",
        aciklama: "Yeni nesil Apple M3 Pro çip ile güçlendirilmiş MacBook Pro, en yoğun iş yüklerinin altından kalkar. 20 saate kadar pil ömrü.",
        secenekler: { "Renk": ["Gümüş", "Uzay Grisi"], "RAM": ["16GB", "32GB"], "SSD": ["512GB", "1TB"] }
    },
    {
        id: 2,
        ad: "iPhone 15 Pro",
        kategori: "telefon",
        fiyat: 65000,
        resim: "../IMG/iphone15pro.jpg",
        aciklama: "Havacılık sınıfı titanyum tasarım. A17 Pro çip oyunun kurallarını değiştiriyor. 48 MP Ana kamera.",
        secenekler: { "Renk": ["Titanyum Mavi", "Titanyum Naturel", "Siyah"], "Hafıza": ["128GB", "256GB", "512GB"] }
    },
    {
        id: 3,
        ad: "Sony WH-1000XM5",
        kategori: "aksesuar",
        fiyat: 12000,
        resim: "../IMG/kulaklik.jpg",
        aciklama: "Endüstri lideri gürültü engelleme özelliği ile sadece müziğe odaklanın. 30 saat pil ömrü.",
        secenekler: { "Renk": ["Siyah", "Gümüş"] }
    },
    {
        id: 4,
        ad: "iPad Air 5",
        kategori: "tablet",
        fiyat: 22000,
        resim: "../IMG/ipad5air.png",
        aciklama: "Apple M1 çipin çığır açan performansı şimdi Air'de. 10.9 inç Liquid Retina ekran.",
        secenekler: { "Renk": ["Uzay Grisi", "Mavi", "Pembe"], "Hafıza": ["64GB", "256GB"], "Bağlantı": ["Wi-Fi", "Wi-Fi + Cellular"] }
    },
    {
        id: 5,
        ad: "Dell XPS 15",
        kategori: "bilgisayar",
        fiyat: 85000,
        resim: "../IMG/notebook.jpg",
        aciklama: "Sınırları zorlayan performans. 12. Nesil Intel® Core™ i9 işlemci ve 4K InfinityEdge ekran.",
        secenekler: { "İşlemci": ["i7", "i9"], "RAM": ["16GB", "32GB"], "Ekran": ["FHD+", "OLED 3.5K"] }
    },
    {
        id: 6,
        ad: "Logitech MX Master 3S",
        kategori: "aksesuar",
        fiyat: 4500,
        resim: "../IMG/mouse.jpg",
        aciklama: "Simgeleşmiş MX Master 3S, şimdi 'Sessiz Tıklama' özelliğiyle. Cam dahil her yüzeyde çalışan sensör.",
        secenekler: { "Renk": ["Grafit", "Açık Gri"] }
    }
];

let secilenVaryasyonlar = {};
let aktifIndirimOrani = 0; // Kupon için

/* =========================================
   2. SAYFA YÜKLENME YÖNETİMİ (INIT)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {

    // Genel Başlatıcılar
    sepetGuncelle();
    oturumHeaderKontrol();

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
});


/* =========================================
   3. SEPET YÖNETİMİ (MERKEZİ)
   ========================================= */

// Sepete Ekle (Listeden Hızlı Ekleme)
function sepeteEkle(id) {
    const urun = urunler.find(u => u.id === id);
    // Hızlı eklemede varsayılan varyasyonlar seçilmediği için boş gönderiyoruz
    // veya ilk seçenekleri otomatik seçtirebilirsin. Basitlik için direkt ekliyoruz.
    detaydanSepeteEkle(urun, true);
}

// Detay Sayfasından Sepete Ekle (Varyasyonlu)
function detaydanSepeteEkle(urun, hizliEkle = false) {
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    let adet = 1;

    // Eğer detay sayfasındaysak inputtan adeti al
    if (!hizliEkle && document.getElementById("urun-adet")) {
        adet = parseInt(document.getElementById("urun-adet").value);
    }

    // Varyasyon Metni Oluştur
    let varyasyonMetni = "";
    if (!hizliEkle && Object.keys(secilenVaryasyonlar).length > 0) {
        varyasyonMetni = Object.entries(secilenVaryasyonlar)
            .map(([key, val]) => `${key}: ${val}`)
            .join(", ");
    } else if (hizliEkle && urun.secenekler) {
        // Hızlı eklemede varsayılan ilk seçenekleri al
        varyasyonMetni = "Varsayılan Seçenekler";
    }

    // Benzersiz Sepet ID'si (Ürün ID + Özellikler)
    const sepetId = urun.id + "_" + varyasyonMetni.replace(/\s/g, '');

    const varMi = sepet.find(item => item.sepetId === sepetId);

    if (varMi) {
        varMi.adet += adet;
    } else {
        sepet.push({
            id: urun.id,
            sepetId: sepetId,
            ad: urun.ad,
            fiyat: urun.fiyat,
            resim: urun.resim,
            ozellik: varyasyonMetni,
            adet: adet
        });
    }

    localStorage.setItem("sepet", JSON.stringify(sepet));
    sepetGuncelle();
    alert(`${urun.ad} sepete eklendi!`);
}

// Headerdaki Sepet Sayacını Güncelle
function sepetGuncelle() {
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    const toplamAdet = sepet.reduce((toplam, urun) => toplam + urun.adet, 0);
    document.querySelectorAll("#sepet-sayac").forEach(el => el.innerText = toplamAdet);
}

// Sepet Sayfasını Doldur (Ve Boşsa Ortala)
function sepetSayfasiniDoldur() {
    const sepetListesi = document.querySelector(".sepet-listesi");
    const sepetWrapper = document.querySelector(".sepet-wrapper");
    const ozetAlan = document.querySelector(".sepet-ozeti");

    if (!sepetListesi) return;

    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];

    // --- TAMİR KODU (Eski verileri düzelt) ---
    sepet = sepet.map(u => {
        if (!u.sepetId) u.sepetId = u.id + "_" + Math.random().toString(36).substr(2, 5);
        return u;
    });
    localStorage.setItem("sepet", JSON.stringify(sepet));
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
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    const index = sepet.findIndex(u => u.sepetId === sepetId);

    if (index > -1) {
        sepet[index].adet += degisim;
        if (sepet[index].adet < 1) {
            if (confirm("Ürünü silmek istiyor musunuz?")) sepet.splice(index, 1);
            else sepet[index].adet = 1;
        }
        localStorage.setItem("sepet", JSON.stringify(sepet));
        sepetSayfasiniDoldur();
        sepetGuncelle();
    }
}

function sepettenSil(sepetId) {
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    sepet = sepet.filter(u => u.sepetId !== sepetId);
    localStorage.setItem("sepet", JSON.stringify(sepet));
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
        yorumListesiniGetir(urunId);
        yorumFormunuAyarla();

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
            };
            btnDiv.appendChild(btn);
        });
        grup.appendChild(btnDiv);
        container.appendChild(grup);
    }
}

/* =========================================
   5. DİĞER FONKSİYONLAR (GALERİ, YORUM, LOGIN, KUPON)
   ========================================= */
/* --- GELİŞMİŞ GALERİ FONKSİYONU (RESİMLERİ GETİRİR) --- */
function galeriOlustur(anaResim, urunId) {
    const container = document.getElementById("galeri-container");
    if (!container) return;

    container.innerHTML = ""; // Önce temizle

    // Ürün ID'sine göre resim listesi (Senin dosya isimlerine göre ayarladım)
    let galeriResimleri = [];
    const id = parseInt(urunId);

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

function yorumFormunuAyarla() {
    const form = document.getElementById("yorum-formu-container");
    const uyari = document.getElementById("giris-uyari-kutu");
    if (form && uyari) {
        if (localStorage.getItem("oturum") === "aktif") {
            form.style.display = "block"; uyari.style.display = "none";
        } else {
            form.style.display = "none"; uyari.style.display = "block";
        }
    }
}

// Basit Yorum Listeleme
function yorumListesiniGetir(id) {
    const kutu = document.getElementById("yorum-listesi-kutu");
    if (!kutu) return;
    let yorumlar = JSON.parse(localStorage.getItem(`yorumlar_urun_${id}`)) || [];
    const ozet = document.getElementById("yorum-sayisi-ozet");

    if (yorumlar.length === 0) {
        kutu.innerHTML = '<p style="color:#777;">Henüz yorum yok.</p>';
        if (ozet) ozet.innerText = "(0 Değerlendirme)";
    } else {
        if (ozet) ozet.innerText = `(${yorumlar.length} Değerlendirme)`;
        kutu.innerHTML = yorumlar.map(y => `
            <div class="yorum-kart">
                <div class="yorum-baslik"><b>${y.ad}</b> <small>${y.tarih}</small></div>
                <p>${y.metin}</p>
            </div>
        `).join("");
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
    const urlParams = new URLSearchParams(window.location.search);
    const kat = urlParams.get('kategori');

    if (!kutu) return;
    kutu.innerHTML = "";

    const liste = kat ? urunler.filter(u => u.kategori === kat) : urunler;

    if (liste.length === 0) { kutu.innerHTML = "<p>Ürün bulunamadı.</p>"; return; }

    liste.forEach(u => {
        const fiyat = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(u.fiyat);
        kutu.innerHTML += `
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
}