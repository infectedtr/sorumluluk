import {
  initialSchoolInfo,
  initialTeachers,
  initialHours,
  initialRooms,
  initialCourses,
  initialStudents,
  initialSchedule
} from './initialData';

const STORAGE_KEY = 'meb_sorumluluk_data_v1';

export function loadStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const schoolInfo = parsed.schoolInfo || initialSchoolInfo;
      return {
        schoolInfo: schoolInfo.mudurYardimcisi === 'Sorumluluk Sınavları Komisyon Başkanı'
          ? { ...schoolInfo, mudurYardimcisi: '' }
          : schoolInfo,
        teachers: parsed.teachers || initialTeachers,
        hours: parsed.hours || initialHours,
        rooms: parsed.rooms || initialRooms,
        courses: parsed.courses || initialCourses,
        students: parsed.students || initialStudents,
        schedule: parsed.schedule || initialSchedule,
      };
    }
  } catch (err) {
    console.error('Storage load error:', err);
  }

  return {
    schoolInfo: initialSchoolInfo,
    teachers: initialTeachers,
    hours: initialHours,
    rooms: initialRooms,
    courses: initialCourses,
    students: initialStudents,
    schedule: initialSchedule,
  };
}

export function saveStoredData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Storage save error:', err);
  }
}

export function resetToAccessData() {
  const data = {
    schoolInfo: initialSchoolInfo,
    teachers: initialTeachers,
    hours: initialHours,
    rooms: initialRooms,
    courses: initialCourses,
    students: initialStudents,
    schedule: initialSchedule,
  };
  saveStoredData(data);
  return data;
}

export function downloadJsonBackup(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `MEB_Sorumluluk_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
