# MEB Sorumluluk Sınavları Yönetim Sistemi — Detaylı Kullanım Kılavuzu

**Sürüm:** 1.0.0  
**Telif Hakkı:** © 2026 Tüm Hakları Saklıdır.  
**Mevzuat Dayanağı:** MEB Ortaöğretim Kurumları Yönetmeliği (Madde 58) & 6698 Sayılı KVKK

---

## 📑 İÇİNDEKİLER

1. [Genel Bakış ve Sistem Gereksinimleri](#1-genel-bakış-ve-sistem-gereksinimleri)
2. [Kurulum ve Lisans Aktivasyonu](#2-kurulum-ve-lisans-aktivasyonu)
3. [KVKK ve Kişisel Veri Güvenliği Taahhüdü](#3-kvkk-ve-kişisel-veri-güvenliği-taahhüdü)
4. [Hızlı Başlangıç ve 4 Adımlı İş Akışı](#4-hızlı-başlangıç-ve-4-adımlı-iş-akışı)
5. [e-Okul ve MEBBİS Veri Aktarımı](#5-e-okul-ve-mebbis-veri-aktarımı)
   - 5.1. Öğrenci Sorumluluk Listesi (Excel)
   - 5.2. Öğretmen Kadro Listesi (Excel)
6. [Sınav Takvimi ve Oturum Planlaması](#6-sınav-takvimi-ve-oturum-planlaması)
7. [Ders - Branş Eşleştirmeleri](#7-ders---branş-eşleştirmeleri)
8. [Akıllı Komisyon ve Gözetmen Dağıtım Motoru](#8-akıllı-komisyon-ve-gözetmen-dağıtım-motoru)
9. [Manuel Komisyon Düzenleme ve Mazeret Yönetimi](#9-manuel-komisyon-düzenleme-ve-mazeret-yönetimi)
10. [Resmi MEB Evrakları ve Rapor Baskı Merkezi](#10-resmi-meb-evrakları-ve-rapor-baskı-merkezi)
11. [Yedekleme, Geri Yükleme ve Dönem Sıfırlama](#11-yedekleme-geri-yükleme-ve-dönem-sıfırlama)
12. [Sıkça Sorulan Sorular ve Sorun Giderme (S.S.S.)](#12-sıkça-sorulan-sorular-ve-sorun-giderme-sss)

---

## 1. GENEL BAKIŞ VE SİSTEM GEREKSİNİMLERİ

MEB Sorumluluk Sınavları Yönetim Sistemi; lise ve dengi tüm ortaöğretim kurumlarında (Anadolu, Fen, Mesleki ve Teknik, İmam Hatip, Sosyal Bilimler ve Çok Programlı Liseler) Eylül, Şubat ve Haziran dönemi sorumluluk sınavlarının planlanması, komisyon atamaları ve resmi evrak tanzimi süreçlerini dakikalar içinde hatasız tamamlamak üzere geliştirilmiş profesyonel bir masaüstü yazılımıdır.

### Sistem Gereksinimleri
* **İşletim Sistemi:** Windows 10, Windows 11 (64-bit veya 32-bit)
* **İşlemci:** Intel Core i3 / AMD Ryzen 3 veya dengi
* **Bellek (RAM):** Minimum 2 GB (4 GB önerilir)
* **Sabit Disk Alanı:** 250 MB boş alan
* **Ek Yazılım:** MS Office veya Excel kurulu olması **gerekmez**. Sistem kendi dahili dönüştürücüsünü kullanır.

---

## 2. KURULUM VE LİSANS AKTİVASYONU

1. Size iletilen `MEB Sorumluluk Sinavlari Sistemi Setup 1.0.0.exe` kurulum dosyasını çalıştırın.
2. Kurulum sihirbazı otomatik olarak programı `C:\Program Files\MEB Sorumluluk Sinavlari Sistemi` veya belirleyeceğiniz dizine kurar ve masaüstünüze kısayol ekler.
3. Programı ilk başlattığınızda **KVKK Aydınlatma Metni** ve ardından **Lisans Aktivasyon Ekranı** karşınıza gelir.
4. Size verilen `MEBSS-XXXX-XXXX-XXXX-XXXX` biçimindeki 20 haneli lisans kodunu girerek **"Lisansı Doğrula ve Başla"** butonuna tıklayın.
5. **Çevrimdışı (Offline) Tolerans:** Lisans doğrulandıktan sonra okulunuzda internet bağlantısı kesilse dahi program 7 gün boyunca kesintisiz şekilde tam fonksiyonel çalışmaya devam eder.

---

## 3. KVKK VE KİŞİSEL VERİ GÜVENLİĞİ TAAHHÜDÜ

6698 Sayılı Kişisel Verilerin Korunması Kanunu ve MEB Bilgi Güvenliği Yönergesi gereğince:
* **Sıfır Bulut Verisi:** Sisteme aktardığınız öğrenci T.C. kimlik numaraları, okul numaraları, ad-soyadları, sınav notları ve öğretmen bilgileri **asla internete yüklenmez veya sunuculara gönderilmez**.
* **Yerel Güvenli Depolama:** Tüm veriler yalnızca bilgisayarınızdaki şifreli yerel depolama alanında tutulur.
* **Veri Sorumlusu:** 6698 sayılı kanun uyarınca verilerin yasal sorumlusu okul müdürlüğünüzdür.
* **Yedekleme Güvencesi:** Tüm sınav veritabanınızı tek bir şifreli JSON dosyası olarak USB belleğe yedekleyebilir veya başka bir idareci bilgisayarına güvenle taşıyabilirsiniz.

---

## 4. HIZLI BAŞLANGIÇ VE 4 ADIMLI İŞ AKIŞI

Programda bir sınav dönemini tamamlamak 4 temel adımdan oluşur:

```
[1. Adım: Veri Yükleme] ➡️ [2. Adım: Takvim & Saatler] ➡️ [3. Adım: Akıllı Dağıtım] ➡️ [4. Adım: Resmi Evraklar]
(e-Okul Excel Listeleri)   (Tarih & Salon Ayarları)      (Komisyon & Gözetmen)       (PDF & Çıktı Merkezi)
```

1. **Öğrenci ve Öğretmen Listelerini Yükleyin:** Sol menüdeki *Öğrenci Sorumluluk Listesi* ve *Öğretmenler* sekmelerinden e-Okul dosyalarını aktarın.
2. **Sınav Tarihlerini Belirleyin:** *Sınav Programı & Takvim* sekmesinden sınav başlangıç-bitiş tarihlerini ve günlük oturum saatlerini tanımlayın.
3. **Otomatik Dağıtımı Çalıştırın:** Üst bardaki mor **"Otomatik Dağıt"** butonuna basın. Algoritma öğretmenlerin branşlarına ve görev sayılarına göre komisyonları ve gözetmenleri saniyeler içinde adil şekilde dağıtır.
4. **Resmi Evrakları Alın:** *MEB Resmi Raporları* sekmesinden tek tıkla Olur Yazısı, Sınav Giriş Belgeleri, Tutanaklar ve Soru/Cevap kağıtlarını yazdırın.

---

## 5. e-OKUL VE MEBBİS VERİ AKTARIMI

Program, e-Okul ve MEBBİS sistemlerinden indirilen standart raporları doğrudan tanır ve ayrıştırır.

### 5.1. Öğrenci Sorumluluk Listesi Yükleme
1. e-Okul sistemine giriş yapın.
2. **Ortaöğretim Öğrenci İşlemleri ➡️ Raporlar** menüsüne gidin.
3. **"Sorumluluk Sınavı Öğrenci Listesi"** veya **"Sorumluluk Listesi (Ders Bazında)"** raporunu açın.
4. Rapor penceresinin üstündeki disket simgesinden dosyayı **Excel formatında (.xls veya .xlsx)** bilgisayarınıza kaydedin.
5. Programımızda sol menüden **"Öğrenci Sorumluluk Listesi"** sekmesini açın.
6. **"e-Okul Excel Dosyası Yükle"** alanına dosyayı sürükleyip bırakın veya seçin.
7. Sistem tüm öğrencileri, sınıflarını ve sorumlu oldukları dersleri otomatik olarak veritabanına ekler.

### 5.2. Öğretmen Kadro Listesi Yükleme
1. MEBBİS veya e-Okul üzerinden okulunuzun güncel öğretmen listesini Excel olarak indirin.
2. Sol menüden **"Öğretmenler & Komisyon"** sekmesine gelin.
3. Excel dosyasını yükleyin. Öğretmenlerin Adı, Soyadı, Branşı ve varsa idarecilik durumları sisteme anında işlenir.
4. Dilerseniz öğretmen kartlarındaki düzenle simgesinden sınav görevinden muaf olanları (ücretsiz izinli, raporlu vb.) pasife alabilirsiniz.

---

## 6. SINAV TAKVİMİ VE OTURUM PLANLAMASI

* **Sınav Programı & Takvim** sekmesi:
  - **Tarih Aralığı:** Sınavların yapılacağı başlangıç ve bitiş tarihlerini seçin (Hafta sonu günlerini otomatik atlar veya isteğe bağlı açabilirsiniz).
  - **Günlük Oturum Saatleri:** Örn. 1. Oturum: 09:00, 2. Oturum: 11:00, 3. Oturum: 14:00, 4. Oturum: 16:00.
  - **Salon Kapasitesi:** Sınav salonu başına düşen maksimum öğrenci sayısını (varsayılan 25) belirleyebilirsiniz. Öğrenci sayısı kapasiteyi aşarsa sistem sınavı otomatik olarak birden fazla salona (Salon 1, Salon 2 vb.) böler.
  - **Sürükle-Bırak Takvim:** Dersleri istediğiniz tarih ve saat kutusuna sürükleyerek anında taşıyabilirsiniz. Çakışma kontrol motoru, aynı öğrencinin aynı saatte iki farklı sınava atanmasını kırmızı uyarı ile anında engeller.

---

## 7. DERS - BRANŞ EŞLEŞTİRMELERİ

Hangi derse hangi branş öğretmeninin komisyon üyesi olacağını belirlemek için sol menüdeki **"Ders - Branş Eşleştirme"** sekmesi kullanılır:
* Sistem 100'den fazla MEB dersini (Türk Dili ve Edebiyatı, Matematik, Tarih, İngilizce, Meslek Dersleri vb.) otomatik olarak doğru branşla eşleştirir.
* Okulunuza özel seçmeli dersler veya alan dersleri için tek tıkla *"Matematik ➡️ Matematik Branşı"*, *"Görsel Sanatlar ➡️ Görsel Sanatlar / Müzik"* gibi kural ekleyebilir veya değiştirebilirsiniz.

---

## 8. AKILLI KOMİSYON VE GÖZETMEN DAĞITIM MOTORU

Sistemde bulunan yapay zeka destekli yerel kural motoru şu ilkeleri gözetir:
1. **Branş Önceliği:** Komisyon üyeleri öncelikle o dersin branş öğretmenlerinden seçilir.
2. **Adil Görev Dağılımı:** Okul genelinde tüm öğretmenlerin aldığı toplam komisyon ve gözetmenlik görev sayıları eşitlenir (hiçbir öğretmene aşırı yük binmez).
3. **Zaman Çakışması Koruması:** Bir öğretmene aynı saat ve günde birden fazla sınav salonunda görev verilemez.
4. **İdareci Muafiyeti:** Okul müdürü ve müdür yardımcıları isteğe göre komisyon dağıtımından hariç tutulabilir.

Tek yapmanız gereken üst bardaki **"Otomatik Dağıt"** butonuna basmaktır!

---

## 9. MANUEL KOMİSYON DÜZENLEME VE MAZERET YÖNETİMİ

Eğer dağıtım sonrasında bir öğretmen rapor alır veya mazeret bildirirse:
1. Sol menüden **"Komisyon Manuel Düzenle"** sekmesini açın.
2. İlgili sınavı seçin.
3. Değiştirmek istediğiniz komisyon üyesi veya gözetmenin yanındaki açılır menüden yedek bir öğretmen seçin.
4. Sistem öğretmenlerin mevcut görev sayılarını anlık olarak gösterdiği için en az görevi olan öğretmeni kolayca tespit edebilirsiniz.

---

## 10. RESMİ MEB EVRAKLARI VE RAPOR BASKI MERKEZİ

**"MEB Resmi Raporları"** sekmesi altından standart MEB formatına %100 uyumlu 9 farklı evrak setini tek tıkla PDF veya yazıcı çıktısı olarak alabilirsiniz:

1. **Genel Sınav Takvimi ve İlan Çizelgesi:** Öğrenci ve veli panosuna asılacak, tarih, saat, ders ve salon bilgilerini içeren resmi onaylı tablo.
2. **Öğrenci Sınav Giriş Belgeleri:** Her öğrenci için fotoğraflı/bilgili, hangi tarihte hangi sınavlara gireceğini gösteren kişisel giriş kartı.
3. **Sınav İsim Listesi ve İmza Sirküsü:** Sınav anında salonda öğrencilere imzalattırılacak resmi yoklama listesi.
4. **Sınav Soru ve Cevap Kağıdı Şablonu:** MEB standart antetli, sınav yönergesi ve puanlama cetveli içeren resmi kağıt formatı.
5. **Sınav Tutanağı ve Not Çizelgesi:** Komisyon üyelerinin sınav sonrasında notları yazıp imzalayacağı resmi tutanak.
6. **İlçe/İl MEM Resmi Olur Yazısı:** Üst yazı formatında okul müdürü ve ilçe milli eğitim müdürlüğü onay bloklarını içeren resmi komisyon olur belgesi.
7. **Öğretmen Görev Tebliğ Belgesi:** Öğretmenlere sınav görevlerinin tebliğ edildiğine dair imza karşılığı teslim tutanağı.
8. **Öğretmen Bazlı Sınav Takvimi:** Her öğretmenin sadece kendi görevlerini gün gün gösteren kişisel görev çizelgesi.
9. **Uygulamalı Dersler Değerlendirme Ölçeği:** Edebiyat (konuşma/dinleme), Yabancı Dil ve Beden Eğitimi dersleri için resmi kriter cetveli.

---

## 11. YEDEKLEME, GERİ YÜKLEME VE DÖNEM SIFIRLAMA

Sol menüdeki **"Yedekleme & Veri"** sekmesi üzerinden:
* **JSON Yedek Al:** Tek tıkla o anki tüm okul bilgilerini, öğrenci, öğretmen ve sınav programını `.json` dosyası olarak bilgisayarınıza veya USB belleğe yedekleyin.
* **Yedekten Geri Yükle:** Bilgisayar formatlandığında veya başka bir bilgisayara geçildiğinde yedeği yükleyerek saniyeler içinde çalışmaya devam edin.
* **Yeni Sınav Dönemi Aç:** Bir önceki dönemin verilerini arşivleyip yeni dönem (Örn. Eylül ➡️ Şubat) için temiz bir çalışma alanı başlatın.

---

## 12. SIKÇA SORULAN SORULAR VE SORUN GİDERME (S.S.S.)

**S: e-Okul Excel dosyasını yüklerken hata alıyorum, ne yapmalıyım?**  
*C: e-Okul'dan aldığınız dosyanın "Web Arşivi" (.htm) değil, doğrudan standart Excel (.xls / .xlsx) formatında indirildiğinden emin olun. Dosyayı Excel ile açıp "Farklı Kaydet ➡️ Excel Çalışma Kitabı (.xlsx)" olarak kaydettikten sonra tekrar yükleyebilirsiniz.*

**S: Aynı öğrencinin aynı saatte iki sınavı çakışırsa program ne yapar?**  
*C: Sistem anında kırmızı alarm verir ve Takvim ekranında çakışan öğrencileri listeler. Sınavlardan birini başka bir saate veya güne sürükleyerek çakışmayı saniyeler içinde çözebilirsiniz.*

**S: İnternet bağlantım yokken program çalışır mı?**  
*C: Evet. İlk aktivasyondan sonra program 7 gün boyunca çevrimdışı çalışmayı destekler. Sınav planlaması ve evrak basımı için internet gerekmez.*

**S: Yeni bir bilgisayara geçtiğimde ne yapmalıyım?**  
*C: Eski bilgisayardan "Yedekleme" menüsünden JSON yedeğinizi alın. Yeni bilgisayara kurulum dosyasını kurup aynı lisans anahtarınızı girin ve yedeği geri yükleyin.*

---
**Teknik Destek ve Lisanslama:** Destek talepleriniz için okul yöneticiniz veya yazılım sağlayıcınızla irtibata geçebilirsiniz.
