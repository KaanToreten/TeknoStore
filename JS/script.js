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
            };
            btnDiv.appendChild(btn);
        });
        grup.appendChild(btnDiv);
        container.appendChild(grup);
    }
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
        telefon: telefon,
        rol: "musteri",
        kayitTarihi: new Date().toLocaleDateString('tr-TR'),
        adresler: [] // Boş adres dizisi başlat
    };

    // Geçici kayıt olarak sakla (Giriş yapınca asıl kullanıcı olacak)
    localStorage.setItem("geciciKayit", JSON.stringify(yeniKullanici));

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

    // Eğer girilen mail, son kayıt olan mail ile uyuşmuyorsa demo hesap oluştur
    if (!kayitliUser || kayitliUser.email !== email) {
        kayitliUser = {
            ad: "Misafir Kullanıcı",
            email: email,
            telefon: "05XX XXX XX XX",
            rol: "musteri",
            adresler: []
        };
    }

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
