# 🔑 Uçtan Uca Lisanslama, HWID Kilitleme, Shopier ve Vercel Entegrasyon Rehberi

Bu belge, **MEB Sorumluluk Sınavları Yönetim Sistemi** için Shopier ödeme altyapısı, Vercel Serverless API, Supabase veritabanı, HWID (donanım kilitleme) ve otomatik e-posta anahtar teslimatının kurulum adımlarını açıklar.

---

## 🏗️ Mimari Özet

```
[ Müşteri ] ──(Shopier Üzerinden Ödeme Yaparlar)──> [ Shopier Mağazası ]
                                                             │
                                                             ▼ (Webhook callback / POST)
                                                  [ Vercel Serverless API ]
                                                  (/api/shopier_webhook)
                                                             │
                    ┌────────────────────────────────────────┴────────────────────────────────────────┐
                    ▼                                                                                 ▼
        [ Supabase Veritabanı ]                                                           [ Nodemailer E-Posta Servisi ]
   (`create_shopier_license` RPC)                                                            • Otomatik Lisans Anahtarı
   • Otomatik Lisans Kaydı                                                                    • .EXE İndirme Bağlantısı
   • Paket Türü (Aylık/Yıllık/Süresiz)                                                         Müşteriye Gönderilir
                    │
                    │ (İlk Çalıştırmada Donanım Eşleşmesi)
                    ▼
     [ Masaüstü Uygulaması (Electron) ]
     • Bilgisayar HWID Parmak İzi Alınır
     • `verify_license(key, hwid)` RPC çağrısı yapılır
     • HWID eşleşirse uygulama açılır, uyuşmazsa kilitlenir
```

---

## 📋 1. Adım: Supabase SQL Kurulumu

1. [Supabase Dashboard](https://supabase.com) hesabınıza giriş yapın ve projenize gidin.
2. Sol menüden **SQL Editor** alanına tıklayın.
3. **New Query** oluşturup projedeki [`tools/supabase_setup.sql`](file:///c:/Users/Alien/Downloads/aideneme/tools/supabase_setup.sql) dosyasının içeriğini yapıştırın ve **Run** butonuna basın.
4. Bu sorgu şunları oluşturacaktır:
   - `public.licenses` tablosu (HWID, e-posta, paket türü, son kullanma tarihi desteğiyle).
   - `public.verify_license(p_license_key, p_hwid)` stored procedure (Donanım kilitleme ve doğrulama).
   - `public.create_shopier_license(...)` stored procedure (Otomatik anahtar üretimi).

---

## ⚡ 2. Adım: Vercel Serverless API Yayını

1. Projenizi [Vercel](https://vercel.com) hesabınıza `Import Project` ile ekleyin.
2. **Settings > Environment Variables** bölümünden aşağıdaki değişkenleri tanımlayın:

| Çevre Değişkeni | Açıklama / Örnek Değer |
| :--- | :--- |
| `SUPABASE_URL` | Supabase Proje URL (`https://xyz.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key (`Settings > API > service_role`) |
| `GMAIL_USER` | Lisans gönderimi yapacak Gmail adresi |
| `GMAIL_APP_PASSWORD` | Gmail Uygulama Şifresi ([Google Account > Security > App Passwords](https://myaccount.google.com/apppasswords)) |
| `SETUP_DOWNLOAD_LINK` | GitHub Release veya doğrudan indirme bağlantısı (`https://github.com/.../Setup.exe`) |

3. Vercel projenizi dağıtın (Deploy). Dağıtım sonrasında oluşan API adresi:
   `https://<proje-adiniz>.vercel.app/api/shopier_webhook`

---

## 🛍️ 3. Adım: Shopier Webhook Entegrasyonu

1. [Shopier Yönetim Paneli](https://www.shopier.com) hesabınıza giriş yapın.
2. **Gelişmiş Seçenekler / Entegrasyonlar / Otomatik Geri Dönüş (Callback) URL** alanına gidin.
3. Webhook URL adresi olarak Vercel API adresinizi girin:
   `https://<proje-adiniz>.vercel.app/api/shopier_webhook`
4. Ürün varyantlarına veya ürün isimlerine şu ifadeleri ekleyerek paket türlerinin otomatik algılanmasını sağlayabilirsiniz:
   - **Süresiz / Ömür Boyu / Lifetime**: `LIFETIME` lisansı oluşturur.
   - **Aylık / Monthly**: `MONTHLY` (30 günlük) lisans oluşturur.
   - **Diğer (Standart / Yıllık)**: `ANNUAL` (365 günlük) lisans oluşturur.

---

## 💻 4. Adım: Donanım Kilitleme (HWID) ve İstemci Çalışma Mantığı

1. İstemci uygulama açıldığında bilgisayarın donanım parmak izini (`CPU + Hostname + Platform + MAC`) üretir.
2. Supabase üzerindeki `verify_license` RPC fonksiyonuna lisans anahtarı ve `HWID` gönderilir.
3. **İlk Çalıştırmada:** Lisans anahtarı ilk kullanılan bilgisayarın HWID koduna otomatik kilitlenir (`activated_at` tarihi işlenir).
4. **Sonraki Çalıştırmalarda:** Aynı lisans anahtarı farklı bir bilgisayarda girilirse `Bu lisans başka bir bilgisayarda aktif edilmiştir! (HWID Uyuşmazlığı)` uyarısı döner.
5. **Cihaz Değişikliği Durumunda:** Yönetici `node tools/manage-license.cjs reset-hwid --key "MEBSS-..."` komutu ile kiliti sıfırlayabilir.

---

## 🛠️ 5. Adım: Yönetici Komut Satırı Araçları

Projenin `tools/manage-license.cjs` aracı ile lisansları manuel yönetebilirsiniz:

### 1. Yeni Lisans Oluşturma:
```bash
node tools/manage-license.cjs create --school "Atatürk Anadolu Lisesi" --owner "Ahmet Yılmaz" --email "ahmet@okul.k12.tr" --plan ANNUAL
```

### 2. Tüm Lisansları Listeleme (HWID ve Durum Bilgisiyle):
```bash
node tools/manage-license.cjs list
```

### 3. Bilgisayar Değişikliği İçin HWID Donanım Kilidini Sıfırlama:
```bash
node tools/manage-license.cjs reset-hwid --key "MEBSS-2026-X8B9-72C4"
```

### 4. Lisansı İptal Etme / Yeniden Aktif Etme:
```bash
node tools/manage-license.cjs revoke --key "MEBSS-2026-X8B9-72C4"
node tools/manage-license.cjs activate --key "MEBSS-2026-X8B9-72C4"
```

---

## 🧪 6. Adım: Test Etme

1. **Manuel Webhook Testi (Postman veya cURL):**
   ```bash
   curl -X POST https://<proje-adiniz>.vercel.app/api/shopier_webhook \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com", "buyername":"Ahmet", "buyersurname":"Demir", "orderid":"ORD-1001", "product_name":"MEB Sınav Yıllık Lisans"}'
   ```
2. Supabase `licenses` tablosunu kontrol edin. Yeni lisansın oluştuğunu ve e-postanın alıcıya ulaştığını doğrulayın.
3. İstemci uygulamasını açıp lisans anahtarını girerek aktivasyonu tamamlayın.
