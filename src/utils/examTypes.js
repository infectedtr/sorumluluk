export const EXAM_TYPES = ['Yazılı', 'Uygulama', 'Sözlü'];

export function normalizeExamType(value) {
  const normalized = String(value || '').trim().toLocaleLowerCase('tr-TR');

  if (normalized.includes('uygul')) return 'Uygulama';
  if (normalized.includes('sözlü') || normalized.includes('sozlu')) return 'Sözlü';
  return 'Yazılı';
}

export function requiresWrittenAndOralExams(courseName) {
  const course = String(courseName || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();

  return course.includes('TURK DILI VE EDEBIYATI')
    || course.includes('YABANCI DIL')
    || /\b(INGILIZCE|ALMANCA|FRANSIZCA|ARAPCA|ISPANYOLCA|RUSCA|JAPONCA|ITALYANCA|CINCE|FARSCA|PORTEKIZCE|KORECE|YUNANCA|LATINCE|IBRANICE)\b/.test(course);
}

export function getExamTypesForCourse(courseName, defaultType) {
  return requiresWrittenAndOralExams(courseName)
    ? ['Yazılı', 'Sözlü']
    : [normalizeExamType(defaultType)];
}
