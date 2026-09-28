export function getExamObservers(exam) {
  return [...new Set([exam.uye3, exam.gozcu, ...(exam.extraGozcular || [])].filter(Boolean))];
}

export function getExamStaff(exam) {
  return [...new Set([exam.uye1, exam.uye2, ...getExamObservers(exam)].filter(Boolean))];
}
