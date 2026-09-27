import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/excelParser';
import { normalizeExamType } from '../utils/examTypes';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Edit2,
  Trash2,
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  CheckSquare,
  Square
} from 'lucide-react';
import StudentModal from '../components/modals/StudentModal';
import ImportExcelModal from '../components/modals/ImportExcelModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function StudentsView() {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteStudents,
    clearAllStudents,
    syncCoursesFromStudents
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Sil',
    confirmStyle: 'danger'
  });

  // Extract unique classes and courses
  const uniqueClasses = Array.from(new Set(students.map((s) => s.sinif).filter(Boolean))).sort();
  const uniqueCourses = Array.from(new Set(students.map((s) => s.ders).filter(Boolean))).sort();

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (search) {
      const q = search.toLocaleLowerCase('tr-TR');
      const inName = (s.adSoyad || '').toLocaleLowerCase('tr-TR').includes(q);
      const inNo = String(s.no || '').includes(q);
      const inDers = (s.ders || '').toLocaleLowerCase('tr-TR').includes(q);
      if (!inName && !inNo && !inDers) return false;
    }
    if (filterClass !== 'all' && s.sinif !== filterClass) return false;
    if (filterLevel !== 'all' && Number(s.seviye) !== Number(filterLevel)) return false;
    if (filterCourse !== 'all' && s.ders !== filterCourse) return false;
    return true;
  });

  const handleExportExcel = () => {
    const exportData = filteredStudents.map((s, idx) => ({
      'Sıra': idx + 1,
      'Sınıfı': s.sinif,
      'Okul No': s.no,
      'Adı Soyadı': s.adSoyad,
      'Sorumlu Ders': s.ders,
      'Seviye': `${s.seviye}. Sınıf`,
      'Sınav Türü': normalizeExamType(s.sinavTuru)
    }));
    exportToExcel(exportData, 'Sorumlu_Ogrenci_Listesi');
  };

  const handleSaveStudent = (data) => {
    if (selectedStudent) {
      updateStudent(selectedStudent.id, data);
    } else {
      addStudent(data);
    }
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // Toggle select single
  const toggleSelect = (id) => {
    const strId = String(id);
    setSelectedIds((prev) =>
      prev.includes(strId) ? prev.filter((i) => i !== strId) : [...prev, strId]
    );
  };

  // Toggle select all filtered
  const toggleSelectAll = () => {
    const filteredStrIds = filteredStudents.map((s) => String(s.id));
    const allSelected = filteredStrIds.length > 0 && filteredStrIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredStrIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredStrIds])));
    }
  };

  // Trigger single delete
  const triggerSingleDelete = (student) => {
    setConfirmState({
      isOpen: true,
      title: 'Öğrenci Sorumluluk Kaydını Sil',
      message: `"${student.adSoyad}" (${student.sinif} - No: ${student.no}) öğrencisinin "${student.ders}" dersi sorumluluk kaydını silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteStudent(student.id);
        setSelectedIds((prev) => prev.filter((i) => i !== String(student.id)));
      }
    });
  };

  // Trigger bulk delete
  const triggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Seçilen Öğrenci Kayıtlarını Sil',
      message: `Seçtiğiniz ${selectedIds.length} adet öğrenci sorumluluk kaydı sistemden silinecektir. Onaylıyor musunuz?`,
      confirmText: `${selectedIds.length} Kaydı Sil`,
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteStudents(selectedIds);
        setSelectedIds([]);
      }
    });
  };

  // Trigger clear all students
  const triggerClearAll = () => {
    setConfirmState({
      isOpen: true,
      title: 'Tüm Öğrenci Sorumluluk Listesini Sil',
      message: `TÜM öğrenci sorumluluk kayıtları (toplam ${students.length} kayıt) silinecektir! e-Okul'dan yeni liste yükleyecekseniz bu işlemi yapabilirsiniz. Onaylıyor musunuz?`,
      confirmText: 'Evet, Tüm Listeyi Temizle',
      confirmStyle: 'danger',
      onConfirm: () => {
        clearAllStudents();
        setSelectedIds([]);
      }
    });
  };

  const isAllFilteredSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedIds.includes(String(s.id)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <GraduationCap className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Öğrenci Sorumluluk Listesi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toplam {students.length} öğrenci ders sorumluluğu kaydı bulunmaktadır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => syncCoursesFromStudents()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition-all shadow-sm"
            title="Öğrenci listesini tarayarak dersleri ve sayıları otomatik çıkar"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Dersleri ve Sayıları Çıkar</span>
          </button>

          <button
            onClick={triggerClearAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-all shadow-sm"
            title="Tüm öğrenci sorumluluk kayıtlarını siler"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Tümünü Temizle</span>
          </button>

          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>e-Okul Excel İçe Aktar</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel İndir</span>
          </button>

          <button
            onClick={() => {
              setSelectedStudent(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Öğrenci Ekle</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-rose-900 dark:text-rose-200 text-xs font-bold">
            <CheckSquare className="w-4 h-4 text-rose-600" />
            <span>{selectedIds.length} Öğrenci Kaydı Seçildi</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Seçimi Kaldır
            </button>
            <button
              onClick={triggerBulkDelete}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Seçilenleri Sil ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Öğrenci adı, no veya ders ara..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Tüm Sınıflar ({uniqueClasses.length} Şube)</option>
            {uniqueClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Tüm Seviyeler</option>
            <option value="9">9. Sınıf Sorumluluğu</option>
            <option value="10">10. Sınıf Sorumluluğu</option>
            <option value="11">11. Sınıf Sorumluluğu</option>
            <option value="12">12. Sınıf Sorumluluğu</option>
          </select>
        </div>

        {/* Course Filter */}
        <div>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Tüm Dersler ({uniqueCourses.length} Ders)</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                    title="Tümünü Seç / Seçimi Kaldır"
                  />
                </th>
                <th className="p-3.5 w-10 text-center">#</th>
                <th className="p-3.5">Sınıfı</th>
                <th className="p-3.5 text-center">Okul No</th>
                <th className="p-3.5">Öğrenci Adı Soyadı</th>
                <th className="p-3.5">Sorumlu Olduğu Ders</th>
                <th className="p-3.5 text-center">Dersin Seviyesi</th>
                <th className="p-3.5">Sınav Türü</th>
                <th className="p-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((s, idx) => {
                const isSelected = selectedIds.includes(String(s.id));

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(s.id)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                      />
                    </td>

                    <td className="p-3.5 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {s.sinif}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {s.no}
                    </td>

                    <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">
                      {s.adSoyad}
                    </td>

                    <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">
                      {s.ders}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {s.seviye}. Sınıf
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500">
                      {normalizeExamType(s.sinavTuru)}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerSingleDelete(s)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            Arama veya filtre kriterine uygun öğrenci kaydı bulunamadı.
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        onSave={handleSaveStudent}
        student={selectedStudent}
      />

      <ImportExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmStyle={confirmState.confirmStyle}
      />

    </div>
  );
}
