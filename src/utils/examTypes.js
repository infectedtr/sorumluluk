export const EXAM_TYPES = ['Yazılı', 'Uygulama', 'Sözlü'];

export function normalizeExamType(value) {
  const normalized = String(value || '').trim().toLocaleLowerCase('tr-TR');

  if (normalized.includes('uygul')) return 'Uygulama';
  if (normalized.includes('sözlü') || normalized.includes('sozlu')) return 'Sözlü';
  return 'Yazılı';
}
