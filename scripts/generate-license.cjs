/**
 * MEB Sorumluluk Sınavları Sistemi - Lisans Üretim Aracı
 * 
 * Kullanım:
 *   node scripts/generate-license.js "Okul Adı" "Yetkili Adı" "email@okul.meb.gov.tr"
 * 
 * Örnek:
 *   node scripts/generate-license.js "Kadıköy Anadolu Lisesi" "Ahmet Yılmaz" "ahmet@meb.gov.tr"
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qwjluzeabyxvlzkfscox.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hdmU_P82-KMGCEB3fV1qBw_9M56K6JR';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const B32 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateLicenseKey() {
  const bytes = crypto.randomBytes(16);
  const blocks = [];
  for (let b = 0; b < 4; b++) {
    let block = '';
    for (let c = 0; c < 4; c++) {
      block += B32[bytes[b * 4 + c] % 32];
    }
    blocks.push(block);
  }
  return `MEBSS-${blocks.join('-')}`;
}

async function main() {
  const args = process.argv.slice(2);
  const school = args[0] || 'Örnek Okul';
  const owner = args[1] || 'Okul Müdürü / Yetkili';
  const email = args[2] || '';
  const notes = args[3] || 'Pazarlama lisansı';

  const key = generateLicenseKey();

  console.log('\n======================================================');
  console.log('   MEB SORUMLULUK SINAVLARI - YENİ LİSANS ÜRETİLİYOR  ');
  console.log('======================================================');
  console.log(`Okul    : ${school}`);
  console.log(`Yetkili : ${owner}`);
  if (email) console.log(`E-posta : ${email}`);
  console.log(`Anahtar : ${key}`);
  console.log('------------------------------------------------------');

  const { data, error } = await sb
    .from('licenses')
    .insert([
      {
        key,
        school,
        owner,
        email,
        active: true,
        notes
      }
    ])
    .select();

  if (error) {
    console.error('❌ HATA: Lisans Supabase veritabanına kaydedilemedi:', error.message);
    process.exit(1);
  }

  console.log('✅ BAŞARILI! Lisans veritabanına kaydedildi ve aktif edildi.');
  console.log('\nMüşterinize vereceğiniz bilgiler:');
  console.log('------------------------------------------------------');
  console.log(`Kurum / Okul: ${school}`);
  console.log(`Lisans Kodu : ${key}`);
  console.log('======================================================\n');

  // Yerel dosyaya kaydet
  try {
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '..', 'URETILEN_LISANSLAR.txt');
    const line = `[${new Date().toLocaleString('tr-TR')}] Okul: ${school} | Yetkili: ${owner} | Kod: ${key} | E-posta: ${email}\n`;
    fs.appendFileSync(logPath, line, 'utf8');
  } catch (_) {}
}

main().catch(console.error);
