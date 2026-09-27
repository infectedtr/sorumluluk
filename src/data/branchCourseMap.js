/**
 * MEB Ortaöğretim müfredatına göre ders → branş eşleştirme tablosu.
 * Her ders adı (normalize edilmiş) için sorumlu branş listelenir.
 * Öncelik sırasıyla: exact match, partial match, keyword match.
 */

export const DERS_BRANS_MAP = [
  // ── Dil ve Edebiyat ────────────────────────────────────────────────────────
  { dersKeywords: ['TÜRK DİLİ', 'TÜRKÇE', 'EDEBİYAT', 'DİL VE ANLATIM'],
    branslar: ['Türk Dili ve Edebiyatı', 'Türkçe'] },

  // ── Matematik ──────────────────────────────────────────────────────────────
  { dersKeywords: ['MATEMATİK', 'TEMEL MATEMATİK', 'UYGULAMALI MATEMATİK'],
    branslar: ['Matematik'] },

  // ── Fizik ──────────────────────────────────────────────────────────────────
  { dersKeywords: ['FİZİK'],
    branslar: ['Fizik'] },

  // ── Kimya ──────────────────────────────────────────────────────────────────
  { dersKeywords: ['KİMYA'],
    branslar: ['Kimya'] },

  // ── Biyoloji ───────────────────────────────────────────────────────────────
  { dersKeywords: ['BİYOLOJİ'],
    branslar: ['Biyoloji'] },

  // ── Tarih ──────────────────────────────────────────────────────────────────
  { dersKeywords: ['TARİH', 'T.C. İNKILAP TARİHİ', 'INKILAP TARİHİ', 'ÇAĞDAŞ TÜRK'],
    branslar: ['Tarih'] },

  // ── Coğrafya ───────────────────────────────────────────────────────────────
  { dersKeywords: ['COĞRAFYA'],
    branslar: ['Coğrafya'] },

  // ── Felsefe / Psikoloji ────────────────────────────────────────────────────
  { dersKeywords: ['FELSEFE', 'PSİKOLOJİ', 'SOSYOLOJİ', 'MANTIK'],
    branslar: ['Felsefe', 'Felsefe Grubu'] },

  // ── Din ────────────────────────────────────────────────────────────────────
  { dersKeywords: ['DİN KÜLTÜRÜ', 'AHLAK BİLGİSİ', 'KUR\'AN', 'HZ MUHAMMED', 'İSLAM TARİHİ'],
    branslar: ['Din Kültürü ve Ahlak Bilgisi', 'İmam Hatip'] },

  // ── Yabancı Dil ────────────────────────────────────────────────────────────
  { dersKeywords: ['YABANCI DİL', 'İNGİLİZCE', 'ALMANCA', 'FRANSIZCA', 'İSPANYOLCA', 'RUSÇA', 'JAPONCA', 'ARAPÇA'],
    branslar: ['İngilizce', 'Almanca', 'Fransızca', 'Yabancı Dil', 'Arapça'] },

  // ── Beden Eğitimi ──────────────────────────────────────────────────────────
  { dersKeywords: ['BEDEN EĞİTİMİ', 'SPOR', 'JIMNASTIK'],
    branslar: ['Beden Eğitimi'] },

  // ── Müzik ──────────────────────────────────────────────────────────────────
  { dersKeywords: ['MÜZİK'],
    branslar: ['Müzik'] },

  // ── Görsel Sanatlar ────────────────────────────────────────────────────────
  { dersKeywords: ['GÖRSEL SANATLAR', 'RESİM'],
    branslar: ['Görsel Sanatlar / Resim', 'Resim'] },

  // ── Bilişim ───────────────────────────────────────────────────────────────
  { dersKeywords: ['BİLİŞİM', 'BİLGİSAYAR', 'PROGRAMLAMA', 'WEB TASARIM', 'VERİ TABANI', 'YAZILIM'],
    branslar: ['Bilişim Teknolojileri', 'Bilgisayar', 'Bilgisayar Bilimleri'] },

  // ── Elektrik-Elektronik ────────────────────────────────────────────────────
  { dersKeywords: ['ELEKTRİK', 'ELEKTRONİK', 'OTOMASYON', 'PLC', 'ENERJİ'],
    branslar: ['Elektrik-Elektronik Teknolojisi', 'Elektrik', 'Elektrik-Elektronik'] },

  // ── Makine / Motor ────────────────────────────────────────────────────────
  { dersKeywords: ['MAKİNE', 'MOTOR', 'OTOMOTİV', 'MOTORLU ARAÇ', 'KAYNAKÇILIK', 'CNC', 'TALAŞ'],
    branslar: ['Makine Teknolojisi', 'Motorlu Araçlar Teknolojisi', 'Metal Teknolojisi'] },

  // ── Metal Teknolojisi ──────────────────────────────────────────────────────
  { dersKeywords: ['METAL', 'ÇELIK', 'DÖKÜM'],
    branslar: ['Metal Teknolojisi'] },

  // ── Mobilya / İç Mekan ────────────────────────────────────────────────────
  { dersKeywords: ['MOBİLYA', 'İÇ MEKAN', 'AHŞAP', 'MARANGOZ'],
    branslar: ['Mobilya ve İç Mekan Tasarımı'] },

  // ── İnşaat / Mimarlık ──────────────────────────────────────────────────────
  { dersKeywords: ['İNŞAAT', 'YAPI', 'MİMARLIK', 'HARITA', 'TAPU KADASTRO'],
    branslar: ['İnşaat Teknolojisi', 'Yapı Teknolojisi'] },

  // ── Tekstil / Konfeksiyon ─────────────────────────────────────────────────
  { dersKeywords: ['TEKSTİL', 'KONFEKSİYON', 'GİYİM', 'DOKUMA'],
    branslar: ['Tekstil Teknolojisi', 'Giyim Üretim Teknolojisi'] },

  // ── Gıda ──────────────────────────────────────────────────────────────────
  { dersKeywords: ['GIDA', 'MUTFAK', 'YİYECEK', 'PASTANE', 'AŞÇILIK'],
    branslar: ['Gıda Teknolojisi', 'Aşçılık'] },

  // ── Sağlık ────────────────────────────────────────────────────────────────
  { dersKeywords: ['SAĞLIK', 'HEMŞİRELİK', 'İLK YARDIM', 'ECZANE', 'TIP'],
    branslar: ['Sağlık Hizmetleri', 'Hemşirelik'] },

  // ── Çocuk Gelişimi ────────────────────────────────────────────────────────
  { dersKeywords: ['ÇOCUK GELİŞİMİ', 'ÇOCUK BAKIMI'],
    branslar: ['Çocuk Gelişimi ve Eğitimi'] },

  // ── Muhasebe / Finans ─────────────────────────────────────────────────────
  { dersKeywords: ['MUHASEBE', 'FİNANS', 'PAZARLAMA', 'BANKACILIK', 'TİCARET'],
    branslar: ['Muhasebe ve Finansman', 'Muhasebe'] },

  // ── Turizm / Otelcilik ────────────────────────────────────────────────────
  { dersKeywords: ['TURİZM', 'OTELCİLİK', 'SEYAHAT', 'REHBER'],
    branslar: ['Turizm ve Otel İşletmeciliği'] },

  // ── Medya / Grafik ────────────────────────────────────────────────────────
  { dersKeywords: ['GRAFİK', 'MEDYA', 'TASARIM', 'FOTOĞRAF', 'SİNEMA'],
    branslar: ['Grafik ve Fotoğraf', 'Medya ve İletişim'] },

  // ── Güvenlik ─────────────────────────────────────────────────────────────
  { dersKeywords: ['GÜVENLİK', 'SAVUNMA'],
    branslar: ['Özel Güvenlik'] },
];

