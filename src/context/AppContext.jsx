import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStoredData, saveStoredData, resetToAccessData } from '../data/storage';
import { checkConflicts, calculateTeacherStats, autoAssignCommission } from '../utils/scheduler';
import { isHeaderOrFooterLabel, formatEOkulClassName } from '../utils/excelParser';
import { getExamTypesForCourse, normalizeExamType } from '../utils/examTypes';
import { normalizeCourseKey } from '../utils/courseBranchMapping';
import { isAdministratorPosition, isAssignableTeacher, removeAdministratorAssignments } from '../utils/teacherEligibility';

const AppContext = createContext();

function getObserverThreshold(schoolInfo) {
  const threshold = Number(schoolInfo.gozcuEsikOgrenciSayisi);
  return Number.isFinite(threshold) && threshold >= 0 ? threshold : 30;
}

export function AppProvider({ children }) {
  const [data, setData] = useState(() => {
    const raw = loadStoredData();
    const schoolInfo = raw.schoolInfo || {};
    const storedTeachers = raw.teachers || [];
    const seenIds = new Set();
    const sanitizedTeachers = storedTeachers.map((teacher, idx) => {
      let id = teacher.id;
      if (!id || seenIds.has(String(id))) {
        id = `t_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 9)}`;
      }
      seenIds.add(String(id));
      return {
        ...teacher,
        id,
        branch: (teacher.branch || 'Genel').trim(),
        active: isAssignableTeacher(teacher, schoolInfo.okulMuduru)
      };
    });
    const sanitizedStudents = (raw.students || [])
      .filter((s) => s && s.ders && !isHeaderOrFooterLabel(s.ders))
      .map((s) => ({
        ...s,
        sinif: formatEOkulClassName(s.sinif) || s.sinif || '10-A'
      }));

    const sanitizedCourses = (raw.courses || []).filter(
      (c) => c && c.name && !isHeaderOrFooterLabel(c.name)
    );

    const validSchedule = (raw.schedule || []).filter(
      (sc) => sc && sc.ders && !isHeaderOrFooterLabel(sc.ders)
    );
    const sanitizedSchedule = removeAdministratorAssignments(
      validSchedule,
      sanitizedTeachers,
      schoolInfo.okulMuduru
    );

    return {
      ...raw,
      teachers: sanitizedTeachers,
      students: sanitizedStudents,
      courses: sanitizedCourses,
      schedule: sanitizedSchedule
    };
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const DEFAULT_MENU_ORDER = [
    'dashboard',
    'schedule',
    'teachers',
    'students',
    'courses',
    'course-branches',
    'duties',
    'commission',
    'reports',
    'settings',
    'backup',
    'guide'
  ];

  const [sidebarReorderEnabled, setSidebarReorderEnabledState] = useState(() => {
    try {
      return localStorage.getItem('sidebar_reorder_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const setSidebarReorderEnabled = (val) => {
    setSidebarReorderEnabledState(val);
    try {
      localStorage.setItem('sidebar_reorder_enabled', String(val));
    } catch {
      // ignore
    }
  };

  const [sidebarOrder, setSidebarOrderState] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_menu_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter((id) => DEFAULT_MENU_ORDER.includes(id));
          const missing = DEFAULT_MENU_ORDER.filter((id) => !valid.includes(id));
          return [...valid, ...missing];
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_MENU_ORDER;
  });

  const setSidebarOrder = (newOrder) => {
    setSidebarOrderState(newOrder);
    try {
      localStorage.setItem('sidebar_menu_order', JSON.stringify(newOrder));
    } catch {
      // ignore
    }
  };

  const resetSidebarOrder = () => {
    setSidebarOrderState(DEFAULT_MENU_ORDER);
    try {
      localStorage.removeItem('sidebar_menu_order');
    } catch {
      // ignore
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // School Info Updates
  const updateSchoolInfo = (info) => {
    setData((prev) => {
      const schoolInfo = { ...prev.schoolInfo, ...info };
      const teachers = prev.teachers.map((teacher) => ({
        ...teacher,
        active: isAssignableTeacher(teacher, schoolInfo.okulMuduru)
      }));
      return {
        ...prev,
        schoolInfo,
        teachers,
        schedule: removeAdministratorAssignments(prev.schedule, teachers, schoolInfo.okulMuduru)
      };
    });
    showToast('Okul bilgileri ve ayarlar güncellendi.');
  };

  // ==========================================
  // TEACHER HANDLERS
  // ==========================================
  const addTeacher = (teacher) => {
    const newId = `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setData((prev) => ({
      ...prev,
      teachers: [
        ...prev.teachers,
        {
          ...teacher,
          id: newId,
          branch: (teacher.branch || 'Genel').trim(),
          active: isAssignableTeacher(teacher, prev.schoolInfo.okulMuduru)
        }
      ]
    }));
    showToast(`${teacher.name} başarıyla eklendi.`);
  };

  const updateTeacher = (id, teacherData) => {
    setData((prev) => {
      const teachers = prev.teachers.map((teacher) => {
        if (String(teacher.id) !== String(id)) return teacher;
        const updated = {
          ...teacher,
          ...teacherData,
          branch: (teacherData.branch !== undefined ? teacherData.branch : teacher.branch || 'Genel').trim()
        };
        return { ...updated, active: isAssignableTeacher(updated, prev.schoolInfo.okulMuduru) };
      });
      return {
        ...prev,
        teachers,
        schedule: removeAdministratorAssignments(prev.schedule, teachers, prev.schoolInfo.okulMuduru)
      };
    });
    showToast('Öğretmen bilgisi güncellendi.');
  };

  const deleteTeacher = (id) => {
    const teacher = data.teachers.find((t) => String(t.id) === String(id));
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => String(t.id) !== String(id))
    }));
    showToast(`${teacher ? teacher.name : 'Öğretmen'} başarıyla silindi.`, 'info');
  };

  const deleteTeachers = (ids) => {
    const idStrings = ids.map(String);
    setData((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => !idStrings.includes(String(t.id)))
    }));
    showToast(`${ids.length} öğretmen başarıyla silindi.`, 'info');
  };

  const clearAllTeachers = () => {
    setData((prev) => ({
      ...prev,
      teachers: []
    }));
    showToast('Tüm öğretmen listesi temizlendi.', 'info');
  };

  const bulkAddTeachers = (newTeachers) => {
    setData((prev) => {
      const teachersByName = new Map(
        prev.teachers.map((teacher) => [teacher.name.toLocaleUpperCase('tr-TR'), teacher])
      );
      const seenIds = new Set(prev.teachers.map((t) => String(t.id)));
      newTeachers.forEach((teacher, idx) => {
        const key = teacher.name.toLocaleUpperCase('tr-TR');
        const existing = teachersByName.get(key);
        let id = existing ? existing.id : teacher.id;
        if (!id || (!existing && seenIds.has(String(id)))) {
          id = `t_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 9)}`;
        }
        seenIds.add(String(id));
        const merged = {
          ...existing,
          ...teacher,
          id,
          branch: (teacher.branch || existing?.branch || 'Genel').trim(),
          active:
            Boolean(teacher.active) &&
            !isAdministratorPosition(teacher.position) &&
            isAssignableTeacher(teacher, prev.schoolInfo.okulMuduru) &&
            (existing ? existing.active : true)
        };
        teachersByName.set(key, merged);
      });
      const teachers = [...teachersByName.values()];
      return {
        ...prev,
        teachers,
        schedule: removeAdministratorAssignments(prev.schedule, teachers, prev.schoolInfo.okulMuduru)
      };
    });
    showToast(`${newTeachers.length} öğretmen sisteme aktarıldı.`);
  };

  // ==========================================
  // ROOM HANDLERS
  // ==========================================
  const addRoom = (room) => {
    setData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, { ...room, id: Date.now() }]
    }));
    showToast('Sınav salonu eklendi.');
  };

  const deleteRoom = (id) => {
    setData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => String(r.id) !== String(id))
    }));
    showToast('Salon silindi.', 'info');
  };

  // ==========================================
  // HOUR HANDLERS
  // ==========================================
  const addHour = (hourStr) => {
    if (!data.hours.includes(hourStr)) {
      setData((prev) => ({
        ...prev,
        hours: [...prev.hours, hourStr].sort()
      }));
      showToast(`${hourStr} sınav saati eklendi.`);
    }
  };

  const deleteHour = (hourStr) => {
    setData((prev) => ({
      ...prev,
      hours: prev.hours.filter((h) => h !== hourStr)
    }));
    showToast(`${hourStr} saati çıkarıldı.`, 'info');
  };

  // ==========================================
  // STUDENT HANDLERS
  // ==========================================
  const addStudent = (student) => {
    setData((prev) => ({
      ...prev,
      students: [...prev.students, { ...student, id: Date.now() }]
    }));
    showToast('Öğrenci kaydı eklendi.');
  };

  const updateStudent = (id, studentData) => {
    setData((prev) => ({
      ...prev,
      students: prev.students.map((s) => (String(s.id) === String(id) ? { ...s, ...studentData } : s))
    }));
    showToast('Öğrenci kaydı güncellendi.');
  };

  const deleteStudent = (id) => {
    const student = data.students.find((s) => String(s.id) === String(id));
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => String(s.id) !== String(id))
    }));
    showToast(`${student ? student.adSoyad : 'Öğrenci'} sorumluluk kaydı silindi.`, 'info');
  };

  const deleteStudents = (ids) => {
    const idStrings = ids.map(String);
    setData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => !idStrings.includes(String(s.id)))
    }));
    showToast(`${ids.length} öğrenci kaydı başarıyla silindi.`, 'info');
  };

  const clearAllStudents = () => {
    setData((prev) => ({
      ...prev,
      students: []
    }));
    showToast('Tüm öğrenci sorumluluk listesi silindi.', 'info');
  };

  const bulkAddStudents = (newStudents) => {
    setData((prev) => ({
      ...prev,
      students: [...prev.students, ...newStudents]
    }));
    showToast(`${newStudents.length} öğrenci sorumluluk kaydı aktarıldı.`);
  };

  // ==========================================
  // COURSE HANDLERS
  // ==========================================
  const deleteCourse = (id) => {
    setData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => String(c.id) !== String(id))
    }));
    showToast('Ders kaydı silindi.', 'info');
  };

  const updateCourseBranchMapping = (courseName, branches) => {
    const key = normalizeCourseKey(courseName);
    if (!key) return;
    setData((prev) => {
      const courseBranchMappings = { ...prev.courseBranchMappings };
      const uniqueBranches = [...new Set(branches.filter(Boolean))];
      if (uniqueBranches.length) courseBranchMappings[key] = uniqueBranches;
      else delete courseBranchMappings[key];
      return { ...prev, courseBranchMappings };
    });
  };

  const deleteCourses = (ids) => {
    const idStrings = ids.map(String);
    setData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => !idStrings.includes(String(c.id)))
    }));
    showToast(`${ids.length} ders silindi.`, 'info');
  };

  const clearAllCourses = () => {
    setData((prev) => ({
      ...prev,
      courses: []
    }));
    showToast('Tüm dersler temizlendi.', 'info');
  };

  // Course & Schedule Auto-Sync from Students
  const syncCoursesFromStudents = () => {
    const courseMap = {};

    data.students.forEach((s) => {
      if (!s.ders || isHeaderOrFooterLabel(s.ders)) return;
      const key = `${s.ders}_${s.seviye}`;
      const sinavTuru = normalizeExamType(s.sinavTuru);
      const courseKey = `${key}_${sinavTuru}`;
      if (!courseMap[courseKey]) {
        courseMap[courseKey] = {
          name: s.ders,
          seviye: s.seviye,
          sinavTuru,
          count: 0
        };
      }
      courseMap[courseKey].count++;
    });

    const syncedCourses = [];
    const writtenOralCourses = new Map();
    Object.values(courseMap).forEach((course) => {
      const examTypes = getExamTypesForCourse(course.name, course.sinavTuru);
      if (examTypes.length === 1) {
        syncedCourses.push(course);
        return;
      }
      const key = `${normalizeCourseKey(course.name)}_${Number(course.seviye)}`;
      const existing = writtenOralCourses.get(key);
      if (!existing || course.count > existing.count) {
        writtenOralCourses.set(key, course);
      }
    });
    writtenOralCourses.forEach((course) => {
      getExamTypesForCourse(course.name, course.sinavTuru).forEach((sinavTuru) => {
        syncedCourses.push({ ...course, sinavTuru });
      });
    });
    const newCourses = syncedCourses.map((c, idx) => ({
      id: idx + 1,
      name: c.name,
      seviye: c.seviye,
      sinavTuru: c.sinavTuru,
      ogrenciSayisi: c.count
    }));

    // Update schedule items with correct student counts and new courses
    const defaultRoom = data.rooms[0]?.name || 'Derslik 1';
    const updatedSchedule = newCourses.map((c, idx) => {
      const existing = data.schedule.find(
        (ex) =>
          ex.ders === c.name &&
          Number(ex.seviye) === Number(c.seviye) &&
          normalizeExamType(ex.sinavTuru) === c.sinavTuru
      );
      if (existing) {
        return {
          ...existing,
          sinavTuru: c.sinavTuru,
          ogrenciSayisi: c.ogrenciSayisi
        };
      }
      return {
        id: Date.now() + idx,
        tarih: data.schoolInfo.sinavBaslangic || '2025-02-03',
        saat: data.hours[idx % data.hours.length] || '10:00',
        seviye: c.seviye,
        ders: c.name,
        sinavTuru: c.sinavTuru,
        ogrenciSayisi: c.ogrenciSayisi,
        salon: defaultRoom,
        uye1: '',
        uye2: '',
        uye3: '',
        gozcu: '',
        aciklama: ''
      };
    });

    setData((prev) => ({
      ...prev,
      courses: newCourses,
      schedule: updatedSchedule
    }));

    showToast(
      `Öğrenci listesinden ${newCourses.length} ders ve sınav oturumu otomatik güncellendi.`
    );
  };

  // ==========================================
  // EXAM SCHEDULE HANDLERS
  // ==========================================
  const addExam = (exam) => {
    setData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { ...exam, id: Date.now() }]
    }));
    showToast('Yeni sınav oturumu programa eklendi.');
  };

  const updateExam = (id, examData) => {
    setData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((ex) => (String(ex.id) === String(id) ? { ...ex, ...examData } : ex))
    }));
    showToast('Sınav oturumu güncellendi.');
  };

  const deleteExam = (id) => {
    setData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((ex) => String(ex.id) !== String(id))
    }));
    showToast('Sınav oturumu programdan kaldırıldı.', 'info');
  };

  const deleteExams = (ids) => {
    const idStrings = ids.map(String);
    setData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((ex) => !idStrings.includes(String(ex.id)))
    }));
    showToast(`${ids.length} sınav oturumu programdan kaldırıldı.`, 'info');
  };

  const clearAllExams = () => {
    setData((prev) => ({
      ...prev,
      schedule: []
    }));
    showToast('Tüm sınav programı sıfırlandı.', 'info');
  };

  const clearCommissionAssignments = () => {
    setData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((ex) => ({
        ...ex,
        uye1: '',
        uye2: '',
        uye3: '',
        gozcu: ''
      }))
    }));
    showToast('Tüm öğretmen komisyon görevlendirmeleri sıfırlandı.', 'info');
  };

  const clearAllProgramData = () => {
    setData((prev) => ({
      ...prev,
      schedule: [],
      courses: [],
      students: []
    }));
    showToast('Sınav programı, dersler ve öğrenci listesi tamamen sıfırlandı.', 'info');
  };

  const clearEntireSystem = () => {
    setData((prev) => ({
      ...prev,
      teachers: [],
      students: [],
      courses: [],
      schedule: []
    }));
    showToast('Sistem tamamen sıfırlandı (Öğretmenler, öğrenciler, dersler ve program temizlendi).', 'info');
  };

  // Auto Assign Commission
  const runAutoAssignment = () => {
    const newSchedule = autoAssignCommission(
      data.schedule,
      data.teachers,
      data.students,
      data.schoolInfo.okulMuduru,
      data.courseBranchMappings,
      getObserverThreshold(data.schoolInfo)
    );
    setData((prev) => ({
      ...prev,
      schedule: newSchedule
    }));
    showToast('Komisyon üyeleri adil ve branş uyumlu olarak otomatik atandı!');
  };

  // Restore factory data
  const handleResetToAccess = () => {
    const initial = resetToAccessData();
    setData(initial);
    showToast('Tüm veriler orijinal Access veritabanı haline getirildi.', 'info');
  };

  // Import whole JSON
  const handleImportJson = (parsedJson) => {
    if (parsedJson && parsedJson.teachers && parsedJson.schedule) {
      setData({
        ...parsedJson,
        courseBranchMappings: parsedJson.courseBranchMappings || {}
      });
      showToast('Yedek başarıyla yüklendi.');
      return true;
    }
    showToast('Geçersiz yedek dosyası formatı!', 'error');
    return false;
  };

  // Computed state
  const conflicts = checkConflicts(
    data.schedule,
    data.students,
    getObserverThreshold(data.schoolInfo)
  );
  const teacherStats = calculateTeacherStats(data.teachers, data.schedule);

  return (
    <AppContext.Provider
      value={{
        ...data,
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        toastMessage,
        showToast,
        sidebarReorderEnabled,
        setSidebarReorderEnabled,
        sidebarOrder,
        setSidebarOrder,
        resetSidebarOrder,
        DEFAULT_MENU_ORDER,
        conflicts,
        teacherStats,
        updateSchoolInfo,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        deleteTeachers,
        clearAllTeachers,
        bulkAddTeachers,
        addRoom,
        deleteRoom,
        addHour,
        deleteHour,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteStudents,
        clearAllStudents,
        bulkAddStudents,
        deleteCourse,
        updateCourseBranchMapping,
        deleteCourses,
        clearAllCourses,
        syncCoursesFromStudents,
        addExam,
        updateExam,
        deleteExam,
        deleteExams,
        clearAllExams,
        clearCommissionAssignments,
        clearAllProgramData,
        clearEntireSystem,
        runAutoAssignment,
        handleResetToAccess,
        handleImportJson
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
