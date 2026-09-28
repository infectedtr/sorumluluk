export function normalizeCourseKey(courseName) {
  return String(courseName || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

export function teacherMatchesCourseBranch(teacherBranch, courseName, mappings) {
  const key = normalizeCourseKey(courseName);
  const mappedBranches = mappings?.[key];
  if (!Array.isArray(mappedBranches) || mappedBranches.length === 0) return null;

  const normalizedTeacherBranch = normalizeCourseKey(teacherBranch);
  if (!normalizedTeacherBranch) return false;
  return mappedBranches.some((branch) => normalizeCourseKey(branch) === normalizedTeacherBranch);
}

const DEFAULT_COURSE_BRANCHES = [
  { courses: ['TURK DILI', 'TURKCE', 'EDEBIYAT', 'DIL VE ANLATIM'], branches: ['TURK DILI VE EDEBIYATI', 'TURKCE'] },
  { courses: ['MATEMATIK', 'TEMEL MATEMATIK'], branches: ['MATEMATIK'] },
  { courses: ['FIZIK'], branches: ['FIZIK'] },
  { courses: ['KIMYA'], branches: ['KIMYA'] },
  { courses: ['BIYOLOJI'], branches: ['BIYOLOJI'] },
  { courses: ['TARIH', 'INKILAP', 'CAGDAS TURK'], branches: ['TARIH'] },
  { courses: ['COGRAFYA'], branches: ['COGRAFYA'] },
  { courses: ['FELSEFE', 'PSIKOLOJI', 'SOSYOLOJI', 'MANTIK'], branches: ['FELSEFE'] },
  { courses: ['DIN KULTURU', 'AHLAK BILGISI', 'KUR AN', 'HZ MUHAMMED', 'ISLAM TARIHI'], branches: ['DIN KULTURU VE AHLAK BILGISI', 'IMAM HATIP'] },
  { courses: ['YABANCI DIL', 'INGILIZCE', 'ALMANCA', 'FRANSIZCA', 'ISPANYOLCA', 'ARAPCA'], branches: ['INGILIZCE', 'ALMANCA', 'FRANSIZCA', 'YABANCI DIL', 'ARAPCA'] },
  { courses: ['BEDEN EGITIMI', 'SPOR'], branches: ['BEDEN EGITIMI'] },
  { courses: ['MUZIK'], branches: ['MUZIK'] },
  { courses: ['GORSEL SANATLAR', 'RESIM'], branches: ['GORSEL SANATLAR', 'RESIM'] },
  { courses: ['BILISIM', 'BILGISAYAR', 'PROGRAMLAMA', 'WEB TASARIM', 'VERI TABANI', 'YAZILIM'], branches: ['BILISIM TEKNOLOJILERI', 'BILGISAYAR'] },
  { courses: ['ELEKTRIK', 'ELEKTRONIK', 'OTOMASYON', 'PLC', 'ENERJI'], branches: ['ELEKTRIK ELEKTRONIK TEKNOLOJISI', 'ELEKTRIK'] },
  { courses: ['MAKINE', 'MOTOR', 'OTOMOTIV', 'MOTORLU ARAC', 'KAYNAKCILIK', 'CNC', 'TALAS'], branches: ['MAKINE TEKNOLOJISI', 'MOTORLU ARACLAR TEKNOLOJISI', 'METAL TEKNOLOJISI'] },
  { courses: ['METAL', 'CELIK', 'DOKUM'], branches: ['METAL TEKNOLOJISI'] },
  { courses: ['MOBILYA', 'IC MEKAN', 'AHSAP', 'MARANGOZ'], branches: ['MOBILYA VE IC MEKAN TASARIMI'] },
  { courses: ['INSAAT', 'YAPI', 'MIMARLIK', 'HARITA'], branches: ['INSAAT TEKNOLOJISI', 'YAPI TEKNOLOJISI'] },
  { courses: ['TEKSTIL', 'KONFEKSIYON', 'GIYIM', 'DOKUMA'], branches: ['TEKSTIL TEKNOLOJISI', 'GIYIM URETIM TEKNOLOJISI'] },
  { courses: ['GIDA', 'MUTFAK', 'YIYECEK', 'PASTANE', 'ASCILIK'], branches: ['GIDA TEKNOLOJISI', 'ASCILIK'] },
  { courses: ['SAGLIK', 'HEMSIRELIK', 'ILK YARDIM', 'ECZANE'], branches: ['SAGLIK HIZMETLERI', 'HEMSIRELIK'] },
  { courses: ['COCUK GELISIMI', 'COCUK BAKIMI'], branches: ['COCUK GELISIMI VE EGITIMI'] },
  { courses: ['MUHASEBE', 'FINANS', 'PAZARLAMA', 'BANKACILIK', 'TICARET'], branches: ['MUHASEBE VE FINANSMAN', 'MUHASEBE'] },
  { courses: ['TURIZM', 'OTELCILIK', 'SEYAHAT', 'REHBER'], branches: ['TURIZM VE OTEL ISLETMECILIGI'] },
  { courses: ['GRAFIK', 'MEDYA', 'TASARIM', 'FOTOGRAF', 'SINEMA'], branches: ['GRAFIK VE FOTOGRAF', 'MEDYA VE ILETISIM'] }
];

export function teacherMatchesBuiltInCourseBranch(teacherBranch, courseName) {
  const branch = normalizeCourseKey(teacherBranch);
  const course = normalizeCourseKey(courseName);
  if (!branch || !course) return false;
  if (course.includes(branch) || branch.includes(course)) return true;

  return DEFAULT_COURSE_BRANCHES.some((mapping) =>
    mapping.courses.some((name) => course.includes(name))
    && mapping.branches.some((name) => branch.includes(name) || name.includes(branch))
  );
}

export function teacherMatchesCourse(teacherBranch, courseName, mappings) {
  const explicitMatch = teacherMatchesCourseBranch(teacherBranch, courseName, mappings);
  return explicitMatch ?? teacherMatchesBuiltInCourseBranch(teacherBranch, courseName);
}
