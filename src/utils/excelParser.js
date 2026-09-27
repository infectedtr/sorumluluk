import * as XLSX from 'xlsx';

/**
 * Normalizes header string for comparison
 */
function cleanHeader(header) {
  if (!header) return '';
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a string is a header or footer label rather than a real data value
 */
export function isHeaderOrFooterLabel(str) {
  if (!str) return true;
  const s = String(str).trim().toLocaleLowerCase('tr-TR');
  if (
    s === 'dersi' ||
    s === 'ders' ||
    s === 'dersler' ||
    s === 'sorumlu oldugu ders' ||
    s === 'dersin adi' ||
    s === 'ogrenci no' ||
    s === 'adi soyadi' ||
    s === 'seviye' ||
    s === 'sinifi' ||
    s === 'sinav turu' ||
    s === 'sinav sekli'
  ) {
    return true;
  }
  const sNorm = s
    .replace(/[ıİ]/g,'i').replace(/[ğĞ]/g,'g').replace(/[üÜ]/g,'u')
    .replace(/[şŞ]/g,'s').replace(/[öÖ]/g,'o').replace(/[çÇ]/g,'c');
  if (
    sNorm.includes('ogrenciye ait') ||
    sNorm.includes('kayit listelenmistir') ||
    sNorm.includes('listelenmistir') ||
    sNorm.includes('raporu') ||
    sNorm.includes('sorumlu oldugu ders') ||
    sNorm.includes('sorumlu ders') ||
    sNorm === 'dersin adi'
  ) {
    return true;
  }
  if (/^0\.\d+$/.test(s)) return true;
  return false;
}

/**
 * VBA Makro2 sinif adi formatlama - birebir ayni mantik:
 *
 * 1) j=1..30 ise boşalt (sıralama numarası)
 * 2) ML/AL: Mid(1,2) & "-" & Mid(6,2) & Mid(18,1)
 * 3) AMP/AML: okulturu + sinifad + sube (InStr mantığı)
 * 4) Standart "10. Sinif / A Subesi"
 * 5) 12. sinif uzun alan adları
 */
export function formatEOkulClassName(rawSinif) {
  if (rawSinif === null || rawSinif === undefined) return '';
  const raw = String(rawSinif).trim();
  if (!raw) return '';

  // Adım 1: Sıralama numarasıysa (1-30) boşalt
  const asNum = Number(raw);
  if (!isNaN(asNum) && Number.isInteger(asNum) && asNum >= 1 && asNum <= 30) return '';

  const upper = raw.toLocaleUpperCase('tr-TR');

  // Adım 2: ML / AL özel dönüşüm (VBA: Mid(1,2) & "-" & Mid(6,2) & Mid(18,1))
  // Örnek input: "ML - 10. Sinif / A Subesi"  (0-based: [0..1]="ML", [5..6]="10", [17]="A")
  if (upper.startsWith('ML') || upper.startsWith('AL')) {
    const part1 = raw.substring(0, 2);
    const part2 = raw.substring(5, 7).trim();
    const part3 = raw.substring(17, 18).trim();
    if (part2) {
      return (part1 + '-' + part2 + part3).toUpperCase().replace(/\s+/g, '');
    }
  }

  // Adım 3: AMP / AML dönüşüm
  // VBA (1-tabanlı): a=InStr("-"), b=InStr("."), c=InStr("/")
  //   sinifad = Mid(str, a+2, b-a-2)
  //   okulturu = Mid(str, 1, 3) & "-"
  //   sube = Mid(str, c+1, 2)
  //   If InStr(sinifad,"9")<>0 Then sinifad = Left(sinifad,1)
  if (upper.startsWith('AMP') || upper.startsWith('AML')) {
    const a0 = raw.indexOf('-');   // 0-based pos
    const b0 = raw.indexOf('.');
    const c0 = raw.indexOf('/');
    if (a0 !== -1 && b0 !== -1 && c0 !== -1) {
      const okulturu = raw.substring(0, 3) + '-';
      // VBA a is 1-based, so a+2 (1-based) = a0+2 (0-based start)
      let sinifad = raw.substring(a0 + 2, b0).trim();
      // VBA c is 1-based, c+1 (1-based) = c0+1 (0-based)
      let sube = raw.substring(c0 + 1, c0 + 3).trim();
      if (sinifad.includes('9')) sinifad = sinifad.substring(0, 1);
      sinifad = sinifad.replace(/[^0-9]/g, '');
      return (okulturu + sinifad + sube).toUpperCase().replace(/\s+/g, '');
    }
  }

  // Adım 4: Standart "10. Sinif / A Subesi"
  const upper2 = upper
    .replace(/İ/g,'I').replace(/Ş/g,'S').replace(/Ç/g,'C')
    .replace(/Ğ/g,'G').replace(/Ü/g,'U').replace(/Ö/g,'O');
  const stdMatch = upper2.match(/(\d+)\.\s*SINIF\s*\/\s*([A-Z0-9]+)/);
  if (stdMatch) {
    return stdMatch[1] + '-' + stdMatch[2].toUpperCase();
  }

  // Adım 5: 12. sinif uzun alan/dal adlari
  if (upper2.includes('12')) {
    const u = upper2;
    if (u.includes('SAYISAL') || u.includes('FEN BILIMLERI') || u.includes('MF')) return '12 SAYISAL';
    if (u.includes('ESIT AGIRLIK') || u.includes('TURKCE-MATEMATIK') || u.includes('TM-') || u.includes('EA-')) return '12 ESIT AGIRLIK';
    if (u.includes('SOZEL') || u.includes('SOSYAL')) return '12 SOZEL';
    if (u.includes('DIL') || u.includes('YABANCI')) return '12 DIL';
  }

  // Temiz format: "10-A", "AMP-10A" vb.
  if (/^[A-Z0-9]+-[0-9]+[A-Z]?$/i.test(raw)) return raw.toUpperCase();

  // Sadece rakam > 30 (sınıf seviyesi)
  if (!isNaN(asNum) && asNum > 30) return String(Math.round(asNum));

  return upper.substring(0, 20).trim();
}

export function extractVocationalField(raw) {
  const match = String(raw || '').match(/\(([^()]*(?:ALANI|DALI)[^()]*)\)/i);
  return match ? match[1].replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR') : '';
}

/**
 * Sınıf sütununu temizle - sıralama numarasıysa boş döndür.
 */
export function extractClassFromMixed(raw) {
  if (raw === null || raw === undefined) return '';
  const s = String(raw).trim();
  if (!s) return '';
  const n = Number(s);
  if (!isNaN(n) && Number.isInteger(n) && n >= 1 && n <= 30) return '';
  return formatEOkulClassName(s);
}

/**
 * Parses an Excel file - VBA Makro2 mantığını uygular.
 * Kolon düzeni (ham e-Okul): A(0)=Sinif, B(1)=No, C(2)=AdSoyad, I(8)=Seviye, J(9)=Ders
 */
export async function parseEOkulExcel(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        let targetSheetName = workbook.SheetNames.find(
          (s) => s.toLowerCase() === 'liste'
        );
        if (!targetSheetName) {
          let maxRows = 0;
          workbook.SheetNames.forEach((s) => {
            const sh = workbook.Sheets[s];
            const range = XLSX.utils.decode_range(sh['!ref'] || 'A1:A1');
            const rowCount = range.e.r - range.s.r + 1;
            if (rowCount > maxRows) { maxRows = rowCount; targetSheetName = s; }
          });
        }
        if (!targetSheetName) targetSheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[targetSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, defval: '', raw: false,
        });

        if (!rows || rows.length === 0) {
          resolve({ success: false, error: 'Excel sayfasi bos veya okunamadi.' });
          return;
        }

        // Ham e-Okul raporu: J(index 9) sutununda ders adi var mi?
        const sampleForIJ = rows.slice(0, 80).filter(
          (r) => r && r.length >= 10 && String(r[9] || '').trim()
        );
        const isRawEOkul = sampleForIJ.some(
          (r) => !isHeaderOrFooterLabel(String(r[9] || ''))
        );

        const isFormattedListe =
          !isRawEOkul &&
          targetSheetName.toLowerCase() === 'liste' &&
          rows.some((r) => r && r[1] && !isNaN(parseInt(String(r[1]), 10)) && r[3]);

        const parsedStudents = [];
        let currentSinif = '';
        let currentAlan = '';
        let currentNo = '';
        let currentAdSoyad = '';

        if (isRawEOkul) {
          for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;

            const col0 = String(row[0] ?? '').trim();
            const col1 = String(row[1] ?? '').trim();
            const col2 = String(row[2] ?? '').trim();
            const col8 = String(row[8] ?? '').trim();
            const col9 = String(row[9] ?? '').trim();

            // ── ADIM 1: col0 varsa önce sınıf adını güncelle (skip'ten önce!) ──
            // VBA: sıralama numarası (1-30) temizle, boşsa fill-down
            if (col0) {
              const fmt = extractClassFromMixed(col0);
              if (fmt) {
                currentSinif = fmt;
                currentAlan = extractVocationalField(col0);
              }
            }

            // ── ADIM 2: Başlık / alt bilgi satırlarını atla ──────────────────
            const c1l = col1.toLocaleLowerCase('tr-TR');
            if (
              c1l === 'no' || c1l === 'öğrenci no' || c1l === 'ogrenci no' ||
              col2.toLocaleLowerCase('tr-TR').includes('soyad')
            ) continue;

            // col9 (J) boş veya başlık kelimesi ise bu satırda ders yok; atla
            if (!col9 || isHeaderOrFooterLabel(col9)) continue;

            // ── ADIM 3: Fill-down No ve Ad Soyad ─────────────────────────────
            let no = col1;
            let adSoyad = col2;
            if (no && !isNaN(parseInt(no, 10))) {
              currentNo = no; currentAdSoyad = adSoyad;
            } else if (!no && currentNo) {
              no = currentNo; adSoyad = currentAdSoyad;
            }

            if (!no && !adSoyad) continue;

            // ── Seviye: I sütunundan veya currentSinif'ten ───────────────────
            let seviye = 9;
            const lm = (col8 || currentSinif || '').match(/(9|10|11|12)/);
            if (lm) seviye = parseInt(lm[1], 10);

            parsedStudents.push({
              id: Date.now() + Math.random(),
              sinif: currentSinif || 'BİLİNMİYOR',
              no: no || '',
              adSoyad: adSoyad.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
              ders: col9.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
              seviye,
              alan: currentAlan,
              sinavTuru: 'SORUMLULUK SINAVI',
            });
          }
        } else if (isFormattedListe) {
          for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;
            const col0 = String(row[0] ?? '').trim();
            const col1 = String(row[1] ?? '').trim();
            const col2 = String(row[2] ?? '').trim();
            const col3 = String(row[3] ?? '').trim();
            const col4 = String(row[4] ?? '').trim();
            const col6 = String(row[6] ?? '').trim();
            if (isHeaderOrFooterLabel(col3)) continue;
            let sinif = col0 || currentSinif;
            const alan = extractVocationalField(col0) || currentAlan;
            let no = col1; let adSoyad = col2;
            const ders = col3;
            const seviye = parseInt(col4, 10) || 9;
            const tur = col6 || 'SORUMLULUK SINAVI';
            if (no && !isNaN(parseInt(no, 10))) {
              currentNo = no; currentAdSoyad = adSoyad;
            } else if (!no && currentNo) {
              no = currentNo; adSoyad = currentAdSoyad;
            }
            if (sinif) {
              const fmt = formatEOkulClassName(sinif);
              if (fmt) currentSinif = fmt;
              currentAlan = extractVocationalField(sinif) || currentAlan;
            }
            if (ders && !isHeaderOrFooterLabel(ders) && (no || adSoyad)) {
              parsedStudents.push({
                id: Date.now() + Math.random(),
                sinif: currentSinif || '?',
                no: no || '',
                adSoyad: adSoyad.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
                ders: ders.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
                seviye, alan, sinavTuru: tur,
              });
            }
          }
        } else {
          for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            if (!row || row.length === 0) continue;
            const col0 = String(row[0] ?? '').trim();
            const col1 = String(row[1] ?? '').trim();
            const col2 = String(row[2] ?? '').trim();
            const col3 = String(row[3] ?? '').trim();
            const col4 = String(row[4] ?? '').trim();
            const fullRowText = row.map((c) => String(c || '').trim()).join(' ');
            if (
              fullRowText.includes('Sinif') &&
              (fullRowText.includes('Sube') || fullRowText.includes('/')) &&
              !fullRowText.includes('Ders')
            ) {
              const fmt = formatEOkulClassName(fullRowText);
              if (fmt) currentSinif = fmt;
              currentAlan = extractVocationalField(fullRowText);
              continue;
            }
            if (col0) {
              const fmt = extractClassFromMixed(col0);
              if (fmt) {
                currentSinif = fmt;
                currentAlan = extractVocationalField(col0);
              }
            }
            let no = col1; let adSoyad = col2; let ders = ''; let seviye = 9;
            if (no && !isNaN(parseInt(no, 10))) {
              currentNo = no; currentAdSoyad = adSoyad;
            } else if (!no && currentNo) {
              no = currentNo; adSoyad = currentAdSoyad;
            }
            if (col4 && !isHeaderOrFooterLabel(col4)) {
              ders = col4;
              if (/^(9|10|11|12)$/.test(col3)) seviye = parseInt(col3, 10);
            } else if (col3 && !isHeaderOrFooterLabel(col3)) {
              ders = col3;
            }
            if (!seviye) { const m = currentSinif.match(/(9|10|11|12)/); if (m) seviye = parseInt(m[1], 10); }
            if (ders && !isHeaderOrFooterLabel(ders) && (no || adSoyad)) {
              parsedStudents.push({
                id: Date.now() + Math.random(),
                sinif: currentSinif || '?',
                no: no || '',
                adSoyad: adSoyad.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
                ders: ders.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
                seviye: seviye || 9, alan: currentAlan, sinavTuru: 'SORUMLULUK SINAVI',
              });
            }
          }
        }

        resolve({
          success: true,
          students: parsedStudents,
          count: parsedStudents.length,
          sheetName: targetSheetName,
        });
      } catch (err) {
        console.error('Excel parse error:', err);
        resolve({ success: false, error: 'Dosya okunurken bir hata olustu: ' + err.message });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Dosya okuma basarisiz oldu.' });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parses copy-pasted text from e-Okul applying Makro2 fill-down logic.
 */
export function parsePastedStudentText(text) {
  if (!text || !text.trim()) return [];
  const lines = text.trim().split(/\r?\n/);
  const students = [];
  let currentSinif = '';
  let currentAlan = '';
  let currentNo = '';
  let currentAdSoyad = '';

  lines.forEach((line, lineIdx) => {
    const parts = line.split(/\t/).map((p) => p.trim());
    if (!parts.some(Boolean)) return;
    const fullLine = parts.join(' ');
    if (
      fullLine.includes('Sinif') &&
      (fullLine.includes('Sube') || fullLine.includes('/')) &&
      !fullLine.includes('Ders')
    ) {
      const fmt = formatEOkulClassName(fullLine);
      if (fmt) currentSinif = fmt;
      currentAlan = extractVocationalField(fullLine);
      return;
    }
    let sinif = ''; let no = ''; let adSoyad = ''; let ders = ''; let seviye = 9;
    if (parts.length >= 10) {
      if (isHeaderOrFooterLabel(parts[9]) || isHeaderOrFooterLabel(parts[2])) return;
      if (parts[0]) { const fmt = extractClassFromMixed(parts[0]); if (fmt) sinif = fmt; }
      no = parts[1]; adSoyad = parts[2]; ders = parts[9];
      const lm = (parts[8] || sinif || currentSinif || '').match(/(9|10|11|12)/);
      if (lm) seviye = parseInt(lm[1], 10);
    } else if (parts.length >= 5) {
      if (!isNaN(parseInt(parts[1], 10))) {
        sinif = formatEOkulClassName(parts[0]) || currentSinif;
        no = parts[1]; adSoyad = parts[2]; ders = parts[3]; seviye = parseInt(parts[4], 10) || 9;
      } else if (!isNaN(parseInt(parts[0], 10)) && parts.length >= 6) {
        sinif = formatEOkulClassName(parts[1]) || currentSinif;
        no = parts[2]; adSoyad = parts[3]; ders = parts[4]; seviye = parseInt(parts[5], 10) || 9;
      }
    } else if (parts.length >= 3) {
      if (!isNaN(parseInt(parts[0], 10))) {
        no = parts[0]; adSoyad = parts[1]; ders = parts[2];
      } else {
        ders = parts[parts.length - 1];
      }
    }
    if (no && !isNaN(parseInt(no, 10))) {
      currentNo = no; currentAdSoyad = adSoyad;
    } else if (!no && currentNo) {
      no = currentNo; adSoyad = currentAdSoyad;
    }
    if (sinif) currentSinif = sinif;
    if (ders && !isHeaderOrFooterLabel(ders) && (no || adSoyad)) {
      students.push({
        id: Date.now() + Math.random(),
        sinif: currentSinif || '?',
        no: no || '',
        adSoyad: adSoyad.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
        ders: ders.replace(/\s+/g, ' ').trim().toLocaleUpperCase('tr-TR'),
        seviye, alan: currentAlan, sinavTuru: 'SORUMLULUK SINAVI',
      });
    }
  });
  return students;
}

/**
 * Exports data to Excel workbook
 */
export function exportToExcel(data, fileName, sheetName = 'Sayfa1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * Personel listesi Excel dosyasından öğretmenleri içeri aktarır.
 *
 * Sütun düzeni:
 *   G (index 6) → Ad Soyad (TC No parantez içinde - temizlenir)
 *   L (index 11) → Ünvan (yöneticiler görev dışı olarak da alınır)
 *   N (index 13) → Branş (/ karakterinden öncesi alınır)
 */
export function parseTeacherRows(rows, principalName = '') {
  const teachers = [];
  const seenNames = new Set();
  const normalizeName = (value) =>
    String(value || '')
      .toLocaleUpperCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim();
  const principal = normalizeName(principalName);

  rows.forEach((row) => {
    if (!row || row.length < 12) return;

    const colG = String(row[6] ?? '').trim();
    const colL = String(row[11] ?? '').trim();
    const colN = String(row[13] ?? '').trim();
    if (!colG) return;

    const normalizedPosition = cleanHeader(colL);
    const isTeacher = normalizedPosition.includes('ogretmen');
    const isAdministrator = normalizedPosition.includes('mudur');
    if (!isTeacher && !isAdministrator) return;

    const nameMatch = colG.match(/^([^(]+)/);
    if (!nameMatch) return;
    const name = nameMatch[1].trim().toLocaleUpperCase('tr-TR');
    if (name.length < 3) return;

    const normalizedTeacherName = normalizeName(name);
    if (seenNames.has(normalizedTeacherName)) return;
    seenNames.add(normalizedTeacherName);

    let branch = colN;
    const slashIdx = branch.indexOf('/');
    if (slashIdx !== -1) branch = branch.substring(0, slashIdx).trim();
    branch = branch.trim() || 'Belirtilmemiş';

    teachers.push({
      id: Date.now() + Math.random(),
      name,
      branch,
      position: colL,
      active: !isAdministrator && (!principal || normalizedTeacherName !== principal),
      notes: ''
    });
  });

  return teachers;
}

export async function parseTeacherExcel(file, principalName = '') {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // En fazla satıra sahip sayfayı veya ilk sayfayı al
        let targetSheetName = workbook.SheetNames[0];
        let maxRows = 0;
        workbook.SheetNames.forEach((s) => {
          const sh = workbook.Sheets[s];
          if (!sh['!ref']) return;
          const range = XLSX.utils.decode_range(sh['!ref']);
          const rowCount = range.e.r - range.s.r + 1;
          if (rowCount > maxRows) { maxRows = rowCount; targetSheetName = s; }
        });

        const worksheet = workbook.Sheets[targetSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1, defval: '', raw: false,
        });

        if (!rows || rows.length === 0) {
          resolve({ success: false, error: 'Excel sayfası boş veya okunamadı.' });
          return;
        }

        const teachers = parseTeacherRows(rows, principalName);

        resolve({
          success: true,
          teachers,
          count: teachers.length,
          sheetName: targetSheetName,
        });
      } catch (err) {
        console.error('Teacher Excel parse error:', err);
        resolve({ success: false, error: 'Dosya okunurken hata oluştu: ' + err.message });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Dosya okuma başarısız oldu.' });
    };

    reader.readAsArrayBuffer(file);
  });
}
