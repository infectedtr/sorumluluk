const https = require('https');
const nodemailer = require('nodemailer');

// Çevre Değişkenleri
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://qwjluzeabyxvlzkfscox.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hdmU_P82-KMGCEB3fV1qBw_9M56K6JR';
const GMAIL_USER = process.env.GMAIL_USER || 'mebaiprogram@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'opvrgylmpqykgfqy';
const SETUP_DOWNLOAD_LINK = process.env.SETUP_DOWNLOAD_LINK || 'https://github.com/KULLANICI/REPO/releases/latest/download/MEB_Sorumluluk_Sinav_Kurulum.exe';

/**
 * Supabase RPC 'create_shopier_license' çağrısı
 */
async function createLicenseInSupabase(name, email, planType, orderId) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase çevre değişkenleri eksik.');
  }

  const payload = JSON.stringify({
    p_school_name: name,
    p_email: email,
    p_plan_type: planType,
    p_order_id: String(orderId)
  });

  const baseUrl = SUPABASE_URL.replace(/\/$/, '');
  const url = new URL(`${baseUrl}/rest/v1/rpc/create_shopier_license`);
  
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Supabase yanıtı okunamadı: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Müşteriye otomatik Lisans ve İndirme Bağlantısı E-Postası
 */
async function sendLicenseEmail(toEmail, name, licenseKey, orderId, planType) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.warn('E-posta bildirim ayarları eksik. Mail gönderimi atlanıyor.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD
    }
  });

  let planName = '📅 1 Yıllık Lisans';
  if (planType === 'LIFETIME') planName = '∞ Ömür Boyu (Süresiz) Lisans';
  if (planType === 'MONTHLY') planName = '⏳ 1 Aylık Lisans';

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
        <h2 style="color: #0f172a; margin: 0; font-size: 24px;">MEB Sorumluluk Sınavları Sistemi</h2>
        <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Lisans Anahtarı & İndirme Bağlantısı</p>
      </div>

      <div style="padding: 20px 0;">
        <p style="color: #334155; font-size: 16px;">Merhaba <strong>${name}</strong>,</p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          <strong>#${orderId}</strong> numaralı Shopier siparişiniz başarıyla onaylanmıştır. Yazılım aktivasyon anahtarınız ve indirme bağlantınız aşağıda yer almaktadır:
        </p>

        <div style="background-color: #eef2ff; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
          <span style="font-size: 12px; font-weight: 600; color: #4338ca; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Paket Türü: ${planName}</span>
          <span style="font-size: 26px; font-family: monospace; font-weight: bold; color: #1e1b4b; letter-spacing: 2px;">${licenseKey}</span>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${SETUP_DOWNLOAD_LINK}" style="background-color: #e11d48; color: #ffffff; padding: 14px 28px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 16px; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);">
            📥 Kurulum Programını İndir (.EXE)
          </a>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 13px; color: #64748b; line-height: 1.5;">
          <strong>Aktivasyon Adımları:</strong><br/>
          1. Yukarıdaki buton ile program kurulum dosyasını indirin.<br/>
          2. Programı açın ve ekrandaki <strong>Lisans Anahtarı</strong> alanına yukarıdaki kodu yapıştırın.<br/>
          3. Lisansınız ilk açılışta bilgisayarınıza otomatik olarak kilitlenecektir.
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; color: #94a3b8; font-size: 12px;">
        MEB Sorumluluk Sınavları Yönetim Sistemi — Destek için bu e-postayı yanıtlayabilirsiniz.
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"MEB Sınav Sistemi Lisans" <${GMAIL_USER}>`,
    to: toEmail,
    subject: `🔑 Lisans Anahtarınız & Kurulum Dosyası (#${orderId})`,
    html: htmlContent
  });
}

/**
 * Vercel Serverless Function Handler
 */
module.exports = async (req, res) => {
  // CORS Başlıkları
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET İsteği: Test veya Sağlık Kontrolü
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Shopier Webhook Service v1.0 (MEB Sorumluluk Sınavları Yönetim Sistemi)',
      sender_account: GMAIL_USER
    });
  }

  try {
    const body = req.body || {};
    
    // Shopier Callback alanlarını ayrıştır
    const email = body.email || body.buyer_email || body.email_address || '';
    const orderId = body.orderid || body.order_id || body.platform_order_id || `ORD-${Date.now()}`;
    const buyerName = body.buyername || body.first_name || '';
    const buyerSurname = body.buyersurname || body.last_name || '';
    const name = `${buyerName} ${buyerSurname}`.trim() || body.product_name || 'Değerli Müşterimiz';

    // Paket türünü ürün adı / varyant / gövde metninden tespit et
    const fullContent = JSON.stringify(body).toLowerCase();
    let planType = 'ANNUAL';
    if (fullContent.includes('süresiz') || fullContent.includes('lifetime') || fullContent.includes('ömür boyu')) {
      planType = 'LIFETIME';
    } else if (fullContent.includes('aylık') || fullContent.includes('monthly')) {
      planType = 'MONTHLY';
    }

    if (!email) {
      console.warn('Webhook uyarısı: E-posta adresi bulunamadı.', body);
      return res.status(200).send('success_no_email');
    }

    // 1. Supabase'de lisans kaydı oluştur
    let licResult = null;
    try {
      licResult = await createLicenseInSupabase(name, email, planType, orderId);
    } catch (dbErr) {
      console.error('Supabase lisans kaydı hatası:', dbErr.message);
    }

    const licenseKey = (licResult && licResult.license_key) ? licResult.license_key : ('MEB-SOR-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000));

    // 2. Müşteriye otomatik e-posta gönder
    let mailSendResult = null;
    try {
      mailSendResult = await sendLicenseEmail(email, name, licenseKey, orderId, planType);
    } catch (emailErr) {
      console.error('E-posta gönderim hatası:', emailErr.message);
    }

    return res.status(200).json({
      status: 'success',
      license_key: licenseKey,
      order_id: orderId
    });

  } catch (err) {
    console.error('Webhook İşlem Hatası:', err);
    return res.status(500).json({ error: err.message });
  }
};
