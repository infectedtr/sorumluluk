import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel, parseTeacherExcel } from '../utils/excelParser';
import {
  Users,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Briefcase,
  CheckSquare,
  Square,
  Upload,
  Loader2
} from 'lucide-react';
import TeacherModal from '../components/modals/TeacherModal';
import ConfirmModal from '../components/modals/ConfirmModal';

export default function TeachersView() {
  const {
    schoolInfo,
    teachers,
    teacherStats,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    deleteTeachers,
    clearAllTeachers,
    bulkAddTeachers
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewDutiesTeacher, setViewDutiesTeacher] = useState(null);
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Import state
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importFileRef = useRef(null);

  // Excel öğretmen dosyasını içeri aktar
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImportLoading(true);
    setImportResult(null);
    try {
      const result = await parseTeacherExcel(file, schoolInfo.okulMuduru);
      if (result.success && result.teachers.length > 0) {
        bulkAddTeachers(result.teachers);
        const passiveCount = result.teachers.filter((teacher) => !teacher.active).length;
        setImportResult({
          type: 'success',
          message: `${result.count} öğretmen içeri aktarıldı; ${passiveCount} yönetici/personel pasif bırakıldı.`
        });
      } else if (result.success && result.teachers.length === 0) {
        setImportResult({ type: 'warn', message: 'Dosyada öğretmen unvanlı personel bulunamadı.' });
      } else {
        setImportResult({ type: 'error', message: result.error || 'Bilinmeyen hata.' });
      }
    } catch (err) {
      setImportResult({ type: 'error', message: 'İçeri aktarma sırasında hata: ' + err.message });
    } finally {
      setImportLoading(false);
      setTimeout(() => setImportResult(null), 5000);
    }
  };

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Sil',
    confirmStyle: 'danger'
  });

  // Extract unique branches
  const uniqueBranches = Array.from(
    new Set(teachers.map((t) => (t.branch || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'tr-TR'));

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    if (search) {
      const q = search.trim().toLocaleLowerCase('tr-TR');
      const inName = (t.name || '').toLocaleLowerCase('tr-TR').includes(q);
      const inBranch = (t.branch || '').toLocaleLowerCase('tr-TR').includes(q);
      if (!inName && !inBranch) return false;
    }
    if (filterBranch !== 'all') {
      const teacherBranch = (t.branch || '').trim().toLocaleLowerCase('tr-TR');
      const targetBranch = filterBranch.trim().toLocaleLowerCase('tr-TR');
      if (teacherBranch !== targetBranch) return false;
    }
    return true;
  });

  // Sort alphabetically
  filteredTeachers.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));

  const handleExportExcel = () => {
    const exportData = filteredTeachers.map((t, idx) => {
      const stat = teacherStats.find((s) => String(s.id) === String(t.id));
      return {
        'Sıra': idx + 1,
        'Adı Soyadı': t.name,
        'Branşı': t.branch,
        'Durum': t.active ? 'Aktif' : 'Pasif',
        'Toplam Görev Sayısı': stat ? stat.count : 0
      };
    });
    exportToExcel(exportData, 'Ogretmen_Listesi');
  };

  const handleSaveTeacher = (data) => {
    if (selectedTeacher) {
      updateTeacher(selectedTeacher.id, data);
    } else {
      addTeacher(data);
    }
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.trim().split(/\r?\n/);
    const newTeachers = [];

    lines.forEach((line) => {
      const parts = line.split(/[\t,;]/).map((p) => p.trim());
      if (parts[0]) {
        let name = parts[0];
        let branch = parts[1] || 'Genel';
        name = name.replace(/^\d+[\.\-\s]+/, '');

        if (name) {
          newTeachers.push({
            id: `t_${Date.now()}_${newTeachers.length}_${Math.random().toString(36).slice(2, 9)}`,
            name: name.toLocaleUpperCase('tr-TR'),
            branch: branch.trim(),
            active: true,
            notes: ''
          });
        }
      }
    });

    if (newTeachers.length > 0) {
      bulkAddTeachers(newTeachers);
      setBulkText('');
      setShowBulkPaste(false);
    }
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
    const filteredStrIds = filteredTeachers.map((t) => String(t.id));
    const allSelected = filteredStrIds.length > 0 && filteredStrIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredStrIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredStrIds])));
    }
  };

  // Trigger single delete
  const triggerSingleDelete = (teacher) => {
    setConfirmState({
      isOpen: true,
      title: 'Öğretmeni Sil',
      message: `"${teacher.name}" adlı öğretmeni komisyon havuzundan silmek istediğinize emin misiniz?`,
      confirmText: 'Evet, Sil',
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteTeacher(teacher.id);
        setSelectedIds((prev) => prev.filter((i) => i !== String(teacher.id)));
      }
    });
  };

  // Trigger bulk delete
  const triggerBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmState({
      isOpen: true,
      title: 'Seçilen Öğretmenleri Sil',
      message: `Seçtiğiniz ${selectedIds.length} öğretmen sistemden silinecektir. Onaylıyor musunuz?`,
      confirmText: `${selectedIds.length} Öğretmeni Sil`,
      confirmStyle: 'danger',
      onConfirm: () => {
        deleteTeachers(selectedIds);
        setSelectedIds([]);
      }
    });
  };

  // Trigger clear all teachers
  const triggerClearAll = () => {
    setConfirmState({
      isOpen: true,
      title: 'Tüm Öğretmenleri Sil',
      message: `Kayıtlı TÜM öğretmenler (toplam ${teachers.length} kişi) silinecektir! Bu işlem geri alınamaz. Onaylıyor musunuz?`,
      confirmText: 'Evet, Tüm Öğretmenleri Temizle',
      confirmStyle: 'danger',
      onConfirm: () => {
        clearAllTeachers();
        setSelectedIds([]);
      }
    });
  };

  const activeCount = teachers.filter((t) => t.active).length;
  const isAllFilteredSelected =
    filteredTeachers.length > 0 &&
    filteredTeachers.every((t) => selectedIds.includes(String(t.id)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            <span>Öğretmenler & Komisyon Havuzu</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Toplam {teachers.length} öğretmen ({activeCount} aktif) kayıtlıdır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Excel'den İçeri Aktar */}
          <input
            ref={importFileRef}
            type="file"
            accept=".xls,.xlsx,.xlsm"
            className="hidden"
            onChange={handleImportExcel}
          />
          <button
            onClick={() => importFileRef.current?.click()}
            disabled={importLoading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-900/50 transition-all shadow-sm disabled:opacity-60"
            title="Personel listesi Excel dosyasından öğretmenleri içeri aktar (G=Ad, L=Ünvan, N=Branş)"
          >
            {importLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Upload className="w-4 h-4" />}
            <span>{importLoading ? 'Aktarılıyor...' : 'Excel\'den Aktar'}</span>
          </button>

          <button
            onClick={() => setShowBulkPaste(!showBulkPaste)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Briefcase className="w-4 h-4" />
            <span>Toplu Öğretmen Yapıştır</span>
          </button>

          <button
            onClick={triggerClearAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-all shadow-sm"
            title="Tüm öğretmen listesini temizler"
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
            onClick={() => {
              setSelectedTeacher(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Öğretmen Ekle</span>
          </button>
        </div>
      </div>

      {/* İçeri Aktarma Sonuç Bildirimi */}
      {importResult && (
        <div className={`p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in duration-200 ${
          importResult.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : importResult.type === 'warn'
            ? 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          {importResult.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          <span>{importResult.message}</span>
        </div>
      )}

      {/* Bulk Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-rose-900 dark:text-rose-200 text-xs font-bold">
            <CheckSquare className="w-4 h-4 text-rose-600" />
            <span>{selectedIds.length} Öğretmen Seçildi</span>
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

      {/* Bulk Paste Box */}
      {showBulkPaste && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Toplu Öğretmen Listesi Yapıştır (Her satıra: Ad Soyad [Tab veya Virgül] Branş)
            </span>
            <button
              onClick={() => setShowBulkPaste(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Kapat
            </button>
          </div>
          <textarea
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Örnek:&#10;MEHMET DEMİR	Matematik&#10;AYŞE KAYA	Türk Dili ve Edebiyatı&#10;FATMA ŞAHİN	Bilişim Teknolojileri"
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleBulkAdd}
              className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
            >
              Öğretmenleri Sisteme Aktar
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
            placeholder="Öğretmen adı veya branş ara..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">Tüm Branşlar ({uniqueBranches.length} Branş)</option>
            {uniqueBranches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teachers Table */}
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
                <th className="p-3.5">Öğretmen Adı Soyadı</th>
                <th className="p-3.5">Branşı</th>
                <th className="p-3.5 text-center">Durum</th>
                <th className="p-3.5 text-center">Komisyon Görev Sayısı</th>
                <th className="p-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.map((teacher, idx) => {
                const stat = teacherStats.find((s) => String(s.id) === String(teacher.id));
                const dutyCount = stat ? stat.count : 0;
                const isSelected = selectedIds.includes(String(teacher.id));

                return (
                  <tr
                    key={`teacher_${teacher.id || idx}_${teacher.name}`}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-rose-50/70 dark:bg-rose-950/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(teacher.id)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                      />
                    </td>

                    <td className="p-3.5 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {teacher.name}
                      </div>
                      {teacher.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {teacher.notes}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {teacher.branch || 'Genel'}
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      {teacher.active ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800">
                          <XCircle className="w-3 h-3" />
                          <span>Pasif / İzinli</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setViewDutiesTeacher(stat || { name: teacher.name, assignments: [] })}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full font-bold text-xs transition-all ${
                          dutyCount > 0
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                        title="Öğretmenin sınav görevlerini incele"
                      >
                        <span>{dutyCount} Görev</span>
                        <Eye className="w-3 h-3" />
                      </button>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => triggerSingleDelete(teacher)}
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

        {filteredTeachers.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            Arama kriterine uygun öğretmen bulunamadı.
          </div>
        )}
      </div>

      {/* Duty Detail Modal */}
      {viewDutiesTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {viewDutiesTeacher.name} - Sınav Görevleri
                </h3>
              </div>
              <button
                onClick={() => setViewDutiesTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {viewDutiesTeacher.assignments && viewDutiesTeacher.assignments.length > 0 ? (
                viewDutiesTeacher.assignments.map((asg, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{asg.ders} ({asg.seviye}. Sınıf)</span>
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {asg.role}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 flex items-center space-x-3">
                      <span>📅 {asg.tarih}</span>
                      <span>⏰ {asg.saat}</span>
                      <span>📍 {asg.salon}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Bu öğretmene henüz bir sınav komisyon görevi atanmamıştır.
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewDutiesTeacher(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Add/Edit Modal */}
      <TeacherModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTeacher(null);
        }}
        onSave={handleSaveTeacher}
        teacher={selectedTeacher}
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
