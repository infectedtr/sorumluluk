import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/excelParser';
import { getExamObservers } from '../utils/examRoles';
import {
  CalendarDays,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle,
  Users,
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';
import ExamModal from '../components/modals/ExamModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function ScheduleView() {
  const {
    schedule,
    conflicts,
    addExam,
    updateExam,
    deleteExam,
    deleteExams,
    clearAllExams,
    clearCommissionAssignments,
    runAutoAssignment,
    setActiveTab,
    rooms,
    hours
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSeviye, setFilterSeviye] = useState('all');
  const [filterSalon, setFilterSalon] = useState('all');
  const [selectedExam, setSelectedExam] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Unique dates in schedule
  const uniqueDates = Array.from(new Set(schedule.map((ex) => ex.tarih).filter(Boolean))).sort();

  // Filtered schedule
  const filteredSchedule = schedule.filter((item) => {
    if (search) {
      const q = search.toLocaleLowerCase('tr-TR');
      const inDers = (item.ders || '').toLocaleLowerCase('tr-TR').includes(q);
      const inUye1 = (item.uye1 || '').toLocaleLowerCase('tr-TR').includes(q);
      const inUye2 = (item.uye2 || '').toLocaleLowerCase('tr-TR').includes(q);
      const inObserver = getExamObservers(item).some((name) => name.toLocaleLowerCase('tr-TR').includes(q));
      if (!inDers && !inUye1 && !inUye2 && !inObserver) return false;
    }
    if (filterDate && item.tarih !== filterDate) return false;
    if (filterSeviye !== 'all' && Number(item.seviye) !== Number(filterSeviye)) return false;
    if (filterSalon !== 'all' && item.salon !== filterSalon) return false;
    return true;
  });

  // Sort by date, then time
  filteredSchedule.sort((a, b) => {
    const da = `${a.tarih || ''} ${a.saat || ''}`;
    const db = `${b.tarih || ''} ${b.saat || ''}`;
    return da.localeCompare(db);
  });

  const handleExportExcel = () => {
    const exportData = filteredSchedule.map((ex, idx) => ({
      'Sıra': idx + 1,
      'Sınav Tarihi': ex.tarih,
      'Sınav Saati': ex.saat,
      'Seviye': `${ex.seviye}. Sınıf`,
      'Ders Adı': ex.ders,
      'Öğrenci Sayısı': ex.ogrenciSayisi,
      'Sınav Yeri': ex.salon,
      '1. Komisyon Üyesi': ex.uye1,
      '2. Komisyon Üyesi': ex.uye2,
      'Gözcü': getExamObservers(ex)[0] || '',
      'Diğer Gözcüler': getExamObservers(ex).slice(1).join(', '),
      'Açıklama': ex.aciklama
    }));

    exportToExcel(exportData, 'Sorumluluk_Sinav_Programi');
  };

  const handleEdit = (exam) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const handleSave = (examData) => {
    if (selectedExam) {
      updateExam(selectedExam.id, examData);
    } else {
      addExam(examData);
    }
    setIsModalOpen(false);
    setSelectedExam(null);
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
    const filteredStrIds = filteredSchedule.map((e) => String(e.id));
    const allSelected = filteredStrIds.length > 0 && filteredStrIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredStrIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredStrIds])));
    }
  };

  // Single delete trigger
  const triggerSingleDelete = (exam) => {
    setConfirmState({
      isOpen: true,
      title: 'Sınav Oturumunu Sil',
      message: `"${exam.ders}" (${exam.seviye}. Sınıf - ${exam.tarih || ''} ${exam.saat || ''}) sınav oturumunu silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteExam(exam.id);
        setSelectedIds((prev) => prev.filter((i) => i !== String(exam.id)));
      }
    });
  };

  // Bulk delete trigger
  const triggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Seçilen Sınav Oturumlarını Sil',
      message: `Seçtiğiniz ${selectedIds.length} adet sınav oturumu silinecek. Bu işlem geri alınamaz. Onaylıyor musunuz?`,
      confirmText: `${selectedIds.length} Oturumu Sil`,
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteExams(selectedIds);
        setSelectedIds([]);
      }
    });
  };

  // Clear all exams trigger
  const triggerClearAll = () => {
    setConfirmState({
      isOpen: true,
      title: 'Tüm Sınav Takvimini Sıfırla',
      message: 'Sınav takvimindeki TÜM sınav oturumları (toplam ' + schedule.length + ' oturum) silinecektir! Bu işlem geri alınamaz. Emin misiniz?',
      confirmText: 'Evet, Tüm Programı Sıfırla',
      confirmStyle: 'danger',
      onConfirm: () => {
        clearAllExams();
        setSelectedIds([]);
      }
    });
  };

  // Clear assignments trigger
  const triggerClearAssignments = () => {
    setConfirmState({
      isOpen: true,
      title: 'Komisyon Görevlendirmelerini Temizle',
      message: 'Sınav oturumları (tarih, saat, dersler) korunacak, ancak öğretmenlere atanmış olan tüm komisyon görevleri (Üye 1, Üye 2, Üye 3) sıfırlanacaktır. Yeniden otomatik veya manuel dağıtım yapabilirsiniz. Onaylıyor musunuz?',
      confirmText: 'Görevleri Temizle',
      confirmStyle: 'warning',
      onConfirm: () => {
        clearCommissionAssignments();
      }
    });
  };

  // Helper: check if a specific exam has conflict
  const getExamWarnings = (exam) => {
    const warns = [];
    conflicts.teacherConflicts.forEach((tc) => {
      if (tc.exams.some((e) => String(e.id) === String(exam.id))) {
        warns.push(`Öğretmen çakışması: ${tc.teacher}`);
      }
    });
    conflicts.roomConflicts.forEach((rc) => {
      if (rc.exams.some((e) => String(e.id) === String(exam.id))) {
        warns.push(`Salon çakışması: ${rc.salon}`);
      }
    });
    conflicts.warnings.forEach((w) => {
      if (String(w.examId) === String(exam.id)) {
        warns.push(w.message);
      }
    });
    return warns;
  };

  const isAllFilteredSelected =
    filteredSchedule.length > 0 &&
    filteredSchedule.every((e) => selectedIds.includes(String(e.id)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <CalendarDays className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Sınav Programı & Takvim</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toplam {schedule.length} sınav oturumu planlandı.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Auto assign */}
          <button
            onClick={runAutoAssignment}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800/60 transition-all shadow-sm"
            title="Öğretmenlere sınav görevlerini dengeli olarak dağıt"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Otomatik Komisyon Dağıt</span>
          </button>

          {/* Reset Commission assignments */}
          <button
            onClick={triggerClearAssignments}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800/50 transition-all shadow-sm"
            title="Sınav oturumlarını koruyup sadece öğretmen görev atamalarını sıfırlar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Görevleri Temizle</span>
          </button>

          {/* Reset All Schedule */}
          <button
            onClick={triggerClearAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-all shadow-sm"
            title="Tüm sınav takvimini tamamen siler"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Programı Sıfırla</span>
          </button>

          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/60 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel İndir</span>
          </button>

          {/* New Exam */}
          <button
            onClick={() => {
              setSelectedExam(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Oturum</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-rose-900 dark:text-rose-200 text-xs font-bold">
            <CheckSquare className="w-4 h-4 text-rose-600" />
            <span>{selectedIds.length} Sınav Oturumu Seçildi</span>
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
            placeholder="Ders veya Öğretmen ara..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="">Tüm Tarihler ({uniqueDates.length} Gün)</option>
            {uniqueDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <select
            value={filterSeviye}
            onChange={(e) => setFilterSeviye(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Tüm Seviyeler</option>
            <option value="9">9. Sınıf</option>
            <option value="10">10. Sınıf</option>
            <option value="11">11. Sınıf</option>
            <option value="12">12. Sınıf</option>
          </select>
        </div>

        {/* Room Filter */}
        <div>
          <select
            value={filterSalon}
            onChange={(e) => setFilterSalon(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Tüm Sınav Salonları</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
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
                <th className="p-3.5">Tarih & Saat</th>
                <th className="p-3.5">Seviye</th>
                <th className="p-3.5">Ders Adı</th>
                <th className="p-3.5 text-center">Öğr. Sayısı</th>
                <th className="p-3.5">Sınav Salonu</th>
                <th className="p-3.5">1. Komisyon Üyesi</th>
                <th className="p-3.5">2. Komisyon Üyesi</th>
                <th className="p-3.5">Gözcü / Diğer Gözcüler</th>
                <th className="p-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchedule.map((exam, idx) => {
                const warnings = getExamWarnings(exam);
                const hasWarning = warnings.length > 0;
                const isSelected = selectedIds.includes(String(exam.id));

                return (
                  <tr
                    key={exam.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/30'
                        : hasWarning
                        ? 'bg-amber-50/30 dark:bg-amber-950/10'
                        : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(exam.id)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                      />
                    </td>

                    <td className="p-3.5 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Date & Time */}
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {exam.tarih || 'Tarihsiz'}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{exam.saat || '10:00'}</span>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="p-3.5">
                      <span className="inline-block px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exam.seviye}. Sınıf
                      </span>
                    </td>

                    {/* Course */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {exam.ders}
                      </div>
                      {hasWarning && (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center space-x-1 mt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{warnings[0]}</span>
                        </div>
                      )}
                    </td>

                    {/* Student count */}
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          exam.ogrenciSayisi > 30
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {exam.ogrenciSayisi || 0}
                      </span>
                    </td>

                    {/* Room */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{exam.salon || 'Belirtilmedi'}</span>
                      </div>
                    </td>

                    {/* Member 1 */}
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {exam.uye1 ? (
                        <span className="text-slate-900 dark:text-white font-semibold">
                          {exam.uye1}
                        </span>
                      ) : (
                        <span className="text-rose-500 text-[11px] font-medium italic">
                          Atanmadı
                        </span>
                      )}
                    </td>

                    {/* Member 2 */}
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                      {exam.uye2 ? (
                        <span className="text-slate-900 dark:text-white font-semibold">
                          {exam.uye2}
                        </span>
                      ) : (
                        <span className="text-rose-500 text-[11px] font-medium italic">
                          Atanmadı
                        </span>
                      )}
                    </td>

                    {/* Gözcüler */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {getExamObservers(exam).join(', ') || '-'}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerSingleDelete(exam)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Oturumu Sil"
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

        {filteredSchedule.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            Arama veya filtre kriterlerine uyan sınav oturumu bulunamadı.
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <ExamModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExam(null);
        }}
        onSave={handleSave}
        exam={selectedExam}
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
