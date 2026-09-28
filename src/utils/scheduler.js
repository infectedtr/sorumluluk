import { normalizeExamType } from './examTypes.js';
import { isAssignableTeacher } from './teacherEligibility.js';
import { getExamObservers } from './examRoles.js';
import { normalizeCourseKey, teacherMatchesCourseBranch } from './courseBranchMapping.js';

/**
 * Checks for conflicts in the schedule
 */
export function checkConflicts(schedule, students = [], observerThreshold = 30) {
  const teacherConflicts = [];
  const roomConflicts = [];
  const studentConflicts = [];
  const warnings = [];

  // Group by date & time
  const timeSlots = {};

  schedule.forEach((exam) => {
    if (!exam.tarih || !exam.saat) return;
    const key = `${exam.tarih}_${exam.saat}`;
    if (!timeSlots[key]) timeSlots[key] = [];
    timeSlots[key].push(exam);

    // Rule: Need at least 2 commission members
    const commissionMembers = [exam.uye1, exam.uye2].filter(Boolean);
    if (commissionMembers.length < 2) {
      warnings.push({
        examId: exam.id,
        ders: exam.ders,
        tarih: exam.tarih,
        saat: exam.saat,
        type: 'eksik_uye',
        message: `${exam.ders} (${exam.seviye}. Sınıf) sınavında en az 2 komisyon üyesi (alan öğretmeni) görevlendirilmelidir.`
      });
    }

    // A configured threshold triggers an observer when the student count exceeds it.
    if (exam.ogrenciSayisi > observerThreshold && commissionMembers.length + getExamObservers(exam).length < 3) {
      warnings.push({
        examId: exam.id,
        ders: exam.ders,
        tarih: exam.tarih,
        saat: exam.saat,
        type: 'gozcu_eksik',
        message: `${exam.ders} sınavında ${exam.ogrenciSayisi} öğrenci bulunmaktadır (belirlenen ${observerThreshold} öğrenci eşiğinin üzerinde). İlave gözcü görevlendirilmesi tavsiye edilir.`
      });
    }
  });

  // Check simultaneous slot conflicts
  Object.keys(timeSlots).forEach((slotKey) => {
    const examsInSlot = timeSlots[slotKey];
    if (examsInSlot.length <= 1) return;

    // Check teacher overlap
    const teacherMap = {};
    examsInSlot.forEach((exam) => {
      const teachers = [...new Set([exam.uye1, exam.uye2, ...getExamObservers(exam)].filter(Boolean))];
      teachers.forEach((t) => {
        if (!teacherMap[t]) teacherMap[t] = [];
        teacherMap[t].push(exam);
      });

      // Check room overlap
      if (exam.salon) {
        const sameRoomExams = examsInSlot.filter((e) => e.salon === exam.salon);
        if (sameRoomExams.length > 1) {
          const alreadyAdded = roomConflicts.some(
            (rc) => rc.slotKey === slotKey && rc.salon === exam.salon
          );
          if (!alreadyAdded) {
            roomConflicts.push({
              slotKey,
              tarih: exam.tarih,
              saat: exam.saat,
              salon: exam.salon,
              exams: sameRoomExams,
              message: `${exam.tarih} ${exam.saat} saatinde "${exam.salon}" salonuna ${sameRoomExams.length} farklı sınav atanmış!`
            });
          }
        }
      }
    });

    Object.keys(teacherMap).forEach((teacherName) => {
      if (teacherMap[teacherName].length > 1) {
        teacherConflicts.push({
          slotKey,
          tarih: teacherMap[teacherName][0].tarih,
          saat: teacherMap[teacherName][0].saat,
          teacher: teacherName,
          exams: teacherMap[teacherName],
          message: `${teacherName} öğretmenine ${teacherMap[teacherName][0].tarih} ${teacherMap[teacherName][0].saat} saatinde birden fazla sınav görevi atanmış!`
        });
      }
    });
  });

  // Check student exam overlap
  if (students && students.length > 0) {
    const studentMap = {}; // no -> [{ examId, ders, tarih, saat }]
    students.forEach((s) => {
      if (!s.no) return;
      const matchedExams = schedule.filter(
        (e) => e.ders && s.ders && e.ders.toUpperCase() === s.ders.toUpperCase() && Number(e.seviye) === Number(s.seviye)
      );
      matchedExams.forEach((me) => {
        if (!me.tarih || !me.saat) return;
        if (!studentMap[s.no]) studentMap[s.no] = { adSoyad: s.adSoyad, exams: [] };
        studentMap[s.no].exams.push(me);
      });
    });

    Object.keys(studentMap).forEach((no) => {
      const studentInfo = studentMap[no];
      const slotMap = {};
      studentInfo.exams.forEach((ex) => {
        const slot = `${ex.tarih}_${ex.saat}`;
        if (!slotMap[slot]) slotMap[slot] = [];
        slotMap[slot].push(ex);
      });
      Object.keys(slotMap).forEach((slot) => {
        if (slotMap[slot].length > 1) {
          studentConflicts.push({
            no,
            adSoyad: studentInfo.adSoyad,
            tarih: slotMap[slot][0].tarih,
            saat: slotMap[slot][0].saat,
            exams: slotMap[slot],
            message: `${studentInfo.adSoyad} (${no}) adlı öğrencinin ${slotMap[slot][0].tarih} ${slotMap[slot][0].saat} saatinde aynı anda ${slotMap[slot].length} sınavı bulunmaktadır!`
          });
        }
      });
    });
  }

  return {
    teacherConflicts,
    roomConflicts,
    studentConflicts,
    warnings,
    hasErrors: teacherConflicts.length > 0 || roomConflicts.length > 0 || studentConflicts.length > 0
  };
}

