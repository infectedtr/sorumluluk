function normalizeName(value) {
  return String(value || '')
    .toLocaleUpperCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

export function isAdministratorPosition(position) {
  const normalized = normalizeName(position);
  return normalized.includes('MUDUR');
}

export function isAssignableTeacher(teacher, principalName = '') {
  if (!teacher?.active || isAdministratorPosition(teacher.position)) return false;
  const principal = normalizeName(principalName);
  return !principal || normalizeName(teacher.name) !== principal;
}

export function removeAdministratorAssignments(schedule, teachers, principalName = '') {
  const forbiddenNames = new Set(
    teachers
      .filter((teacher) => isAdministratorPosition(teacher.position))
      .map((teacher) => normalizeName(teacher.name))
  );
  const principal = normalizeName(principalName);
  if (principal) forbiddenNames.add(principal);

  const removeForbidden = (name) => forbiddenNames.has(normalizeName(name));
  return schedule.map((exam) => ({
    ...exam,
    uye1: removeForbidden(exam.uye1) ? '' : exam.uye1,
    uye2: removeForbidden(exam.uye2) ? '' : exam.uye2,
    uye3: removeForbidden(exam.uye3) ? '' : exam.uye3,
    gozcu: removeForbidden(exam.gozcu) ? '' : exam.gozcu,
    extraGozcular: (exam.extraGozcular || []).filter((name) => !removeForbidden(name))
  }));
}
