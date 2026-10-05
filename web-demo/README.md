# MEB Sorumluluk Sınavları Sistemi — Web Demo Sürümü

Bu klasör, ana masaüstü uygulamasının kodlarına ve lisanslama yapısına hiçbir şekilde dokunmadan, web sitenizde doğrudan yayınlayabileceğiniz **tek dosyalık (standalone) basitleştirilmiş HTML/JS demo** içerir.

---

## 🎯 Özellikler ve Kısıtlamalar

1. **Lisanssız Çalışma:**
   - Herhangi bir veritabanı veya lisans sunucusuna ihtiyaç duymaz.
   - Tarayıcıda doğrudan (çevrimdışı dahi) çalışabilir.

2. **5 Sınav Limiti (Demo Kotası):**
   - Kullanıcı sistemde en fazla **5 sınav** oluşturabilir.
   - 6. sınavı eklemek istediğinde veya "Tam Sürüme Yükselt" butonlarına tıkladığında otomatik olarak **Satın Alma & İletişim Modal Penceresi** açılır.

3. **Örnek Modüller:**
   - **Gösterge Paneli (Dashboard):** Sınav kotası durumu, aktif sayaçlar ve hızlı istatistikler.
   - **📥 e-Okul & Excel İçe Aktarma (Tanıtım):** e-Okul öğrenci listesi ve MEBBİS öğretmen kadrosunu tek tıkla canlı simüle eden interaktif test merkezi.
   - **Sınav Takvimi:** Sınav ekleme, silme ve detayları inceleme.
   - **Öğretmenler & Komisyon:** Branş ve görev yükü dağılımı.
   - **Öğrenci Dağılımı:** Salon ve öğrenci listesi.
   - **Resmi MEB Çıktısı (Önizleme):** Yazdırmaya uygun, üzerinde *"DEMO SÜRÜM — EN FAZLA 5 SINAV"* filigranı bulunan resmi evrak önizlemesi.

---

## 🚀 Nasıl Test Edilir?

1. [`web-demo/index.html`](index.html) dosyasına çift tıklayarak herhangi bir tarayıcıda (Chrome, Edge, Firefox vb.) hemen açabilirsiniz.
2. Hiçbir kurulum veya `npm` komutu gerektirmez.

---

## 🌐 Web Sayfasında Nasıl Yayınlanır?

- **Kendi Web Sitenize:** `index.html` dosyasını sunucunuzda `/demo/` veya `/sorumluluk-demo/` klasörüne yüklemeniz yeterlidir.
- **GitHub Pages:** Ayrı bir repoda veya bu reponun `gh-pages` dalında tek tıkla barındırabilirsiniz.
- **Vercel / Netlify:** Sadece `web-demo` klasörünü sürükle-bırak yaparak ücretsiz yayınlayabilirsiniz.