/**
 * Bir ders adına göre uygun branşları döndürür.
 * @param {string} dersAdi
 * @returns {string[]} Uygun branş adları listesi (önce en iyi eşleşme)
 */
export function getUygunBranslar(dersAdi) {
  if (!dersAdi) return [];
  const upperDers = dersAdi.toLocaleUpperCase('tr-TR')
    .replace(/İ/g,'İ').replace(/I/g,'I');

  const results = [];

  for (const mapping of DERS_BRANS_MAP) {
    const matched = mapping.dersKeywords.some((kw) => {
      const upperKw = kw.toLocaleUpperCase('tr-TR');
      return upperDers.includes(upperKw) || upperKw.includes(upperDers);
    });
    if (matched) {
      mapping.branslar.forEach((b) => {
        if (!results.includes(b)) results.push(b);
      });
    }
  }

  return results;
}

/**
 * Bir öğretmenin branşının verilen derse uygun olup olmadığını kontrol eder.
 * @param {string} teacherBranch
 * @param {string} dersAdi
 * @returns {boolean}
 */
export function isBranshUygun(teacherBranch, dersAdi) {
  if (!teacherBranch || !dersAdi) return false;

  const uygunBranslar = getUygunBranslar(dersAdi);
  if (uygunBranslar.length === 0) return false;

  const tbNorm = teacherBranch.toLocaleUpperCase('tr-TR');

  return uygunBranslar.some((b) => {
    const bNorm = b.toLocaleUpperCase('tr-TR');
    return tbNorm === bNorm || tbNorm.includes(bNorm) || bNorm.includes(tbNorm);
  });
}
