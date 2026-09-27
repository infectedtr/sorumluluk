export function getExamObservers(exam) {
  return [...new Set([exam.uye3, exam.gozcu, ...(exam.extraGozcular || [])].filter(Boolean))];
}
