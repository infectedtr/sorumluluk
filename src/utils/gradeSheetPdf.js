import { PDFDocument } from 'pdf-lib';

const RASTER_SCALE = 3;
const FOREIGN_GRID_COLUMNS = [50.67, 70.33, 101.85, 133.33, 293.5, 329, 355.15, 381.15, 407.15, 433.33, 472.85, 541.67];
const SPEAKING_GRID_COLUMNS = [54.15, 70.85, 108.33, 145.85, 326.85, 375, 423.15];

function normalizeCourse(value) {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

function formatDate(value) {
  const date = String(value || '');
  const isoDate = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return isoDate ? `${isoDate[3]}.${isoDate[2]}.${isoDate[1]}` : date;
}

function drawMask(context, x, top, width, height) {
  context.fillStyle = '#fff';
  context.fillRect(x, top, width, height);
}

function drawText(context, value, x, top, width, fontSize, align = 'left', weight = 'normal') {
  const text = String(value || '');
  if (!text) return;

  let size = fontSize;
  context.font = `${weight} ${size}px Arial, sans-serif`;
  while (context.measureText(text).width > width && size > 5.5) {
    size -= 0.25;
    context.font = `${weight} ${size}px Arial, sans-serif`;
  }

  context.fillStyle = '#000';
  context.textBaseline = 'top';
  context.textAlign = align;
  const textX = align === 'center' ? x + width / 2 : align === 'right' ? x + width : x;
  context.fillText(text, textX, top);
  context.textAlign = 'left';
}

async function canvasToPng(canvas) {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error('PDF metin katmanı oluşturulamadı.'));
    }, 'image/png');
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function addInstitutionHeader(context, subject, schoolInfo, formType, examData) {
  const tde = subject === 'tde';
  const fallback = {
    valilik: '..............',
    ilceMem: 'İl Millî Eğitim Müdürlüğü',
    okulAdi: '....................'
  };
  const valilik = schoolInfo.valilik || fallback.valilik;
  const ilceMem = schoolInfo.ilceMem || fallback.ilceMem;
  const okulAdi = schoolInfo.okulAdi || fallback.okulAdi;
  const isSpeakingForm = formType === 'speaking';

  if (isSpeakingForm) {
    drawMask(context, 205, 41, 185, 17);
    drawText(context, valilik, 180, 44, 235, 12, 'center', 'bold');
    drawMask(context, 205, 57, 185, 15);
    drawText(context, ilceMem, 178, 59, 239, 9.4, 'center');
    drawMask(context, 195, 70, 205, 16);
    drawText(context, okulAdi, 154, 72, 287, 9.4, 'center');
    drawMask(context, 192, 91, 211, 17);
    const title = tde
      ? 'TÜRK DİLİ VE EDEBİYATI KONUŞMA-DİNLEME NOT ÇİZELGESİ'
      : 'YABANCI DİL KONUŞMA-DİNLEME NOT ÇİZELGESİ';
    drawText(context, title, 160, 96, 275, 10, 'center', 'bold');
    return {
      headerRows: [
        { x: 147, top: 108, width: 108, height: 14, value: schoolInfo.ogretimYili || '....................' },
        { x: 424, top: 108, width: 106, height: 14, value: schoolInfo.donem || '....................' },
        { x: 147, top: 123, width: 112, height: 14, value: formatDate(examData.examDate) || '....................' },
        { x: 424, top: 123, width: 106, height: 14, value: examData.examTime || '....................' },
        { x: 147, top: 138, width: 168, height: 14, value: examData.course || '....................' },
        { x: 424, top: 138, width: 106, height: 14, value: examData.className || '....................' }
      ]
    };
  }

  drawMask(context, 205, 69, 185, 16);
  drawText(context, valilik, 180, 72, 235, 12, 'center', 'bold');
  drawMask(context, 205, 87, 185, 15);
  drawText(context, ilceMem, 178, 90, 239, 9.5, 'center');
  drawMask(context, 195, 101, 205, 16);
  drawText(context, okulAdi, 150, 104, 295, 10.5, 'center');
  drawMask(context, 168, 123, 260, 18);
  drawText(
    context,
    tde ? 'TÜRK DİLİ VE EDEBİYATI UYGULAMA NOTU ÇİZELGESİ' : 'YABANCI DİL UYGULAMA NOTU ÇİZELGESİ',
    145,
    127,
    305,
    12,
    'center',
    'bold'
  );

  return {
    headerRows: [
      { x: 138, top: 141, width: 110, height: 14, value: schoolInfo.ogretimYili || '....................' },
      { x: 433, top: 141, width: 104, height: 14, value: schoolInfo.donem || '....................' },
      { x: 138, top: 156, width: 116, height: 14, value: formatDate(examData.examDate) || '....................' },
      { x: 433, top: 156, width: 104, height: 14, value: examData.examTime || '....................' },
      { x: 138, top: 172, width: 170, height: 14, value: examData.course || '....................' },
      { x: 433, top: 172, width: 104, height: 14, value: examData.className || '....................' }
    ]
  };
}