/**
 * Calculates duty count statistics for all teachers
 */
export function calculateTeacherStats(teachers, schedule) {
  const stats = teachers.map((t) => {
    let count = 0;
    const assignments = [];

    schedule.forEach((exam) => {
      let role = null;
      if (exam.uye1 === t.name) role = '1. Üye';
      else if (exam.uye2 === t.name) role = '2. Üye';
      else if (exam.uye3 === t.name) role = 'Gözcü';
      else if (exam.gozcu === t.name) role = 'Gözcü';
      else if (exam.extraGozcular?.includes(t.name)) role = 'Ek Gözcü';

      if (role) {
        count++;
        assignments.push({
          examId: exam.id,
          ders: exam.ders,
          seviye: exam.seviye,
          tarih: exam.tarih,
          saat: exam.saat,
          salon: exam.salon,
          ogrenciSayisi: exam.ogrenciSayisi,
          role
        });
      }
    });

    return {
      id: t.id,
      name: t.name,
      branch: t.branch,
      active: t.active,
      count,
      assignments
    };
  });

  stats.sort((a, b) => b.count - a.count);
  return stats;
}

/**
 * Akıllı Komisyon Atama Algoritması (MEB Madde 58 uyumlu):
 *
 * Öncelik sırası:
 *  1) Dersin branşına uygun, müsait, en az görevli öğretmen → komisyon üyesi
 *  2) Uygun branş yoksa en az görevli aktif öğretmen → komisyon üyesi
 *  3) Öğrenci sayısı > 30 ise ilave gözcü (her branştan)
 *
 * Kurallar:
 *  - Aynı sınav oturumunda bir öğretmen en fazla 1 kez görev alır
 *  - Aynı tarih+saat diliminde bir öğretmene 2 görev verilemez
 *  - Komisyon üye sayısı minimum 2 (uye1 + uye2 = alan öğretmeni)
 */
