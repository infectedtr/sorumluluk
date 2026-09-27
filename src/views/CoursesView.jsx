import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/excelParser';
import { normalizeExamType } from '../utils/examTypes';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  CalendarDays,
  Trash2,
  Edit2,
  RefreshCw,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function CoursesView() {
  const {
    courses,
    schedule,
    syncCoursesFromStudents,
    deleteCourse,
    deleteCourses,
    clearAllCourses,
    setActiveTab
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

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

  const filteredCourses = courses.filter((c) => {
    if (search) {
      const q = search.toLocaleLowerCase('tr-TR');
      if (!(c.name || '').toLocaleLowerCase('tr-TR').includes(q)) return false;
    }
    if (filterLevel !== 'all' && Number(c.seviye) !== Number(filterLevel)) return false;
    return true;
  });

  filteredCourses.sort((a, b) => {
    if (a.seviye !== b.seviye) return a.seviye - b.seviye;
    return a.name.localeCompare(b.name, 'tr-TR');
  });

  const handleExportExcel = () => {
    const exportData = filteredCourses.map((c, idx) => ({
      'Sıra': idx + 1,
      'Ders Adı': c.name,
      'Seviye': `${c.seviye}. Sınıf`,
      'Sorumlu Öğrenci Sayısı': c.ogrenciSayisi,
      'Sınav Türü': normalizeExamType(c.sinavTuru)
    }));
    exportToExcel(exportData, 'Sorumluluk_Dersleri_Listesi');
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
    const filteredStrIds = filteredCourses.map((c) => String(c.id));
    const allSelected = filteredStrIds.length > 0 && filteredStrIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredStrIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredStrIds])));
    }
  };

  // Single delete trigger
  const triggerSingleDelete = (course) => {
    setConfirmState({
      isOpen: true,
      title: 'Dersi Sil',
      message: `"${course.name}" (${course.seviye}. Sınıf) dersini silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteCourse(course.id);
        setSelectedIds((prev) => prev.filter((i) => i !== String(course.id)));
      }
    });
  };

  // Bulk delete trigger
  const triggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Seçilen Dersleri Sil',
      message: `Seçtiğiniz ${selectedIds.length} ders silinecektir. Onaylıyor musunuz?`,
      confirmText: `${selectedIds.length} Dersi Sil`,
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteCourses(selectedIds);
        setSelectedIds([]);
      }
    });
  };

  // Clear all courses trigger
  const triggerClearAll = () => {
    setConfirmState({
      isOpen: true,
      title: 'Tüm Dersleri Sil',
      message: `Tüm ders kayıtları silinecektir! e-Okul listesinden istediğiniz zaman tekrar otomatik çıkarabilirsiniz. Onaylıyor musunuz?`,
      confirmText: 'Evet, Tüm Dersleri Temizle',
      confirmStyle: 'danger',
      onConfirm: () => {
        clearAllCourses();
        setSelectedIds([]);
      }
    });
  };

  const totalExamStudents = courses.reduce((sum, c) => sum + (c.ogrenciSayisi || 0), 0);
  const isAllFilteredSelected =
    filteredCourses.length > 0 &&
    filteredCourses.every((c) => selectedIds.includes(String(c.id)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Sorumluluk Sınavı Dersleri & Sayıları</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toplam {courses.length} farklı dersten toplam {totalExamStudents} öğrenci sınav yükümlülüğü bulunmaktadır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => syncCoursesFromStudents()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Öğrencilerden Yeniden Hesapla</span>
          </button>

          <button
            onClick={triggerClearAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-all shadow-sm"
            title="Tüm ders listesini siler"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Tümünü Temizle</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel İndir</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Sınav Takvimine Git</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-rose-900 dark:text-rose-200 text-xs font-bold">
            <CheckSquare className="w-4 h-4 text-rose-600" />
            <span>{selectedIds.length} Ders Seçildi</span>
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
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ders adı ara..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Tüm Seviyeler</option>
            <option value="9">9. Sınıf Dersleri</option>
            <option value="10">10. Sınıf Dersleri</option>
            <option value="11">11. Sınıf Dersleri</option>
            <option value="12">12. Sınıf Dersleri</option>
          </select>
        </div>
      </div>

      {/* Courses Grid / Table */}
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
                <th className="p-3.5">Seviye</th>
                <th className="p-3.5">Ders Adı</th>
                <th className="p-3.5 text-center">Sorumlu Öğrenci Sayısı</th>
                <th className="p-3.5">Sınav Program Durumu</th>
                <th className="p-3.5">MEB Yönetmelik Durumu (Md. 58)</th>
                <th className="p-3.5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCourses.map((c, idx) => {
                const isScheduled = schedule.some(
                  (ex) => ex.ders === c.name && Number(ex.seviye) === Number(c.seviye)
                );
                const isOver30 = (c.ogrenciSayisi || 0) > 30;
                const isSelected = selectedIds.includes(String(c.id));

                return (
                  <tr
                    key={c.id || idx}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.id)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                      />
                    </td>

                    <td className="p-3.5 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {c.seviye}. Sınıf
                      </span>
                    </td>

                    <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">
                      {c.name}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                          isOver30
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {c.ogrenciSayisi || 0} Öğrenci
                      </span>
                    </td>

                    <td className="p-3.5">
                      {isScheduled ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <span>✓ Takvimde Planlandı</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <span>Henüz Planlanmadı</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-xs text-slate-500">
                      {isOver30 ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>30'u aşıyor (İlave gözcü veya salon gerekebilir)</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Standart (2 Alan Öğretmeni Komisyonu)
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => triggerSingleDelete(c)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Dersi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            Kriterlere uygun ders bulunamadı.
          </div>
        )}
      </div>

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