function fillHeaderRows(context, rows) {
  rows.forEach(({ x, top, width, height, value }) => {
    drawMask(context, x, top, width, height);
    drawText(context, value, x + 2, top + 1, width - 4, 9.2);
  });
}

function drawStudentRows(context, students, formType) {
  const speaking = formType === 'speaking';
  const columns = speaking ? SPEAKING_GRID_COLUMNS : FOREIGN_GRID_COLUMNS;
  const firstRowTop = speaking ? 209.8 : 271.8;
  const rowHeight = speaking ? 13.48 : 15.35;
  const clearColumns = speaking
    ? [1, 2, 3, 4, 5, 6]
    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  for (let rowIndex = 0; rowIndex < 30; rowIndex += 1) {
    const top = firstRowTop + rowIndex * rowHeight;
    clearColumns.forEach((columnIndex) => {
      const left = columns[columnIndex] + 0.5;
      drawMask(
        context,
        left,
        top + 0.55,
        columns[columnIndex + 1] - columns[columnIndex] - 1,
        rowHeight - 1.1
      );
    });

    const student = students[rowIndex];
    if (!student) continue;
    const textTop = top + (speaking ? 2.4 : 2.1);
    const fontSize = speaking ? 7.8 : 8.5;
    drawText(context, student.sinif || '', columns[1] + 1, textTop, columns[2] - columns[1] - 2, fontSize, 'center');
    drawText(context, student.no || '', columns[2] + 1, textTop, columns[3] - columns[2] - 2, fontSize, 'center');
    drawText(context, student.adSoyad || '', columns[3] + 3, textTop, columns[4] - columns[3] - 6, fontSize);
  }
}

async function addReportPage(document, sourceBytes, formType, exam, students, subject, schoolInfo) {
  const template = await PDFDocument.load(sourceBytes);
  const [page] = await document.copyPages(template, [0]);
  document.addPage(page);

  const { width, height } = page.getSize();
  const canvas = globalThis.document.createElement('canvas');
  canvas.width = Math.ceil(width * RASTER_SCALE);
  canvas.height = Math.ceil(height * RASTER_SCALE);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('PDF çizim alanı oluşturulamadı.');
  context.scale(RASTER_SCALE, RASTER_SCALE);

  const examData = {
    examDate: exam.tarih,
    examTime: exam.saat,
    course: exam.ders,
    className: `${exam.seviye || ''}. Sınıf`
  };
  const { headerRows } = addInstitutionHeader(context, subject, schoolInfo, formType, examData);
  fillHeaderRows(context, headerRows);
  drawStudentRows(context, students, formType);

  if (formType === 'written') {
    const signatures = [
      { x: 82, value: exam.uye1 },
      { x: 328, value: exam.uye2 }
    ];
    signatures.forEach(({ x, value }) => {
      drawMask(context, x, 781, 180, 15);
      drawText(context, value, x, 783, 180, 8.5, 'center');
    });
  } else {
    drawMask(context, 352, 626, 168, 15);
    drawText(context, exam.uye1, 352, 628, 168, 8.5, 'center');
  }

  const image = await document.embedPng(await canvasToPng(canvas));
  page.drawImage(image, { x: 0, y: 0, width, height });
}

export async function createGradeSheetPdf({
  subject,
  exams,
  students,
  schoolInfo,
  foreignTemplateBytes,
  speakingTemplateBytes
}) {
  const document = await PDFDocument.create();
  const normalizedSchoolInfo = schoolInfo || {};

  for (const exam of exams) {
    const courseKey = normalizeCourse(exam.ders);
    const examStudents = students
      .filter((student) =>
        normalizeCourse(student.ders) === courseKey &&
        Number(student.seviye) === Number(exam.seviye)
      )
      .sort((a, b) => String(a.no || '').localeCompare(String(b.no || ''), 'tr-TR', { numeric: true }));
    const pageCount = Math.max(1, Math.ceil(examStudents.length / 30));

    for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
      const pageStudents = examStudents.slice(pageIndex * 30, (pageIndex + 1) * 30);
      await addReportPage(document, foreignTemplateBytes, 'written', exam, pageStudents, subject, normalizedSchoolInfo);
      await addReportPage(document, speakingTemplateBytes, 'speaking', exam, pageStudents, subject, normalizedSchoolInfo);
    }
  }

  const fileName = subject === 'tde'
    ? 'Turk_Dili_ve_Edebiyati_Uygulama_Not_Cizelgeleri.pdf'
    : 'Yabanci_Dil_Uygulama_Not_Cizelgeleri.pdf';
  document.setTitle(subject === 'tde' ? 'Türk Dili ve Edebiyatı' : 'Yabancı Dil');
  document.setSubject('Uygulama ve konuşma-dinleme not çizelgeleri');
  document.setProducer('Sorumluluk Sınavı Raporları');

  return {
    bytes: await document.save(),
    fileName,
    pageCount: document.getPageCount()
  };
}