export function autoAssignCommission(
  schedule,
  teachers,
  students = [],
  principalName = '',
  courseBranchMappings = {},
  observerThreshold = 30
) {
  // İçe aktarma inline ders-branş eşleştirme haritası kullanılıyor
  const activeTeachers = teachers.filter((teacher) => isAssignableTeacher(teacher, principalName));
  if (activeTeachers.length === 0) return schedule;

  // ── Yardımcı: bir öğretmenin branşının derse uygun olup olmadığını kontrol et ──
  function branshUygunMu(teacherBranch, dersAdi) {
    if (!teacherBranch || !dersAdi) return false;
    const tb = teacherBranch.toLocaleUpperCase('tr-TR');
    const dn = dersAdi.toLocaleUpperCase('tr-TR');
    // Doğrudan eşleşme
    if (dn.includes(tb) || tb.includes(dn)) return true;
    // Anahtar kelime eşleşmeleri (MEB müfredatı)
    const MAP = [
      { ders: ['TÜRK DİLİ','TÜRKÇE','EDEBİYAT','DİL VE ANLATIM'], brans: ['TÜRK DİLİ VE EDEBİYATI','TÜRKÇE'] },
      { ders: ['MATEMATİK','TEMEL MATEMATİK'], brans: ['MATEMATİK'] },
      { ders: ['FİZİK'], brans: ['FİZİK'] },
      { ders: ['KİMYA'], brans: ['KİMYA'] },
      { ders: ['BİYOLOJİ'], brans: ['BİYOLOJİ'] },
      { ders: ['TARİH','İNKILAP','ÇAĞDAŞ TÜRK'], brans: ['TARİH'] },
      { ders: ['COĞRAFYA'], brans: ['COĞRAFYA'] },
      { ders: ['FELSEFE','PSİKOLOJİ','SOSYOLOJİ','MANTIK'], brans: ['FELSEFE'] },
      { ders: ['DİN KÜLTÜRÜ','AHLAK BİLGİSİ','KUR\'AN','HZ MUHAMMED','İSLAM TARİHİ'], brans: ['DİN KÜLTÜRÜ VE AHLAK BİLGİSİ','İMAM HATİP'] },
      { ders: ['YABANCI DİL','İNGİLİZCE','ALMANCA','FRANSIZCA','İSPANYOLCA','ARAPÇA'], brans: ['İNGİLİZCE','ALMANCA','FRANSIZCA','YABANCI DİL','ARAPÇA'] },
      { ders: ['BEDEN EĞİTİMİ','SPOR'], brans: ['BEDEN EĞİTİMİ'] },
      { ders: ['MÜZİK'], brans: ['MÜZİK'] },
      { ders: ['GÖRSEL SANATLAR','RESİM'], brans: ['GÖRSEL SANATLAR','RESİM'] },
      { ders: ['BİLİŞİM','BİLGİSAYAR','PROGRAMLAMA','WEB TASARIM','VERİ TABANI','YAZILIM'], brans: ['BİLİŞİM TEKNOLOJİLERİ','BİLGİSAYAR'] },
      { ders: ['ELEKTRİK','ELEKTRONİK','OTOMASYON','PLC','ENERJİ'], brans: ['ELEKTRİK-ELEKTRONİK TEKNOLOJİSİ','ELEKTRİK'] },
      { ders: ['MAKİNE','MOTOR','OTOMOTİV','MOTORLU ARAÇ','KAYNAKÇILIK','CNC','TALAŞ'], brans: ['MAKİNE TEKNOLOJİSİ','MOTORLU ARAÇLAR TEKNOLOJİSİ','METAL TEKNOLOJİSİ'] },
      { ders: ['METAL','ÇELİK','DÖKÜM'], brans: ['METAL TEKNOLOJİSİ'] },
      { ders: ['MOBİLYA','İÇ MEKAN','AHŞAP','MARANGOZ'], brans: ['MOBİLYA VE İÇ MEKAN TASARIMI'] },
      { ders: ['İNŞAAT','YAPI','MİMARLIK','HARITA'], brans: ['İNŞAAT TEKNOLOJİSİ','YAPI TEKNOLOJİSİ'] },
      { ders: ['TEKSTİL','KONFEKSİYON','GİYİM','DOKUMA'], brans: ['TEKSTİL TEKNOLOJİSİ','GİYİM ÜRETİM TEKNOLOJİSİ'] },
      { ders: ['GIDA','MUTFAK','YİYECEK','PASTANE','AŞÇILIK'], brans: ['GIDA TEKNOLOJİSİ','AŞÇILIK'] },
      { ders: ['SAĞLIK','HEMŞİRELİK','İLK YARDIM','ECZANE'], brans: ['SAĞLIK HİZMETLERİ','HEMŞİRELİK'] },
      { ders: ['ÇOCUK GELİŞİMİ','ÇOCUK BAKIMI'], brans: ['ÇOCUK GELİŞİMİ VE EĞİTİMİ'] },
      { ders: ['MUHASEBE','FİNANS','PAZARLAMA','BANKACILIK','TİCARET'], brans: ['MUHASEBE VE FİNANSMAN','MUHASEBE'] },
      { ders: ['TURİZM','OTELCİLİK','SEYAHAT','REHBER'], brans: ['TURİZM VE OTEL İŞLETMECİLİĞİ'] },
      { ders: ['GRAFİK','MEDYA','TASARIM','FOTOĞRAF','SİNEMA'], brans: ['GRAFİK VE FOTOĞRAF','MEDYA VE İLETİŞİM'] },
    ];
    for (const entry of MAP) {
      const dersMatch = entry.ders.some((d) => dn.includes(d));
      if (!dersMatch) continue;
      const bransMatch = entry.brans.some((b) => tb.includes(b) || b.includes(tb));
      if (bransMatch) return true;
    }
    return false;
  }

  function normalizeBranchText(value) {
    return String(value || '')
      .toLocaleUpperCase('tr-TR')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim();
  }

  function isCultureCourse(ders) {
    const course = normalizeBranchText(ders);
    const cultureSubjects = [
      'TURK', 'EDEBIYAT', 'MATEMATIK', 'FIZIK', 'KIMYA', 'BIYOLOJI',
      'TARIH', 'COGRAFYA', 'FELSEFE', 'YABANCI DIL', 'INGILIZCE',
      'ALMANCA', 'FRANSIZCA', 'ARAPCA', 'DIN KULTURU', 'BEDEN EGITIMI',
      'MUZIK', 'GORSEL SANATLAR', 'ASTRONOMI', 'FEN BILIMLERI',
      'TEMEL MATEMATIK', 'ADABI MUASERET'
    ];
    return cultureSubjects.some((subject) => course.includes(subject));
  }

  function teacherMatchesField(teacherBranch, alan) {
    const branch = normalizeBranchText(teacherBranch);
    const field = normalizeBranchText(alan)
      .replace(/\b(ALANI|DALI)\b/g, '')
      .trim();
    if (!branch || !field) return false;

    const fieldMappings = [
      { field: 'MAKINE VE TASARIM TEKNOLOJISI', branches: ['MAKINE TEKNOLOJISI'] },
      { field: 'MAKINE TEKNOLOJISI', branches: ['MAKINE TEKNOLOJISI'] },
      { field: 'METAL TEKNOLOJISI', branches: ['METAL TEKNOLOJISI'] },
      { field: 'ELEKTRIK ELEKTRONIK TEKNOLOJISI', branches: ['ELEKTRIK ELEKTRONIK TEKNOLOJISI', 'ELEKTRIK'] },
      { field: 'MOBILYA VE IC MEKAN TASARIMI', branches: ['MOBILYA VE IC MEKAN TASARIMI'] },
      { field: 'MOTORLU ARACLAR TEKNOLOJISI', branches: ['MOTORLU ARACLAR TEKNOLOJISI'] },
      { field: 'BILISIM TEKNOLOJILERI', branches: ['BILISIM TEKNOLOJILERI', 'BILGISAYAR'] }
    ];
    const mapping = fieldMappings.find((entry) => field.includes(entry.field));
    const branchNames = mapping?.branches || [field];
    return branchNames.some((name) => branch.includes(name));
  }

  function findFieldForExam(exam) {
    const fields = new Map();
    const course = normalizeBranchText(exam.ders);
    students.forEach((student) => {
      if (
        normalizeBranchText(student.ders) !== course ||
        Number(student.seviye) !== Number(exam.seviye) ||
        normalizeExamType(student.sinavTuru) !== normalizeExamType(exam.sinavTuru) ||
        !student.alan
      ) {
        return;
      }
      const area = String(student.alan).trim();
      fields.set(area, (fields.get(area) || 0) + 1);
    });

    const rankedFields = [...fields.entries()].sort((a, b) => b[1] - a[1]);
    if (!rankedFields.length || rankedFields[0][1] === rankedFields[1]?.[1]) return '';
    return rankedFields[0][0];
  }

  // Görev sayısı ve meşgul slotları takip et
  const dutyCounts = {};
  const busySlots = {};
  activeTeachers.forEach((t) => { dutyCounts[t.name] = 0; });

  const updatedSchedule = schedule.map((item) => ({ ...item }));

  /**
   * En uygun öğretmeni bul.
   * @param {string} tarih
   * @param {string} saat
   * @param {string} ders  - sınav ders adı
   * @param {string[]} exclude - bu sınavda zaten atanmış öğretmenler
   * @param {boolean} requireBranch - true → sadece uygun branştan ata
   */
  function getBestTeacher(tarih, saat, ders, exclude = [], requireBranch = false, alan = '') {
    const available = activeTeachers.filter((t) => {
      if (exclude.includes(t.name)) return false;
      return !busySlots[`${t.name}_${tarih}_${saat}`];
    });
    if (available.length === 0) return '';

    // Branşa uygun öğretmenler
    const mappingKey = normalizeCourseKey(ders);
    const hasCourseBranchMapping = Array.isArray(courseBranchMappings?.[mappingKey])
      && courseBranchMappings[mappingKey].length > 0;
    const branshUygun = available.filter((teacher) => {
      const explicitMatch = teacherMatchesCourseBranch(teacher.branch, ders, courseBranchMappings);
      return explicitMatch === null ? branshUygunMu(teacher.branch, ders) : explicitMatch;
    });
    if (branshUygun.length === 0 && !hasCourseBranchMapping && alan && !isCultureCourse(ders)) {
      const fieldTeachers = available.filter((t) => teacherMatchesField(t.branch, alan));
      if (fieldTeachers.length > 0) {
        fieldTeachers.sort((a, b) => (dutyCounts[a.name] || 0) - (dutyCounts[b.name] || 0));
        return fieldTeachers[0].name;
      }
    }

    if (hasCourseBranchMapping && branshUygun.length > 0) {
      branshUygun.sort((a, b) => (dutyCounts[a.name] || 0) - (dutyCounts[b.name] || 0));
      return branshUygun[0].name;
    }

    const pool = (requireBranch && branshUygun.length > 0) ? branshUygun : available;

    // Havuzun içinde en az görev almış öğretmeni seç
    // Eğer requireBranch=false ama branşa uygun varsa önce onları dene
    if (!requireBranch && branshUygun.length > 0) {
      const minBrans = Math.min(...branshUygun.map((t) => dutyCounts[t.name] || 0));
      const minAll = Math.min(...available.map((t) => dutyCounts[t.name] || 0));
      // Branşa uygun öğretmenin yükü genel minimumdan en fazla 3 fazlaysa zorla değil
      if (minBrans <= minAll + 3) {
        branshUygun.sort((a, b) => (dutyCounts[a.name] || 0) - (dutyCounts[b.name] || 0));
        return branshUygun[0].name;
      }
    }

    pool.sort((a, b) => (dutyCounts[a.name] || 0) - (dutyCounts[b.name] || 0));
    return pool[0].name;
  }

  // Her sınav için komisyon ata
  updatedSchedule.forEach((exam) => {
    const slotKey = `${exam.tarih}_${exam.saat}`;
    const assigned = [];
    const alan = findFieldForExam(exam);

    // 1. Komisyon üyesi (branşa uygun öğretmen öncelikli)
    const uye1 = getBestTeacher(exam.tarih, exam.saat, exam.ders, assigned, false, alan);
    if (uye1) {
      exam.uye1 = uye1;
      dutyCounts[uye1] = (dutyCounts[uye1] || 0) + 1;
      busySlots[`${uye1}_${slotKey}`] = true;
      assigned.push(uye1);
    }

    // 2. Komisyon üyesi (branşa uygun öğretmen öncelikli)
    const uye2 = getBestTeacher(exam.tarih, exam.saat, exam.ders, assigned, false, alan);
    if (uye2) {
      exam.uye2 = uye2;
      dutyCounts[uye2] = (dutyCounts[uye2] || 0) + 1;
      busySlots[`${uye2}_${slotKey}`] = true;
      assigned.push(uye2);
    }

    // İlk iki görev komisyon üyesidir; sonraki görevli gözcü olarak atanır.
    if ((exam.ogrenciSayisi || 0) > observerThreshold) {
      const uye3 = getBestTeacher(exam.tarih, exam.saat, exam.ders, assigned, false, alan);
      if (uye3) {
        exam.uye3 = uye3;
        dutyCounts[uye3] = (dutyCounts[uye3] || 0) + 1;
        busySlots[`${uye3}_${slotKey}`] = true;
        assigned.push(uye3);
      }
    }
  });

  return updatedSchedule;
}
