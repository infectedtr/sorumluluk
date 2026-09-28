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
  return mappedBranches.some((branch) => normalizeCourseKey(branch) === normalizedTeacherBranch);
}
